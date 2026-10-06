// BASIC's sequential text files: values separated by commas or line breaks,
// numbers written " 42 ", strings bare (or quoted to hold commas). This is
// the format of every data file, save game and the high-score table.

import { QBError } from "./errors";
import { parseNumber, printed } from "./format";

export class TextReader {
  private pos = 0;

  constructor(private text: string) {}

  number(): number {
    const t = this.text;
    while (this.pos < t.length && " \t\r\n".includes(t[this.pos])) this.pos++;
    this.checkEnd();
    const start = this.pos;
    while (this.pos < t.length && !" \t,\r\n".includes(t[this.pos])) this.pos++;
    const n = parseNumber(t.slice(start, this.pos));
    this.skipSeparator();
    return n;
  }

  /** A string field. Leading spaces are skipped, but an empty line reads as "". */
  string(): string {
    const t = this.text;
    while (this.pos < t.length && (t[this.pos] === " " || t[this.pos] === "\t")) this.pos++;
    this.checkEnd();
    let s: string;
    if (t[this.pos] === '"') {
      const end = t.indexOf('"', this.pos + 1);
      s = t.slice(this.pos + 1, end < 0 ? t.length : end);
      this.pos = end < 0 ? t.length : end + 1;
    } else {
      const start = this.pos;
      while (this.pos < t.length && !",\r\n".includes(t[this.pos])) this.pos++;
      s = t.slice(start, this.pos).replace(/[ \t]+$/, "");
    }
    this.skipSeparator();
    return s;
  }

  private checkEnd() {
    if (this.pos >= this.text.length || this.text[this.pos] === "\x1a") throw new QBError(62);
  }

  private skipSeparator() {
    const t = this.text;
    while (t[this.pos] === " " || t[this.pos] === "\t") this.pos++;
    if (t[this.pos] === ",") this.pos++;
    else if (t[this.pos] === "\r") this.pos += t[this.pos + 1] === "\n" ? 2 : 1;
    else if (t[this.pos] === "\n") this.pos++;
  }
}

export class TextWriter {
  text = "";
  private col = 1;

  /** One value per line, as `PRINT #n, value`. */
  line(value: string | number) {
    this.add(typeof value === "number" ? printed(value) : value);
    this.end();
  }

  /** Several values on one line, each starting a 14-column zone and separated by commas. */
  record(...values: Array<string | number>) {
    values.forEach((v, i) => {
      if (i > 0) {
        this.add(" ".repeat((Math.floor((this.col - 1) / 14) + 1) * 14 + 1 - this.col));
        this.add(",");
      }
      this.add(typeof v === "number" ? printed(v) : v);
    });
    this.end();
  }

  private add(s: string) {
    this.text += s;
    this.col += s.length;
  }

  private end() {
    this.text += "\r\n";
    this.col = 1;
  }
}
