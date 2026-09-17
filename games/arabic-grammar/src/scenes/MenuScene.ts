import { createMatchMenuScene } from '@shared/match-menu-kit';
import { COLORS, ARABIC_FONT } from '../theme';
import { DIFFICULTIES, ITEMS } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

const LABELS: Record<string, () => string> = {
  easy: () => t().easy,
  medium: () => t().medium,
  hard: () => t().hard,
};

// Titles/menus render in the Latin UI font; the match cards themselves are
// pure Arabic script, so the Match scene gets ARABIC_FONT as its fontFamily
// instead — same reasoning asma-match used for card text vs. chrome text.
export const MenuScene = createMatchMenuScene({
  theme: COLORS,
  fontFamily: ARABIC_FONT,
  titleFontSize: '32px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  gameId: 'arabic-grammar',
  items: ITEMS,
  strings: () => ({
    menu: t().menu,
    moves: t().moves,
    wellDone: t().wellDone,
    roundSummary: t().roundSummary,
    nextLevelHint: t().nextLevelHint,
  }),
  soundOnLabel: () => t().soundOn,
  soundOffLabel: () => t().soundOff,
  difficulties: DIFFICULTIES.map((d) => ({
    label: LABELS[d.id],
    pairs: d.pairs,
  })),
});
