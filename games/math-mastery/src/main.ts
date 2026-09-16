import Phaser from 'phaser';
import { QuizScene } from '@shared/quiz-kit';
import { MenuScene } from './scenes/MenuScene';
import { LearnScene } from './scenes/LearnScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 720,
  height: 1280,
  backgroundColor: '#170b08',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [new MenuScene(), new LearnScene(), new QuizScene()],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
