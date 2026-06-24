import Phaser from 'phaser';
import {
  ENEMY_FRAME_DEFINITIONS,
  MANUAL_SHEET_COLUMNS,
  PLAYER_FRAME_DEFINITIONS,
} from '../spriteSlices';

const splashLogoUrl  = new URL('../../../../shared/splash.png', import.meta.url).href;
const splashAudioUrl = new URL('../../../../shared/splash.mp3', import.meta.url).href;
type AnimationDefinition = {
  name: string;
  frames: string[];
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
    const playerFrameNames = this.registerManualFrames(PLAYER_FRAME_DEFINITIONS);
    const enemyFrameNames = this.registerManualFrames(ENEMY_FRAME_DEFINITIONS);
    const still = (frames: string[], row: number): string[] => {
      const frame = frames[row * MANUAL_SHEET_COLUMNS];
      return frame ? [frame] : [];
    };

    const animDefs: AnimationDefinition[] = [
      { name: 'player_idle',  frames: still(playerFrameNames, 0), fps: 1, repeat: -1 },
      { name: 'player_dash',  frames: still(playerFrameNames, 1), fps: 1, repeat: 0  },
      { name: 'player_shoot', frames: still(playerFrameNames, 2), fps: 1, repeat: 0  },
      { name: 'player_sword', frames: still(playerFrameNames, 3), fps: 1, repeat: 0  },
      { name: 'player_hit',   frames: still(playerFrameNames, 4), fps: 1, repeat: 0  },
      { name: 'enemy_idle',   frames: still(enemyFrameNames, 0),  fps: 1, repeat: -1 },
      { name: 'enemy_dash',   frames: still(enemyFrameNames, 1),  fps: 1, repeat: 0  },
      { name: 'enemy_shoot',  frames: still(enemyFrameNames, 2),  fps: 1, repeat: 0  },
      { name: 'enemy_sword',  frames: still(enemyFrameNames, 3),  fps: 1, repeat: 0  },
      { name: 'enemy_hit',    frames: still(enemyFrameNames, 4),  fps: 1, repeat: 0  },
    ];

    for (const def of animDefs) {
      if (!this.anims.exists(def.name)) {
        this.anims.create({
          key: def.name,
          frames: def.frames.map((frame) => ({ key: frame })),
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

  private registerManualFrames(frames: typeof PLAYER_FRAME_DEFINITIONS): string[] {
    for (const frame of frames) {
      if (!this.textures.exists(frame.name)) {
        this.createMaskedFrameTexture(frame);
      }
    }
    return frames.map((frame) => frame.name);
  }

  private createMaskedFrameTexture(frame: (typeof PLAYER_FRAME_DEFINITIONS)[number]): void {
    const sourceImage = this.textures.get(frame.tex).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      return;
    }

    context.drawImage(sourceImage, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);

    const imageData = context.getImageData(0, 0, frame.width, frame.height);
    const data = imageData.data;
    const background = this.sampleFrameBackground(data, frame.width, frame.height);
    for (let i = 0; i < data.length; i += 4) {
      if (!this.isSpritePixel(data[i], data[i + 1], data[i + 2], data[i + 3], background)) {
        data[i + 3] = 0;
      }
    }
    const row = this.getFrameRow(frame.name);
    if (row !== 0) {
      this.removeStrayComponents(data, frame.width, frame.height, row);
    }
    context.putImageData(imageData, 0, 0);
    this.textures.addCanvas(frame.name, canvas);
  }

  private removeStrayComponents(data: Uint8ClampedArray, width: number, height: number, row: number): void {
    const visited = new Uint8Array(width * height);
    const components: Array<{ pixels: number[]; area: number; touchesEdge: boolean }> = [];

    for (let start = 0; start < visited.length; start += 1) {
      if (visited[start] || data[start * 4 + 3] === 0) {
        continue;
      }

      const stack = [start];
      const pixels: number[] = [];
      let touchesEdge = false;
      visited[start] = 1;

      while (stack.length > 0) {
        const index = stack.pop()!;
        const x = index % width;
        const y = Math.floor(index / width);
        pixels.push(index);

        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          touchesEdge = true;
        }

        const neighbors = [index - 1, index + 1, index - width, index + width];
        for (const neighbor of neighbors) {
          if (neighbor < 0 || neighbor >= visited.length || visited[neighbor] || data[neighbor * 4 + 3] === 0) {
            continue;
          }

          const neighborX = neighbor % width;
          if ((neighbor === index - 1 && neighborX !== x - 1) || (neighbor === index + 1 && neighborX !== x + 1)) {
            continue;
          }

          visited[neighbor] = 1;
          stack.push(neighbor);
        }
      }

      components.push({ pixels, area: pixels.length, touchesEdge });
    }

    const maxArea = Math.max(0, ...components.map((component) => component.area));
    const minMeaningfulArea = Math.max(row === 0 ? 18 : 36, Math.floor(maxArea * (row === 0 ? 0.015 : 0.035)));

    for (const component of components) {
      const isLikelyBleed = component.touchesEdge && component.area < maxArea * (row === 0 ? 0.12 : 0.22);
      const isNoise = component.area < minMeaningfulArea;
      if (!isLikelyBleed && !isNoise) {
        continue;
      }

      for (const pixel of component.pixels) {
        data[pixel * 4 + 3] = 0;
      }
    }
  }

  private getFrameRow(frameName: string): number {
    const match = frameName.match(/_cell_(\d+)$/);
    if (!match) {
      return -1;
    }

    return Math.floor(Number(match[1]) / MANUAL_SHEET_COLUMNS);
  }

  private sampleFrameBackground(data: Uint8ClampedArray, width: number, height: number): { red: number; green: number; blue: number } {
    const cornerIndexes = [
      0,
      width - 1,
      (height - 1) * width,
      height * width - 1,
    ];

    const colors = cornerIndexes.map((pixel) => {
      const index = pixel * 4;
      return { red: data[index], green: data[index + 1], blue: data[index + 2] };
    });

    return {
      red: Math.round(colors.reduce((sum, color) => sum + color.red, 0) / colors.length),
      green: Math.round(colors.reduce((sum, color) => sum + color.green, 0) / colors.length),
      blue: Math.round(colors.reduce((sum, color) => sum + color.blue, 0) / colors.length),
    };
  }

  private isSpritePixel(
    red: number,
    green: number,
    blue: number,
    alpha: number,
    background: { red: number; green: number; blue: number },
  ): boolean {
    if (alpha < 24) {
      return false;
    }

    const high = Math.max(red, green, blue);
    const low = Math.min(red, green, blue);
    const saturation = high - low;
    const backgroundDelta = Math.abs(red - background.red) + Math.abs(green - background.green) + Math.abs(blue - background.blue);

    return backgroundDelta > 34 || saturation > 58 || high < 56 || high > 202;
  }
}
