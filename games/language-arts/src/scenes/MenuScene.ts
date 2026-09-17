import { createMatchMenuScene } from '@shared/match-menu-kit';
import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, ITEMS } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

const LABELS: Record<string, () => string> = {
  easy: () => t().easy,
  medium: () => t().medium,
  hard: () => t().hard,
};

export const MenuScene = createMatchMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '36px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  gameId: 'language-arts',
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
