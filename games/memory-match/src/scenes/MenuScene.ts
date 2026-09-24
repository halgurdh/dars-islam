import { COLORS, LATIN_FONT } from '../theme';
import { MATCH_ITEMS, nameFor, type NamedItem } from '../data/names';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, quizMode, sequenceMode, trueFalseQuizMode, timedQuizMode, reviewMode, listenIdentifyMode, type QuizModeOptions, type VariantBase } from '@shared/mode-menu-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { listenQuestion } from '@shared/quiz-variants';
import { SPEECH_LANG } from '@shared/tts';
import type { MatchItem } from '@shared/match-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { SequenceItem } from '@shared/sequence-kit';

const GAME_ID = 'memory-match';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMatchItems(): MatchItem[] {
  return MATCH_ITEMS.map((n) => ({ id: n.id, sideA: n.icon, sideB: nameFor(n) }));
}

function generateQuizQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(MATCH_ITEMS).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((n) => nameFor(n)));
  return {
    prompt: correct.icon,
    choices,
    correctIndex: choices.indexOf(nameFor(correct)),
  };
}

// Plain A-Z order is too rote (kids just recite the alphabet) to be a real
// challenge — sorting smallest to largest by real-world size tests actual
// "which is bigger?" intuition instead of a memorized sequence.
function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const pool = shuffle(MATCH_ITEMS).slice(0, count) as NamedItem[];
    const sorted = [...pool].sort((a, b) => a.size - b.size);
    return sorted.map((n) => ({ id: n.id, label: `${n.icon}  ${nameFor(n)}` }));
  };
}

const quiz: QuizModeOptions = {
  label: () => t().modeQuiz,
  icon: '❓',
  gameId: GAME_ID,
  theme: COLORS,
  fontFamily: LATIN_FONT,
  strings: () => ({
    round: t().quizRound,
    score: t().quizScore,
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
};

// Review + Listen reuse the quiz's own chrome strings and tiers.
const variants: VariantBase = {
  gameId: GAME_ID,
  theme: COLORS,
  fontFamily: LATIN_FONT,
  getLang,
  strings: quiz.strings,
  tiers: quiz.difficulties.map(({ label, totalQuestions }) => ({ label, totalQuestions })),
};

const speakName = (n: NamedItem) => ({ text: nameFor(n), lang: SPEECH_LANG[getLang()] });

function generateFlashcardDeck(): FlashcardItem[] {
  return MATCH_ITEMS.map((n) => ({ id: n.id, primary: n.icon, meaning: nameFor(n), speak: speakName(n) }));
}

// Listen: hear a name, pick its picture — works for kids who can't read yet.
function generateListenQuestion(): QuizQuestion {
  return listenQuestion(MATCH_ITEMS, speakName, (n) => n.icon);
}

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: LATIN_FONT,
  title: () => t().subtitle,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  modes: [
    matchMode({
      label: () => t().modeMatch,
      icon: '🎴',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: LATIN_FONT,
      strings: () => ({
        menu: t().menu,
        moves: t().moves,
        wellDone: t().wellDone,
        roundSummary: t().roundSummary,
        nextLevelHint: t().nextLevelHint,
      }),
      items: buildMatchItems,
      difficulties: [
        { label: () => t().easy, pairs: 6 },
        { label: () => t().medium, pairs: 8 },
        { label: () => t().hard, pairs: 10 },
      ],
    }),
    quizMode(quiz),
    sequenceMode({
      label: () => t().modeSequence,
      icon: '📏',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: LATIN_FONT,
      strings: () => ({
        round: t().quizRound,
        mistakes: t().sequenceMistakes,
        menu: t().menu,
        instruction: t().sequenceInstruction,
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
    trueFalseQuizMode(quiz, getLang),
    timedQuizMode(quiz, getLang),
    reviewMode(variants, generateFlashcardDeck),
    listenIdentifyMode(variants, generateListenQuestion),
  ],
});
