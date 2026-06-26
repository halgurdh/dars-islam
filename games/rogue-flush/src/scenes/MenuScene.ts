import Phaser from 'phaser';
import { playClick } from '@src/sfx';
import { musicManager } from '@src/music';
import { cardImageKey, type Suit, type Rank } from '../data/cards';
import { ArcadeBar } from '@shared/arcade-bar';

export class MenuScene extends Phaser.Scene {
  private done = false;
  private arcadeBar!: ArcadeBar;

  constructor() { super('Menu'); }

  create(): void {
    this.arcadeBar = new ArcadeBar();
    this.events.once('shutdown', () => this.arcadeBar.destroy());
    const { width: W, height: H } = this.scale;
    const CX = W / 2;

    // ── Background ──────────────────────────────────────────────────────────
    this.add.rectangle(CX, H / 2, W, H, 0x0d0202);

    // Felt table texture (radial gradient simulation via layered rects)
    this._drawFeltBg(W, H);

    // Scattered background cards (decorative, semi-transparent)
    this._spawnDecorCards(W, H);

    // ── Logo area ───────────────────────────────────────────────────────────
    const logoY = H * 0.30;

    // Suit icons row
    const suits: Suit[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
    const suitSymbols = ['♠', '♥', '♦', '♣'];
    const suitColors  = [0xffffff, 0xff2222, 0xff2222, 0xffffff];
    suits.forEach((_s, i) => {
      const sx = CX + (i - 1.5) * 70;
      this.add.text(sx, logoY - 100, suitSymbols[i], {
        fontFamily: 'Georgia, serif', fontSize: '36px',
        color: Phaser.Display.Color.IntegerToColor(suitColors[i]).rgba,
      }).setOrigin(0.5).setAlpha(0).setName(`suit${i}`);
    });

    // Main title
    const title = this.add.text(CX, logoY, 'ROGUE FLUSH', {
      fontFamily: 'Georgia, serif',
      fontSize: '72px',
      color: '#ff3322',
      stroke: '#7a0000',
      strokeThickness: 8,
      shadow: { offsetX: 4, offsetY: 6, color: '#000000', blur: 16, fill: true },
    }).setOrigin(0.5).setAlpha(0).setScale(0.5);

    const subtitle = this.add.text(CX, logoY + 70, 'The Rogue-Like Poker Deckbuilder', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#d4a0a0',
    }).setOrigin(0.5).setAlpha(0);

    // Golden divider
    const line = this.add.graphics().setAlpha(0);
    line.lineStyle(2, 0xcc2200, 0.8);
    line.lineBetween(CX - 240, logoY + 100, CX + 240, logoY + 100);

    // Splash logo (bottom-right corner)
    const logo = this.add.image(W - 16, H - 16, 'splash-logo')
      .setOrigin(1, 1).setDisplaySize(120, 120).setAlpha(0);

    // ── Start button ────────────────────────────────────────────────────────
    const btnY = H * 0.53;
    const btn  = this._makeButton(CX, btnY, 300, 72, '▶  START RUN', 0xcc2200, 0xff4433);

    btn.bg.on('pointerdown', () => {
      if (this.done) return;
      this.done = true;
      playClick();
      musicManager.init();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Play'));
    });

    // ── Multiplayer button ───────────────────────────────────────────────────
    const mpBtnY = H * 0.63;
    const mpBtn  = this._makeButton(CX, mpBtnY, 300, 60, '⚔  MULTIPLAYER', 0x1a3355, 0x2a4477);

    mpBtn.bg.on('pointerdown', () => {
      if (this.done) return;
      this.done = true;
      playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Lobby'));
    });

    this.tweens.add({
      targets: mpBtn.container, scaleX: 1.02, scaleY: 1.02,
      yoyo: true, repeat: -1, duration: 1300, ease: 'Sine.easeInOut', delay: 1800,
    });

    // ── How to play panel ───────────────────────────────────────────────────
    const howY = H * 0.70;
    this._drawHowToPlay(CX, howY, W);

    // ── High score display ──────────────────────────────────────────────────
    const best = localStorage.getItem('rogueFlush_best') ?? '0';
    this.add.text(CX, H * 0.88, `Best Score: ${Number(best).toLocaleString()}`, {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#997755',
    }).setOrigin(0.5);

    // ── Entrance animations ─────────────────────────────────────────────────
    this.tweens.add({ targets: title,    alpha: 1, scale: 1, duration: 800, ease: 'Back.easeOut', delay: 200 });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 600, delay: 700 });
    this.tweens.add({ targets: line,     alpha: 1, duration: 500, delay: 900 });
    this.tweens.add({ targets: logo,     alpha: 0.7, duration: 800, delay: 400 });
    this.tweens.add({ targets: btn.container,   alpha: 1, y: btnY,   duration: 600, ease: 'Back.easeOut', delay: 1000 });
    this.tweens.add({ targets: mpBtn.container, alpha: 1, y: mpBtnY, duration: 600, ease: 'Back.easeOut', delay: 1150 });

    // Suit icons fan in
    for (let i = 0; i < 4; i++) {
      const suitObj = this.children.getByName(`suit${i}`);
      if (suitObj) {
        this.tweens.add({ targets: suitObj, alpha: 0.85, duration: 400, delay: 300 + i * 80 });
      }
    }

    // Button idle pulse
    this.tweens.add({
      targets: btn.container, scaleX: 1.03, scaleY: 1.03,
      yoyo: true, repeat: -1, duration: 1100, ease: 'Sine.easeInOut', delay: 1600,
    });

  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _drawFeltBg(W: number, H: number): void {
    // Dark green felt layers to simulate felt table feel
    const colors = [0x0d2010, 0x0f2512, 0x102814];
    const sizes  = [1.0, 0.85, 0.6];
    for (let i = 0; i < colors.length; i++) {
      this.add.ellipse(W / 2, H * 0.5, W * sizes[i], H * sizes[i] * 0.9, colors[i], 0.3 + i * 0.1);
    }
  }

  private _spawnDecorCards(W: number, H: number): void {
    const picks: Array<{ suit: Suit; rank: Rank }> = [
      { suit: 'Spades', rank: 1 }, { suit: 'Hearts', rank: 13 },
      { suit: 'Diamonds', rank: 1 }, { suit: 'Clubs', rank: 12 },
      { suit: 'Hearts', rank: 1 }, { suit: 'Spades', rank: 13 },
    ];

    picks.forEach((card, i) => {
      const key = cardImageKey(card.suit, card.rank);
      const x = Phaser.Math.Between(40, W - 40);
      const y = Phaser.Math.Between(H * 0.05, H * 0.95);
      const angle = Phaser.Math.Between(-40, 40);
      const img = this.add.image(x, y, key)
        .setDisplaySize(56, 78)
        .setAlpha(0.12)
        .setAngle(angle);

      // Gentle float
      this.tweens.add({
        targets: img,
        y: y + Phaser.Math.Between(-20, 20),
        duration: 3000 + i * 500,
        yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 300,
      });
    });
  }

  private _drawHowToPlay(cx: number, y: number, _W: number): void {
    const lines = [
      '♠  Select up to 5 cards to form a poker hand',
      '♦  Scored chips × multiplier beats the blind',
      '♥  4 plays + 3 discards per round',
      '♣  Beat all 3 blinds per ante to progress',
    ];
    const colors = ['#cccccc', '#ff8888', '#ff8888', '#cccccc'];

    lines.forEach((line, i) => {
      this.add.text(cx, y + i * 36, line, {
        fontFamily: 'Georgia, serif', fontSize: '17px', color: colors[i], align: 'center',
      }).setOrigin(0.5).setAlpha(0.85);
    });
  }

  private _makeButton(
    x: number, y: number, bw: number, bh: number, label: string, color: number, hoverColor: number,
  ): { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Rectangle } {
    const cont = this.add.container(x, y).setAlpha(0).setDepth(10);

    const shadow = this.add.rectangle(4, 6, bw, bh, 0x000000, 0.4).setOrigin(0.5);
    // bg is the interactive hit target — Container interactivity is unreliable in Phaser 3
    const bg = this.add.rectangle(0, 0, bw, bh, color, 1)
      .setStrokeStyle(2, 0xff6644, 1)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Georgia, serif', fontSize: '26px', color: '#ffffff',
      stroke: '#440000', strokeThickness: 3,
    }).setOrigin(0.5);

    cont.add([shadow, bg, text]);

    bg.on('pointerover',  () => bg.setFillStyle(hoverColor));
    bg.on('pointerout',   () => bg.setFillStyle(color));
    bg.on('pointerdown',  () => { bg.setFillStyle(0xaa1100); this.tweens.add({ targets: cont, y: y + 3, duration: 60 }); });
    bg.on('pointerup',    () => { bg.setFillStyle(hoverColor); this.tweens.add({ targets: cont, y, duration: 60 }); });

    return { container: cont, bg };
  }
}
