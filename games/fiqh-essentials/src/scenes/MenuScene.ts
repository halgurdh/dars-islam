import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, STEPS, generateRound, labelFor } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, quizMode, sequenceMode, trueFalseMode, fillBlankMode, listenIdentifyMode, reviewMode, type VariantBase } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion, listenQuestion } from '@shared/quiz-variants';
import { SPEECH_LANG } from '@shared/tts';

const GAME_ID = 'fiqh-essentials';

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
  return STEPS.map((s) => ({ id: s.id, sideA: labelFor(s), sideB: s.term }));
}

function generateQuizQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(STEPS).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((s) => s.term));
  return {
    prompt: labelFor(correct),
    choices,
    correctIndex: choices.indexOf(correct.term),
  };
}

// "Listen & Identify" always speaks the English instruction (labelEn, not
// the localized labelFor()) regardless of the selected language: STEPS has
// no Arabic-script field, and shared/tts.ts's speak() will refuse to speak
// non-English text with the English voice — so this plays the fixed English
// instruction and has the player identify which Arabic term it refers to.
function generateListenQuestion(): QuizQuestion {
  return listenQuestion(STEPS, (s) => ({ text: s.labelEn, lang: SPEECH_LANG.en }), (s) => s.term);
}

// No Arabic-script audio is available for these terms (see above), so cards
// skip the optional `speak` field rather than risk mispronouncing a
// transliteration through either voice.
function generateFlashcardDeck(): FlashcardItem[] {
  return STEPS.map((s) => ({
    id: s.id,
    primary: s.term,
    meaning: labelFor(s),
  }));
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(
    STEPS,
    (s) => s.term,
    (s) => labelFor(s),
    (term, label) => t().trueFalseStatement(term, label)
  );
  return toTrueFalseQuestion(tf);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(STEPS, (s) => labelFor(s), (s) => s.term);
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
    { label: () => t().easy, totalQuestions: 4 },
    { label: () => t().medium, totalQuestions: 6 },
    { label: () => t().hard, totalQuestions: 8 },
  ],
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '36px',
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
        { label: () => t().easy, pairs: 4 },
        { label: () => t().medium, pairs: 6 },
        { label: () => t().hard, pairs: 8 },
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
        { label: () => t().easy, totalQuestions: 4, generateQuestion: generateQuizQuestion },
        { label: () => t().medium, totalQuestions: 6, generateQuestion: generateQuizQuestion },
        { label: () => t().hard, totalQuestions: 8, generateQuestion: generateQuizQuestion },
      ],
    }),
    listenIdentifyMode(variants, generateListenQuestion),
    reviewMode(variants, generateFlashcardDeck),
    trueFalseMode(variants, generateTrueFalseQuestion),
    fillBlankMode(variants, generateFillBlankQuestion, { label: () => t().modeFillBlank }),
  ],
});
