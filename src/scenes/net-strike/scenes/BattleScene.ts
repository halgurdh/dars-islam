import Phaser from 'phaser';
import { CHIP_LIBRARY, CUSTOM_GAUGE_MAX, ENEMY_MAX_HP, ENEMY_MOVE_MS, PLAYER_MAX_HP, PLAYER_MOVE_MS, SCENE_HEIGHT, SCENE_WIDTH } from '../constants';
import { EnemyCharacter, PlayerCharacter } from '../entities/Character';
import { ChipManager } from '../systems/ChipManager';
import { GridSystem } from '../systems/GridSystem';
import { UIManager } from '../systems/UIManager';
import type { BattleState, ChipDefinition, GridCoord, GridOwner } from '../types';

interface Projectile {
  sprite: Phaser.GameObjects.Image;
  particles: Phaser.GameObjects.Particles.ParticleEmitter;
  owner: GridOwner;
  row: number;
  speed: number;
  damage: number;
  heavy?: boolean;
  hasHit: boolean;
}

export class BattleScene extends Phaser.Scene {
  private battleState: BattleState = 'BATTLE_INTRO';
  private grid!: GridSystem;
  private player!: PlayerCharacter;
  private enemy!: EnemyCharacter;
  private chipManager!: ChipManager;
  private ui!: UIManager;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private gaugeValue = 0;
  private customHand: ChipDefinition[] = [];
  private customCursor = 0;
  private selectedChipIndices: number[] = [];
  private projectiles: Projectile[] = [];
  private enemyLoop?: Phaser.Time.TimerEvent;
  private areaGrabTimer?: Phaser.Time.TimerEvent;
  private enemyActionLocked = false;
  private combatFrozen = true;

  constructor() {
    super('NetStrikeBattle');
  }

  create(): void {
    this.createBackdrop();
    this.grid = new GridSystem(this, 278, 258, 112, 96, 26);
    this.grid.create();

    this.player = new PlayerCharacter(this, this.grid, { col: 1, row: 1 }, PLAYER_MAX_HP);
    this.enemy = new EnemyCharacter(this, this.grid, { col: 4, row: 1 }, ENEMY_MAX_HP);
    this.player.alpha = 0;
    this.enemy.alpha = 0;

    this.chipManager = new ChipManager();
    this.ui = new UIManager(this);
    this.ui.updateQueue([]);
    this.ui.updateState(this.battleState);
    this.setupInput();
    this.createHudLabels();

    this.grid.playIntro(() => {
      this.tweens.add({ targets: [this.player, this.enemy], alpha: 1, duration: 220 });
      this.time.delayedCall(320, () => {
        this.startRealtimeCombat();
        this.ui.showBanner('BATTLE ROUTINE, SET!', '#baf4ff');
      });
    });
  }

  update(_: number, delta: number): void {
    this.player.updateVisuals();
    this.enemy.updateVisuals();

    if (this.battleState === 'REALTIME_COMBAT') {
      this.gaugeValue = Math.min(CUSTOM_GAUGE_MAX, this.gaugeValue + delta);
      this.handleCombatInput();
    } else if (this.battleState === 'CUSTOM_SCREEN') {
      this.handleCustomScreenInput();
    }

    this.ui.updateGauge(this.gaugeValue, this.gaugeValue >= CUSTOM_GAUGE_MAX);
    this.updateProjectiles(delta);
  }

  private createBackdrop(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a1830, 0x0a1830, 0x040813, 0x040813, 1)
      .fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    for (let i = 0; i < 18; i += 1) {
      const color = i % 2 === 0 ? 0x2ca9ff : 0xff4a81;
      const alpha = i % 2 === 0 ? 0.08 : 0.05;
      this.add.circle(
        Phaser.Math.Between(60, SCENE_WIDTH - 60),
        Phaser.Math.Between(50, SCENE_HEIGHT - 50),
        Phaser.Math.Between(40, 120),
        color,
        alpha,
      );
    }
    const lane = this.add.graphics();
    lane.fillStyle(0x0a1322, 0.84).fillRoundedRect(170, 196, 944, 344, 36);
    lane.lineStyle(2, 0x284666, 0.7).strokeRoundedRect(170, 196, 944, 344, 36);
    this.add.text(182, 560, 'ARROWS / WASD MOVE    SPACE FIRE / USE CHIP    ENTER CUSTOM', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#8db7dd',
      fontStyle: 'bold',
    });
  }

  private createHudLabels(): void {
    this.add.text(220, 172, 'PLAYER SIDE', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#91deff',
      fontStyle: 'bold',
    });
    this.add.text(900, 172, 'ENEMY SIDE', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#ff9ebb',
      fontStyle: 'bold',
    });
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  private startRealtimeCombat(): void {
    this.battleState = 'REALTIME_COMBAT';
    this.combatFrozen = false;
    this.ui.updateState(this.battleState);
    this.enemyLoop?.destroy();
    this.enemyLoop = this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => this.runEnemyTurn(),
    });
  }

  private handleCombatInput(): void {
    if (this.combatFrozen || this.player.isMoving) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.enterKey) && this.gaugeValue >= CUSTOM_GAUGE_MAX) {
      this.openCustomScreen();
      return;
    }

    const direction = this.consumeMovementInput();
    if (direction !== null) {
      const next = {
        col: this.player.coord.col + direction.col,
        row: this.player.coord.row + direction.row,
      };
      if (this.grid.canOccupy('player', next)) {
        this.player.dashTo(next, PLAYER_MOVE_MS);
      }
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.firePlayerAction();
    }
  }

  private handleCustomScreenInput(): void {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.customCursor = Phaser.Math.Wrap(this.customCursor - 1, 0, this.customHand.length);
      this.ui.refreshCustomScreen(this.customHand, this.selectedChipIndices, this.customCursor);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.customCursor = Phaser.Math.Wrap(this.customCursor + 1, 0, this.customHand.length);
      this.ui.refreshCustomScreen(this.customHand, this.selectedChipIndices, this.customCursor);
    }
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      const idx = this.selectedChipIndices.indexOf(this.customCursor);
      if (idx >= 0) {
        this.selectedChipIndices.splice(idx, 1);
      } else if (this.selectedChipIndices.length < 3) {
        this.selectedChipIndices.push(this.customCursor);
      }
      this.ui.refreshCustomScreen(this.customHand, this.selectedChipIndices, this.customCursor);
    }
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      const chips = this.selectedChipIndices.map((index) => this.customHand[index]);
      this.chipManager.queueSelected(chips);
      this.ui.updateQueue(this.chipManager.getQueue());
      this.closeCustomScreen();
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

  private openCustomScreen(): void {
    this.battleState = 'CUSTOM_SCREEN';
    this.combatFrozen = true;
    this.enemyActionLocked = true;
    this.ui.updateState(this.battleState);
    this.customHand = this.chipManager.drawHand();
    if (this.customHand.length === 0) {
      this.customHand = CHIP_LIBRARY.slice(0, 3);
    }
    this.customCursor = 0;
    this.selectedChipIndices = [];
    this.ui.showCustomScreen(this.customHand, this.selectedChipIndices, this.customCursor);
  }

  private closeCustomScreen(): void {
    this.gaugeValue = 0;
    this.ui.hideCustomScreen();
    this.battleState = 'REALTIME_COMBAT';
    this.combatFrozen = false;
    this.enemyActionLocked = false;
    this.ui.updateState(this.battleState);
    this.ui.showBanner('CHIPS SENT!', '#ffe49f');
  }

  private firePlayerAction(): void {
    const chip = this.chipManager.consumeNext();
    this.ui.updateQueue(this.chipManager.getQueue());
    if (!chip) {
      this.fireMegaBuster();
      return;
    }

    if (chip.id === 'cannon') {
      this.fireProjectile('player', this.player.coord.row, chip.damage, 980, true);
      this.ui.showBanner('CANNON!', '#ffd278');
      return;
    }

    if (chip.id === 'wide-sword') {
      this.executeWideSword();
      return;
    }

    this.executeAreaGrab();
  }

  private fireMegaBuster(): void {
    this.player.shootPulse();
    this.fireProjectile('player', this.player.coord.row, 20, 1340, false);
  }

  private fireProjectile(owner: GridOwner, row: number, damage: number, speed: number, heavy: boolean): void {
    const shooter = owner === 'player' ? this.player : this.enemy;
    shooter.shootPulse();
    const startX = shooter.x + (owner === 'player' ? 38 : -38);
    const sprite = this.add.image(startX, this.grid.getCenterLineY(row), heavy ? 'net-strike-cannon' : 'net-strike-bullet')
      .setDepth(900)
      .setBlendMode(Phaser.BlendModes.ADD);
    const particles = this.add.particles(0, 0, 'net-strike-dot', {
      speed: { min: 10, max: 50 },
      lifespan: 180,
      scale: { start: heavy ? 0.9 : 0.5, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint: owner === 'player' ? [0xfff6a8, 0xffd55c] : [0xff9db4, 0xff5d88],
      emitting: false,
      follow: sprite,
      frequency: 18,
    });
    this.projectiles.push({
      sprite,
      particles,
      owner,
      row,
      speed,
      damage,
      heavy,
      hasHit: false,
    });
  }

  private updateProjectiles(delta: number): void {
    const distance = delta / 1000;
    this.projectiles = this.projectiles.filter((projectile) => {
      const direction = projectile.owner === 'player' ? 1 : -1;
      projectile.sprite.x += projectile.speed * distance * direction;
      const target = projectile.owner === 'player' ? this.enemy : this.player;

      if (!projectile.hasHit && target.coord.row === projectile.row) {
        const passed = projectile.owner === 'player'
          ? projectile.sprite.x >= target.x - 12
          : projectile.sprite.x <= target.x + 12;
        if (passed) {
          projectile.hasHit = true;
          this.damageCharacter(target, projectile.damage, projectile.heavy ? 5 : 0);
          this.spawnImpact(projectile.sprite.x, projectile.sprite.y, projectile.owner === 'player' ? 0xffe07c : 0xff7ba3);
          projectile.sprite.destroy();
          projectile.particles.stop();
          projectile.particles.destroy();
          return false;
        }
      }

      const offscreen = projectile.sprite.x < -60 || projectile.sprite.x > SCENE_WIDTH + 60;
      if (offscreen) {
        projectile.sprite.destroy();
        projectile.particles.stop();
        projectile.particles.destroy();
        return false;
      }
      return true;
    });
  }

  private executeWideSword(): void {
    const targetColumn = this.grid.getImpactColumn('player', this.player.coord);
    if (targetColumn === null) {
      return;
    }
    this.player.shootPulse();
    const slashX = this.grid.getColumnX(targetColumn);
    const slash = this.add.graphics().setDepth(940);
    slash.fillStyle(0x52ff9f, 0.25).fillRect(slashX - 32, 220, 64, 280);
    slash.lineStyle(5, 0xafffcb, 0.96);
    slash.beginPath();
    slash.moveTo(slashX - 28, 505);
    slash.lineTo(slashX + 10, 210);
    slash.lineTo(slashX + 38, 505);
    slash.strokePath();
    this.tweens.add({
      targets: slash,
      alpha: 0,
      duration: 220,
      onComplete: () => slash.destroy(),
    });
    if (this.enemy.coord.col === targetColumn) {
      this.damageCharacter(this.enemy, 80, 7);
    }
    this.ui.showBanner('WIDE SWORD!', '#bafec9');
  }

  private executeAreaGrab(): void {
    const stolen = this.grid.stealEnemyColumn();
    if (stolen === null) {
      this.ui.showBanner('AREA BLOCKED', '#ffe2a0');
      return;
    }
    this.areaGrabTimer?.destroy();
    this.areaGrabTimer = this.time.delayedCall(10000, () => {
      this.grid.restoreStolenColumn();
      if (this.enemy.coord.col === stolen) {
        this.moveEnemyToValidTile();
      }
    });
    const coords = this.grid.getColumnTiles(stolen);
    this.grid.flashWarning(coords, 520);
    this.ui.showBanner('AREA GRAB!', '#ffe89a');
  }

  private runEnemyTurn(): void {
    if (this.battleState !== 'REALTIME_COMBAT' || this.enemyActionLocked || this.enemy.isMoving) {
      return;
    }
    if (Phaser.Math.FloatBetween(0, 1) < 0.48) {
      this.enemyTelegraphAttack();
      return;
    }
    const options: GridCoord[] = [
      { col: this.enemy.coord.col - 1, row: this.enemy.coord.row },
      { col: this.enemy.coord.col + 1, row: this.enemy.coord.row },
      { col: this.enemy.coord.col, row: this.enemy.coord.row - 1 },
      { col: this.enemy.coord.col, row: this.enemy.coord.row + 1 },
    ].filter((coord) => this.grid.canOccupy('enemy', coord));

    if (options.length === 0) {
      return;
    }
    const next = Phaser.Utils.Array.GetRandom(options);
    this.enemy.dashTo(next, ENEMY_MOVE_MS);
  }

  private enemyTelegraphAttack(): void {
    this.enemyActionLocked = true;
    const useWave = Phaser.Math.FloatBetween(0, 1) < 0.45;
    if (useWave) {
      const targetColumn = this.player.coord.col;
      const coords = this.grid.getColumnTiles(targetColumn);
      this.grid.flashWarning(coords, 600, () => {
        const x = this.grid.getColumnX(targetColumn);
        const wave = this.add.graphics().setDepth(940);
        wave.fillStyle(0xff4e84, 0.28).fillRect(x - 62, 206, 124, 324);
        wave.lineStyle(4, 0xffa9c2, 0.92).strokeRect(x - 62, 206, 124, 324);
        this.tweens.add({
          targets: wave,
          alpha: 0,
          duration: 250,
          onComplete: () => wave.destroy(),
        });
        if (this.player.coord.col === targetColumn) {
          this.damageCharacter(this.player, 50, 6);
        }
        this.enemyActionLocked = false;
      });
      return;
    }

    const targetRow = this.player.coord.row;
    const coords = this.grid.getRowTiles(targetRow).filter((coord) => coord.col < 3);
    this.grid.flashWarning(coords, 600, () => {
      this.fireProjectile('enemy', targetRow, 40, 1120, false);
      this.enemyActionLocked = false;
    });
  }

  private damageCharacter(target: PlayerCharacter | EnemyCharacter, amount: number, shake: number): void {
    target.takeDamage(amount);
    if (shake > 0) {
      this.cameras.main.shake(130, shake / 1000);
    }
    this.spawnDamagePopup(target.x, target.y - 90, `-${amount} HP`, target.owner === 'player' ? '#9fd7ff' : '#ffb3c9');
    if (target.health <= 0) {
      this.finishBattle(target.owner === 'player' ? 'GAME_OVER' : 'VICTORY');
    }
  }

  private spawnImpact(x: number, y: number, tint: number): void {
    const particles = this.add.particles(x, y, 'net-strike-dot', {
      speed: { min: 80, max: 240 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint: [tint, 0xffffff],
      lifespan: 260,
      quantity: 14,
      emitting: false,
    });
    particles.explode(14, x, y);
    this.time.delayedCall(320, () => particles.destroy());
  }

  private spawnDamagePopup(x: number, y: number, label: string, color: string): void {
    const popup = this.add.text(x, y, label, {
      fontFamily: 'Segoe UI',
      fontSize: '24px',
      fontStyle: 'bold',
      color,
      stroke: '#07111f',
      strokeThickness: 5,
    }).setDepth(1200).setOrigin(0.5);
    this.tweens.add({
      targets: popup,
      y: y - 34,
      alpha: 0,
      duration: 520,
      ease: 'Cubic.easeOut',
      onComplete: () => popup.destroy(),
    });
  }

  private moveEnemyToValidTile(): void {
    const fallback = [{ col: 4, row: 1 }, { col: 5, row: 1 }, { col: 4, row: 0 }, { col: 4, row: 2 }]
      .find((coord) => this.grid.canOccupy('enemy', coord));
    if (fallback) {
      this.enemy.dashTo(fallback, ENEMY_MOVE_MS);
    }
  }

  private finishBattle(nextState: Extract<BattleState, 'GAME_OVER' | 'VICTORY'>): void {
    if (this.battleState === 'GAME_OVER' || this.battleState === 'VICTORY') {
      return;
    }
    this.battleState = nextState;
    this.combatFrozen = true;
    this.enemyActionLocked = true;
    this.enemyLoop?.destroy();
    this.ui.updateState(this.battleState);
    if (nextState === 'VICTORY') {
      this.ui.showEndOverlay('VICTORY', 'Enemy deleted.', 0x8af7bb, () => this.scene.restart());
    } else {
      this.ui.showEndOverlay('GAME OVER', 'Your operator has been forced offline.', 0xff89ad, () => this.scene.restart());
    }
  }
}
