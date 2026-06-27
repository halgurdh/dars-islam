import Phaser from 'phaser';
import { Scene3D } from '@enable3d/phaser-extension';
import * as THREE from 'three';
import { ArcadeBar } from '@shared/arcade-bar';
import { ArcadeStore } from '@shared/arcade-store';
import { CarMesh } from '../car/CarMesh';
import { BUMPER_OPTIONS, HOOD_OPTIONS, SPOILER_OPTIONS, UPGRADE_TIERS } from '../constants';
import { GameState } from '../systems/GameState';
import { gameFlow } from '../systems/GameFlowMachine';
import { turboMusic } from '../systems/MusicStateMachine';
import type {
  BumperStyle,
  CarConfig,
  CustomizablePart,
  GameStateData,
  HoodStyle,
  SpoilerStyle,
} from '../types';

type PartOption<T extends string> = { style: T; label: string; cost: number };

type ButtonRefs = {
  background: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  style: string;
  cost: number;
  baseLabel: string;
};

type OverlayButton = {
  background: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  hitZone: Phaser.GameObjects.Zone;
  setVisible(visible: boolean): void;
};

type GarageThird = Scene3D & {
  third: {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
  };
};

export class GarageScene extends Scene3D {
  private arcadeBar: ArcadeBar | null = null;
  private state!: GameStateData;
  private infoText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  private unlockButton!: OverlayButton;
  private unlockLabel!: Phaser.GameObjects.Text;
  private unlockGlow!: Phaser.GameObjects.Rectangle;
  private previewLabel!: Phaser.GameObjects.Text;
  private partButtons: ButtonRefs[] = [];
  private unlockVisible = false;
  private previewCar: THREE.Group | null = null;
  private previewPlatform: THREE.Mesh | null = null;
  private previewBackdrop: THREE.Group | null = null;
  private previewYaw = Math.PI * 0.72;

  constructor() {
    super('Garage');
  }

  init(): void {
    this.accessThirdDimension();
  }

  create(): void {
    gameFlow.start();
    this.state = GameState.load();
    this.registry.set('turboDriftConfig', GameState.getCarConfig());
    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.input.once('pointerdown', () => { void turboMusic.init(); });
    this.input.keyboard?.once('keydown', () => { void turboMusic.init(); });

    this.arcadeBar = new ArcadeBar();
    gameFlow.setHooks({
      onGarageRefresh: () => {
        if (this.scene.isActive()) {
          this.refresh();
        }
      },
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameFlow.clearHooks();
      this.arcadeBar?.destroy();
      this.arcadeBar = null;
      this.disposePreview();
    });

    this.setup3DPreview();
    this.buildOverlay();
    this.refresh();
  }

  update(_: number, delta: number): void {
    gameFlow.update(delta);
    this.animatePreview(delta);

    const shouldShowUnlock = this.state.currentTier === 'hatchback'
      && (GameState.canUnlockSedanByTime() || GameState.canUnlockSedanByCurrency());

    if (shouldShowUnlock !== this.unlockVisible) {
      this.unlockVisible = shouldShowUnlock;
      this.unlockGlow.setVisible(shouldShowUnlock);
      this.unlockButton.setVisible(shouldShowUnlock);
      gameFlow.send(shouldShowUnlock ? 'unlock_available' : 'unlock_hidden');
    }
  }

  private setup3DPreview(): void {
    const thirdScene = this as GarageThird;
    thirdScene.third.renderer.shadowMap.enabled = false;
    thirdScene.third.scene.background = new THREE.Color(0x07080f);

    const ambient = new THREE.AmbientLight(0xffffff, 0.82);
    const key = new THREE.DirectionalLight(0xffffff, 1.25);
    key.position.set(6, 10, 10);
    const rim = new THREE.DirectionalLight(0x6bd6ff, 0.55);
    rim.position.set(-8, 5, -8);
    thirdScene.third.scene.add(ambient, key, rim);

    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(4.4, 4.9, 0.24, 24),
      new THREE.MeshLambertMaterial({ color: 0x111827, flatShading: true }),
    );
    platform.position.set(0, -0.42, 0);
    thirdScene.third.scene.add(platform);
    this.previewPlatform = platform;

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(5.1, 0.08, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0x00d4ff }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, -0.28, 0);

    const arch = new THREE.Group();
    const leftPillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3.8, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x20283a, flatShading: true }),
    );
    leftPillar.position.set(-5.4, 1.6, -1.1);
    const rightPillar = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3.8, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x20283a, flatShading: true }),
    );
    rightPillar.position.set(5.4, 1.6, -1.1);
    const header = new THREE.Mesh(
      new THREE.BoxGeometry(11.2, 0.2, 0.2),
      new THREE.MeshLambertMaterial({ color: 0x20283a, flatShading: true }),
    );
    header.position.set(0, 3.45, -1.1);
    arch.add(leftPillar, rightPillar, header, ring);
    thirdScene.third.scene.add(arch);
    this.previewBackdrop = arch;

    const camera = thirdScene.third.camera as THREE.PerspectiveCamera;
    camera.position.set(0, 2.5, 8.6);
    camera.lookAt(0, 0.7, 0);

    this.rebuildPreviewCar();
  }

  private buildOverlay(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x05070b, 0.32);
    this.add.rectangle(246, height * 0.5, 364, height * 0.76, 0x101827, 0.74).setStrokeStyle(2, 0x2f4d72, 0.92);
    this.add.rectangle(width - 270, height * 0.5, 476, height * 0.76, 0x0d1320, 0.78).setStrokeStyle(2, 0x28374b, 0.92);

    this.add.text(72, 52, 'TURBO DRIFT GARAGE', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#f6f8ff',
      stroke: '#05070b',
      strokeThickness: 6,
    });

    this.infoText = this.add.text(72, 102, '', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#b7c7dc',
      lineSpacing: 10,
    });

    this.statsText = this.add.text(width * 0.58, 114, '', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#e7efff',
      lineSpacing: 10,
    });

    this.previewLabel = this.add.text(width * 0.5, height - 210, '3D PREVIEW BAY', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#cde7ff',
      stroke: '#05070b',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(300);

    this.createPartPanel('Front Bumper', 545, 240, 'bumper', BUMPER_OPTIONS);
    this.createPartPanel('Hood', 545, 386, 'hood', HOOD_OPTIONS);
    this.createPartPanel('Rear Spoiler', 545, 532, 'spoiler', SPOILER_OPTIONS);

    this.unlockGlow = this.add.rectangle(246, height - 94, 330, 68, 0x00d4ff, 0.18).setVisible(false);
    this.unlockButton = this.makeButton(246, height - 94, 318, 56, 'UNLOCK SEDAN - 5000 COINS', () => {
      if (GameState.unlockSedan()) {
        gameFlow.send('unlock_claimed');
        this.refresh();
      }
    });
    this.unlockLabel = this.unlockButton.label;

    this.makeButton(width - 270, height - 94, 260, 60, 'RACE', () => {
      this.registry.set('turboDriftConfig', GameState.getCarConfig());
      gameFlow.send('start_race');
      this.cameras.main.fadeOut(260, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Race'));
    }, 0xff6b35);

    this.tweens.add({
      targets: this.unlockGlow,
      alpha: 0.38,
      yoyo: true,
      repeat: -1,
      duration: 820,
    });
  }

  private refresh(): void {
    this.state = GameState.load();
    this.registry.set('turboDriftConfig', GameState.getCarConfig());
    this.rebuildPreviewCar();

    const tier = UPGRADE_TIERS[this.state.currentTier];
    const playMinutes = Math.floor(this.state.playTimeMs / 60000);
    const bestLap = this.state.bestLapMs === null ? '--:--.---' : this.formatTime(this.state.bestLapMs);
    this.infoText.setText([
      `Coins: ${ArcadeStore.getCoins()}`,
      `Tier: ${tier.label}`,
      `Play Time: ${playMinutes} min`,
      `Best Lap: ${bestLap}`,
      `Body: ${this.state.currentTier === 'sedan' ? 'Sedan shell' : 'Hatchback shell'}`,
      `Neon: Magenta underglow`,
    ]);

    this.statsText.setText([
      `${tier.label} Stats`,
      `Top Speed: ${tier.stats.topSpeed} KPH`,
      `Acceleration: ${tier.stats.acceleration.toFixed(1)}`,
      `Handling: ${tier.stats.handling.toFixed(2)}`,
      `Braking: ${tier.stats.braking.toFixed(2)}`,
      '',
      `Sedan Unlock by Time: ${this.state.playTimeMs >= UPGRADE_TIERS.sedan.unlockTimeMs ? 'Ready' : `${Math.max(0, Math.ceil((UPGRADE_TIERS.sedan.unlockTimeMs - this.state.playTimeMs) / 60000))} min left`}`,
      `Sedan Unlock by Coins: ${ArcadeStore.getCoins()} / ${UPGRADE_TIERS.sedan.unlockCost}`,
    ]);

    this.previewLabel.setText(`${tier.label.toUpperCase()} 3D PREVIEW BAY`);

    for (const button of this.partButtons) {
      const selected =
        (button.style === this.state.customization.bumper)
        || (button.style === this.state.customization.hood)
        || (button.style === this.state.customization.spoiler);
      button.background.setFillStyle(selected ? 0x203454 : 0x18202d, 1);
      button.background.setStrokeStyle(2, selected ? 0x8ed4ff : 0x334055, 1);
      const owned = this.isOwned(button.style);
      button.label.setText(owned || button.cost === 0 ? button.baseLabel : `${button.baseLabel} - ${button.cost}`);
    }

    const shouldShowUnlock = this.state.currentTier === 'hatchback'
      && (GameState.canUnlockSedanByTime() || GameState.canUnlockSedanByCurrency());
    this.unlockVisible = shouldShowUnlock;
    this.unlockGlow.setVisible(shouldShowUnlock);
    this.unlockButton.setVisible(shouldShowUnlock);
    this.unlockLabel.setText('UNLOCK SEDAN - 5000 COINS');
  }

  private rebuildPreviewCar(): void {
    const thirdScene = this as Partial<GarageThird>;
    if (!thirdScene.third) {
      return;
    }
    if (this.previewCar) {
      thirdScene.third.scene.remove(this.previewCar);
    }

    const config: CarConfig = GameState.getCarConfig();
    this.previewCar = CarMesh.build(config);
    this.previewCar.position.set(0, 0.82, 0);
    this.previewCar.rotation.set(0, this.previewYaw, 0);
    thirdScene.third.scene.add(this.previewCar);
  }

  private disposePreview(): void {
    const thirdScene = this as Partial<GarageThird>;
    const scene = thirdScene.third?.scene ?? null;

    if (scene && this.previewCar) {
      scene.remove(this.previewCar);
    }
    if (scene && this.previewPlatform) {
      scene.remove(this.previewPlatform);
    }
    if (scene && this.previewBackdrop) {
      scene.remove(this.previewBackdrop);
    }

    this.previewCar = null;
    this.previewPlatform = null;
    this.previewBackdrop = null;
  }

  private animatePreview(delta: number): void {
    if (!this.previewCar) {
      return;
    }

    this.previewYaw += delta * 0.00032;
    this.previewCar.rotation.y = this.previewYaw;
    this.previewCar.position.y = 0.82 + Math.sin(this.time.now * 0.0016) * 0.04;
  }

  private createPartPanel<T extends string>(
    title: string,
    x: number,
    y: number,
    part: CustomizablePart,
    options: Array<PartOption<T>>,
  ): void {
    this.add.text(x, y - 34, title, {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#f5f7ff',
    });

    options.forEach((option, index) => {
      const button = this.makeButton(
        x + index * 170,
        y,
        150,
        54,
        option.cost === 0 ? option.label : `${option.label} - ${option.cost}`,
        () => this.selectPart(part, option.style, option.cost),
      );
      this.partButtons.push({
        background: button.background,
        label: button.label,
        style: option.style,
        cost: option.cost,
        baseLabel: option.label,
      });
    });
  }

  private selectPart(part: CustomizablePart, style: string, cost: number): void {
    gameFlow.send('customize');
    if (this.isOwned(style) || cost === 0) {
      this.applySelection(part, style);
      return;
    }

    if (!ArcadeStore.spendCoins(cost)) {
      return;
    }

    const owned = this.getOwnedParts();
    owned.push(style);
    ArcadeStore.set('turboDriftOwnedParts', owned);
    this.applySelection(part, style);
  }

  private applySelection(part: CustomizablePart, style: string): void {
    if (part === 'bumper') {
      GameState.setCustomization(part, style as BumperStyle);
    } else if (part === 'hood') {
      GameState.setCustomization(part, style as HoodStyle);
    } else {
      GameState.setCustomization(part, style as SpoilerStyle);
    }
    gameFlow.send('customize_done');
    this.refresh();
  }

  private getOwnedParts(): string[] {
    const raw = ArcadeStore.get('turboDriftOwnedParts');
    return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string') : [];
  }

  private isOwned(style: string): boolean {
    const selected = this.state.customization;
    if (style === selected.bumper || style === selected.hood || style === selected.spoiler) {
      return true;
    }
    return this.getOwnedParts().includes(style);
  }

  private makeButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    fill = 0x18202d,
  ): OverlayButton {
    const background = this.add.rectangle(x, y, width, height, fill, 1).setStrokeStyle(2, 0x334055, 1).setDepth(410);
    const text = this.add.text(x, y, label, {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f7fbff',
      align: 'center',
    }).setOrigin(0.5).setDepth(411);

    const hitZone = this.add.zone(x, y, width, height).setRectangleDropZone(width, height).setDepth(412);
    hitZone.setInteractive({ useHandCursor: true });
    hitZone.on('pointerover', () => background.setFillStyle(fill + 0x101010, 1));
    hitZone.on('pointerout', () => background.setFillStyle(fill, 1));
    hitZone.on('pointerdown', onClick);

    return {
      background,
      label: text,
      hitZone,
      setVisible(visible: boolean) {
        background.setVisible(visible);
        text.setVisible(visible);
        hitZone.setVisible(visible);
        if (visible) {
          hitZone.setInteractive({ useHandCursor: true });
        } else {
          hitZone.disableInteractive();
        }
      },
    };
  }

  private formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }
}
