import Phaser from 'phaser';
import { BootScene } from './scenes/board-rush/scenes/BootScene';
import { SplashScene } from './scenes/board-rush/scenes/SplashScene';
import { GameScene } from './scenes/board-rush/scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#0c0f0a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, SplashScene, GameScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
