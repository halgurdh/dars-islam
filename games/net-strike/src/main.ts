import Phaser from 'phaser';
import { BootScene } from '../../../src/scenes/net-strike/scenes/BootScene';
import { SplashScene } from '../../../src/scenes/net-strike/scenes/SplashScene';
import { BattleScene } from '../../../src/scenes/net-strike/scenes/BattleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 1280,
  height: 720,
  backgroundColor: '#07111f',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, SplashScene, BattleScene],
};

new Phaser.Game(config);
