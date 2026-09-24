import { COLORS, LATIN_FONT, ARABIC_FONT } from '../theme';
import { PHRASES, type BuilderItem } from '../data/phrases';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, sequenceMode, trueFalseMode, fillBlankMode, listenIdentifyMode, reviewMode, type GameMode, type VariantBase } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion, listenQuestion } from '@shared/quiz-variants';
import { SPEECH_LANG } from '@shared/tts';

const GAME_ID = 'phrases-builder';

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
  return PHRASES.map((p) => ({ id: p.id, sideA: p.arabic, sideB: meaningFor(p) }));
}

// "Listen & Identify": the Arabic audio plays instead of showing the phrase
// as text — the player has to recognize it by ear, picking its meaning
// from four written choices.
function generateListenQuestion(): QuizQuestion {
  return listenQuestion(PHRASES, (p) => ({ text: p.arabic, lang: SPEECH_LANG.arabic }), (p) => meaningFor(p));
}

function generateFlashcardDeck(): FlashcardItem[] {
  return PHRASES.map((p) => ({
    id: p.id,
    primary: p.arabic,
    secondary: p.transliteration,
    meaning: meaningFor(p),
    speak: { text: p.arabic, lang: SPEECH_LANG.arabic },
  }));
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(
    PHRASES,
    (p) => p.transliteration,
    (p) => meaningFor(p),
    (name, meaning) => t().trueFalseStatement(name, meaning)
  );
  return toTrueFalseQuestion(tf);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(PHRASES, (p) => meaningFor(p), (p) => p.arabic);
}

// These phrases are independent everyday expressions with no shared
// magnitude or traditional order — transliteration length is the one
// honest orderable property, deduped so no two cards tie.
function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const seen = new Set<number>();
    const unique = shuffle(PHRASES).filter((p) => {
      if (seen.has(p.transliteration.length)) return false;
      seen.add(p.transliteration.length);
      return true;
    });
    const n = Math.min(count, unique.length);
    return unique
      .slice(0, n)
      .sort((a, b) => a.transliteration.length - b.transliteration.length)
      .map((p) => ({ id: p.id, label: p.transliteration }));
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
        { label: () => t().easy, pairs: 4 },
        { label: () => t().medium, pairs: 7 },
        { label: () => t().hard, pairs: 10 },
      ],
    }),
    sequenceMode({
      label: () => t().modeSequence,
      icon: '📏',
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
