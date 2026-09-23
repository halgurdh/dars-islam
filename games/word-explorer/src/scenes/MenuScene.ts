import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, VOCAB, type VocabItem } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, quizMode, sequenceMode } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { SequenceItem } from '@shared/sequence-kit';

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
  ],
});
