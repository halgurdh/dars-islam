const DEADZONE = 0.15;
const AXIS_THRESHOLD = 0.5;

export const GP = {
  A: 0, B: 1, X: 2, Y: 3,
  LB: 4, RB: 5, LT: 6, RT: 7,
  SELECT: 8, START: 9,
  L3: 10, R3: 11,
  UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15,
} as const;

class GamepadPoller {
  private curr:      boolean[] = [];
  private prev:      boolean[] = [];
  private currAxes:  number[]  = [];
  private prevAxes:  number[]  = [];

  private active(): Gamepad | null {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    for (const p of navigator.getGamepads()) {
      if (p?.connected) return p;
    }
    return null;
  }

  tick(): void {
    const gp     = this.active();
    this.prev      = this.curr;
    this.prevAxes  = this.currAxes;
    this.curr      = gp ? Array.from(gp.buttons, b => b.pressed) : [];
    this.currAxes  = gp ? Array.from(gp.axes)                    : [];
  }

  connected(): boolean { return this.active() !== null; }
  pressed(btn: number): boolean { return this.curr[btn] ?? false; }
  justPressed(btn: number): boolean { return (this.curr[btn] ?? false) && !(this.prev[btn] ?? false); }
  value(btn: number): number { return this.active()?.buttons[btn]?.value ?? 0; }

  axis(i: number): number {
    const v = this.currAxes[i] ?? 0;
    return Math.abs(v) > DEADZONE ? v : 0;
  }

  /** True on the frame the axis crosses ±AXIS_THRESHOLD (rising-edge, d-pad style). */
  axisCrossed(i: number, dir: 1 | -1): boolean {
    const prev = this.prevAxes[i] ?? 0;
    const curr = this.currAxes[i] ?? 0;
    return dir > 0
      ? curr >  AXIS_THRESHOLD && prev <=  AXIS_THRESHOLD
      : curr < -AXIS_THRESHOLD && prev >= -AXIS_THRESHOLD;
  }
}

export const gamepad = new GamepadPoller();
