import Phaser from 'phaser';
import { CUSTOM_GAUGE_MAX, SCENE_HEIGHT, SCENE_WIDTH } from '../constants';
import type { BattleState, ChipDefinition } from '../types';

interface ChipCardVisual {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Graphics;
  title: Phaser.GameObjects.Text;
  damage: Phaser.GameObjects.Text;
  desc: Phaser.GameObjects.Text;
}

export class UIManager {
  private readonly scene: Phaser.Scene;
  private readonly root: Phaser.GameObjects.Container;
  private readonly gaugeFill: Phaser.GameObjects.Graphics;
  private readonly gaugeGlow: Phaser.GameObjects.Graphics;
  private readonly gaugePrompt: Phaser.GameObjects.Text;
  private readonly stateText: Phaser.GameObjects.Text;
  private readonly queueText: Phaser.GameObjects.Text;
  private readonly dimmer: Phaser.GameObjects.Rectangle;
  private readonly customTop: Phaser.GameObjects.Container;
  private readonly customBottom: Phaser.GameObjects.Container;
  private readonly customTitle: Phaser.GameObjects.Text;
  private readonly customHint: Phaser.GameObjects.Text;
  private readonly chipCards: ChipCardVisual[] = [];
  private lastGaugeReady = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(1000);
    this.gaugeGlow = scene.add.graphics();
    this.gaugeFill = scene.add.graphics();
    const gaugeFrame = scene.add.graphics();
    gaugeFrame.fillStyle(0x061321, 0.88).fillRoundedRect(390, 24, 500, 24, 12);
    gaugeFrame.lineStyle(2, 0x7ce8ff, 0.75).strokeRoundedRect(390, 24, 500, 24, 12);
    this.gaugePrompt = scene.add.text(640, 62, '', {
      fontFamily: 'Segoe UI',
      fontSize: '20px',
      color: '#9ff1ff',
      fontStyle: 'bold',
      stroke: '#07111f',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.stateText = scene.add.text(36, 32, 'BATTLE INTRO', {
      fontFamily: 'Segoe UI',
      fontSize: '26px',
      color: '#e8f3ff',
      fontStyle: 'bold',
    });
    this.queueText = scene.add.text(36, 82, 'Queue: Mega Buster', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#b7d8ff',
    }).setWordWrapWidth(320);
    this.dimmer = scene.add.rectangle(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 0x04070e, 0.68)
      .setOrigin(0)
      .setAlpha(0)
      .setVisible(false);
    this.customTop = scene.add.container(0, -240);
    this.customBottom = scene.add.container(0, SCENE_HEIGHT + 260);
    this.customTitle = scene.add.text(640, 92, 'CUSTOM SCREEN', {
      fontFamily: 'Segoe UI',
      fontSize: '34px',
      color: '#f1f6ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.customHint = scene.add.text(640, 606, 'LEFT / RIGHT: MOVE   SPACE: PICK   ENTER: SEND', {
      fontFamily: 'Segoe UI',
      fontSize: '20px',
      color: '#d3e7ff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const topPanel = scene.add.graphics();
    topPanel.fillStyle(0x081726, 0.95).fillRoundedRect(110, 32, 1060, 116, 28);
    topPanel.lineStyle(3, 0x7ce8ff, 0.9).strokeRoundedRect(110, 32, 1060, 116, 28);
    this.customTop.add([topPanel, this.customTitle]);

    const bottomPanel = scene.add.graphics();
    bottomPanel.fillStyle(0x0f1523, 0.96).fillRoundedRect(60, 380, 1160, 280, 32);
    bottomPanel.lineStyle(3, 0xff86b3, 0.85).strokeRoundedRect(60, 380, 1160, 280, 32);
    this.customBottom.add([bottomPanel, this.customHint]);

    this.root.add([
      this.gaugeGlow,
      gaugeFrame,
      this.gaugeFill,
      this.gaugePrompt,
      this.stateText,
      this.queueText,
      this.dimmer,
      this.customTop,
      this.customBottom,
    ]);
  }

  updateGauge(value: number, ready: boolean): void {
    const width = 492 * Phaser.Math.Clamp(value / CUSTOM_GAUGE_MAX, 0, 1);
    this.gaugeGlow.clear()
      .fillStyle(ready ? 0xffd36e : 0x34d5ff, ready ? 0.22 : 0.16)
      .fillRoundedRect(394, 28, Math.max(20, width), 16, 10);
    this.gaugeFill.clear()
      .fillStyle(ready ? 0xffca57 : 0x55d7ff, 0.95)
      .fillRoundedRect(394, 28, width, 16, 10);
    this.gaugePrompt.setText(ready ? 'CUSTOM READY - PRESS ENTER' : 'Building Custom Gauge');
    this.gaugePrompt.setColor(ready ? '#ffe9ab' : '#9ff1ff');
    if (ready && !this.lastGaugeReady) {
      this.scene.cameras.main.flash(160, 255, 246, 196, false);
      this.scene.tweens.add({
        targets: this.gaugePrompt,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 120,
        yoyo: true,
      });
    }
    this.lastGaugeReady = ready;
  }

  updateQueue(queue: ChipDefinition[]): void {
    const text = queue.length > 0 ? queue.map((chip) => chip.name).join('  •  ') : 'Mega Buster';
    this.queueText.setText(`Queue: ${text}`);
  }

  updateState(state: BattleState): void {
    const label = state.replace(/_/g, ' ');
    this.stateText.setText(label);
  }

  showCustomScreen(hand: ChipDefinition[], selected: number[], cursor: number): void {
    this.dimmer.setVisible(true);
    this.scene.tweens.add({ targets: this.dimmer, alpha: 1, duration: 160, ease: 'Quad.easeOut' });
    this.scene.tweens.add({ targets: this.customTop, y: 0, duration: 520, ease: 'Elastic.easeOut' });
    this.scene.tweens.add({ targets: this.customBottom, y: 0, duration: 520, ease: 'Elastic.easeOut' });
    this.renderChipCards(hand, selected, cursor);
  }

  refreshCustomScreen(hand: ChipDefinition[], selected: number[], cursor: number): void {
    if (!this.dimmer.visible) {
      return;
    }
    this.renderChipCards(hand, selected, cursor);
  }

  hideCustomScreen(): void {
    this.scene.tweens.add({
      targets: this.dimmer,
      alpha: 0,
      duration: 160,
      onComplete: () => this.dimmer.setVisible(false),
    });
    this.scene.tweens.add({ targets: this.customTop, y: -240, duration: 280, ease: 'Cubic.easeIn' });
    this.scene.tweens.add({ targets: this.customBottom, y: SCENE_HEIGHT + 260, duration: 280, ease: 'Cubic.easeIn' });
    this.clearChipCards();
  }

  showBanner(text: string, tint: string): void {
    const banner = this.scene.add.text(640, 196, text, {
      fontFamily: 'Segoe UI',
      fontSize: '42px',
      fontStyle: 'bold',
      color: tint,
      stroke: '#07111f',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(1500);
    banner.alpha = 0;
    banner.y += 24;
    this.scene.tweens.add({
      targets: banner,
      alpha: 1,
      y: banner.y - 24,
      duration: 220,
      ease: 'Cubic.easeOut',
      yoyo: true,
      hold: 500,
      onComplete: () => banner.destroy(),
    });
  }

  showEndOverlay(title: string, subtitle: string, tint: number): void {
    const shade = this.scene.add.rectangle(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 0x03060d, 0.74)
      .setOrigin(0)
      .setDepth(1600)
      .setAlpha(0);
    const card = this.scene.add.graphics().setDepth(1601);
    card.fillStyle(0x091321, 0.95).fillRoundedRect(320, 188, 640, 260, 34);
    card.lineStyle(4, tint, 0.9).strokeRoundedRect(320, 188, 640, 260, 34);
    card.alpha = 0;
    const titleText = this.scene.add.text(640, 274, title, {
      fontFamily: 'Segoe UI',
      fontSize: '54px',
      fontStyle: 'bold',
      color: '#f7fbff',
    }).setOrigin(0.5).setDepth(1602).setAlpha(0);
    const subText = this.scene.add.text(640, 352, subtitle, {
      fontFamily: 'Segoe UI',
      fontSize: '24px',
      color: '#d2e6ff',
      align: 'center',
    }).setOrigin(0.5).setDepth(1602).setAlpha(0);
    this.scene.tweens.add({ targets: [shade, card, titleText, subText], alpha: 1, duration: 260 });
  }

  private renderChipCards(hand: ChipDefinition[], selected: number[], cursor: number): void {
    this.clearChipCards();
    hand.forEach((chip, index) => {
      const x = 178 + index * 210;
      const y = 430;
      const bg = this.scene.add.graphics();
      const title = this.scene.add.text(x + 20, y + 22, chip.name, {
        fontFamily: 'Segoe UI',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#f7fbff',
      });
      const damage = this.scene.add.text(x + 20, y + 62, chip.damage > 0 ? `${chip.damage} DMG` : 'UTILITY', {
        fontFamily: 'Segoe UI',
        fontSize: '19px',
        fontStyle: 'bold',
        color: '#fef3ba',
      });
      const desc = this.scene.add.text(x + 20, y + 108, chip.description, {
        fontFamily: 'Segoe UI',
        fontSize: '16px',
        color: '#d5e9ff',
        wordWrap: { width: 152 },
      });
      const container = this.scene.add.container(0, 0, [bg, title, damage, desc]).setDepth(1200);
      this.chipCards.push({ container, bg, title, damage, desc });
      this.customBottom.add(container);

      const isCursor = index === cursor;
      const isSelected = selected.includes(index);
      bg.clear()
        .fillStyle(chip.color, isSelected ? 0.95 : 0.78)
        .fillRoundedRect(x, y, 182, 212, 24)
        .fillStyle(0x07111f, 0.18)
        .fillRoundedRect(x + 10, y + 86, 162, 108, 18)
        .lineStyle(isCursor ? 5 : 3, isCursor ? 0xffffff : chip.accent, 1)
        .strokeRoundedRect(x, y, 182, 212, 24);
      container.y = isSelected ? -22 : 0;
      container.scale = isCursor ? 1.02 : 1;
    });
  }

  private clearChipCards(): void {
    this.chipCards.splice(0).forEach((card) => {
      card.container.destroy(true);
    });
  }
}
