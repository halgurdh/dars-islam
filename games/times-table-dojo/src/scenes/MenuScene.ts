import type { QuizRunConfig } from '@shared/quiz-kit';
import { createDifficultyMenuScene } from '@shared/quiz-menu-kit';
import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, generateQuestion, type Difficulty } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

const LABELS: Record<string, () => string> = {
  easy: () => t().easy,
  medium: () => t().medium,
  hard: () => t().hard,
};

function startQuiz(scene: Phaser.Scene, difficulty: Difficulty): void {
  const cfg: QuizRunConfig = {
    gameId: 'times-table-dojo',
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
    generateQuestion: () => generateQuestion(difficulty),
  };
  scene.scene.start('Quiz', cfg);
}

export const MenuScene = createDifficultyMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '42px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  difficulties: DIFFICULTIES.map((d) => ({
    label: LABELS[d.id],
    onSelect: (scene) => startQuiz(scene, d),
  })),
});
