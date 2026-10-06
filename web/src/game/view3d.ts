// The first-person corridor view, 450x450 in the top-left of the screen.
//
// It's built from nested squares, one per step of depth: a wall-coloured
// square, then a black opening inside it if the passage continues, with
// black notches on either side where a side passage opens. Black lines from
// the screen corners to the deepest opening give the perspective. The
// drawing order matters for the final pixels, so it follows the original.

import { add, Cell, rightOf, type Maze } from "./maze";
import type { Game } from "./state";

type Box = readonly [number, number, number, number];

interface Frame {
  /** The wall square at this depth. */
  wall: Box;
  /** The opening inside it when the corridor continues. */
  opening: Box;
  /** Notches marking side passages (only for the nearest six steps). */
  right?: readonly [Box, Box];
  left?: readonly [Box, Box];
}

const FRAMES: readonly Frame[] = [
  { wall: [0, 0, 0, 0], opening: [0, 0, 0, 0] }, // depth 0: the original draws a single pixel here
  { wall: [0, 0, 450, 450], opening: [90, 90, 360, 360], right: [[360, 90, 450, 100], [360, 360, 450, 350]], left: [[90, 90, 0, 100], [90, 360, 0, 350]] },
  { wall: [100, 100, 350, 350], opening: [143, 143, 307, 307], right: [[307, 143, 350, 148], [307, 307, 350, 302]], left: [[143, 143, 100, 148], [143, 307, 100, 302]] },
  { wall: [150, 150, 300, 300], opening: [170, 170, 280, 280], right: [[280, 170, 300, 174], [280, 280, 300, 276]], left: [[170, 170, 148, 174], [170, 280, 148, 276]] },
  { wall: [175, 175, 275, 275], opening: [185, 185, 265, 265], right: [[265, 185, 275, 188], [265, 265, 275, 262]], left: [[185, 185, 174, 188], [185, 265, 174, 262]] },
  { wall: [189, 189, 261, 261], opening: [195, 195, 254, 254], right: [[254, 195, 261, 197], [254, 254, 261, 252]], left: [[195, 195, 185, 197], [195, 254, 185, 252]] },
  { wall: [198, 198, 251, 251], opening: [202, 202, 247, 247], right: [[247, 202, 251, 203], [247, 247, 251, 246]], left: [[202, 202, 195, 203], [202, 247, 195, 246]] },
  { wall: [204, 204, 245, 245], opening: [207, 207, 242, 242] },
  { wall: [208, 208, 241, 241], opening: [210, 210, 239, 239] },
  { wall: [211, 211, 238, 238], opening: [212, 212, 237, 237] },
];

/** Where the perspective lines meet for each depth: [near corner, far corner]. */
const VANISH: readonly (readonly [number, number])[] = [
  [0, 0], [90, 360], [143, 307], [170, 280], [185, 265], [195, 254], [202, 247], [207, 242], [210, 239], [212, 237],
];

export function drawCorridor(g: Game, maze: Maze) {
  const v = g.pc.video;
  const wall = maze.wallColor;
  const ahead = g.step;
  const right = rightOf(g.heading);
  const left = { row: -right.row, col: -right.col };

  for (let depth = 0; depth <= 9; depth++) {
    const f = FRAMES[depth];
    v.box(...f.wall, wall);

    let blocked = false;
    if (depth > 0) {
      const here = add(g.pos, ahead, depth - 1);
      if (maze.at(here) === Cell.Wall) blocked = true;
      else {
        g.viewDepth = depth;
        v.box(...f.opening, 0);
        if (f.right && maze.at(add(here, right)) !== Cell.Wall) f.right.forEach((b) => v.box(...b, 0));
        if (f.left && maze.at(add(here, left)) !== Cell.Wall) f.left.forEach((b) => v.box(...b, 0));
      }
    }

    const [near, far] = VANISH[g.viewDepth];
    v.line(1, 450, near, far, 0);
    v.line(0, 0, near, near, 0);
    v.line(450, 450, far, far, 0);
    v.line(450, 0, far, near, 0);

    if (blocked) break;
  }
}
