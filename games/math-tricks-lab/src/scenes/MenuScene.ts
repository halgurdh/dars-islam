import Phaser from 'phaser';
import { createLanguagePicker } from '@shared/language-picker';
import { COLORS, FONT, hex } from '../theme';
import { TRICKS } from '../tricks';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';
import { homeSceneKey } from './TrickHomeScenes';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    const langBefore = getLang();
    void detectDefaultLang().then(() => {
      if (this.scene.isActive() && getLang() !== langBefore) this.scene.restart();
    });

    createLanguagePicker(this, width / 2, height * 0.181, COLORS.accent, getLang(), (lang) => {
      setLang(lang);
      this.scene.restart();
    });

    this.add.text(width / 2, height * 0.09, t().title, {
      fontFamily: FONT,
      fontSize: '38px',
      fontStyle: 'bold',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.145, t().tagline, {
      fontFamily: FONT,
      fontSize: '20px',
      color: COLORS.textMuted,
      align: 'center',
    }).setOrigin(0.5);

    const top = height * 0.21;
    const cardH = height * 0.13;
    const gap = height * 0.017;
    const cardW = width * 0.9;

    TRICKS.forEach((trick, i) => {
      const y = top + i * (cardH + gap) + cardH / 2;
      this.createCard(width / 2, y, cardW, cardH, trick);
    });

    this.add.text(width / 2, height * 0.97, t().footer, {
      fontFamily: FONT,
      fontSize: '17px',
      color: COLORS.textMuted,
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5);
  }

  private createCard(x: number, y: number, w: number, h: number, trick: (typeof TRICKS)[number]): void {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.panel, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(2, COLORS.accent, 0.5);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const icon = this.add.text(-w / 2 + 40, 0, trick.icon, { fontSize: '34px' }).setOrigin(0.5);

    const title = this.add.text(-w / 2 + 78, -h * 0.24, trick.title(), {
      fontFamily: FONT,
      fontSize: '23px',
      fontStyle: 'bold',
      color: COLORS.text,
    }).setOrigin(0, 0.5);

    const summary = this.add.text(-w / 2 + 78, h * 0.18, trick.summary(), {
      fontFamily: FONT,
      fontSize: '17px',
      color: COLORS.textMuted,
      wordWrap: { width: w - 98 },
    }).setOrigin(0, 0.5);

    container.add([bg, icon, title, summary]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => bg.setAlpha(0.85));
    container.on('pointerout', () => bg.setAlpha(1));
    container.on('pointerdown', () => this.scene.start(homeSceneKey(trick)));
  }
}
