import { COLORS, LATIN_FONT, ARABIC_FONT } from '../theme';
import { PILLARS, type BuilderItem } from '../data/pillars';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, sequenceMode, quizMode, listenMode, flashcardMode, type GameMode } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion } from '@shared/quiz-variants';
import { SPEECH_LANG } from '@shared/tts';

const GAME_ID = 'pillars-builder';

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
  return PILLARS.map((p) => ({ id: p.id, sideA: p.arabic, sideB: meaningFor(p) }));
}

// "Listen & Identify": the Arabic audio plays instead of showing the pillar
// as text — the player has to recognize it by ear, picking its meaning
// from choices. Only 5 pillars total, so every round draws from all of them
// and choices simply include however many other pillars exist (up to 4).
function generateListenQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(PILLARS).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((p) => meaningFor(p)));
  return {
    prompt: '',
    choices,
    correctIndex: choices.indexOf(meaningFor(correct)),
    speak: { text: correct.arabic, lang: SPEECH_LANG.arabic },
  };
}

function generateFlashcardDeck(): FlashcardItem[] {
  return PILLARS.map((p) => ({
    id: p.id,
    primary: p.arabic,
    secondary: p.transliteration,
    meaning: meaningFor(p),
    speak: { text: p.arabic, lang: SPEECH_LANG.arabic },
  }));
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(
    PILLARS,
    (p) => p.transliteration,
    (p) => meaningFor(p),
    (name, meaning) => t().trueFalseStatement(name, meaning)
  );
  return toTrueFalseQuestion(tf, t().trueLabel, t().falseLabel);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(PILLARS, (p) => meaningFor(p), (p) => p.arabic);
}

// PILLARS is already listed in the canonical order — with only 5 total,
// every round uses the same short contiguous window sizes.
function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const n = Math.min(count, PILLARS.length);
    const start = Math.floor(Math.random() * (PILLARS.length - n + 1));
    const slice = PILLARS.slice(start, start + n);
    return slice.map((p) => ({ id: p.id, label: p.transliteration }));
  };
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
        { label: () => t().easy, pairs: 3 },
        { label: () => t().medium, pairs: 4 },
        { label: () => t().hard, pairs: 5 },
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
        { label: () => t().easy, totalRounds: 4, generateRound: generateSequenceRound(3) },
        { label: () => t().medium, totalRounds: 4, generateRound: generateSequenceRound(4) },
        { label: () => t().hard, totalRounds: 4, generateRound: generateSequenceRound(5) },
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
      // Only 5 pillars — keep round counts modest so we're not asking for
      // more distinct rounds than there's meaningfully distinct content for.
      difficulties: [
        { label: () => t().easy, totalQuestions: 5, generateQuestion: generateListenQuestion },
        { label: () => t().medium, totalQuestions: 6, generateQuestion: generateListenQuestion },
        { label: () => t().hard, totalQuestions: 8, generateQuestion: generateListenQuestion },
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
        { label: () => t().easy, totalQuestions: 5, generateQuestion: generateTrueFalseQuestion },
        { label: () => t().medium, totalQuestions: 6, generateQuestion: generateTrueFalseQuestion },
        { label: () => t().hard, totalQuestions: 8, generateQuestion: generateTrueFalseQuestion },
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
        { label: () => t().easy, totalQuestions: 5, generateQuestion: generateFillBlankQuestion },
        { label: () => t().medium, totalQuestions: 6, generateQuestion: generateFillBlankQuestion },
        { label: () => t().hard, totalQuestions: 8, generateQuestion: generateFillBlankQuestion },
      ],
    }),
  ],
});
