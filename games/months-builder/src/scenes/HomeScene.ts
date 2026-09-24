import { COLORS, ARABIC_FONT, LATIN_FONT } from '../theme';
import { MONTHS, type BuilderItem } from '../data/months';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, sequenceMode, trueFalseMode, fillBlankMode, listenIdentifyMode, reviewMode, type GameMode, type VariantBase } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion, listenQuestion } from '@shared/quiz-variants';
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
  return listenQuestion(MONTHS, (m) => ({ text: m.arabic, lang: SPEECH_LANG.arabic }), (m) => meaningFor(m));
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
  return toTrueFalseQuestion(tf);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(MONTHS, (m) => meaningFor(m), (m) => m.arabic);
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
    score: t().quizScore,
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
    listenIdentifyMode(variants, generateListenQuestion),
    reviewMode(variants, generateFlashcardDeck),
    trueFalseMode(variants, generateTrueFalseQuestion),
    fillBlankMode(variants, generateFillBlankQuestion, { fontFamily: LATIN_FONT }),
  ],
});
