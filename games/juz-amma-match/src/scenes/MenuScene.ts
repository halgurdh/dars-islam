import Phaser from 'phaser';
import { COLORS, ARABIC_FONT, LATIN_FONT, hex } from '../theme';
import { progress } from '../systems/Progress';
import { sfx } from '../systems/Sfx';
import { JUZ_AMMA_SURAHS } from '../data/names';
import { getLang, toggleLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

interface DifficultyOption {
  label: () => string;
  pairs: number;
}

const DIFFICULTIES: DifficultyOption[] = [
  { label: () => t().easy, pairs: 6 },
  { label: () => t().medium, pairs: 8 },
  { label: () => t().hard, pairs: 10 },
];

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
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

    this.add.text(width / 2, height * 0.12, 'جُزْءُ عَمَّ', {
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
    this.add.text(width / 2, height * 0.27, t().surahsLearned(learned, JUZ_AMMA_SURAHS.length), {
      fontFamily: LATIN_FONT,
      fontSize: '15px',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    const startY = height * 0.38;
    const gap = height * 0.1;
    DIFFICULTIES.forEach((d, i) => {
      this.createButton(width / 2, startY + i * gap, 300, 64, d.label(), () => {
        sfx.flip();
        this.scene.start('GameScene', { pairs: d.pairs });
      });
    });

    // Language toggle: English+Arabic <-> Dutch+Arabic
    this.createButton(width / 2, height * 0.655, 280, 52, t().langToggle, () => {
      toggleLang();
      sfx.flip();
      this.scene.restart();
    });

    // Mute toggle
    const muteLabel = () => (sfx.isMuted() ? t().soundOff : t().soundOn);
    const muteBtn = this.createButton(width / 2, height * 0.735, 220, 52, muteLabel(), () => {
      const muted = sfx.toggleMuted();
      muteBtn.text.setText(muted ? t().soundOff : t().soundOn);
      if (!muted) sfx.flip();
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
