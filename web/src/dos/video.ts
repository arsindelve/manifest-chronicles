// VGA video emulation for the two modes the game uses:
//   SCREEN 0  - 80x25 text, rendered at the VGA's native 720x400 (9x16 cells)
//   SCREEN 12 - 640x480 16-colour graphics, text drawn with the 8x16 font
// Everything is drawn into an indexed framebuffer first, then converted to
// RGB with the default VGA palette, so the canvas holds exactly the pixels a
// VGA card would put on screen.

// prettier-ignore
export const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [0x00, 0x00, 0x00], [0x00, 0x00, 0xaa], [0x00, 0xaa, 0x00], [0x00, 0xaa, 0xaa],
  [0xaa, 0x00, 0x00], [0xaa, 0x00, 0xaa], [0xaa, 0x55, 0x00], [0xaa, 0xaa, 0xaa],
  [0x55, 0x55, 0x55], [0x55, 0x55, 0xff], [0x55, 0xff, 0x55], [0x55, 0xff, 0xff],
  [0xff, 0x55, 0x55], [0xff, 0x55, 0xff], [0xff, 0xff, 0x55], [0xff, 0xff, 0xff],
];

export type Mode = 0 | 12;

export class Video {
  mode: Mode = 0;
  cols = 80;
  rows = 25;
  /** Text mode cells: low byte = CP437 character, high byte = attribute. */
  text = new Uint16Array(80 * 25);
  /** Mode 12 pixels, one palette index per pixel. */
  pixels = new Uint8Array(640 * 480);
  cursorVisible = false;
  cursorRow = 1;
  cursorCol = 1;
  dirty = true;

  constructor(private font: Uint8Array) {
    this.clear();
  }

  get width() {
    return this.mode === 0 ? 720 : 640;
  }
  get height() {
    return this.mode === 0 ? 400 : 480;
  }

  setMode(mode: Mode) {
    this.mode = mode;
    this.rows = mode === 0 ? 25 : 30;
    this.clear();
  }

  clear() {
    this.text.fill(0x0720);
    this.pixels.fill(0);
    this.dirty = true;
  }

  /** Put one character at a 1-based row/column with the given colour. */
  putChar(row: number, col: number, ch: number, fg: number, bg = 0) {
    if (this.mode === 0) {
      this.text[(row - 1) * 80 + (col - 1)] = (ch & 0xff) | (((bg << 4) | fg) << 8);
    } else {
      const x0 = (col - 1) * 8;
      const y0 = (row - 1) * 16;
      for (let y = 0; y < 16; y++) {
        const bits = this.font[ch * 16 + y];
        const o = (y0 + y) * 640 + x0;
        for (let x = 0; x < 8; x++) this.pixels[o + x] = bits & (0x80 >> x) ? fg : bg;
      }
    }
    this.dirty = true;
  }

  /** Scroll rows top..bottom (1-based, inclusive) up by one line. */
  scrollUp(top: number, bottom: number) {
    if (this.mode === 0) {
      this.text.copyWithin((top - 1) * 80, top * 80, bottom * 80);
      this.text.fill(0x0720, (bottom - 1) * 80, bottom * 80);
    } else {
      this.pixels.copyWithin((top - 1) * 16 * 640, top * 16 * 640, bottom * 16 * 640);
      this.pixels.fill(0, (bottom - 1) * 16 * 640, bottom * 16 * 640);
    }
    this.dirty = true;
  }

  pset(x: number, y: number, c: number) {
    if (x >= 0 && x < 640 && y >= 0 && y < 480) this.pixels[y * 640 + x] = c;
  }

  /** LINE (x1,y1)-(x2,y2),c,BF */
  box(x1: number, y1: number, x2: number, y2: number, c: number) {
    const xa = Math.max(0, Math.min(x1, x2)),
      xb = Math.min(639, Math.max(x1, x2));
    const ya = Math.max(0, Math.min(y1, y2)),
      yb = Math.min(479, Math.max(y1, y2));
    for (let y = ya; y <= yb; y++) this.pixels.fill(c, y * 640 + xa, y * 640 + xb + 1);
    this.dirty = true;
  }

  /**
   * LINE (x1,y1)-(x2,y2),c
   * QuickBASIC 4.0 always draws left to right, starts the Bresenham error
   * term at a quarter of the major axis (rounded up) and steps the minor axis
   * when it reaches zero. Fitted to lines drawn by QB.EXE in DOSBox; this
   * reproduces them, and the game's 3D view, pixel for pixel.
   */
  line(x1: number, y1: number, x2: number, y2: number, c: number) {
    if (x1 > x2) [x1, y1, x2, y2] = [x2, y2, x1, y1];
    const dx = x2 - x1,
      dy = Math.abs(y2 - y1),
      sy = y2 >= y1 ? 1 : -1;
    const xMajor = dx >= dy;
    const major = xMajor ? dx : dy,
      minor = xMajor ? dy : dx;
    let e = Math.ceil(major / 4),
      x = x1,
      y = y1;
    for (let i = 0; i <= major; i++) {
      this.pset(x, y, c);
      e -= minor;
      if (e <= 0) {
        e += major;
        if (xMajor) y += sy;
        else x += 1;
      }
      if (xMajor) x += 1;
      else y += sy;
    }
    this.dirty = true;
  }

  /** Render the current frame into RGBA. blinkOn controls the text cursor. */
  render(out: ImageData, blinkOn: boolean) {
    const d = out.data;
    if (this.mode === 12) {
      for (let i = 0, p = 0; i < 640 * 480; i++, p += 4) {
        const c = PALETTE[this.pixels[i]];
        d[p] = c[0];
        d[p + 1] = c[1];
        d[p + 2] = c[2];
        d[p + 3] = 255;
      }
      return;
    }
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 80; col++) {
        const cell = this.text[row * 80 + col];
        const ch = cell & 0xff,
          attr = cell >> 8;
        const fg = PALETTE[attr & 0x0f],
          bg = PALETTE[(attr >> 4) & 0x07];
        // VGA line-graphics: characters C0-DF repeat their 8th column in the 9th.
        const lineGraphic = ch >= 0xc0 && ch <= 0xdf;
        const isCursor = blinkOn && this.cursorVisible && row === this.cursorRow - 1 && col === this.cursorCol - 1;
        for (let y = 0; y < 16; y++) {
          let bits = this.font[ch * 16 + y];
          if (isCursor && y >= 14) bits = 0xff;
          const ninth = isCursor && y >= 14 ? 1 : lineGraphic ? bits & 1 : 0;
          let p = ((row * 16 + y) * 720 + col * 9) * 4;
          for (let x = 0; x < 9; x++, p += 4) {
            const on = x < 8 ? bits & (0x80 >> x) : ninth;
            const c = on ? fg : bg;
            d[p] = c[0];
            d[p + 1] = c[1];
            d[p + 2] = c[2];
            d[p + 3] = 255;
          }
        }
      }
    }
  }
}
