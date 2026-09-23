// Menu factory for sequence-kit games — same layout convention as
// quiz-menu-kit/match-menu-kit, reusing the same header/footer/button
// helpers so the three formats look and feel like one family.
import Phaser from 'phaser';
import { createButton } from './quiz-kit';
import { setupHeaderAndPicker, addFooter, type BaseMenuConfig } from './quiz-menu-kit';
import type { SequenceTheme, SequenceStrings, SequenceItem } from './sequence-kit';

export interface SequenceDifficulty {
  label: () => string;
  totalRounds: number;
  generateRound: (index: number) => SequenceItem[];
}

export interface SequenceMenuConfig extends Omit<BaseMenuConfig, 'theme'> {
  theme: SequenceTheme;
  gameId: string;
  /** Called at click-time (not once at menu build) so a language switch is reflected. */
  strings: () => SequenceStrings;
  difficulties: SequenceDifficulty[];
  sequenceSceneKey?: string;
  buttonWidth?: number;
}

/**
 * The menu screen shared by every sequence-kit game — picks a difficulty
 * tier and starts the 'Sequence' scene with a SequenceRunConfig.
 */
export function createSequenceMenuScene(config: SequenceMenuConfig): typeof Phaser.Scene {
  return class extends Phaser.Scene {
    constructor() {
      super(config.sceneKey ?? 'MenuScene');
    }

    create(): void {
      setupHeaderAndPicker(this, config, 0.795);

      const { width, height } = this.scale;
      const startY = height * 0.4;
      const gap = height * 0.11;
      config.difficulties.forEach((d, i) => {
        createButton(this, width / 2, startY + i * gap, config.buttonWidth ?? 380, 84, d.label(), config.theme, config.fontFamily, () => {
          this.scene.start(config.sequenceSceneKey ?? 'Sequence', {
            gameId: config.gameId,
            totalRounds: d.totalRounds,
            theme: config.theme,
            fontFamily: config.fontFamily,
            strings: config.strings,
            generateRound: d.generateRound,
            menuSceneKey: config.sceneKey,
          });
        });
      });

      addFooter(this, config);
    }
  };
}
