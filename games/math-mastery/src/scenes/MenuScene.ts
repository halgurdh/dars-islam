import Phaser from 'phaser';
import { createLanguagePicker } from '@shared/language-picker';
import { COLORS, FONT, hex } from '../theme';
import { TOPICS, type Topic } from '../topics';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { t } from '../i18n';

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

    createLanguagePicker(this, width / 2, height * 0.213, COLORS.accent, getLang(), (lang) => {
      setLang(lang);
      this.scene.restart();
    });

    this.add.text(width / 2, height * 0.1, t().title, {
      fontFamily: FONT,
      fontSize: '40px',
      fontStyle: 'bold',
      color: hex(COLORS.accent),
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.165, t().tagline, {
      fontFamily: FONT,
      fontSize: '20px',
      color: COLORS.textMuted,
      align: 'center',
    }).setOrigin(0.5);

    const top = height * 0.24;
    const cardH = height * 0.15;
    const gap = height * 0.025;
    const cardW = width * 0.9;

    TOPICS.forEach((topic, i) => {
      const y = top + i * (cardH + gap) + cardH / 2;
      this.createCard(width / 2, y, cardW, cardH, topic);
    });

    this.add.text(width / 2, height * 0.95, t().footer, {
      fontFamily: FONT,
      fontSize: '18px',
      color: COLORS.textMuted,
      align: 'center',
      wordWrap: { width: width * 0.85 },
    }).setOrigin(0.5);
  }

  private createCard(x: number, y: number, w: number, h: number, topic: Topic): void {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.panel, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.lineStyle(2, COLORS.accent, 0.5);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);

    const icon = this.add.text(-w / 2 + 42, 0, topic.icon, {
      fontFamily: FONT,
      fontSize: '34px',
      color: hex(COLORS.accentLight),
    }).setOrigin(0.5);

    const title = this.add.text(-w / 2 + 82, -h * 0.24, topic.title, {
      fontFamily: FONT,
      fontSize: '23px',
      fontStyle: 'bold',
      color: COLORS.text,
    }).setOrigin(0, 0.5);

    const summary = this.add.text(-w / 2 + 82, h * 0.16, topic.summary, {
      fontFamily: FONT,
      fontSize: '17px',
      color: COLORS.textMuted,
      wordWrap: { width: w - 104 },
    }).setOrigin(0, 0.5);

    container.add([bg, icon, title, summary]);
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => bg.setAlpha(0.85));
    container.on('pointerout', () => bg.setAlpha(1));
    container.on('pointerdown', () => this.scene.start('Learn', { topicId: topic.id }));
  }
}
