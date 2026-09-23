// Shared memory-match engine — the flip-two-cards-and-check round loop
// (HUD, board layout, flip/match/mismatch feedback, completion panel,
// PlayerProgress/ProgressBar wiring) extracted from asma-match/memory-match
// so new "match this to that" subject games (country↔capital, word↔synonym,
// term↔definition, ...) can reuse it instead of copy-pasting a whole scene.
// Same consolidation reasoning as quiz-kit.ts: the mechanism is identical,
// only the pair content and theme differ.
import Phaser from 'phaser';
import { PlayerProgress } from './player-progress';
import { ProgressBar } from './progress-bar';
import type { QuizTheme } from './quiz-kit';
import { registerActiveGameLocale, unregisterActiveGameLocale } from './active-game-locale';
import { createLanguagePicker } from './language-picker';
import type { LocaleHooks } from './quiz-menu-kit';

const progressBar = new ProgressBar();

export function hex(n: number): string {
  return '#' + n.toString(16).padStart(6, '0');
}

// Extends QuizTheme (rather than a standalone shape) purely so the same
// theme object is structurally compatible with quiz-kit's createButton and
// quiz-menu-kit's header/footer helpers, which match-menu-kit.ts reuses
// as-is instead of re-implementing button/header chrome a third time.
// correct/wrong/choiceBg go unused by the match board itself.
export interface MatchTheme extends QuizTheme {
  cardBack: number;
  cardFront: number;
}

/** One matchable pair — sideA and sideB are the two cards that belong together. */
export interface MatchItem {
  id: number;
  sideA: string;
  sideB: string;
}

export interface MatchStrings {
  menu: string;
  moves: (n: number) => string;
  wellDone: string;
  roundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;
}

export interface MatchRunConfig {
  gameId: string;
  pairs: number;
  theme: MatchTheme;
  fontFamily: string;
  /** A function, not a resolved object — see quiz-kit.ts's QuizRunConfig.strings for why. */
  strings: () => MatchStrings;
  items: MatchItem[];
  menuSceneKey?: string;
  /** Optional: this game's own language hooks, enabling mid-game switching. */
  locale?: LocaleHooks;
}

// ── Per-game persistent "learned" set + mute preference ─────────────────
// Centralized here (rather than a per-game systems/Progress.ts +
// systems/Sfx.ts copy) but keyed and memoized by gameId, so every scene of
// the same game shares one instance — matching the module-singleton
// behavior the original per-game files had.

class MatchProgressStore {
  private key: string;
  private learned: Set<number>;

  constructor(gameId: string) {
    this.key = `${gameId}:match-learned`;
    this.learned = this.load();
  }

  private load(): Set<number> {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
    } catch {
      return new Set();
    }
  }

  markLearned(ids: number[]): void {
    for (const id of ids) this.learned.add(id);
    try {
      localStorage.setItem(this.key, JSON.stringify([...this.learned]));
    } catch {
      /* storage unavailable — progress just won't persist */
    }
  }

  has(id: number): boolean {
    return this.learned.has(id);
  }

  count(): number {
    return this.learned.size;
  }
}

const progressStores = new Map<string, MatchProgressStore>();

function getProgress(gameId: string): MatchProgressStore {
  let store = progressStores.get(gameId);
  if (!store) {
    store = new MatchProgressStore(gameId);
    progressStores.set(gameId, store);
  }
  return store;
}

// Minimal, self-contained sound-effect engine — no music, no audio files,
// just a couple of short synthesized tones, quiet by default, with a
// persistent per-game mute toggle. Same design as memory-match's Sfx.ts.
class MatchSfxEngine {
  private ctx: AudioContext | null = null;
  private muteKey: string;
  private muted: boolean;

  constructor(gameId: string) {
    this.muteKey = `${gameId}:match-muted`;
    this.muted = localStorage.getItem(this.muteKey) === '1';
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, durationMs: number, volume: number): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.02);
  }

  flip(): void { this.tone(420, 80, 0.05); }
  match(): void { this.tone(660, 100, 0.06); setTimeout(() => this.tone(880, 120, 0.06), 90); }
  mismatch(): void { this.tone(220, 90, 0.04); }
  complete(): void {
    this.tone(523, 100, 0.06);
    setTimeout(() => this.tone(659, 100, 0.06), 100);
    setTimeout(() => this.tone(784, 160, 0.06), 200);
  }

  isMuted(): boolean { return this.muted; }
  toggleMuted(): boolean {
    this.muted = !this.muted;
    localStorage.setItem(this.muteKey, this.muted ? '1' : '0');
    return this.muted;
  }
}

const sfxInstances = new Map<string, MatchSfxEngine>();

export function getMatchSfx(gameId: string): MatchSfxEngine {
  let sfx = sfxInstances.get(gameId);
  if (!sfx) {
    sfx = new MatchSfxEngine(gameId);
    sfxInstances.set(gameId, sfx);
  }
  return sfx;
}

type TileData = { tileId: number; pairId: number; side: 'a' | 'b'; label: string };

interface TileView {
  data: TileData;
  container: Phaser.GameObjects.Container;
  back: Phaser.GameObjects.Graphics;
  front: Phaser.GameObjects.Graphics;
  frontText: Phaser.GameObjects.Text;
  faceUp: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class MatchScene extends Phaser.Scene {
  private cfg!: MatchRunConfig;
  private tiles: TileView[] = [];
  private flipped: TileView[] = [];
  private locked = false;
  private moves = 0;
  private matchesFound = 0;
  private startTime = 0;
  private menuBtn!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private overlayShown = false;
  private langPicker?: Phaser.GameObjects.Container;

  constructor(key = 'Match') {
    super(key);
  }

  init(data: MatchRunConfig): void {
    this.cfg = data;
    this.tiles = [];
    this.flipped = [];
    this.locked = false;
    this.moves = 0;
    this.matchesFound = 0;
    this.overlayShown = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(this.cfg.theme.bg);
    this.startTime = this.time.now;
    this.buildHud();
    this.buildBoard();

    if (this.cfg.locale) {
      const hooks = {
        setLang: this.cfg.locale.setLang,
        refreshChrome: () => this.refreshHud(),
      };
      registerActiveGameLocale(hooks);
      this.events.once('shutdown', () => unregisterActiveGameLocale(hooks));
    }
  }

  update(): void {
    if (this.overlayShown) return;
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    this.timerText.setText(`${mm}:${ss}`);
  }

  // The wrapper chrome (Exit Game link, fullscreen toggle, and the
  // ProgressBar's floating level/streak pill) is fixed DOM overlaid in the
  // top corners of the canvas, so in-canvas HUD and board content must stay
  // clear of it — same HUD_TOP convention as asma-match/memory-match.
  private static readonly HUD_TOP = 300;
  // Bumped from +90 to +135 to leave room for the language picker row
  // between the timer text and the board; buildBoard()'s cellH is derived
  // from (boardBottom - boardTop), so tiles just get proportionally a
  // little shorter rather than overlapping anything.
  static readonly BOARD_TOP = MatchScene.HUD_TOP + 135;
  private static readonly LANG_PICKER_Y = MatchScene.HUD_TOP + 95;
  private static readonly AUTO_ADVANCE_MS = 2200;

  private buildHud(): void {
    const { width } = this.scale;
    const { theme, fontFamily, gameId } = this.cfg;
    const strings = this.cfg.strings();
    const sfx = getMatchSfx(gameId);
    const y = MatchScene.HUD_TOP;

    this.menuBtn = this.add.text(70, y, strings.menu, {
      fontFamily,
      fontSize: '16px',
      color: theme.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.menuBtn.on('pointerdown', () => this.scene.start(this.cfg.menuSceneKey ?? 'MenuScene'));

    const muteBtn = this.add.text(width - 70, y, sfx.isMuted() ? '🔇' : '🔈', {
      fontFamily,
      fontSize: '18px',
      color: theme.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      const muted = sfx.toggleMuted();
      muteBtn.setText(muted ? '🔇' : '🔈');
      if (!muted) sfx.flip();
    });

    this.movesText = this.add.text(width / 2, y + 34, strings.moves(0), {
      fontFamily,
      fontSize: '16px',
      color: theme.text,
    }).setOrigin(0.5);

    this.timerText = this.add.text(width / 2, y + 58, '00:00', {
      fontFamily,
      fontSize: '14px',
      color: theme.textMuted,
    }).setOrigin(0.5);

    this.renderLangPicker();
  }

  private renderLangPicker(): void {
    if (!this.cfg.locale) return;
    this.langPicker?.destroy();
    this.langPicker = createLanguagePicker(
      this,
      this.scale.width / 2,
      MatchScene.LANG_PICKER_Y,
      this.cfg.theme.accent,
      this.cfg.locale.getLang(),
      (lang) => {
        this.cfg.locale!.setLang(lang);
        this.refreshHud();
      }
    );
  }

  // Safe to call mid-round: only touches independent HUD text objects, never
  // this.tiles/this.flipped/matchesFound — an in-progress board survives a
  // language switch untouched, matching quiz-kit/sequence-kit's refreshHud.
  private refreshHud(): void {
    const strings = this.cfg.strings();
    this.menuBtn.setText(strings.menu);
    this.movesText.setText(strings.moves(this.moves));
    this.renderLangPicker();
  }

  private pickItems(): MatchItem[] {
    const progress = getProgress(this.cfg.gameId);
    const unlearned = this.cfg.items.filter((n) => !progress.has(n.id));
    const learned = this.cfg.items.filter((n) => progress.has(n.id));
    const pool = shuffle([...shuffle(unlearned), ...shuffle(learned)]);
    return pool.slice(0, this.cfg.pairs);
  }

  private buildBoard(): void {
    const { width, height } = this.scale;
    const items = this.pickItems();

    let tileId = 0;
    const tileDatas: TileData[] = [];
    for (const item of items) {
      tileDatas.push({ tileId: tileId++, pairId: item.id, side: 'a', label: item.sideA });
      tileDatas.push({ tileId: tileId++, pairId: item.id, side: 'b', label: item.sideB });
    }
    const shuffled = shuffle(tileDatas);

    const total = shuffled.length;
    const cols = total <= 12 ? 3 : total <= 16 ? 4 : 5;
    const rows = Math.ceil(total / cols);

    const boardTop = MatchScene.BOARD_TOP;
    const boardBottom = height - 30;
    const boardLeft = 16;
    const boardRight = width - 16;

    const cellW = (boardRight - boardLeft) / cols;
    const cellH = (boardBottom - boardTop) / rows;
    const cardW = cellW * 0.88;
    const cardH = cellH * 0.88;

    shuffled.forEach((data, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = boardLeft + cellW * col + cellW / 2;
      const y = boardTop + cellH * row + cellH / 2;
      this.createTile(data, x, y, cardW, cardH);
    });
  }

  private createTile(data: TileData, x: number, y: number, w: number, h: number): void {
    const { theme, fontFamily } = this.cfg;
    const container = this.add.container(x, y);

    const back = this.add.graphics();
    back.fillStyle(theme.cardBack, 1);
    back.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    back.lineStyle(2, theme.accent, 0.5);
    back.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

    const backSymbol = this.add.text(0, 0, '✦', {
      fontFamily,
      fontSize: `${Math.floor(Math.min(w, h) * 0.35)}px`,
      color: hex(theme.accent),
    }).setOrigin(0.5);
    container.add(backSymbol);

    const front = this.add.graphics();
    front.fillStyle(theme.cardFront, 1);
    front.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    front.lineStyle(2, theme.accentLight, 0.7);
    front.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    front.setVisible(false);

    const frontText = this.add.text(0, 0, data.label, {
      fontFamily,
      fontSize: `${Math.floor(w * 0.13)}px`,
      color: theme.text,
      align: 'center',
      wordWrap: { width: w * 0.85 },
    }).setOrigin(0.5);
    frontText.setVisible(false);

    container.add([back, front, frontText]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    const view: TileView = { data, container, back, front, frontText, faceUp: false, matched: false };
    container.on('pointerdown', () => this.onTileClicked(view));

    this.tiles.push(view);
  }

  private onTileClicked(view: TileView): void {
    const sfx = getMatchSfx(this.cfg.gameId);
    if (this.locked || view.faceUp || view.matched) return;
    if (this.flipped.length >= 2) return;

    this.flipTile(view, true);
    sfx.flip();

    this.flipped.push(view);

    if (this.flipped.length === 2) {
      this.moves++;
      this.refreshHud();
      this.locked = true;
      this.time.delayedCall(500, () => this.resolvePair());
    }
  }

  private flipTile(view: TileView, faceUp: boolean): void {
    view.faceUp = faceUp;
    this.tweens.add({
      targets: view.container,
      scaleX: 0,
      duration: 100,
      onComplete: () => {
        view.back.setVisible(!faceUp);
        view.front.setVisible(faceUp);
        view.frontText.setVisible(faceUp);
        const backSymbol = view.container.list[0] as Phaser.GameObjects.Text;
        backSymbol.setVisible(!faceUp);
        this.tweens.add({ targets: view.container, scaleX: 1, duration: 100 });
      },
    });
  }

  private resolvePair(): void {
    const sfx = getMatchSfx(this.cfg.gameId);
    const progress = getProgress(this.cfg.gameId);
    const [a, b] = this.flipped;
    const isMatch = a.data.pairId === b.data.pairId && a.data.side !== b.data.side;

    if (isMatch) {
      sfx.match();
      a.matched = true;
      b.matched = true;
      this.matchesFound++;
      progress.markLearned([a.data.pairId]);
      [a, b].forEach((v) => {
        this.tweens.add({ targets: v.container, alpha: 0.55, duration: 200 });
      });
      this.flipped = [];
      this.locked = false;

      if (this.matchesFound === this.cfg.pairs) {
        this.time.delayedCall(300, () => this.showComplete());
      }
    } else {
      sfx.mismatch();
      this.time.delayedCall(500, () => {
        this.flipTile(a, false);
        this.flipTile(b, false);
        this.flipped = [];
        this.locked = false;
      });
    }
  }

  private showComplete(): void {
    this.overlayShown = true;
    const sfx = getMatchSfx(this.cfg.gameId);
    const progress = getProgress(this.cfg.gameId);
    sfx.complete();
    progressBar.showCompletionToast(PlayerProgress.recordCompletion({
      gameId: this.cfg.gameId,
      itemsCompleted: this.cfg.pairs,
      mistakes: Math.max(0, this.moves - this.cfg.pairs),
    }));
    const { width, height } = this.scale;
    const { theme, fontFamily } = this.cfg;
    const strings = this.cfg.strings();

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    const panelW = width * 0.8;
    const panelH = height * 0.36;
    const panel = this.add.graphics();
    panel.fillStyle(theme.panel, 1);
    panel.fillRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 16);
    panel.lineStyle(2, theme.accent, 0.8);
    panel.strokeRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 16);

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');

    this.add.text(width / 2, height / 2 - panelH * 0.3, strings.wellDone, {
      fontFamily,
      fontSize: '26px',
      color: theme.text,
    }).setOrigin(0.5);

    this.add.text(
      width / 2,
      height / 2 - panelH * 0.08,
      strings.roundSummary(this.cfg.pairs, this.moves, `${mm}:${ss}`, progress.count(), this.cfg.items.length),
      {
        fontFamily,
        fontSize: '15px',
        color: theme.textMuted,
        align: 'center',
      }
    ).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + panelH * 0.22, strings.nextLevelHint, {
      fontFamily,
      fontSize: '14px',
      color: theme.textMuted,
    }).setOrigin(0.5);

    const menuBtn = this.add.text(width / 2, height / 2 + panelH * 0.42, strings.menu, {
      fontFamily,
      fontSize: '15px',
      color: hex(theme.accentLight),
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      autoAdvance.remove();
      this.scene.start(this.cfg.menuSceneKey ?? 'MenuScene');
    });

    // Every match already gets its own celebratory sound and a beat to read
    // the summary — the round itself IS the "next" confirmation, so it
    // advances on its own rather than waiting for a tap. Menu stays as the
    // one manual way out.
    const autoAdvance = this.time.delayedCall(MatchScene.AUTO_ADVANCE_MS, () =>
      this.scene.restart(this.cfg)
    );
  }
}
