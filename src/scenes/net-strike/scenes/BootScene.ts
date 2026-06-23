import Phaser from 'phaser';

const splashLogoUrl = new URL('../../../../shared/splash.png', import.meta.url).href;

export class BootScene extends Phaser.Scene {
  constructor() {
    super('NetStrikeBoot');
  }

  preload(): void {
    this.load.image('ns-splash-logo', splashLogoUrl);

    // Load character spritesheets
    const chars = ['player', 'enemy'] as const;
    const anims = ['idle', 'dash', 'shoot', 'sword', 'hit'] as const;
    const frameConfigs: Record<string, { w: number; h: number }> = {
      'player_idle':   { w: 173, h: 233 },
      'player_dash':   { w: 318, h: 164 },
      'player_shoot':  { w: 372, h: 195 },
      'player_sword':  { w: 290, h: 222 },
      'player_hit':    { w: 236, h: 171 },
      'enemy_idle':    { w: 183, h: 251 },
      'enemy_dash':    { w: 345, h: 173 },
      'enemy_shoot':   { w: 379, h: 201 },
      'enemy_sword':   { w: 306, h: 233 },
      'enemy_hit':     { w: 253, h: 177 },
    };

    for (const char of chars) {
      for (const anim of anims) {
        const key = `${char}_${anim}`;
        const cfg = frameConfigs[key];
        this.load.spritesheet(key, `/sprites/animations/${key}.png`, {
          frameWidth: cfg.w,
          frameHeight: cfg.h,
        });
      }
    }
  }

  create(): void {
    // Create Phaser animation configs for each character
    const chars = ['player', 'enemy'] as const;
    const animDefs: Record<string, { prefix: string; start: number; end: number; repeat: number }[]> = {
      player: [
        { prefix: 'idle',  start: 0, end: 3, repeat: -1 },
        { prefix: 'dash',  start: 0, end: 2, repeat: 0 },
        { prefix: 'shoot', start: 0, end: 2, repeat: 0 },
        { prefix: 'sword', start: 0, end: 3, repeat: 0 },
        { prefix: 'hit',   start: 0, end: 2, repeat: 0 },
      ],
      enemy: [
        { prefix: 'idle',  start: 0, end: 3, repeat: -1 },
        { prefix: 'dash',  start: 0, end: 2, repeat: 0 },
        { prefix: 'shoot', start: 0, end: 2, repeat: 0 },
        { prefix: 'sword', start: 0, end: 3, repeat: 0 },
        { prefix: 'hit',   start: 0, end: 2, repeat: 0 },
      ],
    };

    for (const char of chars) {
      for (const def of animDefs[char]) {
        const key = `${char}_${def.prefix}`;
        if (!this.anims.exists(key)) {
          this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers(key, { start: def.start, end: def.end }),
            frameRate: def.prefix === 'idle' ? 6 : 12,
            repeat: def.repeat,
          });
        }
      }
    }

    // Generate procedural textures for projectiles
    this.makeDotTexture('net-strike-dot', 8, 0xffffff);
    this.makeOrbTexture('net-strike-bullet', 18, 0xffe066);
    this.makeOrbTexture('net-strike-cannon', 28, 0xffb347);

    this.scene.start('NetStrikeSplash');
  }

  private makeDotTexture(key: string, size: number, color: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1).fillCircle(size / 2, size / 2, size / 2);
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }

  private makeOrbTexture(key: string, size: number, color: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1).fillCircle(size / 2, size / 2, size / 2);
    graphics.lineStyle(2, 0xffffff, 0.8).strokeCircle(size / 2, size / 2, size / 2 - 2);
    graphics.generateTexture(key, size, size);
    graphics.destroy();
  }
}