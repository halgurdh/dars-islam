import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, generateQuestion, generateMatchItems, generateSequenceRound } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, type GameMode } from '@shared/mode-menu-kit';
import { getMatchSfx } from '@shared/match-kit';

const GAME_ID = 'pattern-play';

const QUIZ_LABELS: Record<string, () => string> = {
  shapes: () => t().shapes,
  numbers: () => t().numbers,
  'odd-one-out': () => t().oddOneOut,
};

const TIER_LABELS = [() => t().tierEasy, () => t().tierMedium, () => t().tierHard];

// Match/Sequence build on the number-pattern family regardless of which
// Quiz category is picked, so their difficulties are just tier sizes, not
// tied to DIFFICULTIES' shapes/numbers/odd-one-out ids.
const matchMode: GameMode = {
  id: 'match',
  label: () => t().modeMatch,
  icon: '🎴',
  difficulties: TIER_LABELS.map((label, i) => ({
    label,
    onSelect: (scene, locale) => {
      getMatchSfx(GAME_ID).flip();
      scene.scene.start('Match', {
        gameId: GAME_ID,
        pairs: [6, 8, 10][i] ?? 6,
        theme: COLORS,
        fontFamily: FONT,
        strings: () => ({
          menu: t().menu,
          moves: t().moves,
          wellDone: t().wellDone,
          roundSummary: t().matchRoundSummary,
          nextLevelHint: t().nextLevelHint,
        }),
        items: generateMatchItems([6, 8, 10][i] ?? 6),
        menuSceneKey: 'MenuScene',
        locale,
      });
    },
  })),
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '40px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  modes: [
    quizMode({
      label: () => t().modeQuiz,
      icon: '❓',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: FONT,
      strings: () => ({
        round: t().round,
        score: t().score,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().roundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      }),
      difficulties: DIFFICULTIES.map((d) => ({
        label: QUIZ_LABELS[d.id],
        totalQuestions: d.totalQuestions,
        generateQuestion: (index: number) => generateQuestion(d, index),
      })),
    }),
    matchMode,
    sequenceMode({
      label: () => t().modeSequence,
      icon: '📏',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: FONT,
      strings: () => ({
        round: t().round,
        mistakes: t().mistakes,
        menu: t().menu,
        instruction: t().instruction,
        wellDone: t().wellDone,
        roundSummary: t().sequenceRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      }),
      difficulties: TIER_LABELS.map((label, i) => ({
        label,
        totalRounds: 4,
        generateRound: () => generateSequenceRound([4, 5, 6][i] ?? 4),
      })),
    }),
  ],
});
