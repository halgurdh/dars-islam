import { COLORS, LATIN_FONT } from '../theme';
import { DUAS, type BuilderItem } from '../data/phrases';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, matchMode, sequenceMode, type GameMode } from '@shared/mode-menu-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';

const GAME_ID = 'duas-builder';

function meaningFor(item: BuilderItem): string {
  switch (getLang()) {
    case 'nl': return item.meaningNl;
    case 'de': return item.meaningDe;
    case 'es': return item.meaningEs;
    case 'fr': return item.meaningFr;
    default: return item.meaningEn;
  }
}

// The existing Builder practice (tap-build / type-translation / harder
// recall, each with its own difficulty tiers) stays exactly as it was —
// this tab is just a single entry point into that unchanged scene.
const builderMode: GameMode = {
  id: 'builder',
  label: () => t().modeBuilder,
  icon: '🧩',
  difficulties: [
    { label: () => t().startBuilder, onSelect: (scene) => scene.scene.start('BuilderMenuScene') },
  ],
};

function buildMatchItems(): MatchItem[] {
  return DUAS.map((d) => ({ id: d.id, sideA: d.arabic, sideB: meaningFor(d) }));
}

// DUAS is already listed in the order of a daily routine (before/after
// eating, before sleep, on waking, bathroom, leaving home, ...) — a
// contiguous slice tests real recall of that order.
function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const start = Math.floor(Math.random() * (DUAS.length - count + 1));
    const slice = DUAS.slice(start, start + count);
    return slice.map((d) => ({ id: d.id, label: d.transliteration }));
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
      items: buildMatchItems(),
      difficulties: [
        { label: () => t().easy, pairs: 4 },
        { label: () => t().medium, pairs: 7 },
        { label: () => t().hard, pairs: 10 },
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
  ],
});
