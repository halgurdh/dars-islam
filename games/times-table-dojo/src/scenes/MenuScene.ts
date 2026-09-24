import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, generateQuestion, generateMatchItems, generateSequenceRound } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, trueFalseQuizMode, timedQuizMode, type QuizModeOptions, type GameMode } from '@shared/mode-menu-kit';
import { getMatchSfx } from '@shared/match-kit';

const GAME_ID = 'times-table-dojo';

const LABELS: Record<string, () => string> = {
  easy: () => t().easy,
  medium: () => t().medium,
  hard: () => t().hard,
};

// Match items are regenerated fresh at click-time (not baked into the menu)
// because each difficulty needs its own maxTable-scoped pool of problems —
// matchMode()'s static `items` list can't vary per difficulty like that.
const matchMode: GameMode = {
  id: 'match',
  label: () => t().modeMatch,
  icon: '🎴',
  difficulties: DIFFICULTIES.map((d, i) => ({
    label: LABELS[d.id],
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
        items: generateMatchItems([6, 8, 10][i] ?? 6, d.maxTable),
        menuSceneKey: 'MenuScene',
        locale,
      });
    },
  })),
};

const quiz: QuizModeOptions = {
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
    label: LABELS[d.id],
    totalQuestions: d.totalQuestions,
    generateQuestion: () => generateQuestion(d),
  })),
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '42px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  modes: [
    quizMode(quiz),
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
      difficulties: DIFFICULTIES.map((d, i) => ({
        label: LABELS[d.id],
        totalRounds: 4,
        generateRound: () => generateSequenceRound([4, 5, 6][i] ?? 4, d.maxTable),
      })),
    }),
    trueFalseQuizMode(quiz, getLang),
    timedQuizMode(quiz, getLang, [12_000, 9_000, 6_000]),
  ],
});
