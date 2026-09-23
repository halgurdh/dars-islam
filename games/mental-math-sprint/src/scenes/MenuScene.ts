import { COLORS, FONT } from '../theme';
import { SPEED_MODES, TOTAL_QUESTIONS, generateQuestion, tier1, tier2, tier3, generateMatchItems, generateSequenceRound } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, type GameMode } from '@shared/mode-menu-kit';
import { getMatchSfx } from '@shared/match-kit';

const GAME_ID = 'mental-math-sprint';

const SPEED_LABELS: Record<string, () => string> = {
  relaxed: () => t().relaxed,
  normal: () => t().normal,
};

const TIERS = [tier1, tier2, tier3];
const TIER_LABELS = [() => t().easy, () => t().medium, () => t().hard];

// Match items are regenerated fresh at click-time (not baked into the menu)
// because each tier needs its own generator — matchMode()'s static `items`
// list can't vary per difficulty like that.
const matchMode: GameMode = {
  id: 'match',
  label: () => t().modeMatch,
  icon: '🎴',
  difficulties: TIERS.map((tierFn, i) => ({
    label: TIER_LABELS[i],
    onSelect: (scene, locale) => {
      getMatchSfx(GAME_ID).flip();
      scene.scene.start('Match', {
        gameId: GAME_ID,
        pairs: [6, 8, 10][i] ?? 6,
        theme: COLORS,
        fontFamily: FONT,
        strings: () => ({
          menu: t().menu,
          moves: t().moves,
          wellDone: t().wellDone,
          roundSummary: t().matchRoundSummary,
          nextLevelHint: t().nextLevelHint,
        }),
        items: generateMatchItems(tierFn, [6, 8, 10][i] ?? 6),
        menuSceneKey: 'MenuScene',
        locale,
      });
    },
  })),
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '40px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  modes: [
    quizMode({
      label: () => t().modeQuiz,
      icon: '⚡',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: FONT,
      strings: () => ({
        round: t().round,
        score: t().score,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().roundSummary,
        playAgain: t().playAgain,
        backToMenu: t().backToMenu,
      }),
      difficulties: SPEED_MODES.map((mode) => ({
        label: SPEED_LABELS[mode.id],
        totalQuestions: TOTAL_QUESTIONS,
        timeLimitMs: mode.timeLimitMs,
        generateQuestion,
      })),
    }),
    matchMode,
    sequenceMode({
      label: () => t().modeSequence,
      icon: '📏',
      gameId: GAME_ID,
      theme: COLORS,
      fontFamily: FONT,
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
      difficulties: TIERS.map((tierFn, i) => ({
        label: TIER_LABELS[i],
        totalRounds: 4,
        generateRound: () => generateSequenceRound(tierFn, [4, 5, 6][i] ?? 4),
      })),
    }),
  ],
});
