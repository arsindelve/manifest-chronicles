// Run the game without a browser: a PC with the real font and data files,
// delays switched off, and helpers to type keys and read the screen.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DATA_FILES } from "../src/datafiles";
import { CP437, decodeCP437 } from "../src/dos/cp437";
import { Disk } from "../src/dos/disk";
import { PC } from "../src/dos/pc";

const ROOT = resolve(__dirname, "../../original");

export function makePC(extraFiles: Record<string, string> = {}) {
  const font = new Uint8Array(readFileSync(resolve(__dirname, "../public/vga8x16.bin")));
  const texts: Record<string, string> = {};
  for (const name of DATA_FILES) texts[name] = decodeCP437(new Uint8Array(readFileSync(resolve(ROOT, name))));
  const pc = new PC(font, new Disk({ ...texts, ...extraFiles }));
  pc.clock.timeScale = 0;
  return pc;
}

/** The text screen as 25 strings of 80 characters. */
export function screenLines(pc: PC): string[] {
  const t = pc.video.text;
  return Array.from({ length: 25 }, (_, r) => Array.from({ length: 80 }, (_, c) => CP437[t[r * 80 + c] & 0xff]).join(""));
}

/** [character byte, attribute] for every cell. */
export function screenCells(pc: PC): Array<Array<[number, number]>> {
  const t = pc.video.text;
  return Array.from({ length: 25 }, (_, r) => Array.from({ length: 80 }, (_, c) => [t[r * 80 + c] & 0xff, t[r * 80 + c] >> 8] as [number, number]));
}

export const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));

export async function type(pc: PC, keys: string) {
  for (const k of keys) {
    pc.keyboard.push(k);
    await tick(5);
  }
}

/** Wait until the screen stops changing. */
export async function settle(pc: PC, quietMs = 150, maxMs = 20000) {
  let last = "";
  let since = Date.now();
  const start = Date.now();
  for (;;) {
    await tick(15);
    const now = pc.video.mode === 0 ? screenLines(pc).join("\n") : String(hashPixels(pc));
    if (now !== last) {
      last = now;
      since = Date.now();
    } else if (Date.now() - since >= quietMs) return;
    if (Date.now() - start > maxMs) throw new Error("screen never settled");
  }
}

function hashPixels(pc: PC) {
  let h = 0;
  const p = pc.video.pixels;
  for (let i = 0; i < p.length; i += 7) h = (h * 31 + p[i]) | 0;
  return h;
}
