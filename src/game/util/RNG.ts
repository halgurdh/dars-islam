/**
 * Small seedable PRNG (mulberry32). Deterministic given a seed, so the
 * full game can be simulated reproducibly in tests.
 */
export class RNG {
  private state: number;

  constructor(seed = Date.now() >>> 0) {
    this.state = seed >>> 0;
  }

  /** Float in [0, 1). */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Simulate a single d6. */
  d6(): number {
    return this.int(1, 6);
  }
}
