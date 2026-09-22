import { COLORS, FONT } from '../theme';
import { TOTAL_QUESTIONS, makeRunGenerator, generateMatchItems, generateSequenceRound } from '../questions';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, type GameMode } from '@shared/mode-menu-kit';
import { getMatchSfx } from '@shared/match-kit';

const GAME_ID = 'wonder-why';
const MATCH_PAIRS = 8;
const SEQUENCE_COUNT = 6;

const matchMode: GameMode = {
  id: 'match',
  label: () => t().modeMatch,
  icon: '🎴',
  difficulties: [
    {
      label: () => t().start,
      onSelect: (scene) => {
        getMatchSfx(GAME_ID).flip();
        scene.scene.start('Match', {
          gameId: GAME_ID,
          pairs: MATCH_PAIRS,
          theme: COLORS,
          fontFamily: FONT,
          strings: {
            menu: t().menu,
            moves: t().moves,
            wellDone: t().wellDone,
            roundSummary: t().matchRoundSummary,
            nextLevelHint: t().nextLevelHint,
          },
          items: generateMatchItems(MATCH_PAIRS),
          menuSceneKey: 'MenuScene',
        });
      },
    },
  ],
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: FONT,
  titleFontSize: '42px',
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
      difficulties: [
        { label: () => t().start, totalQuestions: TOTAL_QUESTIONS, generateQuestion: makeRunGenerator() },
      ],
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
      difficulties: [
        { label: () => t().start, totalRounds: 4, generateRound: () => generateSequenceRound(SEQUENCE_COUNT) },
      ],
    }),
  ],
});
