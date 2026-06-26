import Phaser from 'phaser';
import type { GridCoord, GridOwner } from '../types';
import { GridSystem } from '../systems/GridSystem';
import { getSlicedFrameOrigin } from '../spriteSlices';

type AnimationName = 'idle' | 'dash' | 'shoot' | 'sword' | 'hit';

export class Character extends Phaser.GameObjects.Container {
  readonly owner: GridOwner;
  coord: GridCoord;
  maxHealth: number;
  health: number;
  isMoving = false;
  private readonly grid: GridSystem;
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly hpBack: Phaser.GameObjects.Rectangle;
  private readonly hpUnder: Phaser.GameObjects.Rectangle;
  private readonly hpFront: Phaser.GameObjects.Rectangle;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private displayedHealth: number;
  private currentAnim: AnimationName = 'idle';
  private animQueue: AnimationName[] = [];
  private charPrefix: string;

  constructor(scene: Phaser.Scene, grid: GridSystem, owner: GridOwner, coord: GridCoord, maxHealth: number, charPrefix: string) {
    const world = grid.getCharacterPosition(coord);
    super(scene, world.x, world.y);
    scene.add.existing(this);
    this.grid = grid;
    this.owner = owner;
    this.coord = { ...coord };
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.displayedHealth = maxHealth;
    this.charPrefix = charPrefix;

    // Shadow
    this.shadow = scene.add.ellipse(0, 8, 76, 18, 0x000000, 0.45);

    const startTexture = `${charPrefix}_cell_0`;
    this.sprite = scene.add.sprite(0, 0, startTexture);
    this.syncSpriteOrigin();
    if (charPrefix === 'enemy') this.sprite.setFlipX(true);
    this.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, () => this.syncSpriteOrigin());
    this.sprite.play(`${charPrefix}_idle`);

    // HP bar
    this.hpBack = scene.add.rectangle(0, -200, 88, 9, 0x07111f, 0.92);
    this.hpUnder = scene.add.rectangle(-44, -200, 88, 5, 0xff7a7a, 0.45).setOrigin(0, 0.5);
    this.hpFront = scene.add.rectangle(-44, -200  , 88, 5, this.owner === 'player' ? 0x67f7a1 : 0xff9eb0, 0.95).setOrigin(0, 0.5);

    this.add([this.shadow, this.sprite, this.hpBack, this.hpUnder, this.hpFront]);
    this.setSize(96, 120);
    this.setDepth(500);
  }

  private playAnim(name: AnimationName, onComplete?: () => void): void {
    this.currentAnim = name;
    const key = `${this.charPrefix}_${name}`;
    this.sprite.play(key, true);
    this.sprite.once('animationcomplete', () => {
      if (onComplete) onComplete();
      this.animQueue.shift();
      if (this.animQueue.length > 0) {
        this.playAnim(this.animQueue[0]);
      } else if (this.currentAnim !== 'idle') {
        this.idle();
      }
    });
  }

  idle(): void {
    if (this.currentAnim !== 'idle') {
      this.currentAnim = 'idle';
      this.animQueue = [];
      this.sprite.play(`${this.charPrefix}_idle`, true);
    }
  }

  dashTo(coord: GridCoord, duration: number, onComplete?: () => void): void {
    const world = this.grid.getCharacterPosition(coord);
    this.coord = { ...coord };
    this.isMoving = true;

    // Play dash animation
    this.animQueue = [];
    this.playAnim('dash');

    this.scene.tweens.add({
      targets: this,
      x: world.x,
      y: world.y,
      duration,
      ease: 'Quint.easeOut',
      onStart: () => {
        this.scene.tweens.add({
          targets: this,
          scaleX: 1.12,
          scaleY: 0.9,
          duration: Math.floor(duration * 0.45),
          yoyo: true,
          ease: 'Sine.easeOut',
        });
      },
      onComplete: () => {
        this.isMoving = false;
        this.idle();
        onComplete?.();
      },
    });
  }

  updateVisuals(): void {
    this.displayedHealth = Phaser.Math.Linear(this.displayedHealth, this.health, 0.12);
    const visibleHp = Phaser.Math.Clamp(this.health / this.maxHealth, 0, 1);
    const trailingHp = Phaser.Math.Clamp(this.displayedHealth / this.maxHealth, 0, 1);
    this.hpFront.width = 88 * visibleHp;
    this.hpUnder.width = 88 * trailingHp;
  }

  shootPulse(): void {
    this.animQueue = [];
    this.playAnim('shoot', () => this.idle());

    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.12,
      scaleY: 0.88,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  swordSlash(onComplete?: () => void): void {
    this.animQueue = [];
    this.playAnim('sword', () => {
      this.idle();
      onComplete?.();
    });
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.animQueue = [];
    this.playAnim('hit', () => {
      if (this.health > 0) {
        this.idle();
      }
    });
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 80,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.sprite.alpha = 1;
      },
    });
  }

  heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.scene.tweens.add({
      targets: this.sprite,
      tint: 0x8affc1,
      duration: 110,
      yoyo: true,
      onComplete: () => {
        this.sprite.clearTint();
      },
    });
  }

  private syncSpriteOrigin(): void {
    const frameName = this.sprite.texture.key;
    const origin = getSlicedFrameOrigin(frameName);
    if (origin) {
      this.sprite.setOrigin(origin.x, origin.y);
      return;
    }
    this.sprite.setOrigin(0.5, 0.5);
  }
}

export class PlayerCharacter extends Character {
  constructor(scene: Phaser.Scene, grid: GridSystem, coord: GridCoord, maxHealth: number) {
    super(scene, grid, 'player', coord, maxHealth, 'player');
  }
}

export class EnemyCharacter extends Character {
  constructor(scene: Phaser.Scene, grid: GridSystem, coord: GridCoord, maxHealth: number) {
    super(scene, grid, 'enemy', coord, maxHealth, 'enemy');
  }
}
