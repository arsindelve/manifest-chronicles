// Time as the game experienced it. Delays were empty FOR...NEXT loops, so
// their length depended on the PC; sounds blocked until they finished. Both
// advance one virtual clock, and we only actually sleep once we're more than
// a frame ahead, which keeps runs of tiny delays (a 4 ms note sweep) accurate.

import { ProgramStopped } from "./errors";
import type { Keyboard } from "./keyboard";
import type { Speaker } from "./speaker";

/** Empty-loop iterations per millisecond: roughly a 486 running QuickBASIC. */
export const LOOPS_PER_MS = 120;

/** The PC timer ticks 18.2 times a second; SOUND durations are in ticks. */
const MS_PER_TICK = 1000 / 18.2065;

export class Clock {
  private virtual = 0;
  /** 1 = real time; 0 skips delays entirely (headless tests). */
  timeScale = 1;

  constructor(private keyboard: Keyboard, private speaker: Speaker) {}

  async wait(ms: number) {
    ms *= this.timeScale;
    if (ms <= 0) return;
    const gen = this.keyboard.generation;
    const now = performance.now();
    this.virtual = Math.max(this.virtual, now) + ms;
    const ahead = this.virtual - now;
    if (ahead > 12) {
      await new Promise((r) => setTimeout(r, ahead));
      this.keyboard.markYield();
    }
    if (gen !== this.keyboard.generation) throw new ProgramStopped();
  }

  /** A busy-wait loop of `iterations` empty passes. */
  spin(iterations: number) {
    return this.wait(iterations / LOOPS_PER_MS);
  }

  /** SOUND: play a PC-speaker tone and wait for it to finish. */
  async beep(freq: number, ticks: number) {
    const ms = ticks * MS_PER_TICK;
    this.speaker.tone(freq, Math.max(this.virtual, performance.now()), ms);
    await this.wait(ms);
  }

  /** A falling sweep, the game's hit sound. */
  async hitSound() {
    for (let f = 300; f >= 40; f -= 5) await this.beep(f, 0.065);
  }

  /** Four rising sweeps, played for every successful utility spell. */
  async spellSound() {
    for (let i = 0; i < 4; i++) for (let f = 37; f <= 1000; f += 65) await this.beep(f, 0.5);
  }

  /** Five falling buzzes when a monster casts a spell. */
  async monsterSpellSound() {
    for (let i = 0; i < 5; i++) for (let f = 150; f >= 40; f -= 20) await this.beep(f, 0.25);
  }

  /** The footstep tick after every move. */
  async stepSound() {
    await this.beep(37, 0.25);
    await this.beep(37, 0.75);
  }
}
