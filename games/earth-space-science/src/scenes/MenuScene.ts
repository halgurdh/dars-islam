import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, PLANETS, generateRound } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, quizMode, sequenceMode } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { QuizQuestion } from '@shared/quiz-kit';

const GAME_ID = 'earth-space-science';

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
  return PLANETS.map((p) => ({ id: p.id, sideA: p.name, sideB: p.fact }));
}

function generateQuizQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(PLANETS).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((p) => p.fact));
  return {
    prompt: correct.name,
    choices,
    correctIndex: choices.indexOf(correct.fact),
  };
}

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '30px',
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
      items: buildMatchItems(),
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
  ],
});
