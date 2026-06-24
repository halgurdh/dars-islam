import Phaser from 'phaser';

const splashLogoUrl  = new URL('../../../../shared/splash.png', import.meta.url).href;
const splashAudioUrl = new URL('../../../../shared/splash.mp3', import.meta.url).href;

const SUITS = ['Clubs', 'Diamonds', 'Hearts', 'Spades'] as const;
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as const;

export class BootScene extends Phaser.Scene {
  constructor() { super('KarmaBoot'); }

  preload(): void {
    const { width: W, height: H } = this.scale;
    const cx = W / 2;

    this.add.rectangle(cx, H / 2, W, H, 0x0a1a10);
    this.add.text(cx, H * 0.38, 'KARMA', {
      fontFamily: 'Georgia, serif',
      fontSize: '84px',
      color: '#00e082',
      stroke: '#002211',
      strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ff99', blur: 36, fill: true },
    }).setOrigin(0.5);

    const barW = 400;
    const barX = cx - barW / 2;
    const barY = H * 0.57;
    this.add.rectangle(cx, barY, barW + 8, 28, 0x1a4030);
    const fill = this.add.rectangle(barX, barY, 0, 20, 0x00c06e).setOrigin(0, 0.5);
    const loadTxt = this.add.text(cx, barY + 26, 'Loading…', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#66bb99',
    }).setOrigin(0.5);

    this.load.on('progress', (v: number) => {
      fill.width = barW * v;
      loadTxt.setText(`Loading… ${Math.floor(v * 100)}%`);
    });

    // Card images (52 + joker + back)
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        const key = `card${suit}${rank}`;
        this.load.image(key, `/assets/cards/${key}.png`);
      }
    }
    this.load.image('cardJoker', '/assets/cards/cardJoker.png');
    this.load.image('cardBack',  '/assets/cards/cardBack_blue2.png');

    // Splash
    this.load.image('karma-splash-logo', splashLogoUrl);
    this.load.audio('splash', splashAudioUrl);
  }

  create(): void {
    this.scene.start('KarmaSplash');
  }
}
