// The machine the game runs on: screen, keyboard, speaker, clock, disk, RND.

import { Clock } from "./clock";
import { Disk, dosMatch } from "./disk";
import { QBError } from "./errors";
import { Keyboard } from "./keyboard";
import { QBRandom } from "./rng";
import { Speaker } from "./speaker";
import { Terminal } from "./terminal";
import { TextReader, TextWriter } from "./textfile";
import { Video } from "./video";

export class PC {
  readonly keyboard = new Keyboard();
  readonly speaker = new Speaker();
  readonly video: Video;
  readonly screen: Terminal;
  readonly clock: Clock;
  rng = new QBRandom();
  /** Where the game lived, as recorded in its 1995 object file; FILES lists it. */
  currentDir = "C:\\SKULE\\QUICKBAS";
  bytesFree = 31424512;

  constructor(
    font: Uint8Array,
    readonly disk: Disk,
  ) {
    this.video = new Video(font);
    this.screen = new Terminal(this.video, this.keyboard);
    this.clock = new Clock(this.keyboard, this.speaker);
  }

  /** Power-cycle: stop whatever is running and return to a blank text screen. */
  reset() {
    this.keyboard.generation++;
    this.keyboard.clear();
    this.video.setMode(0);
    this.video.cursorVisible = false;
    this.screen.fg = 7;
    this.screen.row = this.screen.col = 1;
    this.rng = new QBRandom();
  }

  readFile(name: string) {
    return new TextReader(this.disk.read(name));
  }

  writeFile(name: string, fill: (w: TextWriter) => void) {
    const w = new TextWriter();
    fill(w);
    this.disk.write(name, w.text);
  }

  /** FILES spec: QB's directory listing, four 18-column names per line. */
  listFiles(spec: string) {
    const names = this.disk.list().filter((n) => dosMatch(spec, n));
    if (!names.length) throw new QBError(53);
    const s = this.screen;
    s.writeln(this.currentDir);
    names.forEach((n, i) => {
      const [base, ext = ""] = n.split(".");
      const entry = `${base.padEnd(8)}.${ext.padEnd(3)}`;
      if (i % 4 === 3 || i === names.length - 1) s.writeln(entry);
      else s.write(entry + "      ");
    });
    s.writeln(` ${this.bytesFree} Bytes free`); // a long integer, not a single
  }
}
