import Phaser from 'phaser';
import { createButton, type QuizRunConfig } from '@shared/quiz-kit';
import { createLanguagePicker } from '@shared/language-picker';
import { COLORS, FONT, hex } from '../theme';
import { TOTAL_QUESTIONS, makeRunGenerator } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

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

    createLanguagePicker(this, width / 2, height * 0.62, COLORS.accent, getLang(), (lang) => {
      setLang(lang);
      this.scene.restart();
    });

    this.add.text(width / 2, height * 0.24, t().title, {
      fontFamily: FONT,
      fontSize: '42px',
      fontStyle: 'bold',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.33, t().tagline, {
      fontFamily: FONT,
      fontSize: '22px',
      color: COLORS.textMuted,
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5);

    createButton(this, width / 2, height * 0.47, 420, 84, t().start, COLORS, FONT, () => {
      this.startQuiz();
    });

    this.add.text(width / 2, height * 0.92, t().footer, {
      fontFamily: FONT,
      fontSize: '19px',
      color: COLORS.textMuted,
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5);
  }

  private startQuiz(): void {
    const cfg: QuizRunConfig = {
      gameId: 'wonder-why',
      totalQuestions: TOTAL_QUESTIONS,
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
      generateQuestion: makeRunGenerator(),
    };
    this.scene.start('Quiz', cfg);
  }
}
