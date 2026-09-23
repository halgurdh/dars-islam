import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, generateQuestion, generateMatchItems, generateSequenceRound } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, type GameMode } from '@shared/mode-menu-kit';
import { getMatchSfx } from '@shared/match-kit';

const GAME_ID = 'shapes-colors';

const QUIZ_LABELS: Record<string, () => string> = {
  shapes: () => t().shapes,
  colors: () => t().colors,
  mixed: () => t().mixed,
};

const TIER_LABELS = [() => t().tierEasy, () => t().tierMedium, () => t().tierHard];

const matchMode: GameMode = {
  id: 'match',
  label: () => t().modeMatch,
  icon: '🎴',
  difficulties: TIER_LABELS.map((label, i) => ({
    label,
    onSelect: (scene) => {
      getMatchSfx(GAME_ID).flip();
      scene.scene.start('Match', {
        gameId: GAME_ID,
        pairs: [6, 8, 10][i] ?? 6,
        theme: COLORS,
        fontFamily: FONT,
        strings: {
          menu: t().menu,
          moves: t().moves,
          wellDone: t().wellDone,
          roundSummary: t().matchRoundSummary,
          nextLevelHint: t().nextLevelHint,
        },
        items: () => generateMatchItems([6, 8, 10][i] ?? 6),
        menuSceneKey: 'MenuScene',
      });
    },
  })),
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '38px',
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
      icon: '🌗',
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
        generateRound: () => generateSequenceRound([3, 4, 5][i] ?? 3),
      })),
    }),
  ],
});
