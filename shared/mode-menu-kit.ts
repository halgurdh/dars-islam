// Menu factory that lets one game offer several *mechanics* (Quiz / Match /
// Sequence / ...) from a single home screen, instead of each game being
// locked to one kit. Reuses quiz-menu-kit's header/footer/button chrome and
// match-kit/quiz-kit/sequence-kit's gameplay scenes unmodified — this file
// only adds a row of mode tabs above the existing difficulty-button stack,
// and swaps which difficulty list is shown when a tab is tapped.
import Phaser from 'phaser';
import { createButton, hex, type QuizTheme } from './quiz-kit';
import {
  setupHeaderAndPicker,
  addFooter,
  type BaseMenuConfig,
  type MenuDifficulty,
} from './quiz-menu-kit';
import type { QuizQuestion, QuizStrings } from './quiz-kit';
import type { MatchTheme, MatchItem, MatchStrings } from './match-kit';
import { getMatchSfx } from './match-kit';
import type { SequenceTheme, SequenceStrings, SequenceItem } from './sequence-kit';

/** Combined theme shape so one game can define a single theme object usable by every mode. */
export type GameTheme = QuizTheme & Partial<MatchTheme> & Partial<SequenceTheme>;

export interface GameMode {
  id: string;
  label: () => string;
  icon?: string;
  difficulties: MenuDifficulty[];
}

export interface ModeMenuConfig extends Omit<BaseMenuConfig, 'theme'> {
  theme: GameTheme;
  modes: GameMode[];
  buttonWidth?: number;
}

/**
 * Home screen: title + tagline + language picker + a row of mode tabs +
 * that mode's difficulty buttons + footer. Picking a tab swaps the
 * difficulty list in place; picking a difficulty starts that mode's
 * gameplay scene (wired by the caller via quizMode/matchMode/sequenceMode).
 */
export function createModeMenuScene(config: ModeMenuConfig): typeof Phaser.Scene {
  return class extends Phaser.Scene {
    private modeIndex = 0;
    private tabViews: { container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics }[] = [];
    private diffViews: { container: Phaser.GameObjects.Container }[] = [];

    constructor() {
      super(config.sceneKey ?? 'MenuScene');
    }

    create(): void {
      this.modeIndex = 0;
      setupHeaderAndPicker(this, config as BaseMenuConfig, 0.83);
      this.renderTabs();
      this.renderDifficulties();
      addFooter(this, config as BaseMenuConfig);
    }

    private renderTabs(): void {
      const { width } = this.scale;
      const theme = config.theme;
      const n = config.modes.length;
      const gap = 10;
      const tabW = Math.min(220, (width * 0.92 - gap * (n - 1)) / n);
      const totalW = n * tabW + (n - 1) * gap;
      const startX = width / 2 - totalW / 2 + tabW / 2;
      const y = this.scale.height * 0.33;

      this.tabViews.forEach((v) => v.container.destroy());
      this.tabViews = [];

      config.modes.forEach((m, i) => {
        const x = startX + i * (tabW + gap);
        const container = this.add.container(x, y);
        const bg = this.add.graphics();
        const text = this.add.text(0, 0, (m.icon ? `${m.icon} ` : '') + m.label(), {
          fontFamily: config.fontFamily,
          fontSize: '19px',
          color: theme.text,
          align: 'center',
          wordWrap: { width: tabW * 0.9 },
        }).setOrigin(0.5);

        this.paintTab(bg, tabW, i === this.modeIndex);
        container.add([bg, text]);
        container.setSize(tabW, 56);
        container.setInteractive({ useHandCursor: true });
        container.on('pointerdown', () => {
          if (this.modeIndex === i) return;
          this.modeIndex = i;
          this.renderTabs();
          this.renderDifficulties();
        });
        this.tabViews.push({ container, bg });
      });
    }

    private paintTab(bg: Phaser.GameObjects.Graphics, w: number, active: boolean): void {
      const theme = config.theme;
      bg.clear();
      bg.fillStyle(theme.panel, 1);
      bg.fillRoundedRect(-w / 2, -28, w, 56, 12);
      bg.lineStyle(active ? 3 : 2, theme.accent, active ? 1 : 0.4);
      bg.strokeRoundedRect(-w / 2, -28, w, 56, 12);
    }

    private renderDifficulties(): void {
      this.diffViews.forEach((v) => v.container.destroy());
      this.diffViews = [];

      const { width, height } = this.scale;
      const startY = height * 0.46;
      const gap = height * 0.1;
      const mode = config.modes[this.modeIndex];

      mode.difficulties.forEach((d, i) => {
        const btn = createButton(
          this,
          width / 2,
          startY + i * gap,
          config.buttonWidth ?? 380,
          76,
          d.label(),
          config.theme,
          config.fontFamily,
          () => d.onSelect(this)
        );
        this.diffViews.push(btn);
      });
    }
  };
}

// ── Per-mechanic GameMode builders ──────────────────────────────────────
// Thin adapters so a game only supplies its content + difficulty tiers;
// these wire the onSelect -> scene.start(...) calls with the right
// RunConfig shape for each underlying kit, and point menuSceneKey back at
// the mode-select home screen so "back to menu" always lands there.

export interface QuizModeDifficulty {
  label: () => string;
  totalQuestions: number;
  generateQuestion: (index: number) => QuizQuestion;
  timeLimitMs?: number;
}

export function quizMode(opts: {
  id?: string;
  label: () => string;
  icon?: string;
  gameId: string;
  theme: QuizTheme;
  fontFamily: string;
  strings: () => QuizStrings;
  difficulties: QuizModeDifficulty[];
  quizSceneKey?: string;
  homeSceneKey?: string;
}): GameMode {
  return {
    id: opts.id ?? 'quiz',
    label: opts.label,
    icon: opts.icon,
    difficulties: opts.difficulties.map((d) => ({
      label: d.label,
      onSelect: (scene: Phaser.Scene) => {
        scene.scene.start(opts.quizSceneKey ?? 'Quiz', {
          gameId: opts.gameId,
          totalQuestions: d.totalQuestions,
          theme: opts.theme,
          fontFamily: opts.fontFamily,
          strings: opts.strings(),
          generateQuestion: d.generateQuestion,
          menuSceneKey: opts.homeSceneKey ?? 'MenuScene',
          timeLimitMs: d.timeLimitMs,
        });
      },
    })),
  };
}

export interface MatchModeDifficulty {
  label: () => string;
  pairs: number;
}

export function matchMode(opts: {
  id?: string;
  label: () => string;
  icon?: string;
  gameId: string;
  theme: MatchTheme;
  fontFamily: string;
  strings: () => MatchStrings;
  items: MatchItem[];
  difficulties: MatchModeDifficulty[];
  matchSceneKey?: string;
  homeSceneKey?: string;
}): GameMode {
  return {
    id: opts.id ?? 'match',
    label: opts.label,
    icon: opts.icon,
    difficulties: opts.difficulties.map((d) => ({
      label: d.label,
      onSelect: (scene: Phaser.Scene) => {
        getMatchSfx(opts.gameId).flip();
        scene.scene.start(opts.matchSceneKey ?? 'Match', {
          gameId: opts.gameId,
          pairs: d.pairs,
          theme: opts.theme,
          fontFamily: opts.fontFamily,
          strings: opts.strings(),
          items: opts.items,
          menuSceneKey: opts.homeSceneKey ?? 'MenuScene',
        });
      },
    })),
  };
}

export interface SequenceModeDifficulty {
  label: () => string;
  totalRounds: number;
  generateRound: (index: number) => SequenceItem[];
}

export function sequenceMode(opts: {
  id?: string;
  label: () => string;
  icon?: string;
  gameId: string;
  theme: SequenceTheme;
  fontFamily: string;
  strings: () => SequenceStrings;
  difficulties: SequenceModeDifficulty[];
  sequenceSceneKey?: string;
  homeSceneKey?: string;
}): GameMode {
  return {
    id: opts.id ?? 'sequence',
    label: opts.label,
    icon: opts.icon,
    difficulties: opts.difficulties.map((d) => ({
      label: d.label,
      onSelect: (scene: Phaser.Scene) => {
        scene.scene.start(opts.sequenceSceneKey ?? 'Sequence', {
          gameId: opts.gameId,
          totalRounds: d.totalRounds,
          theme: opts.theme,
          fontFamily: opts.fontFamily,
          strings: opts.strings(),
          generateRound: d.generateRound,
          menuSceneKey: opts.homeSceneKey ?? 'MenuScene',
        });
      },
    })),
  };
}

export { hex };
