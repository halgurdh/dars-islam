import Phaser from 'phaser';
import { CUSTOM_GAUGE_MAX, PLAYER_MAX_HP, PLAYER_MOVE_MS, SCENE_HEIGHT, SCENE_WIDTH } from '../constants';
import { PlayerCharacter } from '../entities/Character';

interface BossProjectile {
  sprite: Phaser.GameObjects.Image;
  particles: Phaser.GameObjects.Particles.ParticleEmitter;
  damage: number;
  accent: number;
  label: string;
  heavy: boolean;
  hasHit: boolean;
}
import { ChipManager } from '../systems/ChipManager';
import { GridSystem } from '../systems/GridSystem';
import { UIManager } from '../systems/UIManager';
import type { BattleState, ChipDefinition, CustomMenuHost, GridCoord } from '../types';

type BossPhase = 'PHASE_1' | 'PHASE_2' | 'DESPERATION';

interface ManagedEvent {
  event: Phaser.Time.TimerEvent;
  autoResume: boolean;
}

export class FinalBossBattleScene extends Phaser.Scene implements CustomMenuHost {
  private battleState: BattleState = 'BATTLE_INTRO';
  private grid!: GridSystem;
  private player!: PlayerCharacter;
  private chipManager!: ChipManager;
  private ui!: UIManager;
  private bossRoot!: Phaser.GameObjects.Container;
  private bossBody!: Phaser.GameObjects.Graphics;
  private bossCore!: Phaser.GameObjects.Arc;
  private bossEye!: Phaser.GameObjects.Arc;
  private bossCrown!: Phaser.GameObjects.Graphics;
  private shieldRing!: Phaser.GameObjects.Graphics;
  private bossHpFill!: Phaser.GameObjects.Graphics;
  private bossHpText!: Phaser.GameObjects.Text;
  private arenaTint!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private managedTimers: ManagedEvent[] = [];
  private crackedTiles = new Set<string>();
  private brokenTileTimers = new Map<string, Phaser.Time.TimerEvent>();
  private currentHand: ChipDefinition[] = [];
  private gaugeValue = 0;
  private bossHp = 1000;
  private readonly bossMaxHp = 1000;
  private playerTurnLocked = true;
  private bossLoop?: Phaser.Time.TimerEvent;
  private bossPhase: BossPhase = 'PHASE_1';
  private bossVulnerable = false;
  private channelActive = false;
  private cutsceneLocked = false;
  private pulseTween?: Phaser.Tweens.Tween;
  private reticle?: Phaser.GameObjects.Graphics;
  private reticleEvent?: Phaser.Time.TimerEvent;
  private lockedReticleCoord: GridCoord = { col: 1, row: 1 };
  private managedObjects: Phaser.GameObjects.GameObject[] = [];
  private bossProjectiles: BossProjectile[] = [];
  private shotsFired = 0;
  private fireOnCooldown = false;

  constructor() {
    super('FinalBossBattleScene');
  }

  create(): void {
    this.battleState = 'BATTLE_INTRO';
    this.gaugeValue = 0;
    this.bossHp = this.bossMaxHp;
    this.playerTurnLocked = true;
    this.bossPhase = 'PHASE_1';
    this.bossVulnerable = false;
    this.channelActive = false;
    this.cutsceneLocked = false;
    this.crackedTiles.clear();
    this.currentHand = [];
    this.cleanupManagedTimers();
    this.bossProjectiles = [];
    this.shotsFired = 0;
    this.fireOnCooldown = false;
    this.lockedReticleCoord = { col: 1, row: 1 };

    this.createBackdrop();
    this.grid = new GridSystem(this, 278, 258, 112, 96, 26);
    this.grid.create();
    this.grid.setOwnerVisibility('enemy', false);

    this.player = new PlayerCharacter(this, this.grid, { col: 1, row: 1 }, PLAYER_MAX_HP);
    this.player.alpha = 0;

    this.chipManager = new ChipManager();
    this.ui = new UIManager(this);
    this.ui.updateQueue([]);
    this.ui.updateState(this.battleState);
    this.createBoss();
    this.createBossHud();
    this.setupInput();

    this.events.once('shutdown', () => {
      this.pauseManagedTimers();
      this.cleanupManagedTimers();
      this.pulseTween?.remove();
      this.reticle?.destroy();
      this.bossProjectiles.forEach((p) => { p.sprite.destroy(); p.particles.stop(); p.particles.destroy(); });
      this.bossProjectiles = [];
      if (this.scene.isActive('CustomMenuScene')) {
        this.scene.stop('CustomMenuScene');
      }
    });

    this.grid.playIntro(() => {
      this.tweens.add({ targets: this.player, alpha: 1, duration: 220 });
      this.tweens.add({ targets: this.bossRoot, alpha: 1, duration: 260 });
      this.registerManagedDelay(450, () => {
        this.battleState = 'REALTIME_COMBAT';
        this.playerTurnLocked = false;
        this.ui.updateState(this.battleState);
        this.ui.showBanner('FINAL BOSS ONLINE', '#ffc4d7');
        this.startBossLoop();
      });
    });
  }

  update(_: number, delta: number): void {
    this.player.updateVisuals();

    if (this.battleState === 'REALTIME_COMBAT' && !this.cutsceneLocked) {
      this.gaugeValue = Math.min(CUSTOM_GAUGE_MAX, this.gaugeValue + delta);
      this.handlePlayerInput();
    }

    this.ui.updateGauge(this.gaugeValue, this.gaugeValue >= CUSTOM_GAUGE_MAX);
    this.updateBossVisuals();
    this.updateBossProjectiles(delta);
  }

  getCustomHand(): ChipDefinition[] {
    return this.currentHand.length > 0 ? [...this.currentHand] : this.chipManager.drawHand();
  }

  loadChips(selectedChips: ChipDefinition[]): void {
    if (selectedChips.length === 0) {
      return;
    }
    this.chipManager.queueSelected(selectedChips);
    this.ui.updateQueue(this.chipManager.getQueue());
  }

  exitCustomMenu(confirmed: boolean): void {
    this.gaugeValue = 0;
    this.battleState = 'REALTIME_COMBAT';
    this.playerTurnLocked = false;
    this.ui.updateState(this.battleState);
    this.resumeManagedTimers();
    if (confirmed) {
      this.ui.showBanner('CHIPS SENT!', '#ffe49f');
    }
  }

  private createBackdrop(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x090d1b, 0x120c18, 0x04060a, 0x04060a, 1).fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    for (let i = 0; i < 22; i += 1) {
      const width = Phaser.Math.Between(260, 520);
      const height = Phaser.Math.Between(18, 62);
      const x = Phaser.Math.Between(180, SCENE_WIDTH - 160);
      const y = Phaser.Math.Between(60, SCENE_HEIGHT - 160);
      const alpha = i % 2 === 0 ? 0.06 : 0.04;
      this.add.ellipse(x, y, width, height, i % 2 === 0 ? 0xff5a93 : 0x43d9ff, alpha).setAngle(Phaser.Math.Between(-20, 20));
    }

    const lane = this.add.graphics();
    lane.fillStyle(0x08111b, 0.92).fillRoundedRect(170, 196, 944, 344, 42);
    lane.lineStyle(2, 0x284666, 0.7).strokeRoundedRect(170, 196, 944, 344, 42);

    this.add.text(182, 560, 'ARROWS / WASD MOVE    SPACE FIRE / USE CHIP    ENTER CUSTOM', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#8db7dd',
      fontStyle: 'bold',
    });

    this.arenaTint = this.add.rectangle(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 0x5f0817, 0)
      .setOrigin(0)
      .setDepth(890);
  }

  private createBoss(): void {
    const x = 930;
    const y = 316;
    this.bossRoot = this.add.container(x, y).setDepth(760).setAlpha(0);
    this.shieldRing = this.add.graphics();
    this.bossBody = this.add.graphics();
    this.bossCore = this.add.circle(0, 0, 38, 0xff6f9b, 0.95).setDepth(2);
    this.bossEye = this.add.circle(0, 0, 14, 0xffffff, 0.95).setDepth(3);
    const antenna = this.add.graphics();
    const clawLeft = this.add.graphics();
    const clawRight = this.add.graphics();
    this.bossCrown = this.add.graphics();

    antenna.fillStyle(0x19344d, 1).fillRoundedRect(-18, -206, 36, 170, 14);
    antenna.fillStyle(0x42d8ff, 0.68).fillRoundedRect(-6, -192, 12, 126, 8);
    clawLeft.fillStyle(0x10253c, 1).fillTriangle(-218, -16, -112, -94, -118, 82);
    clawLeft.lineStyle(5, 0x7fe7ff, 0.76).strokeTriangle(-218, -16, -112, -94, -118, 82);
    clawRight.fillStyle(0x3f1025, 1).fillTriangle(218, -16, 112, -94, 118, 82);
    clawRight.lineStyle(5, 0xff8ab4, 0.76).strokeTriangle(218, -16, 112, -94, 118, 82);

    this.redrawBoss(false);
    this.bossRoot.add([this.shieldRing, clawLeft, clawRight, antenna, this.bossCrown, this.bossBody, this.bossCore, this.bossEye]);

    this.pulseTween = this.tweens.add({
      targets: this.bossCore,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 640,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      paused: true,
    });
    this.tweens.add({
      targets: this.bossEye,
      scaleX: 1.5,
      alpha: 0.55,
      duration: 520,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createBossHud(): void {
    const frame = this.add.graphics().setDepth(980);
    frame.fillStyle(0x07111f, 0.92).fillRoundedRect(138, 650, 1004, 38, 18);
    frame.lineStyle(3, 0xff8eb9, 0.9).strokeRoundedRect(138, 650, 1004, 38, 18);

    this.bossHpFill = this.add.graphics().setDepth(981);
    this.bossHpText = this.add.text(SCENE_WIDTH / 2, 620, 'OMEGA CORE 1000 / 1000', {
      fontFamily: 'Segoe UI',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffd3e2',
      stroke: '#07111f',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(982);
    this.refreshBossHpBar();
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private handlePlayerInput(): void {
    if (this.playerTurnLocked || this.player.isMoving) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.gaugeValue >= CUSTOM_GAUGE_MAX) {
      this.openCustomMenu();
      return;
    }

    const direction = this.consumeMovementInput();
    if (direction) {
      this.movePlayer(direction);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.firePlayerAction();
    }
  }

  private consumeMovementInput(): GridCoord | null {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasd.A)) {
      return { col: -1, row: 0 };
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.D)) {
      return { col: 1, row: 0 };
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasd.W)) {
      return { col: 0, row: -1 };
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasd.S)) {
      return { col: 0, row: 1 };
    }
    return null;
  }

  private movePlayer(direction: GridCoord): void {
    const previous = { ...this.player.coord };
    const next = {
      col: this.player.coord.col + direction.col,
      row: this.player.coord.row + direction.row,
    };
    if (!this.grid.canOccupy('player', next)) {
      return;
    }
    this.player.dashTo(next, PLAYER_MOVE_MS, () => {
      if (!this.grid.isSameCoord(previous, this.player.coord) && this.grid.getTileState(previous) === 'CRACKED') {
        this.breakTile(previous);
      }
    });
  }

  private firePlayerAction(): void {
    if (this.fireOnCooldown) {
      return;
    }

    const chip = this.chipManager.consumeNext();
    this.ui.updateQueue(this.chipManager.getQueue());

    if (!chip) {
      this.fireBossProjectile(20, 0xffd878, 'BUSTER', false);
    } else if (chip.id === 'wide-sword') {
      this.player.swordSlash();
      this.applyBossDamage(chip.damage, chip.accent, chip.name.toUpperCase());
    } else if (chip.id === 'recovery') {
      this.player.heal(chip.effectValue);
      this.spawnHealPopup(`+${chip.effectValue} HP`);
      this.ui.showBanner(`${chip.name.toUpperCase()} ${chip.code}!`, '#b7fff0');
    } else if (chip.id === 'area-grab') {
      const restored = this.restoreBrokenTile();
      this.ui.showBanner(restored ? 'GRID PATCHED!' : 'NO BROKEN TILES', restored ? '#ffe49f' : '#ffcfb7');
    } else {
      this.fireBossProjectile(chip.damage, chip.accent, `${chip.name.toUpperCase()} ${chip.code}`, chip.id === 'cannon');
    }

    this.shotsFired += 1;
    if (this.shotsFired >= 10) {
      this.shotsFired = 0;
      this.fireOnCooldown = true;
      this.ui.showBanner('OVERHEAT — COOLING DOWN', '#ff9d5a');
      this.registerManagedDelay(3000, () => {
        this.fireOnCooldown = false;
        this.ui.showBanner('READY', '#b7ffd2');
      });
    }
  }

  private applyBossDamage(amount: number, tint: number, label: string): void {
    if (!this.bossVulnerable) {
      this.spawnShieldRipple();
      this.ui.showBanner('SHIELD BLOCKED', '#8adfff');
      return;
    }

    this.bossHp = Math.max(0, this.bossHp - amount);
    this.refreshBossHpBar();
    this.spawnBossHit(amount, tint, label);
    this.checkPhaseTransition();

    if (this.bossHp <= 0) {
      this.onBossDefeated();
    }
  }

  private startBossLoop(): void {
    this.pulseTween?.resume();
    this.bossLoop?.destroy();
    this.bossLoop = this.registerManagedLoop(3000, () => {
      if (this.channelActive || this.cutsceneLocked || this.bossHp <= 0) {
        return;
      }
      this.executeBossAttack();
    }, true);
  }

  private executeBossAttack(): void {
    if (this.bossPhase === 'PHASE_1') {
      if (Phaser.Math.Between(0, 1) === 0) {
        this.rowLaserAttack();
      } else {
        this.meteorFallAttack();
      }
      return;
    }

    if (this.bossPhase === 'PHASE_2') {
      const roll = Phaser.Math.Between(0, 2);
      if (roll === 0) {
        this.rowLaserAttack();
      } else if (roll === 1) {
        this.meteorFallAttack();
      } else {
        this.crackSlamAttack();
      }
      return;
    }

    if (Phaser.Math.Between(0, 2) === 0) {
      this.ultimateAttack();
    } else if (Phaser.Math.Between(0, 1) === 0) {
      this.crackSlamAttack();
    } else {
      this.meteorFallAttack();
    }
  }

  private rowLaserAttack(): void {
    const row = Phaser.Math.Between(0, 2);
    const coords = this.getPlayerRow(row);
    this.beginChannel(1300);
    this.flashBoss(0xffffff, 800);
    this.grid.flashWarning(coords, 800);
    this.registerManagedDelay(800, () => {
      const beam = this.add.graphics().setDepth(930);
      const y = this.grid.getCenterLineY(row);
      beam.fillStyle(0xff2d64, 0.22).fillRect(156, y - 44, 946, 88);
      beam.fillStyle(0xff4d74, 0.82).fillRect(174, y - 22, 910, 44);
      beam.fillStyle(0xffffff, 0.92).fillRect(174, y - 6, 910, 12);
      beam.lineStyle(4, 0xffe3ef, 0.9).strokeRect(174, y - 22, 910, 44);
      this.spawnMuzzleBurst(this.bossRoot.x - 152, y, 0xff6f9b);
      this.trackManagedObject(beam);
      this.spawnBossParticles(900, y, 0xff7ea6, 16);
      if (this.player.coord.row === row) {
        this.damagePlayer(30);
      }
      this.tweens.add({ targets: beam, alpha: 0, duration: 500, onComplete: () => beam.destroy() });
    });
  }

  private meteorFallAttack(): void {
    const targets = Phaser.Utils.Array.Shuffle(this.grid.getPlayerTiles().slice()).slice(0, 3);
    this.beginChannel(1450);

    const markers = targets.map((coord) => {
      const pos = this.grid.getCharacterPosition(coord);
      const marker = this.add.graphics().setDepth(930);
      marker.fillStyle(0xffd35f, 0.28).fillCircle(pos.x, pos.y, 38);
      marker.lineStyle(4, 0xffefb3, 0.9).strokeCircle(pos.x, pos.y, 38);
      this.trackManagedObject(marker);
      this.tweens.add({ targets: marker, alpha: 0.35, duration: 260, yoyo: true, repeat: 2 });
      return { coord, pos, marker };
    });

    this.registerManagedDelay(1000, () => {
      markers.forEach(({ coord, pos, marker }) => {
        const meteor = this.add.container(pos.x, pos.y - 132).setDepth(935);
        const trail = this.add.graphics();
        trail.fillStyle(0xff6f39, 0.24).fillTriangle(0, -54, -30, 26, 30, 26);
        const core = this.add.graphics();
        core.fillStyle(0xffc06a, 1).fillCircle(0, 0, 18);
        core.fillStyle(0xffffff, 0.8).fillCircle(-5, -5, 7);
        core.lineStyle(3, 0xfff3d2, 0.85).strokeCircle(0, 0, 18);
        meteor.add([trail, core]);
        this.trackManagedObject(meteor);
        this.tweens.add({
          targets: meteor,
          y: pos.y,
          alpha: 0,
          duration: 220,
          ease: 'Cubic.easeIn',
          onComplete: () => meteor.destroy(),
        });
        marker.destroy();
        this.spawnBossParticles(pos.x, pos.y, 0xffc26d, 12);
        if (this.grid.isSameCoord(this.player.coord, coord)) {
          this.damagePlayer(25);
        }
      });
    });
  }

  private crackSlamAttack(): void {
    const row = Phaser.Math.Between(0, 2);
    const coords = this.getPlayerRow(row);
    this.beginChannel(1300);
    this.flashBoss(0xffd16e, 650);

    const slamGhost = this.add.graphics().setDepth(928);
    coords.forEach((coord) => {
      const pos = this.grid.getCharacterPosition(coord);
      slamGhost.fillStyle(0xffc06e, 0.22).fillRect(pos.x - 54, pos.y - 28, 108, 56);
      slamGhost.lineStyle(3, 0xffefc1, 0.75).strokeRect(pos.x - 54, pos.y - 28, 108, 56);
    });
    this.trackManagedObject(slamGhost);
    this.tweens.add({ targets: slamGhost, alpha: 0.35, duration: 180, yoyo: true, repeat: 2 });

    this.registerManagedDelay(850, () => {
      this.cameras.main.shake(220, 0.008);
      coords.forEach((coord) => {
        if (this.grid.getTileState(coord) !== 'BROKEN') {
          this.grid.setTileState(coord, 'CRACKED');
          this.crackedTiles.add(this.coordKey(coord));
        }
      });
      if (this.player.coord.row === row) {
        this.damagePlayer(35);
      }
      this.spawnBossParticles(640, this.grid.getCenterLineY(row), 0xffd16e, 22);
      slamGhost.destroy();
    });
  }

  private ultimateAttack(): void {
    const warning = this.add.text(SCENE_WIDTH / 2, 170, 'OMEGA SHOCKWAVE CHARGING', {
      fontFamily: 'Segoe UI',
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#ffd2db',
      stroke: '#07111f',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(938).setAlpha(0);
    this.trackManagedObject(warning);
    this.tweens.add({ targets: warning, alpha: 1, duration: 160 });

    this.beginChannel(4500);
    this.reticle?.destroy();
    this.reticle = this.add.graphics().setDepth(940);
    this.trackManagedObject(this.reticle);
    this.lockedReticleCoord = { ...this.player.coord };
    this.drawReticle(this.lockedReticleCoord);
    this.reticleEvent?.destroy();
    this.reticleEvent = this.registerManagedLoop(220, () => this.updateReticle(), true);

    this.registerManagedDelay(4000, () => {
      warning.destroy();
      this.reticle?.destroy();
      this.reticle = undefined;
      this.reticleEvent?.destroy();

      const locked = { ...this.lockedReticleCoord };
      const shock = this.add.graphics().setDepth(940);
      this.grid.getPlayerTiles().forEach((coord) => {
        const pos = this.grid.getCharacterPosition(coord);
        const isLocked = this.grid.isSameCoord(coord, locked);
        shock.fillStyle(isLocked ? 0xff8aa3 : 0x6cffb0, isLocked ? 0.36 : 0.22).fillRect(pos.x - 54, pos.y - 28, 108, 56);
        shock.lineStyle(4, isLocked ? 0xffe1e8 : 0xb9ffd4, 0.9).strokeRect(pos.x - 54, pos.y - 28, 108, 56);
      });
      this.trackManagedObject(shock);
      this.tweens.add({ targets: shock, alpha: 0, duration: 420, onComplete: () => shock.destroy() });
      this.spawnBossParticles(640, 372, 0xff547a, 28);

      if (this.grid.isSameCoord(this.player.coord, locked)) {
        this.damagePlayer(60);
      } else {
        this.ui.showBanner('DODGE SUCCESS!', '#b7ffd2');
      }
    });
  }

  private beginChannel(duration: number): void {
    this.channelActive = true;
    this.setBossVulnerable(true);
    this.registerManagedDelay(duration, () => {
      this.channelActive = false;
      this.setBossVulnerable(false);
    });
  }

  private setBossVulnerable(value: boolean): void {
    this.bossVulnerable = value;
    this.redrawBoss(value);
  }

  private flashBoss(color: number, duration: number): void {
    const original = this.bossCore.fillColor;
    this.bossCore.setFillStyle(color, 1);
    this.registerManagedDelay(duration, () => this.bossCore.setFillStyle(original, 0.95));
  }

  private damagePlayer(amount: number): void {
    this.player.takeDamage(amount);
    this.cameras.main.shake(140, amount / 3500);
    if (this.player.health <= 0) {
      this.finishBattle(false);
    }
  }

  private checkPhaseTransition(): void {
    const ratio = this.bossHp / this.bossMaxHp;
    if (this.bossPhase === 'PHASE_1' && ratio <= 0.7) {
      this.bossPhase = 'PHASE_2';
      this.cameras.main.shake(260, 0.009);
      this.ui.showBanner('PHASE 2: PROTOCOL INITIATED', '#ffd59b');
      return;
    }

    if (this.bossPhase === 'PHASE_2' && ratio <= 0.3) {
      this.bossPhase = 'DESPERATION';
      this.ui.showBanner('WARNING: CRITICAL FAULT', '#ffb1bf');
      this.arenaTint.alpha = 0.22;
      this.pulseTween?.setTimeScale(2);
    }
  }

  private updateBossVisuals(): void {
    this.shieldRing.rotation += this.bossPhase === 'DESPERATION' ? 0.03 : 0.016;
    if (this.reticle) {
      this.drawReticle(this.lockedReticleCoord);
    }
  }

  private updateReticle(): void {
    this.lockedReticleCoord = { ...this.player.coord };
    this.drawReticle(this.lockedReticleCoord);
  }

  private drawReticle(coord: GridCoord): void {
    if (!this.reticle) {
      return;
    }
    const pos = this.grid.getCharacterPosition(coord);
    this.reticle.clear();
    this.reticle.lineStyle(3, 0xfff3f5, 0.95).strokeCircle(pos.x, pos.y, 34);
    this.reticle.lineStyle(2, 0xff617f, 0.95);
    this.reticle.lineBetween(pos.x - 44, pos.y, pos.x + 44, pos.y);
    this.reticle.lineBetween(pos.x, pos.y - 44, pos.x, pos.y + 44);
  }

  private refreshBossHpBar(): void {
    const ratio = Phaser.Math.Clamp(this.bossHp / this.bossMaxHp, 0, 1);
    this.bossHpFill.clear()
      .fillStyle(this.bossPhase === 'DESPERATION' ? 0xff5c7d : this.bossPhase === 'PHASE_2' ? 0xff9d5a : 0xffc266, 1)
      .fillRoundedRect(144, 656, 992 * ratio, 26, 14);
    this.bossHpText.setText(`OMEGA CORE ${this.bossHp} / ${this.bossMaxHp}`);
  }

  private spawnBossHit(amount: number, tint: number, label: string): void {
    this.spawnBossParticles(this.bossRoot.x - 96, this.bossRoot.y, tint, 18);
    const popup = this.add.text(this.bossRoot.x - 30, this.bossRoot.y - 170, `-${amount} ${label}`, {
      fontFamily: 'Segoe UI',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#fff4d7',
      stroke: '#07111f',
      strokeThickness: 5,
    }).setDepth(940).setOrigin(0.5);
    this.tweens.add({
      targets: popup,
      y: popup.y - 34,
      alpha: 0,
      duration: 520,
      onComplete: () => popup.destroy(),
    });
  }

  private spawnShieldRipple(): void {
    const ripple = this.add.graphics().setDepth(940);
    ripple.lineStyle(4, 0x7ce8ff, 0.8).strokeCircle(this.bossRoot.x - 36, this.bossRoot.y, 42);
    this.trackManagedObject(ripple);
    this.tweens.add({
      targets: ripple,
      scaleX: 2.6,
      scaleY: 2.6,
      alpha: 0,
      duration: 320,
      onComplete: () => ripple.destroy(),
    });
    this.spawnBossParticles(this.bossRoot.x - 36, this.bossRoot.y, 0x7ce8ff, 10);
  }

  private spawnHealPopup(label: string): void {
    const popup = this.add.text(this.player.x, this.player.y - 96, label, {
      fontFamily: 'Segoe UI',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#b7fff0',
      stroke: '#07111f',
      strokeThickness: 5,
    }).setDepth(940).setOrigin(0.5);
    this.tweens.add({
      targets: popup,
      y: popup.y - 28,
      alpha: 0,
      duration: 520,
      onComplete: () => popup.destroy(),
    });
  }

  private spawnBossParticles(x: number, y: number, tint: number, quantity: number): void {
    const particles = this.add.particles(x, y, 'net-strike-dot', {
      speed: { min: 70, max: 260 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.85, end: 0 },
      tint: [tint, 0xffffff],
      lifespan: 360,
      quantity,
      emitting: false,
    });
    particles.explode(quantity, x, y);
    this.registerManagedDelay(420, () => particles.destroy());
  }

  private spawnMuzzleBurst(x: number, y: number, tint: number): void {
    const flash = this.add.graphics().setDepth(941);
    flash.fillStyle(tint, 0.34).fillCircle(x, y, 58);
    flash.fillStyle(0xffffff, 0.9).fillCircle(x, y, 18);
    flash.lineStyle(4, 0xffffff, 0.55);
    for (let index = 0; index < 10; index += 1) {
      const angle = Phaser.Math.DegToRad(index * 36);
      flash.lineBetween(x, y, x + Math.cos(angle) * 74, y + Math.sin(angle) * 74);
    }
    this.trackManagedObject(flash);
    this.tweens.add({ targets: flash, scaleX: 1.35, scaleY: 1.35, alpha: 0, duration: 220, onComplete: () => flash.destroy() });
  }

  private fireBossProjectile(damage: number, accent: number, label: string, heavy: boolean): void {
    this.player.shootPulse();
    const startX = this.player.x + 38;
    const startY = this.player.y - 22;
    const sprite = this.add.image(startX, startY, heavy ? 'net-strike-cannon' : 'net-strike-bullet')
      .setDepth(900)
      .setBlendMode(Phaser.BlendModes.ADD);
    const particles = this.add.particles(0, 0, 'net-strike-dot', {
      speed: { min: 10, max: 50 },
      lifespan: 180,
      scale: { start: heavy ? 0.9 : 0.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint: [0xfff6a8, 0xffd55c],
      emitting: false,
      follow: sprite,
      frequency: 18,
    });
    this.bossProjectiles.push({ sprite, particles, damage, accent, label, heavy, hasHit: false });
  }

  private updateBossProjectiles(delta: number): void {
    const elapsed = delta / 1000;
    const hitX = this.bossRoot.x - 120;

    this.bossProjectiles = this.bossProjectiles.filter((p) => {
      const bulletSpeed = p.heavy ? 980 : 1340;
      p.sprite.x += bulletSpeed * elapsed;

      if (!p.hasHit && p.sprite.x >= hitX) {
        p.hasHit = true;
        this.spawnBossParticles(p.sprite.x, p.sprite.y, 0xffe07c, 14);
        this.applyBossDamage(p.damage, p.accent, p.label);
        p.sprite.destroy();
        p.particles.stop();
        p.particles.destroy();
        return false;
      }

      if (p.sprite.x > SCENE_WIDTH + 60) {
        p.sprite.destroy();
        p.particles.stop();
        p.particles.destroy();
        return false;
      }
      return true;
    });
  }

  private openCustomMenu(): void {
    if (this.scene.isActive('CustomMenuScene')) {
      return;
    }
    this.battleState = 'CUSTOM_MENU';
    this.playerTurnLocked = true;
    this.ui.updateState(this.battleState);
    this.currentHand = this.chipManager.drawHand();
    this.pauseManagedTimers();
    this.scene.launch('CustomMenuScene', { battleKey: this.scene.key, hand: this.currentHand });
    this.scene.pause();
  }

  private breakTile(coord: GridCoord): void {
    this.crackedTiles.delete(this.coordKey(coord));
    this.grid.setTileState(coord, 'BROKEN');
    this.brokenTileTimers.get(this.coordKey(coord))?.destroy();
    const restoreEvent = this.registerManagedDelay(5000, () => {
      this.grid.setTileState(coord, 'NORMAL');
      this.brokenTileTimers.delete(this.coordKey(coord));
    });
    this.brokenTileTimers.set(this.coordKey(coord), restoreEvent);
  }

  private restoreBrokenTile(): boolean {
    const entry = [...this.brokenTileTimers.entries()][0];
    if (!entry) {
      return false;
    }
    const [key, event] = entry;
    event.destroy();
    this.brokenTileTimers.delete(key);
    this.grid.setTileState(this.keyToCoord(key), 'NORMAL');
    return true;
  }

  private onBossDefeated(): void {
    if (this.cutsceneLocked) {
      return;
    }
    this.cutsceneLocked = true;
    this.playerTurnLocked = true;
    this.pauseManagedTimers();
    this.setBossVulnerable(false);
    this.ui.showBanner('CORE BREACH', '#ffe0a6');
    this.time.timeScale = 0.45;
    this.tweens.timeScale = 0.45;

    for (let index = 0; index < 6; index += 1) {
      this.time.delayedCall(index * 180, () => {
        const x = this.bossRoot.x + Phaser.Math.Between(-140, 120);
        const y = this.bossRoot.y + Phaser.Math.Between(-160, 160);
        this.spawnBossParticles(x, y, index % 2 === 0 ? 0xffb866 : 0xff6f9b, 18 + index * 2);
        this.cameras.main.shake(180, 0.006 + index * 0.001);
      });
    }

    this.time.delayedCall(1320, () => {
      this.bossRoot.destroy(true);
      this.cameras.main.flash(420, 255, 247, 214, false);
    });

    this.time.delayedCall(1750, () => {
      this.time.timeScale = 1;
      this.tweens.timeScale = 1;
      this.scene.start('VictoryScene');
    });
  }

  private finishBattle(victory: boolean): void {
    if (this.cutsceneLocked) {
      return;
    }
    this.cutsceneLocked = true;
    this.playerTurnLocked = true;
    this.pauseManagedTimers();
    this.battleState = victory ? 'VICTORY' : 'GAME_OVER';
    this.ui.updateState(this.battleState);

    if (victory) {
      this.onBossDefeated();
      return;
    }

    this.ui.showEndOverlay('GAME OVER', 'The boss core overran the grid.', 0xff89ad, () => this.scene.restart());
  }

  private pauseManagedTimers(): void {
    this.managedTimers.forEach(({ event }) => {
      if (!event.hasDispatched) {
        event.paused = true;
      }
    });
    this.bossLoop && (this.bossLoop.paused = true);
    this.reticleEvent && (this.reticleEvent.paused = true);
    this.pulseTween?.pause();
  }

  private resumeManagedTimers(): void {
    this.managedTimers.forEach(({ event, autoResume }) => {
      if (autoResume && !event.hasDispatched) {
        event.paused = false;
      }
    });
    this.bossLoop && (this.bossLoop.paused = false);
    this.reticleEvent && (this.reticleEvent.paused = false);
    this.pulseTween?.resume();
  }

  private registerManagedDelay(delay: number, callback: () => void, autoResume = true): Phaser.Time.TimerEvent {
    const event = this.time.addEvent({ delay, callback });
    this.managedTimers.push({ event, autoResume });
    return event;
  }

  private registerManagedLoop(delay: number, callback: () => void, autoResume = true): Phaser.Time.TimerEvent {
    const event = this.time.addEvent({ delay, callback, loop: true });
    this.managedTimers.push({ event, autoResume });
    return event;
  }

  private cleanupManagedTimers(): void {
    this.managedTimers.forEach(({ event }) => event.destroy());
    this.managedTimers = [];
    this.bossLoop?.destroy();
    this.bossLoop = undefined;
    this.reticleEvent?.destroy();
    this.reticleEvent = undefined;
    this.brokenTileTimers.clear();
  }

  private redrawBoss(vulnerable: boolean): void {
    this.shieldRing.clear();
    this.shieldRing.lineStyle(6, vulnerable ? 0xffd7a2 : 0x79ddff, vulnerable ? 0.35 : 0.8);
    this.shieldRing.strokeCircle(0, 0, 152);
    this.shieldRing.lineStyle(2, vulnerable ? 0xfff0ca : 0xc7f4ff, 0.7);
    this.shieldRing.strokeCircle(0, 0, 198);

    this.bossCrown.clear();
    this.bossCrown.fillStyle(0x0f273a, 1);
    this.bossCrown.fillTriangle(-104, -168, -40, -236, 8, -160);
    this.bossCrown.fillTriangle(104, -168, 40, -236, -8, -160);
    this.bossCrown.lineStyle(4, vulnerable ? 0xffd28c : 0x7ce8ff, 0.72);
    this.bossCrown.strokeTriangle(-104, -168, -40, -236, 8, -160);
    this.bossCrown.strokeTriangle(104, -168, 40, -236, -8, -160);

    this.bossBody.clear();
    this.bossBody.fillStyle(0x081927, 1).fillRoundedRect(-144, -178, 288, 356, 46);
    this.bossBody.fillStyle(0x102f42, 1).fillRoundedRect(-116, -146, 232, 292, 34);
    this.bossBody.fillStyle(0x421427, 0.92).fillRoundedRect(-82, -122, 164, 244, 26);
    this.bossBody.fillStyle(vulnerable ? 0xffcf82 : 0x6fd9ff, vulnerable ? 0.3 : 0.16).fillCircle(0, 0, 126);
    this.bossBody.lineStyle(6, vulnerable ? 0xffc56b : 0x7ce8ff, 0.92).strokeRoundedRect(-144, -178, 288, 356, 46);
    this.bossBody.lineStyle(3, vulnerable ? 0xffefcc : 0xb7f0ff, 0.74);
    this.bossBody.strokeRoundedRect(-84, -124, 168, 248, 26);
    this.bossBody.lineStyle(2, 0xffffff, 0.18);
    for (let y = -112; y <= 112; y += 56) {
      this.bossBody.lineBetween(-118, y, 118, y);
    }
  }

  private getPlayerRow(row: number): GridCoord[] {
    return [0, 1, 2].map((col) => ({ col, row }));
  }

  private coordKey(coord: GridCoord): string {
    return `${coord.col},${coord.row}`;
  }

  private keyToCoord(key: string): GridCoord {
    const [col, row] = key.split(',').map(Number);
    return { col, row };
  }

  private trackManagedObject<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.managedObjects.push(obj);
    return obj;
  }
}
