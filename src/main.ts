import Phaser from 'phaser';
import { BootScene } from '../shared/scenes/BootScene';
import { SplashScene } from '../shared/scenes/SplashScene';
import { GameScene } from '../shared/scenes/GameScene';

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
