import Phaser from 'phaser';
import { playSplash } from '../../../../src/sfx';
import { musicManager } from '../../../../src/music';

export class SplashScene extends Phaser.Scene {
  private done = false;

  constructor() { super('KarmaSplash'); }

  create(): void {
    this.done = false;
    const { width: W, height: H } = this.scale;
    const cx = W / 2, cy = H / 2;

    this.add.rectangle(cx, cy, W, H, 0x061510);

    // Felt layers
    this.add.ellipse(cx, cy, W * 0.95, H * 0.7,  0x0d2218, 0.5);
    this.add.ellipse(cx, cy, W * 0.65, H * 0.45, 0x122d1e, 0.4);

    // Subtle grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a3a28, 0.18);
    for (let x = 0; x <= W; x += 72) grid.lineBetween(x, 0, x, H);
    for (let y = 0; y <= H; y += 72) grid.lineBetween(0, y, W, y);

    const title = this.add.text(cx, cy - 60, 'KARMA', {
      fontFamily: 'Georgia, serif',
      fontSize: '108px',
      color: '#00e082',
      stroke: '#001a0d',
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff99', blur: 48, fill: true },
    }).setOrigin(0.5).setAlpha(0).setScale(0.6);

    const subtitle = this.add.text(cx, cy + 44, 'Karma — the Shithead | Karma card game', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#66aa88',
    }).setOrigin(0.5).setAlpha(0);

    const line = this.add.graphics().setAlpha(0);
    line.lineStyle(1, 0x00c06e, 0.5);
    line.lineBetween(cx - 220, cy + 80, cx + 220, cy + 80);

    const hint = this.add.text(cx, cy + 108, 'Tap to start', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#3d7755',
    }).setOrigin(0.5).setAlpha(0);

    const logo = this.add.image(W - 28, H - 24, 'karma-splash-logo')
      .setOrigin(1, 1).setDisplaySize(220, 220).setAlpha(0);

    this.tweens.add({ targets: title,    alpha: 1, scale: 1, duration: 900, ease: 'Back.easeOut', delay: 200 });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 600, delay: 800 });
    this.tweens.add({ targets: line,     alpha: 1, duration: 500, delay: 1000 });
    this.tweens.add({ targets: logo,     alpha: 0.7, duration: 700, delay: 300 });
    this.tweens.add({
      targets: hint, alpha: 1, duration: 500, delay: 1400,
      onComplete: () => {
        this.tweens.add({ targets: hint, alpha: 0.25, yoyo: true, repeat: -1, duration: 850, ease: 'Sine.easeInOut' });
      },
    });

    this.time.delayedCall(4000, () => this.advance());
    this.input.keyboard?.once('keydown', () => this.advance());
    this.input.once('pointerdown', () => this.advance());

    try {
      const hasSplash = !!(this.cache?.audio?.exists?.('splash'));
      if (this.sound && hasSplash) {
        this.sound.play('splash', { volume: 0.7 });
      } else {
        playSplash();
      }
    } catch {
      playSplash();
    }
  }

  private advance(): void {
    if (this.done) return;
    this.done = true;
    musicManager.init();
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('KarmaMenu'));
  }
}
