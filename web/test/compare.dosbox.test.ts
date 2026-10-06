// Play the original (QuickBASIC 4.0 running M.BAS in DOSBox Staging) and the
// TypeScript version side by side with the same keys, and compare screens:
// text screens cell for cell (character and colour, read from DOSBox's video
// memory), graphics screens pixel for pixel, and the random number streams
// after every step (QuickBASIC's RND seed, read from DOSBox's memory).
//
// See test/README.md for the setup. Run with:
//   npx vitest run --config vitest.dosbox.config.ts

import { execFileSync, spawn } from "node:child_process";
import { appendFileSync, copyFileSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect, it } from "vitest";
import { decodeCP437 } from "../src/dos/cp437";
import { ProgramEnded, QBError } from "../src/dos/errors";
import type { PC } from "../src/dos/pc";
import { PALETTE } from "../src/dos/video";
import { loadGameData } from "../src/game/data";
import { endgame } from "../src/game/endgame";
import { runManifest } from "../src/game/game";
import { Game } from "../src/game/state";
import { pressAnyKey, showErrorScreen } from "../src/ide";
import { makePC, screenCells, settle, tick, type } from "./headless";

const API = "http://127.0.0.1:8086/api/v1";
/** DOSBox Staging's executable. */
const EXE = process.env.DOSBOX_EXE!;
/** A DOSBox config that enables the REST API and runs QB.EXE /RUN M.BAS from C:\GAME. */
const CONF = process.env.DOSBOX_CONF!;
/** The folder mounted as C:\GAME (M.BAS and its data files). */
const GAME_DIR = process.env.GAME_DIR!;
/** Optional: a script that captures the DOSBox window and diffs it with our frame (see README). */
const GRAB = process.env.GRAB_SCRIPT;

type Cells = Array<Array<[number, number]>>;

// ------------------------------------------------------------------ DOSBox control

/** DOSBox's web server occasionally drops a connection; try again. */
async function api(path: string, init?: RequestInit) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(`${API}${path}`, init);
      return new Uint8Array(await r.arrayBuffer());
    } catch (e) {
      if (attempt >= 5) throw e;
      await tick(300 * attempt);
    }
  }
}

function mem(addr: number, n: number) {
  return api(`/memory/0x${addr.toString(16)}/${n}`);
}

async function poke(addr: number, bytes: number[]) {
  await api(`/memory/0x${addr.toString(16)}`, {
    method: "PUT",
    body: new Uint8Array(bytes),
    headers: { "Content-Type": "application/octet-stream" },
  });
}

const SCAN: Record<string, number> = { "\r": 0x1c, "\b": 0x0e, " ": 0x39 };
"1234567890".split("").forEach((c, i) => (SCAN[c] = 2 + i));
["qwertyuiop", "asdfghjkl", "zxcvbnm"].forEach((row, r) => row.split("").forEach((c, i) => (SCAN[c] = [0x10, 0x1e, 0x2c][r] + i)));

/** Type into the original through the BIOS keyboard buffer. */
async function refType(keys: string) {
  for (const k of keys) {
    for (;;) {
      const b = await mem(0x41a, 4);
      const head = b[0] | (b[1] << 8), tail = b[2] | (b[3] << 8);
      const next = tail + 2 >= 0x3e ? 0x1e : tail + 2;
      if (next === head) {
        await tick(20);
        continue;
      }
      const word = ((SCAN[k.toLowerCase()] ?? 0) << 8) | k.charCodeAt(0);
      await poke(0x400 + tail, [word & 0xff, word >> 8]);
      await poke(0x41c, [next & 0xff, next >> 8]);
      break;
    }
    await tick(60);
  }
}

/** The original's text cursor (row, column), from the BIOS data area. */
async function refCursor(): Promise<[number, number]> {
  const b = await mem(0x450, 2);
  return [b[1] + 1, b[0] + 1];
}

async function refMode() {
  return (await mem(0x449, 1))[0];
}

async function refCells(): Promise<Cells> {
  const b = await mem(0xb8000, 4000);
  return Array.from({ length: 25 }, (_, r) =>
    Array.from({ length: 80 }, (_, c) => [b[(r * 80 + c) * 2], b[(r * 80 + c) * 2 + 1]] as [number, number]));
}

/** Wait until the original's screen and video mode stay still for `quiet` ms. */
async function refSettle(quiet = 1500, max = 90000) {
  let last = "";
  let since = Date.now();
  const start = Date.now();
  for (;;) {
    await tick(150);
    const now = (await refMode()) + JSON.stringify(await refCells());
    if (now !== last) {
      last = now;
      since = Date.now();
    } else if (Date.now() - since > quiet) return;
    if (Date.now() - start > max) throw new Error("reference never settled");
  }
}

/** Wait until the original's text screen shows something. */
async function refWaitFor(pattern: RegExp, max = 120000) {
  const start = Date.now();
  while (!pattern.test(text(await refCells()))) {
    if (Date.now() - start > max) throw new Error(`reference never showed ${pattern}`);
    await tick(250);
  }
}

/** Put the reference's folder back to a fresh install: no saves, an empty score table. */
function freshInstall() {
  for (const f of readdirSync(GAME_DIR)) if (/\.(SAV|TMP)$/i.test(f)) rmSync(join(GAME_DIR, f));
  copyFileSync(resolve(__dirname, "../../original/HIGH.DAT"), join(GAME_DIR, "HIGH.DAT"));
}

async function startDosbox(save?: string) {
  freshInstall();
  if (save) writeFileSync(join(GAME_DIR, "BELDAN.SAV"), save, "latin1");
  const proc = spawn(EXE, ["--noprimaryconf", "--nolocalconf", "--conf", CONF], { stdio: "ignore" });
  process.env.DOSBOX_PID = String(proc.pid); // so the capture script grabs this DOSBox's window
  for (let i = 0; ; i++) {
    try {
      await fetch(`${API}/dosbox/info`);
      return proc;
    } catch {
      if (i > 60) throw new Error("DOSBox API not reachable");
      await tick(500);
    }
  }
}

/** Our PC, set up to match the reference's DOS environment. */
function matchingPC(files: Record<string, string> = {}) {
  const pc = makePC(files);
  pc.currentDir = "C:\\GAME";
  pc.bytesFree = 262144000;
  return pc;
}

/** Run a program on our PC and, when it stops, show what the page shows. */
function runOurs(pc: PC, program: (pc: PC) => Promise<unknown>) {
  const source = decodeCP437(new Uint8Array(readFileSync(resolve(__dirname, "../../original/M.BAS"))));
  void program(pc).catch((e) => {
    if (e instanceof ProgramEnded) return pressAnyKey(pc);
    if (e instanceof QBError) return showErrorScreen(pc, e, source);
    log(`--- TypeScript game stopped: ${e instanceof Error ? e.stack : e}`);
  });
}

// ------------------------------------------------------------------ comparing

/** Progress goes to stderr, and to LOG_FILE if set (vitest hides output from passing tests). */
const log = (s: string) => {
  console.error(s);
  if (process.env.LOG_FILE) appendFileSync(process.env.LOG_FILE, `${s}\n`);
};

function text(c: Cells) {
  return c.map((row) => row.map(([ch]) => String.fromCharCode(ch < 32 ? 32 : ch)).join("").trimEnd()).join("\n");
}

function diff(name: string, ref: Cells, ours: Cells) {
  const bad: string[] = [];
  // A blank looks the same whatever colour it was printed in.
  const blank = (x: [number, number]) => (x[0] === 32 || x[0] === 0) && (x[1] & 0xf0) === 0;
  for (let r = 0; r < 25; r++)
    for (let c = 0; c < 80; c++) {
      const [a, b] = [ref[r][c], ours[r][c]];
      if (blank(a) && blank(b)) continue;
      if (a[0] !== b[0] || a[1] !== b[1]) bad.push(`(${r + 1},${c + 1}) ref ${a[0].toString(16)}/${a[1].toString(16)} ours ${b[0].toString(16)}/${b[1].toString(16)}`);
    }
  if (bad.length) log(`--- ${name}: ${bad.length} cells differ\n${bad.slice(0, 12).join("\n")}\nREF:\n${text(ref)}\nOURS:\n${text(ours)}`);
  else log(`--- ${name}: identical | ${text(ref).split("\n").map((l) => l.trim()).filter(Boolean).join(" / ").slice(0, 160)}`);
  return bad.length;
}

function comparePixels(name: string, pc: ReturnType<typeof makePC>) {
  const raw = new Uint8Array(640 * 480 * 3);
  pc.video.pixels.forEach((p, i) => raw.set(PALETTE[p], i * 3));
  const label = name.replace(/\W+/g, "_");
  const file = join(tmpdir(), `manifest-${label}.rgb`);
  writeFileSync(file, raw);
  const out = execFileSync("python", [GRAB!, file, label], { encoding: "utf8" }).trim();
  const bad = parseInt(out, 10);
  log(`--- ${name}: ${bad ? `${out} pixels differ` : "pixel-identical"}`);
  return bad;
}

// ------------------------------------------------------------------ random seed

/** Where QuickBASIC 4.0 keeps RND's seed when running M.BAS (found by locateSeed below). */
const SEED_ADDR = Number(process.env.SEED_ADDR ?? 0x376e5);

async function refSeed() {
  const b = await mem(SEED_ADDR, 3);
  return b[0] | (b[1] << 8) | (b[2] << 16);
}

/** How many draws it takes to get from seed a to seed b (if it's under 1000). */
function drawsBetween(a: number, b: number): number | undefined {
  for (let i = 1, s = a; i < 1000; i++) {
    s = (s * 16598013 + 12820163) % 16777216;
    if (s === b) return i;
  }
  return undefined;
}

const advance = (s: number, n: number) => {
  for (let i = 0; i < n; i++) s = (s * 16598013 + 12820163) % 16777216;
  return s;
};

/** Every RND state that could have produced these character stats (race 1, North Garkonen). */
function seedsFor([ap, hp, intel, cap, chp, cint]: number[]): number[] {
  const below = (s: number, n: number) => Math.floor((s / 16777216) * n);
  const out: number[] = [];
  for (let s0 = 0; s0 < 16777216; s0++) {
    let s = advance(s0, 2); // the unused roll, then attack
    if (Math.min(99, below(s, 60) + 30) !== ap) continue;
    s = advance(s, 1);
    if (Math.min(99, below(s, 90) + 70) !== hp) continue;
    s = advance(s, 1);
    if (below(s, 42) + 1 !== intel) continue;
    s = advance(s, 1);
    if (Math.min(99, below(s, 60) + 30) !== cap) continue;
    s = advance(s, 1);
    if (Math.min(99, below(s, 90) + 50) !== chp) continue;
    s = advance(s, 1);
    if (below(s, 42) + 1 !== cint) continue;
    out.push(s0);
  }
  return out;
}

/** Find where QuickBASIC keeps its RND seed: the one candidate state that appears in memory. */
async function locateSeed(candidates: number[]) {
  const ram = await mem(0, 0xa0000);
  for (const s0 of candidates) {
    const s7 = advance(s0, 7);
    for (let i = 0; i + 2 < ram.length; i++) {
      if (ram[i] === (s7 & 0xff) && ram[i + 1] === ((s7 >> 8) & 0xff) && ram[i + 2] === s7 >> 16) return { s0, addr: i };
    }
  }
  throw new Error("RND seed not found in memory");
}

// ------------------------------------------------------------------ scenarios

it("matches the original screen for screen", async () => {
  const dosbox = await startDosbox();
  try {
    const pc = matchingPC();
    runOurs(pc, runManifest);
    let failures = 0;
    let seedAddr = -1;

    const checkRandom = async (name: string) => {
      if (seedAddr < 0) return;
      // Retry readings that aren't on the random stream at all (caught mid-update);
      // a real difference shows up as the streams being a few draws apart.
      for (let attempt = 0; attempt < 4; attempt++) {
        const b = await mem(seedAddr, 3);
        const ref = b[0] | (b[1] << 8) | (b[2] << 16);
        if (ref === pc.rng.seed) return;
        const apart = drawsBetween(pc.rng.seed, ref) ?? drawsBetween(ref, pc.rng.seed);
        if (apart !== undefined && attempt > 0) {
          log(`--- ${name}: RND streams differ by ${apart} draws (ref ${ref}, ours ${pc.rng.seed}); resyncing`);
          pc.rng.seed = ref;
          failures++;
          return;
        }
        await tick(1000);
      }
      log(`--- ${name}: couldn't get a clean RND seed reading from the original; skipped`);
    };

    const step = async (name: string, keys: string, quiet?: number) => {
      if (keys) {
        await refType(keys);
        await type(pc, keys);
      }
      await refSettle(quiet);
      await settle(pc);
      const kb = await mem(0x41a, 4);
      if (kb[0] !== kb[2]) log(`--- ${name}: the original hasn't read all its keys`);
      await checkRandom(name);
      const mode = await refMode();
      if (mode === 3 && pc.video.mode === 0) failures += diff(name, await refCells(), screenCells(pc)) ? 1 : 0;
      else if (GRAB && mode === 0x12 && pc.video.mode === 12) failures += comparePixels(name, pc) ? 1 : 0;
      else if ((mode === 3) !== (pc.video.mode === 0)) {
        log(`--- ${name}: video modes differ (ref ${mode.toString(16)}h, ours ${pc.video.mode})`);
        failures++;
      }
    };

    await refWaitFor(/Version 2\.01 1994/); // QuickBASIC takes a while to load M.BAS
    await step("title", "", 3000);
    await refWaitFor(/Version 2\.01 1994/); // QuickBASIC takes a while to load M.BAS
    await step("restore or start", " ");
    await step("name", "s\r");
    await step("race menu", "Hawke\rLorac\r");
    await step("class menu", "1\r");

    // Roll the stats in the original, find its RND seed in memory, roll ours from the same seed.
    await refType("2\r");
    await refSettle();
    const lines = text(await refCells()).split("\n");
    const num = (row: number, col: number) => parseInt(lines[row - 1].slice(col - 1 + 15).trim(), 10);
    const { s0, addr } = await locateSeed(seedsFor([num(11, 21), num(12, 21), num(13, 21), num(11, 42), num(12, 42), num(13, 42)]));
    seedAddr = addr;
    pc.rng.seed = s0;
    await type(pc, "2\r");
    await settle(pc);
    failures += diff("stats", await refCells(), screenCells(pc)) ? 1 : 0;

    await step("instructions", "y\r");
    await step("story", " ", 4000);
    await step("maze", " ", 4000);

    // Walk a route; in battle attack, take any loot, go down stairs, and press Space through
    // everything else. Keys are chosen from the original's screen so both games get the same.
    const route = "8888666888848888222288886888";
    const respond = (screen: string) => (/\(A\)ttack/.test(screen) ? "a" : /\(y\/n\)/.test(screen) ? "y" : " ");
    for (let i = 0; i < Number(process.env.TURNS ?? 60); i++) {
      const k = (await refMode()) === 3 ? respond(text(await refCells())) : route[i % route.length];
      await step(`turn ${i + 1} (${k === " " ? "space" : k})`, k, 2500);
    }

    // Get back to the maze, then go through the menus and dialogs.
    for (let i = 0; i < 40 && (await refMode()) === 3; i++) await step(`finish ${i + 1}`, respond(text(await refCells())), 2500);
    const tour: Array<[string, string]> = [
      ["commands menu", "c"],
      ["hints menu", "h"],
      ["hint: background", "b"],
      ["hint: background, part 2", " "],
      ["hint: background, part 3", " "],
      ["hint: background, end", " "],
      ["field spells", "m"],
      ["field spells: caster", "y"],
      ["eagle eye menu", "3\r"],
      ["eagle eye 5x5", "1\r"],
      ["back to maze", " "],
      ["field spells again", "m"],
      ["caster again", "y"],
      ["location menu", "2\r"],
      ["quadrant", "1\r"],
      ["back to maze 2", " "],
      ["potion menu", "d"],
      ["no potion chosen", "\r"],
      ["back to maze 3", " "],
      ["save prompt", "s"],
      ["saved", "MYSAVE\r"],
      ["restore listing", "r"],
      ["restored", "MYSAVE\r"],
      ["after restore", "8"],
      ["quit prompt", "q"],
      ["high scores", "y"],
      ["program ended", " "],
    ];
    for (const [name, keys] of tour) await step(name, keys, 2500);

    expect(failures).toBe(0);
  } finally {
    if (!process.env.KEEP_DOSBOX) dosbox.kill();
  }
}, 1800000);

it("shows the same QuickBASIC error screen", async () => {
  const dosbox = await startDosbox();
  try {
    const pc = matchingPC();
    const source = decodeCP437(new Uint8Array(readFileSync(resolve(__dirname, "../../original/M.BAS"))));
    let shown: Promise<void> | undefined;
    void runManifest(pc).catch((e) => {
      if (e instanceof QBError) shown = showErrorScreen(pc, e, source);
    });
    await refWaitFor(/Version 2\.01 1994/); // QuickBASIC takes a while to load M.BAS
    // Restore a game when there are no saves: FILES "*.SAV" fails with "File not found".
    for (const keys of [" ", "r\r"]) {
      await refType(keys);
      await type(pc, keys);
      await refSettle(2500);
      await settle(pc);
    }
    expect(shown).toBeDefined();
    expect(diff("error screen", await refCells(), screenCells(pc))).toBe(0);
  } finally {
    dosbox.kill();
  }
}, 300000);

it("walks level 4 to the exit the same way", async () => {
  // A save one step south of level 4's exit, facing north, with the best gear.
  // In the original, stepping onto the exit then stops with "Type mismatch":
  // CHAIN passes COMMON variables by position, and M.BAS's list no longer
  // matched ENDGAME.BAS's. Ours goes on to the final battle instead (see the
  // ENDGAME.BAS scenario below), so the comparison ends there.
  const fields = [
    100, 75, 70, 23, 0, 26, 17, 25, 110, "", 999, 9, 4, 0, 0, "Hawke", "", "Lorac", 400, 9999, 50, 40000,
    9999, 37, 21, "A Fighter", 999, 50, 300, 9999, 9999, 1, 1, 1, 1, 1, 1, 1,
  ];
  const save = fields.map((v) => (typeof v === "number" ? ` ${v} ` : v)).join("\r\n") + "\r\n";
  const dosbox = await startDosbox(save);
  try {
    const pc = matchingPC({ "BELDAN.SAV": save });
    runOurs(pc, runManifest);
    let failures = 0;
    let synced = false;
    const step = async (name: string, keys: string) => {
      await refType(keys);
      await type(pc, keys);
      await refSettle(2500);
      await settle(pc);
      if (synced) {
        const ref = await refSeed();
        if (ref !== pc.rng.seed) {
          log(`--- ${name}: RND streams differ (ref ${ref}, ours ${pc.rng.seed}); resyncing`);
          pc.rng.seed = ref;
          failures++;
        }
      }
      const mode = await refMode();
      if (/Type mismatch/.test(text(await refCells()))) log(`--- ${name}: the original stops with Type mismatch here`);
      else if (mode === 3 && pc.video.mode === 0) failures += diff(name, await refCells(), screenCells(pc)) ? 1 : 0;
      else if (GRAB && mode === 0x12 && pc.video.mode === 12) failures += comparePixels(name, pc) ? 1 : 0;
      else if ((mode === 3) !== (pc.video.mode === 0)) {
        log(`--- ${name}: video modes differ (ref ${mode.toString(16)}h, ours ${pc.video.mode})`);
        failures++;
      }
    };

    await refWaitFor(/Version 2\.01 1994/); // QuickBASIC takes a while to load M.BAS
    await step("restore or start", " ");
    await step("restore listing", "r\r");
    // Line up the random numbers with the original's while both wait for the file name.
    pc.rng.seed = await refSeed();
    synced = true;
    await step("restored", "BELDAN\r");
    // Walk north (the first move after a restore goes nowhere - see Game.step), fighting as needed.
    for (let i = 0; i < Number(process.env.TURNS ?? 80); i++) {
      const screen = text(await refCells());
      if (/Type mismatch/.test(screen)) break;
      const k = /\(A\)ttack/.test(screen) ? "a" : (await refMode()) === 3 ? " " : "8";
      await step(`level 4, step ${i + 1} (${k === " " ? "space" : k})`, k);
    }
    expect(text(await refCells())).toContain("Type mismatch");
    expect(failures).toBe(0);
  } finally {
    if (!process.env.KEEP_DOSBOX) dosbox.kill();
  }
}, 1800000);

it("plays ENDGAME.BAS the same way", async () => {
  // Run the final battle on its own, handing it a party through CHECK.TMP the
  // way M.BAS does. A fresh QuickBASIC run starts RND at seed 5, as ours does.
  const party = {
    level: 9, heroDefense: 100, companionOffense: 75, companionDefense: 70, heroArmor: 23, heroWeapon: 26,
    companionArmor: 17, companionWeapon: 25, heroOffense: 110, companionMp: 999, name: "Hawke", fallen: "",
    companion: "Lorac", attack: 400, hp: 9999, mp: 50, xp: 40000, hpMax: 9999, companionMpMax: 999, mpMax: 50,
    companionAttack: 300, companionHp: 9999, companionHpMax: 9999,
  };
  const p = party;
  const check = ["CHECK", p.level, p.heroDefense, p.companionOffense, p.companionDefense, p.heroArmor, p.heroWeapon,
    p.companionArmor, p.companionWeapon, p.heroOffense, p.companionMp, p.name, p.fallen, p.companion, p.attack, p.hp,
    p.mp, p.xp, p.hpMax, p.companionMpMax, p.mpMax, p.companionAttack, p.companionHp, p.companionHpMax, 1, 1, 1, 1, 1, 1, 1]
    .map((v) => (typeof v === "number" ? ` ${v} ` : v)).join("\r\n") + "\r\n";

  freshInstall();
  writeFileSync(join(GAME_DIR, "CHECK.TMP"), check, "latin1");
  const proc = spawn(EXE, ["--noprimaryconf", "--nolocalconf", "--conf", process.env.ENDGAME_CONF!], { stdio: "ignore" });
  try {
    for (let i = 0; ; i++) {
      try {
        await fetch(`${API}/dosbox/info`);
        break;
      } catch {
        if (i > 60) throw new Error("DOSBox API not reachable");
        await tick(500);
      }
    }
    const pc = matchingPC();
    const g = new Game(pc, loadGameData(pc));
    Object.assign(g, { level: p.level, xp: p.xp, fallen: p.fallen, heroDefense: p.heroDefense, heroOffense: p.heroOffense,
      companionDefense: p.companionDefense, companionOffense: p.companionOffense });
    Object.assign(g.hero, { name: p.name, attack: p.attack, hp: p.hp, hpMax: p.hpMax, mp: p.mp, mpMax: p.mpMax, armor: p.heroArmor, weapon: p.heroWeapon });
    Object.assign(g.companion, { name: p.companion, attack: p.companionAttack, hp: p.companionHp, hpMax: p.companionHpMax,
      mp: p.companionMp, mpMax: p.companionMpMax, armor: p.companionArmor, weapon: p.companionWeapon });
    for (const c of Object.keys(g.potions) as Array<keyof typeof g.potions>) g.potions[c] = 1;
    runOurs(pc, () => endgame(g));

    let failures = 0;
    await refSettle(2500);
    await settle(pc);
    failures += diff("Beldan's lair", await refCells(), screenCells(pc)) ? 1 : 0;
    for (let i = 0; i < Number(process.env.TURNS ?? 120); i++) {
      const screen = text(await refCells());
      if (/Program not running/.test(screen)) break;
      if (/Press any key to continue/.test(screen)) {
        failures += diff("program ended", await refCells(), screenCells(pc)) ? 1 : 0;
        break;
      }
      const k = /\(A\)ttack/.test(screen) ? "a" : " ";
      await refType(k);
      await type(pc, k);
      await refSettle(2500);
      await settle(pc);
      failures += diff(`endgame ${i + 1} (${k === " " ? "space" : k})`, await refCells(), screenCells(pc)) ? 1 : 0;
    }
    expect(failures).toBe(0);
  } finally {
    proc.kill();
  }
}, 1800000);

it("handles magic, potions and death the same way", async () => {
  // A level-3 magic user with potions and plenty of magic, at the start of level 1.
  const fields = [
    10, 5, 5, 4, 0, 6, 5, 9, 2, "", 60, 3, 1, 0, 0, "Hawke", "", "Lorac", 60, 150, 600, 2000,
    150, 11, 11, "A Magic User", 60, 600, 80, 120, 120, 2, 2, 2, 2, 2, 2, 2,
  ];
  const save = fields.map((v) => (typeof v === "number" ? ` ${v} ` : v)).join("\r\n") + "\r\n";
  const dosbox = await startDosbox(save);
  try {
    const pc = matchingPC({ "BELDAN.SAV": save });
    runOurs(pc, runManifest);
    let failures = 0;
    let synced = false;
    const step = async (name: string, keys: string) => {
      await refType(keys);
      await type(pc, keys);
      await refSettle(2500);
      await settle(pc);
      if (synced) {
        const ref = await refSeed();
        if (ref !== pc.rng.seed) {
          log(`--- ${name}: RND streams differ (ref ${ref}, ours ${pc.rng.seed}); resyncing`);
          pc.rng.seed = ref;
          failures++;
        }
      }
      const mode = await refMode();
      if (mode === 3 && pc.video.mode === 0) failures += diff(name, await refCells(), screenCells(pc)) ? 1 : 0;
      else if (GRAB && mode === 0x12 && pc.video.mode === 12) failures += comparePixels(name, pc) ? 1 : 0;
      else if ((mode === 3) !== (pc.video.mode === 0)) {
        log(`--- ${name}: video modes differ (ref ${mode.toString(16)}h, ours ${pc.video.mode})`);
        failures++;
      }
    };

    await refWaitFor(/Version 2\.01 1994/); // QuickBASIC takes a while to load M.BAS
    await step("restore or start", " ");
    await step("restore listing", "r\r");
    pc.rng.seed = await refSeed();
    synced = true;
    await step("restored", "BELDAN\r");

    // Answer the prompt the original's cursor is at. In fights, cycle through attacking,
    // casting and drinking; in the maze, walk and now and then cast a field spell.
    const fieldSpells = ["1\r", "4\r", "3\r", "2\r", "5\r"];
    const potions = ["white\r", "blue\r", "grey\r", "yellow\r", "red\r", "purple\r", "green\r"];
    let fight = 0, cast = 0, drink = 0;
    for (let i = 0; i < Number(process.env.TURNS ?? 90); i++) {
      const screen = text(await refCells());
      // The game is over, or stopped on a QuickBASIC error (already compared). From the
      // error, the original drops into the editor and ours restarts, so stop here.
      if (/Press any key to continue|File  Edit  View/.test(screen)) break;
      const [row, col] = await refCursor();
      const prompt = (screen.split("\n")[row - 1] ?? "").slice(0, col - 1).trimEnd();
      let k: string;
      if (/\(y\/n\)\??$/.test(prompt)) k = "y";
      else if (/What spell\? \(1-15\)/.test(screen) && row >= 15 && row <= 16) k = ["3\r", "1\r", "9\r"][cast++ % 3];
      else if (/What spell\?$/.test(prompt)) k = fieldSpells[cast++ % fieldSpells.length];
      else if (/Heal Who\?/.test(prompt)) k = "1\r";
      // (Asking for more than is missing loops forever, in both versions.)
      else if (/How many hit points\?$/.test(prompt)) k = /only needs? +0 *$/m.test(screen) ? "0\r" : "10\r";
      else if (/Which spell\?$/.test(prompt)) k = "1\r";
      else if (/What Spell \?$/.test(prompt)) k = "2\r";
      else if (/Down\?$|Across\?$/.test(prompt)) k = "15\r";
      else if (/drink\?$/.test(prompt)) k = potions[drink++ % potions.length];
      else if (/Who\? 1\) You/.test(screen) && /2\)/.test(screen) && !/\(A\)ttack/.test(screen)) k = "1";
      else if (/\(A\)ttack/.test(screen)) k = "amd"[fight++ % 3];
      else if ((await refMode()) === 0x12) k = i % 5 === 4 ? "m" : "8642"[i % 4];
      else k = " ";
      await step(`step ${i + 1} (${JSON.stringify(k)})`, k);
    }
    expect(failures).toBe(0);
  } finally {
    if (!process.env.KEEP_DOSBOX) dosbox.kill();
  }
}, 1800000);
