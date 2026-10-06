// The PC speaker: a square wave at the requested frequency. Notes are
// scheduled on the audio clock so the game's rapid SOUND sweeps (dozens of
// 4 ms notes) play back smoothly instead of at timer resolution.

export class Speaker {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  enabled = true;

  /** Browsers only allow audio after a user gesture; call this from one. */
  unlock() {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.06;
        this.gain.connect(this.ctx.destination);
      } catch {
        this.ctx = null;
      }
    }
    void this.ctx?.resume();
  }

  /** Play `freq` Hz starting at performance.now()-time `at` for `ms` milliseconds. */
  tone(freq: number, at: number, ms: number) {
    const ctx = this.ctx;
    if (!ctx || !this.gain || !this.enabled || ms <= 0) return;
    const start = ctx.currentTime + Math.max(0, (at - performance.now()) / 1000);
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;
    osc.connect(this.gain);
    osc.start(start);
    osc.stop(start + ms / 1000);
  }
}
