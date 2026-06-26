import Phaser from 'phaser';
import { CHIP_LIBRARY, SCENE_WIDTH } from '../constants';
import { getSlicedFrameOrigin } from '../spriteSlices';
import type { ChipDefinition } from '../types';

const TILE_SIZE = 32;
const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 960;

type EncounterOutcome = {
  encounterId?: string;
  rewardChip?: ChipDefinition;
};

type Zone = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const BLOCKERS: Zone[] = [
  { x: 0, y: 0, width: WORLD_WIDTH, height: 32 },
  { x: 0, y: WORLD_HEIGHT - 32, width: WORLD_WIDTH, height: 32 },
  { x: 0, y: 0, width: 32, height: WORLD_HEIGHT },
  { x: WORLD_WIDTH - 32, y: 0, width: 32, height: WORLD_HEIGHT },
  // Original walls
  { x: 288, y: 192, width: 224, height: 96 },
  { x: 672, y: 96, width: 96, height: 256 },
  { x: 976, y: 192, width: 288, height: 96 },
  { x: 192, y: 608, width: 256, height: 96 },
  { x: 704, y: 608, width: 192, height: 160 },
  { x: 1136, y: 608, width: 192, height: 96 },
  // Additional walls for more challenge
  { x: 480, y: 64, width: 96, height: 64 },
  { x: 1088, y: 64, width: 128, height: 64 },
  { x: 96, y: 384, width: 96, height: 96 },
  { x: 1408, y: 384, width: 96, height: 96 },
  { x: 544, y: 464, width: 96, height: 64 },
  { x: 864, y: 464, width: 96, height: 64 },
  { x: 368, y: 768, width: 160, height: 64 },
  { x: 1024, y: 768, width: 160, height: 64 },
];

/** Candle positions */
const CANDLES: { x: number; y: number }[] = [
  { x: 240, y: 240 },
  { x: 880, y: 160 },
  { x: 1200, y: 256 },
  { x: 240, y: 680 },
  { x: 800, y: 720 },
  { x: 1248, y: 672 },
  { x: 448, y: 512 },
  { x: 1376, y: 480 },
  { x: 64, y: 480 },
  { x: 1536, y: 240 },
];

export class WorldExplorationScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private jackInKey!: Phaser.Input.Keyboard.Key;
  private prompt!: Phaser.GameObjects.Container;
  private terminal!: Phaser.GameObjects.Container;
  private terminalId = 'alpha-terminal';
  private encounterResolved = false;
  private transitionLocked = false;
  private scanLines!: Phaser.GameObjects.TileSprite;
  private battleCount = 0;
  private readonly MAX_BATTLES_BEFORE_BOSS = 10;
  private darknessGraphics!: Phaser.GameObjects.Graphics;
  private lightCutout!: Phaser.GameObjects.Graphics;

  constructor() {
    super('WorldExplorationScene');
  }

  create(): void {
    this.transitionLocked = false;
    this.battleCount = this.registry.get('netStrikeBattleCount') as number ?? 0;
    this.createWorld();

    const bossDefeated = this.registry.get('netStrikeBossDefeated') as boolean ?? false;
    if (bossDefeated) {
      this.encounterResolved = true;
      this.createTerminalPlaceholder();
    } else {
      this.encounterResolved = false;
      this.createTerminal();
    }

    this.createPlayer();
    this.createPrompt();
    this.setupInput();
    this.setupCamera();
    this.registerBattleListeners();

    // Darkness: black overlay with ERASE blend cutouts for light areas
    // Layer 1: black background (darkness)
    this.darknessGraphics = this.add.graphics().setDepth(498);
    this.darknessGraphics.fillStyle(0x000000, 0.88).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Layer 2: light cutout atop the darkness using ERASE blend to punch holes
    this.lightCutout = this.add.graphics().setDepth(499).setBlendMode(Phaser.BlendModes.ERASE);

    this.createCandles();

    if (bossDefeated) {
      this.showToast('All threats eliminated. Grid secure.', '#baffc9');
    } else {
      this.showToast('Signal stable. Find the live terminal.', '#d7fff6');
    }
  }

  update(_: number, delta: number): void {
    this.scanLines.tilePositionY -= delta * 0.018;
    if (!this.player || this.transitionLocked) {
      return;
    }

    this.updateMovement(delta);
    this.updatePrompt();
    this.updateLighting();
    this.playerShadow.setPosition(this.player.x, this.player.y + 4);
  }

  private updateLighting(): void {
    const px = this.player.x;
    const py = this.player.y;

    this.lightCutout.clear();

    // Every white area drawn with ERASE blend will punch through the darkness
    // Player light — largest visible circle
    this.lightCutout.fillStyle(0xffffff, 1).fillCircle(px, py, 160);

    // Terminal light — so player can see destination beacon
    if (!this.encounterResolved) {
      this.lightCutout.fillStyle(0xffffff, 0.8).fillCircle(this.terminal.x, this.terminal.y, 140);
    }

    // Candle lights
    CANDLES.forEach((pos) => {
      const dist = Phaser.Math.Distance.Between(px, py, pos.x, pos.y);
      if (dist < 900) {
        this.lightCutout.fillStyle(0xffffff, 0.6).fillCircle(pos.x, pos.y, 90);
      }
    });
  }

  private createWorld(): void {
    this.cameras.main.setBackgroundColor('#071014');
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.registry.set('netStrikeWorldBounds', { width: WORLD_WIDTH, height: WORLD_HEIGHT });

    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x071014, 0x0e211c, 0x071014, 0x11161f, 1).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    for (let y = 0; y < WORLD_HEIGHT; y += TILE_SIZE) {
      for (let x = 0; x < WORLD_WIDTH; x += TILE_SIZE) {
        const pulse = ((x / TILE_SIZE) + (y / TILE_SIZE)) % 2 === 0 ? 0.11 : 0.06;
        bg.fillStyle(0x102e2c, pulse).fillRect(x, y, TILE_SIZE, TILE_SIZE);
        bg.lineStyle(1, 0x46ffd0, 0.09).strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }

    this.drawRoad(80, 420, 1440, 112, 0x0b1d24, 0x54ffe0);
    this.drawRoad(560, 64, 128, 820, 0x0b1d24, 0xffce6f);
    this.drawRoad(1016, 128, 128, 720, 0x111923, 0xff6f9f);

    this.walls = this.physics.add.staticGroup();
    BLOCKERS.forEach((zone, index) => this.createBlocker(zone, index));

    this.scanLines = this.add.tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, this.makeScanTexture())
      .setOrigin(0)
      .setAlpha(0.15)
      .setDepth(5);
  }

  private drawRoad(x: number, y: number, width: number, height: number, fill: number, line: number): void {
    const road = this.add.graphics().setDepth(1);
    road.fillStyle(fill, 0.88).fillRoundedRect(x, y, width, height, 18);
    road.lineStyle(2, line, 0.35).strokeRoundedRect(x + 4, y + 4, width - 8, height - 8, 14);
    road.lineStyle(1, 0xffffff, 0.08);
    for (let offset = 24; offset < width + height; offset += 56) {
      road.lineBetween(x + offset, y + 12, x + offset - 44, y + height - 12);
    }
  }

  private createBlocker(zone: Zone, index: number): void {
    const body = this.add.rectangle(zone.x + zone.width / 2, zone.y + zone.height / 2, zone.width, zone.height, 0x000000, 0);
    this.physics.add.existing(body, true);
    this.walls.add(body);

    if (zone.x === 0 || zone.y === 0 || zone.x + zone.width === WORLD_WIDTH || zone.y + zone.height === WORLD_HEIGHT) {
      return;
    }

    const panel = this.add.graphics().setDepth(12);
    const accent = index % 3 === 0 ? 0x54ffe0 : index % 3 === 1 ? 0xffce6f : 0xff6f9f;
    panel.fillStyle(0x10202a, 0.95).fillRoundedRect(zone.x, zone.y, zone.width, zone.height, 10);
    panel.fillStyle(accent, 0.1).fillRoundedRect(zone.x + 8, zone.y + 8, zone.width - 16, zone.height - 16, 8);
    panel.lineStyle(2, accent, 0.55).strokeRoundedRect(zone.x, zone.y, zone.width, zone.height, 10);
    panel.lineStyle(1, 0xffffff, 0.16);
    for (let x = zone.x + 18; x < zone.x + zone.width - 12; x += 24) {
      panel.lineBetween(x, zone.y + 14, x, zone.y + zone.height - 14);
    }
  }

  private makeScanTexture(): string {
    const key = 'net-strike-world-scanline';
    if (this.textures.exists(key)) {
      return key;
    }
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 0.3).fillRect(0, 0, 8, 1);
    graphics.generateTexture(key, 8, 8);
    graphics.destroy();
    return key;
  }

  private createPlayer(): void {
    this.playerShadow = this.add.ellipse(160, 168, 42, 13, 0x000000, 0.36).setDepth(35);
    this.player = this.physics.add.sprite(160, 160, 'player_cell_0')
      .setDepth(50)
      .setScale(0.36);
    this.syncPlayerOrigin();
    this.player.play('player_idle');
    this.player.setCollideWorldBounds(true);
    this.player.on(Phaser.Animations.Events.ANIMATION_UPDATE, () => this.syncPlayerOrigin());

    const body = this.player.body as Phaser.Physics.Arcade.Body | null;
    this.updatePlayerBody();
    body?.setMaxVelocity(230, 230);
    this.physics.add.collider(this.player, this.walls);
  }

  private updatePlayerBody(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      return;
    }
    const width = this.player.texture.getSourceImage().width;
    const height = this.player.texture.getSourceImage().height;
    body.setSize(34, 28);
    body.setOffset(width / 2 - 17, height - 30);
  }

  private createCandles(): void {
    CANDLES.forEach((pos) => {
      const base = this.add.graphics().setDepth(488);
      base.fillStyle(0x332211, 0.9).fillRect(pos.x - 3, pos.y - 8, 6, 14);
      base.fillStyle(0x665544, 0.8).fillRect(pos.x - 1, pos.y - 7, 2, 10);
      const glow = this.add.circle(pos.x, pos.y, 6, 0xffd080, 0.35).setDepth(489);
      const flame = this.add.circle(pos.x, pos.y - 7, 3, 0xffdd88, 0.7).setDepth(490);
      this.tweens.add({
        targets: glow, scaleX: 1.4, scaleY: 1.4, alpha: 0.2,
        duration: 700 + Phaser.Math.Between(0, 300), yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
      this.tweens.add({
        targets: flame, scaleX: 1.5, scaleY: 0.7, alpha: 0.5,
        duration: 150 + Phaser.Math.Between(0, 80), yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });
  }

  private createTerminalPlaceholder(): void {
    const x = 1264;
    const y = 456;
    const base = this.add.graphics();
    base.fillStyle(0x08141a, 0.4).fillRoundedRect(-42, -58, 84, 116, 18);
    base.lineStyle(1, 0x284a4a, 0.3).strokeRoundedRect(-42, -58, 84, 116, 18);
    const text = this.add.text(0, 0, 'OFFLINE', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#3d6a6a' }).setOrigin(0.5);
    this.terminal = this.add.container(x, y, [base, text]).setDepth(44).setAlpha(0.6);
  }

  private createTerminal(): void {
    const x = 1264;
    const y = 456;
    const glow = this.add.circle(0, 0, 68, 0x5dffe4, 0.14);
    const base = this.add.graphics();
    base.fillStyle(0x08141a, 1).fillRoundedRect(-42, -58, 84, 116, 18);
    base.fillStyle(0x173034, 1).fillRoundedRect(-30, -46, 60, 86, 12);
    base.lineStyle(3, 0x70ffe9, 0.9).strokeRoundedRect(-42, -58, 84, 116, 18);
    base.fillStyle(0x8dffef, 0.85).fillRoundedRect(-20, -34, 40, 28, 7);
    base.fillStyle(0xffd36d, 0.82).fillCircle(0, 28, 11);
    const crystal = this.add.graphics();
    crystal.fillStyle(0xff5f9c, 0.95);
    crystal.beginPath();
    crystal.moveTo(0, -86); crystal.lineTo(28, -38); crystal.lineTo(0, -4); crystal.lineTo(-28, -38);
    crystal.closePath(); crystal.fillPath();
    crystal.lineStyle(2, 0xffffff, 0.78).strokePath();
    this.terminal = this.add.container(x, y, [glow, base, crystal]).setDepth(44);
    this.tweens.add({ targets: glow, scaleX: 1.22, scaleY: 1.22, alpha: 0.28, duration: 900, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: crystal, y: '-=10', duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private createPrompt(): void {
    const bubble = this.add.graphics();
    bubble.fillStyle(0x071214, 0.94).fillRoundedRect(-92, -26, 184, 44, 14);
    bubble.lineStyle(2, 0x8dffef, 0.9).strokeRoundedRect(-92, -26, 184, 44, 14);
    bubble.fillStyle(0x071214, 0.94).fillTriangle(-12, 18, 0, 32, 12, 18);
    const label = this.add.text(0, -4, 'Press E to Jack In!', {
      fontFamily: 'Trebuchet MS', fontSize: '17px', fontStyle: 'bold', color: '#f4fffb',
    }).setOrigin(0.5);
    this.prompt = this.add.container(this.terminal.x, this.terminal.y - 104, [bubble, label])
      .setDepth(90).setVisible(false).setAlpha(0);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.jackInKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.add.text(24, 22, 'ASTER GRID // SECTOR 01', {
      fontFamily: 'Trebuchet MS', fontSize: '22px', fontStyle: 'bold', color: '#d7fff6',
      stroke: '#000000', strokeThickness: 4,
    }).setScrollFactor(0).setDepth(600);
    this.add.text(24, 52, 'Terminal signal detected eastbound.', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#9dc9be',
      stroke: '#000000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(600);
  }

  private updateMovement(_delta: number): void {
    const moveX = (this.cursors.left.isDown || this.wasd.A.isDown ? -1 : 0) + (this.cursors.right.isDown || this.wasd.D.isDown ? 1 : 0);
    const moveY = (this.cursors.up.isDown || this.wasd.W.isDown ? -1 : 0) + (this.cursors.down.isDown || this.wasd.S.isDown ? 1 : 0);
    const vector = new Phaser.Math.Vector2(moveX, moveY);
    const moving = vector.lengthSq() > 0;

    if (moving) {
      vector.normalize().scale(220);
    }
    this.player.setVelocity(vector.x, vector.y);

    if (vector.x < -5) {
      this.player.setFlipX(true);
    } else if (vector.x > 5) {
      this.player.setFlipX(false);
    }

    if (moving && this.player.anims.currentAnim?.key !== 'player_dash') {
      this.player.play('player_dash');
    } else if (!moving && this.player.anims.currentAnim?.key !== 'player_idle') {
      this.player.play('player_idle');
    }
  }

  private updatePrompt(): void {
    const nearTerminal = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.terminal.x, this.terminal.y) <= 104;
    this.prompt.setPosition(this.terminal.x, this.terminal.y - 112);

    if (nearTerminal && !this.encounterResolved) {
      if (!this.prompt.visible) {
        this.prompt.setVisible(true);
        this.tweens.add({ targets: this.prompt, alpha: 1, y: this.prompt.y - 8, duration: 160, ease: 'Cubic.easeOut' });
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
    this.cameras.main.flash(260, 120, 255, 226, false);

    const origin = this.cameras.main.worldView;
    for (let index = 0; index < 10; index += 1) {
      const stripe = this.add.rectangle(origin.x - 80, origin.y + index * 74, SCENE_WIDTH + 160, 18, index % 2 ? 0xff6fa5 : 0x54ffe0, 0.22)
        .setOrigin(0).setDepth(160);
      this.tweens.add({
        targets: stripe, x: stripe.x + 220, alpha: 0,
        duration: 380 + index * 18, ease: 'Cubic.easeOut', onComplete: () => stripe.destroy(),
      });
    }

    this.time.delayedCall(420, () => {
      if (this.battleCount >= this.MAX_BATTLES_BEFORE_BOSS) {
        this.scene.launch('FinalBossBattleScene', { returnSceneKey: this.scene.key, encounterId: this.terminalId });
      } else {
        this.scene.launch('BattleScene', { returnSceneKey: this.scene.key, encounterId: `battle-${this.battleCount}` });
      }
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
    const isFinalBoss = data?.encounterId === this.terminalId;
    if (isFinalBoss) {
      this.encounterResolved = true;
      this.terminal.destroy(true);
      this.prompt.setVisible(false);
      const reward = data.rewardChip ?? CHIP_LIBRARY[0];
      const rewards = this.registry.get('netStrikeRewards') as ChipDefinition[] | undefined;
      this.registry.set('netStrikeRewards', [...(rewards ?? []), reward]);
      this.showToast(`Chip data archived: ${reward.name} ${reward.code}.`, '#baffc9');
    } else {
      this.battleCount += 1;
      this.registry.set('netStrikeBattleCount', this.battleCount);
      const remaining = this.MAX_BATTLES_BEFORE_BOSS - this.battleCount;
      if (remaining > 0) {
        this.showToast(`Encounter purged. ${remaining} sectors remain.`, '#baffc9');
      } else {
        this.showToast('All sectors clear. Boss terminal unlocked!', '#ffe49f');
      }
    }
    this.transitionLocked = false;
    this.scene.resume(this.scene.key);
  }

  private handleBattleLose(): void {
    this.transitionLocked = false;
    this.showToast('Connection interrupted. Re-establishing link...', '#ffb6d0');
    this.scene.resume(this.scene.key);
  }

  private showToast(message: string, color: string): void {
    const toast = this.add.text(SCENE_WIDTH / 2, 92, message, {
      fontFamily: 'Trebuchet MS', fontSize: '18px', fontStyle: 'bold', color,
      stroke: '#000000', strokeThickness: 5, align: 'center', wordWrap: { width: 560 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(600).setAlpha(0);

    this.tweens.add({
      targets: toast, alpha: 1, y: 78, duration: 180, ease: 'Cubic.easeOut',
      yoyo: true, hold: 1350, onComplete: () => toast.destroy(),
    });
  }

  private syncPlayerOrigin(): void {
    const origin = getSlicedFrameOrigin(this.player.texture.key);
    this.player.setOrigin(origin?.x ?? 0.5, origin?.y ?? 1);
  }
}