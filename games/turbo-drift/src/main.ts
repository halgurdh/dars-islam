import Phaser from 'phaser';
import { enable3d } from '@enable3d/phaser-extension';
import { BootScene } from './scenes/BootScene';
import { SplashScene } from './scenes/SplashScene';
import { GarageScene } from './scenes/GarageScene';
import { RaceScene } from './scenes/RaceScene';
import { WORLD } from './constants';

console.info('[Turbo Drift] main.ts loaded', {
  baseUrl: import.meta.env.BASE_URL,
  userAgent: navigator.userAgent,
});

window.addEventListener('error', (event) => {
  console.error('[Turbo Drift] window error', event.error ?? event.message, event);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Turbo Drift] unhandled rejection', event.reason);
});

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  parent: 'game',
  width: WORLD.width,
  height: WORLD.height,
  backgroundColor: '#07080f',
  render: {
    antialias: true,
    transparent: true,
  },
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  scene: [BootScene, SplashScene, GarageScene, RaceScene],
};

const physicsBasePath = `${import.meta.env.BASE_URL}lib`.replace(/\/$/, '');

console.info('[Turbo Drift] creating game', { physicsBasePath });
enable3d(() => {
  console.info('[Turbo Drift] Phaser.Game factory invoked');
  return new Phaser.Game(config);
}).withPhysics(physicsBasePath);
