import Phaser from 'phaser';
import { COLORS, ARABIC_FONT, LATIN_FONT, hex } from '../theme';
import { progress } from '../systems/Progress';
import { sfx } from '../systems/Sfx';
import { PHRASES } from '../data/phrases';
import { getLang, toggleLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

interface DifficultyOption {
  label: () => string;
  itemsPerRound: number;
  // Fraction of the pool, sorted from fewest to most spelling pieces, this
  // tier is allowed to draw from — Easy only ever sees the shortest
  // phrases, Hard sees everything including the longest. 1.0 = no cap.
  maxDifficultyPercentile: number;
  // [min, max] decoy tiles in the tray, ramping from min on the round's
  // first item to max on its last. Kept smaller than the letter-based
  // games since the word-distractor pool (other phrases' words) is thinner.
  distractorRange: [number, number];
}

const DIFFICULTIES: DifficultyOption[] = [
  { label: () => t().easy, itemsPerRound: 4, maxDifficultyPercentile: 0.4, distractorRange: [1, 1] },
  { label: () => t().medium, itemsPerRound: 7, maxDifficultyPercentile: 0.75, distractorRange: [1, 2] },
  { label: () => t().hard, itemsPerRound: 10, maxDifficultyPercentile: 1, distractorRange: [2, 3] },
];

export class BuilderMenuScene extends Phaser.Scene {
  constructor() {
    super('BuilderMenuScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    // First-ever visit: default NL visitors to the Dutch pairing (free IP
    // lookup, no key). No-op — and no flicker — once a preference exists.
    const langBefore = getLang();
    void detectDefaultLang().then(() => {
      if (this.scene.isActive() && getLang() !== langBefore) {
        this.scene.restart();
      }
    });

    this.add.text(width / 2, height * 0.12, 'أَذْكَار', {
      fontFamily: ARABIC_FONT,
      fontSize: '40px',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.17, t().subtitle, {
      fontFamily: LATIN_FONT,
      fontSize: '34px',
      fontStyle: 'bold',
      color: COLORS.text,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.215, t().tagline, {
      fontFamily: LATIN_FONT,
      fontSize: '17px',
      color: COLORS.textMuted,
      align: 'center',
    }).setOrigin(0.5);

    const learned = progress.count();
    this.add.text(width / 2, height * 0.27, t().itemsLearned(learned, PHRASES.length), {
      fontFamily: LATIN_FONT,
      fontSize: '15px',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    const startY = height * 0.38;
    const gap = height * 0.1;
    DIFFICULTIES.forEach((d, i) => {
      this.createButton(width / 2, startY + i * gap, 300, 64, d.label(), () => {
        sfx.tap();
        this.scene.start('BuilderScene', {
          itemsPerRound: d.itemsPerRound,
          maxDifficultyPercentile: d.maxDifficultyPercentile,
          distractorRange: d.distractorRange,
        });
      });
    });

    // Language toggle: English+Arabic <-> Dutch+Arabic
    this.createButton(width / 2, height * 0.655, 280, 52, t().langToggle, () => {
      toggleLang();
      sfx.tap();
      this.scene.restart();
    });

    // Mute toggle
    const muteLabel = () => (sfx.isMuted() ? t().soundOff : t().soundOn);
    const muteBtn = this.createButton(width / 2, height * 0.735, 220, 52, muteLabel(), () => {
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
