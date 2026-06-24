import Phaser from 'phaser';
import { BootScene } from '../games/board-rush/src/scenes/BootScene';
import { SplashScene } from '../games/board-rush/src/scenes/SplashScene';
import { GameScene } from '../games/board-rush/src/scenes/GameScene';

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
