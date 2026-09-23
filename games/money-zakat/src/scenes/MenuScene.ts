import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, generateQuestion, generateMatchItems, generateSequenceRound, generateTrueFalseStatement, generateFillBlankQuestion, type Difficulty } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, type GameMode } from '@shared/mode-menu-kit';
import { getMatchSfx } from '@shared/match-kit';
import { toTrueFalseQuestion } from '@shared/quiz-variants';
import type { QuizQuestion } from '@shared/quiz-kit';

// True/False and Fill-in-the-Blank are adapted for this procedural math
// game (a generated equation to judge, or a masked digit of its answer)
// rather than reusing shared/quiz-variants.ts's item-list helpers — see
// questions.ts for why. Listen & Identify and Flashcard Review are skipped
// entirely: this game has no fixed Arabic vocabulary or Arabic audio, so
// neither mode has a natural fit here (unlike fiqh-essentials/asma-match).
function generateTrueFalseQuestion(difficulty: Difficulty): QuizQuestion {
  const tf = generateTrueFalseStatement(difficulty);
  return toTrueFalseQuestion(
    { statement: t().trueFalseStatement(tf.equation), isTrue: tf.isTrue },
    t().trueLabel,
    t().falseLabel
  );
}

const GAME_ID = 'money-zakat';

const QUIZ_LABELS: Record<string, () => string> = {
  easy: () => t().easy,
  medium: () => t().medium,
  hard: () => t().hard,
};

const TIER_LABELS = [() => t().tierEasy, () => t().tierMedium, () => t().tierHard];

// Match items are regenerated fresh at click-time (not baked into the menu)
// because each tier needs its own generator — matchMode()'s static `items`
// list can't vary per difficulty like that.
const matchMode: GameMode = {
  id: 'match',
  label: () => t().modeMatch,
  icon: '🎴',
  difficulties: DIFFICULTIES.map((d, i) => ({
    label: TIER_LABELS[i],
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
        items: generateMatchItems(d, [6, 8, 10][i] ?? 6),
        menuSceneKey: 'MenuScene',
        locale,
      });
    },
  })),
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '32px',
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
        generateQuestion: () => generateQuestion(d),
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
      difficulties: DIFFICULTIES.map((d, i) => ({
        label: TIER_LABELS[i],
        totalRounds: 4,
        generateRound: () => generateSequenceRound(d, [4, 5, 6][i] ?? 4),
      })),
    }),
    quizMode({
      id: 'truefalse',
      label: () => t().modeTrueFalse,
      icon: '✓✗',
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
        generateQuestion: () => generateTrueFalseQuestion(d),
      })),
    }),
    quizMode({
      id: 'fillblank',
      label: () => t().modeFillBlank,
      icon: '✏️',
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
        generateQuestion: () => generateFillBlankQuestion(d),
      })),
    }),
  ],
});
