// The catacombs: four 50x50 levels loaded from MAP.1 - MAP.4.

import { atLine, QBError } from "../dos/errors";
import type { Game, Heading, Point } from "./state";

export const enum Cell {
  Open = 0,
  Wall = 1,
  Stairs = 2,
  Story = 3,
  Exit = 4,
}

/** The grid spans 0..55 in both directions; the map file fills 1..50. */
const SIZE = 55;

export class Maze {
  private cells: Cell[][] = Array.from({ length: SIZE + 1 }, () => new Array<Cell>(SIZE + 1).fill(Cell.Open));
  /** Staircase squares on the level being loaded. */
  private stairs: Point[] = [];
  wallColor = 8;

  at(p: Point): Cell {
    return this.cells[check(p.row)][check(p.col)];
  }

  /** The cell at p, with everything off the grid counting as rock. */
  peek(p: Point): Cell {
    const inside = (i: number) => i >= 0 && i <= SIZE;
    return inside(p.row) && inside(p.col) ? this.cells[p.row][p.col] : Cell.Wall;
  }

  set(p: Point, v: Cell) {
    this.cells[check(p.row)][check(p.col)] = v;
  }

  /** Load a level, showing "Loading Map..." with a dot every ten rows. */
  load(g: Game, level: number) {
    const s = g.screen;
    s.mode(12);
    s.clear();
    s.at(14, 33);
    s.write("Loading Map...");

    const f = atLine(1173, () => g.pc.readFile(`MAP.${level % 10}`));
    let found = 0;
    this.stairs = [];
    for (let row = 1; row <= 50; row++) {
      if (row % 10 === 0) s.write(".");
      for (let col = 1; col <= 50; col++) {
        // The map files hold Cell values as plain numbers.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment, @typescript-eslint/no-unnecessary-type-assertion
        const v: Cell = f.number() as Cell;
        this.cells[row][col] = v;
        if (v === Cell.Stairs) this.stairs[++found] = { row, col };
      }
    }

    // Only one of the ten staircases is real; the rest become floor.
    const keep = g.rng.roll(10);
    for (let i = 1; i <= 10; i++) {
      const stairs = this.stairs[i] as Point | undefined; // map 4 has none
      if (stairs && i !== keep) this.set(stairs, Cell.Open);
    }

    this.wallColor = level <= 3 ? 8 : 4;
  }
}

function check(i: number) {
  if (!(i >= 0 && i <= SIZE)) throw new QBError(9);
  return i;
}

/** One step forward for each heading (north is up the map file). */
export function forward(h: Heading): Point {
  return { 0: { row: -1, col: 0 }, 90: { row: 0, col: 1 }, 180: { row: 1, col: 0 }, 270: { row: 0, col: -1 } }[h];
}

/** One step to the right of each heading. */
export function rightOf(h: Heading): Point {
  return forward(((h + 90) % 360) as Heading);
}

export const turnLeft = (h: Heading) => ((h + 270) % 360) as Heading;
export const turnRight = (h: Heading) => ((h + 90) % 360) as Heading;

export const add = (p: Point, d: Point, n = 1): Point => ({ row: p.row + d.row * n, col: p.col + d.col * n });

export const HEADING_NAMES: Record<Heading, string> = { 0: "North   ", 90: "East   ", 180: "South   ", 270: "West   " };
