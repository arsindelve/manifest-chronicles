// Whole games played headless, with the random numbers fixed. Every screen the
// game stops on is fingerprinted, and the list is kept as a snapshot.
//
// They pin the game's behaviour down so the code can be reworked safely.
// On this branch the 1995 bugs are fixed, so the snapshots record the fixed
// game; the faithful version (tag faithful-1995) has the snapshots that
// matched the original in DOSBox.
//
// After an intended change in behaviour, play it through, then update the
// snapshots with `npx vitest run -u`.

import { describe, expect, it } from "vitest";
import { ProgramEnded, QBError } from "../src/dos/errors";
import type { PC } from "../src/dos/pc";
import { loadGameData } from "../src/game/data";
import { endgame } from "../src/game/endgame";
import { runManifest } from "../src/game/game";
import { Game } from "../src/game/state";
import { fingerprint, makePC, screenLines, tick, untilWaiting } from "./headless";

/** A .SAV file: 38 lines, numbers printed the way PRINT # prints them. */
const saveFile = (fields: Array<string | number>) =>
  fields.map((v) => (typeof v === "number" ? ` ${v} ` : v)).join("\r\n") + "\r\n";

/** Keys to try in turn, so repeated prompts take different branches. */
class Rotation {
  private i = 0;
  constructor(private keys: string[]) {}
  next() {
    return this.keys[this.i++ % this.keys.length];
  }
}

interface Run {
  pc: PC;
  log: string[];
  /** How the program finished, once it has. */
  outcome?: string;
}

function start(pc: PC, program: () => Promise<unknown>): Run {
  const run: Run = { pc, log: [] };
  program().then(
    () => (run.outcome = "returned"),
    (e: unknown) => {
      if (e instanceof ProgramEnded) run.outcome = "END";
      else if (e instanceof QBError) run.outcome = `QuickBASIC error: ${e.message}${e.line ? ` (line ${e.line})` : ""}`;
      else run.outcome = `crashed: ${String(e)}`;
    },
  );
  return run;
}

/** Wait for the next key request, or the end of the program. */
async function nextPrompt(run: Run) {
  const start = Date.now();
  while (!run.pc.keyboard.waiting && !run.outcome) {
    if (Date.now() - start > 10000) throw new Error("the game never waited for a key");
    await tick(1);
  }
}

async function send(run: Run, label: string, keys: string) {
  for (const k of keys) {
    await nextPrompt(run);
    if (run.outcome) return;
    run.pc.keyboard.push(k);
  }
  await nextPrompt(run);
  run.log.push(`${label.padEnd(28)} ${fingerprint(run.pc)}`);
}

/** The text on the cursor's line, up to the cursor. */
function promptText(pc: PC) {
  return screenLines(pc)
    [pc.screen.row - 1].slice(0, pc.screen.col - 1)
    .trimEnd();
}

/** Answers the text-mode prompts that come up in play. */
function responder() {
  const yesNo = new Rotation(["y", "y", "n", "y"]);
  const battle = new Rotation(["a", "a", "m", "a", "d", "a", "a", "r"]);
  const battleSpell = new Rotation(["3\r", "1\r", "9\r", "2\r"]);
  const fieldSpell = new Rotation(["1\r", "4\r", "3\r", "2\r", "5\r", "0\r"]);
  const locate = new Rotation(["1\r", "2\r"]);
  const potion = new Rotation(["white\r", "blue\r", "grey\r", "yellow\r", "red\r", "purple\r", "green\r", "\r"]);
  return (pc: PC): string => {
    const screen = screenLines(pc).join("\n");
    const prompt = promptText(pc);
    // INPUT prompts show the cursor and want Enter; single-key prompts don't.
    const enter = pc.video.cursorVisible ? "\r" : "";
    if (/\(y\/n\)[ ?]*$/.test(prompt)) return yesNo.next() + enter;
    if (prompt.includes("Heal Who?")) return "1\r";
    if (screen.includes("Who? 1) You") && !screen.includes("(A)ttack")) return "1" + enter;
    if (screen.includes("What spell? (1-15)")) return battleSpell.next();
    if (prompt.endsWith("What spell?")) return fieldSpell.next();
    if (prompt.endsWith("How many hit points?")) return /only needs? +0 *$/m.test(screen) ? "0\r" : "10\r";
    if (prompt.endsWith("What Spell ?")) return locate.next();
    if (prompt.endsWith("Which spell?"))
      return (prompt + screen.slice(-400)).includes("enough Magic Points") ? "0\r" : "1\r";
    if (/Down\?$|Across\?$/.test(prompt)) return "15\r";
    if (prompt.endsWith("drink?")) return potion.next();
    if (screen.includes("(A)ttack")) return battle.next();
    if (/^\?$/.test(prompt) || /\? *$/.test(prompt)) return "1\r";
    return " ";
  };
}

/** Play: in the maze take the next planned key, elsewhere answer what's asked. */
async function play(run: Run, plan: string[], maxSteps: number) {
  const answer = responder();
  let p = 0;
  let same = 0;
  for (let i = 0; i < maxSteps && !run.outcome; i++) {
    await nextPrompt(run);
    if (run.outcome) break;
    const inMaze = run.pc.video.mode === 12;
    const k = inMaze ? plan[p++ % plan.length] : answer(run.pc);
    const before = fingerprint(run.pc);
    await send(run, `${i + 1} ${inMaze ? "maze" : "text"} ${JSON.stringify(k)}`, k);
    same = fingerprint(run.pc) === before ? same + 1 : 0;
    if (same === 5) {
      const where = `${run.pc.screen.row},${run.pc.screen.col}`;
      throw new Error(`stuck at ${where} answering ${JSON.stringify(k)}:
${screenLines(run.pc).join("\n")}`);
    }
  }
}

function finish(run: Run) {
  run.log.push(`outcome: ${run.outcome ?? "still running"}`);
  return run.log;
}

async function newGame(seed: number) {
  const pc = makePC();
  const run = start(pc, () => runManifest(pc));
  const t0 = Date.now();
  while (!screenLines(pc).join("\n").includes("Version 2.01 1994")) {
    if (Date.now() - t0 > 10000) throw new Error("no title screen");
    await tick(1);
  }
  pc.keyboard.push(" ");
  await untilWaiting(pc);
  // The title screen advances RND for as long as it's shown; fix it here instead.
  pc.rng.seed = seed;
  await send(run, "restore or start", "s\r");
  await send(run, "names", "Hawke\rLorac\r");
  return run;
}

async function fromSave(fields: Array<string | number>, seed: number) {
  const pc = makePC({ "BELDAN.SAV": saveFile(fields) });
  const run = start(pc, () => runManifest(pc));
  const t0 = Date.now();
  while (!screenLines(pc).join("\n").includes("Version 2.01 1994")) {
    if (Date.now() - t0 > 10000) throw new Error("no title screen");
    await tick(1);
  }
  pc.keyboard.push(" ");
  await untilWaiting(pc);
  pc.rng.seed = seed;
  await send(run, "restore listing", "r\r");
  await send(run, "restored", "BELDAN\r");
  return run;
}

const ROUTE = [..."8888666888848888222288886888", ..."6666844442222"];

describe("playthroughs", { timeout: 120000 }, () => {
  it("a fighter's new game, menus and all", async () => {
    const run = await newGame(5);
    await send(run, "fighter", "2\r");
    await send(run, "stats", "2\r");
    await send(run, "instructions", "y\r");
    await send(run, "story", " ");
    await send(run, "maze", " ");
    await play(run, ROUTE, 150);
    for (const [label, keys] of [
      ["commands menu", "c"],
      ["hints", "h"],
      ["hint", "b"],
      ["hint 2", " "],
      ["hint 3", " "],
      ["hint end", " "],
      ["sound off", "e"],
      ["eagle eye", "m"],
      ["caster", "y"],
      ["spell", "3\r"],
      ["5x5", "1\r"],
      ["back", " "],
      ["location", "m"],
      ["caster", "y"],
      ["spell", "2\r"],
      ["quadrant", "1\r"],
      ["back", " "],
      ["potions", "d"],
      ["no potion", "\r"],
      ["back", " "],
      ["save", "s"],
      ["saved", "GOLDEN\r"],
      ["back", " "],
      ["restore", "r"],
      ["restored", "GOLDEN\r"],
      ["walk", "8"],
      ["quit?", "q"],
      ["no", "n"],
      ["quit", "q"],
      ["yes", "y"],
      ["scores", " "],
    ] as const) {
      if (run.outcome) break;
      await send(run, `tour (${label}) ${JSON.stringify(keys)}`, keys);
    }
    expect(finish(run)).toMatchSnapshot();
  });

  it("a magic user's new game", async () => {
    const run = await newGame(1234567);
    await send(run, "magic user", "1\r");
    await send(run, "stats", "2\r");
    await send(run, "no instructions", "n\r");
    await send(run, "story", " ");
    await send(run, "maze", " ");
    await play(run, [...ROUTE, "m", "d"], 250);
    expect(finish(run)).toMatchSnapshot();
  });

  it("magic, potions and mishaps from a save", async () => {
    // A level-3 magic user with potions and plenty of magic, at the start of level 1.
    const run = await fromSave(
      [
        10,
        5,
        5,
        4,
        0,
        6,
        5,
        9,
        2,
        "",
        60,
        3,
        1,
        0,
        0,
        "Hawke",
        "",
        "Lorac",
        60,
        150,
        600,
        2000,
        150,
        11,
        11,
        "A Magic User",
        60,
        600,
        80,
        120,
        120,
        2,
        2,
        2,
        2,
        2,
        2,
        2,
      ],
      777,
    );
    await play(run, ["2", "2", "6", "m", "6", "2", "d", "6", "4", "m"], 300);
    expect(finish(run)).toMatchSnapshot();
  });

  it("level 4 to the exit, and the fight with Beldan", async () => {
    // One step south of level 4's exit, facing north, with the best gear.
    const run = await fromSave(
      [
        100,
        75,
        70,
        23,
        0,
        26,
        17,
        25,
        110,
        "",
        999,
        9,
        4,
        0,
        0,
        "Hawke",
        "",
        "Lorac",
        400,
        9999,
        50,
        40000,
        9999,
        37,
        21,
        "A Fighter",
        999,
        50,
        300,
        9999,
        9999,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
      ],
      4242,
    );
    await play(run, ["8"], 400);
    expect(finish(run)).toMatchSnapshot();
  });

  it("Beldan with a weaker party", async () => {
    const pc = makePC();
    const g = new Game(pc, loadGameData(pc));
    Object.assign(g, {
      level: 9,
      xp: 40000,
      heroDefense: 40,
      heroOffense: 60,
      companionDefense: 30,
      companionOffense: 50,
    });
    Object.assign(g.hero, {
      name: "Hawke",
      attack: 200,
      hp: 3000,
      hpMax: 3000,
      mp: 50,
      mpMax: 50,
      armor: 10,
      weapon: 12,
    });
    Object.assign(g.companion, {
      name: "Lorac",
      attack: 150,
      hp: 2500,
      hpMax: 2500,
      mp: 600,
      mpMax: 600,
      armor: 8,
      weapon: 9,
    });
    for (const c of Object.keys(g.potions) as Array<keyof typeof g.potions>) g.potions[c] = 2;
    const run = start(pc, () => endgame(g));
    await play(run, [" "], 300);
    expect(finish(run)).toMatchSnapshot();
  });

  it("restoring with no saves says so", async () => {
    const pc = makePC();
    const run = start(pc, () => runManifest(pc));
    while (!screenLines(pc).join("\n").includes("Version 2.01 1994")) await tick(1);
    pc.keyboard.push(" ");
    await send(run, "restore", "r\r");
    expect(finish(run)).toMatchSnapshot();
  });
});
