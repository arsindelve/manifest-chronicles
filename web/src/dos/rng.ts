/**
 * QuickBASIC 4.0's RND: a 24-bit linear congruential generator starting
 * from seed 5 (later QBasic versions start elsewhere, at 327680). The game
 * never calls RANDOMIZE; its variety comes from the title screen, which
 * keeps calling RND while it waits for a key.
 */
export class QBRandom {
  /** The generator's 24-bit state (exposed so tests can line up with a recorded game). */
  seed = 5;

  /** A number in [0, 1). The first value from a fresh generator is .7107346. */
  next(): number {
    this.seed = (this.seed * 16598013 + 12820163) % 16777216;
    return this.seed / 16777216;
  }

  /** INT(RND * n) + 1: a whole number from 1 to n. */
  roll(n: number): number {
    return Math.floor(this.next() * n) + 1;
  }

  /** INT(RND * n): a whole number from 0 to n - 1 (n may be 0 or negative, as in the original maths). */
  below(n: number): number {
    return Math.floor(this.next() * n);
  }
}
