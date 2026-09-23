// Menu factory for match-kit games — same "title + tagline + language
// picker + tiered buttons + footer" layout as quiz-menu-kit, reusing its
// header/footer/button helpers directly rather than re-implementing them,
// plus a mute toggle (asma-match/memory-match both had one on the menu).
import Phaser from 'phaser';
import { createButton } from './quiz-kit';
import { setupHeaderAndPicker, addFooter, type BaseMenuConfig } from './quiz-menu-kit';
import type { MatchTheme, MatchItem, MatchStrings } from './match-kit';
import { getMatchSfx } from './match-kit';

export interface MatchDifficulty {
  label: () => string;
  pairs: number;
}

export interface MatchMenuConfig extends Omit<BaseMenuConfig, 'theme'> {
  theme: MatchTheme;
  gameId: string;
  items: MatchItem[];
  /** Called at click-time (not once at menu build) so a language switch is reflected. */
  strings: () => MatchStrings;
  difficulties: MatchDifficulty[];
  matchSceneKey?: string;
  soundOnLabel: () => string;
  soundOffLabel: () => string;
  buttonWidth?: number;
}

/**
 * The menu screen shared by every match-kit game — picks a difficulty
 * (pair count), starts the 'Match' scene with a MatchRunConfig, and offers
 * the same language-picker/mute-toggle/footer chrome as the quiz menus.
 */
export function createMatchMenuScene(config: MatchMenuConfig): typeof Phaser.Scene {
  return class extends Phaser.Scene {
    constructor() {
      super(config.sceneKey ?? 'MenuScene');
    }

    create(): void {
      setupHeaderAndPicker(this, config, 0.71);

      const { width, height } = this.scale;
      const sfx = getMatchSfx(config.gameId);

      const startY = height * 0.36;
      const gap = height * 0.1;
      config.difficulties.forEach((d, i) => {
        createButton(this, width / 2, startY + i * gap, config.buttonWidth ?? 380, 76, d.label(), config.theme, config.fontFamily, () => {
          sfx.flip();
          this.scene.start(config.matchSceneKey ?? 'Match', {
            gameId: config.gameId,
            pairs: d.pairs,
            theme: config.theme,
            fontFamily: config.fontFamily,
            strings: config.strings,
            items: config.items,
            menuSceneKey: config.sceneKey,
          });
        });
      });

      const muteLabel = () => (sfx.isMuted() ? config.soundOffLabel() : config.soundOnLabel());
      const muteBtn = createButton(this, width / 2, height * 0.755, 260, 56, muteLabel(), config.theme, config.fontFamily, () => {
        const muted = sfx.toggleMuted();
        muteBtn.text.setText(muted ? config.soundOffLabel() : config.soundOnLabel());
        if (!muted) sfx.flip();
      });

      addFooter(this, config);
    }
  };
}
