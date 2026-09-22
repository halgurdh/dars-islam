// Shared self-paced flashcard review engine — a fourth interaction format
// alongside quiz-kit (pick 1 of 4), match-kit (flip pairs) and sequence-kit
// (tap in order), for subjects better served by review than testing: browse
// one card at a time (both sides shown together, nothing to get "wrong"),
// mark it "I know this" or "still learning", and the deck remembers which
// is which across visits — spaced-repetition-style rather than scored.
import Phaser from 'phaser';
import { PlayerProgress } from './player-progress';
import { ProgressBar } from './progress-bar';
import type { QuizTheme } from './quiz-kit';
import { speak as sharedSpeak } from './tts';

const progressBar = new ProgressBar();

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}

// Extends QuizTheme for the same structural-compatibility reason
// match-kit/sequence-kit's themes do — reuses quiz-kit's createButton and
// quiz-menu-kit's header chrome as-is.
export interface FlashcardTheme extends QuizTheme {
  cardFront: number;
}

/** One card. `secondary` (e.g. transliteration) and `speak` (audio) are optional. */
export interface FlashcardItem {
  id: number;
  primary: string;
  secondary?: string;
  meaning: string;
  speak?: { text: string; lang: string };
}

export interface FlashcardStrings {
  menu: string;
  progress: (i: number, total: number) => string;
  hear: string;
  knowIt: string;
  stillLearning: string;
  wellDone: string;
  roundSummary: (known: number, total: number) => string;
  playAgain: string;
  backToMenu: string;
}

export interface FlashcardRunConfig {
  gameId: string;
  theme: FlashcardTheme;
  fontFamily: string;
  strings: FlashcardStrings;
  cards: FlashcardItem[];
  menuSceneKey?: string;
}

// ── Per-game persistent "known" set ──────────────────────────────────────
// Same shape/reasoning as match-kit's MatchProgressStore: one instance per
// gameId, memoized, keyed separately from match-kit's own store so the two
// modes track "learned" independently rather than fighting over one key.

class FlashcardProgressStore {
  private key: string;
  private known: Set<number>;

  constructor(gameId: string) {
    this.key = `${gameId}:flashcard-known`;
    this.known = this.load();
  }

  private load(): Set<number> {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
    } catch {
      return new Set();
    }
  }

  private save(): void {
    try {
      localStorage.setItem(this.key, JSON.stringify([...this.known]));
    } catch {
      /* storage unavailable — progress just won't persist */
    }
  }

  markKnown(id: number): void {
    this.known.add(id);
    this.save();
  }

  markStillLearning(id: number): void {
    this.known.delete(id);
    this.save();
  }

  has(id: number): boolean {
    return this.known.has(id);
  }

  count(): number {
    return this.known.size;
  }
}

const progressStores = new Map<string, FlashcardProgressStore>();

function getProgress(gameId: string): FlashcardProgressStore {
  let store = progressStores.get(gameId);
  if (!store) {
    store = new FlashcardProgressStore(gameId);
    progressStores.set(gameId, store);
  }
  return store;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class FlashcardScene extends Phaser.Scene {
  private cfg!: FlashcardRunConfig;
  private deck: FlashcardItem[] = [];
  private index = 0;
  private knownThisRound = 0;
  private locked = false;

  private menuBtn!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private hearBtn!: Phaser.GameObjects.Text;
  private cardBg!: Phaser.GameObjects.Graphics;
  private primaryText!: Phaser.GameObjects.Text;
  private secondaryText!: Phaser.GameObjects.Text;
  private meaningText!: Phaser.GameObjects.Text;
  private stillLearningBtn!: { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics };
  private knowItBtn!: { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics };

  constructor(key = 'Flashcard') {
    super(key);
  }

  init(data: FlashcardRunConfig): void {
    this.cfg = data;
    this.deck = shuffle(data.cards);
    this.index = 0;
    this.knownThisRound = 0;
    this.locked = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.cfg.theme.bg);
    this.buildHud();
    this.buildCard();
    this.renderCard();
  }

  // Same fixed-DOM-chrome clearance convention as every other kit's HUD.
  private static readonly HUD_TOP = 300;
  private static readonly CARD_TOP = FlashcardScene.HUD_TOP + 60;

  private buildHud(): void {
    const { width } = this.scale;
    const { theme, fontFamily, strings } = this.cfg;
    const y = FlashcardScene.HUD_TOP;

    this.menuBtn = this.add.text(70, y, strings.menu, {
      fontFamily,
      fontSize: '16px',
      color: theme.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.menuBtn.on('pointerdown', () => this.scene.start(this.cfg.menuSceneKey ?? 'MenuScene'));

    this.progressText = this.add.text(width / 2, y, '', {
      fontFamily,
      fontSize: '18px',
      color: theme.text,
    }).setOrigin(0.5);

    this.hearBtn = this.add.text(width - 70, y, '🔊', {
      fontFamily,
      fontSize: '22px',
      color: hex(theme.accent),
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.hearBtn.on('pointerdown', () => {
      const card = this.deck[this.index];
      if (card?.speak) void sharedSpeak(card.speak.text, card.speak.lang);
    });
    this.hearBtn.setVisible(false);
  }

  private buildCard(): void {
    const { width, height } = this.scale;
    const { theme, fontFamily } = this.cfg;

    const cardW = width * 0.86;
    const cardH = height * 0.42;
    const cardX = width / 2;
    const cardY = FlashcardScene.CARD_TOP + cardH / 2;

    this.cardBg = this.add.graphics();
    this.cardBg.fillStyle(theme.cardFront, 1);
    this.cardBg.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 18);
    this.cardBg.lineStyle(2, theme.accent, 0.6);
    this.cardBg.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 18);

    this.primaryText = this.add.text(cardX, cardY - cardH * 0.22, '', {
      fontFamily,
      fontSize: '46px',
      fontStyle: 'bold',
      color: theme.text,
      align: 'center',
      wordWrap: { width: cardW * 0.85 },
    }).setOrigin(0.5);

    this.secondaryText = this.add.text(cardX, cardY + cardH * 0.06, '', {
      fontFamily,
      fontSize: '22px',
      color: hex(theme.accentLight),
      align: 'center',
      wordWrap: { width: cardW * 0.85 },
    }).setOrigin(0.5);

    this.meaningText = this.add.text(cardX, cardY + cardH * 0.3, '', {
      fontFamily,
      fontSize: '20px',
      color: theme.textMuted,
      align: 'center',
      wordWrap: { width: cardW * 0.82 },
    }).setOrigin(0.5);

    const btnY = FlashcardScene.CARD_TOP + cardH + height * 0.09;
    const btnW = width * 0.42;
    const btnH = height * 0.09;
    const gap = width * 0.04;

    this.stillLearningBtn = this.createActionButton(
      cardX - gap / 2 - btnW / 2,
      btnY,
      btnW,
      btnH,
      () => this.cfg.strings.stillLearning,
      theme.panel,
      () => this.onDecision(false)
    );
    this.knowItBtn = this.createActionButton(
      cardX + gap / 2 + btnW / 2,
      btnY,
      btnW,
      btnH,
      () => this.cfg.strings.knowIt,
      theme.panel,
      () => this.onDecision(true)
    );
  }

  private createActionButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: () => string,
    fill: number,
    onClick: () => void
  ): { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics } {
    const { theme, fontFamily } = this.cfg;
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(fill, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(2, theme.accent, 0.55);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const text = this.add.text(0, 0, label(), {
      fontFamily,
      fontSize: '19px',
      fontStyle: 'bold',
      color: theme.text,
      align: 'center',
      wordWrap: { width: w * 0.88 },
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => { if (!this.locked) bg.setAlpha(0.85); });
    container.on('pointerout', () => bg.setAlpha(1));
    container.on('pointerdown', () => { if (!this.locked) onClick(); });

    return { container, bg };
  }

  private renderCard(): void {
    this.locked = false;
    const card = this.deck[this.index];
    this.progressText.setText(this.cfg.strings.progress(this.index + 1, this.deck.length));
    this.primaryText.setText(card.primary);
    this.secondaryText.setText(card.secondary ?? '');
    this.meaningText.setText(card.meaning);
    this.hearBtn.setVisible(!!card.speak);
  }

  private onDecision(knowsIt: boolean): void {
    if (this.locked) return;
    this.locked = true;

    const progress = getProgress(this.cfg.gameId);
    const card = this.deck[this.index];
    if (knowsIt) {
      progress.markKnown(card.id);
      this.knownThisRound++;
    } else {
      progress.markStillLearning(card.id);
    }

    this.index++;
    if (this.index >= this.deck.length) {
      this.showComplete();
    } else {
      this.renderCard();
    }
  }

  private showComplete(): void {
    const { width, height } = this.scale;
    const { theme, fontFamily, strings } = this.cfg;

    this.cardBg.destroy();
    this.primaryText.setText('');
    this.secondaryText.setText('');
    this.meaningText.setText('');
    this.stillLearningBtn.container.destroy();
    this.knowItBtn.container.destroy();
    this.hearBtn.setVisible(false);

    progressBar.showCompletionToast(PlayerProgress.recordCompletion({
      gameId: this.cfg.gameId,
      itemsCompleted: this.knownThisRound,
    }));

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    const panelW = width * 0.8;
    const panelH = height * 0.34;
    const panel = this.add.graphics();
    panel.fillStyle(theme.panel, 1);
    panel.fillRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 16);
    panel.lineStyle(2, theme.accent, 0.8);
    panel.strokeRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 16);

    this.add.text(width / 2, height / 2 - panelH * 0.32, strings.wellDone, {
      fontFamily,
      fontSize: '30px',
      color: theme.text,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - panelH * 0.08, strings.roundSummary(this.knownThisRound, this.deck.length), {
      fontFamily,
      fontSize: '20px',
      color: theme.textMuted,
      align: 'center',
    }).setOrigin(0.5);

    const again = this.add.text(width / 2, height / 2 + panelH * 0.22, strings.playAgain, {
      fontFamily,
      fontSize: '22px',
      color: hex(theme.accentLight),
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    again.setPadding(14, 14, 14, 14);
    again.on('pointerdown', () => this.scene.restart(this.cfg));

    const menu = this.add.text(width / 2, height / 2 + panelH * 0.42, strings.backToMenu, {
      fontFamily,
      fontSize: '20px',
      color: theme.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.setPadding(14, 14, 14, 14);
    menu.on('pointerdown', () => this.scene.start(this.cfg.menuSceneKey ?? 'MenuScene'));
  }
}
