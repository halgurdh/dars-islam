import Phaser from 'phaser';
import { createButton, type QuizRunConfig } from '@shared/quiz-kit';
import { createLanguagePicker } from '@shared/language-picker';
import { COLORS, FONT, hex } from '../theme';
import { DIFFICULTIES, generateQuestion, type Difficulty } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

const LABELS: Record<string, () => string> = {
  easy: () => t().easy,
  medium: () => t().medium,
  hard: () => t().hard,
};

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    const langBefore = getLang();
    void detectDefaultLang().then(() => {
      if (this.scene.isActive() && getLang() !== langBefore) this.scene.restart();
    });

    createLanguagePicker(this, width / 2, height * 0.795, COLORS.accent, getLang(), (lang) => {
      setLang(lang);
      this.scene.restart();
    });

    this.add.text(width / 2, height * 0.16, t().title, {
      fontFamily: FONT,
      fontSize: '40px',
      fontStyle: 'bold',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.23, t().tagline, {
      fontFamily: FONT,
      fontSize: '22px',
      color: COLORS.textMuted,
      align: 'center',
    }).setOrigin(0.5);

    const startY = height * 0.4;
    const gap = height * 0.11;
    DIFFICULTIES.forEach((d, i) => {
      createButton(this, width / 2, startY + i * gap, 380, 84, LABELS[d.id](), COLORS, FONT, () => {
        this.startQuiz(d);
      });
    });

    this.add.text(width / 2, height * 0.92, t().footer, {
      fontFamily: FONT,
      fontSize: '19px',
      color: COLORS.textMuted,
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5);
  }

  private startQuiz(difficulty: Difficulty): void {
    const cfg: QuizRunConfig = {
      gameId: 'counting-fun',
      totalQuestions: difficulty.totalQuestions,
      theme: COLORS,
      fontFamily: FONT,
      strings: {
        round: t().round,
        score: t().score,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().roundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      },
      generateQuestion: (i) => generateQuestion(difficulty, i),
    };
    this.scene.start('Quiz', cfg);
  }
}
