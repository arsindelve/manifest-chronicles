// Boot the PC, load the game's files, and run it in the page.

import "./style.css";
import { DATA_FILES } from "./datafiles";
import { decodeCP437 } from "./dos/cp437";
import { Disk } from "./dos/disk";
import { ProgramEnded, ProgramStopped, QBError } from "./dos/errors";
import { PC } from "./dos/pc";
import { pressAnyKey, showErrorScreen } from "./ide";
import { runManifest } from "./game/game";

/** An element index.html is known to have. */
function element<T extends Element>(selector: string, type: new () => T): T {
  const e = document.querySelector(selector);
  if (!(e instanceof type)) throw new Error(`index.html has no ${selector}`);
  return e;
}

const canvas = element("#screen", HTMLCanvasElement);
const startHint = element("#start", HTMLElement);
const ctx =
  canvas.getContext("2d", { alpha: false }) ??
  (() => {
    throw new Error("this browser has no 2D canvas");
  })();

async function fetchBytes(path: string) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}

async function boot() {
  const [font, ...files] = await Promise.all([
    fetchBytes("vga8x16.bin"),
    ...DATA_FILES.map((name) => fetchBytes(`data/${encodeURIComponent(name)}`)),
  ]);
  const texts: Record<string, string> = {};
  DATA_FILES.forEach((name, i) => (texts[name] = decodeCP437(files[i])));
  const source = texts["M.BAS"];

  const pc = new PC(font, new Disk(texts));
  // Dev builds expose the machine for automated comparison against DOSBox.
  if (import.meta.env.DEV) Object.assign(window, { __pc: pc });
  startRenderer(pc);
  attachKeyboard(pc);

  await waitForStart(pc);
  for (;;) {
    pc.reset();
    try {
      await runManifest(pc);
      await pressAnyKey(pc);
    } catch (e) {
      if (e instanceof ProgramEnded) await pressAnyKey(pc);
      else if (e instanceof QBError) await showErrorScreen(pc, e, source);
      else if (e instanceof ProgramStopped) continue;
      else throw e;
    }
  }
}

function startRenderer(pc: PC) {
  let image: ImageData | null = null;
  let lastBlink = false;
  const frame = (t: number) => {
    const v = pc.video;
    // The VGA text cursor blinks every 16 frames of 70 Hz.
    const blink = Math.floor((t / ((16 / 70) * 1000)) * 2) % 2 === 0;
    if (canvas.width !== v.width || canvas.height !== v.height) {
      canvas.width = v.width;
      canvas.height = v.height;
      image = null;
      v.dirty = true;
    }
    if (v.dirty || (v.cursorVisible && blink !== lastBlink)) {
      image ??= ctx.createImageData(v.width, v.height);
      v.render(image, blink);
      ctx.putImageData(image, 0, 0);
      v.dirty = false;
      lastBlink = blink;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Browser keys to the characters a DOS program reads. */
function dosKey(e: KeyboardEvent): string | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  switch (e.key) {
    case "Enter":
      return "\r";
    case "Backspace":
      return "\b";
    case "Escape":
      return "\x1b";
    case "Tab":
      return "\t";
    // The game wants the numeric keypad with Num Lock on; arrow keys stand in
    // for it on keyboards that don't have one.
    case "ArrowUp":
      return "8";
    case "ArrowDown":
      return "2";
    case "ArrowLeft":
      return "4";
    case "ArrowRight":
      return "6";
  }
  return e.key.length === 1 && e.key >= " " && e.key <= "~" ? e.key : null;
}

function attachKeyboard(pc: PC) {
  window.addEventListener("keydown", (e) => {
    // Printable keys typed into the phone keyboard field arrive through beforeinput instead.
    if (e.target === document.querySelector("#typing") && e.key.length === 1) return;
    const k = dosKey(e);
    if (k === null) return;
    e.preventDefault();
    pc.speaker.unlock();
    pc.keyboard.push(k);
  });
  // On phones, the Keyboard button focuses a hidden text field to bring up the
  // system keyboard; whatever is typed into it goes to the game.
  const typing = element("#typing", HTMLInputElement);
  document.querySelector("#type")?.addEventListener("click", () => {
    typing.focus();
  });
  typing.addEventListener("beforeinput", (e) => {
    e.preventDefault();
    pc.speaker.unlock();
    if (e.inputType === "deleteContentBackward") pc.keyboard.push("\b");
    else if (e.inputType === "insertLineBreak") pc.keyboard.push("\r");
    else for (const ch of e.data ?? "") if (ch >= " " && ch <= "~") pc.keyboard.push(ch);
  });
  // On-screen keypad for touch screens.
  document.querySelectorAll<HTMLButtonElement>("[data-key]").forEach((b) => {
    b.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      pc.speaker.unlock();
      pc.keyboard.push(b.dataset.key === "enter" ? "\r" : (b.dataset.key ?? ""));
    });
  });
}

function waitForStart(pc: PC) {
  return new Promise<void>((resolve) => {
    const go = () => {
      window.removeEventListener("keydown", go);
      canvas.removeEventListener("pointerdown", go);
      startHint.hidden = true;
      pc.speaker.unlock();
      pc.keyboard.clear();
      resolve();
    };
    window.addEventListener("keydown", go);
    canvas.addEventListener("pointerdown", go);
  });
}

boot().catch((e: unknown) => {
  startHint.textContent = `Couldn't start: ${e instanceof Error ? e.message : String(e)}`;
  startHint.hidden = false;
});
