import Phaser from 'phaser';
import { createButton, type QuizRunConfig } from '@shared/quiz-kit';
import { createLanguagePicker } from '@shared/language-picker';
import { COLORS, FONT, hex } from '../theme';
import { SPEED_MODES, TOTAL_QUESTIONS, generateQuestion, type SpeedMode } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

const LABELS: Record<string, () => string> = {
  relaxed: () => t().relaxed,
  normal: () => t().normal,
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

    createLanguagePicker(this, width / 2, height * 0.68, COLORS.accent, getLang(), (lang) => {
      setLang(lang);
      this.scene.restart();
    });

    this.add.text(width / 2, height * 0.16, t().title, {
      fontFamily: FONT,
      fontSize: '40px',
      fontStyle: 'bold',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.25, t().tagline, {
      fontFamily: FONT,
      fontSize: '21px',
      color: COLORS.textMuted,
      align: 'center',
    }).setOrigin(0.5);

    const startY = height * 0.44;
    const gap = height * 0.12;
    SPEED_MODES.forEach((mode, i) => {
      createButton(this, width / 2, startY + i * gap, 400, 84, LABELS[mode.id](), COLORS, FONT, () => {
        this.startSprint(mode);
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

  private startSprint(mode: SpeedMode): void {
    const cfg: QuizRunConfig = {
      gameId: 'mental-math-sprint',
      totalQuestions: TOTAL_QUESTIONS,
      theme: COLORS,
      fontFamily: FONT,
      timeLimitMs: mode.timeLimitMs,
      strings: {
        round: t().round,
        score: t().score,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().roundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      },
      generateQuestion,
    };
    this.scene.start('Quiz', cfg);
  }
}
