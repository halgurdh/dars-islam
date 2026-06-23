import Phaser from 'phaser';
import { type Suit, type Rank, cardImageKey, cardChips } from '../data/cards';

/** Visual size of a card in the player hand (px, at canvas scale). */
export const HAND_CARD_W = 78;
export const HAND_CARD_H = 109;

/** Visual size of a card in the play zone. */
export const PLAY_CARD_W = 90;
export const PLAY_CARD_H = 126;

/**
 * A playing card rendered as a Phaser Container.
 * Children: shadow, back, face, glow border, transparent hit zone.
 */
export class Card extends Phaser.GameObjects.Container {
  readonly suit: Suit;
  readonly rank: Rank;
  readonly chips: number;

  private faceImg!: Phaser.GameObjects.Image;
  private backImg!: Phaser.GameObjects.Image;
  private glowBorder!: Phaser.GameObjects.Rectangle;
  private shadow!: Phaser.GameObjects.Rectangle;

  private _selected = false;
  private _faceUp = false;
  private _interactable = false;

  /** The card's resting Y in its current zone (used by selection lift). */
  baseY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, suit: Suit, rank: Rank) {
    super(scene, x, y);
    this.suit = suit;
    this.rank = rank;
    this.chips = cardChips(rank);
    this.baseY = y;
    this._build();
    scene.add.existing(this);
  }

  private _build(): void {
    const s = this.scene;
    const w = HAND_CARD_W;
    const h = HAND_CARD_H;

    // Drop shadow
    this.shadow = s.add.rectangle(3, 4, w, h, 0x000000, 0.4).setOrigin(0.5);
    this.add(this.shadow);

    // Glow border (selected state)
    this.glowBorder = s.add.rectangle(0, 0, w + 8, h + 8, 0x000000, 0)
      .setStrokeStyle(3, 0xffd700, 1)
      .setOrigin(0.5)
      .setVisible(false);
    this.add(this.glowBorder);

    // Card back
    this.backImg = s.add.image(0, 0, 'cardBack_blue2').setDisplaySize(w, h).setOrigin(0.5);
    this.add(this.backImg);

    // Card face (alpha 0 until flipped up)
    const faceKey = cardImageKey(this.suit, this.rank);
    this.faceImg = s.add.image(0, 0, faceKey).setDisplaySize(w, h).setOrigin(0.5).setAlpha(0);
    this.add(this.faceImg);

    // Transparent hit zone — the only interactive child
    const hit = s.add.rectangle(0, 0, w, h, 0x000000, 0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.add(hit);

    hit.on('pointerdown', (_ptr: Phaser.Input.Pointer, _lx: number, _ly: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      if (this._interactable && this._faceUp) this.emit('card:tap', this);
    });
    hit.on('pointerover', () => {
      if (this._interactable && this._faceUp && !this._selected) {
        this.scene.tweens.add({ targets: this, y: this.baseY - 8, duration: 90, ease: 'Sine.easeOut' });
      }
    });
    hit.on('pointerout', () => {
      if (this._interactable && this._faceUp && !this._selected) {
        this.scene.tweens.add({ targets: this, y: this.baseY, duration: 90, ease: 'Sine.easeOut' });
      }
    });
  }

  // ─── State accessors ──────────────────────────────────────────────────────

  get selected(): boolean { return this._selected; }
  get faceUp(): boolean { return this._faceUp; }

  setInteractable(val: boolean): this {
    this._interactable = val;
    return this;
  }

  // ─── Visuals ──────────────────────────────────────────────────────────────

  /** Resize the card images (used when placing a card in the play zone). */
  resize(w: number, h: number): this {
    this.faceImg.setDisplaySize(w, h);
    this.backImg.setDisplaySize(w, h);
    this.glowBorder.setSize(w + 8, h + 8);
    this.shadow.setSize(w, h);
    return this;
  }

  select(val: boolean): this {
    if (this._selected === val) return this;
    this._selected = val;
    this.glowBorder.setVisible(val);
    const targetY = val ? this.baseY - 24 : this.baseY;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({ targets: this, y: targetY, duration: 140, ease: 'Back.easeOut' });
    return this;
  }

  /** Flip the card face-up with a horizontal scale animation. Returns a promise. */
  flipUp(delay = 0): Promise<void> {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 0,
        duration: 120,
        ease: 'Linear',
        delay,
        onComplete: () => {
          this.backImg.setAlpha(0);
          this.faceImg.setAlpha(1);
          this._faceUp = true;
          this.scene.tweens.add({
            targets: this,
            scaleX: 1,
            duration: 120,
            ease: 'Linear',
            onComplete: () => resolve(),
          });
        },
      });
    });
  }

  /** Instantly reset to face-down unselected state (for reuse). */
  reset(): this {
    this._selected = false;
    this._faceUp = false;
    this._interactable = false;
    this.backImg.setAlpha(1);
    this.faceImg.setAlpha(0);
    this.glowBorder.setVisible(false);
    this.setScale(1);
    this.resize(HAND_CARD_W, HAND_CARD_H);
    return this;
  }
}
