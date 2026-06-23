import Phaser from 'phaser';
import { SUITS, RANKS, RANK_LABELS, type Suit, type Rank } from '../data/cards';

const splashLogoUrl = new URL('../../../../shared/splash.png', import.meta.url).href;
const splashAudioUrl = new URL('../../../../shared/splash.mp3', import.meta.url).href;

export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const cy = height / 2;

    // Loading bar
    const barBg = this.add.rectangle(cx, cy, 500, 24, 0x2a0808).setStrokeStyle(1, 0x8b0000);
    const bar   = this.add.rectangle(cx - 248, cy, 4, 16, 0xcc2200).setOrigin(0, 0.5);
    const label = this.add.text(cx, cy - 44, 'Loading Rogue Flush…', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#cc2200',
    }).setOrigin(0.5);

    this.load.on('progress', (p: number) => { bar.width = 496 * p; });
    this.load.on('complete', () => { barBg.destroy(); bar.destroy(); label.destroy(); });

    // All 52 card faces
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        const label_ = RANK_LABELS[rank as Rank];
        const key  = `card${suit}${label_}`;
        const path = `assets/cards/card${suit as Suit}${label_}.png`;
        this.load.image(key, path);
      }
    }

    // Card backs (blue, green, red × 5 each)
    for (const color of ['blue', 'green', 'red']) {
      for (let n = 1; n <= 5; n++) {
        const key = `cardBack_${color}${n}`;
        this.load.image(key, `assets/cards/${key}.png`);
      }
    }

    // Shared splash assets
    this.load.image('splash-logo', splashLogoUrl);
    this.load.audio('splash', splashAudioUrl);
  }

  create(): void {
    this.scene.start('Menu');
  }
}
