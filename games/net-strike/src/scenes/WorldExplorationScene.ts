import Phaser from 'phaser';
import { CHIP_LIBRARY, SCENE_HEIGHT, SCENE_WIDTH } from '../constants';
import { getSlicedFrameOrigin } from '../spriteSlices';
import type { ChipDefinition } from '../types';

const TILE_SIZE = 32;
const MAP_LAYOUT = [
  '########################################',
  '#...................#..................#',
  '#..######...........#........#####.....#',
  '#..#....#...........#........#...#.....#',
  '#..#....#....####...#........#...#.....#',
  '#..#....#....#..#............#...#.....#',
  '#..####.#....#..######..####.#.###.....#',
  '#.......#....#...............#.........#',
  '#.......#....#....######.....#....###..#',
  '#.......#.........#....#..........#....#',
  '#..############...#....#..####....#....#',
  '#..................#..##..#..#....#....#',
  '#....######........#.......#..#....#...#',
  '#....#....#........#######.#..######...#',
  '#....#....#................#...........#',
  '#....#....######..##########...........#',
  '#....#.................................#',
  '########################################',
] as const;

type EncounterOutcome = {
  encounterId?: string;
  rewardChip?: ChipDefinition;
};

export class WorldExplorationScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private jackInKey!: Phaser.Input.Keyboard.Key;
  private prompt!: Phaser.GameObjects.Container;
  private terminal!: Phaser.GameObjects.Container;
  private terminalId = 'alpha-terminal';
  private encounterResolved = false;
  private transitionLocked = false;

  constructor() {
    super('WorldExplorationScene');
  }

  create(): void {
    this.transitionLocked = false;
    this.createMap();
    this.createPlayer();
    this.createTerminal();
    this.createPrompt();
    this.setupInput();
    this.setupCamera();
    this.registerBattleListeners();
    this.showToast('Walk the grid and jack into the glowing terminal.', '#9fe8ff');
  }

  update(): void {
    if (!this.player || this.transitionLocked) {
      return;
    }

    this.updateMovement();
    this.updatePrompt();
  }

  private createMap(): void {
    const graphics = this.add.graphics();
    const worldWidth = MAP_LAYOUT[0].length * TILE_SIZE;
    const worldHeight = MAP_LAYOUT.length * TILE_SIZE;

    graphics.fillGradientStyle(0x06111e, 0x071726, 0x051018, 0x02060b, 1);
    graphics.fillRect(0, 0, worldWidth, worldHeight);

    this.walls = this.physics.add.staticGroup();

    MAP_LAYOUT.forEach((row, rowIndex) => {
      [...row].forEach((tile, colIndex) => {
        const x = colIndex * TILE_SIZE;
        const y = rowIndex * TILE_SIZE;

        if (tile === '#') {
          graphics.fillStyle(0x13304b, 1).fillRoundedRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2, 6);
          graphics.fillStyle(0x1d4b70, 0.4).fillRoundedRect(x + 4, y + 4, TILE_SIZE - 10, TILE_SIZE - 10, 5);
          const wall = this.add.rectangle(x + TILE_SIZE / 2, y + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, 0x000000, 0);
          this.physics.add.existing(wall, true);
          this.walls.add(wall);
          return;
        }

        const tint = (rowIndex + colIndex) % 2 === 0 ? 0x0d2033 : 0x0b1b2c;
        graphics.fillStyle(tint, 1).fillRect(x, y, TILE_SIZE, TILE_SIZE);
        graphics.lineStyle(1, 0x13314c, 0.5).strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      });
    });

    this.registry.set('netStrikeWorldBounds', { width: worldWidth, height: worldHeight });
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(160, 160, 'player_cell_0')
      .setDepth(50)
      .setScale(0.28);
    this.syncPlayerOrigin();
    const body = this.player.body as Phaser.Physics.Arcade.Body | null;
    body?.setSize(60, 76).setOffset(56, 152);
    this.player.setCollideWorldBounds(true);
    this.player.on(Phaser.Animations.Events.ANIMATION_UPDATE, () => this.syncPlayerOrigin());
    this.player.play('player_idle');
    this.physics.add.collider(this.player, this.walls);
  }

  private createTerminal(): void {
    const x = 1088;
    const y = 320;
    const base = this.add.graphics();
    base.fillStyle(0x08131f, 1).fillRoundedRect(-18, -22, 36, 44, 10);
    base.lineStyle(2, 0x77d8ff, 0.9).strokeRoundedRect(-18, -22, 36, 44, 10);
    base.fillStyle(0x7ce8ff, 0.75).fillRoundedRect(-10, -15, 20, 16, 5);
    const glow = this.add.circle(0, 0, 30, 0x59dbff, 0.18);
    const crystal = this.add.graphics();
    crystal.fillStyle(0xff5f9c, 0.95);
    crystal.beginPath();
    crystal.moveTo(0, -26);
    crystal.lineTo(12, -2);
    crystal.lineTo(0, 18);
    crystal.lineTo(-12, -2);
    crystal.closePath();
    crystal.fillPath();
    crystal.lineStyle(2, 0xffffff, 0.65).strokePath();

    this.terminal = this.add.container(x, y, [glow, base, crystal]).setDepth(55);
    this.tweens.add({
      targets: [glow, crystal],
      y: '-=6',
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: glow,
      alpha: 0.34,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
  }

  private createPrompt(): void {
    const bubble = this.add.graphics();
    bubble.fillStyle(0x07111f, 0.92).fillRoundedRect(-78, -22, 156, 38, 16);
    bubble.lineStyle(2, 0x7ce8ff, 0.9).strokeRoundedRect(-78, -22, 156, 38, 16);
    bubble.fillStyle(0x07111f, 0.92).fillTriangle(-14, 16, 0, 30, 14, 16);
    bubble.lineStyle(2, 0x7ce8ff, 0.9).strokeTriangle(-14, 16, 0, 30, 14, 16);
    const label = this.add.text(0, -3, 'Press E to Jack In!', {
      fontFamily: 'Segoe UI',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f3fbff',
    }).setOrigin(0.5);

    this.prompt = this.add.container(this.terminal.x, this.terminal.y - 44, [bubble, label])
      .setDepth(70)
      .setVisible(false)
      .setAlpha(0);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.jackInKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  private setupCamera(): void {
    const bounds = this.registry.get('netStrikeWorldBounds') as { width: number; height: number };
    this.physics.world.setBounds(0, 0, bounds.width, bounds.height);
    this.cameras.main.setBounds(0, 0, bounds.width, bounds.height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor('#041018');

    this.add.text(24, 22, 'Aster Grid - Sector 01', {
      fontFamily: 'Segoe UI',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#d9f6ff',
      stroke: '#041018',
      strokeThickness: 4,
    }).setScrollFactor(0).setDepth(100);
    this.add.text(24, 52, 'Find the live terminal and jack into the encounter.', {
      fontFamily: 'Segoe UI',
      fontSize: '15px',
      color: '#7eb4d4',
    }).setScrollFactor(0).setDepth(100);
  }

  private updateMovement(): void {
    const moveX = (this.cursors.left.isDown || this.wasd.A.isDown ? -1 : 0) + (this.cursors.right.isDown || this.wasd.D.isDown ? 1 : 0);
    const moveY = (this.cursors.up.isDown || this.wasd.W.isDown ? -1 : 0) + (this.cursors.down.isDown || this.wasd.S.isDown ? 1 : 0);
    const vector = new Phaser.Math.Vector2(moveX, moveY).normalize().scale(170);
    this.player.setVelocity(vector.x, vector.y);

    if (vector.x < -5) {
      this.player.setFlipX(true);
    } else if (vector.x > 5) {
      this.player.setFlipX(false);
    }
  }

  private updatePrompt(): void {
    const nearTerminal = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.terminal.x, this.terminal.y) <= 56;
    this.prompt.setPosition(this.terminal.x, this.terminal.y - 52);

    if (nearTerminal && !this.encounterResolved) {
      if (!this.prompt.visible) {
        this.prompt.setVisible(true);
        this.tweens.add({ targets: this.prompt, alpha: 1, duration: 140 });
      }
      if (Phaser.Input.Keyboard.JustDown(this.jackInKey)) {
        this.startEncounter();
      }
      return;
    }

    if (this.prompt.visible) {
      this.prompt.setVisible(false);
      this.prompt.setAlpha(0);
    }
  }

  private startEncounter(): void {
    if (this.transitionLocked || this.encounterResolved) {
      return;
    }

    this.transitionLocked = true;
    this.player.setVelocity(0, 0);
    this.cameras.main.flash(280, 120, 225, 255, false);

    const scan = this.add.rectangle(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y, SCENE_WIDTH, 0, 0x8ae8ff, 0.3)
      .setScrollFactor(0)
      .setDepth(120);
    this.tweens.add({
      targets: scan,
      height: SCENE_HEIGHT,
      alpha: 0,
      duration: 260,
      ease: 'Cubic.easeOut',
      onComplete: () => scan.destroy(),
    });

    this.time.delayedCall(320, () => {
      this.scene.launch('FinalBossBattleScene', { returnSceneKey: this.scene.key, encounterId: this.terminalId });
      this.scene.pause();
    });
  }

  private registerBattleListeners(): void {
    this.game.events.off('BATTLE_WIN', this.handleBattleWin, this);
    this.game.events.off('BATTLE_LOSE', this.handleBattleLose, this);
    this.game.events.on('BATTLE_WIN', this.handleBattleWin, this);
    this.game.events.on('BATTLE_LOSE', this.handleBattleLose, this);

    this.events.once('shutdown', () => {
      this.game.events.off('BATTLE_WIN', this.handleBattleWin, this);
      this.game.events.off('BATTLE_LOSE', this.handleBattleLose, this);
    });
  }

  private handleBattleWin(data?: EncounterOutcome): void {
    if (data?.encounterId === this.terminalId) {
      this.encounterResolved = true;
      this.terminal.destroy(true);
      this.prompt.setVisible(false);
      const reward = data.rewardChip ?? CHIP_LIBRARY[0];
      const rewards = this.registry.get('netStrikeRewards') as ChipDefinition[] | undefined;
      this.registry.set('netStrikeRewards', [...(rewards ?? []), reward]);
      this.showToast(`Jack In complete. New chip data archived: ${reward.name} ${reward.code}.`, '#baffc9');
    }
    this.transitionLocked = false;
    this.scene.resume(this.scene.key);
  }

  private handleBattleLose(): void {
    this.transitionLocked = false;
    this.showToast('Connection dropped. Jack back in when you are ready.', '#ffb6d0');
    this.scene.resume(this.scene.key);
  }

  private showToast(message: string, color: string): void {
    const toast = this.add.text(SCENE_WIDTH / 2, 94, message, {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      fontStyle: 'bold',
      color,
      stroke: '#041018',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: 560 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(140).setAlpha(0);

    this.tweens.add({
      targets: toast,
      alpha: 1,
      y: 82,
      duration: 180,
      ease: 'Cubic.easeOut',
      yoyo: true,
      hold: 1200,
      onComplete: () => toast.destroy(),
    });
  }

  private syncPlayerOrigin(): void {
    const origin = getSlicedFrameOrigin(this.player.texture.key);
    if (origin) {
      this.player.setOrigin(origin.x, origin.y);
      return;
    }
    this.player.setOrigin(0.5, 0.5);
  }
}
