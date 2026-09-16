import Phaser from 'phaser';
import { COLORS, LATIN_FONT, hex } from '../theme';
import { MATCH_ITEMS, MatchItem } from '../data/names';
import { progress } from '../systems/Progress';
import { sfx } from '../systems/Sfx';
import { getLang } from '../systems/Locale';
import { PlayerProgress } from '@shared/player-progress';
import { ProgressBar } from '@shared/progress-bar';
import { t } from '../i18n';

const progressBar = new ProgressBar();

type TileKind = 'icon' | 'word';

interface TileData {
  tileId: number;
  itemId: number;
  kind: TileKind;
  item: MatchItem;
}

interface TileView {
  data: TileData;
  container: Phaser.GameObjects.Container;
  back: Phaser.GameObjects.Graphics;
  front: Phaser.GameObjects.Graphics;
  frontText: Phaser.GameObjects.Text;
  faceUp: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function nameFor(item: MatchItem): string {
  switch (getLang()) {
    case 'nl': return item.nameNl;
    case 'de': return item.nameDe;
    case 'es': return item.nameEs;
    case 'fr': return item.nameFr;
    default: return item.nameEn;
  }
}

export class GameScene extends Phaser.Scene {
  private pairs = 8;
  private tiles: TileView[] = [];
  private flipped: TileView[] = [];
  private locked = false;
  private moves = 0;
  private matchesFound = 0;
  private startTime = 0;
  private movesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private overlayShown = false;

  constructor() {
    super('GameScene');
  }

  init(data: { pairs?: number }): void {
    this.pairs = data.pairs ?? 8;
    this.tiles = [];
    this.flipped = [];
    this.locked = false;
    this.moves = 0;
    this.matchesFound = 0;
    this.overlayShown = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.startTime = this.time.now;

    this.buildHud();
    this.buildBoard();
  }

  update(): void {
    if (this.overlayShown) return;
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    this.timerText.setText(`${mm}:${ss}`);
  }

  // The wrapper chrome (Exit Game link, theme/fullscreen/install buttons, and
  // the ProgressBar's floating level/streak pill) is fixed DOM overlaid in
  // the top corners of the canvas, so in-canvas HUD and board content must
  // stay clear of it.
  private static readonly HUD_TOP = 300;
  static readonly BOARD_TOP = GameScene.HUD_TOP + 90;
  private static readonly AUTO_ADVANCE_MS = 2200;

  private buildHud(): void {
    const { width } = this.scale;
    const y = GameScene.HUD_TOP;

    const menuBtn = this.add.text(70, y, t().menu, {
      fontFamily: LATIN_FONT,
      fontSize: '16px',
      color: COLORS.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.scene.start('MenuScene'));

    const muteBtn = this.add.text(width - 70, y, sfx.isMuted() ? '🔇' : '🔈', {
      fontFamily: LATIN_FONT,
      fontSize: '18px',
      color: COLORS.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      const muted = sfx.toggleMuted();
      muteBtn.setText(muted ? '🔇' : '🔈');
      if (!muted) sfx.flip();
    });

    this.movesText = this.add.text(width / 2, y + 34, t().moves(0), {
      fontFamily: LATIN_FONT,
      fontSize: '16px',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.timerText = this.add.text(width / 2, y + 58, '00:00', {
      fontFamily: LATIN_FONT,
      fontSize: '14px',
      color: COLORS.textMuted,
    }).setOrigin(0.5);
  }

  private pickItems(): MatchItem[] {
    const unlearned = MATCH_ITEMS.filter((n) => !progress.has(n.id));
    const learned = MATCH_ITEMS.filter((n) => progress.has(n.id));
    const pool = shuffle([...shuffle(unlearned), ...shuffle(learned)]);
    return pool.slice(0, this.pairs);
  }

  private buildBoard(): void {
    const { width, height } = this.scale;
    const items = this.pickItems();

    let tileId = 0;
    const tileDatas: TileData[] = [];
    for (const item of items) {
      tileDatas.push({ tileId: tileId++, itemId: item.id, kind: 'icon', item });
      tileDatas.push({ tileId: tileId++, itemId: item.id, kind: 'word', item });
    }
    const shuffled = shuffle(tileDatas);

    const total = shuffled.length;
    const cols = total <= 12 ? 3 : total <= 16 ? 4 : 5;
    const rows = Math.ceil(total / cols);

    const boardTop = GameScene.BOARD_TOP;
    const boardBottom = height - 30;
    const boardLeft = 16;
    const boardRight = width - 16;

    const cellW = (boardRight - boardLeft) / cols;
    const cellH = (boardBottom - boardTop) / rows;
    const cardW = cellW * 0.88;
    const cardH = cellH * 0.88;

    shuffled.forEach((data, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = boardLeft + cellW * col + cellW / 2;
      const y = boardTop + cellH * row + cellH / 2;
      this.createTile(data, x, y, cardW, cardH);
    });
  }

  private createTile(data: TileData, x: number, y: number, w: number, h: number): void {
    const container = this.add.container(x, y);

    const back = this.add.graphics();
    back.fillStyle(COLORS.cardBack, 1);
    back.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    back.lineStyle(2, COLORS.accent, 0.5);
    back.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

    const backSymbol = this.add.text(0, 0, '✦', {
      fontFamily: LATIN_FONT,
      fontSize: `${Math.floor(Math.min(w, h) * 0.35)}px`,
      color: hex(COLORS.accent),
    }).setOrigin(0.5);
    container.add(backSymbol);

    const front = this.add.graphics();
    front.fillStyle(COLORS.cardFront, 1);
    front.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    front.lineStyle(2, COLORS.accentLight, 0.7);
    front.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    front.setVisible(false);

    const isIcon = data.kind === 'icon';
    const frontText = this.add.text(
      0,
      0,
      isIcon ? data.item.icon : nameFor(data.item),
      {
        fontFamily: LATIN_FONT,
        fontSize: isIcon ? `${Math.floor(w * 0.4)}px` : `${Math.floor(w * 0.14)}px`,
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: w * 0.85 },
      }
    ).setOrigin(0.5);
    frontText.setVisible(false);

    container.add([back, front, frontText]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    const view: TileView = { data, container, back, front, frontText, faceUp: false, matched: false };
    container.on('pointerdown', () => this.onTileClicked(view));

    this.tiles.push(view);
  }

  private onTileClicked(view: TileView): void {
    if (this.locked || view.faceUp || view.matched) return;
    if (this.flipped.length >= 2) return;

    this.flipTile(view, true);
    sfx.flip();

    this.flipped.push(view);

    if (this.flipped.length === 2) {
      this.moves++;
      this.movesText.setText(t().moves(this.moves));
      this.locked = true;
      this.time.delayedCall(500, () => this.resolvePair());
    }
  }

  private flipTile(view: TileView, faceUp: boolean): void {
    view.faceUp = faceUp;
    this.tweens.add({
      targets: view.container,
      scaleX: 0,
      duration: 100,
      onComplete: () => {
        view.back.setVisible(!faceUp);
        view.front.setVisible(faceUp);
        view.frontText.setVisible(faceUp);
        const backSymbol = view.container.list[0] as Phaser.GameObjects.Text;
        backSymbol.setVisible(!faceUp);
        this.tweens.add({ targets: view.container, scaleX: 1, duration: 100 });
      },
    });
  }

  private resolvePair(): void {
    const [a, b] = this.flipped;
    const isMatch = a.data.itemId === b.data.itemId;

    if (isMatch) {
      sfx.match();
      a.matched = true;
      b.matched = true;
      this.matchesFound++;
      progress.markLearned([a.data.itemId]);
      [a, b].forEach((v) => {
        this.tweens.add({ targets: v.container, alpha: 0.55, duration: 200 });
      });
      this.flipped = [];
      this.locked = false;

      if (this.matchesFound === this.pairs) {
        this.time.delayedCall(300, () => this.showComplete());
      }
    } else {
      sfx.mismatch();
      this.time.delayedCall(500, () => {
        this.flipTile(a, false);
        this.flipTile(b, false);
        this.flipped = [];
        this.locked = false;
      });
    }
  }

  private showComplete(): void {
    this.overlayShown = true;
    sfx.complete();
    progressBar.showCompletionToast(PlayerProgress.recordCompletion({
      gameId: 'memory-match',
      itemsCompleted: this.pairs,
      mistakes: Math.max(0, this.moves - this.pairs),
    }));
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    const panelW = width * 0.8;
    const panelH = height * 0.36;
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 1);
    panel.fillRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 16);
    panel.lineStyle(2, COLORS.accent, 0.8);
    panel.strokeRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 16);

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');

    this.add.text(width / 2, height / 2 - panelH * 0.3, t().wellDone, {
      fontFamily: LATIN_FONT,
      fontSize: '26px',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.add.text(
      width / 2,
      height / 2 - panelH * 0.08,
      t().roundSummary(this.pairs, this.moves, `${mm}:${ss}`, progress.count(), MATCH_ITEMS.length),
      {
        fontFamily: LATIN_FONT,
        fontSize: '15px',
        color: COLORS.textMuted,
        align: 'center',
      }
    ).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + panelH * 0.22, t().nextLevelHint, {
      fontFamily: LATIN_FONT,
      fontSize: '14px',
      color: COLORS.textMuted,
    }).setOrigin(0.5);

    const menuBtn = this.add.text(width / 2, height / 2 + panelH * 0.42, t().menu, {
      fontFamily: LATIN_FONT,
      fontSize: '15px',
      color: hex(COLORS.accentLight),
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      autoAdvance.remove();
      this.scene.start('MenuScene');
    });

    // Every match already gets its own celebratory sound and a beat to read
    // the summary — the round itself IS the "next" confirmation, so it
    // advances on its own rather than waiting for a tap. Menu stays as the
    // one manual way out.
    const autoAdvance = this.time.delayedCall(GameScene.AUTO_ADVANCE_MS, () =>
      this.scene.restart({ pairs: this.pairs })
    );
  }
}
