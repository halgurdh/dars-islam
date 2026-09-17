import { createSequenceMenuScene } from '@shared/sequence-menu-kit';
import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, generateRound } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

const LABELS: Record<string, () => string> = {
  easy: () => t().easy,
  medium: () => t().medium,
  hard: () => t().hard,
};

export const MenuScene = createSequenceMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '36px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  gameId: 'world-history',
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
});
