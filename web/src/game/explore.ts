// Walking the catacombs: the turn loop, the status panel, stairs, commands.

import { NUMBER_LEN, single } from "../dos/format";
import { encounter } from "./battle";
import { endgame } from "./endgame";
import { castFieldSpell } from "./fieldspells";
import { openChest, potionMenu } from "./items";
import { add, Cell, forward, HEADING_NAMES, turnLeft, turnRight, type Maze } from "./maze";
import { endProgram, highScores, restoreGame, saveGame, showHints } from "./records";
import type { Character, Game } from "./state";
import { footer, hline, typeOut, vline } from "./ui";
import { drawCorridor } from "./view3d";

export async function explore(g: Game, maze: Maze) {
  let key = "TEST"; // the first pass draws the view without waiting for a key
  g.soundOn = true;
  statusPanel(g);

  for (;;) {
    if (maze.at(g.pos) === Cell.Stairs) {
      await stairs(g, maze);
      statusPanel(g);
      key = " ";
    }

    if (maze.at(g.pos) === Cell.Exit) return endgame(g);

    if (key === "") key = await g.pc.keyboard.waitKey();

    if (maze.at(g.pos) === Cell.Story) {
      await tellStory(g);
      maze.set(g.pos, Cell.Open);
      statusPanel(g);
    }

    if (g.invisible) {
      g.invisibleSteps++;
      if (g.invisibleSteps === 50) {
        g.screen.clear();
        footer(g);
        g.screen.mode(0);
        g.screen.writeln("You are no longer invisible...");
        await g.pause();
        g.invisible = false;
        g.invisibleSteps = 0;
        await encounter(g);
        statusPanel(g);
      }
    }

    if (!g.jumpPending) g.anchor = { ...g.pos };

    if (!g.invisible && g.rng.roll(20) === 1) {
      await encounter(g);
      statusPanel(g);
    }

    if (g.rng.roll(600) === 1) {
      await openChest(g);
      statusPanel(g);
    }

    for (const c of [g.hero, g.companion]) c.hp = Math.floor(c.hp);
    if (g.fallen !== "U") regenerate(g.hero);
    if (g.fallen !== "C") regenerate(g.companion);
    for (const c of [g.hero, g.companion]) if (c.mp > c.mpMax) c.mp -= 1;

    if (key === "4") g.heading = turnLeft(g.heading);
    if (key === "6") g.heading = turnRight(g.heading);
    if (key === "2" || key === "8") {
      const to = add(g.pos, forward(g.heading), key === "8" ? 1 : -1);
      if (maze.at(to) !== Cell.Wall) g.pos = to;
    }

    switch (key.toUpperCase()) {
      case "M":
        await castFieldSpell(g, maze, g.anchor);
        statusPanel(g);
        break;
      case "D":
        await potionMenu(g);
        statusPanel(g);
        break;
      case "C":
        await commandsMenu(g, maze);
        statusPanel(g);
        break;
      case "S":
        await saveGame(g, g.anchor);
        statusPanel(g);
        break;
      case "R":
        await restoreGame(g, maze);
        statusPanel(g);
        break;
      case "Q":
        await quit(g);
        statusPanel(g);
        break;
      case "H":
        await showHints(g);
        statusPanel(g);
        break;
      case "E":
        g.soundOn = !g.soundOn;
        break;
    }

    if (g.jumpPending) {
      g.pos = { ...g.anchor };
      g.jumpPending = false;
    }

    g.refreshGear();
    g.screen.mode(12);
    drawCorridor(g, maze);
    key = "";

    const s = g.screen;
    s.color(14);
    s.at(2, 63);
    s.write("Heading ");
    s.writeln(HEADING_NAMES[g.heading]);
    s.color(15);
    printVitals(g);

    if (g.soundOn) await g.clock.stepSound();
  }
}

/** Magic trickles back each turn: a twentieth of what's missing, plus one. */
function regenerate(c: Character) {
  c.mp += Math.floor((c.mpMax - c.mp) / 20) + 1;
}

async function tellStory(g: Game) {
  const s = g.screen;
  s.clear();
  s.mode(0);
  footer(g);
  // Levels 1-3 have one story each; level 4's are told in turn as MAPTEXT.4, .5, .6.
  let n = g.map;
  if (g.map === 4) n = ++g.storiesTold + 3;
  await typeOut(g, `MAPTEXT.${n % 10}`, 3250, 846);
}

async function stairs(g: Game, maze: Maze) {
  const s = g.screen;
  s.clear();
  s.mode(0);
  s.color(9);
  s.writeln("There is a set of stairs leading down. Descend? (y/n) ");
  const k = await g.pc.keyboard.waitFor("y", "n");
  g.jumpPending = true;
  if (k.toLowerCase() === "y") {
    g.anchor = { row: 11, col: 11 };
    g.map++;
    maze.load(g, g.map);
  } else {
    // Step off the stairs onto the first open square beside the anchor.
    const a = g.anchor;
    for (const d of [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ]) {
      if (maze.peek(add(a, d)) === Cell.Open) {
        g.anchor = add(a, d);
        break;
      }
    }
  }
}

/** The side panel: heading, both characters' vitals and gear, level and XP. */
export function statusPanel(g: Game) {
  const s = g.screen;
  const { armor, weapons } = g.data;
  s.mode(12);

  s.color(14);
  s.at(2, 63);
  s.write("Heading ");
  if (HEADING_NAMES[g.heading]) s.writeln(HEADING_NAMES[g.heading]);

  const card = (top: number, c: Character) => {
    s.color(1);
    hline(g, top, 59, 79, "═");
    hline(g, top + 10, 59, 79, "═");
    s.put(top + 1, 70 - c.name.length / 2, c.name, 15);
    s.color(1);
    vline(g, 58, top + 1, top + 9, "║");
    vline(g, 80, top + 1, top + 9, "║");
    s.put(top, 58, "╔");
    s.put(top + 10, 58, "╚");
    s.put(top, 80, "╗");
    s.put(top + 10, 80, "╝");
  };
  const gear = (top: number, c: Character, drawVitals: boolean) => {
    hline(g, top + 7, 59, 64, "─");
    hline(g, top + 7, 66, 79, "─");
    s.color(15);
    const a = armor[c.armor].name,
      w = weapons[c.weapon].name;
    s.put(top + 8, 70 - a.length / 2, a);
    s.put(top + 9, 70 - w.length / 2, w);
    s.color(1);
    vline(g, 65, top + 3, top + 6, "│");
    s.color(15);
    s.put(top + 4, 59, "Magic");
    s.put(top + 5, 59, "Health");
    if (drawVitals) printVitals(g);
    s.color(1);
    hline(g, top + 2, 59, 64, "─");
    hline(g, top + 2, 66, 79, "─");
    s.put(top + 2, 65, "┬");
    s.put(top + 7, 65, "┴");
  };

  card(4, g.hero);
  gear(4, g.hero, true);
  s.color(1);
  card(16, g.companion);
  gear(16, g.companion, false);

  s.at(15, 70 - (NUMBER_LEN + 4) / 2);
  s.color(14);
  s.writeln("Level ", g.level);
  const toGo = g.nextLevelXp - g.xp;
  s.at(27, 68 - (NUMBER_LEN + 13) / 2);
  s.writeln(toGo, "to next level");

  s.put(28, 61, "(C) For Commands", 9);
}

/** Magic and health for both characters, red below 35% health or 25% magic. */
export function printVitals(g: Game) {
  const s = g.screen;
  const width = (max: number) => (max > 999 ? NUMBER_LEN * 2 + 4 : NUMBER_LEN * 2 + 1);
  const show = (row: number, value: number, max: number, low: number, dead: boolean) => {
    s.color(value < single(max * single(low)) ? 4 : 15);
    s.at(row, 73 - width(max) / 2);
    if (dead) {
      s.at(row, 71);
      s.writeln("Dead");
    } else s.writeln(value, "/", max);
  };
  const { hero: h, companion: c } = g;
  show(9, h.hp, h.hpMax, 0.35, g.fallen === "U");
  show(8, h.mp, h.mpMax, 0.25, false);
  show(20, c.mp, c.mpMax, 0.25, false);
  show(21, c.hp, c.hpMax, 0.35, g.fallen === "C");
}

async function commandsMenu(g: Game, maze: Maze) {
  const s = g.screen;
  s.mode(0);
  s.clear();
  footer(g);

  s.color(9);
  s.writeln();
  for (const k of "DSRMQHE") s.writeln(`(${k})`);
  s.writeln();
  s.writeln("Use the arrows on the numeric keypad to move around the maze.");
  s.writeln("When scrolling text appears, press 'U' to increase the speed and");
  s.writeln("press 'D' to decrease the speed.");

  s.color(15);
  ["rink", "ave", "estore", "agic", "uit", "ints on the game.", "ffects, Sound. (On/Off)"].forEach((rest, i) => {
    s.put(i + 2, 4, rest);
  });

  const key = (await g.pc.keyboard.waitKey()).toUpperCase();
  switch (key) {
    case "M":
      await castFieldSpell(g, maze, g.anchor);
      statusPanel(g);
      break;
    case "D":
      await potionMenu(g);
      statusPanel(g);
      break;
    case "S":
      await saveGame(g, g.anchor);
      break;
    case "R":
      await restoreGame(g, maze);
      break;
    case "Q":
      await quit(g);
      statusPanel(g);
      break;
    case "H":
      await showHints(g);
      statusPanel(g);
      break;
    case "E":
      g.soundOn = !g.soundOn;
      break;
  }
}

async function quit(g: Game) {
  const s = g.screen;
  s.clear();
  s.mode(0);
  s.color(15);
  s.writeln("Are you sure you want to quit? (y/n)");
  const k = await g.pc.keyboard.waitFor("y", "n");
  if (k.toLowerCase() === "y") {
    await highScores(g);
    endProgram();
  }
}
