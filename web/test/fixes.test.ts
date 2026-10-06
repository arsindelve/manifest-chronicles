// Checks for 1995 bugs fixed on this branch that the playthroughs don't pin down directly.

import { expect, it } from "vitest";
import { loadGameData } from "../src/game/data";
import { Cell, Maze } from "../src/game/maze";
import { restoreGame } from "../src/game/records";
import { Game } from "../src/game/state";
import { footer } from "../src/game/ui";
import { makePC, screenLines } from "./headless";

function newGame() {
  const pc = makePC();
  return new Game(pc, loadGameData(pc));
}

it("drawing the footer leaves your position and the cursor alone", () => {
  const g = newGame();
  g.anchor = { row: 20, col: 30 };
  g.screen.at(7, 12);
  footer(g);
  expect(g.anchor).toEqual({ row: 20, col: 30 });
  expect([g.screen.row, g.screen.col]).toEqual([7, 12]);
});

it("level 4 doesn't inherit level 3's staircases", () => {
  const direct = newGame();
  const viaLevel3 = newGame();
  const a = new Maze();
  const b = new Maze();
  b.load(viaLevel3, 3);
  direct.rng.seed = viaLevel3.rng.seed;
  a.load(direct, 4);
  b.load(viaLevel3, 4);
  for (let row = 0; row <= 55; row++)
    for (let col = 0; col <= 55; col++) expect(b.at({ row, col })).toBe(a.at({ row, col }));
});

it("everything off the map counts as rock", () => {
  const maze = new Maze();
  expect(maze.peek({ row: -8, col: 4 })).toBe(Cell.Wall);
  expect(maze.peek({ row: 4, col: 60 })).toBe(Cell.Wall);
});

it("restoring with no saves says so instead of stopping", async () => {
  const g = newGame();
  const restored = restoreGame(g, new Maze());
  await new Promise((r) => setTimeout(r, 20));
  expect(screenLines(g.pc).join("\n")).toContain("There are no saved games.");
  g.pc.keyboard.push(" ");
  expect(await restored).toBe(false);
});
