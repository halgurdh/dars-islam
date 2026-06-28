/**
 * TurboDriftPlayCanvas — PlayCanvas + WebGPU full game.
 * Scenes: garage → race (3-lap oval) → finish → garage.
 * Physics:  pure-function arcade model (CarPhysics.ts).
 * Car mesh: Manifold CSG body + PlayCanvas primitives (PlayCanvasCarMesh.ts).
 * Audio:    Web Audio API layered tracks (MusicStateMachine.ts).
 * UI:       DOM overlay, SVG speedometer, glass-morphism panels.
 *
 * IMPORTANT: light addComponent calls must use string type values
 * ('directional'/'omni'/'spot') not numeric constants — PlayCanvas 2.x
 * LightComponent maps strings→numbers via lightTypes{} in the type setter.
 */

import * as pc from 'playcanvas';
import { ArcadeStore } from '@shared/arcade-store';
import { WORLD, UPGRADE_TIERS, BUMPER_OPTIONS, HOOD_OPTIONS, SPOILER_OPTIONS } from '../constants';
import { createPhysicsState, stepPhysics, speedKmh, type PhysicsState } from '../car/CarPhysics';
import { generateCarBodyMesh } from '../pipeline/ManifoldCarPipeline';
import { loadGlbEntity } from '../loaders/GlbAssetLoader';
import { buildCarMesh, spinWheels, type CarMeshResult } from '../car/PlayCanvasCarMesh';
import { GameState } from '../systems/GameState';
import { gameFlow, type FlowHooks } from '../systems/GameFlowMachine';
import { turboMusic } from '../systems/MusicStateMachine';
import type { CarConfig, CustomizablePart, RaceInput } from '../types';
import { gamepad, GP } from '@shared/gamepad';

// WatercolorPostEffect removed: pc.createShaderFromCode is deprecated in
// PlayCanvas 2.x, and the WGSL UV mapping (vUv.y = pos.y*0.5+0.5) inverts
// the render target in WebGPU (top-left texel origin), flipping the world.

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)); }
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function formatTime(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const f = Math.floor(ms % 1000);
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}.${f.toString().padStart(3,'0')}`;
}

function ovalPoint(θ: number, rx: number, rz: number): pc.Vec3 {
  return new pc.Vec3(Math.cos(θ) * rx, 0, Math.sin(θ) * rz);
}

// Speedometer arc math — 210° to 330° sweep (120°), center (110,115) radius 85
function speedArcPath(pct: number): string {
  if (pct < 0.005) return '';
  const clamped = Math.min(pct, 1);
  const endDeg = 210 + clamped * 120;
  const rad = endDeg * Math.PI / 180;
  const ex = (110 + 85 * Math.cos(rad)).toFixed(1);
  const ey = (115 + 85 * Math.sin(rad)).toFixed(1);
  return `M36,72 A85,85 0 0,1 ${ex},${ey}`;
}

function speedArcColor(pct: number): string {
  if (pct < 0.5) return '#00ff88';
  if (pct < 0.8) return '#ffcc00';
  return '#ff4040';
}

// ---------------------------------------------------------------------------
// Design-system CSS — injected once on first build
// ---------------------------------------------------------------------------

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Loader ─────────────────────────────────────────────────────────── */
.td-loader {
  position: fixed; inset: 0; z-index: 200;
  background: #07080f;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 22px;
  transition: opacity 0.7s ease;
  pointer-events: all;
}
.td-loader.td-hidden { opacity: 0; pointer-events: none; }
.td-loader-brand {
  font: 900 clamp(38px,7vw,72px)/1 'Courier New', monospace;
  letter-spacing: 0.2em;
  color: #00d4ff;
  text-shadow: 0 0 40px rgba(0,212,255,.65), 0 0 90px rgba(0,212,255,.3);
  animation: tdGlow 2.4s ease-in-out infinite;
}
.td-loader-sub {
  font: 400 10px/1 'Courier New', monospace;
  letter-spacing: 0.45em;
  color: rgba(232,238,255,.4);
  text-transform: uppercase;
}
.td-loader-track {
  width: 260px; height: 2px;
  background: rgba(0,212,255,.1);
  border-radius: 2px; overflow: hidden;
}
.td-loader-fill {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, #00d4ff, #ff00cc);
  border-radius: 2px;
  box-shadow: 0 0 14px #00d4ff;
  transition: width 0.35s ease;
}
.td-loader-status {
  font: 400 9px/1 'Courier New', monospace;
  letter-spacing: 0.35em;
  color: rgba(232,238,255,.3);
  min-height: 12px;
}

/* ── Garage panel ────────────────────────────────────────────────────── */
.td-garage {
  position: fixed; top: 0; left: 0; bottom: 0;
  width: 290px;
  background: rgba(7,8,15,.97);
  border-right: 1px solid rgba(0,212,255,.12);
  backdrop-filter: blur(24px);
  display: flex; flex-direction: column; gap: 14px;
  padding: 22px 18px 22px;
  overflow-y: auto;
  overflow-x: hidden;
  pointer-events: all;
  scrollbar-width: none;
}
.td-garage::-webkit-scrollbar { display: none; }

.td-g-brand {
  font: 900 24px/1 'Courier New', monospace;
  letter-spacing: 0.18em;
  color: #00d4ff;
  text-shadow: 0 0 28px rgba(0,212,255,.55);
}
.td-g-tagline {
  font: 400 9px/1 'Courier New', monospace;
  letter-spacing: 0.38em;
  color: #ff00cc;
  margin-top: -8px;
}
.td-g-coins {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,204,0,.07);
  border: 1px solid rgba(255,204,0,.2);
  border-radius: 12px;
  padding: 10px 14px;
}
.td-g-coins-icon { font-size: 16px; color: #ffcc00; }
.td-g-coins-val { font: 700 22px/1 'Courier New', monospace; color: #ffcc00; letter-spacing: .03em; }
.td-g-coins-lbl { font: 400 9px/1 'Courier New', monospace; letter-spacing: .25em; color: rgba(232,238,255,.35); margin-left: auto; }

.td-g-badge {
  display: inline-flex; align-items: center;
  padding: 5px 14px;
  border-radius: 100px;
  border: 1px solid rgba(0,212,255,.25);
  background: rgba(0,212,255,.06);
  font: 400 10px/1 'Courier New', monospace;
  letter-spacing: 0.3em;
  color: #00d4ff;
  width: fit-content;
}

.td-g-section-hdr {
  font: 400 8px/1 'Courier New', monospace;
  letter-spacing: 0.45em;
  color: rgba(232,238,255,.35);
  text-transform: uppercase;
  margin-bottom: 6px;
}
.td-divider { height: 1px; background: rgba(255,255,255,.05); }

/* stat bars */
.td-stats { display: flex; flex-direction: column; gap: 9px; }
.td-stat { display: flex; align-items: center; gap: 8px; }
.td-stat-name {
  font: 400 9px/1 'Courier New', monospace;
  letter-spacing: .18em; color: rgba(232,238,255,.45);
  width: 64px; flex-shrink: 0;
  text-transform: uppercase;
}
.td-stat-track {
  flex: 1; height: 3px;
  background: rgba(255,255,255,.05);
  border-radius: 3px; overflow: hidden;
}
.td-stat-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #ff00cc);
  border-radius: 3px;
  box-shadow: 0 0 8px rgba(0,212,255,.5);
  transition: width .5s cubic-bezier(.22,1,.36,1);
}
.td-stat-val {
  font: 700 11px/1 'Courier New', monospace;
  color: rgba(232,238,255,.8);
  width: 32px; text-align: right; flex-shrink: 0;
}

.td-g-best {
  font: 400 10px/1.6 'Courier New', monospace;
  letter-spacing: .08em; color: rgba(232,238,255,.35);
  padding: 8px 10px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 8px;
}

/* parts */
.td-parts { display: flex; flex-direction: column; gap: 10px; }
.td-part-group { display: flex; flex-direction: column; gap: 6px; }
.td-part-row { display: flex; gap: 5px; flex-wrap: wrap; }
.td-part-btn {
  padding: 6px 11px;
  border-radius: 7px;
  border: 1px solid rgba(255,255,255,.08);
  background: rgba(255,255,255,.03);
  color: rgba(232,238,255,.45);
  font: 400 10px/1 'Courier New', monospace;
  letter-spacing: .1em; cursor: pointer;
  transition: all .15s;
}
.td-part-btn:hover { border-color: rgba(0,212,255,.3); color: rgba(232,238,255,.9); background: rgba(0,212,255,.06); }
.td-part-btn.active { border-color: #00d4ff; background: rgba(0,212,255,.14); color: #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,.18); }
.td-part-cost { color: #ffcc00; font-size: 9px; }

.td-unlock-btn {
  width: 100%; padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,204,0,.28);
  background: rgba(255,204,0,.07);
  color: #ffcc00;
  font: 400 10px/1 'Courier New', monospace;
  letter-spacing: .2em; cursor: pointer;
  transition: all .15s;
}
.td-unlock-btn:hover { background: rgba(255,204,0,.14); }

.td-race-btn {
  margin-top: auto;
  width: 100%; padding: 15px;
  border-radius: 12px; border: none;
  background: linear-gradient(135deg, #00b8d4 0%, #006484 100%);
  color: #fff;
  font: 700 13px/1 'Courier New', monospace;
  letter-spacing: .22em; cursor: pointer;
  transition: all .2s;
  box-shadow: 0 6px 24px rgba(0,212,255,.28);
}
.td-race-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(0,212,255,.42); }

/* ── Race HUD ────────────────────────────────────────────────────────── */
.td-hud {
  position: fixed; inset: 0;
  pointer-events: none;
  display: none;
  font-family: 'Courier New', monospace;
  color: #e8eeff;
}

/* lap — top center */
.td-hud-lap {
  position: absolute; top: 18px; left: 50%; transform: translateX(-50%);
  text-align: center; display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.td-lap-num {
  font: 900 52px/1 'Courier New', monospace;
  color: #00d4ff;
  text-shadow: 0 0 32px rgba(0,212,255,.65);
}
.td-lap-total { font: 400 12px/1 'Courier New', monospace; color: rgba(0,212,255,.6); }
.td-lap-lbl { font: 400 8px/1 'Courier New', monospace; letter-spacing: .45em; color: rgba(232,238,255,.35); margin-top: 2px; }

/* timer — top right */
.td-hud-timer {
  position: absolute; top: 18px; right: 18px;
  text-align: right;
}
.td-timer-val { font: 700 20px/1 'Courier New', monospace; letter-spacing: .04em; }
.td-timer-lbl { font: 400 8px/1 'Courier New', monospace; letter-spacing: .3em; color: rgba(232,238,255,.35); margin-top: 3px; }

/* speedometer — bottom left */
.td-speedo {
  position: absolute; bottom: 16px; left: 16px;
  width: 190px;
}
.td-speedo svg { width: 100%; display: block; }

/* drift bar — above speedo */
.td-drift {
  position: absolute; bottom: 148px; left: 18px;
  width: 188px;
  opacity: 0; transition: opacity .2s;
}
.td-drift.td-active { opacity: 1; }
.td-drift-lbl { font: 400 8px/1 'Courier New', monospace; letter-spacing: .42em; color: #ff00cc; margin-bottom: 5px; }
.td-drift-track { height: 3px; background: rgba(255,0,204,.1); border-radius: 3px; overflow: hidden; }
.td-drift-fill {
  height: 100%; width: 0%;
  background: linear-gradient(90deg, #ff00cc, #ffcc00);
  border-radius: 3px;
  box-shadow: 0 0 10px #ff00cc;
  transition: width .08s;
}

/* coins — bottom right */
.td-hud-coins {
  position: absolute; bottom: 20px; right: 18px;
  text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
}
.td-hud-coins-val {
  font: 700 30px/1 'Courier New', monospace;
  color: #ffcc00;
  text-shadow: 0 0 22px rgba(255,204,0,.45);
}
.td-hud-coins-lbl { font: 400 8px/1 'Courier New', monospace; letter-spacing: .32em; color: rgba(232,238,255,.35); }

/* coin popoff */
.td-coin-pop {
  position: absolute;
  right: 22px;
  font: 700 18px/1 'Courier New', monospace;
  color: #ffcc00;
  pointer-events: none;
  animation: tdCoinPop 1.2s ease-out forwards;
}
@keyframes tdCoinPop {
  0%   { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-48px); }
}

/* ── Countdown ───────────────────────────────────────────────────────── */
.td-countdown {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  pointer-events: none; z-index: 40;
}
.td-countdown-num {
  display: none;
  font: 900 clamp(90px,16vw,180px)/1 'Courier New', monospace;
  color: #00d4ff;
  text-shadow: 0 0 60px rgba(0,212,255,.8), 0 0 120px rgba(0,212,255,.4);
  animation: tdCountIn .38s cubic-bezier(.175,.885,.32,1.275) forwards;
}
@keyframes tdCountIn {
  from { transform: scale(1.9); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* ── Finish overlay ──────────────────────────────────────────────────── */
.td-finish {
  position: fixed; inset: 0;
  display: none; align-items: center; justify-content: center;
  background: rgba(7,8,15,.72);
  backdrop-filter: blur(10px);
  z-index: 50;
}
.td-finish-inner {
  display: flex; flex-direction: column; align-items: center; gap: 18px;
  animation: tdSlideUp .5s cubic-bezier(.175,.885,.32,1.275) forwards;
}
.td-finish-title {
  font: 900 clamp(52px,9vw,88px)/1 'Courier New', monospace;
  letter-spacing: .08em; color: #ffcc00;
  text-shadow: 0 0 50px rgba(255,204,0,.75), 0 0 120px rgba(255,204,0,.3);
}
.td-finish-stats {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  font: 400 14px/1.5 'Courier New', monospace;
  letter-spacing: .06em;
  color: rgba(232,238,255,.8);
}
.td-finish-coins {
  font: 700 26px/1 'Courier New', monospace;
  color: #ffcc00; letter-spacing: .05em;
  text-shadow: 0 0 20px rgba(255,204,0,.5);
}
@keyframes tdSlideUp {
  from { transform: translateY(50px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ── Touch controls ──────────────────────────────────────────────────── */
.td-touch { position: fixed; inset: 0; pointer-events: none; display: none; }
@media (hover: hover) and (pointer: fine) { .td-touch { display: none !important; } }
.td-touch-btn {
  position: absolute; display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(7,8,15,.4);
  backdrop-filter: blur(4px);
  color: rgba(255,255,255,.6);
  cursor: pointer; pointer-events: all; touch-action: none;
  font: 400 20px/1 sans-serif;
  transition: background .1s;
  user-select: none;
}
.td-touch-btn:active, .td-touch-btn.pressed { background: rgba(0,212,255,.22); }
.td-touch-drift {
  background: rgba(255,0,204,.14);
  border-color: rgba(255,0,204,.28);
  font: 700 9px/1 'Courier New', monospace;
  letter-spacing: .1em; color: #ff00cc;
}

/* ── Shared animation ────────────────────────────────────────────────── */
@keyframes tdGlow {
  0%,100% { text-shadow: 0 0 30px rgba(0,212,255,.5), 0 0 70px rgba(0,212,255,.25); }
  50%      { text-shadow: 0 0 55px rgba(0,212,255,.85), 0 0 110px rgba(0,212,255,.4); }
}
`;

// ---------------------------------------------------------------------------
// Main game class
// ---------------------------------------------------------------------------

class TurboDriftPlayCanvas {
  private app!: pc.Application;
  private camera!: pc.Entity;
  private garageRoot!: pc.Entity;
  private raceRoot!: pc.Entity;

  private carResult: CarMeshResult | null = null;
  private physics: PhysicsState = createPhysicsState(0, -22, Math.PI / 2);
  private raceInput: RaceInput = { throttle: 0, brake: false, steer: 0, handbrake: false };
  private keys = new Set<string>();
  private touchState = { left: false, right: false, throttle: false, brake: false, drift: false };
  private gpState:   RaceInput = { throttle: 0, brake: false, steer: 0, handbrake: false };

  private lapCount = 0;
  private lapStartTime = 0;
  private raceElapsedMs = 0;
  private lastGateCrossTime = -10;
  private raceEarnedCoins = 0;
  private lastLapMs = 0;
  private isRacing = false;
  private garageRotY = 0;
  private time = 0;
  private carConfig: CarConfig = GameState.getCarConfig();

  // DOM elements
  private loaderEl!: HTMLElement;
  private loaderFillEl!: HTMLElement;
  private loaderStatusEl!: HTMLElement;
  private garageEl!: HTMLElement;
  private hudEl!: HTMLElement;
  private lapNumEl!: HTMLElement;
  private timerValEl!: HTMLElement;
  private speedArcEl!: SVGPathElement;
  private speedNumEl!: SVGTextElement;
  private hudCoinsEl!: HTMLElement;
  private driftEl!: HTMLElement;
  private driftFillEl!: HTMLElement;
  private countdownNumEl!: HTMLElement;
  private finishEl!: HTMLElement;
  private finishTimeEl!: HTMLElement;
  private finishCoinsEl!: HTMLElement;
  private touchEl!: HTMLElement;

  // Camera smoothing
  private camPosSmooth = new pc.Vec3(0, 6, 12);
  private camTargetSmooth = new pc.Vec3(0, 1, 0);

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  async init(rootEl: HTMLElement): Promise<void> {
    rootEl.innerHTML = '';

    // Inject CSS once
    if (!document.getElementById('td-css')) {
      const s = document.createElement('style');
      s.id = 'td-css';
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    // Canvas
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-label', 'Turbo Drift');
    canvas.style.cssText = 'display:block;width:100vw;height:100vh;touch-action:none;';
    rootEl.appendChild(canvas);

    // Overlay wrapper
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10;pointer-events:none;';
    rootEl.appendChild(overlay);

    // Loading screen (shown immediately)
    this.buildLoader(overlay);
    this.setLoaderProgress(8, 'Initializing GPU…');

    await this.bootPlayCanvas(canvas);
    this.setLoaderProgress(28, 'Building track…');

    this.carConfig = GameState.getCarConfig();
    this.setLoaderProgress(50, 'Generating car mesh…');

    const bodyMesh = await generateCarBodyMesh(this.carConfig.carClass);
    this.setLoaderProgress(80, 'Uploading to GPU…');

    this.carResult = buildCarMesh(this.app.graphicsDevice, this.carConfig, bodyMesh);
    this.app.root.addChild(this.carResult.root);

    this.buildGarageScene();
    this.buildRaceScene();
    this.buildDomUI(overlay);

    this.setLoaderProgress(90, 'Loading 3D assets…');
    await this.tryLoadGlbAssets();
    this.setLoaderProgress(100, 'Ready!');
    await new Promise<void>(r => setTimeout(r, 320));
    this.loaderEl.classList.add('td-hidden');

    this.setupInput();
    this.bindGameFlow();
    this.app.on('update', (dt: number) => this.update(dt));
    this.app.start();

    GameState.load();
    gameFlow.start();
    void turboMusic.init();
    this.showGarage();
  }

  private buildLoader(parent: HTMLElement): void {
    this.loaderEl = document.createElement('div');
    this.loaderEl.className = 'td-loader';
    this.loaderEl.innerHTML = `
      <div class="td-loader-brand">TURBO DRIFT</div>
      <div class="td-loader-sub">ARCADE RACING</div>
      <div class="td-loader-track"><div class="td-loader-fill"></div></div>
      <div class="td-loader-status">Starting…</div>
    `;
    parent.appendChild(this.loaderEl);
    this.loaderFillEl = this.loaderEl.querySelector('.td-loader-fill') as HTMLElement;
    this.loaderStatusEl = this.loaderEl.querySelector('.td-loader-status') as HTMLElement;
  }

  private setLoaderProgress(pct: number, status: string): void {
    if (!this.loaderFillEl) return;
    this.loaderFillEl.style.width = `${pct}%`;
    this.loaderStatusEl.textContent = status;
  }

  private async bootPlayCanvas(canvas: HTMLCanvasElement): Promise<void> {
    const graphicsDevice = await pc.createGraphicsDevice(canvas, {
      deviceTypes: [pc.DEVICETYPE_WEBGPU, pc.DEVICETYPE_WEBGL2],
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.app = new pc.Application(canvas, { graphicsDevice });
    this.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(pc.RESOLUTION_AUTO);
    graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const scene = this.app.scene as pc.Scene & { exposure?: number };
    scene.ambientLight = new pc.Color(0.05, 0.07, 0.15);
    if (scene.fog) {
      scene.fog.type = pc.FOG_EXP2;
      scene.fog.color = new pc.Color(0.04, 0.05, 0.1);
      scene.fog.density = 0.011;
    }

    this.camera = new pc.Entity('camera');
    this.camera.addComponent('camera', {
      clearColor: new pc.Color(0.04, 0.05, 0.1),
      fov: 56,
      nearClip: 0.1,
      farClip: 500,
    });
    this.camera.setPosition(0, 6, 14);
    this.app.root.addChild(this.camera);

    this.addGlobalLighting();
  }

  private addGlobalLighting(): void {
    // NOTE: type must be string ('directional'/'omni'/'spot') — PlayCanvas 2.x
    // LightComponent maps strings → numbers via lightTypes{}. Passing a number
    // results in lightTypes[number] = undefined → light._type = undefined → crash.
    const moon = new pc.Entity('moon');
    moon.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.55, 0.64, 0.92),
      intensity: 1.85,
      castShadows: false,
    });
    moon.setEulerAngles(-42, 28, 0);
    this.app.root.addChild(moon);

    const rim = new pc.Entity('rim');
    rim.addComponent('light', {
      type: 'directional',
      color: new pc.Color(0.18, 0.32, 0.82),
      intensity: 0.42,
    });
    rim.setEulerAngles(-15, 200, 0);
    this.app.root.addChild(rim);
  }

  // ── GLB asset loading ─────────────────────────────────────────────────────

  private async tryLoadGlbAssets(): Promise<void> {
    const base      = import.meta.env.BASE_URL;
    const bucketBase = 'https://huggingface.co/buckets/cdgbrands/Hunyuan3D-2.1-bucket/resolve';

    // Prefer local file (dev / bundled), fall back to HF bucket (CDN).
    const glbUrl = (name: string) => {
      // loadGlbEntity returns null on 404, so trying local first is safe.
      return `${base}assets/models/${name}`;
    };
    const glbBucketUrl = (name: string) => `${bucketBase}/${name}`;

    const loadWithFallback = async (name: string): Promise<pc.Entity | null> => {
      const local = await loadGlbEntity(this.app, glbUrl(name));
      if (local) return local;
      return loadGlbEntity(this.app, glbBucketUrl(name));
    };

    // Car GLB — parented to carResult.root so it follows physics transforms.
    // Procedural children are disabled when the GLB loads successfully.
    const carEnt = await loadWithFallback('car.glb');
    if (carEnt && this.carResult) {
      for (const child of [...this.carResult.root.children]) {
        child.enabled = false;
      }
      // GLB car scale may differ; 1:1 assumes Rodin output is in metres.
      // Adjust setLocalScale here if the car appears too large/small.
      carEnt.setLocalPosition(0, 0, 0);
      carEnt.setLocalScale(1, 1, 1);
      this.carResult.root.addChild(carEnt);
      console.log('[GLB] car.glb loaded');
    }

    // Grandstand GLB — placed at both sides of the oval
    const gs = await loadWithFallback('grandstand.glb');
    if (gs && this.raceRoot) {
      gs.setLocalPosition(0, 0, WORLD.trackRadiusZ + 18);
      gs.setLocalScale(5, 5, 5);
      this.raceRoot.addChild(gs);

      const gs2 = gs.clone() as pc.Entity;
      gs2.setLocalPosition(0, 0, -(WORLD.trackRadiusZ + 18));
      gs2.setEulerAngles(0, 180, 0);
      this.raceRoot.addChild(gs2);
      console.log('[GLB] grandstand.glb loaded');
    }

    // Tree GLB — 24 instances around the track perimeter
    const treeTemplate = await loadWithFallback('tree.glb');
    if (treeTemplate && this.raceRoot) {
      const count = 24;
      const rx = WORLD.trackRadiusX + 16;
      const rz = WORLD.trackRadiusZ + 12;
      for (let i = 0; i < count; i++) {
        const θ = (i / count) * Math.PI * 2;
        const t = i === 0 ? treeTemplate : (treeTemplate.clone() as pc.Entity);
        t.setLocalPosition(Math.cos(θ) * rx, 0, Math.sin(θ) * rz);
        const s = 2.8 + (i % 3) * 0.7;
        t.setLocalScale(s, s, s);
        this.raceRoot.addChild(t);
      }
      console.log('[GLB] tree.glb loaded (×24)');
    }
  }

  // ── Garage scene ──────────────────────────────────────────────────────────

  private buildGarageScene(): void {
    this.garageRoot = new pc.Entity('garage');
    this.garageRoot.enabled = false;
    this.app.root.addChild(this.garageRoot);

    const floorMat = new pc.StandardMaterial();
    floorMat.diffuse = new pc.Color(0.03, 0.04, 0.1);
    floorMat.useMetalness = true; floorMat.metalness = 0.4; floorMat.gloss = 0.65;
    floorMat.update();
    const floor = new pc.Entity('floor');
    floor.addComponent('render', { type: 'plane', material: floorMat });
    floor.setLocalScale(120, 1, 120);
    this.garageRoot.addChild(floor);

    const podMat = new pc.StandardMaterial();
    podMat.diffuse = new pc.Color(0.06, 0.09, 0.18);
    podMat.useMetalness = true; podMat.metalness = 0.3; podMat.gloss = 0.6;
    podMat.update();
    const podium = new pc.Entity('podium');
    podium.addComponent('render', { type: 'cylinder', material: podMat });
    podium.setLocalPosition(0, 0.19, 0);
    podium.setLocalScale(9.6, 0.38, 9.6);
    this.garageRoot.addChild(podium);

    // Neon rings
    for (const [y, scale, r, g, b, em] of [
      [1.8, 11.2, 0, 0.83, 1.0, 3.5],
      [0.5, 6.8,  1.0, 0, 0.8, 3.0],
    ] as [number, number, number, number, number, number][]) {
      const mat = new pc.StandardMaterial();
      mat.diffuse = new pc.Color(r, g, b);
      mat.emissive = new pc.Color(r, g, b);
      mat.emissiveIntensity = em;
      mat.useLighting = false; mat.update();
      const ring = new pc.Entity('ring');
      ring.addComponent('render', { type: 'cylinder', material: mat });
      ring.setLocalPosition(0, y, 0);
      ring.setLocalScale(scale, 0.1, scale);
      this.garageRoot.addChild(ring);
    }

    // Backdrop wall
    const wallMat = new pc.StandardMaterial();
    wallMat.diffuse = new pc.Color(0.05, 0.08, 0.18); wallMat.update();
    const wall = new pc.Entity('wall');
    wall.addComponent('render', { type: 'box', material: wallMat });
    wall.setLocalPosition(0, 4.5, -9);
    wall.setLocalScale(28, 9, 0.6);
    this.garageRoot.addChild(wall);

    // Accent panels
    for (let i = 0; i < 8; i++) {
      const px = -10 + i * 2.86;
      const pMat = new pc.StandardMaterial();
      pMat.diffuse = new pc.Color(i % 2 === 0 ? 0.06 : 0.05, 0.09, 0.2); pMat.update();
      const panel = new pc.Entity(`panel${i}`);
      panel.addComponent('render', { type: 'box', material: pMat });
      panel.setLocalPosition(px, 2.7, -8.6);
      panel.setLocalScale(1.3, 5.4, 0.14);
      this.garageRoot.addChild(panel);
      if (i % 2 === 0) {
        const isBlue = i % 4 === 0;
        const col = isBlue ? new pc.Color(0, 0.83, 1) : new pc.Color(1, 0, 0.8);
        const sm = new pc.StandardMaterial();
        sm.diffuse = col; sm.emissive = col; sm.emissiveIntensity = 3; sm.useLighting = false; sm.update();
        const strip = new pc.Entity(`strip${i}`);
        strip.addComponent('render', { type: 'box', material: sm });
        strip.setLocalPosition(px, 5.4, -8.5);
        strip.setLocalScale(1.1, 0.06, 0.18);
        this.garageRoot.addChild(strip);
      }
    }

    // Garage omni lights — string type required!
    const garageLights: [number, number, number, number, number, number, number, number][] = [
      [0, 4, 0,    0, 0.83, 1.0, 5, 22],
      [-6, 2, 2,   1.0, 0, 0.8, 3, 14],
      [6, 2, -4,   1.0, 0.38, 0.18, 2, 10],
    ];
    for (const [lx, ly, lz, r, g, b, int, range] of garageLights) {
      const nl = new pc.Entity('nl');
      nl.addComponent('light', {
        type: 'omni',
        color: new pc.Color(r, g, b),
        intensity: int,
        range,
        castShadows: false,
      });
      nl.setLocalPosition(lx, ly, lz);
      this.garageRoot.addChild(nl);
    }
  }

  // ── Race scene ────────────────────────────────────────────────────────────

  private buildRaceScene(): void {
    this.raceRoot = new pc.Entity('race');
    this.raceRoot.enabled = false;
    this.app.root.addChild(this.raceRoot);

    const rx = WORLD.trackRadiusX, rz = WORLD.trackRadiusZ;
    const seg = WORLD.segmentCount;
    const TWO_PI = Math.PI * 2;

    const gndMat = new pc.StandardMaterial();
    gndMat.diffuse = new pc.Color(0.04, 0.04, 0.07); gndMat.update();
    const ground = new pc.Entity('ground');
    ground.addComponent('render', { type: 'plane', material: gndMat });
    ground.setLocalPosition(0, -0.08, 0);
    ground.setLocalScale(520, 1, 520);
    this.raceRoot.addChild(ground);

    // Stars
    const starMat = new pc.StandardMaterial();
    starMat.diffuse = new pc.Color(1,1,1); starMat.emissive = new pc.Color(1,1,1);
    starMat.emissiveIntensity = 4; starMat.useLighting = false; starMat.update();
    for (let i = 0; i < 320; i++) {
      const θs = Math.random() * TWO_PI, φs = Math.random() * Math.PI * 0.44;
      const rs = 230 + Math.random() * 40;
      const star = new pc.Entity(`s${i}`);
      star.addComponent('render', { type: 'sphere', material: starMat });
      star.setLocalPosition(rs*Math.sin(φs)*Math.cos(θs), rs*Math.cos(φs), rs*Math.sin(φs)*Math.sin(θs));
      star.setLocalScale(0.5+Math.random()*1.2, 0.5+Math.random()*1.2, 0.5+Math.random()*1.2);
      this.raceRoot.addChild(star);
    }

    const roadMatA = new pc.StandardMaterial();
    roadMatA.diffuse = new pc.Color(0.08,0.09,0.16); roadMatA.useMetalness = true; roadMatA.metalness = 0.08; roadMatA.gloss = 0.12; roadMatA.update();
    const roadMatB = new pc.StandardMaterial();
    roadMatB.diffuse = new pc.Color(0.06,0.07,0.12); roadMatB.useMetalness = true; roadMatB.metalness = 0.08; roadMatB.gloss = 0.12; roadMatB.update();
    const edgeMat = new pc.StandardMaterial();
    edgeMat.diffuse = new pc.Color(0.9,0.9,0.9); edgeMat.emissive = new pc.Color(0.9,0.9,0.9); edgeMat.emissiveIntensity = 0.15; edgeMat.update();
    const dashMat = new pc.StandardMaterial();
    dashMat.diffuse = new pc.Color(1,0.8,0); dashMat.emissive = new pc.Color(1,0.8,0); dashMat.emissiveIntensity = 0.5; dashMat.update();

    for (let i = 0; i < seg; i++) {
      const t = (i/seg)*TWO_PI, t1 = ((i+1)/seg)*TWO_PI;
      const p = ovalPoint(t, rx, rz), pN = ovalPoint(t1, rx, rz);

      const seg3d = new pc.Entity(`seg${i}`);
      seg3d.addComponent('render', { type: 'box', material: i%2===0 ? roadMatA : roadMatB });
      seg3d.setLocalPosition(p.x, 0, p.z);
      seg3d.setLocalScale(8, 0.18, 12);
      seg3d.lookAt(pN);
      this.raceRoot.addChild(seg3d);

      for (const side of [-1, 1]) {
        const edge = new pc.Entity(`edge${i}_${side}`);
        edge.addComponent('render', { type: 'box', material: edgeMat });
        edge.setLocalPosition(p.x, 0, p.z);
        edge.setLocalScale(0.3, 0.22, 11.5);
        edge.lookAt(pN);
        edge.translateLocal(side*3.6, 0, 0);
        this.raceRoot.addChild(edge);
      }

      if (i%2===0) {
        const dash = new pc.Entity(`dash${i}`);
        dash.addComponent('render', { type: 'box', material: dashMat });
        dash.setLocalPosition(p.x, 0.015, p.z);
        dash.setLocalScale(0.2, 0.22, 4.5);
        dash.lookAt(pN);
        this.raceRoot.addChild(dash);
      }
    }

    // Finish line + arch
    const finMat = new pc.StandardMaterial();
    finMat.diffuse = new pc.Color(1,1,1); finMat.emissive = new pc.Color(1,1,1); finMat.emissiveIntensity = 0.6; finMat.update();
    const finLine = new pc.Entity('fin');
    finLine.addComponent('render', { type: 'box', material: finMat });
    finLine.setLocalPosition(0, 0.01, -rz);
    finLine.setLocalScale(8.2, 0.22, 1.4);
    this.raceRoot.addChild(finLine);

    const archMat = new pc.StandardMaterial();
    archMat.diffuse = new pc.Color(0,0.83,1); archMat.emissive = new pc.Color(0,0.83,1); archMat.emissiveIntensity = 1.4; archMat.useLighting = false; archMat.update();
    for (const [sx,sy,sz,ex,ey,ez] of [
      [-4.8,2.5,-rz-0.2, 0.35,5,0.35],
      [ 4.8,2.5,-rz-0.2, 0.35,5,0.35],
      [ 0,  5.1,-rz-0.2, 10,0.35,0.35],
    ] as [number,number,number,number,number,number][]) {
      const ap = new pc.Entity('arch');
      ap.addComponent('render', { type: 'box', material: archMat });
      ap.setLocalPosition(sx,sy,sz);
      ap.setLocalScale(ex,ey,ez);
      this.raceRoot.addChild(ap);
    }

    // Inner curbs
    const innerRx = rx-4.8, innerRz = rz-4.8;
    for (let i = 0; i < seg; i++) {
      const t=(i/seg)*TWO_PI, t1=((i+1)/seg)*TWO_PI;
      const p=ovalPoint(t,innerRx,innerRz), pN=ovalPoint(t1,innerRx,innerRz);
      const cm = new pc.StandardMaterial();
      cm.diffuse = i%2===0 ? new pc.Color(0.9,0.1,0.15) : new pc.Color(0.92,0.92,0.92); cm.update();
      const curb = new pc.Entity(`c${i}`);
      curb.addComponent('render', { type: 'box', material: cm });
      curb.setLocalPosition(p.x,0.1,p.z);
      curb.setLocalScale(2.4,0.2,2.2);
      curb.lookAt(new pc.Vec3(pN.x,0.1,pN.z));
      this.raceRoot.addChild(curb);
    }

    // Outer barriers
    const outerRx = rx+5.2, outerRz = rz+5.2;
    for (let i = 0; i < seg; i++) {
      const t=(i/seg)*TWO_PI, t1=((i+1)/seg)*TWO_PI;
      const p=ovalPoint(t,outerRx,outerRz), pN=ovalPoint(t1,outerRx,outerRz);
      const bm = new pc.StandardMaterial();
      bm.diffuse = i%2===0 ? new pc.Color(0.1,0.22,0.82) : new pc.Color(0.96,0.96,0.96); bm.update();
      const bar = new pc.Entity(`b${i}`);
      bar.addComponent('render', { type: 'box', material: bm });
      bar.setLocalPosition(p.x,0.55,p.z);
      bar.setLocalScale(2.5,1.1,2.2);
      bar.lookAt(new pc.Vec3(pN.x,0.55,pN.z));
      this.raceRoot.addChild(bar);
    }

    // Buildings
    for (let i = 0; i < 14; i++) {
      const angle=(i/14)*TWO_PI, bldgR=outerRx+14+(i%3)*4;
      const bx=Math.cos(angle)*bldgR, bz=Math.sin(angle)*bldgR;
      const bh=7+(i%5)*4.5;
      const bm = new pc.StandardMaterial();
      bm.diffuse = new pc.Color(0.05+(i%3)*0.01,0.06,0.12); bm.update();
      const bldg = new pc.Entity(`bldg${i}`);
      bldg.addComponent('render', { type: 'box', material: bm });
      bldg.setLocalPosition(bx,bh/2,bz);
      bldg.setLocalScale(3.5+i%3,bh,3.5+i%2);
      this.raceRoot.addChild(bldg);
      if (i%2===0) {
        const isBlue=i%4===0;
        const wc=isBlue ? new pc.Color(0,0.83,1) : new pc.Color(1,0,0.8);
        const wm=new pc.StandardMaterial();
        wm.diffuse=wc; wm.emissive=wc; wm.emissiveIntensity=2; wm.useLighting=false; wm.update();
        const win=new pc.Entity(`win${i}`);
        win.addComponent('render', { type: 'box', material: wm });
        win.setLocalPosition(bx,bh*0.5,bz);
        win.setLocalScale(3.2,bh*0.55,0.12);
        win.lookAt(new pc.Vec3(0,bh*0.5,0));
        this.raceRoot.addChild(win);
      }
    }

    // Pine trees
    const trunkMat = new pc.StandardMaterial();
    trunkMat.diffuse = new pc.Color(0.22,0.16,0.1); trunkMat.update();
    const topMat = new pc.StandardMaterial();
    topMat.diffuse = new pc.Color(0.06,0.22,0.08); topMat.update();
    for (let i = 0; i < 22; i++) {
      const tA=(i/22)*TWO_PI, tR=outerRx+5+(i%3)*2.5;
      const tx=Math.cos(tA+0.14)*tR, tz=Math.sin(tA+0.14)*tR;
      const ts=0.8+(i%4)*0.3;
      const trunk=new pc.Entity(`tr${i}`);
      trunk.addComponent('render', { type: 'cylinder', material: trunkMat });
      trunk.setLocalPosition(tx,ts*0.5,tz);
      trunk.setLocalScale(ts*0.18,ts*1.1,ts*0.18);
      this.raceRoot.addChild(trunk);
      const top=new pc.Entity(`tt${i}`);
      top.addComponent('render', { type: 'cone', material: topMat });
      top.setLocalPosition(tx,ts*1.1+ts*1.2,tz);
      top.setLocalScale(ts*0.8,ts*2.4,ts*0.8);
      this.raceRoot.addChild(top);
    }

    // Race omni fill light — string type!
    const raceAmb = new pc.Entity('raceAmb');
    raceAmb.addComponent('light', {
      type: 'omni',
      color: new pc.Color(0.05,0.08,0.22),
      intensity: 1.5,
      range: 120,
      castShadows: false,
    });
    raceAmb.setLocalPosition(0, 30, 0);
    this.raceRoot.addChild(raceAmb);
  }

  // ── DOM UI ────────────────────────────────────────────────────────────────

  private buildDomUI(parent: HTMLElement): void {
    // Garage panel
    this.garageEl = document.createElement('div');
    this.garageEl.className = 'td-garage';
    parent.appendChild(this.garageEl);
    this.refreshGarage();

    // Race HUD
    this.hudEl = document.createElement('div');
    this.hudEl.className = 'td-hud';
    parent.appendChild(this.hudEl);
    this.buildHud();

    // Countdown
    const countdownEl = document.createElement('div');
    countdownEl.className = 'td-countdown';
    countdownEl.innerHTML = '<div class="td-countdown-num" id="td-countdown-num"></div>';
    parent.appendChild(countdownEl);
    this.countdownNumEl = countdownEl.querySelector('.td-countdown-num') as HTMLElement;

    // Finish overlay
    this.finishEl = document.createElement('div');
    this.finishEl.className = 'td-finish';
    this.finishEl.innerHTML = `
      <div class="td-finish-inner">
        <div class="td-finish-title">FINISH!</div>
        <div class="td-finish-stats">
          <div id="td-finish-time"></div>
          <div id="td-finish-best"></div>
        </div>
        <div class="td-finish-coins" id="td-finish-coins"></div>
      </div>`;
    parent.appendChild(this.finishEl);
    this.finishTimeEl = this.finishEl.querySelector('#td-finish-time') as HTMLElement;
    this.finishCoinsEl = this.finishEl.querySelector('#td-finish-coins') as HTMLElement;

    // Touch controls
    this.touchEl = document.createElement('div');
    this.touchEl.className = 'td-touch';
    parent.appendChild(this.touchEl);
    this.buildTouchControls();
  }

  private buildHud(): void {
    // SVG speedometer
    const speedoDiv = document.createElement('div');
    speedoDiv.className = 'td-speedo';
    speedoDiv.innerHTML = `
      <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg">
        <!-- Background arc: 210° to 330°, r=85, cx=110 cy=115 -->
        <path d="M36,72 A85,85 0 0,1 184,72"
          fill="none" stroke="rgba(0,212,255,0.08)" stroke-width="14" stroke-linecap="round"/>
        <!-- Tick marks at 0%, 50%, 100% of arc -->
        <line x1="47" y1="79" x2="33" y2="70" stroke="rgba(0,212,255,0.3)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="110" y1="43" x2="110" y2="27" stroke="rgba(0,212,255,0.25)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="173" y1="79" x2="187" y2="70" stroke="rgba(0,212,255,0.3)" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Speed fill arc (dynamic) -->
        <path id="td-speedo-arc" d=""
          fill="none" stroke="#00ff88" stroke-width="14" stroke-linecap="round"/>
        <!-- Center dot -->
        <circle cx="110" cy="115" r="5" fill="#00d4ff"/>
        <!-- Speed value -->
        <text id="td-speedo-num" x="110" y="104" fill="#e8eeff"
          font-size="34" font-weight="900" font-family="'Courier New'" text-anchor="middle">0</text>
        <!-- Unit label -->
        <text x="110" y="120" fill="rgba(0,212,255,0.7)"
          font-size="9" letter-spacing="5" font-family="'Courier New'" text-anchor="middle">KM/H</text>
      </svg>`;
    this.hudEl.appendChild(speedoDiv);
    this.speedArcEl = speedoDiv.querySelector('#td-speedo-arc') as unknown as SVGPathElement;
    this.speedNumEl = speedoDiv.querySelector('#td-speedo-num') as unknown as SVGTextElement;

    // Drift bar (above speedo)
    this.driftEl = document.createElement('div');
    this.driftEl.className = 'td-drift';
    this.driftEl.innerHTML = `
      <div class="td-drift-lbl">DRIFT</div>
      <div class="td-drift-track"><div class="td-drift-fill"></div></div>`;
    this.hudEl.appendChild(this.driftEl);
    this.driftFillEl = this.driftEl.querySelector('.td-drift-fill') as HTMLElement;

    // Lap counter (top center)
    const lapDiv = document.createElement('div');
    lapDiv.className = 'td-hud-lap';
    lapDiv.innerHTML = `
      <div class="td-lap-num"><span id="td-lap-num">1</span><span class="td-lap-total">/${WORLD.lapsToWin}</span></div>
      <div class="td-lap-lbl">LAP</div>`;
    this.hudEl.appendChild(lapDiv);
    this.lapNumEl = lapDiv.querySelector('#td-lap-num') as HTMLElement;

    // Timer (top right)
    const timerDiv = document.createElement('div');
    timerDiv.className = 'td-hud-timer';
    timerDiv.innerHTML = `
      <div class="td-timer-val" id="td-timer-val">00:00.000</div>
      <div class="td-timer-lbl">LAP TIME</div>`;
    this.hudEl.appendChild(timerDiv);
    this.timerValEl = timerDiv.querySelector('#td-timer-val') as HTMLElement;

    // Coins (bottom right)
    const coinsDiv = document.createElement('div');
    coinsDiv.className = 'td-hud-coins';
    coinsDiv.innerHTML = `
      <div class="td-hud-coins-val" id="td-hud-coins">0</div>
      <div class="td-hud-coins-lbl">◈ COINS</div>`;
    this.hudEl.appendChild(coinsDiv);
    this.hudCoinsEl = coinsDiv.querySelector('#td-hud-coins') as HTMLElement;
  }

  private buildTouchControls(): void {
    type BtnDef = [label: string, css: string, extra: string, downKey: keyof typeof this.touchState, upKey?: keyof typeof this.touchState];
    const defs: BtnDef[] = [
      ['←', 'left:18px;bottom:90px;', '', 'left'],
      ['→', 'left:92px;bottom:90px;', '', 'right'],
      ['▲', 'right:92px;bottom:90px;', '', 'throttle'],
      ['▼', 'right:18px;bottom:90px;', '', 'brake'],
      ['DRIFT', 'right:50px;bottom:168px;', 'td-touch-drift', 'drift'],
    ];
    for (const [label, pos, extra, key] of defs) {
      const btn = document.createElement('button');
      btn.className = `td-touch-btn${extra ? ` ${extra}` : ''}`;
      btn.style.cssText = pos + (extra.includes('drift') ? 'width:72px;height:72px;' : 'width:60px;height:60px;');
      btn.textContent = label;
      btn.addEventListener('pointerdown', (e) => { e.preventDefault(); this.touchState[key] = true; btn.classList.add('pressed'); });
      btn.addEventListener('pointerup',   () => { this.touchState[key] = false; btn.classList.remove('pressed'); });
      btn.addEventListener('pointerleave',() => { this.touchState[key] = false; btn.classList.remove('pressed'); });
      this.touchEl.appendChild(btn);
    }
  }

  private refreshGarage(): void {
    const state = GameState.load();
    const config = GameState.getCarConfig();
    const tier = UPGRADE_TIERS[config.carClass];
    const canUnlock = state.currentTier === 'hatchback'
      && (GameState.canUnlockSedanByTime() || GameState.canUnlockSedanByCurrency());
    const coins = ArcadeStore.getCoins();

    // Stat bar widths (normalised to max possible)
    const maxSpd = 200, maxAcc = 15, maxHnd = 2.5;
    const spdPct = (config.stats.topSpeed / maxSpd * 100).toFixed(0);
    const accPct = (config.stats.acceleration / maxAcc * 100).toFixed(0);
    const hndPct = (config.stats.handling / maxHnd * 100).toFixed(0);

    let partsHtml = '';
    for (const { label, part, options } of [
      { label: 'BUMPER', part: 'bumper' as CustomizablePart, options: BUMPER_OPTIONS },
      { label: 'HOOD',   part: 'hood'   as CustomizablePart, options: HOOD_OPTIONS   },
      { label: 'SPOILER',part: 'spoiler' as CustomizablePart, options: SPOILER_OPTIONS},
    ]) {
      const active = config.customization[part];
      const btnHtml = options.map(o =>
        `<button class="td-part-btn${o.style === active ? ' active' : ''}"
           data-part="${part}" data-style="${o.style}" data-cost="${o.cost}">
           ${o.label}${o.cost > 0 ? ` <span class="td-part-cost">${o.cost}◈</span>` : ''}
         </button>`
      ).join('');
      partsHtml += `
        <div class="td-part-group">
          <div class="td-g-section-hdr">${label}</div>
          <div class="td-part-row">${btnHtml}</div>
        </div>`;
    }

    const bestLapHtml = state.bestLapMs
      ? `<span style="color:rgba(0,212,255,.7)">BEST</span> ${formatTime(state.bestLapMs)}`
      : 'BEST&nbsp;&nbsp;—:——.———';

    const unlockHtml = canUnlock
      ? `<button class="td-unlock-btn" id="td-unlock-btn">
           ⚡ UNLOCK SEDAN &mdash; ${UPGRADE_TIERS.sedan.unlockCost}◈
         </button>`
      : '';

    this.garageEl.innerHTML = `
      <div class="td-g-brand">TURBO DRIFT</div>
      <div class="td-g-tagline">ARCADE RACING</div>

      <div class="td-g-coins">
        <span class="td-g-coins-icon">◈</span>
        <span class="td-g-coins-val">${coins.toLocaleString()}</span>
        <span class="td-g-coins-lbl">COINS</span>
      </div>

      <div class="td-g-badge">${tier.label.toUpperCase()}</div>

      <div>
        <div class="td-g-section-hdr">STATS</div>
        <div class="td-stats">
          <div class="td-stat">
            <span class="td-stat-name">TOP SPEED</span>
            <div class="td-stat-track"><div class="td-stat-fill" style="width:${spdPct}%"></div></div>
            <span class="td-stat-val">${config.stats.topSpeed}</span>
          </div>
          <div class="td-stat">
            <span class="td-stat-name">ACCEL</span>
            <div class="td-stat-track"><div class="td-stat-fill" style="width:${accPct}%"></div></div>
            <span class="td-stat-val">${config.stats.acceleration.toFixed(1)}</span>
          </div>
          <div class="td-stat">
            <span class="td-stat-name">HANDLING</span>
            <div class="td-stat-track"><div class="td-stat-fill" style="width:${hndPct}%"></div></div>
            <span class="td-stat-val">${config.stats.handling.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div class="td-g-best">${bestLapHtml}</div>
      <div class="td-divider"></div>

      <div>
        <div class="td-g-section-hdr">CUSTOMISE</div>
        <div class="td-parts">${partsHtml}</div>
      </div>

      ${unlockHtml ? `<div class="td-divider"></div>${unlockHtml}` : ''}
      <div class="td-divider"></div>

      <button class="td-race-btn" id="td-race-btn">▶ &nbsp;START RACE</button>
    `;

    // Wire part buttons
    this.garageEl.querySelectorAll('.td-part-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const b = btn as HTMLButtonElement;
        this.applyCustomization(
          b.dataset['part'] as CustomizablePart,
          b.dataset['style'] as string,
          Number(b.dataset['cost'] ?? 0),
        );
      });
    });

    const unlockBtn = this.garageEl.querySelector('#td-unlock-btn');
    if (unlockBtn) unlockBtn.addEventListener('click', () => { this.unlockSedan(); });

    const raceBtn = this.garageEl.querySelector('#td-race-btn');
    if (raceBtn) raceBtn.addEventListener('click', () => { this.beginRace(); });
  }

  private applyCustomization(part: CustomizablePart, style: string, cost: number): void {
    if (cost > 0 && !ArcadeStore.spendCoins(cost)) return;
    GameState.setCustomization(part, style as never);
    this.carConfig = GameState.getCarConfig();
    this.refreshGarage();
    void generateCarBodyMesh(this.carConfig.carClass).then(bodyMesh => {
      if (this.carResult) this.app.root.removeChild(this.carResult.root);
      this.carResult = buildCarMesh(this.app.graphicsDevice, this.carConfig, bodyMesh);
      this.app.root.addChild(this.carResult.root);
      if (!this.isRacing) this.positionCarForGarage();
    });
    gameFlow.send('customize');
    gameFlow.send('customize_done');
  }

  private unlockSedan(): void {
    if (GameState.unlockSedan()) {
      this.carConfig = GameState.getCarConfig();
      this.refreshGarage();
      gameFlow.send('unlock_claimed');
    }
  }

  private beginRace(): void {
    void turboMusic.init();
    gameFlow.send('start_race');
  }

  // ── Input ─────────────────────────────────────────────────────────────────

  private setupInput(): void {
    window.addEventListener('keydown', (e) => { this.keys.add(e.code); void turboMusic.init(); });
    window.addEventListener('keyup',   (e) => { this.keys.delete(e.code); });
  }

  private pollGamepad(): void {
    gamepad.tick();
    if (!gamepad.connected()) {
      this.gpState = { throttle: 0, brake: false, steer: 0, handbrake: false };
      return;
    }
    const rt    = gamepad.value(GP.RT);
    const lt    = gamepad.value(GP.LT);
    const axisX = gamepad.axis(0);
    this.gpState = {
      throttle:  Math.max(rt, gamepad.pressed(GP.A) ? 1 : 0),
      brake:     lt > 0.1 || gamepad.pressed(GP.B),
      steer:     axisX !== 0 ? -axisX
               : gamepad.pressed(GP.LEFT) ? 1 : gamepad.pressed(GP.RIGHT) ? -1 : 0,
      handbrake: gamepad.pressed(GP.X) || gamepad.pressed(GP.LB),
    };
  }

  private gatherInput(): RaceInput {
    const k = this.keys, t = this.touchState, gp = this.gpState;
    return {
      throttle:  (k.has('ArrowUp')   || k.has('KeyW') || t.throttle) ? 1 : gp.throttle,
      brake:     k.has('ArrowDown') || k.has('KeyS')  || t.brake || gp.brake,
      steer:     (k.has('ArrowLeft') || k.has('KeyA') || t.left)  ?  1
               : (k.has('ArrowRight')|| k.has('KeyD') || t.right) ? -1
               : gp.steer,
      handbrake: k.has('Space') || t.drift || gp.handbrake,
    };
  }

  // ── Game flow ─────────────────────────────────────────────────────────────

  private bindGameFlow(): void {
    const hooks: FlowHooks = {
      onGarageRefresh:     () => { this.showGarage(); },
      onCountdownTick:     (v) => { this.showCountdown(String(v)); },
      onCountdownFinished: () => { this.hideCountdown(); this.startRace(); },
      onRaceFinished:      () => { this.onRaceFinished(); },
      onReturnToGarage:    () => { this.showGarage(); },
    };
    gameFlow.setHooks(hooks);
  }

  private showCountdown(text: string): void {
    // Re-trigger CSS animation by replacing the element
    const el = this.countdownNumEl;
    el.style.display = 'none';
    el.textContent = text;
    void el.offsetWidth; // reflow
    el.style.display = 'block';
  }

  private hideCountdown(): void {
    this.countdownNumEl.style.display = 'none';
  }

  private showGarage(): void {
    this.isRacing = false;
    this.garageRoot.enabled = true;
    this.raceRoot.enabled = false;
    this.garageEl.style.display = 'flex';
    this.hudEl.style.display = 'none';
    this.finishEl.style.display = 'none';
    this.touchEl.style.display = 'none';
    this.hideCountdown();
    this.refreshGarage();
    this.positionCarForGarage();
    this.camera.setPosition(0, 4.1, 10.6);
    this.camera.lookAt(new pc.Vec3(0, 1, 0));
    this.camPosSmooth.set(0, 4.1, 10.6);
    this.camTargetSmooth.set(0, 1, 0);
  }

  private positionCarForGarage(): void {
    if (!this.carResult) return;
    this.carResult.root.setLocalPosition(0, 0.75, 0);
    this.carResult.root.setEulerAngles(0, 0, 0);
  }

  private showRace(): void {
    this.garageRoot.enabled = false;
    this.raceRoot.enabled = true;
    this.garageEl.style.display = 'none';
    this.hudEl.style.display = 'block';
    this.finishEl.style.display = 'none';
    this.touchEl.style.display = 'block';
    this.physics = createPhysicsState(0, -22, Math.PI / 2);
    this.lapCount = 0;
    this.lapStartTime = 0;
    this.lastGateCrossTime = -10;
    this.raceElapsedMs = 0;
    this.raceEarnedCoins = 0;
  }

  private startRace(): void {
    this.isRacing = true;
    this.showRace();
    this.lapStartTime = performance.now();
  }

  private onRaceFinished(): void {
    this.isRacing = false;
    this.finishEl.style.display = 'flex';
    this.touchEl.style.display = 'none';
    if (this.finishTimeEl) {
      this.finishTimeEl.textContent = this.lastLapMs > 0
        ? `Best lap: ${formatTime(this.lastLapMs)}`
        : '';
    }
    if (this.finishCoinsEl) {
      this.finishCoinsEl.textContent = `+${this.raceEarnedCoins.toLocaleString()} coins`;
    }
    window.setTimeout(() => { gameFlow.send('return_to_garage'); }, 2800);
  }

  // ── Update loop ───────────────────────────────────────────────────────────

  private update(dt: number): void {
    this.time += dt;

    const state = gameFlow.currentState;
    const inRace = state === 'race_active' || state === 'race_countdown' || state === 'race_finished';
    if (inRace) {
      this.updateRace(dt);
    } else {
      this.updateGarage(dt);
    }

    gameFlow.update(dt * 1000);
    GameState.addPlayTime(dt * 1000);
  }

  private updateGarage(dt: number): void {
    if (!this.carResult) return;
    this.garageRotY += dt * 0.4;
    this.carResult.root.setLocalPosition(0, 0.75, 0);
    this.carResult.root.setEulerAngles(0, this.garageRotY * pc.math.RAD_TO_DEG, 0);
  }

  private updateRace(dt: number): void {
    if (!this.carResult) return;
    const state = gameFlow.currentState;

    if (state === 'race_active') {
      const dtC = Math.min(dt, 0.05);
      this.pollGamepad();
      this.raceInput = this.gatherInput();
      this.physics = stepPhysics(this.physics, this.raceInput, this.carConfig.stats, dtC);
      this.raceElapsedMs += dtC * 1000;

      const drifting = this.raceInput.handbrake && this.physics.speed > 3;
      if (drifting) gameFlow.send('drift_start'); else gameFlow.send('drift_end');

      this.checkLapGate();

      // Drift bar
      if (this.physics.driftFactor > 0.05) {
        this.driftEl.classList.add('td-active');
        this.driftFillEl.style.width = `${(this.physics.driftFactor * 100).toFixed(0)}%`;
      } else {
        this.driftEl.classList.remove('td-active');
      }
    }

    // Position + orient car
    this.carResult.root.setLocalPosition(this.physics.x, 0.72, this.physics.z);
    if (this.physics.speed > 0.1) {
      this.carResult.root.lookAt(new pc.Vec3(
        this.physics.x + Math.sin(this.physics.heading),
        0.72,
        this.physics.z + Math.cos(this.physics.heading),
      ));
    }

    spinWheels(this.carResult.wheels, dt, speedKmh(this.physics));
    this.updateRaceCamera(dt);

    // HUD
    const kmh = speedKmh(this.physics);
    this.updateSpeedometer(kmh);
    this.lapNumEl.textContent = String(Math.min(this.lapCount + 1, WORLD.lapsToWin));
    const lapMs = this.lapStartTime > 0 ? performance.now() - this.lapStartTime : 0;
    this.timerValEl.textContent = formatTime(lapMs);
    this.hudCoinsEl.textContent = ArcadeStore.getCoins().toLocaleString();
  }

  private updateSpeedometer(kmh: number): void {
    const pct = kmh / this.carConfig.stats.topSpeed;
    const path = speedArcPath(pct);
    this.speedArcEl.setAttribute('d', path);
    this.speedArcEl.setAttribute('stroke', speedArcColor(pct));
    this.speedNumEl.textContent = String(Math.round(kmh));
  }

  private spawnCoinPop(amount: number): void {
    const pop = document.createElement('div');
    pop.className = 'td-coin-pop';
    pop.textContent = `+${amount}`;
    pop.style.bottom = `${62 + Math.random() * 30}px`;
    this.hudEl.appendChild(pop);
    pop.addEventListener('animationend', () => pop.remove());
  }

  private checkLapGate(): void {
    const { x, z } = this.physics;
    const now = performance.now() / 1000;
    if (z < -23.2 && Math.abs(x) < 7 && (now - this.lastGateCrossTime) > 3) {
      this.lastGateCrossTime = now;
      const lapMs = this.lapStartTime > 0 ? performance.now() - this.lapStartTime : 0;

      if (this.lapCount < WORLD.lapsToWin) {
        const payout = Math.round(clamp(225 + Math.max(0, 90 - lapMs/1000) * 4, 0, 375));
        ArcadeStore.addCoins(payout);
        this.raceEarnedCoins += payout;
        this.spawnCoinPop(payout);
        if (lapMs > 0) {
          GameState.setBestLap(lapMs);
          this.lastLapMs = lapMs;
        }
      }

      this.lapCount++;
      this.lapStartTime = performance.now();
      gameFlow.send('lap_complete', this.lapCount);
    }
  }

  private updateRaceCamera(dt: number): void {
    const spd = speedKmh(this.physics);
    const dist   = clamp(9.6 + spd*0.028, 9.6, 13.2);
    const height = clamp(4.7 + spd*0.009, 4.7, 6.4);
    const ahead  = clamp(2.0 + spd*0.012, 2.0, 4.8);
    const fov    = clamp(54 + spd*0.035, 54, 70);

    const fwdX = Math.sin(this.physics.heading);
    const fwdZ = Math.cos(this.physics.heading);

    const desiredPos = new pc.Vec3(
      this.physics.x - fwdX*dist,
      0.72 + height,
      this.physics.z - fwdZ*dist,
    );
    const lookAt = new pc.Vec3(
      this.physics.x + fwdX*ahead,
      0.72 + 1.2,
      this.physics.z + fwdZ*ahead,
    );

    const s = clamp(0.12 * dt * 60, 0, 1);
    this.camPosSmooth.lerp(this.camPosSmooth, desiredPos, s);
    this.camTargetSmooth.lerp(this.camTargetSmooth, lookAt, s);

    this.camera.setPosition(this.camPosSmooth);
    this.camera.lookAt(this.camTargetSmooth);
    if (this.camera.camera) this.camera.camera.fov = lerp(this.camera.camera.fov, fov, 0.08);
  }
}

// ---------------------------------------------------------------------------
// Public bootstrap
// ---------------------------------------------------------------------------

export async function bootstrapTurboDrift(): Promise<void> {
  const rootEl = document.getElementById('app');
  if (!(rootEl instanceof HTMLElement)) {
    throw new Error('Turbo Drift: #app element is missing');
  }
  const game = new TurboDriftPlayCanvas();
  await game.init(rootEl);
}
