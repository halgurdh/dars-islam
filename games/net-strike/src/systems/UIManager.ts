import Phaser from 'phaser';
import { CUSTOM_GAUGE_MAX, SCENE_HEIGHT, SCENE_WIDTH } from '../constants';
import type { BattleState, ChipDefinition } from '../types';

interface ChipCardVisual {
  objects: Phaser.GameObjects.GameObject[];
  zone: Phaser.GameObjects.Zone;
}

const CX = SCENE_WIDTH / 2;

// Custom screen world-space constants
const CHIP_W = 168;
const CHIP_H = 210;
const CHIP_SPACING = 196;
const CHIP_TOP = 152;       // top edge of chip cards in world Y
const CONFIRM_CY = 448;     // confirm button center Y

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

  // Mouse/confirm support
  private onChipHover?: (i: number) => void;
  private onChipClick?: (i: number) => void;
  private onConfirm?: () => void;
  private confirmObjs: Phaser.GameObjects.GameObject[] = [];
  private countText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(1000);
    this.gaugeGlow = scene.add.graphics();
    this.gaugeFill = scene.add.graphics();
    const gaugeFrame = scene.add.graphics();
    gaugeFrame.fillStyle(0x061321, 0.88).fillRoundedRect(390, 24, 500, 24, 12);
    gaugeFrame.lineStyle(2, 0x7ce8ff, 0.75).strokeRoundedRect(390, 24, 500, 24, 12);
    this.gaugePrompt = scene.add.text(CX, 62, '', {
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

    // Dimmer covers full screen when custom screen opens
    this.dimmer = scene.add.rectangle(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 0x03070e, 0.80)
      .setOrigin(0).setAlpha(0).setVisible(false);

    // Top panel container (slides down from above)
    this.customTop = scene.add.container(0, -240);
    const topPanel = scene.add.graphics();
    topPanel.fillStyle(0x081726, 0.97).fillRoundedRect(80, 12, 1120, 118, 28);
    topPanel.lineStyle(3, 0x7ce8ff, 0.9).strokeRoundedRect(80, 12, 1120, 118, 28);
    this.customTitle = scene.add.text(CX, 54, 'CUSTOM SCREEN', {
      fontFamily: 'Segoe UI',
      fontSize: '36px',
      color: '#f1f6ff',
      fontStyle: 'bold',
      stroke: '#07111f',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.customTop.add([topPanel, this.customTitle]);

    // Bottom panel container (slides up from below) — purely visual backdrop
    this.customBottom = scene.add.container(0, SCENE_HEIGHT + 260);
    const bottomPanel = scene.add.graphics();
    bottomPanel.fillStyle(0x0b1522, 0.96).fillRoundedRect(60, 430, 1160, 280, 32);
    bottomPanel.lineStyle(3, 0xff86b3, 0.75).strokeRoundedRect(60, 430, 1160, 280, 32);
    this.customHint = scene.add.text(CX, 488, '', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      color: '#90aad0',
      fontStyle: 'bold',
    }).setOrigin(0.5);
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

  /** Register callbacks so BattleScene can respond to mouse chip interaction. */
  setChipCallbacks(
    onHover: (i: number) => void,
    onClick: (i: number) => void,
    onConfirm: () => void,
  ): void {
    this.onChipHover = onHover;
    this.onChipClick = onClick;
    this.onConfirm = onConfirm;
  }

  updateGauge(value: number, ready: boolean): void {
    const width = 492 * Phaser.Math.Clamp(value / CUSTOM_GAUGE_MAX, 0, 1);
    this.gaugeGlow.clear()
      .fillStyle(ready ? 0xffd36e : 0x34d5ff, ready ? 0.22 : 0.16)
      .fillRoundedRect(394, 28, Math.max(20, width), 16, 10);
    this.gaugeFill.clear()
      .fillStyle(ready ? 0xffca57 : 0x55d7ff, 0.95)
      .fillRoundedRect(394, 28, width, 16, 10);
    this.gaugePrompt.setText(ready ? 'CUSTOM READY — PRESS ENTER' : 'Building Custom Gauge');
    this.gaugePrompt.setColor(ready ? '#ffe9ab' : '#9ff1ff');
    if (ready && !this.lastGaugeReady) {
      this.scene.cameras.main.flash(160, 255, 246, 196, false);
      this.scene.tweens.add({ targets: this.gaugePrompt, scaleX: 1.08, scaleY: 1.08, duration: 120, yoyo: true });
    }
    this.lastGaugeReady = ready;
  }

  updateQueue(queue: ChipDefinition[]): void {
    const text = queue.length > 0 ? queue.map((c) => c.name).join('  •  ') : 'Mega Buster';
    this.queueText.setText(`Queue: ${text}`);
  }

  updateState(state: BattleState): void {
    this.stateText.setText(state.replace(/_/g, ' '));
  }

  showCustomScreen(hand: ChipDefinition[], selected: number[], cursor: number): void {
    this.dimmer.setVisible(true);
    this.scene.tweens.add({ targets: this.dimmer, alpha: 1, duration: 160, ease: 'Quad.easeOut' });
    this.scene.tweens.add({ targets: this.customTop, y: 0, duration: 480, ease: 'Elastic.easeOut' });
    this.scene.tweens.add({ targets: this.customBottom, y: 0, duration: 480, ease: 'Elastic.easeOut' });
    this.renderChipCards(hand, selected, cursor);
  }

  refreshCustomScreen(hand: ChipDefinition[], selected: number[], cursor: number): void {
    if (!this.dimmer.visible) return;
    this.renderChipCards(hand, selected, cursor);
  }

  hideCustomScreen(): void {
    this.scene.tweens.add({
      targets: this.dimmer, alpha: 0, duration: 160,
      onComplete: () => this.dimmer.setVisible(false),
    });
    this.scene.tweens.add({ targets: this.customTop, y: -240, duration: 280, ease: 'Cubic.easeIn' });
    this.scene.tweens.add({ targets: this.customBottom, y: SCENE_HEIGHT + 260, duration: 280, ease: 'Cubic.easeIn' });
    this.clearChipCards();
  }

  showBanner(text: string, tint: string): void {
    const banner = this.scene.add.text(CX, 196, text, {
      fontFamily: 'Segoe UI', fontSize: '42px', fontStyle: 'bold',
      color: tint, stroke: '#07111f', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(1500).setAlpha(0);
    banner.y += 24;
    this.scene.tweens.add({
      targets: banner, alpha: 1, y: banner.y - 24, duration: 220,
      ease: 'Cubic.easeOut', yoyo: true, hold: 500,
      onComplete: () => banner.destroy(),
    });
  }

  showEndOverlay(title: string, subtitle: string, tint: number, onRestart?: () => void): void {
    const shade = this.scene.add.rectangle(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 0x03060d, 0.74)
      .setOrigin(0).setDepth(1600).setAlpha(0);
    const card = this.scene.add.graphics().setDepth(1601).setAlpha(0);
    card.fillStyle(0x091321, 0.95).fillRoundedRect(320, 188, 640, 260, 34);
    card.lineStyle(4, tint, 0.9).strokeRoundedRect(320, 188, 640, 260, 34);
    const titleText = this.scene.add.text(CX, 266, title, {
      fontFamily: 'Segoe UI', fontSize: '54px', fontStyle: 'bold', color: '#f7fbff',
    }).setOrigin(0.5).setDepth(1602).setAlpha(0);
    const subText = this.scene.add.text(CX, 336, subtitle, {
      fontFamily: 'Segoe UI', fontSize: '24px', color: '#d2e6ff', align: 'center',
    }).setOrigin(0.5).setDepth(1602).setAlpha(0);

    const btnGroup: Phaser.GameObjects.GameObject[] = [shade, card, titleText, subText];

    if (onRestart) {
      const btnX = CX, btnY = 408, btnW = 260, btnH = 50;
      const btnBg = this.scene.add.graphics().setDepth(1602).setAlpha(0);
      btnBg.fillStyle(0x2ca9ff, 1).fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18);
      btnBg.lineStyle(3, 0x8fd4ff, 0.95).strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18);
      const btnText = this.scene.add.text(btnX, btnY, 'RESTART BATTLE', {
        fontFamily: 'Segoe UI', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(1603).setAlpha(0);
      const hitZone = this.scene.add.zone(btnX, btnY, btnW, btnH).setDepth(1604) as Phaser.GameObjects.Zone & { alpha: number };
      hitZone.alpha = 0;
      hitZone.setInteractive({ useHandCursor: true });
      hitZone.on('pointerover', () => {
        btnBg.clear()
          .fillStyle(0x48b8ff, 1).fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18)
          .lineStyle(3, 0xb8e2ff, 1).strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18);
        btnText.setColor('#e8f4ff');
      });
      hitZone.on('pointerout', () => {
        btnBg.clear()
          .fillStyle(0x2ca9ff, 1).fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18)
          .lineStyle(3, 0x8fd4ff, 0.95).strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18);
        btnText.setColor('#ffffff');
      });
      hitZone.on('pointerdown', () => {
        this.scene.tweens.killTweensOf([shade, card, titleText, subText, btnBg, btnText, hitZone]);
        onRestart();
      });
      btnGroup.push(btnBg, btnText, hitZone);
    }
    this.scene.tweens.add({ targets: btnGroup, alpha: 1, duration: 260 });
  }

  // ── Chip card rendering ──────────────────────────────────────────────────────

  private renderChipCards(hand: ChipDefinition[], selected: number[], cursor: number): void {
    this.clearChipCards();

    // Centre the row of cards horizontally
    const totalW = hand.length * CHIP_W + (hand.length - 1) * (CHIP_SPACING - CHIP_W);
    const startX = Math.round((SCENE_WIDTH - totalW) / 2);

    // Count badge in top panel
    const selCount = selected.length;
    this.countText = this.scene.add.text(CX, 96, `${selCount} / 3 chips selected`, {
      fontFamily: 'Segoe UI', fontSize: '20px', fontStyle: 'bold',
      color: selCount === 3 ? '#00ff88' : selCount > 0 ? '#ffe479' : '#7baed8',
      stroke: '#07111f', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(1210).setAlpha(0);
    this.scene.tweens.add({ targets: this.countText, alpha: 1, duration: 200 });

    hand.forEach((chip, index) => {
      const cardX = startX + index * CHIP_SPACING;   // left edge
      const cardCX = cardX + CHIP_W / 2;             // centre X
      const cardCY = CHIP_TOP + CHIP_H / 2;          // centre Y
      const isCursor = index === cursor;
      const isSelected = selected.includes(index);

      const liftY = isSelected ? -24 : 0;
      const baseY = CHIP_TOP + liftY;

      const objs: Phaser.GameObjects.GameObject[] = [];

      // ── Glow ring (cursor) ───────────────────────────────────────────────
      if (isCursor) {
        const ring = this.scene.add.graphics().setDepth(1201).setAlpha(0);
        ring.lineStyle(4, 0xffffff, 0.7).strokeRoundedRect(cardX - 8, baseY - 8, CHIP_W + 16, CHIP_H + 16, 28);
        this.scene.tweens.add({ targets: ring, alpha: 1, duration: 120 });
        // Pulse the ring
        this.scene.tweens.add({ targets: ring, alpha: 0.3, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        objs.push(ring);
      }

      // ── Card background ──────────────────────────────────────────────────
      const bg = this.scene.add.graphics().setDepth(1202).setAlpha(0);
      const fillAlpha = isSelected ? 0.98 : isCursor ? 0.92 : 0.78;
      const borderColor = isSelected ? 0x00e882 : isCursor ? 0xe8f0ff : chip.accent;
      const borderW = isSelected || isCursor ? 5 : 2;
      bg.fillStyle(chip.color, fillAlpha).fillRoundedRect(cardX, baseY, CHIP_W, CHIP_H, 22);
      bg.fillStyle(0x07111f, 0.24).fillRoundedRect(cardX + 10, baseY + 88, CHIP_W - 20, 106, 16);
      bg.lineStyle(borderW, borderColor, 1).strokeRoundedRect(cardX, baseY, CHIP_W, CHIP_H, 22);
      objs.push(bg);

      // ── Chip index number badge ──────────────────────────────────────────
      const numBg = this.scene.add.graphics().setDepth(1203).setAlpha(0);
      numBg.fillStyle(0x07111f, 0.7).fillCircle(cardX + 20, baseY + 20, 14);
      const numTxt = this.scene.add.text(cardX + 20, baseY + 20, `${index + 1}`, {
        fontFamily: 'Segoe UI', fontSize: '16px', fontStyle: 'bold', color: '#d3e8ff',
      }).setOrigin(0.5).setDepth(1204).setAlpha(0);
      objs.push(numBg, numTxt);

      // ── Checkmark badge (selected) ───────────────────────────────────────
      if (isSelected) {
        const chkBg = this.scene.add.graphics().setDepth(1205).setAlpha(0);
        chkBg.fillStyle(0x004422, 1).fillCircle(cardX + CHIP_W - 20, baseY + 20, 14);
        chkBg.lineStyle(2, 0x00ff88, 0.9).strokeCircle(cardX + CHIP_W - 20, baseY + 20, 14);
        const chkTxt = this.scene.add.text(cardX + CHIP_W - 20, baseY + 20, '✓', {
          fontFamily: 'Segoe UI', fontSize: '18px', fontStyle: 'bold', color: '#00ff88',
        }).setOrigin(0.5).setDepth(1206).setAlpha(0);
        objs.push(chkBg, chkTxt);
      }

      // ── Text labels ──────────────────────────────────────────────────────
      const nameT = this.scene.add.text(cardX + 14, baseY + 38, chip.name, {
        fontFamily: 'Segoe UI', fontSize: '22px', fontStyle: 'bold', color: '#f7fbff',
        stroke: '#07111f', strokeThickness: 2,
      }).setDepth(1204).setAlpha(0);
      const dmgT = this.scene.add.text(cardX + 14, baseY + 66, chip.damage > 0 ? `${chip.damage} DMG` : 'UTILITY', {
        fontFamily: 'Segoe UI', fontSize: '18px', fontStyle: 'bold',
        color: chip.damage > 0 ? '#fef3ba' : '#b8ffd3',
      }).setDepth(1204).setAlpha(0);
      const descT = this.scene.add.text(cardX + 14, baseY + 100, chip.description, {
        fontFamily: 'Segoe UI', fontSize: '14px', color: '#c4ddf5',
        wordWrap: { width: CHIP_W - 24 },
      }).setDepth(1204).setAlpha(0);
      objs.push(nameT, dmgT, descT);

      // ── SPACE / click hint at card bottom ────────────────────────────────
      const actionHint = this.scene.add.text(cardCX, baseY + CHIP_H - 18, isSelected ? 'SPACE/CLICK: deselect' : 'SPACE/CLICK: pick', {
        fontFamily: 'Segoe UI', fontSize: '11px', color: isSelected ? '#00cc66' : '#5a7c9a',
      }).setOrigin(0.5).setDepth(1204).setAlpha(0);
      objs.push(actionHint);

      // Fade in all objects with stagger
      const delay = 60 + index * 35;
      this.scene.tweens.add({ targets: objs, alpha: 1, duration: 140, delay });

      // ── Interactive hit zone (scene-level so pointer events work) ────────
      const zone = this.scene.add.zone(cardCX, cardCY + liftY, CHIP_W, CHIP_H)
        .setDepth(1210)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => this.onChipHover?.(index));
      zone.on('pointerdown', () => this.onChipClick?.(index));

      // Cursor scale tween on the bg
      if (isCursor) {
        this.scene.tweens.add({ targets: bg, scaleX: 1.03, scaleY: 1.03, duration: 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }

      this.chipCards.push({ objects: objs, zone });
    });

    // ── Confirm button ───────────────────────────────────────────────────────
    this.buildConfirmButton(selCount);

    // Update hint text inside bottom panel
    this.customHint.setText('←/→: NAVIGATE   SPACE/CLICK: PICK (max 3)   ENTER/CLICK CONFIRM: SEND   ESC: CANCEL');
  }

  private buildConfirmButton(selCount: number): void {
    // Destroy existing confirm button objects
    this.confirmObjs.forEach(o => o.destroy());
    this.confirmObjs = [];

    const btnW = 280, btnH = 52;
    const btnX = CX, btnY = CONFIRM_CY;
    const hasChips = selCount > 0;

    const shade = this.scene.add.graphics().setDepth(1208).setAlpha(0);
    shade.fillStyle(0x000000, 0.4).fillRoundedRect(btnX - btnW / 2 + 4, btnY - btnH / 2 + 5, btnW, btnH, 18);

    const btnBg = this.scene.add.graphics().setDepth(1209).setAlpha(0);
    const fillC = hasChips ? 0x00773f : 0x1a2e22;
    const strokeC = hasChips ? 0x00cc66 : 0x2a4433;
    btnBg.fillStyle(fillC, 1).fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18);
    btnBg.lineStyle(3, strokeC, 1).strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18);

    const label = hasChips ? `CONFIRM  ${selCount} CHIP${selCount > 1 ? 'S' : ''}  [ENTER]` : 'SELECT CHIPS FIRST';
    const btnTxt = this.scene.add.text(btnX, btnY, label, {
      fontFamily: 'Segoe UI', fontSize: '20px', fontStyle: 'bold',
      color: hasChips ? '#ffffff' : '#3d6050',
      stroke: '#07111f', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1210).setAlpha(0);

    this.scene.tweens.add({ targets: [shade, btnBg, btnTxt], alpha: 1, duration: 200, delay: 180 });

    if (hasChips) {
      const zone = this.scene.add.zone(btnX, btnY, btnW, btnH)
        .setDepth(1211)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerover', () => {
        btnBg.clear()
          .fillStyle(0x00994f, 1).fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18)
          .lineStyle(3, 0x44ffaa, 1).strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18);
        btnTxt.setColor('#ccffe8');
      });
      zone.on('pointerout', () => {
        btnBg.clear()
          .fillStyle(fillC, 1).fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18)
          .lineStyle(3, strokeC, 1).strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 18);
        btnTxt.setColor('#ffffff');
      });
      zone.on('pointerdown', () => {
        this.scene.tweens.add({ targets: [btnBg, btnTxt], scaleX: 0.96, scaleY: 0.96, duration: 60, yoyo: true });
        this.onConfirm?.();
      });
      this.confirmObjs.push(zone);

      // Idle pulse when chips are selected
      this.scene.tweens.add({ targets: btnTxt, scaleX: 1.04, scaleY: 1.04, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    this.confirmObjs.push(shade, btnBg, btnTxt);
  }

  private clearChipCards(): void {
    this.chipCards.splice(0).forEach(({ objects, zone }) => {
      objects.forEach(o => { this.scene.tweens.killTweensOf(o); o.destroy(); });
      zone.destroy();
    });
    this.confirmObjs.forEach(o => { this.scene.tweens.killTweensOf(o); o.destroy(); });
    this.confirmObjs = [];
    if (this.countText) {
      this.countText.destroy();
      this.countText = undefined;
    }
  }
}
