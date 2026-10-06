// Text output and line input on the VGA screen, following the QuickBASIC 4.0
// rules the original layouts depend on (all measured in DOSBox):
//  - a string or number that doesn't fit on the current line moves to the
//    next line whole; printing up to column 80 wraps lazily, so a full line
//    followed by a newline doesn't leave a blank line
//  - numbers print as " 42 " (sign or space before, a space after)
//  - commas advance to 14-column print zones
//  - the bottom line (25 in text mode, 30 in graphics) is outside the
//    scrolling area: newlines there scroll the lines above it
//  - fractional cursor positions round half to even
//  - bad numeric input gets "Redo from start" and the prompt again

import { cp437Byte } from "./cp437";
import { QBError } from "./errors";
import { isNumeric, parseNumber, printed, roundHalfEven } from "./format";
import type { Keyboard } from "./keyboard";
import { Video, type Mode } from "./video";

export type Part = string | number;

export class Terminal {
  fg = 7;
  row = 1;
  col = 1;

  constructor(readonly video: Video, private keyboard: Keyboard) {}

  get rows() {
    return this.video.rows;
  }

  /** Switch video mode (clears the screen). Switching to the current mode does nothing. */
  mode(mode: Mode) {
    if (mode === this.video.mode) return;
    this.video.setMode(mode);
    this.fg = mode === 0 ? 7 : 15;
    this.row = this.col = 1;
  }

  clear() {
    this.video.clear();
    this.row = this.col = 1;
  }

  color(fg: number) {
    const c = roundHalfEven(fg);
    if (c < 0 || c > (this.video.mode === 0 ? 31 : 15)) throw new QBError(5);
    this.fg = c;
  }

  /** Move the cursor. Positions may be fractional (centring maths); they round half to even. */
  at(row: number, col?: number) {
    const r = roundHalfEven(row);
    if (r < 1 || r > this.rows) throw new QBError(5);
    this.row = r;
    if (col !== undefined) {
      const c = roundHalfEven(col);
      if (c < 1 || c > 80) throw new QBError(5);
      this.col = c;
    }
  }

  /** Print parts and stay on the line. */
  write(...parts: Part[]) {
    for (const p of parts) this.emit(typeof p === "number" ? printed(p) : p);
  }

  /** Print parts, then start a new line. */
  writeln(...parts: Part[]) {
    this.write(...parts);
    this.newline();
  }

  /** Position, colour and print a line in one go. */
  put(row: number, col: number, text: Part, color?: number) {
    if (color !== undefined) this.color(color);
    this.at(row, col);
    this.writeln(text);
  }

  /** Move to column n, starting a new line if already past it. */
  tab(n: number) {
    let c = roundHalfEven(n);
    if (c < 1) c = 1;
    if (this.col > c) this.newline();
    while (this.col < c) this.putChar(" ");
  }

  /** Advance to the next 14-column print zone. */
  zone() {
    const next = (Math.floor((this.col - 1) / 14) + 1) * 14 + 1;
    if (next > 71) this.newline();
    else while (this.col < next) this.putChar(" ");
  }

  newline() {
    this.col = 1;
    const bottom = this.rows - 1;
    if (this.row < bottom) this.row++;
    else {
      this.video.scrollUp(1, bottom);
      this.row = bottom;
    }
  }

  private putChar(ch: string) {
    if (this.col > 80) this.newline();
    this.video.putChar(this.row, this.col, cp437Byte(ch), this.fg);
    this.col++;
  }

  private emit(s: string) {
    if (this.col > 1 && this.col - 1 + s.length > 80) this.newline();
    for (const ch of s) this.putChar(ch);
  }

  // ---------------------------------------------------------------- input

  /** Let the player type a line, with a blinking cursor, Backspace and Esc. */
  private async readLine(): Promise<string> {
    let text = "";
    const cells: Array<[number, number]> = [];
    const erase = ([row, col]: [number, number]) => {
      this.row = row;
      this.col = col;
      this.video.putChar(row, col, 0x20, this.fg);
    };
    this.video.cursorVisible = true;
    try {
      for (;;) {
        this.video.cursorRow = this.row;
        this.video.cursorCol = Math.min(this.col, 80);
        this.video.dirty = true;
        const k = await this.keyboard.waitKey();
        if (k === "\r") return text;
        if (k === "\b") {
          const cell = cells.pop();
          if (cell) {
            text = text.slice(0, -1);
            erase(cell);
          }
        } else if (k === "\x1b") {
          while (cells.length) erase(cells.pop()!);
          text = "";
        } else if (k.length === 1 && k >= " " && text.length < 255) {
          if (this.col > 80) this.newline();
          cells.push([this.row, this.col]);
          text += k;
          this.putChar(k);
        }
      }
    } finally {
      this.video.cursorVisible = false;
      this.video.dirty = true;
    }
  }

  /** Prompt and read a reply, re-asking with "Redo from start" until `accept` passes. */
  private async ask(prompt: string, accept: (line: string) => boolean): Promise<string> {
    for (;;) {
      this.write(prompt);
      const line = await this.readLine();
      this.newline();
      if (accept(line)) return line;
      this.newline();
      this.writeln("Redo from start");
    }
  }

  /** Read a number. Empty input counts as 0. */
  async inputNumber(prompt = "? "): Promise<number> {
    return parseNumber(await this.ask(prompt, isNumeric));
  }

  /** Read a line of text, trimmed. Commas are refused (they separate values in BASIC). */
  async inputText(prompt = "? "): Promise<string> {
    const line = await this.ask(prompt, (l) => {
      const t = l.trim();
      return t.startsWith('"') ? /^"[^"]*("\s*)?$/.test(t) : !t.includes(",");
    });
    const t = line.trim();
    return t.startsWith('"') ? t.slice(1).replace(/"\s*$/, "") : t;
  }
}
