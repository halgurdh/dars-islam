import { COLORS, ARABIC_FONT, LATIN_FONT } from '../theme';
import { MONTHS, type BuilderItem } from '../data/months';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, sequenceMode, quizMode, listenMode, flashcardMode, type GameMode } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion } from '@shared/quiz-variants';
import { SPEECH_LANG } from '@shared/tts';

const GAME_ID = 'months-builder';

function meaningFor(item: BuilderItem): string {
  switch (getLang()) {
    case 'nl': return item.meaningNl;
    case 'de': return item.meaningDe;
    case 'es': return item.meaningEs;
    case 'fr': return item.meaningFr;
    default: return item.meaningEn;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const builderMode: GameMode = {
  id: 'builder',
  label: () => t().modeBuilder,
  icon: '🧩',
  difficulties: [
    { label: () => t().startBuilder, onSelect: (scene) => scene.scene.start('BuilderMenuScene') },
  ],
};

function buildMatchItems(): MatchItem[] {
  return MONTHS.map((m) => ({ id: m.id, sideA: m.arabic, sideB: meaningFor(m) }));
}

// MONTHS is already listed in calendar order — a contiguous slice tests
// real recall of that order.
function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const n = Math.min(count, MONTHS.length);
    const start = Math.floor(Math.random() * (MONTHS.length - n + 1));
    const slice = MONTHS.slice(start, start + n);
    return slice.map((m) => ({ id: m.id, label: m.transliteration }));
  };
}

// "Listen & Identify": the Arabic audio plays instead of showing the
// month's name as text — the player has to recognize it by ear, picking
// its meaning from four written choices.
function generateListenQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(MONTHS).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((m) => meaningFor(m)));
  return {
    prompt: '',
    choices,
    correctIndex: choices.indexOf(meaningFor(correct)),
    speak: { text: correct.arabic, lang: SPEECH_LANG.arabic },
  };
}

function generateFlashcardDeck(): FlashcardItem[] {
  return MONTHS.map((m) => ({
    id: m.id,
    primary: m.arabic,
    secondary: m.transliteration,
    meaning: meaningFor(m),
    speak: { text: m.arabic, lang: SPEECH_LANG.arabic },
  }));
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(
    MONTHS,
    (m) => m.transliteration,
    (m) => meaningFor(m),
    (name, meaning) => t().trueFalseStatement(name, meaning)
  );
  return toTrueFalseQuestion(tf, t().trueLabel, t().falseLabel);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(MONTHS, (m) => meaningFor(m), (m) => m.arabic);
}

export const HomeScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: LATIN_FONT,
  titleFontSize: '32px',
  title: () => t().subtitle,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  modes: [
    builderMode,
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
        roundSummary: t().matchRoundSummary,
        nextLevelHint: t().nextLevelHint,
      }),
      items: buildMatchItems,
      difficulties: [
        { label: () => t().easy, pairs: 6 },
        { label: () => t().medium, pairs: 9 },
        { label: () => t().hard, pairs: 12 },
      ],
    }),
    sequenceMode({
      label: () => t().modeSequence,
      icon: '📜',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: LATIN_FONT,
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
      difficulties: [
        { label: () => t().easy, totalRounds: 4, generateRound: generateSequenceRound(4) },
        { label: () => t().medium, totalRounds: 4, generateRound: generateSequenceRound(6) },
        { label: () => t().hard, totalRounds: 4, generateRound: generateSequenceRound(8) },
      ],
    }),
    listenMode({
      label: () => t().modeListen,
      icon: '🔊',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: ARABIC_FONT,
      strings: () => ({
        round: t().round,
        score: t().quizScore,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().quizRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      }),
      replayLabel: () => t().listenReplay,
      difficulties: [
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateListenQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateListenQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateListenQuestion },
      ],
    }),
    flashcardMode({
      label: () => t().modeFlashcard,
      icon: '🗂️',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: ARABIC_FONT,
      strings: () => ({
        menu: t().menu,
        progress: t().flashcardProgress,
        hear: t().hear,
        knowIt: t().flashcardKnowIt,
        stillLearning: t().flashcardStillLearning,
        wellDone: t().wellDone,
        roundSummary: t().flashcardRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      }),
      difficulties: [
        { label: () => t().hard, cards: generateFlashcardDeck },
      ],
    }),
    quizMode({
      id: 'truefalse',
      label: () => t().modeTrueFalse,
      icon: '✓✗',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: ARABIC_FONT,
      strings: () => ({
        round: t().round,
        score: t().quizScore,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().quizRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
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
      fontFamily: LATIN_FONT,
      strings: () => ({
        round: t().round,
        score: t().quizScore,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().quizRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      }),
      difficulties: [
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateFillBlankQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateFillBlankQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateFillBlankQuestion },
      ],
    }),
  ],
});
