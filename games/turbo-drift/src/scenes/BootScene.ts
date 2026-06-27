import Phaser from 'phaser';

const splashAudioUrl = new URL('../../../../shared/splash.mp3', import.meta.url).href;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    console.info('[Turbo Drift][Boot] preload');
    this.load.audio('splash', splashAudioUrl);
  }

  create(): void {
    console.info('[Turbo Drift][Boot] create -> Splash');
    this.registry.set('turboDriftReady', true);
    this.scene.start('Splash');
  }
}
