import Phaser from 'phaser';
import {
  getManualRowBounds,
  MANUAL_SHEET_COLUMNS,
  PLAYER_FRAME_DEFINITIONS,
  PLAYER_COLUMN_WIDTH,
  PLAYER_ROW_STARTS,
  type TextureKey,
} from '../spriteSlices';

const splashLogoUrl  = new URL('../../../../shared/splash.png', import.meta.url).href;
const splashAudioUrl = new URL('../../../../shared/splash.mp3', import.meta.url).href;
type AnimationDefinition = {
  name: string;
  tex: TextureKey;
  frames: Array<number | string>;
  fps: number;
  repeat: number;
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('NetStrikeBoot');
  }

  preload(): void {
    this.load.image('ns-splash-logo', splashLogoUrl);
    this.load.audio('splash', splashAudioUrl);

    // Use BASE_URL so paths resolve via wrapper proxy OR the game's own
    // dev server (Vite serves publicDir at ${base}…, not at root /).
    const base = import.meta.env.BASE_URL;
    this.load.image('sprite1', `${base}sprites/sprite1.png`);
    this.load.image('sprite2', `${base}sprites/sprite2.png`);
  }

  create(): void {
    const playerFrameNames = this.registerPlayerFrames();
    const enemyFrameNames = this.registerManualFrames('sprite2', 'enemy');
    const byRow = (frames: string[], row: number): string[] =>
      frames.slice(row * MANUAL_SHEET_COLUMNS, (row + 1) * MANUAL_SHEET_COLUMNS).filter(Boolean);

    const animDefs: AnimationDefinition[] = [
      { name: 'player_idle',  tex: 'sprite1', frames: byRow(playerFrameNames, 0), fps: 8,  repeat: -1 },
      { name: 'player_dash',  tex: 'sprite1', frames: byRow(playerFrameNames, 1), fps: 10, repeat: 0  },
      { name: 'player_shoot', tex: 'sprite1', frames: byRow(playerFrameNames, 2), fps: 10, repeat: 0  },
      { name: 'player_sword', tex: 'sprite1', frames: byRow(playerFrameNames, 3), fps: 10, repeat: 0  },
      { name: 'player_hit',   tex: 'sprite1', frames: byRow(playerFrameNames, 4), fps: 8,  repeat: 0  },
      { name: 'enemy_idle',   tex: 'sprite2', frames: byRow(enemyFrameNames, 0),  fps: 8,  repeat: -1 },
      { name: 'enemy_dash',   tex: 'sprite2', frames: byRow(enemyFrameNames, 1),  fps: 10, repeat: 0  },
      { name: 'enemy_shoot',  tex: 'sprite2', frames: byRow(enemyFrameNames, 2),  fps: 10, repeat: 0  },
      { name: 'enemy_sword',  tex: 'sprite2', frames: byRow(enemyFrameNames, 3),  fps: 10, repeat: 0  },
      { name: 'enemy_hit',    tex: 'sprite2', frames: byRow(enemyFrameNames, 4),  fps: 8,  repeat: 0  },
    ];

    for (const def of animDefs) {
      if (!this.anims.exists(def.name)) {
        this.anims.create({
          key: def.name,
          frames: def.frames.map((frame) => ({ key: def.tex, frame })),
          frameRate: def.fps,
          repeat: def.repeat,
        });
      }
    }

    // Procedural textures for projectiles
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

  private registerManualFrames(textureKey: TextureKey, prefix: 'player' | 'enemy'): string[] {
    const texture = this.textures.get(textureKey);
    const frameNames: string[] = [];
    for (let row = 0; row < PLAYER_ROW_STARTS.length; row += 1) {
      const rowBounds = getManualRowBounds(row);
      if (!rowBounds) {
        continue;
      }
      for (let col = 0; col < MANUAL_SHEET_COLUMNS; col += 1) {
        const frameName = `${prefix}_cell_${row * MANUAL_SHEET_COLUMNS + col}`;
        if (!texture.has(frameName)) {
          texture.add(frameName, 0, col * PLAYER_COLUMN_WIDTH, rowBounds.top, PLAYER_COLUMN_WIDTH, rowBounds.height);
        }
        frameNames.push(frameName);
      }
    }
    return frameNames;
  }

  private registerPlayerFrames(): string[] {
    const texture = this.textures.get('sprite1');

    for (const frame of PLAYER_FRAME_DEFINITIONS) {
      if (!texture.has(frame.name)) {
        texture.add(frame.name, 0, frame.x, frame.y, frame.width, frame.height);
      }
    }

    return PLAYER_FRAME_DEFINITIONS.map((frame) => frame.name);
  }
}
