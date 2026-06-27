import Phaser from 'phaser';
import { Scene3D } from '@enable3d/phaser-extension';
import * as THREE from 'three';
import { ArcadeStore } from '@shared/arcade-store';
import { CarMesh } from '../car/CarMesh';
import { CarPhysics, type Enable3DThird } from '../car/CarPhysics';
import { WORLD } from '../constants';
import { gameFlow } from '../systems/GameFlowMachine';
import { GameState } from '../systems/GameState';
import type { CarConfig, RaceInput } from '../types';

type KeySet = {
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  space: Phaser.Input.Keyboard.Key;
  esc: Phaser.Input.Keyboard.Key;
};

type ThirdScene = Scene3D & { third: Enable3DThird & { scene: THREE.Scene; camera: THREE.Camera; renderer: THREE.WebGLRenderer; warpSpeed: (...args: string[]) => void } };

export class RaceScene extends Scene3D {
  private config!: CarConfig;
  private carMesh!: THREE.Group;
  private carPhysics!: CarPhysics;
  private keys!: KeySet;
  private speedText!: Phaser.GameObjects.Text;
  private lapText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private currentLap = 1;
  private lapStartMs = 0;
  private raceStartMs = 0;
  private lastCrossingInside = false;
  private playTimeAccumulator = 0;
  private finishing = false;
  private countdownText!: Phaser.GameObjects.Text;
  private driftActive = false;
  private sceneReady = false;

  constructor() {
    super('Race');
  }

  init(): void {
    this.accessThirdDimension({ maxSubSteps: 1 });
  }

  create(): void {
    this.config = (this.registry.get('turboDriftConfig') as CarConfig | undefined) ?? GameState.getCarConfig();
    gameFlow.setHooks({
      onCountdownTick: (value) => {
        this.countdownText.setText(String(value)).setVisible(true);
      },
      onCountdownFinished: () => {
        this.countdownText.setText('GO').setVisible(true);
        this.time.delayedCall(350, () => this.countdownText.setVisible(false));
      },
      onRaceFinished: () => this.finishRace(),
      onReturnToGarage: () => this.exitToGarage(false),
    });
    this.createHud();
    this.bindInput();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameFlow.clearHooks();
    });
    void this.bootstrapRaceScene();
  }

  update(_: number, delta: number): void {
    gameFlow.update(delta);

    if (!this.sceneReady || this.finishing || gameFlow.currentState === 'race_countdown') {
      return;
    }

    const input = this.readInput();
    this.carPhysics.update(delta, input);
    this.updateCamera();
    this.updateHud();
    this.updateLapDetection();

    this.playTimeAccumulator += delta;
    if (this.playTimeAccumulator >= 1000) {
      GameState.addPlayTime(this.playTimeAccumulator);
      this.playTimeAccumulator = 0;
    }

    const driftingNow = input.handbrake && this.carPhysics.getSpeedKph() > 75;
    if (driftingNow && !this.driftActive) {
      this.driftActive = true;
      gameFlow.send('drift_start');
    } else if (!driftingNow && this.driftActive) {
      this.driftActive = false;
      gameFlow.send('drift_end');
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      gameFlow.send('cancel_race');
    }
  }

  private createHud(): void {
    const hudStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0a0d13',
      strokeThickness: 5,
    };

    this.speedText = this.add.text(30, 20, 'SPEED: 000 KPH', hudStyle).setScrollFactor(0).setDepth(500);
    this.lapText = this.add.text(this.scale.width / 2, 20, 'LAP 1/3 00:00.000', hudStyle).setOrigin(0.5, 0).setScrollFactor(0).setDepth(500);
    this.coinText = this.add.text(this.scale.width - 30, 20, `${ArcadeStore.getCoins()} COINS`, hudStyle).setOrigin(1, 0).setScrollFactor(0).setDepth(500);
    this.add.text(this.scale.width / 2, this.scale.height - 34, 'WASD / ARROWS  SPACE=DRIFT  ESC=GARAGE', {
      ...hudStyle,
      fontSize: '18px',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(500);
    this.countdownText = this.add.text(this.scale.width / 2, this.scale.height / 2, '3', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '88px',
      fontStyle: 'bold',
      color: '#ffefb0',
      stroke: '#07080f',
      strokeThickness: 10,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600);
  }

  private bindInput(): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard input unavailable in RaceScene');
    }
    this.keys = keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    }) as KeySet;
  }

  private async bootstrapRaceScene(): Promise<void> {
    const thirdScene = this as ThirdScene;
    await thirdScene.third.warpSpeed('-ground', '-sky');
    thirdScene.third.renderer.shadowMap.enabled = false;
    thirdScene.third.scene.background = new THREE.Color(0x07080f);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(16, 28, 20);
    thirdScene.third.scene.add(ambient, sun);

    this.buildTrack(thirdScene.third);
    this.carMesh = CarMesh.build(this.config);
    thirdScene.third.scene.add(this.carMesh);
    this.carPhysics = new CarPhysics(thirdScene.third, this.carMesh, this.config.stats);

    const camera = thirdScene.third.camera as THREE.PerspectiveCamera;
    camera.position.set(0, 7.5, 10.5);

    this.sceneReady = true;
    this.raceStartMs = this.time.now;
    this.lapStartMs = this.time.now;
    this.cameras.main.fadeIn(220, 0, 0, 0);
  }

  private readInput(): RaceInput {
    const throttle = (this.keys.up.isDown || this.keys.w.isDown ? 1 : 0) - (this.keys.down.isDown || this.keys.s.isDown ? 0.55 : 0);
    const steer = (this.keys.left.isDown || this.keys.a.isDown ? 1 : 0) - (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0);
    return {
      throttle: Phaser.Math.Clamp(throttle, -0.55, 1),
      brake: this.keys.down.isDown || this.keys.s.isDown,
      steer: Phaser.Math.Clamp(steer, -1, 1),
      handbrake: this.keys.space.isDown,
    };
  }

  private updateCamera(): void {
    const thirdScene = this as ThirdScene;
    const camera = thirdScene.third.camera as THREE.PerspectiveCamera;
    const forward = new THREE.Vector3();
    this.carMesh.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const desired = this.carMesh.position.clone()
      .addScaledVector(forward, -8.5)
      .add(new THREE.Vector3(0, 5.2, 0));

    camera.position.lerp(desired, 0.08);
    camera.lookAt(this.carMesh.position.x, this.carMesh.position.y + 1.3, this.carMesh.position.z);
  }

  private updateHud(): void {
    this.speedText.setText(`SPEED: ${Math.round(this.carPhysics.getSpeedKph()).toString().padStart(3, '0')} KPH`);
    this.lapText.setText(`LAP ${this.currentLap}/${WORLD.lapsToWin} ${this.formatTime(this.time.now - this.lapStartMs)}`);
    this.coinText.setText(`${ArcadeStore.getCoins()} COINS`);
  }

  private updateLapDetection(): void {
    const pos = this.carPhysics.getPosition();
    const insideGate = Math.abs(pos.x) < 6 && pos.z < -WORLD.trackRadiusZ + 4 && pos.z > -WORLD.trackRadiusZ - 6;

    if (insideGate && !this.lastCrossingInside && this.time.now - this.lapStartMs > 2500) {
      const lapTime = this.time.now - this.lapStartMs;
      this.lapStartMs = this.time.now;
      GameState.setBestLap(lapTime);
      const payout = 225 + Math.max(0, 90 - Math.floor(lapTime / 1000)) * 4;
      ArcadeStore.addCoins(payout);
      this.coinText.setText(`${ArcadeStore.getCoins()} COINS`);

      if (this.currentLap >= WORLD.lapsToWin) {
        gameFlow.send('lap_complete', this.currentLap);
      } else {
        this.currentLap += 1;
        gameFlow.send('lap_complete', this.currentLap - 1);
      }
    }

    this.lastCrossingInside = insideGate;
  }

  private finishRace(): void {
    this.finishing = true;
    const totalTime = this.time.now - this.raceStartMs;
    this.add.text(this.scale.width / 2, this.scale.height / 2, `FINISH\n${this.formatTime(totalTime)}`, {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '40px',
      fontStyle: 'bold',
      align: 'center',
      color: '#ffefb0',
      stroke: '#07080f',
      strokeThickness: 8,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600);

    this.time.delayedCall(1400, () => gameFlow.send('return_to_garage'));
  }

  private exitToGarage(transitionMachine = true): void {
    if (this.scene.isActive('Garage')) {
      return;
    }
    if (this.playTimeAccumulator > 0) {
      GameState.addPlayTime(this.playTimeAccumulator);
      this.playTimeAccumulator = 0;
    }
    if (transitionMachine) {
      gameFlow.resetForGarage();
    }
    this.cameras.main.fadeOut(240, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Garage'));
  }

  private buildTrack(third: Enable3DThird & { scene: THREE.Scene }): void {
    const segmentGeometry = new THREE.BoxGeometry(8, 0.2, 12);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffe066 });
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 });

    for (let i = 0; i < WORLD.segmentCount; i += 1) {
      const t = (i / WORLD.segmentCount) * Math.PI * 2;
      const x = Math.cos(t) * WORLD.trackRadiusX;
      const z = Math.sin(t) * WORLD.trackRadiusZ;
      const nextT = ((i + 1) / WORLD.segmentCount) * Math.PI * 2;
      const nextX = Math.cos(nextT) * WORLD.trackRadiusX;
      const nextZ = Math.sin(nextT) * WORLD.trackRadiusZ;

      const mesh = new THREE.Mesh(
        segmentGeometry,
        new THREE.MeshLambertMaterial({ color: i % 2 === 0 ? 0x1a1a2e : 0x16213e, flatShading: true }),
      );
      mesh.position.set(x, 0, z);
      mesh.lookAt(nextX, 0, nextZ);
      third.scene.add(mesh);

      const edges = new THREE.EdgesGeometry(segmentGeometry);
      const neon = new THREE.LineSegments(edges, edgeMaterial);
      neon.position.copy(mesh.position);
      neon.rotation.copy(mesh.rotation);
      third.scene.add(neon);
    }

    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const ramp = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.3, 12),
        new THREE.MeshLambertMaterial({ color: 0x1f2334, flatShading: true }),
      );
      ramp.position.set(Math.cos(angle) * (WORLD.trackRadiusX - 1), 0.18, Math.sin(angle) * (WORLD.trackRadiusZ - 1));
      ramp.rotation.y = angle + Math.PI / 2;
      ramp.rotation.x = 0.12;
      third.scene.add(ramp);
    }

    const wallSpecs = [
      { x: 0, z: -(WORLD.trackRadiusZ + 10), width: WORLD.trackRadiusX * 2 + 24, depth: 3 },
      { x: 0, z: WORLD.trackRadiusZ + 10, width: WORLD.trackRadiusX * 2 + 24, depth: 3 },
      { x: -(WORLD.trackRadiusX + 12), z: 0, width: 3, depth: WORLD.trackRadiusZ * 2 + 20 },
      { x: WORLD.trackRadiusX + 12, z: 0, width: 3, depth: WORLD.trackRadiusZ * 2 + 20 },
    ];

    wallSpecs.forEach((wall) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(wall.width, 2, wall.depth), wallMaterial);
      mesh.position.set(wall.x, 1, wall.z);
      third.scene.add(mesh);
      third.physics.add.existing(mesh, { shape: 'box', width: wall.width, height: 2, depth: wall.depth, mass: 0 });
    });
  }

  private formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor(ms % 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
  }
}
