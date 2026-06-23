import Phaser from 'phaser';
import { playClick } from '@src/sfx';
import { musicManager } from '@src/music';

export class SplashScene extends Phaser.Scene {
  private autoTimer!: Phaser.Time.TimerEvent;
  private done = false;

  constructor() {
    super('Splash');
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Dark background with a subtle vignette overlay
    this.add.rectangle(cx, cy, width, height, 0x080b08);
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.8, 0.8, 0, 0);
    vignette.fillRect(0, 0, width, height);

    // Background image (dimmed)
    const bg = this.add.image(cx, cy, 'background')
      .setDisplaySize(width, height)
      .setAlpha(0)
      .setTint(0x334433);

    // Subtitle
    const subtitle = this.add.text(cx, cy + 60, 'A Board Game Adventure', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#a8c8a8',
    }).setOrigin(0.5).setAlpha(0);

    // Main title
    const title = this.add.text(cx, cy - 20, 'BOARD RUSH', {
      fontFamily: 'Georgia, serif',
      fontSize: '80px',
      color: '#f2cc1a',
      stroke: '#7a5c00',
      strokeThickness: 6,
      shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 12, fill: true },
    }).setOrigin(0.5).setAlpha(0).setScale(0.6);

    // Press any key hint
    const hint = this.add.text(cx, cy + 160, 'Press any key or click to start', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#888888',
    }).setOrigin(0.5).setAlpha(0);

    // Golden divider line
    const line = this.add.graphics().setAlpha(0);
    line.lineStyle(2, 0xf2cc1a, 0.6);
    line.lineBetween(cx - 220, cy + 100, cx + 220, cy + 100);

    // Splash logo (bottom-right)
    const logo = this.add.image(width - 20, height - 20, 'splash-logo')
      .setOrigin(1, 1)
      .setDisplaySize(140, 140)
      .setAlpha(0);

    // Auto-advance after 3 s; input can skip at any time
    this.autoTimer = this.time.delayedCall(3000, () => this.fadeToGame());
    this.enableInput();

    // Animate sequence
    this.tweens.add({ targets: bg, alpha: 0.18, duration: 1200, ease: 'Sine.easeIn' });
    this.tweens.add({ targets: logo, alpha: 0.85, duration: 800, delay: 400 });

    this.tweens.add({
      targets: title,
      alpha: 1,
      scale: 1,
      duration: 900,
      ease: 'Back.easeOut',
      delay: 300,
    });

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 700,
      ease: 'Sine.easeIn',
      delay: 900,
    });

    this.tweens.add({
      targets: line,
      alpha: 1,
      duration: 600,
      delay: 1100,
    });

    this.tweens.add({
      targets: hint,
      alpha: 1,
      duration: 600,
      delay: 1500,
      onComplete: () => {
        this.tweens.add({
          targets: hint,
          alpha: 0.3,
          yoyo: true,
          repeat: -1,
          duration: 900,
          ease: 'Sine.easeInOut',
        });
      },
    });

    // Play the preloaded splash audio via Phaser's sound manager if it's available
    // and the audio key exists in the cache. Otherwise fall back to the helper.
    try {
      const hasSplash = !!(this.cache && (this.cache as any).audio && (this.cache as any).audio.exists && (this.cache as any).audio.exists('splash'));
      if (this.sound && hasSplash) {
        this.sound.play('splash', { volume: 0.7 });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { playSplash } = require('@src/sfx');
        playSplash();
      }
    } catch (err) {
      // Protect against any runtime issues with the Phaser cache API
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { playSplash } = require('@src/sfx');
      playSplash();
    }
  }

  private enableInput(): void {
    const advance = () => { playClick(); musicManager.init(); this.fadeToGame(); };
    this.input.keyboard?.once('keydown', advance);
    this.input.once('pointerdown', advance);
  }

  private fadeToGame(): void {
    if (this.done) return;
    this.done = true;
    this.autoTimer.remove();
    this.input.keyboard?.removeAllListeners();
    this.input.removeAllListeners();

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game');
    });
  }
}
