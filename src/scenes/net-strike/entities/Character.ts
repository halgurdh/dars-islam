import Phaser from 'phaser';
import type { GridCoord, GridOwner } from '../types';
import { GridSystem } from '../systems/GridSystem';

export class Character extends Phaser.GameObjects.Container {
  readonly owner: GridOwner;
  coord: GridCoord;
  maxHealth: number;
  health: number;
  isMoving = false;
  private readonly grid: GridSystem;
  private readonly glow: Phaser.GameObjects.Arc;
  private readonly bodyShape: Phaser.GameObjects.Ellipse;
  private readonly head: Phaser.GameObjects.Arc;
  private readonly visor: Phaser.GameObjects.Rectangle;
  private readonly hpBack: Phaser.GameObjects.Rectangle;
  private readonly hpUnder: Phaser.GameObjects.Rectangle;
  private readonly hpFront: Phaser.GameObjects.Rectangle;
  private readonly shadow: Phaser.GameObjects.Ellipse;
  private displayedHealth: number;

  constructor(scene: Phaser.Scene, grid: GridSystem, owner: GridOwner, coord: GridCoord, tint: number, accent: number, maxHealth: number) {
    const world = grid.getCharacterPosition(coord);
    super(scene, world.x, world.y);
    scene.add.existing(this);
    this.grid = grid;
    this.owner = owner;
    this.coord = { ...coord };
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.displayedHealth = maxHealth;

    this.shadow = scene.add.ellipse(0, 30, 76, 24, 0x000000, 0.32);
    this.glow = scene.add.circle(0, -6, 42, accent, 0.18);
    this.bodyShape = scene.add.ellipse(0, 4, 54, 66, tint, 1);
    this.head = scene.add.circle(0, -30, 26, tint, 1);
    this.visor = scene.add.rectangle(0, -30, 28, 8, 0xdff7ff, 0.95);
    const shoulderL = scene.add.circle(-20, -6, 9, accent, 0.9);
    const shoulderR = scene.add.circle(20, -6, 9, accent, 0.9);
    const core = scene.add.rectangle(0, 6, 14, 24, accent, 0.95);
    this.hpBack = scene.add.rectangle(0, -72, 88, 9, 0x07111f, 0.92);
    this.hpUnder = scene.add.rectangle(-44, -72, 88, 5, 0xff7a7a, 0.45).setOrigin(0, 0.5);
    this.hpFront = scene.add.rectangle(-44, -72, 88, 5, 0x67f7a1, 0.95).setOrigin(0, 0.5);

    this.add([this.shadow, this.glow, this.bodyShape, this.head, this.visor, shoulderL, shoulderR, core, this.hpBack, this.hpUnder, this.hpFront]);
    this.setSize(96, 120);
  }

  dashTo(coord: GridCoord, duration: number, onComplete?: () => void): void {
    const world = this.grid.getCharacterPosition(coord);
    this.coord = { ...coord };
    this.isMoving = true;
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
    this.scene.tweens.add({
      targets: this.bodyShape,
      scaleX: 1.18,
      scaleY: 0.82,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
    this.scene.tweens.add({
      targets: [this.bodyShape, this.head],
      alpha: 0.2,
      duration: 60,
      yoyo: true,
      repeat: 3,
    });
  }
}

export class PlayerCharacter extends Character {
  constructor(scene: Phaser.Scene, grid: GridSystem, coord: GridCoord, maxHealth: number) {
    super(scene, grid, 'player', coord, 0x36a2ff, 0xb3f1ff, maxHealth);
  }
}

export class EnemyCharacter extends Character {
  constructor(scene: Phaser.Scene, grid: GridSystem, coord: GridCoord, maxHealth: number) {
    super(scene, grid, 'enemy', coord, 0xff4778, 0xffb2c8, maxHealth);
  }
}
