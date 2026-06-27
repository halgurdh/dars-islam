import Phaser from 'phaser';
import { SCENE_HEIGHT, SCENE_WIDTH } from '../constants';
import { TouchControls } from '../systems/TouchControls';
import type { ChipDefinition, ChipIconShape, CustomMenuHost } from '../types';

const MENU_WIDTH = 800;
const MENU_HEIGHT = 600;
const CARD_WIDTH = 132;
const CARD_HEIGHT = 188;
const CARD_GAP = 18;
const QUEUE_SLOT_WIDTH = 112;
const QUEUE_SLOT_HEIGHT = 70;

type CardVisual = {
  container: Phaser.GameObjects.Container;
  x: number;
  y: number;
};

export class CustomMenuScene extends Phaser.Scene {
  private battleKey = 'BattleScene';
  private battleScene!: CustomMenuHost;
  private hand: ChipDefinition[] = [];
  private selectedIndices: number[] = [];
  private cursorIndex = 0;
  private overlay!: Phaser.GameObjects.Rectangle;
  private root!: Phaser.GameObjects.Container;
  private cardsLayer!: Phaser.GameObjects.Container;
  private queueLayer!: Phaser.GameObjects.Container;
  private hintText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private queueLabels: Phaser.GameObjects.Text[] = [];
  private cardVisuals: CardVisual[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private touch!: TouchControls;
  private isClosing = false;

  constructor() {
    super('CustomMenuScene');
  }

  create(data?: { battleKey?: string; hand?: ChipDefinition[] }): void {
    this.battleKey = data?.battleKey ?? 'BattleScene';
    this.battleScene = this.scene.get(this.battleKey) as unknown as CustomMenuHost;
    this.hand = data?.hand ?? this.battleScene.getCustomHand();
    this.selectedIndices = [];
    this.queueLabels = [];
    this.cardVisuals = [];
    this.cursorIndex = 0;
    this.isClosing = false;

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.touch = new TouchControls(this, 'menu');
    this.touch.onCardTap = (x, y) => this.handleCardTap(x, y);
    this.time.delayedCall(300, () => this.touch.showHint());

    this.buildLayout();
    this.renderMenu();
    this.animateIn();
  }

  update(): void {
    if (this.isClosing) {
      return;
    }

    const nav = this.touch.consumeMenuNav();
    if (nav !== null) {
      this.cursorIndex = Phaser.Math.Wrap(this.cursorIndex + nav, 0, this.hand.length);
      this.renderMenu();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasd.A)) {
      this.cursorIndex = Phaser.Math.Wrap(this.cursorIndex - 1, 0, this.hand.length);
      this.renderMenu();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasd.D)) {
      this.cursorIndex = Phaser.Math.Wrap(this.cursorIndex + 1, 0, this.hand.length);
      this.renderMenu();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.toggleSelection(this.cursorIndex);
      return;
    }

    if ((Phaser.Input.Keyboard.JustDown(this.enterKey) || this.touch.consumeConfirm()) && this.selectedIndices.length > 0) {
      const selectedChips = this.selectedIndices.map((index) => this.hand[index]);
      this.battleScene.loadChips(selectedChips);
      this.closeMenu(true);
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.escKey) || this.touch.consumeCancel()) {
      this.closeMenu(false);
    }
  }

  private buildLayout(): void {
    const cx = SCENE_WIDTH / 2;
    const cy = SCENE_HEIGHT / 2;
    const panelX = cx - MENU_WIDTH / 2;
    const panelY = cy - MENU_HEIGHT / 2;

    this.overlay = this.add.rectangle(0, 0, SCENE_WIDTH, SCENE_HEIGHT, 0x000000, 0.62)
      .setOrigin(0)
      .setAlpha(0)
      .setDepth(2000);

    this.root = this.add.container(0, 32).setDepth(2001).setAlpha(0);

    const panelGlow = this.add.graphics();
    panelGlow.fillGradientStyle(0x10233b, 0x10233b, 0x07111f, 0x07111f, 1);
    panelGlow.fillRoundedRect(panelX, panelY, MENU_WIDTH, MENU_HEIGHT, 30);
    panelGlow.lineStyle(3, 0x6df3ff, 0.85);
    panelGlow.strokeRoundedRect(panelX, panelY, MENU_WIDTH, MENU_HEIGHT, 30);
    panelGlow.lineStyle(1, 0xff77af, 0.35);
    panelGlow.strokeRoundedRect(panelX + 10, panelY + 10, MENU_WIDTH - 20, MENU_HEIGHT - 20, 24);

    const title = this.add.text(panelX + 36, panelY + 28, 'CUSTOM MENU', {
      fontFamily: 'Segoe UI',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f4fbff',
      stroke: '#07111f',
      strokeThickness: 4,
    });

    const subtitle = this.add.text(panelX + 38, panelY + 72, 'Pick up to 3 chips. Match by NAME or CODE. * combines with anything.', {
      fontFamily: 'Segoe UI',
      fontSize: '16px',
      color: '#9bc9ea',
    });

    this.statusText = this.add.text(panelX + 38, panelY + 112, '', {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffe79f',
    });

    const queueTitle = this.add.text(panelX + MENU_WIDTH - 208, panelY + 28, 'ACTIVE QUEUE', {
      fontFamily: 'Segoe UI',
      fontSize: '21px',
      fontStyle: 'bold',
      color: '#ffd6e6',
    });

    this.queueLayer = this.add.container(0, 0);
    for (let index = 0; index < 3; index += 1) {
      const slotX = panelX + MENU_WIDTH - 220;
      const slotY = panelY + 72 + index * 88;
      const slot = this.add.graphics();
      slot.fillStyle(0x091321, 0.96);
      slot.fillRoundedRect(slotX, slotY, QUEUE_SLOT_WIDTH, QUEUE_SLOT_HEIGHT, 18);
      slot.lineStyle(2, 0x2d4b66, 0.95);
      slot.strokeRoundedRect(slotX, slotY, QUEUE_SLOT_WIDTH, QUEUE_SLOT_HEIGHT, 18);
      const label = this.add.text(slotX + 16, slotY + 22, `SLOT ${index + 1}`, {
        fontFamily: 'Segoe UI',
        fontSize: '15px',
        color: '#597a94',
      });
      this.queueLabels.push(label);
      this.queueLayer.add([slot, label]);
    }

    this.cardsLayer = this.add.container(0, 0);
    this.hintText = this.add.text(cx, panelY + MENU_HEIGHT - 30, 'ARROWS/SWIPE: Navigate  ·  SPACE/TAP: Select  ·  ENTER/✓: Confirm  ·  ESC/✗: Cancel', {
      fontFamily: 'Segoe UI',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#82b7d8',
    }).setOrigin(0.5);

    this.root.add([panelGlow, title, subtitle, this.statusText, queueTitle, this.queueLayer, this.cardsLayer, this.hintText]);
  }

  private renderMenu(): void {
    this.cardsLayer.removeAll(true);
    this.cardVisuals = [];

    const startX = (SCENE_WIDTH - (this.hand.length * CARD_WIDTH + (this.hand.length - 1) * CARD_GAP)) / 2;
    const cardY = SCENE_HEIGHT / 2 - 18;

    this.hand.forEach((chip, index) => {
      const isCursor = index === this.cursorIndex;
      const queueIndex = this.selectedIndices.indexOf(index);
      const isSelected = queueIndex >= 0;
      const x = startX + index * (CARD_WIDTH + CARD_GAP);
      const y = cardY - (isSelected ? 14 : 0);
      const card = this.createChipCard(x, y, chip, isCursor, queueIndex);
      this.cardsLayer.add(card);
      this.cardVisuals.push({ container: card, x: x + CARD_WIDTH / 2, y: y + CARD_HEIGHT / 2 });
    });

    this.refreshQueueLabels();
    this.refreshStatusText();
  }

  private createChipCard(
    x: number,
    y: number,
    chip: ChipDefinition,
    isCursor: boolean,
    queueIndex: number,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    const fillAlpha = queueIndex >= 0 ? 0.98 : 0.9;
    bg.fillGradientStyle(chip.color, chip.color, 0x07111f, 0x07111f, fillAlpha);
    bg.fillRoundedRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 20);
    bg.fillStyle(0x06111d, 0.4);
    bg.fillRoundedRect(10, 88, CARD_WIDTH - 20, 88, 16);
    bg.lineStyle(isCursor ? 4 : 2, isCursor ? 0xf7fbff : chip.accent, 1);
    bg.strokeRoundedRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 20);

    if (isCursor) {
      const glow = this.add.graphics();
      glow.lineStyle(3, 0x7ce8ff, 0.85);
      glow.strokeRoundedRect(-8, -8, CARD_WIDTH + 16, CARD_HEIGHT + 16, 24);
      container.add(glow);
      this.tweens.add({
        targets: glow,
        alpha: 0.35,
        duration: 420,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    if (queueIndex >= 0) {
      const badge = this.add.graphics();
      badge.fillStyle(0x00b96a, 1).fillCircle(CARD_WIDTH - 18, 18, 14);
      const badgeText = this.add.text(CARD_WIDTH - 18, 18, `${queueIndex + 1}`, {
        fontFamily: 'Segoe UI',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#ffffff',
      }).setOrigin(0.5);
      container.add([badge, badgeText]);
    }

    const icon = this.createIconGraphic(chip.iconShape, chip.accent);
    icon.setPosition(CARD_WIDTH / 2, 42);
    const nameText = this.add.text(14, 84, chip.name, {
      fontFamily: 'Segoe UI',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f4fbff',
      stroke: '#07111f',
      strokeThickness: 2,
    });
    const effectText = this.add.text(14, 110, chip.effectLabel, {
      fontFamily: 'Segoe UI',
      fontSize: '16px',
      fontStyle: 'bold',
      color: chip.damage > 0 ? '#fff2b5' : '#b9ffe6',
    });
    const codeChip = this.add.graphics();
    codeChip.fillStyle(0x07111f, 0.88).fillRoundedRect(14, 138, 34, 28, 10);
    codeChip.lineStyle(2, chip.accent, 0.95).strokeRoundedRect(14, 138, 34, 28, 10);
    const codeText = this.add.text(31, 152, chip.code, {
      fontFamily: 'Segoe UI',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);
    const descText = this.add.text(56, 140, chip.description, {
      fontFamily: 'Segoe UI',
      fontSize: '12px',
      color: '#b7d9ef',
      wordWrap: { width: 62 },
    });

    container.add([bg, icon, nameText, effectText, codeChip, codeText, descText]);
    return container;
  }

  private createIconGraphic(shape: ChipIconShape, tint: number): Phaser.GameObjects.Graphics {
    const icon = this.add.graphics();
    icon.fillStyle(tint, 1);
    icon.lineStyle(2, 0xffffff, 0.85);
    if (shape === 'circle') {
      icon.fillCircle(0, 0, 14);
      icon.strokeCircle(0, 0, 14);
      return icon;
    }
    if (shape === 'diamond') {
      icon.beginPath();
      icon.moveTo(0, -16);
      icon.lineTo(14, 0);
      icon.lineTo(0, 16);
      icon.lineTo(-14, 0);
      icon.closePath();
      icon.fillPath();
      icon.strokePath();
      return icon;
    }
    if (shape === 'triangle') {
      icon.beginPath();
      icon.moveTo(0, -16);
      icon.lineTo(15, 12);
      icon.lineTo(-15, 12);
      icon.closePath();
      icon.fillPath();
      icon.strokePath();
      return icon;
    }

    icon.fillRoundedRect(-14, -14, 28, 28, 8);
    icon.strokeRoundedRect(-14, -14, 28, 28, 8);
    return icon;
  }

  private refreshQueueLabels(): void {
    this.queueLabels.forEach((label, index) => {
      const chipIndex = this.selectedIndices[index];
      if (chipIndex === undefined) {
        label.setText(`SLOT ${index + 1}`);
        label.setColor('#597a94');
        return;
      }

      const chip = this.hand[chipIndex];
      label.setText(`${chip.name}\n${chip.code}  ${chip.effectLabel}`);
      label.setColor('#f4fbff');
    });
  }

  private refreshStatusText(message?: string, color = '#ffe79f'): void {
    if (message) {
      this.statusText.setText(message);
      this.statusText.setColor(color);
      return;
    }

    if (this.selectedIndices.length === 0) {
      this.statusText.setText('Selection lock: choose a lead chip.');
      this.statusText.setColor('#7ce8ff');
      return;
    }

    const chips = this.selectedIndices.map((index) => this.hand[index]);
    const names = new Set(chips.filter((chip) => chip.code !== '*').map((chip) => chip.name));
    const codes = new Set(chips.filter((chip) => chip.code !== '*').map((chip) => chip.code));
    const mode = names.size <= 1 ? `NAME ${chips[0].name}` : `CODE ${codes.values().next().value}`;
    this.statusText.setText(`Selection lock: ${mode}  •  ${this.selectedIndices.length}/3`);
    this.statusText.setColor('#c9ffb6');
  }

  private toggleSelection(index: number): void {
    const selectedAt = this.selectedIndices.indexOf(index);
    if (selectedAt >= 0) {
      this.selectedIndices.splice(selectedAt, 1);
      this.renderMenu();
      return;
    }

    if (this.selectedIndices.length >= 3) {
      this.refreshStatusText('Queue full. Confirm or remove a chip first.', '#ffb6be');
      this.pulseStatus();
      return;
    }

    const nextSelection = [...this.selectedIndices, index].map((selectedIndex) => this.hand[selectedIndex]);
    if (!this.isSelectionValid(nextSelection)) {
      this.refreshStatusText('Selection mismatch. Match chip NAME or CODE, or use *.', '#ffb6be');
      this.pulseStatus();
      return;
    }

    this.selectedIndices.push(index);
    this.animateSelectionToQueue(index, this.selectedIndices.length - 1);
    this.renderMenu();
  }

  private isSelectionValid(chips: ChipDefinition[]): boolean {
    if (chips.length <= 1) {
      return true;
    }

    const exactCodeChips = chips.filter((chip) => chip.code !== '*');
    if (exactCodeChips.length <= 1) {
      return true;
    }

    const sameName = exactCodeChips.every((chip) => chip.name === exactCodeChips[0].name);
    const sameCode = exactCodeChips.every((chip) => chip.code === exactCodeChips[0].code);
    return sameName || sameCode;
  }

  private animateSelectionToQueue(cardIndex: number, queueIndex: number): void {
    const card = this.cardVisuals[cardIndex];
    if (!card) {
      return;
    }

    const queueX = SCENE_WIDTH / 2 + MENU_WIDTH / 2 - 164;
    const queueY = SCENE_HEIGHT / 2 - MENU_HEIGHT / 2 + 107 + queueIndex * 88;
    const ghost = this.createChipCard(card.x - CARD_WIDTH / 2, card.y - CARD_HEIGHT / 2, this.hand[cardIndex], false, queueIndex);
    ghost.setDepth(2100);
    this.add.existing(ghost);

    this.tweens.add({
      targets: ghost,
      x: queueX,
      y: queueY,
      scaleX: 0.55,
      scaleY: 0.55,
      alpha: 0.2,
      duration: 240,
      ease: 'Cubic.easeInOut',
      onComplete: () => ghost.destroy(),
    });
  }

  private pulseStatus(): void {
    this.tweens.killTweensOf(this.statusText);
    this.statusText.setScale(1);
    this.tweens.add({
      targets: this.statusText,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 90,
      yoyo: true,
    });
  }

  private animateIn(): void {
    this.tweens.add({ targets: this.overlay, alpha: 1, duration: 180, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: this.root, alpha: 1, y: 0, duration: 240, ease: 'Cubic.easeOut' });
  }

  private handleCardTap(x: number, y: number): void {
    if (this.isClosing || this.cardVisuals.length === 0) return;
    let closest = -1;
    let minDist = CARD_WIDTH * 0.75;
    this.cardVisuals.forEach((v, i) => {
      const dist = Math.abs(x - v.x) + Math.abs(y - v.y);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    if (closest >= 0) {
      this.cursorIndex = closest;
      this.toggleSelection(closest);
    }
  }

  private closeMenu(confirmed: boolean): void {
    if (this.isClosing) {
      return;
    }
    this.isClosing = true;
    this.touch?.destroy();
    this.battleScene.exitCustomMenu(confirmed);

    this.tweens.add({
      targets: this.overlay,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeIn',
    });
    this.tweens.add({
      targets: this.root,
      alpha: 0,
      y: -28,
      duration: 220,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.scene.resume(this.battleKey);
        this.scene.stop();
      },
    });
  }
}
