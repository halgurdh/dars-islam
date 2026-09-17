import Phaser from 'phaser';
import { createButton, hex, type QuizTheme } from './quiz-kit';
import { createLanguagePicker } from './language-picker';
import type { LangMode } from './locale';

export interface LocaleHooks {
  getLang: () => LangMode;
  setLang: (lang: LangMode) => void;
  detectDefaultLang: () => Promise<void>;
}

export interface MenuDifficulty {
  label: () => string;
  /** Receives the live scene so it can call scene.start('Quiz', cfg) etc. */
  onSelect: (scene: Phaser.Scene) => void;
}

export interface BaseMenuConfig {
  sceneKey?: string;
  theme: QuizTheme;
  fontFamily: string;
  title: () => string;
  tagline: () => string;
  footer: () => string;
  locale: LocaleHooks;
  titleFontSize?: string;
}

export function setupHeaderAndPicker(scene: Phaser.Scene, config: BaseMenuConfig, pickerYFrac: number): void {
  const { width, height } = scene.scale;
  const { theme, fontFamily } = config;
  scene.cameras.main.setBackgroundColor(theme.bg);

  const langBefore = config.locale.getLang();
  void config.locale.detectDefaultLang().then(() => {
    if (scene.scene.isActive() && config.locale.getLang() !== langBefore) scene.scene.restart();
  });

  createLanguagePicker(scene, width / 2, height * pickerYFrac, theme.accent, config.locale.getLang(), (lang) => {
    config.locale.setLang(lang);
    scene.scene.restart();
  });

  scene.add.text(width / 2, height * 0.16, config.title(), {
    fontFamily,
    fontSize: config.titleFontSize ?? '40px',
    fontStyle: 'bold',
    color: hex(theme.accent),
  }).setOrigin(0.5);

  scene.add.text(width / 2, height * 0.23, config.tagline(), {
    fontFamily,
    fontSize: '22px',
    color: theme.textMuted,
    align: 'center',
    wordWrap: { width: width * 0.85 },
  }).setOrigin(0.5);
}

export function addFooter(scene: Phaser.Scene, config: BaseMenuConfig): void {
  const { width, height } = scene.scale;
  scene.add.text(width / 2, height * 0.92, config.footer(), {
    fontFamily: config.fontFamily,
    fontSize: '19px',
    color: config.theme.textMuted,
    align: 'center',
    wordWrap: { width: width * 0.85 },
  }).setOrigin(0.5);
}

export interface DifficultyMenuConfig extends BaseMenuConfig {
  difficulties: MenuDifficulty[];
  buttonWidth?: number;
}

/**
 * The "title + tagline + language picker + a stack of difficulty buttons +
 * footer" layout shared by every tiered quiz-kit game (Number Basics, Times
 * Table Dojo, Shapes & Colors, Counting Fun, Pattern Play, and beyond) — one
 * implementation instead of an ~80-line MenuScene.ts copy-pasted per game.
 * Callers only supply copy, theme and what each button should do.
 */
export function createDifficultyMenuScene(config: DifficultyMenuConfig): typeof Phaser.Scene {
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
          d.onSelect(this);
        });
      });

      addFooter(this, config);
    }
  };
}

export interface SingleStartMenuConfig extends BaseMenuConfig {
  startLabel: () => string;
  onStart: (scene: Phaser.Scene) => void;
  buttonWidth?: number;
}

/**
 * The single-big-button variant (Wonder Why, Kind Hearts): no difficulty
 * tiers, just one pool that reshuffles itself each run.
 */
export function createSingleStartMenuScene(config: SingleStartMenuConfig): typeof Phaser.Scene {
  return class extends Phaser.Scene {
    constructor() {
      super(config.sceneKey ?? 'MenuScene');
    }

    create(): void {
      const { width, height } = this.scale;
      this.cameras.main.setBackgroundColor(config.theme.bg);

      const langBefore = config.locale.getLang();
      void config.locale.detectDefaultLang().then(() => {
        if (this.scene.isActive() && config.locale.getLang() !== langBefore) this.scene.restart();
      });

      createLanguagePicker(this, width / 2, height * 0.62, config.theme.accent, config.locale.getLang(), (lang) => {
        config.locale.setLang(lang);
        this.scene.restart();
      });

      this.add.text(width / 2, height * 0.24, config.title(), {
        fontFamily: config.fontFamily,
        fontSize: config.titleFontSize ?? '42px',
        fontStyle: 'bold',
        color: hex(config.theme.accent),
      }).setOrigin(0.5);

      this.add.text(width / 2, height * 0.33, config.tagline(), {
        fontFamily: config.fontFamily,
        fontSize: '22px',
        color: config.theme.textMuted,
        align: 'center',
        wordWrap: { width: width * 0.85 },
      }).setOrigin(0.5);

      createButton(this, width / 2, height * 0.47, config.buttonWidth ?? 420, 84, config.startLabel(), config.theme, config.fontFamily, () => {
        config.onStart(this);
      });

      addFooter(this, config);
    }
  };
}
