// Shared multiple-choice quiz engine — the round loop (HUD, question
// render, answer feedback, optional per-question timer, completion panel,
// PlayerProgress/ProgressBar wiring) that number-basics, times-table-dojo,
// math-tricks-lab and mental-math-sprint would otherwise all duplicate
// almost verbatim. Same consolidation reasoning as locale.ts/i18n.ts: the
// mechanism is identical across these sibling games, only the question
// content and theme differ.
import Phaser from 'phaser';
import { PlayerProgress } from './player-progress';
import { ProgressBar } from './progress-bar';

const progressBar = new ProgressBar();

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}

export interface QuizTheme {
  bg: number;
  panel: number;
  accent: number;
  accentLight: number;
  text: string;
  textMuted: string;
  correct: number;
  wrong: number;
  choiceBg: number;
}

export interface QuizQuestion {
  prompt: string;
  /** Optional secondary line — used by math-tricks-lab to show the trick formula. */
  sub?: string;
  choices: string[];
  correctIndex: number;
}

export interface QuizStrings {
  round: (i: number, total: number) => string;
  score: (n: number) => string;
  menu: string;
  wellDone: string;
  roundSummary: (score: number, total: number) => string;
  playAgain: string;
  backToMenu: string;
}

export interface QuizRunConfig {
  gameId: string;
  totalQuestions: number;
  theme: QuizTheme;
  fontFamily: string;
  strings: QuizStrings;
  generateQuestion: (index: number) => QuizQuestion;
  menuSceneKey?: string;
  /** Optional per-question countdown; a timeout counts as a wrong answer. */
  timeLimitMs?: number;
}

const ADVANCE_DELAY_MS = 900;

export class QuizScene extends Phaser.Scene {
  private cfg!: QuizRunConfig;
  private index = 0;
  private score = 0;
  private mistakes = 0;
  private locked = false;

  private roundText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private subText!: Phaser.GameObjects.Text;
  private choiceViews: {
    container: Phaser.GameObjects.Container;
    bg: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
    w: number;
    h: number;
  }[] = [];
  private currentQuestion!: QuizQuestion;

  private timerBarBg?: Phaser.GameObjects.Graphics;
  private timerBarFill?: Phaser.GameObjects.Graphics;
  private timerEvent?: Phaser.Time.TimerEvent;

  constructor(key = 'Quiz') {
    super(key);
  }

  init(data: QuizRunConfig): void {
    this.cfg = data;
    this.index = 0;
    this.score = 0;
    this.mistakes = 0;
    this.locked = false;
    this.choiceViews = [];
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.cfg.theme.bg);
    this.buildHud();
    this.renderQuestion();
  }

  // The wrapper chrome (Exit Game link, fullscreen toggle, and the
  // ProgressBar's floating level/streak pill) is fixed DOM overlaid in the
  // top corners of the real viewport, not scaled with the canvas — this
  // keeps the in-canvas HUD row clear of it regardless of scale factor.
  private static readonly HUD_Y = 300;
  private static readonly PROMPT_Y_FRAC = 0.34;
  private static readonly SUB_Y_FRAC = 0.44;
  private static readonly CHOICES_TOP_FRAC = 0.56;
  // Sits clear above the choice grid's top edge (CHOICES_TOP_FRAC minus half
  // its own height, i.e. 0.56 - 0.06 = 0.5) so the countdown bar never
  // overlaps the first row of answer buttons.
  private static readonly TIMER_Y_FRAC = 0.47;

  private buildHud(): void {
    const { width } = this.scale;
    const { theme, fontFamily, strings } = this.cfg;
    const y = QuizScene.HUD_Y;

    const menuBtn = this.add.text(80, y, strings.menu, {
      fontFamily,
      fontSize: '24px',
      color: theme.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.setPadding(16, 16, 16, 16);
    menuBtn.on('pointerdown', () => {
      this.cleanupTimer();
      this.scene.start(this.cfg.menuSceneKey ?? 'MenuScene');
    });

    this.roundText = this.add.text(width / 2, y, '', {
      fontFamily,
      fontSize: '22px',
      color: theme.text,
    }).setOrigin(0.5);

    this.scoreText = this.add.text(width - 80, y, '', {
      fontFamily,
      fontSize: '22px',
      color: hex(theme.accent),
    }).setOrigin(0.5);

    this.promptText = this.add.text(width / 2, this.scale.height * QuizScene.PROMPT_Y_FRAC, '', {
      fontFamily,
      fontSize: '54px',
      fontStyle: 'bold',
      color: theme.text,
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5);

    this.subText = this.add.text(width / 2, this.scale.height * QuizScene.SUB_Y_FRAC, '', {
      fontFamily,
      fontSize: '22px',
      color: theme.textMuted,
      align: 'center',
      wordWrap: { width: width * 0.82 },
    }).setOrigin(0.5);

    if (this.cfg.timeLimitMs) {
      const barY = this.scale.height * QuizScene.TIMER_Y_FRAC;
      const barW = width * 0.7;
      this.timerBarBg = this.add.graphics();
      this.timerBarBg.fillStyle(theme.panel, 1);
      this.timerBarBg.fillRoundedRect(width / 2 - barW / 2, barY - 6, barW, 12, 6);
      this.timerBarFill = this.add.graphics();
    }
  }

  private refreshHud(): void {
    this.roundText.setText(this.cfg.strings.round(this.index + 1, this.cfg.totalQuestions));
    this.scoreText.setText(this.cfg.strings.score(this.score));
  }

  private renderQuestion(): void {
    this.locked = false;
    this.currentQuestion = this.cfg.generateQuestion(this.index);
    this.refreshHud();
    this.promptText.setText(this.currentQuestion.prompt);
    this.subText.setText(this.currentQuestion.sub ?? '');

    this.choiceViews.forEach((v) => v.container.destroy());
    this.choiceViews = [];

    const { width } = this.scale;
    const top = this.scale.height * QuizScene.CHOICES_TOP_FRAC;
    const cols = 2;
    const gapX = width * 0.06;
    const gapY = this.scale.height * 0.035;
    const w = (width * 0.86 - gapX) / cols;
    const h = this.scale.height * 0.12;

    this.currentQuestion.choices.forEach((choice, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = width * 0.07 + w / 2 + col * (w + gapX);
      const y = top + row * (h + gapY);
      this.choiceViews.push(this.createChoice(x, y, w, h, choice, i));
    });

    this.startTimer();
  }

  private createChoice(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    choiceIndex: number
  ): { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics; text: Phaser.GameObjects.Text; w: number; h: number } {
    const { theme, fontFamily } = this.cfg;
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(theme.choiceBg, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(2, theme.accent, 0.55);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    // wordWrap + a slightly smaller base size means longer answer text (e.g.
    // short SEL/science phrases, not just numbers) wraps to a second line
    // instead of overflowing the button — numeric answers stay one line.
    const text = this.add.text(0, 0, label, {
      fontFamily,
      fontSize: '30px',
      fontStyle: 'bold',
      color: theme.text,
      align: 'center',
      wordWrap: { width: w * 0.88 },
      lineSpacing: 4,
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => { if (!this.locked) bg.setAlpha(0.85); });
    container.on('pointerout', () => bg.setAlpha(1));
    container.on('pointerdown', () => this.onChoicePicked(choiceIndex));

    return { container, bg, text, w, h };
  }

  private startTimer(): void {
    this.cleanupTimer();
    if (!this.cfg.timeLimitMs || !this.timerBarFill) return;

    const total = this.cfg.timeLimitMs;
    const startedAt = this.time.now;
    const barY = this.scale.height * QuizScene.TIMER_Y_FRAC;
    const barW = this.scale.width * 0.7;

    const tick = () => {
      if (this.locked) return;
      const elapsed = this.time.now - startedAt;
      const frac = Math.max(0, 1 - elapsed / total);
      this.timerBarFill!.clear();
      this.timerBarFill!.fillStyle(frac > 0.3 ? this.cfg.theme.accent : this.cfg.theme.wrong, 1);
      this.timerBarFill!.fillRoundedRect(this.scale.width / 2 - barW / 2, barY - 6, barW * frac, 12, 6);
      if (frac <= 0) {
        this.onChoicePicked(-1);
      }
    };

    tick();
    this.timerEvent = this.time.addEvent({ delay: 16, loop: true, callback: tick });
  }

  private cleanupTimer(): void {
    this.timerEvent?.remove();
    this.timerEvent = undefined;
  }

  private onChoicePicked(choiceIndex: number): void {
    if (this.locked) return;
    this.locked = true;
    this.cleanupTimer();

    const correct = choiceIndex === this.currentQuestion.correctIndex;
    if (correct) {
      this.score++;
    } else {
      this.mistakes++;
    }

    this.choiceViews.forEach((v, i) => {
      v.bg.clear();
      const isCorrect = i === this.currentQuestion.correctIndex;
      const isPicked = i === choiceIndex;
      const fill = isCorrect ? this.cfg.theme.correct : isPicked ? this.cfg.theme.wrong : this.cfg.theme.choiceBg;
      v.bg.fillStyle(fill, 1);
      v.bg.fillRoundedRect(-v.w / 2, -v.h / 2, v.w, v.h, 14);
      if (isCorrect || isPicked) {
        v.bg.lineStyle(2, this.cfg.theme.accentLight, 0.9);
        v.bg.strokeRoundedRect(-v.w / 2, -v.h / 2, v.w, v.h, 14);
      }
    });

    this.time.delayedCall(ADVANCE_DELAY_MS, () => {
      this.index++;
      if (this.index >= this.cfg.totalQuestions) {
        this.showComplete();
      } else {
        this.renderQuestion();
      }
    });
  }

  private showComplete(): void {
    const { width, height } = this.scale;
    const { theme, fontFamily, strings } = this.cfg;

    this.choiceViews.forEach((v) => v.container.destroy());
    this.choiceViews = [];
    this.promptText.setText('');
    this.subText.setText('');
    this.timerBarBg?.destroy();
    this.timerBarFill?.destroy();

    const result = PlayerProgress.recordCompletion({
      gameId: this.cfg.gameId,
      itemsCompleted: this.score,
      mistakes: this.mistakes,
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

    this.add.text(width / 2, height / 2 - panelH * 0.08, strings.roundSummary(this.score, this.cfg.totalQuestions), {
      fontFamily,
      fontSize: '22px',
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

/** Shared button chrome for menu/learn screens across the math games. */
export function createButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  theme: QuizTheme,
  fontFamily: string,
  onClick: () => void
): { container: Phaser.GameObjects.Container; text: Phaser.GameObjects.Text; bg: Phaser.GameObjects.Graphics } {
  const container = scene.add.container(x, y);
  const bg = scene.add.graphics();
  bg.fillStyle(theme.panel, 1);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
  bg.lineStyle(2, theme.accent, 0.6);
  bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

  const text = scene.add.text(0, 0, label, {
    fontFamily,
    fontSize: '24px',
    color: theme.text,
    align: 'center',
    wordWrap: { width: w * 0.88 },
  }).setOrigin(0.5);

  container.add([bg, text]);
  container.setSize(w, h);
  container.setInteractive({ useHandCursor: true });
  container.on('pointerover', () => bg.setAlpha(0.85));
  container.on('pointerout', () => bg.setAlpha(1));
  container.on('pointerdown', onClick);

  return { container, text, bg };
}
