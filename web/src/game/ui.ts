// Screen pieces shared across the game.

import { atLine } from "../dos/errors";
import { parseNumber } from "../dos/format";
import type { Game } from "./state";

/**
 * The "Manifest Chronicles v2.01" footer. Afterwards the original tries to
 * put the cursor back but swaps row and column, and it stores the cursor in
 * the game's saved-position variables - see Game.anchor. Both are kept.
 */
export function footer(g: Game) {
  const s = g.screen;
  const col = Math.min(s.col, 80),
    row = s.row;
  g.anchor = { row: col, col: row };
  s.put(25, 28, "Manifest Chronicles v2.01", 1);
  atLine(1289, () => {
    s.at(col, row);
  });
}

/** Draw a horizontal run of one character from column a to b on a row. */
export function hline(g: Game, row: number, a: number, b: number, ch: string) {
  for (let c = a; c <= b; c++) g.screen.put(row, c, ch);
}

/** Draw a vertical run of one character from row a to b in a column. */
export function vline(g: Game, col: number, a: number, b: number, ch: string) {
  for (let r = a; r <= b; r++) g.screen.put(r, col, ch);
}

/**
 * Type out a story or hint file a character at a time. Each line starts with
 * a two-digit colour; "/" stands for a comma (commas would split BASIC's
 * input) and "Ç" waits for a key. U and D change the speed as it types.
 */
export async function typeOut(g: Game, file: string, delay: number, line?: number) {
  const s = g.screen;
  const f = line ? atLine(line, () => g.pc.readFile(file)) : g.pc.readFile(file);
  const lines: string[] = [];
  for (let line = f.string(); line !== "EOD"; line = f.string()) lines.push(line);

  for (const line of lines) {
    const color = parseNumber(line.slice(0, 2));
    s.color(color === 0 ? 7 : color);
    // Skip the two-digit colour: the slice drops the first digit, the loop starts past the second.
    const text = line.slice(1, 81);
    for (let i = 1; i < text.length; i++) {
      const ch = text[i];
      if (ch === "Ç") await g.pause();
      else s.write(ch === "/" ? "," : ch);
      const k = await g.pc.keyboard.poll();
      if (k === "U" || k === "u") delay -= 50;
      if (k === "D" || k === "d") delay += 50;
      await g.clock.spin(delay);
    }
    s.writeln();
  }
}
