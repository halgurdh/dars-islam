import Phaser from 'phaser';
import { createModeMenuScene, quizMode, type GameMode } from '@shared/mode-menu-kit';
import { getMatchSfx } from '@shared/match-kit';
import { COLORS, FONT } from '../theme';
import { TOPICS, type Topic } from '../topics';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

const GAME_ID = 'math-mastery';
const MATCH_POOL_SIZE = 20;
const MATCH_PAIRS = 6;
const SEQUENCE_ROUNDS = 3;
const SEQUENCE_COUNT = 5;

export function homeSceneKey(topic: Topic): string {
  return `topic-home:${topic.id}`;
}

// One mode-select home screen per topic (Learn tutorial + Quiz + Match +
// Sequence), all built from the same topic data the existing Learn/Quiz
// flow already used — Match/Sequence just add two more ways to drill the
// same generated problems.
function buildTopicHomeScene(topic: Topic): typeof Phaser.Scene {
  const learnMode: GameMode = {
    id: 'learn',
    label: () => t().modeLearn,
    icon: '📖',
    difficulties: [
      {
        label: () => t().startLearn,
        onSelect: (scene) => scene.scene.start('Learn', { topicId: topic.id }),
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
        totalQuestions: topic.totalQuestions,
        generateQuestion: topic.generateQuestion,
      },
    ],
    homeSceneKey: homeSceneKey(topic),
  });

  const matchModeEntry: GameMode = {
    id: 'match',
    label: () => t().modeMatch,
    icon: '🃏',
    difficulties: [
      {
        label: () => t().startMatch,
        onSelect: (scene, locale) => {
          const items = topic.generateMatchItems(MATCH_POOL_SIZE);
          getMatchSfx(GAME_ID).flip();
          scene.scene.start('Match', {
            gameId: GAME_ID,
            pairs: Math.min(MATCH_PAIRS, items.length),
            theme: COLORS,
            fontFamily: FONT,
            strings: () => ({
              menu: t().menu,
              moves: t().moves,
              wellDone: t().wellDone,
              roundSummary: t().matchRoundSummary,
              nextLevelHint: t().nextLevelHint,
            }),
            items,
            menuSceneKey: homeSceneKey(topic),
            locale,
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
        onSelect: (scene, locale) => {
          scene.scene.start('Sequence', {
            gameId: GAME_ID,
            totalRounds: SEQUENCE_ROUNDS,
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
            generateRound: () => topic.generateSequenceRound(SEQUENCE_COUNT),
            menuSceneKey: homeSceneKey(topic),
            locale,
          });
        },
      },
    ],
  };

  return createModeMenuScene({
    sceneKey: homeSceneKey(topic),
    theme: COLORS,
    fontFamily: FONT,
    titleFontSize: '34px',
    title: () => `${topic.icon} ${topic.title}`,
    tagline: () => topic.summary,
    footer: () => t().footer,
    locale: { getLang, setLang, detectDefaultLang },
    modes: [learnMode, quizModeEntry, matchModeEntry, sequenceModeEntry],
  });
}

// createModeMenuScene's return type is deliberately just `typeof Phaser.Scene`
// (callers aren't meant to know its internals), so adding the one extra
// "← Topics" link this sub-menu needs is done as a prototype patch on its
// own `create()` rather than a `class extends` TS can't see through.
export function createTopicHomeScenes(): Phaser.Scene[] {
  return TOPICS.map((topic) => {
    const SceneClass = buildTopicHomeScene(topic) as unknown as new () => Phaser.Scene;
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
