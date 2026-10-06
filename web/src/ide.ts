// When the game hits a run-time error, show what QuickBASIC 4.0 showed in
// 1995 - version 2.01 only ever ran inside the QB editor - rebuilt from
// M.BAS and laid out cell for cell like a capture of QB.EXE in DOSBox.

import { cp437Byte } from "./dos/cp437";
import type { QBError } from "./dos/errors";
import type { PC } from "./dos/pc";

/** When a program ends, QuickBASIC prints this on the bottom line, in whatever colour was last used. */
export async function pressAnyKey(pc: PC) {
  if (pc.video.mode !== 0) pc.screen.mode(0);
  pc.screen.at(25, 1);
  pc.screen.write("Press any key to continue");
  await pc.keyboard.waitKey();
}

const NORMAL = 0x07, INVERSE = 0x70, MENU = 0x30, HOTKEY = 0x34, STATUS_HI = 0x3f;

export async function showErrorScreen(pc: PC, err: QBError, source: string) {
  const v = pc.video;
  v.setMode(0);
  const put = (row: number, col: number, text: string, attr: number) => {
    for (let i = 0; i < text.length && col + i <= 80; i++) {
      const ch = text[i] === "\0" ? 0 : cp437Byte(text[i]);
      v.text[(row - 1) * 80 + col - 1 + i] = ch | (attr << 8);
    }
    v.dirty = true;
  };
  const paint = (row: number, from: number, to: number, attr: number) => {
    for (let c = from; c <= to; c++) {
      const i = (row - 1) * 80 + c - 1;
      v.text[i] = (v.text[i] & 0xff) | (attr << 8);
    }
  };

  const lines = source.split(/\r?\n/);
  const { title, start, end } = locate(lines, err.line);
  const errorLine = err.line ?? start;
  const cursorLine = errorLine - start + 1;
  // The procedure is shown from its first line if the error is on its first screen;
  // otherwise the failing line is the fifth one visible.
  const top = cursorLine > 18 ? errorLine - 4 : start;
  const errorRow = 3 + errorLine - top;

  // Menu bar
  put(1, 1, "  File  Edit  View  Search  Run  Debug  Calls                          F1=Help  ", MENU);
  paint(1, 1, 1, 0x40);
  for (const c of [3, 9, 15, 21, 29, 34, 41, 75]) paint(1, c, c, HOTKEY);

  // Editor window
  const name = ` ${title} `;
  put(2, 1, "┌" + "─".repeat(74) + "┤\x18├─┐", NORMAL);
  put(2, 40 - Math.floor(name.length / 2), name, INVERSE);
  paint(2, 77, 77, INVERSE);
  for (let row = 3; row <= 20; row++) {
    const n = top + row - 3;
    const text = n <= end ? (lines[n - 1] ?? "") : "";
    put(row, 1, "│" + text.slice(0, 78).padEnd(78), NORMAL);
    put(row, 80, row === 3 ? "\x18" : row === 20 ? "\x19" : "▒", INVERSE);
    if (n === errorLine) {
      const indent = text.length - text.trimStart().length;
      const token = text.trimStart().match(/^[^\s(]+/)?.[0] ?? "";
      paint(row, 2 + indent, 1 + indent + token.length, INVERSE);
    }
  }
  const total = Math.max(1, end - start + 1);
  put(4 + Math.min(15, Math.floor(((cursorLine - 1) * 16) / total)), 80, "▓", INVERSE);
  put(21, 1, "│", NORMAL);
  put(21, 2, "\x1b▓" + "▒".repeat(75) + "\x1a", INVERSE);
  put(21, 80, "│", NORMAL);

  // Immediate window
  put(22, 1, "├" + "─".repeat(78) + "┤", NORMAL);
  put(22, 35, " Immediate ", NORMAL);
  put(23, 1, "│" + " ".repeat(78) + "│", NORMAL);
  put(24, 1, "│" + " ".repeat(78) + "│", NORMAL);

  // Status bar
  const where = `N ${String(cursorLine).padStart(5, "0")}:001 `;
  put(25, 1, ` Main:\0M.BAS          Context:\0${title}`.padEnd(80 - where.length) + where, MENU);
  paint(25, 65, 70, STATUS_HI);

  // The error box, sized to the message: mid-screen, or lower down if it would hide the failing line.
  const width = err.message.length + 4;
  const left = 41 - Math.floor(width / 2);
  const inner = width - 2;
  const pad = (s: string) => {
    const l = Math.floor((inner - s.length) / 2);
    return "│" + " ".repeat(l) + s + " ".repeat(inner - l - s.length) + "│";
  };
  const box = ["┌" + "─".repeat(inner) + "┐", pad(""), pad(err.message), pad(""), pad("╔════╗"), pad("║ OK ║"), pad("╚════╝"), "└" + "─".repeat(inner) + "┘"];
  const boxTop = errorRow >= 9 && errorRow <= 16 ? 17 : 9;
  box.forEach((text, i) => put(boxTop + i, left, text, INVERSE));

  v.cursorVisible = false;
  await pc.keyboard.waitKey();
}

/** The SUB containing a line, or the module-level code (everything before the first SUB). */
function locate(lines: string[], line?: number) {
  const firstSub = lines.findIndex((l) => /^SUB\s/i.test(l.trim()));
  const moduleLevel = { title: "M.BAS", start: 1, end: firstSub < 0 ? lines.length : firstSub };
  if (line === undefined) return moduleLevel;
  for (let i = line; i >= 1; i--) {
    const t = lines[i - 1]?.trim() ?? "";
    if (/^END SUB\b/i.test(t) && i < line) break;
    const m = t.match(/^SUB\s+(\w+)/i);
    if (m) {
      let end = i;
      while (end < lines.length && !/^END SUB\b/i.test(lines[end - 1].trim())) end++;
      return { title: `M.BAS:${m[1].toUpperCase()}`, start: i, end };
    }
  }
  return moduleLevel;
}
