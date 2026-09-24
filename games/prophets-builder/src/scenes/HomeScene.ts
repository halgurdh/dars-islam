import { COLORS, LATIN_FONT, ARABIC_FONT } from '../theme';
import { PROPHETS, type BuilderItem } from '../data/prophets';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, sequenceMode, trueFalseMode, fillBlankMode, listenIdentifyMode, reviewMode, type GameMode, type VariantBase } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion, listenQuestion } from '@shared/quiz-variants';
import { SPEECH_LANG } from '@shared/tts';

const GAME_ID = 'prophets-builder';

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
  return PROPHETS.map((p) => ({ id: p.id, sideA: p.arabic, sideB: meaningFor(p) }));
}

// "Listen & Identify": the Arabic audio plays instead of showing the
// prophet's name as text — the player has to recognize it by ear, picking
// its meaning from four written choices.
function generateListenQuestion(): QuizQuestion {
  return listenQuestion(PROPHETS, (p) => ({ text: p.arabic, lang: SPEECH_LANG.arabic }), (p) => meaningFor(p));
}

function generateFlashcardDeck(): FlashcardItem[] {
  return PROPHETS.map((p) => ({
    id: p.id,
    primary: p.arabic,
    secondary: p.transliteration,
    meaning: meaningFor(p),
    speak: { text: p.arabic, lang: SPEECH_LANG.arabic },
  }));
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(
    PROPHETS,
    (p) => p.transliteration,
    (p) => meaningFor(p),
    (name, meaning) => t().trueFalseStatement(name, meaning)
  );
  return toTrueFalseQuestion(tf);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(PROPHETS, (p) => meaningFor(p), (p) => p.arabic);
}

// PROPHETS is already listed in the traditional order — a contiguous slice
// tests real recall of that order.
function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const start = Math.floor(Math.random() * (PROPHETS.length - count + 1));
    const slice = PROPHETS.slice(start, start + count);
    return slice.map((p) => ({ id: p.id, label: p.transliteration }));
  };
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
    { label: () => t().easy, totalQuestions: 8 },
    { label: () => t().medium, totalQuestions: 12 },
    { label: () => t().hard, totalQuestions: 16 },
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
        { label: () => t().easy, pairs: 8 },
        { label: () => t().medium, pairs: 15 },
        { label: () => t().hard, pairs: 25 },
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
