import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, EVENTS, generateRound, labelFor } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, quizMode, sequenceMode, trueFalseMode, fillBlankMode, reviewMode, type VariantBase } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion } from '@shared/quiz-variants';

const GAME_ID = 'seerah-timeline';

const LABELS: Record<string, () => string> = {
  easy: () => t().easy,
  medium: () => t().medium,
  hard: () => t().hard,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMatchItems(): MatchItem[] {
  return EVENTS.map((e) => ({ id: e.id, sideA: labelFor(e), sideB: e.era }));
}

function generateQuizQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(EVENTS).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((e) => e.era));
  return {
    prompt: labelFor(correct),
    choices,
    correctIndex: choices.indexOf(correct.era),
  };
}

// seerah-timeline's events have no per-item Arabic text or dedicated audio
// content (EVENTS is just {label, era} in English) — unlike the other
// games' Arabic-recognition "Listen & Identify" mode, there's nothing
// meaningful to have the player identify by ear here, so that mode is
// intentionally not wired up for this game (see report).

function generateFlashcardDeck(): FlashcardItem[] {
  return EVENTS.map((e) => ({
    id: e.id,
    primary: labelFor(e),
    meaning: e.era,
  }));
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(
    EVENTS,
    (e) => labelFor(e),
    (e) => e.era,
    (label, era) => t().trueFalseStatement(label, era)
  );
  return toTrueFalseQuestion(tf);
}

// No dedicated transliteration field exists for this game's events, so
// Fill-in-the-Blank masks one letter of the event's own label instead
// (e.g. "Born in Makkah" -> "B_rn in Makkah"), with its era shown as
// context underneath — per the task's guidance for data shapes with no
// romanized name field.
function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(EVENTS, (e) => labelFor(e), (e) => e.era);
}

// One description of this game shared by every variant mode below —
// each mode then only supplies its own content generator.
const variants: VariantBase = {
  gameId: GAME_ID,
  theme: COLORS,
  fontFamily: FONT,
  getLang,
  strings: () => ({
    round: t().round,
    score: t().score,
    menu: t().menu,
    wellDone: t().wellDone,
    roundSummary: t().quizRoundSummary,
    playAgain: t().playAgain,
    backToMenu: t().backToMenu,
  }),
  tiers: [
    { label: () => t().easy, totalQuestions: 6 },
    { label: () => t().medium, totalQuestions: 8 },
    { label: () => t().hard, totalQuestions: 10 },
  ],
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '34px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  modes: [
    sequenceMode({
      label: () => t().modeSequence,
      icon: '📜',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: FONT,
      strings: () => ({
        round: t().round,
        mistakes: t().mistakes,
        menu: t().menu,
        instruction: t().instruction,
        wellDone: t().wellDone,
        roundSummary: t().roundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      }),
      difficulties: DIFFICULTIES.map((d) => ({
        label: LABELS[d.id],
        totalRounds: d.totalRounds,
        generateRound: (index: number) => generateRound(d, index),
      })),
    }),
    matchMode({
      label: () => t().modeMatch,
      icon: '🎴',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: FONT,
      strings: () => ({
        menu: t().menu,
        moves: t().moves,
        wellDone: t().wellDone,
        roundSummary: t().matchRoundSummary,
        nextLevelHint: t().nextLevelHint,
      }),
      items: buildMatchItems,
      difficulties: [
        { label: () => t().easy, pairs: 6 },
        { label: () => t().medium, pairs: 8 },
        { label: () => t().hard, pairs: 10 },
      ],
    }),
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
        roundSummary: t().quizRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      }),
      difficulties: [
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateQuizQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateQuizQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateQuizQuestion },
      ],
    }),
    reviewMode(variants, generateFlashcardDeck),
    trueFalseMode(variants, generateTrueFalseQuestion),
    fillBlankMode(variants, generateFillBlankQuestion),
  ],
});
