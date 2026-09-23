import { COLORS, FONT } from '../theme';
import { DIFFICULTIES, generateQuestion, generateMatchItems, generateSequenceRound } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, type GameMode } from '@shared/mode-menu-kit';
import { getMatchSfx } from '@shared/match-kit';

const GAME_ID = 'number-theory-logic';

const LABELS: Record<string, () => string> = {
  easy: () => t().easy,
  medium: () => t().medium,
  hard: () => t().hard,
};

const matchMode: GameMode = {
  id: 'match',
  label: () => t().modeMatch,
  icon: '🎴',
  difficulties: DIFFICULTIES.map((d, i) => ({
    label: LABELS[d.id],
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
        items: generateMatchItems(d, [6, 8, 10][i] ?? 6),
        menuSceneKey: 'MenuScene',
        locale,
      });
    },
  })),
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '30px',
  title: () => t().title,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  modes: [
    quizMode({
      label: () => t().modeQuiz,
      icon: '❓',
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
      difficulties: DIFFICULTIES.map((d) => ({
        label: LABELS[d.id],
        totalQuestions: d.totalQuestions,
        generateQuestion: () => generateQuestion(d),
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
      difficulties: DIFFICULTIES.map((d, i) => ({
        label: LABELS[d.id],
        totalRounds: 4,
        generateRound: () => generateSequenceRound(d, [4, 5, 6][i] ?? 4),
      })),
    }),
  ],
});
