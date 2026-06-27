import Phaser from 'phaser';
import { CHIP_LIBRARY, SCENE_WIDTH } from '../constants';
import { getSlicedFrameOrigin } from '../spriteSlices';
import { TouchControls } from '../systems/TouchControls';
import type { ChipDefinition } from '../types';
import { ArcadeBar } from '@shared/arcade-bar';

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

const BORDER_BLOCKERS: Zone[] = [
  { x: 0, y: 0, width: WORLD_WIDTH, height: 32 },
  { x: 0, y: WORLD_HEIGHT - 32, width: WORLD_WIDTH, height: 32 },
  { x: 0, y: 0, width: 32, height: WORLD_HEIGHT },
  { x: WORLD_WIDTH - 32, y: 0, width: 32, height: WORLD_HEIGHT },
];

const SPAWN_CORNERS = [
  { x: 112, y: 112 },
  { x: WORLD_WIDTH - 112, y: 112 },
  { x: 112, y: WORLD_HEIGHT - 112 },
  { x: WORLD_WIDTH - 112, y: WORLD_HEIGHT - 112 },
] as const;

const TERMINAL_CANDIDATES = [
  { x: 320, y: 256 },
  { x: 504, y: 736 },
  { x: 720, y: 220 },
  { x: 836, y: 764 },
  { x: 1088, y: 276 },
  { x: 1248, y: 680 },
  { x: 1336, y: 412 },
  { x: 944, y: 548 },
] as const;

export class WorldExplorationScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private jackInKey!: Phaser.Input.Keyboard.Key;
  private touch!: TouchControls;
  private prompt!: Phaser.GameObjects.Container;
  private terminal!: Phaser.GameObjects.Container;
  private terminalId = 'alpha-terminal';
  private encounterResolved = false;
  private transitionLocked = false;
  private scanLines!: Phaser.GameObjects.TileSprite;
  private battleCount = 0;
  private readonly MAX_BATTLES_BEFORE_BOSS = 10;
  private darknessRT!: Phaser.GameObjects.RenderTexture;
  private circleBrush160!: Phaser.GameObjects.Graphics;
  private circleBrush140!: Phaser.GameObjects.Graphics;
  private circleBrush90!: Phaser.GameObjects.Graphics;
  private worldBlockers: Zone[] = [];
  private worldCandles: { x: number; y: number }[] = [];
  private worldTerminalPos = { x: 1264, y: 456 };
  private worldPlayerPos = { x: 112, y: 112 };
  private arcadeBar!: ArcadeBar;

  constructor() {
    super('WorldExplorationScene');
  }

  create(): void {
    this.transitionLocked = false;
    this.arcadeBar = new ArcadeBar();
    this.events.once('shutdown', () => {
      this.arcadeBar.destroy();
      this.touch?.destroy();
    });
    this.battleCount = this.registry.get('netStrikeBattleCount') as number ?? 0;
    this.generateWorldLayout();
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

    // Off-screen circle brushes used with RenderTexture.erase() to cut light holes
    this.circleBrush160 = this.make.graphics({}, false);
    this.circleBrush160.fillStyle(0xffffff, 1).fillCircle(80, 80, 80);

    this.circleBrush140 = this.make.graphics({}, false);
    this.circleBrush140.fillStyle(0xffffff, 1).fillCircle(70, 70, 70);

    this.circleBrush90 = this.make.graphics({}, false);
    this.circleBrush90.fillStyle(0xffffff, 1).fillCircle(45, 45, 45);

    // Darkness RenderTexture: filled black each frame, erased where lights are
    this.darknessRT = this.add.renderTexture(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
      .setOrigin(0, 0)
      .setDepth(498);

    this.createCandles();

    const pendingToast = this.registry.get('netStrikeToast') as { message: string; color: string } | undefined;
    if (pendingToast) {
      this.registry.remove('netStrikeToast');
      this.showToast(pendingToast.message, pendingToast.color);
    } else if (bossDefeated) {
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

    // Reset to full darkness each frame, then erase light areas
    this.darknessRT.fill(0x000000, 0.88);

    this.darknessRT.erase(this.circleBrush160, px - 80, py - 80);

    if (!this.encounterResolved) {
      this.darknessRT.erase(this.circleBrush140, this.terminal.x - 70, this.terminal.y - 70);
    }

    this.worldCandles.forEach((pos) => {
      const dist = Phaser.Math.Distance.Between(px, py, pos.x, pos.y);
      if (dist < 900) {
        this.darknessRT.erase(this.circleBrush90, pos.x - 45, pos.y - 45);
      }
    });
  }

  private generateWorldLayout(): void {
    const GRID = 96;
    const CLEAR_P = 230;
    const CLEAR_T = 200;

    // Pick a player corner, then choose a terminal location that is not
    // mostly straight above/below or left/right from that spawn.
    const pi = Phaser.Math.Between(0, 3);
    const pc = SPAWN_CORNERS[pi];
    this.worldPlayerPos = { x: pc.x, y: pc.y };

    const terminalOptions = Phaser.Utils.Array.Shuffle([...TERMINAL_CANDIDATES]).filter((candidate) => {
      const dx = Math.abs(candidate.x - this.worldPlayerPos.x);
      const dy = Math.abs(candidate.y - this.worldPlayerPos.y);
      const axisRatio = Math.max(dx, dy) / Math.max(1, Math.min(dx, dy));
      return dx >= 360 && dy >= 300 && axisRatio <= 2.15 && Phaser.Math.Distance.Between(candidate.x, candidate.y, this.worldPlayerPos.x, this.worldPlayerPos.y) >= 760;
    });

    const pickedTerminal = terminalOptions[0] ?? TERMINAL_CANDIDATES[0];
    this.worldTerminalPos = {
      x: Phaser.Math.Clamp(pickedTerminal.x + Phaser.Math.Between(-56, 56), 150, WORLD_WIDTH - 150),
      y: Phaser.Math.Clamp(pickedTerminal.y + Phaser.Math.Between(-56, 56), 150, WORLD_HEIGHT - 150),
    };

    // Generate random internal walls
    const blockers: Zone[] = [...BORDER_BLOCKERS];
    const target = Phaser.Math.Between(9, 14);
    for (let attempt = 0; attempt < 80 && blockers.length - 4 < target; attempt++) {
      const isH  = Math.random() > 0.42;
      const cols = Phaser.Math.Between(2, 4);
      const rows = Phaser.Math.Between(1, 2);
      const ww   = isH ? cols * GRID : rows * GRID;
      const wh   = isH ? rows * GRID : cols * GRID;
      const wx   = Phaser.Math.Between(2, Math.floor((WORLD_WIDTH  - ww) / GRID) - 1) * GRID;
      const wy   = Phaser.Math.Between(2, Math.floor((WORLD_HEIGHT - wh) / GRID) - 1) * GRID;
      const cx   = wx + ww / 2;
      const cy   = wy + wh / 2;

      if (
        wx + ww > WORLD_WIDTH - 64 ||
        wy + wh > WORLD_HEIGHT - 64 ||
        Phaser.Math.Distance.Between(cx, cy, this.worldPlayerPos.x, this.worldPlayerPos.y) < CLEAR_P ||
        Phaser.Math.Distance.Between(cx, cy, this.worldTerminalPos.x, this.worldTerminalPos.y) < CLEAR_T
      ) continue;

      blockers.push({ x: wx, y: wy, width: ww, height: wh });
    }
    this.addRouteBaffles(blockers);
    this.worldBlockers = blockers;

    // Random candles
    this.worldCandles = Array.from({ length: 10 }, () => ({
      x: Phaser.Math.Between(80, WORLD_WIDTH - 80),
      y: Phaser.Math.Between(80, WORLD_HEIGHT - 80),
    }));
  }

  private addRouteBaffles(blockers: Zone[]): void {
    const dx = this.worldTerminalPos.x - this.worldPlayerPos.x;
    const dy = this.worldTerminalPos.y - this.worldPlayerPos.y;
    const horizontalRoute = Math.abs(dx) >= Math.abs(dy);
    const stepCount = 3;

    for (let index = 1; index <= stepCount; index += 1) {
      const t = index / (stepCount + 1);
      const routeX = Phaser.Math.Linear(this.worldPlayerPos.x, this.worldTerminalPos.x, t);
      const routeY = Phaser.Math.Linear(this.worldPlayerPos.y, this.worldTerminalPos.y, t);

      if (horizontalRoute) {
        this.addVerticalBaffle(blockers, routeX, routeY, index);
      } else {
        this.addHorizontalBaffle(blockers, routeX, routeY, index);
      }
    }
  }

  private addVerticalBaffle(blockers: Zone[], routeX: number, routeY: number, index: number): void {
    const x = Phaser.Math.Snap.To(Phaser.Math.Clamp(routeX, 320, WORLD_WIDTH - 320), TILE_SIZE);
    const gapY = Phaser.Math.Snap.To(
      Phaser.Math.Clamp(routeY + (index % 2 === 0 ? -240 : 240), 176, WORLD_HEIGHT - 176),
      TILE_SIZE,
    );
    const topY = 32;
    const topHeight = Math.max(0, gapY - 96 - topY);
    const bottomY = gapY + 96;
    const bottomHeight = Math.max(0, WORLD_HEIGHT - 32 - bottomY);

    this.addBaffleSegment(blockers, { x, y: topY, width: 64, height: topHeight });
    this.addBaffleSegment(blockers, { x, y: bottomY, width: 64, height: bottomHeight });
  }

  private addHorizontalBaffle(blockers: Zone[], routeX: number, routeY: number, index: number): void {
    const y = Phaser.Math.Snap.To(Phaser.Math.Clamp(routeY, 224, WORLD_HEIGHT - 224), TILE_SIZE);
    const gapX = Phaser.Math.Snap.To(
      Phaser.Math.Clamp(routeX + (index % 2 === 0 ? -320 : 320), 176, WORLD_WIDTH - 176),
      TILE_SIZE,
    );
    const leftX = 32;
    const leftWidth = Math.max(0, gapX - 112 - leftX);
    const rightX = gapX + 112;
    const rightWidth = Math.max(0, WORLD_WIDTH - 32 - rightX);

    this.addBaffleSegment(blockers, { x: leftX, y, width: leftWidth, height: 64 });
    this.addBaffleSegment(blockers, { x: rightX, y, width: rightWidth, height: 64 });
  }

  private addBaffleSegment(blockers: Zone[], zone: Zone): void {
    if (
      zone.width < 96 ||
      zone.height < 64 ||
      Phaser.Math.Distance.Between(zone.x + zone.width / 2, zone.y + zone.height / 2, this.worldPlayerPos.x, this.worldPlayerPos.y) < 220 ||
      Phaser.Math.Distance.Between(zone.x + zone.width / 2, zone.y + zone.height / 2, this.worldTerminalPos.x, this.worldTerminalPos.y) < 220
    ) {
      return;
    }
    blockers.push(zone);
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
    this.worldBlockers.forEach((zone, index) => this.createBlocker(zone, index));

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

    const panel = this.add.graphics().setDepth(55);
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
    const px = this.worldPlayerPos.x;
    const py = this.worldPlayerPos.y;
    this.playerShadow = this.add.ellipse(px, py + 8, 42, 13, 0x000000, 0.36).setDepth(35);
    this.player = this.physics.add.sprite(px, py, 'player_cell_0')
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
    body.setSize(34, height - 20);
    body.setOffset(width / 2 - 17, 10);
  }

  private createCandles(): void {
    this.worldCandles.forEach((pos) => {
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
    const { x, y } = this.worldTerminalPos;
    const base = this.add.graphics();
    base.fillStyle(0x08141a, 0.4).fillRoundedRect(-42, -58, 84, 116, 18);
    base.lineStyle(1, 0x284a4a, 0.3).strokeRoundedRect(-42, -58, 84, 116, 18);
    const text = this.add.text(0, 0, 'OFFLINE', { fontFamily: 'Trebuchet MS', fontSize: '13px', color: '#3d6a6a' }).setOrigin(0.5);
    this.terminal = this.add.container(x, y, [base, text]).setDepth(44).setAlpha(0.6);
  }

  private createTerminal(): void {
    const { x, y } = this.worldTerminalPos;
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
    const label = this.add.text(0, -4, 'Press E / JACK IN to Jack In!', {
      fontFamily: 'Trebuchet MS', fontSize: '15px', fontStyle: 'bold', color: '#f4fffb',
    }).setOrigin(0.5);
    this.prompt = this.add.container(this.terminal.x, this.terminal.y - 104, [bubble, label])
      .setDepth(600).setVisible(false).setAlpha(0);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.jackInKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.touch = new TouchControls(this, 'world');
    if (this.battleCount === 0) {
      this.time.delayedCall(600, () => this.touch.showHint());
    }
  }

  private setupCamera(): void {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    const sector = String(this.battleCount + 1).padStart(2, '0');
    const dx = this.worldTerminalPos.x - this.worldPlayerPos.x;
    const dy = this.worldTerminalPos.y - this.worldPlayerPos.y;
    const distance = Phaser.Math.Distance.Between(this.worldTerminalPos.x, this.worldTerminalPos.y, this.worldPlayerPos.x, this.worldPlayerPos.y);
    const hint = distance > 900
      ? 'Deep signal detected. Search beyond the first lanes.'
      : Math.abs(dx) > Math.abs(dy)
        ? 'Signal drift detected across the side lanes.'
        : 'Signal drift detected past the upper and lower lanes.';
    const sectorText = this.add.text(24, 22, `ASTER GRID // SECTOR ${sector}`, {
      fontFamily: 'Trebuchet MS', fontSize: '22px', fontStyle: 'bold', color: '#d7fff6',
      stroke: '#000000', strokeThickness: 4,
    }).setScrollFactor(0).setDepth(600);
    const hintText = this.add.text(24, 52, hint, {
      fontFamily: 'Trebuchet MS', fontSize: '15px', color: '#9dc9be',
      stroke: '#000000', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(600);
    this.time.delayedCall(10000, () => {
      this.tweens.add({ targets: [sectorText, hintText], alpha: 0, duration: 800, ease: 'Sine.easeIn' });
    });
  }

  private updateMovement(_delta: number): void {
    const moveX = (this.cursors.left.isDown || this.wasd.A.isDown ? -1 : 0) + (this.cursors.right.isDown || this.wasd.D.isDown ? 1 : 0) + this.touch.dpadX;
    const moveY = (this.cursors.up.isDown || this.wasd.W.isDown ? -1 : 0) + (this.cursors.down.isDown || this.wasd.S.isDown ? 1 : 0) + this.touch.dpadY;
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
    this.touch.setJackInButtonVisible(nearTerminal && !this.encounterResolved);

    if (nearTerminal && !this.encounterResolved) {
      if (!this.prompt.visible) {
        this.prompt.setVisible(true);
        this.tweens.add({ targets: this.prompt, alpha: 1, y: this.prompt.y - 8, duration: 160, ease: 'Cubic.easeOut' });
      }
      if (Phaser.Input.Keyboard.JustDown(this.jackInKey) || this.touch.consumeJackIn()) {
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
      const msg = remaining > 0 ? `Encounter purged. ${remaining} sectors remain.` : 'All sectors clear. Boss terminal unlocked!';
      const color = remaining > 0 ? '#baffc9' : '#ffe49f';
      this.registry.set('netStrikeToast', { message: msg, color });
      this.scene.start('WorldExplorationScene');
    }
  }

  private handleBattleLose(): void {
    this.registry.set('netStrikeToast', { message: 'Connection interrupted. Re-establishing link...', color: '#ffb6d0' });
    this.scene.start('WorldExplorationScene');
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
