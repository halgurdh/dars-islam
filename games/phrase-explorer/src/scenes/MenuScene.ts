import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, PHRASES, meaningFor, type PhraseItem } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, quizMode, sequenceMode, trueFalseMode, fillBlankMode, reviewMode, listenIdentifyMode, type VariantBase } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion, listenQuestion } from '@shared/quiz-variants';
import { SPEECH_LANG } from '@shared/tts';

const GAME_ID = 'phrase-explorer';

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
  return PHRASES.map((p) => ({ id: p.id, sideA: p.phrase, sideB: meaningFor(p) }));
}

function generateQuizQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(PHRASES).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((p) => meaningFor(p)));
  return {
    prompt: correct.phrase,
    choices,
    correctIndex: choices.indexOf(meaningFor(correct)),
  };
}

function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const pool = shuffle(PHRASES).slice(0, count) as PhraseItem[];
    const sorted = [...pool].sort((a, b) => a.rank - b.rank);
    return sorted.map((p) => ({ id: p.id, label: meaningFor(p) }));
  };
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(PHRASES, (p) => p.phrase, meaningFor, (phrase, meaning) => t().trueFalseStatement(phrase, meaning));
  return toTrueFalseQuestion(tf);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(PHRASES, meaningFor, (p) => p.phrase);
}

function generateFlashcardDeck(): FlashcardItem[] {
  return PHRASES.map((p) => ({ id: p.id, primary: p.phrase, meaning: meaningFor(p), speak: { text: p.phrase, lang: SPEECH_LANG[p.lang] } }));
}

// Listen: hear the phrase spoken in its own language, pick its meaning.
function generateListenQuestion(): QuizQuestion {
  return listenQuestion(PHRASES, (p) => ({ text: p.phrase, lang: SPEECH_LANG[p.lang] }), meaningFor);
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
    backToMenu: t().menu,
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
      difficulties: DIFFICULTIES.map((d) => ({ label: LABELS[d.id], pairs: d.pairs })),
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
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateQuizQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateQuizQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateQuizQuestion },
      ],
    }),
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
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().easy, totalRounds: 4, generateRound: generateSequenceRound(5) },
        { label: () => t().medium, totalRounds: 4, generateRound: generateSequenceRound(7) },
        { label: () => t().hard, totalRounds: 4, generateRound: generateSequenceRound(9) },
      ],
    }),
    trueFalseMode(variants, generateTrueFalseQuestion),
    fillBlankMode(variants, generateFillBlankQuestion),
    reviewMode(variants, generateFlashcardDeck),
    listenIdentifyMode(variants, generateListenQuestion),
  ],
});
