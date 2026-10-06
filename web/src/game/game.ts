// Catacombs of Despair II: The Manifest Chronicles - the program.

import type { PC } from "../dos/pc";
import { loadGameData } from "./data";
import { explore } from "./explore";
import { Maze } from "./maze";
import { Game } from "./state";
import { titleScreen } from "./title";

export async function runManifest(pc: PC): Promise<void> {
  const g = new Game(pc, loadGameData(pc));
  const maze = new Maze();
  const s = g.screen;

  await titleScreen(g, maze);

  s.mode(12);
  if (g.map < 1) g.map = 1;
  if (g.isNewCharacter) maze.load(g, g.map);

  // The original read its data files here, announcing each one.
  for (const label of ["Monsters...   ", "Weapons...     ", "Armor...        ", "Spells..."]) s.put(14, 41, label);
  s.clear();

  await explore(g, maze);
}
