import Phaser from 'phaser';

const splashAudioUrl = new URL('../../../../shared/splash.mp3', import.meta.url).href;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.audio('splash', splashAudioUrl);
  }

  create(): void {
    this.registry.set('turboDriftReady', true);
    this.scene.start('Splash');
  }
}
