import Phaser from 'phaser';
import { COLORS, ARABIC_FONT, LATIN_FONT, hex } from '../theme';
import { progress } from '../systems/Progress';
import { sfx } from '../systems/Sfx';
import { SALAH_STEPS } from '../data/salah';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { createLanguagePicker } from '@shared/language-picker';
import { t } from '../i18n';

interface DifficultyOption {
  label: () => string;
  itemsPerRound: number;
  // Fraction of the pool, sorted from fewest to most spelling pieces, this
  // tier is allowed to draw from. This game always plays the full set of
  // 9 steps every round, so this stays at 1 — see distractorRange below
  // for what actually varies by tier.
  maxDifficultyPercentile: number;
  // [min, max] decoy tiles in the tray, ramping from min on the round's
  // first item to max on its last.
  distractorRange: [number, number];
}

// Identical itemsPerRound/percentile across all three tiers used to mean
// Easy/Medium/Hard all drew all 9 steps every round, differing only in
// decoy-tile count on the ~1/3 of rounds using the 'build' format. Scaling
// both the pool cap and round size like the bigger Builder games do gives
// each tier a genuinely different round; Hard is the first to guarantee all
// 9 steps in one session.
const DIFFICULTIES: DifficultyOption[] = [
  { label: () => t().easy, itemsPerRound: 5, maxDifficultyPercentile: 0.6, distractorRange: [1, 2] },
  { label: () => t().medium, itemsPerRound: 7, maxDifficultyPercentile: 0.8, distractorRange: [2, 4] },
  { label: () => t().hard, itemsPerRound: 9, maxDifficultyPercentile: 1, distractorRange: [3, 6] },
];

// 'arabic': tap-build the Arabic, clue shows transliteration + meaning
// (today's default — always available, the "skip the typing stuff"
// option). 'toTranslation': shown the Arabic word/phrase + audio only,
// type its EN/NL meaning on a keyboard. 'toArabic': shown the meaning
// only (transliteration hidden, unlike 'arabic') and still tap-build the
// Arabic — a harder recall variant of the default mode.
export type PracticeMode = 'arabic' | 'toTranslation' | 'toArabic';

const MODE_OPTIONS: { key: PracticeMode; label: () => string }[] = [
  { key: 'arabic', label: () => t().modeArabic },
  { key: 'toTranslation', label: () => t().modeToTranslation },
  { key: 'toArabic', label: () => t().modeToArabic },
];

export class BuilderMenuScene extends Phaser.Scene {
  private mode: PracticeMode = 'arabic';
  private modeButtons: { key: PracticeMode; container: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Graphics }[] = [];

  constructor() {
    super('BuilderMenuScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.mode = 'arabic';

    // First-ever visit: default NL visitors to the Dutch pairing (free IP
    // lookup, no key). No-op — and no flicker — once a preference exists.
    const langBefore = getLang();
    void detectDefaultLang().then(() => {
      if (this.scene.isActive() && getLang() !== langBefore) {
        this.scene.restart();
      }
    });

    this.add.text(width / 2, height * 0.1, 'الصَّلاَة', {
      fontFamily: ARABIC_FONT,
      fontSize: '38px',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.145, t().subtitle, {
      fontFamily: LATIN_FONT,
      fontSize: '32px',
      fontStyle: 'bold',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.185, t().tagline, {
      fontFamily: LATIN_FONT,
      fontSize: '16px',
      color: COLORS.textMuted,
      align: 'center',
    }).setOrigin(0.5);

    const learned = progress.count();
    this.add.text(width / 2, height * 0.232, t().itemsLearned(learned, SALAH_STEPS.length), {
      fontFamily: LATIN_FONT,
      fontSize: '14px',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    this.buildModeSelector(height * 0.29);

    const startY = height * 0.4;
    const gap = height * 0.088;
    DIFFICULTIES.forEach((d, i) => {
      this.createButton(width / 2, startY + i * gap, 300, 60, d.label(), () => {
        sfx.tap();
        this.scene.start('BuilderScene', {
          itemsPerRound: d.itemsPerRound,
          maxDifficultyPercentile: d.maxDifficultyPercentile,
          distractorRange: d.distractorRange,
          mode: this.mode,
        });
      });
    });

    createLanguagePicker(this, width / 2, height * 0.685, COLORS.accent, getLang(), (lang) => {
      setLang(lang);
      sfx.tap();
      this.scene.restart();
    });

    // Mute toggle
    const muteLabel = () => (sfx.isMuted() ? t().soundOff : t().soundOn);
    const muteBtn = this.createButton(width / 2, height * 0.758, 220, 50, muteLabel(), () => {
      const muted = sfx.toggleMuted();
      muteBtn.text.setText(muted ? t().soundOff : t().soundOn);
      if (!muted) sfx.tap();
    });

    this.add.text(width / 2, height * 0.92, t().footer, {
      fontFamily: LATIN_FONT,
      fontSize: '13px',
      color: COLORS.textMuted,
      align: 'center',
      wordWrap: { width: width * 0.8 },
    }).setOrigin(0.5);
  }

  private static readonly MODE_BTN_W = 130;
  private static readonly MODE_BTN_H = 44;

  private buildModeSelector(y: number): void {
    const { width } = this.scale;
    const btnW = BuilderMenuScene.MODE_BTN_W;
    const btnH = BuilderMenuScene.MODE_BTN_H;
    const gap = 10;
    const totalW = btnW * MODE_OPTIONS.length + gap * (MODE_OPTIONS.length - 1);
    const startX = width / 2 - totalW / 2 + btnW / 2;

    this.modeButtons = MODE_OPTIONS.map((opt, i) => {
      const x = startX + i * (btnW + gap);
      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      const text = this.add.text(0, 0, opt.label(), {
        fontFamily: LATIN_FONT,
        fontSize: '13px',
        color: COLORS.text,
      }).setOrigin(0.5);
      container.add([bg, text]);
      container.setSize(btnW, btnH);
      container.setInteractive({ useHandCursor: true });
      container.on('pointerdown', () => {
        this.mode = opt.key;
        sfx.tap();
        this.refreshModeButtons();
      });
      return { key: opt.key, container, bg };
    });

    this.refreshModeButtons();
  }

  // Selection state is shown via border/fill strength rather than the
  // bright accent color as a full fill — accent hues vary a lot across the
  // 6 games (some quite light), and COLORS.text needs to stay legible on
  // top of it regardless of which game's palette this is.
  private refreshModeButtons(): void {
    const btnW = BuilderMenuScene.MODE_BTN_W;
    const btnH = BuilderMenuScene.MODE_BTN_H;
    for (const b of this.modeButtons) {
      const selected = b.key === this.mode;
      b.bg.clear();
      b.bg.fillStyle(selected ? COLORS.panelLight : COLORS.panel, 1);
      b.bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);
      b.bg.lineStyle(selected ? 3 : 2, COLORS.accent, selected ? 1 : 0.4);
      b.bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 10);
    }
  }

  private createButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void
  ): { container: Phaser.GameObjects.Container; text: Phaser.GameObjects.Text } {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.panel, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(2, COLORS.accent, 0.6);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const text = this.add.text(0, 0, label, {
      fontFamily: LATIN_FONT,
      fontSize: '19px',
      color: COLORS.text,
    }).setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => bg.setAlpha(0.85));
    container.on('pointerout', () => bg.setAlpha(1));
    container.on('pointerdown', onClick);

    return { container, text };
  }
}
