import Phaser from 'phaser';
import { createModeMenuScene, quizMode, type GameMode } from '@shared/mode-menu-kit';
import { getMatchSfx } from '@shared/match-kit';
import { COLORS, FONT } from '../theme';
import { TRICKS, type Trick } from '../tricks';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

const GAME_ID = 'math-tricks-lab';
const MATCH_POOL_SIZE = 16;
const MATCH_PAIRS = 6;
const SEQUENCE_ROUNDS = 3;
const SEQUENCE_COUNT = 5;

export function homeSceneKey(trick: Trick): string {
  return `trick-home:${trick.id}`;
}

// One mode-select home screen per trick (Learn tutorial + Quiz + Match +
// Sequence), mirroring math-mastery's TopicHomeScenes.ts — same shape of
// problem (several self-contained "lessons" in one game shell), just keyed
// by trick instead of topic.
function buildTrickHomeScene(trick: Trick): typeof Phaser.Scene {
  const learnMode: GameMode = {
    id: 'learn',
    label: () => t().modeLearn,
    icon: '📖',
    difficulties: [
      {
        label: () => t().startLearn,
        onSelect: (scene) => scene.scene.start('Learn', { trickId: trick.id }),
      },
    ],
  };

  const quizModeEntry = quizMode({
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
      {
        label: () => t().startQuiz,
        totalQuestions: trick.totalQuestions,
        generateQuestion: trick.generateQuestion,
      },
    ],
    homeSceneKey: homeSceneKey(trick),
  });

  const matchModeEntry: GameMode = {
    id: 'match',
    label: () => t().modeMatch,
    icon: '🃏',
    difficulties: [
      {
        label: () => t().startMatch,
        onSelect: (scene) => {
          const items = trick.generateMatchItems(MATCH_POOL_SIZE);
          getMatchSfx(GAME_ID).flip();
          scene.scene.start('Match', {
            gameId: GAME_ID,
            pairs: Math.min(MATCH_PAIRS, items.length),
            theme: COLORS,
            fontFamily: FONT,
            strings: {
              menu: t().menu,
              moves: t().moves,
              wellDone: t().wellDone,
              roundSummary: t().matchRoundSummary,
              nextLevelHint: t().nextLevelHint,
            },
            items,
            menuSceneKey: homeSceneKey(trick),
          });
        },
      },
    ],
  };

  const sequenceModeEntry: GameMode = {
    id: 'sequence',
    label: () => t().modeSequence,
    icon: '🔢',
    difficulties: [
      {
        label: () => t().startSequence,
        onSelect: (scene) => {
          scene.scene.start('Sequence', {
            gameId: GAME_ID,
            totalRounds: SEQUENCE_ROUNDS,
            theme: COLORS,
            fontFamily: FONT,
            strings: {
              round: t().round,
              mistakes: t().mistakes,
              menu: t().menu,
              instruction: t().instruction,
              wellDone: t().wellDone,
              roundSummary: t().sequenceRoundSummary,
              playAgain: t().playAgain,
              backToMenu: t().backToMenu,
            },
            generateRound: () => trick.generateSequenceRound(SEQUENCE_COUNT),
            menuSceneKey: homeSceneKey(trick),
          });
        },
      },
    ],
  };

  return createModeMenuScene({
    sceneKey: homeSceneKey(trick),
    theme: COLORS,
    fontFamily: FONT,
    titleFontSize: '32px',
    title: () => `${trick.icon} ${trick.title()}`,
    tagline: () => trick.summary(),
    footer: () => t().footer,
    locale: { getLang, setLang, detectDefaultLang },
    modes: [learnMode, quizModeEntry, matchModeEntry, sequenceModeEntry],
  });
}

// createModeMenuScene's return type is deliberately just `typeof Phaser.Scene`,
// so the one extra "← Tricks" link this sub-menu needs is added as a
// prototype patch on its own `create()` rather than a `class extends` TS
// can't see through (see math-mastery/TopicHomeScenes.ts for the same fix).
export function createTrickHomeScenes(): Phaser.Scene[] {
  return TRICKS.map((trick) => {
    const SceneClass = buildTrickHomeScene(trick) as unknown as new () => Phaser.Scene;
    const proto = SceneClass.prototype as Phaser.Scene & { create: () => void };
    const originalCreate = proto.create;
    proto.create = function (this: Phaser.Scene) {
      originalCreate.call(this);
      const { width, height } = this.scale;
      const back = this.add.text(width / 2, height * 0.88, t().back, {
        fontFamily: FONT,
        fontSize: '19px',
        color: COLORS.textMuted,
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      back.setPadding(12, 12, 12, 12);
      back.on('pointerdown', () => this.scene.start('MenuScene'));
    };
    return new SceneClass();
  });
}
