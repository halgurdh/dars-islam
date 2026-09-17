import type { QuizRunConfig } from '@shared/quiz-kit';
import { createSingleStartMenuScene } from '@shared/quiz-menu-kit';
import { COLORS, FONT } from '../theme';
import { TOTAL_QUESTIONS, makeRunGenerator } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

function startQuiz(scene: Phaser.Scene): void {
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
  scene.scene.start('Quiz', cfg);
}

export const MenuScene = createSingleStartMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  startLabel: () => t().start,
  locale: { getLang, setLang, detectDefaultLang },
  onStart: startQuiz,
});
