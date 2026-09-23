import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, VOCAB, type VocabItem } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, quizMode, sequenceMode, flashcardMode } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion } from '@shared/quiz-variants';

const GAME_ID = 'word-explorer';

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
  return VOCAB.map((v) => ({ id: v.id, sideA: v.word, sideB: v.meaning }));
}

function generateQuizQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(VOCAB).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((v) => v.meaning));
  return {
    prompt: correct.word,
    choices,
    correctIndex: choices.indexOf(correct.meaning),
  };
}

function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const pool = shuffle(VOCAB).slice(0, count) as VocabItem[];
    const sorted = [...pool].sort((a, b) => a.rank - b.rank);
    return sorted.map((v) => ({ id: v.id, label: v.meaning }));
  };
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(VOCAB, (v) => v.word, (v) => v.meaning, (word, meaning) => t().trueFalseStatement(word, meaning));
  return toTrueFalseQuestion(tf, t().trueLabel, t().falseLabel);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(VOCAB, (v) => v.meaning, (v) => v.word);
}

function generateFlashcardDeck(): FlashcardItem[] {
  return VOCAB.map((v) => ({ id: v.id, primary: v.word, meaning: v.meaning }));
}

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '36px',
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
        roundSummary: t().quizRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateTrueFalseQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateTrueFalseQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateTrueFalseQuestion },
      ],
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
        roundSummary: t().quizRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateFillBlankQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateFillBlankQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateFillBlankQuestion },
      ],
    }),
    flashcardMode({
      label: () => t().modeFlashcard,
      icon: '🗂️',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: FONT,
      strings: () => ({
        menu: t().menu,
        progress: t().flashcardProgress,
        hear: t().hear,
        knowIt: t().flashcardKnowIt,
        stillLearning: t().flashcardStillLearning,
        wellDone: t().wellDone,
        roundSummary: t().flashcardRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().hard, cards: generateFlashcardDeck },
      ],
    }),
  ],
});
