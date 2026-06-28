import Phaser from 'phaser';
import type { GridCoord } from '../types';
import { gamepad, GP } from '@shared/gamepad';

export type TouchMode = 'battle' | 'world' | 'menu';

// All positions are in 1280×720 canvas-space
const DPAD_CX   = 96;
const DPAD_CY   = 606;
const DPAD_STEP = 50;
const BTN_R     = 34;

const FIRE_X    = 1200;
const FIRE_Y    = 648;
const CUSTOM_X  = 1200;
const CUSTOM_Y  = 568;
const JACKIN_X  = 1200;
const JACKIN_Y  = 648;

const MPREV_X   = 72;
const MPREV_Y   = 665;
const MCANC_X   = 186;
const MCANC_Y   = 665;
const MNEXT_X   = 1208;
const MNEXT_Y   = 665;
const MCONF_X   = 1094;
const MCONF_Y   = 665;

const SWIPE_MIN    = 36;
const DBL_TAP_MS   = 320;
const TAP_MAX_DIST = 22;
const TAP_MAX_DUR  = 380;

export class TouchControls {
  private readonly scene: Phaser.Scene;
  private readonly mode:  TouchMode;

  // Pending gesture results – consumed by scenes each frame
  private _swipe:     GridCoord | null = null;
  private _tap                         = false;
  private _doubleTap                   = false;
  private _jackIn                      = false;
  private _confirm                     = false;
  private _cancel                      = false;
  private _menuNav:   number | null    = null; // -1 or +1

  // Gesture tracking
  private gestureActive    = false;
  private gestureStartX    = 0;
  private gestureStartY    = 0;
  private gestureStartTime = 0;
  private lastTapTime      = 0;
  private onButtonZone     = false;

  // World-mode virtual joystick
  private joystickPID = -1;
  private joystickBX  = 0;
  private joystickBY  = 0;
  private _dpadX      = 0;
  private _dpadY      = 0;

  // True only on actual touch screens — controls whether the Phaser touch UI is built
  private readonly isTouch: boolean;

  // UI references
  private allGfx: Phaser.GameObjects.GameObject[] = [];
  private customBtn:    Phaser.GameObjects.Container | null = null;
  private jackInBtn:    Phaser.GameObjects.Container | null = null;
  private hintPanel:     Phaser.GameObjects.Container | null = null;
  private hintDismissed  = false;
  private hintAutoTimer: Phaser.Time.TimerEvent | null = null;
  private hintFadeTween: Phaser.Tweens.Tween | null = null;

  // Zones to exclude from gesture recognition
  private readonly zones: Array<{ x: number; y: number; r: number }> = [];

  // Card-tap callback used by CustomMenuScene
  onCardTap?: (x: number, y: number) => void;

  constructor(scene: Phaser.Scene, mode: TouchMode) {
    this.scene   = scene;
    this.mode    = mode;
    this.isTouch = window.matchMedia('(pointer: coarse)').matches;
    this.buildUI();
    this.bindInput();
    this.scene.events.on('preupdate', this.gpPoll, this);
  }

  // ── Public consume API ────────────────────────────────────────────

  consumeSwipe(): GridCoord | null {
    const v = this._swipe; this._swipe = null; return v;
  }

  consumeTap(): boolean {
    const v = this._tap; this._tap = false; return v;
  }

  consumeDoubleTap(): boolean {
    const v = this._doubleTap; this._doubleTap = false; return v;
  }

  consumeJackIn(): boolean {
    const v = this._jackIn; this._jackIn = false; return v;
  }

  consumeConfirm(): boolean {
    const v = this._confirm; this._confirm = false; return v;
  }

  consumeCancel(): boolean {
    const v = this._cancel; this._cancel = false; return v;
  }

  consumeMenuNav(): number | null {
    const v = this._menuNav; this._menuNav = null; return v;
  }

  get dpadX(): number { return this._dpadX; }
  get dpadY(): number { return this._dpadY; }

  setCustomButtonActive(visible: boolean): void {
    this.customBtn?.setVisible(visible);
  }

  setJackInButtonVisible(visible: boolean): void {
    this.jackInBtn?.setVisible(visible);
  }

  showHint(): void {
    if (this.hintDismissed || !this.hintPanel) return;
    this.hintPanel.setVisible(true).setAlpha(1);
    this.hintAutoTimer?.remove();
    this.hintFadeTween?.remove();
    this.hintAutoTimer = this.scene.time.delayedCall(6500, () => this.fadeOutHint());
  }

  destroy(): void {
    this.hintAutoTimer?.remove();
    this.hintFadeTween?.remove();
    this.scene.events.off('preupdate', this.gpPoll, this);
    this.scene.input.off('pointerdown', this.handleDown, this);
    this.scene.input.off('pointermove', this.handleMove, this);
    this.scene.input.off('pointerup',   this.handleUp,   this);
    this.scene.input.keyboard?.off('keydown', this.handleKey, this);
    for (const obj of this.allGfx) {
      if ((obj as Phaser.GameObjects.GameObject & { scene?: unknown }).scene) {
        obj.destroy();
      }
    }
    this.allGfx = [];
    this.customBtn = null;
    this.jackInBtn = null;
    this.hintPanel = null;
  }

  // ── Input events ──────────────────────────────────────────────────

  private bindInput(): void {
    this.scene.input.on('pointerdown', this.handleDown, this);
    this.scene.input.on('pointermove', this.handleMove, this);
    this.scene.input.on('pointerup',   this.handleUp,   this);
    this.scene.input.keyboard?.on('keydown', this.handleKey, this);
  }

  private handleKey(): void {
    if (this.hintPanel?.visible) this.fadeOutHint();
  }

  private handleDown(ptr: Phaser.Input.Pointer): void {
    if (this.hintPanel?.visible) {
      this.fadeOutHint();
      return;
    }

    const { x, y } = ptr;

    // Button zones must be checked first — they overlap the joystick area
    this.onButtonZone = this.inZone(x, y);
    if (this.onButtonZone) return;

    // Joystick drag zone (bottom-left), only when no button was hit
    if (this.mode === 'world' && x < 260 && y > 510) {
      this.joystickPID = ptr.id;
      this.joystickBX  = x;
      this.joystickBY  = y;
      this._dpadX = 0;
      this._dpadY = 0;
      return;
    }

    this.gestureActive    = true;
    this.gestureStartX    = x;
    this.gestureStartY    = y;
    this.gestureStartTime = ptr.downTime;
  }

  private handleMove(ptr: Phaser.Input.Pointer): void {
    if (!ptr.isDown || this.mode !== 'world' || ptr.id !== this.joystickPID) return;
    const dx  = ptr.x - this.joystickBX;
    const dy  = ptr.y - this.joystickBY;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 14) {
      this._dpadX = dx / len;
      this._dpadY = dy / len;
    } else {
      this._dpadX = 0;
      this._dpadY = 0;
    }
  }

  private handleUp(ptr: Phaser.Input.Pointer): void {
    if (this.mode === 'world' && ptr.id === this.joystickPID) {
      this.joystickPID = -1;
      this._dpadX = 0;
      this._dpadY = 0;
    }

    if (!this.gestureActive) return;
    this.gestureActive = false;

    const dx   = ptr.upX - this.gestureStartX;
    const dy   = ptr.upY - this.gestureStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dur  = ptr.upTime - this.gestureStartTime;

    if (dist >= SWIPE_MIN) {
      if (this.mode === 'battle') {
        this._swipe = Math.abs(dx) >= Math.abs(dy)
          ? { col: dx > 0 ? 1 : -1, row: 0 }
          : { col: 0, row: dy > 0 ? 1 : -1 };
        return;
      }
      if (this.mode === 'menu' && Math.abs(dx) >= Math.abs(dy)) {
        this._menuNav = dx > 0 ? 1 : -1;
        return;
      }
    }

    if (dist < TAP_MAX_DIST && dur < TAP_MAX_DUR) {
      const now = ptr.upTime;
      if (now - this.lastTapTime < DBL_TAP_MS) {
        this._doubleTap  = true;
        this.lastTapTime = 0;
      } else {
        this.lastTapTime = now;
        if (this.mode === 'menu') {
          this.onCardTap?.(ptr.upX, ptr.upY);
        } else {
          this._tap = true;
        }
      }
    }
  }

  private inZone(x: number, y: number): boolean {
    return this.zones.some((z) => {
      const dx = x - z.x;
      const dy = y - z.y;
      return dx * dx + dy * dy <= z.r * z.r;
    });
  }

  private fadeOutHint(): void {
    if (!this.hintPanel?.visible) return;
    this.hintDismissed = true;
    this.hintAutoTimer?.remove();
    this.hintFadeTween?.remove();
    this.hintFadeTween = this.scene.tweens.add({
      targets:  this.hintPanel,
      alpha:    0,
      duration: 420,
      onComplete: () => this.hintPanel?.setVisible(false),
    });
  }

  // ── Gamepad polling ───────────────────────────────────────────────

  private gpPoll(): void {
    gamepad.tick();
    if (!gamepad.connected()) return;

    if (this.mode === 'battle') {
      if (gamepad.justPressed(GP.LEFT)  || gamepad.axisCrossed(0, -1)) this._swipe = { col: -1, row:  0 };
      if (gamepad.justPressed(GP.RIGHT) || gamepad.axisCrossed(0,  1)) this._swipe = { col:  1, row:  0 };
      if (gamepad.justPressed(GP.UP)    || gamepad.axisCrossed(1, -1)) this._swipe = { col:  0, row: -1 };
      if (gamepad.justPressed(GP.DOWN)  || gamepad.axisCrossed(1,  1)) this._swipe = { col:  0, row:  1 };
    }

    if (this.mode === 'world') {
      const ax = gamepad.axis(0);
      const ay = gamepad.axis(1);
      this._dpadX = ax !== 0 ? ax : (gamepad.pressed(GP.LEFT) ? -1 : gamepad.pressed(GP.RIGHT) ? 1 : 0);
      this._dpadY = ay !== 0 ? ay : (gamepad.pressed(GP.UP)   ? -1 : gamepad.pressed(GP.DOWN)  ? 1 : 0);
    }

    if (gamepad.justPressed(GP.A))                          this._tap       = true;
    if (gamepad.justPressed(GP.Y))                          this._doubleTap = true;
    if (gamepad.justPressed(GP.X) && this.mode === 'world') this._jackIn    = true;

    if (this.mode === 'menu') {
      if (gamepad.justPressed(GP.START) || gamepad.justPressed(GP.A))      this._confirm  = true;
      if (gamepad.justPressed(GP.B)     || gamepad.justPressed(GP.SELECT)) this._cancel   = true;
      if (gamepad.justPressed(GP.LB)    || gamepad.justPressed(GP.LEFT)  ) this._menuNav  = -1;
      if (gamepad.justPressed(GP.RB)    || gamepad.justPressed(GP.RIGHT) ) this._menuNav  =  1;
    }
  }

  // ── UI construction ───────────────────────────────────────────────

  private buildUI(): void {
    if (this.isTouch) {
      if (this.mode === 'battle') {
        this.buildDpad();
        this.buildFireButton();
        this.buildCustomButton();
      } else if (this.mode === 'world') {
        this.buildJoystickZone();
        this.buildDpad();
        this.buildJackInButton();
      } else {
        this.buildMenuButtons();
      }
    }
    this.buildHintPanel();
  }

  private makeButton(
    cx: number, cy: number, r: number,
    label: string, fill: number,
    onDown: () => void,
    onUp?: () => void,
  ): Phaser.GameObjects.Container {
    const c = this.scene.add.container(cx, cy)
      .setScrollFactor(0)
      .setDepth(4800)
      .setInteractive(new Phaser.Geom.Circle(0, 0, r + 4), Phaser.Geom.Circle.Contains);

    const circle = this.scene.add.circle(0, 0, r, fill, 0.72);
    circle.setStrokeStyle(2, 0xffffff, 0.4);

    const text = this.scene.add.text(0, 0, label, {
      fontFamily: 'Segoe UI',
      fontSize:   `${Math.floor(r * (label.includes('\n') ? 0.42 : 0.58))}px`,
      fontStyle:  'bold',
      color:      '#ffffff',
      align:      'center',
    }).setOrigin(0.5);

    c.add([circle, text]);

    const pressRelease = () => {
      this.scene.tweens.killTweensOf(c);
      this.scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 80 });
      circle.setAlpha(0.72);
      onUp?.();
    };

    c.on('pointerdown', () => {
      this.scene.tweens.killTweensOf(c);
      this.scene.tweens.add({ targets: c, scaleX: 0.86, scaleY: 0.86, duration: 55 });
      circle.setAlpha(1);
      onDown();
    });
    c.on('pointerup',  pressRelease);
    c.on('pointerout', pressRelease);

    this.zones.push({ x: cx, y: cy, r: r + 8 });
    this.allGfx.push(c);
    return c;
  }

  private buildDpad(): void {
    const halo = this.scene.add.circle(DPAD_CX, DPAD_CY, DPAD_STEP + BTN_R + 6, 0x000e1e, 0.36)
      .setScrollFactor(0).setDepth(4795);
    this.allGfx.push(halo);

    const press = (col: number, row: number) => () => {
      if (this.mode === 'battle') {
        this._swipe = { col, row };
      } else {
        if (col !== 0) this._dpadX = col;
        if (row !== 0) this._dpadY = row;
      }
    };
    const release = (col: number, row: number) => () => {
      if (this.mode === 'world') {
        if (col !== 0) this._dpadX = 0;
        if (row !== 0) this._dpadY = 0;
      }
    };

    this.makeButton(DPAD_CX,            DPAD_CY - DPAD_STEP, BTN_R, '▲', 0x1a4a8a, press(0, -1), release(0, -1));
    this.makeButton(DPAD_CX,            DPAD_CY + DPAD_STEP, BTN_R, '▼', 0x1a4a8a, press(0,  1), release(0,  1));
    this.makeButton(DPAD_CX - DPAD_STEP, DPAD_CY,            BTN_R, '◄', 0x1a4a8a, press(-1, 0), release(-1, 0));
    this.makeButton(DPAD_CX + DPAD_STEP, DPAD_CY,            BTN_R, '►', 0x1a4a8a, press( 1, 0), release( 1, 0));
  }

  private buildFireButton(): void {
    this.makeButton(FIRE_X, FIRE_Y, 44, 'FIRE', 0x8b1a1a, () => { this._tap = true; });
  }

  private buildCustomButton(): void {
    const btn = this.makeButton(CUSTOM_X, CUSTOM_Y, 34, 'CUSTOM', 0x2a7a1a, () => { this._doubleTap = true; });
    btn.setVisible(false);
    this.customBtn = btn;
  }

  private buildJoystickZone(): void {
    const g = this.scene.add.graphics().setScrollFactor(0).setDepth(4790);
    g.lineStyle(1.5, 0x3a6a8a, 0.25);
    g.strokeCircle(DPAD_CX, DPAD_CY, DPAD_STEP + BTN_R + 28);
    const lbl = this.scene.add.text(DPAD_CX, DPAD_CY + DPAD_STEP + BTN_R + 32, 'drag', {
      fontFamily: 'Segoe UI', fontSize: '11px', color: '#3a6a8a',
    }).setOrigin(0.5).setAlpha(0.5).setScrollFactor(0).setDepth(4790);
    this.allGfx.push(g, lbl);
  }

  private buildJackInButton(): void {
    const btn = this.makeButton(JACKIN_X, JACKIN_Y, 44, 'JACK\nIN', 0x0a7a5a, () => { this._jackIn = true; });
    btn.setVisible(false);
    this.jackInBtn = btn;
  }

  private buildMenuButtons(): void {
    this.makeButton(MPREV_X, MPREV_Y, 34, '◄',  0x1a3a6a, () => { this._menuNav = -1; });
    this.makeButton(MCANC_X, MCANC_Y, 34, '✗',  0x5a0e0e, () => { this._cancel   = true; });
    this.makeButton(MNEXT_X, MNEXT_Y, 34, '►',  0x1a3a6a, () => { this._menuNav =  1; });
    this.makeButton(MCONF_X, MCONF_Y, 34, '✓',  0x0e5a20, () => { this._confirm  = true; });
  }

  private buildHintPanel(): void {
    const lines = this.hintLines();
    const lineH  = 27;
    const padT   = 46;
    const padB   = 30;
    const panelH = padT + lines.length * lineH + padB;
    const panelW = 580;
    const panelX = (1280 - panelW) / 2;
    const panelY = (720  - panelH) / 2;

    const c = this.scene.add.container(0, 0).setDepth(5000).setScrollFactor(0);

    const dim = this.scene.add.rectangle(0, 0, 1280, 720, 0x000000, 0.52)
      .setOrigin(0).setScrollFactor(0);

    const panel = this.scene.add.graphics().setScrollFactor(0);
    panel.fillStyle(0x04101c, 0.97).fillRoundedRect(panelX, panelY, panelW, panelH, 22);
    panel.lineStyle(2.5, 0x38e8ff, 0.88).strokeRoundedRect(panelX, panelY, panelW, panelH, 22);
    panel.lineStyle(1, 0xff77af, 0.30).strokeRoundedRect(panelX + 10, panelY + 10, panelW - 20, panelH - 20, 16);

    const title = this.scene.add.text(640, panelY + 18, 'TOUCH CONTROLS', {
      fontFamily: 'Segoe UI', fontSize: '21px', fontStyle: 'bold', color: '#38e8ff',
    }).setOrigin(0.5).setScrollFactor(0);

    const lineObjs = lines.map((ln, i) =>
      this.scene.add.text(640, panelY + padT + i * lineH, ln.t, {
        fontFamily: 'Segoe UI', fontSize: '16px', color: ln.c ?? '#c8e8ff', align: 'center',
      }).setOrigin(0.5).setScrollFactor(0),
    );

    const tap = this.scene.add.text(640, panelY + panelH - 13, 'Tap anywhere to dismiss', {
      fontFamily: 'Segoe UI', fontSize: '12px', color: '#4a8898',
    }).setOrigin(0.5).setScrollFactor(0);

    c.add([dim, panel, title, ...lineObjs, tap]);
    c.setVisible(false);
    this.hintPanel = c;
    this.allGfx.push(c);
  }

  private hintLines(): Array<{ t: string; c?: string }> {
    if (this.mode === 'battle') {
      return [
        { t: 'D-PAD (bottom-left)  or  SWIPE  →  Move', c: '#ffd066' },
        { t: '' },
        { t: 'TAP game area  →  Fire / Use chip',       c: '#66d4ff' },
        { t: 'DOUBLE-TAP  →  Open Custom Menu',         c: '#aaffaa' },
        { t: '' },
        { t: '[FIRE] button  →  Fire / Use chip',       c: '#ff9999' },
        { t: '[CUSTOM] button  →  Open Custom Menu',    c: '#aaffaa' },
        { t: '(CUSTOM appears when gauge is full)',      c: '#7ab8a8' },
      ];
    }
    if (this.mode === 'world') {
      return [
        { t: 'D-PAD  or  drag bottom-left area  →  Move', c: '#ffd066' },
        { t: '' },
        { t: '[JACK IN] button  →  Jack into terminal',   c: '#66ffcc' },
        { t: '(button appears when near the terminal)',   c: '#7ab8a8' },
      ];
    }
    // menu
    return [
      { t: '◄ ► buttons  or  SWIPE ←→  →  Navigate chips', c: '#ffd066' },
      { t: '' },
      { t: 'TAP a chip card  →  Select / Deselect',        c: '#66d4ff' },
      { t: '[✓] CONFIRM  →  Send chips to battle',         c: '#aaffaa' },
      { t: '[✗] CANCEL  →  Close menu',                    c: '#ff9999' },
    ];
  }
}
