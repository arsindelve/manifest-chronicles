// The BIOS keyboard buffer: up to 15 keystrokes, read one at a time.
// Keys are DOS characters: "a", "8", "\r" (Enter), "\b" (Backspace), "\x1b" (Esc).

import { ProgramStopped } from "./errors";

export class Keyboard {
  private buffer: string[] = [];
  private waiters: Array<() => void> = [];
  private lastYield = 0;
  /** Bumped when the program is restarted; stale waits then stop instead of resuming. */
  generation = 0;

  push(key: string) {
    if (this.buffer.length < 15) this.buffer.push(key);
    const waiters = this.waiters;
    this.waiters = [];
    waiters.forEach((wake) => wake());
  }

  clear() {
    this.buffer = [];
  }

  /**
   * Take a key if one is waiting, else "" (like INKEY$). Polling loops call this
   * constantly, so it only hands control back to the browser every few
   * milliseconds - often enough to keep the page responsive and the screen
   * updating, rarely enough that polling stays fast.
   */
  async poll(): Promise<string> {
    const gen = this.generation;
    const now = performance.now();
    if (!this.buffer.length && now - this.lastYield > 6) {
      await this.nextKeyOrFrame();
      this.lastYield = performance.now();
    }
    if (gen !== this.generation) throw new ProgramStopped();
    return this.buffer.shift() ?? "";
  }

  /** Wait for any key and return it. */
  async waitKey(): Promise<string> {
    for (;;) {
      const k = await this.poll();
      if (k) return k;
    }
  }

  /** Wait for one of the given keys (case-insensitive) and return it as typed. */
  async waitFor(...keys: string[]): Promise<string> {
    const want = keys.map((k) => k.toLowerCase());
    for (;;) {
      const k = await this.waitKey();
      if (want.includes(k.toLowerCase())) return k;
    }
  }

  markYield() {
    this.lastYield = performance.now();
  }

  private nextKeyOrFrame(): Promise<void> {
    return new Promise((resolve) => {
      const done = () => {
        clearTimeout(timer);
        this.waiters = this.waiters.filter((w) => w !== done);
        resolve();
      };
      const timer = setTimeout(done, 16);
      this.waiters.push(done);
    });
  }
}
