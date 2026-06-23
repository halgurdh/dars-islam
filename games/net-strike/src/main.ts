import Phaser from 'phaser';
import { BootScene } from '../../../src/scenes/net-strike/scenes/BootScene';
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
  scene: [BootScene, BattleScene],
};

new Phaser.Game(config);
