import Phaser from 'phaser';
import { COLORS, ARABIC_FONT, LATIN_FONT, hex } from '../theme';
import { MONTHS, BuilderItem } from '../data/months';
import { progress } from '../systems/Progress';
import { sfx } from '../systems/Sfx';
import { getLang } from '../systems/Locale';
import { SPEECH_LANG } from '@shared/tts';
import { toArabicSpeechText } from '@shared/arabic-speech';
import { pieceKindFor, piecesFor, pickDistractors } from '@shared/builder-pieces';
import { isCorrectAnswer } from '@shared/builder-typing';
import { PlayerProgress } from '@shared/player-progress';
import { ProgressBar } from '@shared/progress-bar';
import { t } from '../i18n';
import type { PracticeMode } from './BuilderMenuScene';

const progressBar = new ProgressBar();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function meaningFor(item: BuilderItem): string {
  switch (getLang()) {
    case 'nl': return item.meaningNl;
    case 'de': return item.meaningDe;
    case 'es': return item.meaningEs;
    case 'fr': return item.meaningFr;
    default: return item.meaningEn;
  }
}

interface TrayTile {
  piece: string;
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  used: boolean;
}

interface SlotBox {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
}

export class BuilderScene extends Phaser.Scene {
  private itemsPerRound = 10;
  private maxDifficultyPercentile = 1;
  private distractorRange: [number, number] = [2, 4];
  private mode: PracticeMode = 'arabic';
  private roundItems: BuilderItem[] = [];
  private currentIndex = 0;
  private currentItem!: BuilderItem;
  private currentPieces: string[] = [];
  private placedCount = 0;
  private mistakes = 0;
  private startTime = 0;
  private locked = false;
  private overlayShown = false;

  private mistakesText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private hearBtnContainer!: Phaser.GameObjects.Container;
  private hearBtnText!: Phaser.GameObjects.Text;

  private clueTransliteration!: Phaser.GameObjects.Text;
  private clueMeaning!: Phaser.GameObjects.Text;
  private slots: SlotBox[] = [];
  private tiles: TrayTile[] = [];
  private revealText?: Phaser.GameObjects.Text;
  private roundLayer!: Phaser.GameObjects.Container;
  // A plain HTML <input>, not a Phaser DOM Element — Phaser's DOM Element
  // positioning didn't compose correctly with this game's Scale.FIT
  // transform in testing (ended up nowhere near its intended spot), so
  // this is positioned by hand from the canvas's own bounding rect
  // instead, the same technique already used for click-coordinate mapping.
  private typingInput?: HTMLInputElement;
  private typingInputPos?: { x: number; y: number; w: number; h: number };

  constructor() {
    super('BuilderScene');
  }

  init(data: {
    itemsPerRound?: number;
    maxDifficultyPercentile?: number;
    distractorRange?: [number, number];
    mode?: PracticeMode;
  }): void {
    this.itemsPerRound = data.itemsPerRound ?? 10;
    this.maxDifficultyPercentile = data.maxDifficultyPercentile ?? 1;
    this.distractorRange = data.distractorRange ?? [2, 4];
    this.mode = data.mode ?? 'arabic';
    this.roundItems = [];
    this.currentIndex = 0;
    this.mistakes = 0;
    this.locked = false;
    this.overlayShown = false;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.startTime = this.time.now;

    // The typing-mode input is a real DOM node outside Phaser's own
    // display list (see typingInput's own comment) — Phaser's normal
    // teardown (destroying game objects on scene shutdown/restart) never
    // touches it, so it needs its own explicit cleanup here.
    this.events.once('shutdown', () => this.destroyTypingInput());

    this.buildHud();
    this.roundItems = this.pickItems();
    this.loadItem(0);
  }

  update(): void {
    if (this.overlayShown) return;
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');
    this.timerText.setText(`${mm}:${ss}`);
  }

  // The wrapper chrome (Exit Game link, theme/fullscreen/install buttons) is
  // fixed DOM overlaid on the canvas in the top-left and top-right corners,
  // so in-canvas HUD and board content must stay clear of it.
  private static readonly HUD_TOP = 300;
  private static readonly CLUE_TOP = BuilderScene.HUD_TOP + 150;
  private static readonly SLOTS_TOP = BuilderScene.CLUE_TOP + 110;
  private static readonly TRAY_TOP = BuilderScene.SLOTS_TOP + 100;
  private static readonly AUTO_ADVANCE_MS = 2200;
  private static readonly ITEM_SOLVED_DELAY_MS = 900;

  private buildHud(): void {
    const { width } = this.scale;
    const y = BuilderScene.HUD_TOP;

    const menuBtn = this.add.text(70, y, t().menu, {
      fontFamily: LATIN_FONT,
      fontSize: '16px',
      color: COLORS.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => this.scene.start('BuilderMenuScene'));

    const muteBtn = this.add.text(width - 70, y, sfx.isMuted() ? '🔇' : '🔈', {
      fontFamily: LATIN_FONT,
      fontSize: '18px',
      color: COLORS.textMuted,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      const muted = sfx.toggleMuted();
      muteBtn.setText(muted ? '🔇' : '🔈');
      if (!muted) sfx.tap();
      this.refreshHearBtn();
    });

    this.mistakesText = this.add.text(width / 2, y + 34, t().mistakes(0), {
      fontFamily: LATIN_FONT,
      fontSize: '16px',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.timerText = this.add.text(width / 2, y + 58, '00:00', {
      fontFamily: LATIN_FONT,
      fontSize: '14px',
      color: COLORS.textMuted,
    }).setOrigin(0.5);

    const btnW = 260;
    const btnH = 58;
    const btnY = y + 108;
    this.hearBtnContainer = this.add.container(width / 2, btnY);
    const hearBtnBg = this.add.graphics();
    hearBtnBg.fillStyle(COLORS.panel, 1);
    hearBtnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    hearBtnBg.lineStyle(2, COLORS.accent, 0.8);
    hearBtnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 14);
    this.hearBtnText = this.add.text(0, 0, t().hear, {
      fontFamily: LATIN_FONT,
      fontSize: '20px',
      fontStyle: 'bold',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);
    this.hearBtnContainer.add([hearBtnBg, this.hearBtnText]);
    this.hearBtnContainer.setSize(btnW, btnH);
    this.hearBtnContainer.setInteractive({ useHandCursor: true });
    this.hearBtnContainer.on('pointerdown', () => this.speakCurrent());

    this.clueTransliteration = this.add.text(width / 2, BuilderScene.CLUE_TOP, '', {
      fontFamily: LATIN_FONT,
      fontSize: '22px',
      fontStyle: 'bold',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.clueMeaning = this.add.text(width / 2, BuilderScene.CLUE_TOP + 34, '', {
      fontFamily: LATIN_FONT,
      fontSize: '16px',
      color: COLORS.textMuted,
      align: 'center',
      wordWrap: { width: width * 0.8 },
    }).setOrigin(0.5);

    this.roundLayer = this.add.container(0, 0);
  }

  private refreshHearBtn(): void {
    const lang = SPEECH_LANG.arabic;
    this.hearBtnContainer.setAlpha(sfx.hasVoice(lang) ? 1 : 0.35);
  }

  private async speakCurrent(): Promise<void> {
    if (!this.currentItem) return;
    const text = toArabicSpeechText(this.currentItem.arabic);
    const lang = SPEECH_LANG.arabic;
    if (await sfx.needsDownload(lang)) {
      this.hearBtnText.setText('⏳ …');
    }
    await sfx.speak(text, lang);
    this.hearBtnText.setText(t().hear);
  }

  // More pieces to place = a harder item. Sorting the pool this way lets
  // each difficulty tier cap how complex an item it's allowed to draw from
  // (Easy never sees the longest names), and — separately — lets a chosen
  // round itself ramp from its easiest item to its hardest rather than
  // hitting them in a random order.
  private difficultyOf(item: BuilderItem): number {
    return piecesFor(item.arabic).length;
  }

  // Ramps linearly from this.distractorRange[0] on the round's first item
  // to [1] on its last, so a round gets visibly harder to spell (more decoy
  // tiles to sift through) as it goes, not just longer.
  private rampedDistractorCount(): number {
    const [min, max] = this.distractorRange;
    if (this.roundItems.length <= 1) return min;
    const t = this.currentIndex / (this.roundItems.length - 1);
    return Math.round(min + (max - min) * t);
  }

  private pickItems(): BuilderItem[] {
    const byDifficulty = [...MONTHS].sort((a, b) => this.difficultyOf(a) - this.difficultyOf(b));
    const cutoff = Math.max(
      this.itemsPerRound,
      Math.ceil(byDifficulty.length * this.maxDifficultyPercentile)
    );
    const pool = byDifficulty.slice(0, cutoff);

    const unlearned = pool.filter((n) => !progress.has(n.id));
    const learned = pool.filter((n) => progress.has(n.id));
    const picked = shuffle([...shuffle(unlearned), ...shuffle(learned)]).slice(0, this.itemsPerRound);

    return picked.sort((a, b) => this.difficultyOf(a) - this.difficultyOf(b));
  }

  private loadItem(index: number): void {
    if (index >= this.roundItems.length) {
      this.time.delayedCall(300, () => this.showComplete());
      return;
    }

    this.currentIndex = index;
    this.currentItem = this.roundItems[index];
    this.currentPieces = piecesFor(this.currentItem.arabic);
    this.placedCount = 0;
    this.locked = false;

    this.roundLayer.removeAll(true);
    this.slots = [];
    this.tiles = [];
    this.revealText = undefined;
    this.destroyTypingInput();
    this.refreshHearBtn();

    if (this.mode === 'toTranslation') {
      // Shown the Arabic word/phrase (+ audio) only — no transliteration,
      // no meaning text, since typing the meaning IS the challenge here.
      this.clueTransliteration.setText('');
      this.clueMeaning.setText('');
      this.buildTypingChallenge();
    } else {
      // 'arabic' shows the transliteration as a reading aid; 'toArabic'
      // hides it so building the Arabic from the meaning alone is a real
      // recall test, not a copy task.
      this.clueTransliteration.setText(this.mode === 'toArabic' ? '' : this.currentItem.transliteration);
      this.clueMeaning.setText(meaningFor(this.currentItem));
      this.buildSlots();
      this.buildTray();
    }
  }

  private buildSlots(): void {
    const { width } = this.scale;
    const count = this.currentPieces.length;
    const gap = 10;
    const maxW = 72;
    const contentW = width - 60;
    const slotW = Math.min(maxW, (contentW - gap * (count - 1)) / count);
    const slotH = slotW * 1.15;
    const totalW = slotW * count + gap * (count - 1);
    const startX = width / 2 - totalW / 2 + slotW / 2;
    const y = BuilderScene.SLOTS_TOP;

    for (let i = 0; i < count; i++) {
      // Arabic reads right-to-left, so the first piece placed (index 0) must
      // land in the RIGHTMOST slot, with later pieces filling toward the left
      // — otherwise the word builds up mirrored.
      const x = startX + (count - 1 - i) * (slotW + gap);
      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(COLORS.slotEmpty, 1);
      bg.fillRoundedRect(-slotW / 2, -slotH / 2, slotW, slotH, 8);
      bg.lineStyle(2, COLORS.accent, 0.4);
      bg.strokeRoundedRect(-slotW / 2, -slotH / 2, slotW, slotH, 8);
      const text = this.add.text(0, 0, '', {
        fontFamily: ARABIC_FONT,
        fontSize: `${Math.floor(slotW * 0.5)}px`,
        color: COLORS.text,
      }).setOrigin(0.5);
      container.add([bg, text]);
      this.roundLayer.add(container);
      this.slots.push({ container, bg, text });
    }
  }

  private buildTray(): void {
    const { width, height } = this.scale;
    const kind = pieceKindFor(this.currentItem.arabic);
    const otherArabic = MONTHS.filter((h) => h.id !== this.currentItem.id).map((h) => h.arabic);
    const distractors = pickDistractors(kind, this.currentPieces, otherArabic, this.rampedDistractorCount());
    const trayPieces = shuffle([...this.currentPieces, ...distractors]);

    const count = trayPieces.length;
    const cols = count <= 6 ? 3 : count <= 9 ? 3 : 4;
    const rows = Math.ceil(count / cols);

    const top = BuilderScene.TRAY_TOP;
    const bottom = height - 40;
    const left = 30;
    const right = width - 30;
    const cellW = (right - left) / cols;
    const cellH = Math.min((bottom - top) / rows, 100);
    const tileW = cellW * 0.86;
    const tileH = cellH * 0.8;

    trayPieces.forEach((piece, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = left + cellW * col + cellW / 2;
      const y = top + cellH * row + cellH / 2;

      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(COLORS.tile, 1);
      bg.fillRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 10);
      bg.lineStyle(2, COLORS.accentLight, 0.5);
      bg.strokeRoundedRect(-tileW / 2, -tileH / 2, tileW, tileH, 10);
      const isWord = kind === 'word';
      const text = this.add.text(0, 0, piece, {
        fontFamily: ARABIC_FONT,
        fontSize: isWord ? `${Math.floor(tileW * 0.2)}px` : `${Math.floor(tileW * 0.4)}px`,
        color: COLORS.text,
        align: 'center',
        wordWrap: { width: tileW * 0.85 },
      }).setOrigin(0.5);
      container.add([bg, text]);
      container.setSize(tileW, tileH);
      container.setInteractive({ useHandCursor: true });
      this.roundLayer.add(container);

      const tile: TrayTile = { piece, container, bg, used: false };
      this.tiles.push(tile);
      container.on('pointerdown', () => this.onTileTapped(tile));
    });
  }

  // 'toTranslation' mode: show the Arabic prompt full-size (it's the clue
  // itself here, not something to assemble) and a real HTML text input,
  // positioned by hand over the canvas (see typingInput's own comment).
  // Submitting is checked leniently against the item's meaning in the
  // current UI language.
  private buildTypingChallenge(): void {
    const { width } = this.scale;

    const promptText = this.add.text(width / 2, BuilderScene.SLOTS_TOP, this.currentItem.arabic, {
      fontFamily: ARABIC_FONT,
      fontSize: '44px',
      color: hex(COLORS.accent),
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5);
    this.roundLayer.add(promptText);

    const inputY = BuilderScene.TRAY_TOP + 10;
    const input = document.createElement('input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    input.placeholder = t().typeAnswerPlaceholder;
    Object.assign(input.style, {
      position: 'fixed',
      zIndex: '5',
      textAlign: 'center',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: LATIN_FONT,
      borderStyle: 'solid',
      borderColor: hex(COLORS.accent),
      background: hex(COLORS.slotEmpty),
      color: COLORS.text,
    });
    document.body.appendChild(input);
    this.typingInput = input;
    this.positionTypingInput(width / 2, inputY, 300, 54);

    // Focus is still inside the user gesture that started this scene (the
    // difficulty-button tap, or the previous item's Enter/Check), so this
    // reliably pops the on-screen keyboard on mobile rather than silently
    // failing the way an unrelated/delayed focus() call would.
    window.setTimeout(() => input.focus({ preventScroll: true }), 50);
    input.addEventListener('keydown', this.onTypingKeydown);
    this.scale.on('resize', this.onScaleResize, this);

    const checkBtn = this.createTypingCheckButton(width / 2, inputY + 72);
    this.roundLayer.add(checkBtn);
  }

  private onTypingKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Enter') this.submitTypedAnswer();
  };

  private onScaleResize = (): void => {
    if (this.typingInputPos) {
      const { x, y, w, h } = this.typingInputPos;
      this.positionTypingInput(x, y, w, h);
    }
  };

  // Phaser's own DOM Element positioning didn't compose correctly with
  // this game's Scale.FIT transform (tested: ended up near the page's
  // top-left instead of over the canvas), so the input is positioned by
  // reading the canvas's actual rendered box directly — the same
  // technique already relied on for mapping click coordinates.
  private positionTypingInput(gameX: number, gameY: number, w: number, h: number): void {
    if (!this.typingInput) return;
    this.typingInputPos = { x: gameX, y: gameY, w, h };
    const rect = this.sys.game.canvas.getBoundingClientRect();
    const scale = rect.width / this.scale.width;
    const el = this.typingInput;
    el.style.left = `${rect.left + gameX * scale - (w * scale) / 2}px`;
    el.style.top = `${rect.top + gameY * scale - (h * scale) / 2}px`;
    el.style.width = `${w * scale}px`;
    el.style.padding = `${14 * scale}px ${16 * scale}px`;
    el.style.fontSize = `${17 * scale}px`;
    el.style.borderRadius = `${12 * scale}px`;
    el.style.borderWidth = `${2 * scale}px`;
  }

  private destroyTypingInput(): void {
    if (this.typingInput) {
      this.typingInput.removeEventListener('keydown', this.onTypingKeydown);
      this.typingInput.remove();
      this.typingInput = undefined;
    }
    this.typingInputPos = undefined;
    this.scale.off('resize', this.onScaleResize, this);
  }

  private createTypingCheckButton(x: number, y: number): Phaser.GameObjects.Container {
    const w = 160;
    const h = 50;
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.panel, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    bg.lineStyle(2, COLORS.accent, 0.8);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    const text = this.add.text(0, 0, t().checkAnswer, {
      fontFamily: LATIN_FONT,
      fontSize: '17px',
      fontStyle: 'bold',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);
    container.add([bg, text]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.submitTypedAnswer());
    return container;
  }

  private submitTypedAnswer(): void {
    if (this.locked || this.overlayShown || !this.typingInput) return;
    const inputEl = this.typingInput;
    const typed = inputEl.value;

    if (isCorrectAnswer(typed, meaningFor(this.currentItem))) {
      this.onItemSolved();
    } else {
      this.mistakes++;
      this.mistakesText.setText(t().mistakes(this.mistakes));
      sfx.wrong();
      inputEl.value = '';
      inputEl.style.borderColor = '#e05c5c';
      window.setTimeout(() => {
        if (this.typingInput === inputEl) inputEl.style.borderColor = hex(COLORS.accent);
      }, 300);
      inputEl.focus({ preventScroll: true });
    }
  }

  private onTileTapped(tile: TrayTile): void {
    if (this.locked || tile.used || this.overlayShown) return;

    const expected = this.currentPieces[this.placedCount];
    if (tile.piece === expected) {
      tile.used = true;
      sfx.correct();
      fadeOutTile(tile.container, this.tweens);
      this.fillSlot(this.placedCount, tile.piece);
      this.placedCount++;

      if (this.placedCount === this.currentPieces.length) {
        this.onItemSolved();
      }
    } else {
      this.mistakes++;
      this.mistakesText.setText(t().mistakes(this.mistakes));
      sfx.wrong();
      shakeTile(tile.container, this.tweens);
    }
  }

  private fillSlot(index: number, piece: string): void {
    const slot = this.slots[index];
    slot.text.setText(piece);
    slot.bg.clear();
    slot.bg.fillStyle(COLORS.slotFilled, 1);
    const bounds = slot.text.getBounds();
    const w = Math.max(bounds.width + 24, 48);
    const h = Math.max(bounds.height + 20, 56);
    slot.bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    slot.bg.lineStyle(2, COLORS.accent, 0.8);
    slot.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    this.tweens.add({ targets: slot.container, scale: { from: 0.85, to: 1 }, duration: 150, ease: 'Back.Out' });
  }

  private onItemSolved(): void {
    this.locked = true;
    sfx.solved();
    progress.markLearned([this.currentItem.id]);

    if (this.mode === 'toTranslation') {
      // The Arabic prompt was already shown full-size and fully shaped
      // (it's the clue itself in this mode) — confirm with the meaning
      // instead of a "reveal", and lock the input so it can't be edited
      // further while the round auto-advances.
      if (this.typingInput) {
        this.typingInput.disabled = true;
        this.typingInput.style.opacity = '0.7';
        this.typingInput.style.borderColor = hex(COLORS.accent);
      }
      const { width } = this.scale;
      const confirm = this.add.text(width / 2, BuilderScene.TRAY_TOP + 92, meaningFor(this.currentItem), {
        fontFamily: LATIN_FONT,
        fontSize: '16px',
        color: hex(COLORS.accentLight),
        align: 'center',
        wordWrap: { width: width * 0.8 },
      }).setOrigin(0.5).setAlpha(0);
      this.roundLayer.add(confirm);
      this.tweens.add({ targets: confirm, alpha: 1, duration: 250 });
    } else {
      // Each tray tile is an independently-shaped isolated Arabic glyph —
      // Phaser doesn't do cross-object contextual shaping — so the filled
      // slots never look like properly connected cursive script. Reveal
      // the real, fully-diacritized word in its place once solved.
      const { width } = this.scale;
      this.revealText = this.add.text(width / 2, BuilderScene.SLOTS_TOP, this.currentItem.arabic, {
        fontFamily: ARABIC_FONT,
        fontSize: '40px',
        color: hex(COLORS.accent),
      }).setOrigin(0.5).setAlpha(0);
      this.roundLayer.add(this.revealText);

      this.tweens.add({
        targets: this.slots.map((s) => s.container),
        alpha: 0,
        duration: 250,
      });
      this.tweens.add({
        targets: this.revealText,
        alpha: 1,
        duration: 250,
        delay: 150,
      });
    }

    this.time.delayedCall(BuilderScene.ITEM_SOLVED_DELAY_MS, () => this.loadItem(this.currentIndex + 1));
  }

  private showComplete(): void {
    this.overlayShown = true;
    sfx.complete();
    progressBar.showCompletionToast(PlayerProgress.recordCompletion({
      gameId: 'months-builder',
      itemsCompleted: this.roundItems.length,
      mistakes: this.mistakes,
    }));
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    const panelW = width * 0.8;
    const panelH = height * 0.36;
    const panel = this.add.graphics();
    panel.fillStyle(COLORS.panel, 1);
    panel.fillRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 16);
    panel.lineStyle(2, COLORS.accent, 0.8);
    panel.strokeRoundedRect(width / 2 - panelW / 2, height / 2 - panelH / 2, panelW, panelH, 16);

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const ss = String(elapsed % 60).padStart(2, '0');

    this.add.text(width / 2, height / 2 - panelH * 0.3, t().wellDone, {
      fontFamily: LATIN_FONT,
      fontSize: '26px',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.add.text(
      width / 2,
      height / 2 - panelH * 0.08,
      t().roundSummary(this.roundItems.length, this.mistakes, `${mm}:${ss}`, progress.count(), MONTHS.length),
      {
        fontFamily: LATIN_FONT,
        fontSize: '15px',
        color: COLORS.textMuted,
        align: 'center',
      }
    ).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + panelH * 0.22, t().nextLevelHint, {
      fontFamily: LATIN_FONT,
      fontSize: '14px',
      color: COLORS.textMuted,
    }).setOrigin(0.5);

    const menuBtn = this.add.text(width / 2, height / 2 + panelH * 0.42, t().menu, {
      fontFamily: LATIN_FONT,
      fontSize: '15px',
      color: hex(COLORS.accentLight),
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      autoAdvance.remove();
      this.scene.start('BuilderMenuScene');
    });

    // Every solved item already gets its own celebratory sound and a beat
    // to see the reveal — the round itself IS the "next" confirmation, so
    // it advances on its own rather than waiting for a tap. Menu stays as
    // the one manual way out.
    const autoAdvance = this.time.delayedCall(BuilderScene.AUTO_ADVANCE_MS, () =>
      this.scene.restart({
        itemsPerRound: this.itemsPerRound,
        maxDifficultyPercentile: this.maxDifficultyPercentile,
        distractorRange: this.distractorRange,
        mode: this.mode,
      })
    );
  }
}

function fadeOutTile(container: Phaser.GameObjects.Container, tweens: Phaser.Tweens.TweenManager): void {
  tweens.add({ targets: container, alpha: 0, scale: 0.7, duration: 150 });
  container.disableInteractive();
}

function shakeTile(container: Phaser.GameObjects.Container, tweens: Phaser.Tweens.TweenManager): void {
  const x = container.x;
  tweens.add({
    targets: container,
    x: [x - 8, x + 8, x - 6, x + 6, x],
    duration: 260,
    ease: 'Sine.InOut',
  });
}
