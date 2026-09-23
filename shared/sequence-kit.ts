// Shared "tap these in the correct order" engine — a third interaction
// format alongside quiz-kit (pick 1 of 4) and match-kit (flip pairs), for
// subjects that are naturally about ordering: chronological events, the
// steps of a ritual, planets by distance from the sun. A round shows a
// shuffled set of cards; tapping the correct next one moves it into a
// "your order so far" strip, tapping a wrong one just shakes in place.
import Phaser from 'phaser';
import { PlayerProgress } from './player-progress';
import { ProgressBar } from './progress-bar';
import type { QuizTheme } from './quiz-kit';
import { registerActiveGameLocale, unregisterActiveGameLocale } from './active-game-locale';
import type { LocaleHooks } from './quiz-menu-kit';

const progressBar = new ProgressBar();

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}

// Extends QuizTheme for the same reason match-kit's theme does — structural
// compatibility with quiz-kit's createButton/quiz-menu-kit's header chrome,
// which sequence-menu-kit.ts reuses as-is.
export interface SequenceTheme extends QuizTheme {
  placedBg: number;
}

/** One card in a round; `label` is shown, order among a round's items is implied by array position. */
export interface SequenceItem {
  id: number;
  label: string;
}

export interface SequenceStrings {
  round: (i: number, total: number) => string;
  mistakes: (n: number) => string;
  menu: string;
  instruction: string;
  wellDone: string;
  roundSummary: (perfectRounds: number, totalRounds: number) => string;
  playAgain: string;
  backToMenu: string;
}

export interface SequenceRunConfig {
  gameId: string;
  totalRounds: number;
  theme: SequenceTheme;
  fontFamily: string;
  /** A function, not a resolved object — see quiz-kit.ts's QuizRunConfig.strings for why. */
  strings: () => SequenceStrings;
  /** Returns the round's items in the CORRECT order; the scene shuffles them for display. */
  generateRound: (index: number) => SequenceItem[];
  menuSceneKey?: string;
  /** Optional: this game's own language hooks, enabling mid-game switching. */
  locale?: LocaleHooks;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ADVANCE_DELAY_MS = 900;

export class SequenceScene extends Phaser.Scene {
  private cfg!: SequenceRunConfig;
  private index = 0;
  private perfectRounds = 0;
  private totalMistakes = 0;
  private roundMistakes = 0;
  private locked = false;

  private menuBtn!: Phaser.GameObjects.Text;
  private roundText!: Phaser.GameObjects.Text;
  private mistakesText!: Phaser.GameObjects.Text;
  private instructionText!: Phaser.GameObjects.Text;
  private placedText!: Phaser.GameObjects.Text;
  private correctOrder: SequenceItem[] = [];
  private placedCount = 0;
  private cardViews: { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics; item: SequenceItem; placed: boolean }[] = [];

  constructor(key = 'Sequence') {
    super(key);
  }

  init(data: SequenceRunConfig): void {
    this.cfg = data;
    this.index = 0;
    this.perfectRounds = 0;
    this.totalMistakes = 0;
    this.locked = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.cfg.theme.bg);
    this.buildHud();
    this.renderRound();

    if (this.cfg.locale) {
      const hooks = {
        setLang: this.cfg.locale.setLang,
        refreshChrome: () => this.refreshHud(),
      };
      registerActiveGameLocale(hooks);
      this.events.once('shutdown', () => unregisterActiveGameLocale(hooks));
    }
  }

  // Same HUD_Y convention as quiz-kit/match-kit — clears the fixed wrapper
  // chrome (Exit link, fullscreen toggle, ProgressBar pill).
  private static readonly HUD_Y = 300;
  private static readonly INSTRUCTION_Y_FRAC = 0.335;
  private static readonly PLACED_Y_FRAC = 0.41;
  private static readonly POOL_TOP_FRAC = 0.49;

  private buildHud(): void {
    const { width } = this.scale;
    const { theme, fontFamily } = this.cfg;
    const strings = this.cfg.strings();
    const y = SequenceScene.HUD_Y;

    this.menuBtn = this.add.text(80, y, strings.menu, {
      fontFamily,
      fontSize: '24px',
      color: theme.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.menuBtn.setPadding(16, 16, 16, 16);
    this.menuBtn.on('pointerdown', () => this.scene.start(this.cfg.menuSceneKey ?? 'MenuScene'));

    this.roundText = this.add.text(width / 2, y, '', {
      fontFamily,
      fontSize: '22px',
      color: theme.text,
    }).setOrigin(0.5);

    this.mistakesText = this.add.text(width - 90, y, '', {
      fontFamily,
      fontSize: '20px',
      color: hex(theme.accent),
    }).setOrigin(0.5);

    this.instructionText = this.add.text(width / 2, this.scale.height * SequenceScene.INSTRUCTION_Y_FRAC, strings.instruction, {
      fontFamily,
      fontSize: '24px',
      fontStyle: 'bold',
      color: theme.text,
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5);

    this.placedText = this.add.text(width / 2, this.scale.height * SequenceScene.PLACED_Y_FRAC, '', {
      fontFamily,
      fontSize: '18px',
      color: hex(theme.accentLight),
      align: 'center',
      wordWrap: { width: width * 0.85 },
      lineSpacing: 6,
    }).setOrigin(0.5, 0);
  }

  private refreshHud(): void {
    const strings = this.cfg.strings();
    this.roundText.setText(strings.round(this.index + 1, this.cfg.totalRounds));
    this.mistakesText.setText(strings.mistakes(this.roundMistakes));
    this.menuBtn.setText(strings.menu);
    this.instructionText.setText(strings.instruction);
  }

  private renderRound(): void {
    this.locked = false;
    this.roundMistakes = 0;
    this.placedCount = 0;
    this.correctOrder = this.cfg.generateRound(this.index);
    this.refreshHud();
    this.placedText.setText('');

    this.cardViews.forEach((v) => v.container.destroy());
    this.cardViews = [];

    const shuffled = shuffle(this.correctOrder);
    const { width } = this.scale;
    const top = this.scale.height * SequenceScene.POOL_TOP_FRAC;
    const bottom = this.scale.height * 0.95;
    const gapY = 14;
    const h = Math.min(100, (bottom - top - gapY * (shuffled.length - 1)) / shuffled.length);
    const w = width * 0.86;

    shuffled.forEach((item, i) => {
      const y = top + i * (h + gapY) + h / 2;
      this.createCard(item, width / 2, y, w, h);
    });
  }

  private createCard(item: SequenceItem, x: number, y: number, w: number, h: number): void {
    const { theme, fontFamily } = this.cfg;
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(theme.choiceBg, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(2, theme.accent, 0.5);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);

    const text = this.add.text(0, 0, item.label, {
      fontFamily,
      fontSize: '22px',
      color: theme.text,
      align: 'center',
      wordWrap: { width: w * 0.9 },
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.onCardTapped(item, container, bg));

    this.cardViews.push({ container, bg, item, placed: false });
  }

  private onCardTapped(item: SequenceItem, container: Phaser.GameObjects.Container, bg: Phaser.GameObjects.Graphics): void {
    if (this.locked) return;
    const expected = this.correctOrder[this.placedCount];

    if (item.id === expected.id) {
      const { theme } = this.cfg;
      bg.clear();
      bg.fillStyle(theme.placedBg, 1);
      bg.fillRoundedRect(-container.width / 2, -container.height / 2, container.width, container.height, 12);
      this.tweens.add({ targets: container, alpha: 0.4, duration: 200 });
      container.disableInteractive();
      this.placedCount++;

      const placedSoFar = this.correctOrder.slice(0, this.placedCount).map((it, i) => `${i + 1}. ${it.label}`).join('\n');
      this.placedText.setText(placedSoFar);

      if (this.placedCount === this.correctOrder.length) {
        this.locked = true;
        if (this.roundMistakes === 0) this.perfectRounds++;
        this.time.delayedCall(ADVANCE_DELAY_MS, () => {
          this.index++;
          if (this.index >= this.cfg.totalRounds) this.showComplete();
          else this.renderRound();
        });
      }
    } else {
      this.roundMistakes++;
      this.totalMistakes++;
      this.refreshHud();
      this.tweens.add({
        targets: container,
        x: container.x - 10,
        duration: 60,
        yoyo: true,
        repeat: 3,
      });
      const originalColor = this.cfg.theme.choiceBg;
      bg.clear();
      bg.fillStyle(this.cfg.theme.wrong, 1);
      bg.fillRoundedRect(-container.width / 2, -container.height / 2, container.width, container.height, 12);
      bg.lineStyle(2, this.cfg.theme.accent, 0.5);
      bg.strokeRoundedRect(-container.width / 2, -container.height / 2, container.width, container.height, 12);
      this.time.delayedCall(300, () => {
        bg.clear();
        bg.fillStyle(originalColor, 1);
        bg.fillRoundedRect(-container.width / 2, -container.height / 2, container.width, container.height, 12);
        bg.lineStyle(2, this.cfg.theme.accent, 0.5);
        bg.strokeRoundedRect(-container.width / 2, -container.height / 2, container.width, container.height, 12);
      });
    }
  }

  private showComplete(): void {
    const { width, height } = this.scale;
    const { theme, fontFamily } = this.cfg;
    const strings = this.cfg.strings();

    this.cardViews.forEach((v) => v.container.destroy());
    this.cardViews = [];
    this.placedText.setText('');

    const result = PlayerProgress.recordCompletion({
      gameId: this.cfg.gameId,
      itemsCompleted: this.perfectRounds,
      mistakes: this.totalMistakes,
    });
    progressBar.showCompletionToast(result);

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
      fontSize: '32px',
      color: theme.text,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - panelH * 0.08, strings.roundSummary(this.perfectRounds, this.cfg.totalRounds), {
      fontFamily,
      fontSize: '20px',
      color: theme.textMuted,
      align: 'center',
      wordWrap: { width: panelW * 0.85 },
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
