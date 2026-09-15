import Phaser from 'phaser';
import { BuilderMenuScene } from './scenes/BuilderMenuScene';
import { BuilderScene } from './scenes/BuilderScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 720,
  height: 1280,
  backgroundColor: '#140d1c',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BuilderMenuScene, BuilderScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
