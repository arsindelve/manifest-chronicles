// Spells cast while exploring (M): Heal, Location, Eagle Eye, Life, Teleport.

import { atLine } from "../dos/errors";
import { Cell, type Maze } from "./maze";
import { death } from "./records";
import type { Character, Game, Point } from "./state";
import { footer } from "./ui";

export async function castFieldSpell(g: Game, maze: Maze, from: Point) {
  const s = g.screen;
  s.mode(0);
  s.clear();
  footer(g);
  s.put(5, 10, "Spells....", 15);
  s.color(9);
  s.writeln();
  for (const line of [
    "0 To Quit ",
    "1) Heal...........",
    "2) Location.......",
    "3) Eagle Eye......",
    "4) Life...........",
    "5) Teleport.......",
  ]) {
    s.tab(20);
    s.writeln(line);
  }

  s.writeln();
  s.color(15);
  if (g.fallen !== "U") {
    s.tab(10);
    s.writeln("You have ", g.hero.mp, " magic points.");
  }
  if (g.fallen !== "C") {
    s.tab(10);
    s.writeln(g.companion.name, " has ", g.companion.mp, " magic points.");
    s.writeln();
  }
  if (g.fallen === "") await chooseCaster(g, 10);
  s.color(9);
  if (g.fallen === "U") g.caster = 2;
  if (g.fallen === "C") g.caster = 1;

  s.writeln();
  s.writeln();
  s.at(18, 20);
  s.tab(10);
  s.write("What spell? ");
  let spell: number;
  do {
    s.at(19, 20);
    spell = await s.inputNumber();
  } while (!(spell < 6 && spell > -1));

  const caster = g.caster === 1 ? g.hero : g.companion;
  if (spell === 1) await heal(g, caster);
  else if (spell === 2) await location(g, caster, from);
  else if (spell === 3) await eagleEye(g, maze, caster, from);
  else if (spell === 5) await teleport(g, maze, caster);
  else if (spell === 4) await life(g, caster);

  await g.pause();
}

/** "Use your magic? (y/n)" - answering no hands the casting to the other one. */
export async function chooseCaster(g: Game, tab: number) {
  const s = g.screen;
  s.tab(tab);
  if (g.hero.job === "A Magic User") {
    s.write("Use your magic? (y/n)");
    g.caster = 1;
  } else {
    s.write("Use ", g.companion.name, "s magic? (y/n)");
    g.caster = 2;
  }
  const k = await g.pc.keyboard.waitFor("y", "n");
  if (k.toLowerCase() === "n") g.caster = g.caster === 2 ? 1 : 2;
}

/** The caster's line when they're short of magic: "You don't..." or "<name> does not...". */
const lacks = (g: Game, c: Character, you: string, them: string) => (c === g.hero ? [you] : [c.name, them]);

/** 10 magic points per hit point. */
async function heal(g: Game, caster: Character) {
  const s = g.screen;
  const { hero, companion } = g;
  s.clear();
  footer(g);
  s.color(15);
  if (g.fallen !== "U") s.writeln("You have ", hero.hp, "/", hero.hpMax, " hit points.");
  if (g.fallen !== "C") s.writeln(companion.name, " has ", companion.hp, "/", companion.hpMax, " hit points");
  s.writeln();
  s.color(9);
  s.writeln(" 10  Magic Points per hit point.");
  if (g.fallen !== "U") s.writeln((hero.hpMax - hero.hp) * 10, " Magic points to heal you fully.");
  if (g.fallen !== "C")
    s.writeln((companion.hpMax - companion.hp) * 10, " Magic Points to heal ", companion.name, " fully.");
  s.writeln();
  s.color(13);

  let patient: Character | null = null;
  if (g.fallen === "") {
    while (!patient) {
      s.write("Heal Who? 1) You  2) ", companion.name);
      const who = await s.inputNumber();
      patient = who === 1 ? hero : who === 2 ? companion : null;
    }
  }
  if (g.fallen === "U") patient = companion;
  if (g.fallen === "C") patient = hero;

  // Once an amount has passed the check, later amounts skip it - so after a
  // rejected try, an over-large number can heal past the maximum.
  let accepted = false;
  let done = false;
  while (!done) {
    let amount = await s.inputNumber("How many hit points? ");
    if (patient) {
      const needed = patient.hpMax - patient.hp;
      if (amount > needed) {
        if (patient === hero) s.writeln("You only need ", needed);
        else s.writeln(patient.name, " only needs ", needed);
      } else if (amount < 0) {
        amount = 0;
        done = true;
      } else accepted = true;
    }
    if (!accepted) continue;
    if (amount * 10 > caster.mp) {
      s.writeln(...lacks(g, caster, "You don't have that many Magic Points.", " doesn't have that many Magic Points."));
    } else {
      if (g.soundOn) await g.clock.spellSound();
      s.writeln(amount, " restored.");
      caster.mp -= amount * 10;
      if (patient) {
        patient.hp += amount;
        done = true;
      }
    }
  }
}

/** Which quarter of the level you're in, or exactly how far from the entrance. */
async function location(g: Game, caster: Character, from: Point) {
  const s = g.screen;
  s.clear();
  footer(g);
  s.color(15);
  s.writeln();
  for (const line of ["0) Quit", "1) Quadrant.....50 Mp", "2) Precise....150 Mp "]) {
    s.tab(5);
    s.writeln(line);
  }
  s.writeln();
  s.color(5);

  const you = caster === g.hero;
  for (;;) {
    const which = await s.inputNumber("What Spell ? ");
    if (which === 1) {
      if (caster.mp >= 50) {
        const quadrant = (from.row >= 25 ? "South" : "North") + (from.col >= 25 ? "east" : "west");
        s.color(15);
        if (g.soundOn) await g.clock.spellSound();
        s.writeln("You are in the ", quadrant, " Quadrant.");
        caster.mp -= 50;
        if (you) await g.pause();
        return;
      }
      s.writeln(
        ...lacks(
          g,
          caster,
          "You do not have enough Magic Points to cast that.",
          " does not have enough Magic Points to cast that.",
        ),
      );
    } else if (which === 2) {
      if (caster.mp >= 150) {
        s.color(15);
        if (g.soundOn) await g.clock.spellSound();
        s.writeln(
          "You are ",
          from.col - 10,
          " steps east and ",
          from.row - 10,
          " steps south of your original location.",
        );
        await g.pause();
        caster.mp -= 150;
        if (!you) await g.pause();
        return;
      }
      s.writeln(
        ...lacks(
          g,
          caster,
          "You don't have enough Magic Points to cast that.",
          " does not have enough Magic Points to cast that.",
        ),
      );
      await g.pause();
      if (!you) await g.pause();
    } else if (which === 0) return;
  }
}

/** A map of the squares around you: 7x7, 13x13 or 19x19. */
async function eagleEye(g: Game, maze: Maze, caster: Character, from: Point) {
  const s = g.screen;
  s.clear();
  footer(g);
  s.color(13);
  s.writeln();
  for (const line of ["0) Quit", "1) 5x5..........100 MP", "2) 10x10........250 MP", "3) 20x20........500 MP"])
    s.writeln(line);
  s.writeln();

  const sizes = [
    { reach: 3, cost: 100, top: 10, indent: 30 },
    { reach: 6, cost: 250, top: 8, indent: 22 },
    { reach: 9, cost: 500, top: 3, indent: 11 },
  ];
  let size: (typeof sizes)[number] | undefined;
  for (;;) {
    s.color(15);
    const which = await s.inputNumber("Which spell? ");
    if (which === 0) return;
    const pick = sizes[which - 1] as (typeof sizes)[number] | undefined; // nothing for 4, 1.5, -2 ...
    if (!pick) continue;
    if (caster.mp >= pick.cost) {
      size = pick;
      break;
    }
    s.writeln(
      ...lacks(
        g,
        caster,
        "You don't have enough Magic Points to cast that.",
        " does not have enough Magic Points to cast that.",
      ),
    );
  }

  s.clear();
  s.color(8);
  s.at(size.top, 1);
  const look = (row: number, col: number) => atLine(2986, () => maze.at({ row, col }));
  for (let row = from.row - size.reach; row <= from.row + size.reach; row++) {
    s.tab(size.indent);
    s.write(" ");
    for (let col = from.col - size.reach; col <= from.col + size.reach; col++) {
      if (row === from.row && col === from.col) {
        s.color(14);
        s.write(" Ω ");
        s.color(8);
      } else if (look(row, col) === Cell.Stairs) {
        s.color(6);
        s.write(" ≡ ");
        s.color(8);
      } else s.write(look(row, col) === Cell.Wall ? "███" : "   ");
    }
    s.writeln();
  }
  caster.mp -= size.cost;
}

/** Bring a fallen party member back with 1 hit point. */
async function life(g: Game, caster: Character) {
  const s = g.screen;
  s.clear();
  footer(g);
  s.color(15);
  if (g.fallen === "") {
    s.writeln("Neither of you are dead.");
    return;
  }
  if (!(caster.mp > 500)) {
    s.writeln(caster === g.hero ? "You require 500 Magic Points." : "This requires 500 Magic Points");
    return;
  }
  caster.mp -= 500;
  const revived = g.fallen === "U" ? g.hero : g.companion;
  g.fallen = "";
  revived.hp = 1;
  if (g.soundOn) await g.clock.spellSound();
  if (revived === g.hero) s.writeln("You have been revived.");
  else s.writeln(revived.name, " has been revived.");
}

/** Jump to any square from (11,11) to (40,40). Choose badly and you land in rock. */
async function teleport(g: Game, maze: Maze, caster: Character) {
  const s = g.screen;
  s.clear();
  footer(g);
  s.writeln("500 MP to Teleport.......");
  if (caster.mp < 500) {
    s.writeln(
      ...(caster === g.hero ? ["You don't have enough Magic."] : [caster.name, " does not have enough Magic."]),
    );
    return;
  }
  caster.mp -= 500;

  let down: number, across: number;
  for (;;) {
    s.color(15);
    s.writeln();
    s.writeln("Coordinates? ");
    down = await s.inputNumber("Down? ");
    across = await s.inputNumber("Across? ");
    if (down > 0 && down < 31 && across > 0 && across < 31) break;
    s.writeln("Invalid Coordinates");
  }

  if (g.soundOn) await g.clock.spellSound();
  g.jumpPending = true;
  g.anchor = { row: down + 10, col: across + 10 };
  if (maze.at(g.anchor) === Cell.Wall) {
    s.color(4);
    s.writeln();
    s.writeln("You have teleported into solid rock and are unable to breathe.");
    s.writeln("You pass out from lack of oxygen, then die shorlty after.");
    await g.pause();
    await death(g);
  }
}
