import { COLORS, ARABIC_FONT } from '../theme';
import { DIFFICULTIES, ITEMS } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, quizMode, sequenceMode, trueFalseMode, reviewMode, listenIdentifyMode, type VariantBase } from '@shared/mode-menu-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { trueFalseStatement, toTrueFalseQuestion, listenQuestion } from '@shared/quiz-variants';
import { SPEECH_LANG } from '@shared/tts';

const GAME_ID = 'arabic-grammar';

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

function generateQuizQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(ITEMS).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((it) => it.sideB));
  return {
    prompt: correct.sideA,
    choices,
    correctIndex: choices.indexOf(correct.sideB),
  };
}

// Arabic alphabetical order (ا→ي) is a real skill this audience is still
// learning — unlike A→Z, it can't be rattled off from memory, so it's a
// genuine ordering challenge given this dataset has no natural magnitude.
function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const pool = shuffle(ITEMS).slice(0, count);
    const sorted = [...pool].sort((a, b) => a.sideA.localeCompare(b.sideA, 'ar'));
    return sorted.map((it) => ({ id: it.id, label: it.sideA }));
  };
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(ITEMS, (it) => it.sideA, (it) => it.sideB, (singular, plural) => t().trueFalseStatement(singular, plural));
  return toTrueFalseQuestion(tf);
}

function generateFlashcardDeck(): FlashcardItem[] {
  return ITEMS.map((it) => ({ id: it.id, primary: it.sideA, meaning: it.sideB, speak: { text: it.sideA, lang: SPEECH_LANG.arabic } }));
}

// Listen: hear the singular spoken, pick its sound plural.
function generateListenQuestion(): QuizQuestion {
  return listenQuestion(ITEMS, (it) => ({ text: it.sideA, lang: SPEECH_LANG.arabic }), (it) => it.sideB);
}


// One description of this game shared by every variant mode below —
// each mode then only supplies its own content generator.
const variants: VariantBase = {
  gameId: GAME_ID,
  theme: COLORS,
  fontFamily: ARABIC_FONT,
  getLang,
  strings: () => ({
    round: t().round,
    score: t().score,
    menu: t().menu,
    wellDone: t().wellDone,
    roundSummary: t().quizRoundSummary,
    playAgain: t().playAgain,
    backToMenu: t().menu,
  }),
  tiers: [
    { label: () => t().easy, totalQuestions: 4 },
    { label: () => t().medium, totalQuestions: 6 },
    { label: () => t().hard, totalQuestions: 8 },
  ],
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: ARABIC_FONT,
  titleFontSize: '32px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  modes: [
    matchMode({
      label: () => t().modeMatch,
      icon: '🎴',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: ARABIC_FONT,
      strings: () => ({
        menu: t().menu,
        moves: t().moves,
        wellDone: t().wellDone,
        roundSummary: t().matchRoundSummary,
        nextLevelHint: t().nextLevelHint,
      }),
      items: () => ITEMS,
      difficulties: DIFFICULTIES.map((d) => ({ label: LABELS[d.id], pairs: d.pairs })),
    }),
    quizMode({
      label: () => t().modeQuiz,
      icon: '❓',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: ARABIC_FONT,
      strings: () => ({
        round: t().round,
        score: t().score,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().quizRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().easy, totalQuestions: 4, generateQuestion: generateQuizQuestion },
        { label: () => t().medium, totalQuestions: 6, generateQuestion: generateQuizQuestion },
        { label: () => t().hard, totalQuestions: 8, generateQuestion: generateQuizQuestion },
      ],
    }),
    sequenceMode({
      label: () => t().modeSequence,
      icon: '📏',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: ARABIC_FONT,
      strings: () => ({
        round: t().round,
        mistakes: t().mistakes,
        menu: t().menu,
        instruction: t().instruction,
        wellDone: t().wellDone,
        roundSummary: t().sequenceRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().easy, totalRounds: 3, generateRound: generateSequenceRound(3) },
        { label: () => t().medium, totalRounds: 3, generateRound: generateSequenceRound(4) },
        { label: () => t().hard, totalRounds: 3, generateRound: generateSequenceRound(5) },
      ],
    }),
    trueFalseMode(variants, generateTrueFalseQuestion),
    reviewMode(variants, generateFlashcardDeck),
    listenIdentifyMode(variants, generateListenQuestion),
  ],
});
