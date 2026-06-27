import * as THREE from 'three';
import { ArcadeStore } from '@shared/arcade-store';
import { SPOILER_OPTIONS, BUMPER_OPTIONS, HOOD_OPTIONS, UPGRADE_TIERS, WORLD } from '../constants';
import { CarMesh } from '../car/CarMesh';
import { CarPhysics } from '../car/CarPhysics';
import { tryLoadMeshoptGroup } from '../loaders/MeshoptGltfLoader';
import { GameState } from '../systems/GameState';
import { gameFlow, type FlowHooks } from '../systems/GameFlowMachine';
import { turboMusic } from '../systems/MusicStateMachine';
import type { CarConfig, CarCustomization, CustomizablePart, RaceInput } from '../types';

type GameMode = 'splash' | 'garage' | 'countdown' | 'race' | 'finish';

type ControlState = {
  left: boolean;
  right: boolean;
  throttle: boolean;
  brake: boolean;
  handbrake: boolean;
};

type UiRefs = {
  splash: HTMLDivElement;
  splashCard: HTMLDivElement;
  splashTitle: HTMLDivElement;
  splashText: HTMLParagraphElement;
  splashButton: HTMLButtonElement;
  garage: HTMLDivElement;
  garageLayout: HTMLDivElement;
  garageSummary: HTMLDivElement;
  garageStats: HTMLDivElement;
  garageCustomizer: HTMLDivElement;
  race: HTMLDivElement;
  topBarLeft: HTMLDivElement;
  topBarRight: HTMLDivElement;
  speed: HTMLDivElement;
  lap: HTMLDivElement;
  timer: HTMLDivElement;
  coins: HTMLDivElement;
  countdown: HTMLDivElement;
  controls: HTMLDivElement;
  leftBtn: HTMLButtonElement;
  rightBtn: HTMLButtonElement;
  throttleBtn: HTMLButtonElement;
  brakeBtn: HTMLButtonElement;
  handbrakeBtn: HTMLButtonElement;
};

const TURBO_DRIFT_CAR_MODEL = '/games/turbo-drift/assets/models/turbo-drift-car.glb';

function createElement<T extends keyof HTMLElementTagNameMap>(tag: T, className?: string, text?: string): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (typeof text === 'string') element.textContent = text;
  return element;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = Math.floor(ms % 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

export class TurboDriftApp {
  private readonly root: HTMLElement;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(52, 16 / 9, 0.1, 600);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly clock = new THREE.Clock();
  private readonly cameraForward = new THREE.Vector3();
  private readonly cameraTarget = new THREE.Vector3();
  private readonly cameraLookTarget = new THREE.Vector3();
  private readonly controls: ControlState = {
    left: false,
    right: false,
    throttle: false,
    brake: false,
    handbrake: false,
  };

  private readonly ui: UiRefs;
  private readonly garageGroup = new THREE.Group();
  private readonly raceGroup = new THREE.Group();
  private readonly garageCarRig = new THREE.Group();
  private readonly raceCarRig = new THREE.Group();

  private garageCar: THREE.Group | null = null;
  private raceCar: THREE.Group | null = null;
  private racePhysics: CarPhysics | null = null;
  private carAssetPrototype: THREE.Group | null = null;
  private raceTrackGateZ = -WORLD.trackRadiusZ;
  private currentMode: GameMode = 'splash';
  private currentConfig: CarConfig = GameState.getCarConfig();
  private currentCustomization: CarCustomization = { ...this.currentConfig.customization };
  private currentLap = 1;
  private lapStartMs = 0;
  private raceStartMs = 0;
  private playTimeAccumulator = 0;
  private driftActive = false;
  private lastPointerId: number | null = null;
  private titlePulse = 0;
  private splashReady = false;
  private optionButtons: Map<string, HTMLButtonElement> = new Map();
  private garageUnlockButton!: HTMLButtonElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.inset = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.touchAction = 'none';

    this.ui = this.buildUi();
    this.garageUnlockButton = this.ui.garageCustomizer.querySelector('[data-action="unlock"]') as HTMLButtonElement;
  }

  init(): void {
    this.root.appendChild(this.renderer.domElement);
    this.root.appendChild(this.ui.splash);
    this.root.appendChild(this.ui.garage);
    this.root.appendChild(this.ui.race);
    this.root.appendChild(this.ui.countdown);

    // Night sky
    this.scene.background = new THREE.Color(0x060814);
    this.scene.fog = new THREE.FogExp2(0x060814, 0.007);

    this.buildLights();
    this.buildGarageWorld();
    this.buildRaceWorld();
    this.bindUi();
    this.bindGameFlow();
    void this.preloadCarAsset();

    gameFlow.start();
    this.showSplash();

    // Forced 3-second splash — no skip allowed
    window.setTimeout(() => {
      this.splashReady = true;
      this.startExperience();
    }, 3000);

    window.addEventListener('resize', this.handleResize);
    this.handleResize();

    this.clock.start();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  private buildUi(): UiRefs {
    // ── Splash animation CSS ────────────────────────────────────────
    const animStyle = document.createElement('style');
    animStyle.textContent = `
      @keyframes tdLetterIn {
        0%   { opacity: 0; transform: translateY(-14px) scaleX(1.18); filter: blur(8px); }
        55%  { opacity: 1; transform: translateY(2px) scaleX(0.97);  filter: blur(0);   }
        80%  { opacity: 1; transform: translateY(-1px) scaleX(1);    }
        100% { opacity: 1; transform: translateY(0) scaleX(1);       }
      }
      @keyframes tdTitleGlow {
        0%   { filter: drop-shadow(0 0  6px rgba(0,212,255,0.0)); }
        50%  { filter: drop-shadow(0 0 40px rgba(0,212,255,0.9)) drop-shadow(0 0 70px rgba(180,0,255,0.6)); }
        100% { filter: drop-shadow(0 0 14px rgba(0,212,255,0.4)); }
      }
      @keyframes tdSubIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
      @keyframes tdProgress {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
      }
    `;
    document.head.appendChild(animStyle);

    // ── Splash ──────────────────────────────────────────────────────
    const splash = createElement('div') as HTMLDivElement;
    splash.className = 'hud';
    splash.style.pointerEvents = 'none';   // no interaction during countdown
    splash.style.alignItems = 'center';
    splash.style.justifyContent = 'center';
    splash.style.gap = '18px';

    const splashCard = createElement('div') as HTMLDivElement;
    splashCard.className = 'panel';
    splashCard.style.cssText = `
      width: min(560px, calc(100vw - 32px));
      padding: 36px 28px 0;
      display: grid;
      gap: 18px;
      text-align: center;
      overflow: hidden;
    `;

    // Letter-by-letter title — 11 chars, last letter completes at ≈2.5 s
    const splashTitle = createElement('div') as HTMLDivElement;
    splashTitle.style.cssText = `
      margin: 0;
      font-size: clamp(36px, 7vw, 72px);
      font-weight: 900;
      letter-spacing: 0.06em;
      background: linear-gradient(135deg, #00d4ff 0%, #cc66ff 50%, #ff4488 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: tdTitleGlow 0.7s ease-out 2.52s both;
    `;
    'TURBO DRIFT'.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? ' ' : char;
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        animation: tdLetterIn 0.38s cubic-bezier(0.22,1,0.36,1) ${(0.08 + i * 0.22).toFixed(2)}s forwards;
      `;
      splashTitle.appendChild(span);
    });

    const splashText = createElement('p', undefined, 'Night racing · Neon tuning · Touch controls') as HTMLParagraphElement;
    splashText.style.cssText = `
      margin: 0;
      opacity: 0;
      color: rgba(180, 210, 255, 0.82);
      font-size: 15px;
      line-height: 1.5;
      letter-spacing: 0.01em;
      animation: tdSubIn 0.45s ease-out 2.52s forwards;
    `;

    // Progress bar strip at the bottom of the card
    const progressWrap = createElement('div') as HTMLDivElement;
    progressWrap.style.cssText = `
      height: 3px;
      background: rgba(255,255,255,0.07);
      border-radius: 0 0 16px 16px;
      overflow: hidden;
      margin: 0 -28px;
    `;
    const progressBar = createElement('div') as HTMLDivElement;
    progressBar.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, #00d4ff, #cc44ff);
      transform-origin: left;
      transform: scaleX(0);
      animation: tdProgress 3s linear 0s forwards;
    `;
    progressWrap.appendChild(progressBar);

    // Hidden button — kept in UiRefs but not shown (auto-advance only)
    const splashButton = createElement('button', 'button', 'Start Engine') as HTMLButtonElement;
    splashButton.style.display = 'none';

    splashCard.append(splashTitle, splashText, progressWrap, splashButton);
    splash.append(splashCard);

    // ── Garage ──────────────────────────────────────────────────────
    const garage = createElement('div', 'hud') as HTMLDivElement;
    garage.style.display = 'none';

    const garageLayout = createElement('div', 'garage-layout') as HTMLDivElement;
    garageLayout.style.alignSelf = 'start';

    const garageSummary = createElement('div', 'panel') as HTMLDivElement;
    garageSummary.style.cssText = 'padding: 18px; display: grid; gap: 12px;';

    const garageStats = createElement('div', 'panel') as HTMLDivElement;
    garageStats.style.cssText = 'padding: 18px; display: grid; gap: 12px;';

    const garageCustomizer = createElement('div', 'panel') as HTMLDivElement;
    garageCustomizer.style.cssText = 'padding: 18px; display: grid; gap: 12px;';

    garageLayout.append(garageSummary, garageStats, garageCustomizer);
    garage.append(garageLayout);

    // ── Race HUD ────────────────────────────────────────────────────
    const race = createElement('div', 'hud') as HTMLDivElement;
    race.style.display = 'none';

    const topBar = createElement('div', 'topbar') as HTMLDivElement;
    const topBarLeft = createElement('div', 'stack') as HTMLDivElement;
    const topBarRight = createElement('div', 'stack') as HTMLDivElement;

    const speed = createElement('div', 'badge', '0 KM/H') as HTMLDivElement;
    speed.style.cssText += 'font-size: 15px; font-weight: 800;';
    const lap = createElement('div', 'badge', 'Lap 1/3') as HTMLDivElement;
    const timer = createElement('div', 'badge', '00:00.000') as HTMLDivElement;
    const coins = createElement('div', 'badge', '0 coins') as HTMLDivElement;
    topBarLeft.append(speed, lap, timer);
    topBarRight.append(coins);
    topBar.append(topBarLeft, topBarRight);

    const countdown = createElement('div') as HTMLDivElement;
    countdown.className = 'panel';
    countdown.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px 36px;
      font-size: 72px;
      font-weight: 900;
      letter-spacing: 0.06em;
      display: none;
      color: #00d4ff;
      text-shadow: 0 0 30px rgba(0, 212, 255, 0.7);
    `;
    countdown.textContent = '3';

    // ── Touch controls (gamepad layout) ─────────────────────────────
    const controls = createElement('div') as HTMLDivElement;
    controls.className = 'controls';
    controls.style.alignSelf = 'end';

    const leftPad = createElement('div') as HTMLDivElement;
    leftPad.className = 'ctrl-pad';

    const rightPad = createElement('div') as HTMLDivElement;
    rightPad.className = 'ctrl-pad';

    const leftBtn = createElement('button', 'ctrl-btn steer', '◄') as HTMLButtonElement;
    const rightBtn = createElement('button', 'ctrl-btn steer', '►') as HTMLButtonElement;

    const throttleBtn = createElement('button', 'ctrl-btn go', '▲') as HTMLButtonElement;
    const brakeBtn = createElement('button', 'ctrl-btn brake', '▼') as HTMLButtonElement;
    const handbrakeBtn = createElement('button', 'ctrl-btn drift', 'DRIFT') as HTMLButtonElement;

    leftPad.append(leftBtn, rightBtn);
    rightPad.append(brakeBtn, throttleBtn, handbrakeBtn);
    controls.append(leftPad, rightPad);

    race.append(topBar, countdown, controls);

    // ── Garage customizer content ────────────────────────────────────
    const optionButtons = new Map<string, HTMLButtonElement>();
    const parts: Array<{ part: CustomizablePart; title: string; options: ReadonlyArray<{ style: string; label: string; cost: number }> }> = [
      { part: 'bumper', title: 'Front bumper', options: BUMPER_OPTIONS },
      { part: 'hood', title: 'Hood', options: HOOD_OPTIONS },
      { part: 'spoiler', title: 'Rear spoiler', options: SPOILER_OPTIONS },
    ];

    const summaryTitle = createElement('div') as HTMLDivElement;
    summaryTitle.style.cssText = 'font-size: 28px; font-weight: 900; letter-spacing: 0.04em;';
    summaryTitle.textContent = 'Garage';
    const summarySubtitle = createElement('div') as HTMLDivElement;
    summarySubtitle.style.color = 'rgba(180, 210, 255, 0.75)';
    summarySubtitle.textContent = 'Tune the build, then hit the night circuit.';
    const summaryMeta = createElement('div') as HTMLDivElement;
    summaryMeta.style.cssText = 'display: grid; gap: 8px;';
    garageSummary.append(summaryTitle, summarySubtitle, summaryMeta);

    const statsTitle = createElement('div') as HTMLDivElement;
    statsTitle.style.cssText = 'font-size: 18px; font-weight: 800;';
    statsTitle.textContent = 'Stats';
    const statsBody = createElement('div') as HTMLDivElement;
    statsBody.style.cssText = 'display: grid; gap: 8px;';
    garageStats.append(statsTitle, statsBody);

    const customizerTitle = createElement('div') as HTMLDivElement;
    customizerTitle.style.cssText = 'font-size: 18px; font-weight: 800;';
    customizerTitle.textContent = 'Customize';
    garageCustomizer.append(customizerTitle);

    parts.forEach((entry) => {
      const card = createElement('div') as HTMLDivElement;
      card.style.cssText = 'display: grid; gap: 10px; padding-top: 6px;';

      const heading = createElement('div') as HTMLDivElement;
      heading.style.cssText = 'font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: rgba(0, 200, 255, 0.7);';
      heading.textContent = entry.title;

      const row = createElement('div') as HTMLDivElement;
      row.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(88px, 1fr)); gap: 8px;';

      entry.options.forEach((option) => {
        const button = createElement('button', 'button secondary') as HTMLButtonElement;
        button.textContent = option.cost === 0 ? option.label : `${option.label} · ${option.cost}`;
        button.dataset.part = entry.part;
        button.dataset.style = option.style;
        row.append(button);
        optionButtons.set(`${entry.part}:${option.style}`, button);
      });

      card.append(heading, row);
      garageCustomizer.append(card);
    });

    const footerRow = createElement('div') as HTMLDivElement;
    footerRow.style.cssText = 'display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding-top: 4px;';

    const unlock = createElement('button', 'button secondary') as HTMLButtonElement;
    unlock.dataset.action = 'unlock';
    unlock.textContent = 'Unlock Sedan';
    const raceBtn = createElement('button', 'button') as HTMLButtonElement;
    raceBtn.dataset.action = 'race';
    raceBtn.textContent = 'Race';
    footerRow.append(unlock, raceBtn);
    garageCustomizer.append(footerRow);

    (garageSummary.children[2] as HTMLDivElement).dataset.summaryMeta = 'true';
    (garageStats.children[1] as HTMLDivElement).dataset.statsBody = 'true';

    this.optionButtons = optionButtons;

    return {
      splash, splashCard, splashTitle, splashText, splashButton,
      garage, garageLayout, garageSummary, garageStats, garageCustomizer,
      race, topBarLeft, topBarRight, speed, lap, timer, coins,
      countdown, controls, leftBtn, rightBtn, throttleBtn, brakeBtn, handbrakeBtn,
    };
  }

  private bindUi(): void {
    // splashButton is hidden; kept in DOM only for UiRefs compatibility
    this.ui.splashButton.addEventListener('click', () => {
      if (this.splashReady) this.startExperience();
    });

    this.ui.garageCustomizer.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const part = target.dataset.part as CustomizablePart | undefined;
      const style = target.dataset.style;
      const action = target.dataset.action;

      if (part && style) {
        this.applyCustomization(part, style);
      } else if (action === 'unlock') {
        this.unlockSedan();
      } else if (action === 'race') {
        this.beginRaceCountdown();
      }
    });

    const bindControl = (button: HTMLButtonElement, key: keyof ControlState) => {
      const set = (value: boolean) => { this.controls[key] = value; };
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        this.lastPointerId = event.pointerId;
        set(true);
        this.armAudio();
      });
      button.addEventListener('pointerup', (event) => {
        event.preventDefault();
        set(false);
        if (this.lastPointerId === event.pointerId) this.lastPointerId = null;
      });
      button.addEventListener('pointercancel', () => set(false));
      button.addEventListener('pointerleave', () => set(false));
    };

    bindControl(this.ui.leftBtn, 'left');
    bindControl(this.ui.rightBtn, 'right');
    bindControl(this.ui.throttleBtn, 'throttle');
    bindControl(this.ui.brakeBtn, 'brake');
    bindControl(this.ui.handbrakeBtn, 'handbrake');

    window.addEventListener('keydown', (event) => {
      this.armAudio();
      this.keyboardDown(event.code);
    });
    window.addEventListener('keyup', (event) => {
      this.keyboardUp(event.code);
    });
  }

  private bindGameFlow(): void {
    const hooks: FlowHooks = {
      onGarageRefresh: () => { this.enterGarage(); },
      onCountdownTick: (value) => {
        this.ui.countdown.style.display = 'block';
        this.ui.countdown.textContent = String(value);
      },
      onCountdownFinished: () => { this.ui.countdown.style.display = 'none'; },
      onRaceFinished: () => { this.finishRace(); },
      onReturnToGarage: () => { this.enterGarage(); },
    };
    gameFlow.setHooks(hooks);
  }

  private buildLights(): void {
    // Cool night ambient
    const ambient = new THREE.HemisphereLight(0x2244aa, 0x080c18, 1.1);
    // Moonlight
    const moon = new THREE.DirectionalLight(0x9aaedd, 1.6);
    moon.position.set(-20, 38, 12);
    // Subtle rim from opposite side
    const rim = new THREE.DirectionalLight(0x3355bb, 0.4);
    rim.position.set(14, 10, -18);
    this.scene.add(ambient, moon, rim);
  }

  private buildGarageWorld(): void {
    this.garageGroup.clear();
    this.garageGroup.visible = false;

    // Dark metallic floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x080b18, roughness: 0.6, metalness: 0.35 }),
    );
    floor.rotation.x = -Math.PI / 2;
    this.garageGroup.add(floor);

    // Neon-blue grid
    const grid = new THREE.GridHelper(120, 30, 0x00d4ff, 0x1a2845);
    grid.position.y = 0.01;
    this.garageGroup.add(grid);

    // Podium
    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(4.8, 5.4, 0.38, 28),
      new THREE.MeshStandardMaterial({ color: 0x10172a, roughness: 0.5, metalness: 0.25 }),
    );
    podium.position.set(0, 0.19, 0);
    this.garageGroup.add(podium);

    // Neon halo ring (cyan)
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(5.6, 0.1, 10, 56),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff }),
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 1.8, 0);
    this.garageGroup.add(halo);

    // Inner halo ring (magenta)
    const haloInner = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.06, 8, 44),
      new THREE.MeshBasicMaterial({ color: 0xff00cc }),
    );
    haloInner.rotation.x = Math.PI / 2;
    haloInner.position.set(0, 0.5, 0);
    this.garageGroup.add(haloInner);

    // Backdrop wall
    const backdrop = new THREE.Mesh(
      new THREE.BoxGeometry(28, 9, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0d1428, roughness: 0.85, metalness: 0.12 }),
    );
    backdrop.position.set(0, 4.2, -8);
    this.garageGroup.add(backdrop);

    // Vertical accent panels on backdrop
    for (let i = 0; i < 8; i += 1) {
      const x = -10 + i * 2.8;
      const panelColor = i % 2 === 0 ? 0x18274a : 0x142040;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 5.4, 0.14),
        new THREE.MeshStandardMaterial({ color: panelColor, roughness: 0.7, metalness: 0.15 }),
      );
      panel.position.set(x, 2.7, -7.6);
      this.garageGroup.add(panel);

      // Emissive top strip on each panel
      if (i % 2 === 0) {
        const strip = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.06, 0.16),
          new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? 0x00d4ff : 0xff00cc }),
        );
        strip.position.set(x, 5.4, -7.52);
        this.garageGroup.add(strip);
      }
    }

    // Floor neon lines
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    for (let i = -2; i <= 2; i += 1) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 22), lineMat);
      line.position.set(i * 4, 0.005, -2);
      this.garageGroup.add(line);
    }

    // Garage neon point lights
    const neonBlue = new THREE.PointLight(0x00d4ff, 6, 22);
    neonBlue.position.set(0, 3.5, 0);
    this.garageGroup.add(neonBlue);

    const neonMagenta = new THREE.PointLight(0xff00cc, 3, 14);
    neonMagenta.position.set(-6, 1.5, 2);
    this.garageGroup.add(neonMagenta);

    const warmFill = new THREE.PointLight(0xff6030, 2, 10);
    warmFill.position.set(6, 2, -4);
    this.garageGroup.add(warmFill);

    this.garageCarRig.clear();
    this.garageCarRig.position.set(0, 0.75, 0);
    this.garageGroup.add(this.garageCarRig);

    this.refreshGarageCar();
    this.scene.add(this.garageGroup);
  }

  private buildRaceWorld(): void {
    this.raceGroup.clear();
    this.raceGroup.visible = false;

    const rx = WORLD.trackRadiusX;
    const rz = WORLD.trackRadiusZ;
    const seg = WORLD.segmentCount;

    // Dark asphalt ground
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(260, 56),
      new THREE.MeshStandardMaterial({ color: 0x0a0b10, roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.08;
    this.raceGroup.add(ground);

    // Star field (hemisphere distribution)
    const starCount = 600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.44;
      const r = 240 + Math.random() * 40;
      starPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false }),
    );
    this.raceGroup.add(stars);

    // Track road segments
    const roadMatA = new THREE.MeshStandardMaterial({ color: 0x14162a, roughness: 0.88, metalness: 0.06 });
    const roadMatB = new THREE.MeshStandardMaterial({ color: 0x0f1120, roughness: 0.88, metalness: 0.06 });
    const roadGeo = new THREE.BoxGeometry(8, 0.18, 12);

    for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      const nextT = ((i + 1) / seg) * Math.PI * 2;
      const mesh = new THREE.Mesh(roadGeo, i % 2 === 0 ? roadMatA : roadMatB);
      mesh.position.set(Math.cos(t) * rx, 0, Math.sin(t) * rz);
      mesh.lookAt(Math.cos(nextT) * rx, 0, Math.sin(nextT) * rz);
      this.raceGroup.add(mesh);

      // White edge strips
      const edgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, emissive: 0xffffff, emissiveIntensity: 0.1 });
      const edgeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 11.5), edgeMat);
      edgeLeft.position.copy(mesh.position);
      edgeLeft.rotation.copy(mesh.rotation);
      edgeLeft.translateX(-3.6);
      this.raceGroup.add(edgeLeft);

      const edgeRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 11.5), edgeMat);
      edgeRight.position.copy(mesh.position);
      edgeRight.rotation.copy(mesh.rotation);
      edgeRight.translateX(3.6);
      this.raceGroup.add(edgeRight);

      // Yellow centre dashes (every other segment)
      if (i % 2 === 0) {
        const dash = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.22, 4.5),
          new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffcc00, emissiveIntensity: 0.5 }),
        );
        dash.position.copy(mesh.position);
        dash.rotation.copy(mesh.rotation);
        dash.position.y += 0.005;
        this.raceGroup.add(dash);
      }
    }

    // Start / finish line (white band + arch)
    const finishMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.6 });
    const finishLine = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.22, 1.4), finishMat);
    finishLine.position.set(0, 0.01, -rz);
    this.raceGroup.add(finishLine);

    // Finish arch
    const archMat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 1.2 });
    const archLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5, 0.35), archMat);
    archLeft.position.set(-4.8, 2.5, -rz - 0.2);
    const archRight = archLeft.clone();
    archRight.position.set(4.8, 2.5, -rz - 0.2);
    const archCross = new THREE.Mesh(new THREE.BoxGeometry(10, 0.35, 0.35), archMat);
    archCross.position.set(0, 5.1, -rz - 0.2);
    this.raceGroup.add(archLeft, archRight, archCross);

    // Inner curb (red/white)
    const innerRx = rx - 4.8;
    const innerRz = rz - 4.8;
    for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      const nextT = ((i + 1) / seg) * Math.PI * 2;
      const curb = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.2, 2.2),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xff2233 : 0xeeeeee, roughness: 0.7 }),
      );
      curb.position.set(Math.cos(t) * innerRx, 0.1, Math.sin(t) * innerRz);
      curb.lookAt(Math.cos(nextT) * innerRx, curb.position.y, Math.sin(nextT) * innerRz);
      this.raceGroup.add(curb);
    }

    // Outer barriers (blue/white Jersey barrier style)
    const outerRx = rx + 5.2;
    const outerRz = rz + 5.2;
    for (let i = 0; i < seg; i++) {
      const t = (i / seg) * Math.PI * 2;
      const nextT = ((i + 1) / seg) * Math.PI * 2;
      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.1, 2.2),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x1133cc : 0xfafafa, roughness: 0.75 }),
      );
      barrier.position.set(Math.cos(t) * outerRx, 0.55, Math.sin(t) * outerRz);
      barrier.lookAt(Math.cos(nextT) * outerRx, barrier.position.y, Math.sin(nextT) * outerRz);
      this.raceGroup.add(barrier);
    }

    // Buildings with neon windows
    const buildingAngles = 14;
    for (let i = 0; i < buildingAngles; i++) {
      const angle = (i / buildingAngles) * Math.PI * 2;
      const bx = Math.cos(angle) * (rx + 18);
      const bz = Math.sin(angle) * (rz + 18);
      const h = 5 + (i % 5) * 3.5;
      const w = 2.5 + (i % 3) * 1.0;
      const d = 2.5 + (i % 2) * 0.8;

      const building = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: 0x0a0d1a, roughness: 0.9, metalness: 0.05 }),
      );
      building.position.set(bx, h / 2, bz);
      building.lookAt(0, building.position.y, 0);
      this.raceGroup.add(building);

      // Emissive windows (2–4 per building)
      const winCount = 2 + (i % 3);
      const winColors = [0x00ccff, 0xff00cc, 0xffaa00, 0x44ff88];
      for (let w2 = 0; w2 < winCount; w2++) {
        const win = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.45, 0.18),
          new THREE.MeshStandardMaterial({
            color: winColors[(i + w2) % winColors.length],
            emissive: winColors[(i + w2) % winColors.length],
            emissiveIntensity: 2.5,
          }),
        );
        win.position.copy(building.position);
        win.rotation.copy(building.rotation);
        win.translateY((h * 0.2) + w2 * (h * 0.18));
        win.translateZ(-d * 0.5 - 0.1);
        this.raceGroup.add(win);
      }
    }

    // Pine trees (cone geometry)
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2;
      const treeRx = rx + 11 + (i % 2) * 4;
      const treeRz = rz + 11 + ((i + 1) % 2) * 4;
      const tx = Math.cos(angle) * treeRx;
      const tz = Math.sin(angle) * treeRz;

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.22, 2.0, 6),
        new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 1 }),
      );
      trunk.position.set(tx, 1.0, tz);

      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(1.4 - (i % 3) * 0.15, 3.5 + (i % 2) * 1.0, 7),
        new THREE.MeshStandardMaterial({
          color: i % 3 === 0 ? 0x0a4a20 : i % 3 === 1 ? 0x0d5a28 : 0x0b6630,
          flatShading: true,
          roughness: 1,
        }),
      );
      canopy.position.set(tx, 3.8, tz);
      this.raceGroup.add(trunk, canopy);
    }

    // Background silhouette mountains
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const mx = Math.cos(angle) * (rx + 40);
      const mz = Math.sin(angle) * (rz + 40);
      const mh = 16 + (i % 4) * 7;
      const mountain = new THREE.Mesh(
        new THREE.ConeGeometry(7 + (i % 3) * 3, mh, 5),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0x0d1128 : 0x0a0e1e, flatShading: true, roughness: 1 }),
      );
      mountain.position.set(mx, mh / 2 - 2, mz);
      this.raceGroup.add(mountain);
    }

    // Neon atmosphere lights
    const raceNeonA = new THREE.PointLight(0x0066ff, 4, 90);
    raceNeonA.position.set(rx, 6, 0);
    const raceNeonB = new THREE.PointLight(0xff00aa, 3.5, 80);
    raceNeonB.position.set(-rx, 5, 0);
    const raceNeonC = new THREE.PointLight(0x00ffcc, 3, 70);
    raceNeonC.position.set(0, 5, rz);
    this.raceGroup.add(raceNeonA, raceNeonB, raceNeonC);

    this.raceCarRig.clear();
    this.raceCarRig.position.set(0, 0.72, -(WORLD.trackRadiusZ - 2));
    this.raceGroup.add(this.raceCarRig);

    this.scene.add(this.raceGroup);
  }

  private refreshGarageCar(): void {
    if (this.garageCar) this.garageCarRig.remove(this.garageCar);
    this.currentConfig = GameState.getCarConfig();
    this.currentCustomization = { ...this.currentConfig.customization };
    this.garageCar = this.buildCarVisual();
    this.garageCar.position.set(0, 0, 0);
    this.garageCar.rotation.set(0, Math.PI * 0.7, 0);
    this.garageCarRig.add(this.garageCar);
    this.updateGarageUi();
  }

  private refreshRaceCar(): void {
    if (this.raceCar) this.raceCarRig.remove(this.raceCar);
    this.currentConfig = GameState.getCarConfig();
    this.currentCustomization = { ...this.currentConfig.customization };
    this.raceCar = this.buildCarVisual();
    this.raceCar.position.set(0, 0, 0);
    this.raceCar.rotation.set(0, Math.PI, 0);
    this.raceCarRig.add(this.raceCar);
    this.racePhysics = new CarPhysics(this.raceCar, this.currentConfig.stats);
  }

  private updateGarageUi(): void {
    const state = GameState.load();
    const playMinutes = Math.floor(state.playTimeMs / 60000);
    const tier = UPGRADE_TIERS[state.currentTier];

    const summaryMeta = this.ui.garageSummary.children[2] as HTMLDivElement;
    summaryMeta.innerHTML = '';
    const items = [
      `Coins: ${state.currency}`,
      `Tier: ${tier.label}`,
      `Played: ${playMinutes} min`,
      `Best lap: ${GameState.getBestLap() === null ? '--:--.---' : formatTime(GameState.getBestLap() as number)}`,
    ];
    items.forEach((item) => {
      const line = createElement('div', 'badge', item) as HTMLDivElement;
      summaryMeta.append(line);
    });

    const statsBody = this.ui.garageStats.children[1] as HTMLDivElement;
    statsBody.innerHTML = '';
    [
      `Top speed ${tier.stats.topSpeed} km/h`,
      `Acceleration ${tier.stats.acceleration.toFixed(1)}`,
      `Handling ${tier.stats.handling.toFixed(2)}`,
      `Braking ${tier.stats.braking.toFixed(2)}`,
    ].forEach((item) => {
      const line = createElement('div', 'badge', item) as HTMLDivElement;
      statsBody.append(line);
    });

    this.garageUnlockButton.style.display =
      state.currentTier === 'hatchback' && (GameState.canUnlockSedanByTime() || GameState.canUnlockSedanByCurrency())
        ? 'block'
        : 'none';

    this.optionButtons.forEach((button, key) => {
      const [part, option] = key.split(':');
      const selected =
        (part === 'bumper' && this.currentCustomization.bumper === option) ||
        (part === 'hood' && this.currentCustomization.hood === option) ||
        (part === 'spoiler' && this.currentCustomization.spoiler === option);
      button.classList.toggle('secondary', !selected);
      button.style.background = selected
        ? 'linear-gradient(180deg, rgba(0, 180, 255, 0.9) 0%, rgba(0, 80, 200, 0.9) 100%)'
        : '';
    });
  }

  private updateRaceUi(nowMs: number): void {
    const currentState = gameFlow.currentState;
    const speedKph = Math.round(this.racePhysics?.getSpeedKph() ?? 0);
    this.ui.speed.textContent = `${speedKph} KM/H`;
    this.ui.lap.textContent = `Lap ${this.currentLap}/${WORLD.lapsToWin}`;
    this.ui.timer.textContent = formatTime(nowMs - this.lapStartMs);
    this.ui.coins.textContent = `${GameState.load().currency} coins`;
    this.ui.countdown.style.display = currentState === 'race_countdown' ? 'block' : 'none';
  }

  private showSplash(): void {
    this.currentMode = 'splash';
    this.splashReady = false;
    this.ui.splash.style.display = 'flex';
    this.ui.garage.style.display = 'none';
    this.ui.race.style.display = 'none';
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 1, 0);
  }

  private enterGarage(): void {
    this.currentMode = 'garage';
    this.ui.splash.style.display = 'none';
    this.ui.garage.style.display = 'flex';
    this.ui.race.style.display = 'none';
    this.garageGroup.visible = true;
    this.raceGroup.visible = false;
    this.currentConfig = GameState.getCarConfig();
    this.refreshGarageCar();
    this.camera.position.set(0, 4.1, 10.6);
    this.camera.lookAt(0, 1, 0);
  }

  private enterRace(): void {
    this.currentMode = 'race';
    this.ui.garage.style.display = 'none';
    this.ui.race.style.display = 'flex';
    this.garageGroup.visible = false;
    this.raceGroup.visible = true;
    this.refreshRaceCar();
    this.currentLap = 1;
    this.raceStartMs = performance.now();
    this.lapStartMs = this.raceStartMs;
    this.playTimeAccumulator = 0;
    this.syncRaceCamera(true);
  }

  private finishRace(): void {
    this.currentMode = 'finish';
    this.ui.countdown.textContent = 'FINISH!';
    this.ui.countdown.style.display = 'block';
    this.ui.countdown.style.color = '#ffcc00';
    this.ui.countdown.style.textShadow = '0 0 30px rgba(255, 200, 0, 0.8)';
    window.setTimeout(() => gameFlow.send('return_to_garage'), 1400);
  }

  private startExperience(): void {
    this.armAudio();
    this.showSplash();
    gameFlow.resetForGarage();
    gameFlow.start();
    this.enterGarage();
  }

  private applyCustomization(part: CustomizablePart, style: string): void {
    const costMap = new Map<string, number>();
    BUMPER_OPTIONS.forEach((o) => costMap.set(`bumper:${o.style}`, o.cost));
    HOOD_OPTIONS.forEach((o) => costMap.set(`hood:${o.style}`, o.cost));
    SPOILER_OPTIONS.forEach((o) => costMap.set(`spoiler:${o.style}`, o.cost));
    const cost = costMap.get(`${part}:${style}`) ?? 0;

    if (cost > 0 && !ArcadeStore.spendCoins(cost)) return;

    if (part === 'bumper') {
      GameState.setCustomization(part, style as CarCustomization['bumper']);
    } else if (part === 'hood') {
      GameState.setCustomization(part, style as CarCustomization['hood']);
    } else {
      GameState.setCustomization(part, style as CarCustomization['spoiler']);
    }

    this.currentConfig = GameState.getCarConfig();
    this.currentCustomization = { ...this.currentConfig.customization };
    this.refreshGarageCar();
    gameFlow.send('customize');
    gameFlow.send('customize_done');
  }

  private unlockSedan(): void {
    if (GameState.unlockSedan()) {
      this.currentConfig = GameState.getCarConfig();
      this.currentCustomization = { ...this.currentConfig.customization };
      this.refreshGarageCar();
      gameFlow.send('unlock_claimed');
    }
  }

  private beginRaceCountdown(): void {
    this.currentConfig = GameState.getCarConfig();
    this.currentCustomization = { ...this.currentConfig.customization };
    gameFlow.send('start_race');
    this.ui.countdown.textContent = '3';
    this.ui.countdown.style.color = '#00d4ff';
    this.ui.countdown.style.textShadow = '0 0 30px rgba(0, 212, 255, 0.7)';
    this.ui.countdown.style.display = 'block';
  }

  private armAudio(): void {
    // turboMusic.init() is idempotent — re-calling from a gesture resumes a suspended context.
    void turboMusic.init();
  }

  private keyboardDown(code: string): void {
    switch (code) {
      case 'ArrowLeft': case 'KeyA': this.controls.left = true; break;
      case 'ArrowRight': case 'KeyD': this.controls.right = true; break;
      case 'ArrowUp': case 'KeyW': this.controls.throttle = true; break;
      case 'ArrowDown': case 'KeyS': this.controls.brake = true; break;
      case 'Space': this.controls.handbrake = true; break;
      case 'Enter':
        if (this.currentMode === 'splash' && this.splashReady) this.startExperience();
        break;
      default: break;
    }
  }

  private keyboardUp(code: string): void {
    switch (code) {
      case 'ArrowLeft': case 'KeyA': this.controls.left = false; break;
      case 'ArrowRight': case 'KeyD': this.controls.right = false; break;
      case 'ArrowUp': case 'KeyW': this.controls.throttle = false; break;
      case 'ArrowDown': case 'KeyS': this.controls.brake = false; break;
      case 'Space': this.controls.handbrake = false; break;
      default: break;
    }
  }

  private readInput(): RaceInput {
    const steer = (this.controls.left ? 1 : 0) - (this.controls.right ? 1 : 0);
    const throttle = (this.controls.throttle ? 1 : 0) - (this.controls.brake ? 0.45 : 0);
    return {
      throttle: clamp(throttle, -0.4, 1),
      brake: this.controls.brake,
      steer: clamp(steer, -1, 1),
      handbrake: this.controls.handbrake,
    };
  }

  private animate(now: number): void {
    const deltaMs = this.clock.getDelta() * 1000;
    gameFlow.update(deltaMs);

    if (this.currentMode === 'garage') {
      this.updateGarageAnimation(deltaMs);
    }

    if (this.currentMode === 'race' || gameFlow.currentState === 'race_active' || gameFlow.currentState === 'race_countdown') {
      this.updateRaceLoop(deltaMs, now);
      if (gameFlow.currentState === 'race_active' && this.currentMode !== 'race') {
        this.enterRace();
      }
    }

    if (this.currentMode === 'splash') {
      this.titlePulse += deltaMs * 0.002;
      this.ui.splashTitle.style.transform = `translateY(${Math.sin(this.titlePulse) * 2.5}px)`;
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  private updateGarageAnimation(deltaMs: number): void {
    if (this.garageCar) {
      this.garageCar.rotation.y += deltaMs * 0.00032;
      this.garageCar.position.y = Math.sin(performance.now() * 0.0015) * 0.07;
      // Spin wheels in garage for visual flair
      CarMesh.spinWheels(this.garageCar, deltaMs, 18);
    }
    this.camera.position.lerp(new THREE.Vector3(0, 4.2, 10.3), 0.055);
    this.camera.lookAt(0, 1, 0);
  }

  private updateRaceLoop(deltaMs: number, now: number): void {
    if (!this.racePhysics || !this.raceCar) return;

    if (gameFlow.currentState !== 'race_countdown') {
      const input = this.readInput();
      this.racePhysics.update(deltaMs, input);

      // Spin wheels proportional to speed
      CarMesh.spinWheels(this.raceCar, deltaMs, this.racePhysics.getSpeedKph());
      this.syncRaceCamera(false);

      this.updateRaceLap(now);

      this.playTimeAccumulator += deltaMs;
      if (this.playTimeAccumulator >= 1000) {
        GameState.addPlayTime(this.playTimeAccumulator);
        this.playTimeAccumulator = 0;
      }

      const drifting = input.handbrake && this.racePhysics.getSpeedKph() > 70;
      if (drifting && !this.driftActive) {
        this.driftActive = true;
        gameFlow.send('drift_start');
      } else if (!drifting && this.driftActive) {
        this.driftActive = false;
        gameFlow.send('drift_end');
      }
    }

    this.updateRaceUi(now);
  }

  private updateRaceLap(now: number): void {
    if (!this.raceCar || !this.racePhysics) return;

    const position = this.raceCar.position;
    const insideGate = Math.abs(position.x) < 6 && position.z < this.raceTrackGateZ + 4 && position.z > this.raceTrackGateZ - 6;

    if (insideGate && now - this.lapStartMs > 2500) {
      const lapTime = now - this.lapStartMs;
      this.lapStartMs = now;
      GameState.setBestLap(lapTime);
      const payout = 225 + Math.max(0, 90 - Math.floor(lapTime / 1000)) * 4;
      ArcadeStore.addCoins(payout);
      const completedLap = this.currentLap;
      gameFlow.send('lap_complete', completedLap);
      this.currentLap = Math.min(completedLap + 1, WORLD.lapsToWin);
    }
  }

  private handleResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  private buildCarVisual(): THREE.Group {
    if (this.carAssetPrototype) {
      const asset = this.carAssetPrototype.clone(true);
      asset.visible = true;
      return asset;
    }

    return CarMesh.build(this.currentConfig);
  }

  private async preloadCarAsset(): Promise<void> {
    const model = await tryLoadMeshoptGroup(TURBO_DRIFT_CAR_MODEL);
    if (!model) return;

    model.visible = false;
    model.scale.setScalar(1.16);
    model.rotation.set(0, Math.PI, 0);
    this.carAssetPrototype = model;
    if (this.currentMode === 'garage') this.refreshGarageCar();
    if (this.currentMode === 'race') this.refreshRaceCar();
  }

  private syncRaceCamera(force = false): void {
    if (!this.racePhysics || !this.raceCar) return;

    const position = this.raceCar.position;
    const heading = this.racePhysics.getHeading();
    const speed = this.racePhysics.getSpeedKph();

    this.cameraForward.set(-Math.sin(heading), 0, -Math.cos(heading));

    const followDistance = clamp(9.6 + speed * 0.028, 9.6, 13.2);
    const followHeight = clamp(4.7 + speed * 0.009, 4.7, 6.4);
    const lookAhead = clamp(2.0 + speed * 0.012, 2.0, 4.8);

    this.cameraTarget
      .copy(position)
      .addScaledVector(this.cameraForward, -followDistance)
      .setY(position.y + followHeight);

    this.cameraLookTarget
      .copy(position)
      .addScaledVector(this.cameraForward, lookAhead)
      .setY(position.y + 1.35);

    if (force || this.camera.position.distanceToSquared(this.cameraTarget) > 36) {
      this.camera.position.copy(this.cameraTarget);
    } else {
      this.camera.position.lerp(this.cameraTarget, 0.12);
    }

    this.camera.lookAt(this.cameraLookTarget);

    const targetFov = clamp(54 + speed * 0.035, 54, 70);
    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = targetFov;
      this.camera.updateProjectionMatrix();
    }
  }
}
