// Saving, restoring, high scores, hints, and the end of the quest.

import { atLine, ProgramEnded } from "../dos/errors";
import type { Maze } from "./maze";
import { newCharacterScreens } from "./title";
import type { Game, Heading, Point } from "./state";
import { footer, hline, typeOut, vline } from "./ui";

export function endProgram(): never {
  throw new ProgramEnded();
}

// ------------------------------------------------------------------ saves

/**
 * A .SAV file: one value per line, in this order (the 1995 format, so old
 * saves load). "unused" lines were always written as 0.
 */
export async function saveGame(g: Game, at: Point) {
  const s = g.screen;
  s.clear();
  s.mode(0);
  footer(g);
  s.color(13);
  s.writeln("Type in the filename you wish to use. Do not add an extension.");
  s.writeln("An extension of .SAV will be added.");
  s.writeln();

  s.color(15);
  let name = "";
  for (;;) {
    name = await s.inputText();
    if (name.length > 0 && name.length < 9) break;
    s.writeln("The filename should be less at least one character and less than eight.");
  }

  const { hero: h, companion: c, potions: p } = g;
  atLine(3668, () => {
    g.pc.writeFile(name + ".SAV", (w) => {
      for (const v of [
        g.heroDefense,
        g.companionOffense,
        g.companionDefense,
        h.armor,
        0,
        h.weapon,
        c.armor,
        c.weapon,
        g.heroOffense,
      ])
        w.line(v);
      w.line(g.invisible ? "Yes" : "");
      for (const v of [c.mp, g.level, g.map, 0, g.heading]) w.line(v);
      w.line(h.name);
      w.line(g.fallen);
      w.line(c.name);
      for (const v of [h.attack, h.hp, h.mp, g.xp, h.hpMax, at.row, at.col]) w.line(v);
      w.line(h.job);
      for (const v of [
        c.mpMax,
        h.mpMax,
        c.attack,
        c.hp,
        c.hpMax,
        p.purple,
        p.green,
        p.white,
        p.yellow,
        p.blue,
        p.red,
        p.grey,
      ])
        w.line(v);
    });
  });

  s.color(9);
  s.writeln();
  s.writeln("Finished Saving.....");
}

/**
 * Pick a save from the directory listing. With no saves at all the listing
 * itself fails with "File not found", as it did in 1995. From the title
 * screen, leaving the name blank starts a new character instead.
 */
export async function restoreGame(g: Game, maze: Maze, fromTitle = false) {
  const s = g.screen;
  s.clear();
  s.mode(0);
  footer(g);

  s.color(9);
  atLine(3524, () => {
    g.pc.listFiles("*.SAV");
  });
  s.writeln();
  s.color(15);
  s.writeln("What savegame do you want to restore? (DO NOT ADD .SAV)");
  let name = "";
  for (;;) {
    name = await s.inputText();
    if (name.length < 9) break;
    s.writeln("The filename must be less than 9 letters.");
  }

  if (name) {
    const f = atLine(3542, () => g.pc.readFile(name + ".SAV"));
    const { hero: h, companion: c, potions: p } = g;
    g.heroDefense = f.number();
    g.companionOffense = f.number();
    g.companionDefense = f.number();
    h.armor = f.number();
    f.number(); // unused
    h.weapon = f.number();
    c.armor = f.number();
    c.weapon = f.number();
    g.heroOffense = f.number();
    g.invisible = f.string() === "Yes";
    c.mp = f.number();
    g.level = f.number();
    g.map = f.number();
    f.number(); // unused
    g.heading = f.number() as Heading;
    h.name = f.string();
    g.fallen = f.string() as Game["fallen"];
    c.name = f.string();
    h.attack = f.number();
    h.hp = f.number();
    h.mp = f.number();
    g.xp = f.number();
    h.hpMax = f.number();
    g.anchor = { row: f.number(), col: f.number() };
    h.job = f.string() as Game["hero"]["job"];
    c.job = h.job === "A Fighter" ? "A Magic User" : "A Fighter";
    c.mpMax = f.number();
    h.mpMax = f.number();
    c.attack = f.number();
    c.hp = f.number();
    c.hpMax = f.number();
    p.purple = f.number();
    p.green = f.number();
    p.white = f.number();
    p.yellow = f.number();
    p.blue = f.number();
    p.red = f.number();
    p.grey = f.number();
    g.jumpPending = true;
    if (!fromTitle) maze.load(g, g.map);
  }

  if (name === "" && g.hero.name === "") await newCharacterScreens(g);
}

// ------------------------------------------------------------------ high scores

interface Score {
  name: string;
  companion: string;
  level: number;
  xp: number;
}

/** Slot 11 is where a new name waits to be sorted in; it lingers between games. */
const scores: Score[] = Array.from({ length: 12 }, () => ({ name: "", companion: "", level: 0, xp: 0 }));

export async function highScores(g: Game) {
  const f = atLine(1442, () => g.pc.readFile("HIGH.DAT"));
  for (let i = 1; i <= 10; i++)
    scores[i] = { name: f.string(), companion: f.string(), level: f.number(), xp: f.number() };

  // Update your existing entry if you beat it, otherwise add you at slot 11.
  let from = 0;
  const yours = scores.slice(1, 11).filter((e) => e.name === g.hero.name);
  for (const e of yours) {
    if (g.xp > e.xp) {
      Object.assign(e, { level: g.level, companion: g.companion.name, xp: g.xp });
      from = 10;
    }
  }
  if (!yours.length) {
    scores[11] = { name: g.hero.name, companion: g.companion.name, level: g.level, xp: g.xp };
    from = 11;
  }
  // One bubble pass from the bottom: enough to float a new score up into place.
  for (let i = from; i >= 2; i--) {
    if (scores[i].xp > scores[i - 1].xp) [scores[i], scores[i - 1]] = [scores[i - 1], scores[i]];
  }

  showScores(g);

  g.pc.writeFile("HIGH.DAT", (w) => {
    for (let i = 1; i <= 10; i++) w.record(scores[i].name, scores[i].companion, scores[i].level, scores[i].xp);
  });
  await g.pause();
  g.screen.color(7);
}

function showScores(g: Game) {
  const s = g.screen;
  s.clear();
  s.color(9);
  s.put(4, 19, "╔");
  hline(g, 4, 20, 60, "═");
  s.put(3, 35, "High Scores", 15);
  s.color(14);
  s.at(5, 20);
  s.write("Name");
  s.zone();
  s.write("Companion");
  s.zone();
  s.writeln("Level   ", "Experience");
  s.color(9);
  hline(g, 6, 20, 60, "─");
  s.put(6, 19, "╟");
  s.put(6, 61, "╢");
  s.put(4, 61, "╗");
  vline(g, 19, 5, 17, "║");
  vline(g, 61, 5, 17, "║");
  s.put(17, 19, "╚");
  s.put(17, 61, "╝");
  hline(g, 17, 20, 60, "═");

  for (let i = 1; i <= 10; i++) {
    const e = scores[i];
    if (e.level <= 0) continue;
    s.color(15);
    s.put(i + 6, 20, e.name);
    s.put(i + 6, 30, e.companion);
    s.put(i + 6, 44, e.level);
    s.put(i + 6, 51, e.xp);
  }
}

// ------------------------------------------------------------------ the end

export async function death(g: Game): Promise<never> {
  const s = g.screen;
  s.clear();
  footer(g);
  s.mode(0);
  s.color(15);
  s.writeln("The quest has failed. You have become victims of the Catacombs of Despair.");
  s.writeln("This will be the last entry in the Manifest Chronicles.");
  await g.pause();

  await slideIn(g, "The End ", 4, 70, 33, 1000);
  await g.pause();
  await highScores(g);
  endProgram();
}

/** Letters slide in from the right one at a time along row 12. */
export async function slideIn(g: Game, text: string, color: number, from: number, to: number, delay: number) {
  const s = g.screen;
  s.color(color);
  for (let i = 1; i <= text.length; i++) {
    for (let j = from; j >= to; j -= 2) {
      s.put(12, j + i, text[i - 1]);
      s.put(12, j + 1 + i, " ");
      await g.clock.spin(delay);
    }
  }
}

// ------------------------------------------------------------------ hints

const HINT_TOPICS: Record<string, string> = {
  f: "HELP.1",
  p: "HELP.2",
  m: "HELP.3",
  s: "HELP.4",
  l: "HELP.5",
  b: "HELP.6",
  w: "HELP.7",
};

export async function showHints(g: Game) {
  const s = g.screen;
  s.mode(0);
  s.clear();
  footer(g);
  s.put(1, 35, "Hints Menu", 15);
  s.writeln();
  s.writeln("When viewing a topic, press 'U' to increase the speed, 'D' to decrease.");
  s.color(9);
  s.writeln("Press the letter of the topic you wish to view.");
  s.writeln();
  // (P) has a topic too, though the menu doesn't list it.
  for (const [key, rest] of [
    ["F", "ighting Battles"],
    ["M", "agic "],
    ["S", "urviving the Maze"],
    ["L", "ocating the Stairs"],
    ["W", "eapons and Armor"],
    ["B", "ackground "],
  ]) {
    s.color(9);
    s.write(`(${key})`);
    s.color(15);
    s.writeln(rest);
  }
  s.color(9);

  const key = await g.pc.keyboard.waitFor(..."FPMSLBW", " ");
  if (key === " ") return;
  const file = HINT_TOPICS[key.toLowerCase()];
  atLine(1581, () => g.pc.readFile(file)); // the file is opened before the screen clears
  s.clear();
  footer(g);
  await typeOut(g, file, 250, 1581);
}
