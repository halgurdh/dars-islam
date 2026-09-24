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
  type LocaleHooks,
} from './quiz-menu-kit';
import type { QuizQuestion, QuizStrings } from './quiz-kit';
import type { MatchTheme, MatchItem, MatchStrings } from './match-kit';
import { getMatchSfx } from './match-kit';
import type { SequenceTheme, SequenceStrings, SequenceItem } from './sequence-kit';
import type { FlashcardTheme, FlashcardItem, FlashcardStrings } from './flashcard-kit';
import { speak } from './tts';
import { asTrueFalseGenerator } from './quiz-variants';
import { modeVariantStrings } from './mode-variant-i18n';
import type { LangMode } from './locale';

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
          () => d.onSelect(this, config.locale)
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

export interface QuizModeOptions {
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
}

export function quizMode(opts: QuizModeOptions): GameMode {
  return {
    id: opts.id ?? 'quiz',
    label: opts.label,
    icon: opts.icon,
    difficulties: opts.difficulties.map((d) => ({
      label: d.label,
      onSelect: (scene: Phaser.Scene, locale: LocaleHooks) => {
        scene.scene.start(opts.quizSceneKey ?? 'Quiz', {
          gameId: opts.gameId,
          totalQuestions: d.totalQuestions,
          theme: opts.theme,
          fontFamily: opts.fontFamily,
          strings: opts.strings,
          generateQuestion: d.generateQuestion,
          menuSceneKey: opts.homeSceneKey ?? 'MenuScene',
          timeLimitMs: d.timeLimitMs,
          locale,
        });
      },
    })),
  };
}

// ── Shared variant modes ────────────────────────────────────────────────
// The multi-mode set every subject/language game offers beyond its core
// Quiz/Match/Sequence: True/False, Fill-in-the-Blank, Review (flashcards),
// Listen & Identify, Beat the Clock and Practice. A game describes itself
// ONCE as a VariantBase (ids, theme, font, chrome strings, difficulty
// tiers) and then adds each mode with a single call supplying only its
// content generator — labels/icons/flashcard chrome come from the shared
// mode-variant-i18n, driven by the game's own getLang.

export interface VariantTier {
  label: () => string;
  totalQuestions: number;
}

export interface VariantBase {
  gameId: string;
  theme: QuizTheme & Partial<FlashcardTheme>;
  fontFamily: string;
  getLang: () => LangMode;
  /** The game's quiz chrome (round/score/menu/...). Review mode reuses its
   *  menu/wellDone/playAgain/backToMenu. */
  strings: () => QuizStrings;
  tiers: VariantTier[];
  homeSceneKey?: string;
}

/** A question generator; `tier` is the index of the picked difficulty, for
 *  games whose content depends on it (most ignore it). */
export type VariantGenerator = (index: number, tier: number) => QuizQuestion;

export interface VariantOverrides {
  /** Per-mode font (e.g. Arabic script for True/False, Latin for Fill-in). */
  fontFamily?: string;
  /** Replaces the shared label, for a game-specific wording. */
  label?: () => string;
}

function variantQuiz(
  base: VariantBase,
  id: string,
  icon: string,
  label: () => string,
  generate: VariantGenerator,
  o: VariantOverrides = {}
): QuizModeOptions {
  return {
    id,
    label: o.label ?? label,
    icon,
    gameId: base.gameId,
    theme: base.theme,
    fontFamily: o.fontFamily ?? base.fontFamily,
    strings: base.strings,
    homeSceneKey: base.homeSceneKey,
    difficulties: base.tiers.map((tier, i) => ({
      label: tier.label,
      totalQuestions: tier.totalQuestions,
      generateQuestion: (index: number) => generate(index, i),
    })),
  };
}

/** True/False from a game's own statement generator — anything returning
 *  toTrueFalseQuestion(...) (choice 0 = true). The choices are relabeled
 *  here with the shared localized True/False labels. */
export function trueFalseMode(base: VariantBase, generate: VariantGenerator, o?: VariantOverrides): GameMode {
  const s = modeVariantStrings(base.getLang);
  const relabeled: VariantGenerator = (index, tier) => ({
    ...generate(index, tier),
    choices: [s().trueLabel, s().falseLabel],
  });
  return quizMode(variantQuiz(base, 'truefalse', '✅', () => s().modeTrueFalse, relabeled, o));
}

export function fillBlankMode(base: VariantBase, generate: VariantGenerator, o?: VariantOverrides): GameMode {
  const s = modeVariantStrings(base.getLang);
  return quizMode(variantQuiz(base, 'fillblank', '✏️', () => s().modeFillBlank, generate, o));
}

/** Listen & Identify: each question's `speak` audio auto-plays instead of a
 *  written prompt; the player picks the matching written choice. */
export function listenIdentifyMode(base: VariantBase, generate: VariantGenerator, o?: VariantOverrides): GameMode {
  const s = modeVariantStrings(base.getLang);
  const q = variantQuiz(base, 'listen', '🔊', () => s().modeListen, generate, o);
  return listenMode({ ...q, replayLabel: () => s().listenReplay });
}

/** Review: a flashcard deck of the game's items (single "Start" entry). */
export function reviewMode(base: VariantBase, cards: () => FlashcardItem[], o?: VariantOverrides): GameMode {
  const s = modeVariantStrings(base.getLang);
  return flashcardMode({
    label: o?.label ?? (() => s().modeReview),
    icon: '🗂️',
    gameId: base.gameId,
    theme: { cardFront: base.theme.panel, ...base.theme },
    fontFamily: o?.fontFamily ?? base.fontFamily,
    homeSceneKey: base.homeSceneKey,
    strings: () => {
      const q = base.strings();
      return {
        menu: q.menu,
        progress: s().reviewProgress,
        hear: s().hear,
        knowIt: s().knowIt,
        stillLearning: s().stillLearning,
        wellDone: q.wellDone,
        roundSummary: s().reviewSummary,
        playAgain: q.playAgain,
        backToMenu: q.backToMenu,
      };
    },
    difficulties: [{ label: () => s().reviewStart, cards }],
  });
}

// ── Variants derived from a game's existing quiz ────────────────────────
// For generated-content games (math etc.) that have no item bank to build
// statements from: these take the SAME options object the game passes to
// quizMode() and reshape its questions.

/** True/False: each generated question shows the problem plus one candidate
 *  answer (right or wrong), and the player judges it. */
export function trueFalseQuizMode(base: QuizModeOptions, getLang: () => LangMode): GameMode {
  const s = modeVariantStrings(getLang);
  return quizMode({
    ...base,
    id: 'truefalse',
    label: () => s().modeTrueFalse,
    icon: '✅',
    difficulties: base.difficulties.map((d) => ({
      ...d,
      generateQuestion: asTrueFalseGenerator(d.generateQuestion, () => ({
        claim: s().answerIs,
        trueLabel: s().trueLabel,
        falseLabel: s().falseLabel,
      })),
    })),
  });
}

/** Beat the Clock: the same quiz with a per-question countdown. `limitsMs`
 *  is per difficulty tier (last entry reused if there are more tiers). */
export function timedQuizMode(
  base: QuizModeOptions,
  getLang: () => LangMode,
  limitsMs: number[] = [20_000, 15_000, 10_000]
): GameMode {
  const s = modeVariantStrings(getLang);
  return quizMode({
    ...base,
    id: 'timed',
    label: () => s().modeTimed,
    icon: '⏱️',
    difficulties: base.difficulties.map((d, i) => ({
      ...d,
      timeLimitMs: limitsMs[Math.min(i, limitsMs.length - 1)],
    })),
  });
}

/** Practice: the inverse of timedQuizMode — for a game whose main quiz is
 *  already timed, the same questions with no countdown. */
export function practiceQuizMode(base: QuizModeOptions, getLang: () => LangMode): GameMode {
  const s = modeVariantStrings(getLang);
  return quizMode({
    ...base,
    id: 'practice',
    label: () => s().modePractice,
    icon: '🎯',
    difficulties: base.difficulties.map((d) => ({ ...d, timeLimitMs: undefined })),
  });
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
  items: () => MatchItem[];
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
      onSelect: (scene: Phaser.Scene, locale: LocaleHooks) => {
        getMatchSfx(opts.gameId).flip();
        scene.scene.start(opts.matchSceneKey ?? 'Match', {
          gameId: opts.gameId,
          pairs: d.pairs,
          theme: opts.theme,
          fontFamily: opts.fontFamily,
          strings: opts.strings,
          items: opts.items(),
          menuSceneKey: opts.homeSceneKey ?? 'MenuScene',
          locale,
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
      onSelect: (scene: Phaser.Scene, locale: LocaleHooks) => {
        scene.scene.start(opts.sequenceSceneKey ?? 'Sequence', {
          gameId: opts.gameId,
          totalRounds: d.totalRounds,
          theme: opts.theme,
          fontFamily: opts.fontFamily,
          strings: opts.strings,
          generateRound: d.generateRound,
          menuSceneKey: opts.homeSceneKey ?? 'MenuScene',
          locale,
        });
      },
    })),
  };
}

// "Listen & Identify" and "Fill-in-the-Blank" both reuse QuizScene as-is —
// Fill-in-the-Blank is just quizMode() called again with a blank-style
// prompt, and "True/False" is the same trick with choices fixed to
// [trueLabel, falseLabel]. Neither needs a builder here; a game just calls
// quizMode() a second/third time with a different generateQuestion and mode
// id. Listen & Identify is the one variant that needs real wiring (it plays
// audio instead of showing the prompt as text), via QuizScene's
// onQuestionShown/replayLabel hooks — hence this one extra builder.

export interface ListenModeDifficulty {
  label: () => string;
  totalQuestions: number;
  /** Each returned QuizQuestion must set `speak` — the audio to auto-play,
   *  usually the Arabic text the player must identify from the (written,
   *  non-Arabic) choices on screen. */
  generateQuestion: (index: number) => QuizQuestion;
}

export function listenMode(opts: {
  id?: string;
  label: () => string;
  icon?: string;
  gameId: string;
  theme: QuizTheme;
  fontFamily: string;
  strings: () => QuizStrings;
  /** Shown as the tap-to-replay prompt, e.g. "🔊 Tap to hear again". */
  replayLabel: () => string;
  difficulties: ListenModeDifficulty[];
  quizSceneKey?: string;
  homeSceneKey?: string;
}): GameMode {
  return {
    id: opts.id ?? 'listen',
    label: opts.label,
    icon: opts.icon,
    difficulties: opts.difficulties.map((d) => ({
      label: d.label,
      onSelect: (scene: Phaser.Scene, locale: LocaleHooks) => {
        scene.scene.start(opts.quizSceneKey ?? 'Quiz', {
          gameId: opts.gameId,
          totalQuestions: d.totalQuestions,
          theme: opts.theme,
          fontFamily: opts.fontFamily,
          strings: opts.strings,
          generateQuestion: d.generateQuestion,
          replayLabel: opts.replayLabel,
          onQuestionShown: (question: QuizQuestion) => {
            if (question.speak) void speak(question.speak.text, question.speak.lang);
          },
          menuSceneKey: opts.homeSceneKey ?? 'MenuScene',
          locale,
        });
      },
    })),
  };
}

export interface FlashcardModeDifficulty {
  label: () => string;
  /** A function, not a plain array — called fresh each time this
   *  difficulty is selected, so the deck's text picks up the *current*
   *  language rather than being baked in at module-load time. */
  cards: () => FlashcardItem[];
}

export function flashcardMode(opts: {
  id?: string;
  label: () => string;
  icon?: string;
  gameId: string;
  theme: FlashcardTheme;
  fontFamily: string;
  strings: () => FlashcardStrings;
  difficulties: FlashcardModeDifficulty[];
  flashcardSceneKey?: string;
  homeSceneKey?: string;
}): GameMode {
  return {
    id: opts.id ?? 'flashcard',
    label: opts.label,
    icon: opts.icon,
    difficulties: opts.difficulties.map((d) => ({
      label: d.label,
      onSelect: (scene: Phaser.Scene) => {
        scene.scene.start(opts.flashcardSceneKey ?? 'Flashcard', {
          gameId: opts.gameId,
          theme: opts.theme,
          fontFamily: opts.fontFamily,
          strings: opts.strings(),
          cards: d.cards(),
          menuSceneKey: opts.homeSceneKey ?? 'MenuScene',
        });
      },
    })),
  };
}

export { hex };
