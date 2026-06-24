import Phaser from 'phaser';
import { KarmaGame, GamePhase } from '../KarmaGame';
import type { PlayerState, PlayResult } from '../KarmaGame';
import type { Card } from '../Card';
import { Rank } from '../Card';
import { aiDecide } from '../AI';
import { isRainbow, canMakeRainbow } from '../Rules';
import { playClick } from '../../../../src/sfx';

// ── Layout (1280 × 720 landscape) ────────────────────────────────────────────
const W = 1280, H = 720, CX = 640;

const AI_TOP  = 44;
const AI_H    = 182;    // AI zone   y = 44  – 226

// Centre zone  y = 226 – 432
const LOG_Y      = 244;
const GUIDE_Y    = 268;
const CARD_ROW_Y = 348;
const DECK_X     = 190;
const PILE_X     = 1090;
const UNDER7_Y   = 412;

// Table zone   y = 432 – 582
const TABLE_LABEL_Y = 440;
const FU_Y          = 466;
const FD_Y          = 542;
const TABLE_XS      = [480, 640, 800] as const;

// Hand zone    y = 582 – 720
const HAND_CY     = 645;
const HAND_CW     = 72;
const HAND_CH     = 102;
const PLAY_BTN_X  = 78;
const TAKE_BTN_X  = 1202;
const SIDE_BTN_Y  = 648;

// Card display sizes
const TBL_CW = 50, TBL_CH = 70;
const AI_CW  = 37, AI_CH  = 52;

const PILE_DROP_R = 108;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface GameData {
  mode: 'solo' | 'local-2p' | 'local-3p' | 'local-4p';
}

// ── Scene ─────────────────────────────────────────────────────────────────────
export class GameScene extends Phaser.Scene {
  private g!: KarmaGame;
  private mode = 'solo';
  private viewerIndex = 0;
  private selectedIds  = new Set<string>();
  private selectedRank: Rank | null = null;
  private logLines: string[] = [];
  private dyn: Phaser.GameObjects.GameObject[] = [];
  private aiTimer: Phaser.Time.TimerEvent | null = null;
  private dragInProgress = false;
  private pileGlow?: Phaser.GameObjects.Arc;

  constructor() { super('KarmaGame'); }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  create(data: GameData): void {
    this.mode           = data?.mode ?? 'solo';
    this.viewerIndex    = 0;
    this.selectedIds    = new Set();
    this.selectedRank   = null;
    this.logLines       = [];
    this.dyn            = [];
    this.dragInProgress = false;
    this.aiTimer?.remove();
    this.aiTimer = null;
    this.pileGlow?.destroy();
    this.pileGlow = undefined;

    const n        = this.mode === 'local-4p' ? 4 : this.mode === 'local-3p' ? 3 : 2;
    const humanIds = this.mode === 'solo'     ? [0]
                   : this.mode === 'local-2p' ? [0, 1]
                   : this.mode === 'local-3p' ? [0, 1, 2] : [0, 1, 2, 3];

    this.g = new KarmaGame(n, humanIds);

    // ── Static background ───────────────────────────────────────────────────
    this.add.rectangle(CX, H / 2, W, H, 0x071410);
    this.add.ellipse(CX, H * 0.44, W * 0.96, H * 0.80, 0x0c1f18, 0.65);

    // Subtle zone dividers
    const div = this.add.graphics();
    div.lineStyle(1, 0x1a3328, 0.55);
    div.lineBetween(20, AI_TOP + AI_H,      W - 20, AI_TOP + AI_H);
    div.lineBetween(20, 432,                 W - 20, 432);
    div.lineBetween(20, 582,                 W - 20, 582);

    // Deck / pile zone backgrounds
    this.add.rectangle(DECK_X, CARD_ROW_Y, 88, 110, 0x0a1c14, 0.7).setStrokeStyle(1, 0x1a3322, 0.8);
    this.add.rectangle(PILE_X, CARD_ROW_Y, 88, 110, 0x0a1c14, 0.7).setStrokeStyle(1, 0x224433, 0.8);

    // Menu button (top-right, always visible)
    const menuBg = this.add.rectangle(W - 54, 22, 88, 32, 0x112820)
      .setStrokeStyle(1, 0x224433).setInteractive({ useHandCursor: true }).setDepth(5);
    this.add.text(W - 54, 22, '≡  Menu', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#668877',
    }).setOrigin(0.5).setDepth(6);
    menuBg.on('pointerdown', () => {
      playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('KarmaMenu'));
    });

    this.doSetup(0);
  }

  // ── Setup phase ─────────────────────────────────────────────────────────────

  private doSetup(step: number): void {
    const humans = this.g.players.filter(p => p.isHuman);
    if (step >= humans.length) { this.beginGame(); return; }
    const pid  = humans[step].id;
    const next = () => this.doSetup(step + 1);
    if (step > 0) {
      this.showPassDevice(this.g.players[pid].name, () => this.showSetup(pid, next));
    } else {
      this.showSetup(pid, next);
    }
  }

  private showSetup(playerId: number, onDone: () => void): void {
    const p   = this.g.players[playerId];
    const sel = new Set<string>();
    // All objects added directly to scene (NOT inside a container) so that
    // pointerover/pointerout events fire correctly — Phaser 3 containers do
    // not reliably forward hover events to interactive children.
    const objs: Phaser.GameObjects.GameObject[] = [];
    const sc = <T extends Phaser.GameObjects.GameObject & { setDepth(v: number): T }>(o: T, d = 20): T => {
      o.setDepth(d); objs.push(o); return o;
    };

    // ── Static backdrop ──────────────────────────────────────────────────────
    sc(this.add.rectangle(CX, H / 2, W, H, 0x000000, 0.92));
    sc(this.add.ellipse(CX, H / 2 + 20, 920, 560, 0x0b1d14, 0.85), 20);

    // Title
    sc(this.add.text(CX, 62, p.name, {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#55997a',
    }).setOrigin(0.5), 21);
    sc(this.add.text(CX, 96, 'Choose your 3 face-up cards', {
      fontFamily: 'Georgia, serif', fontSize: '32px', color: '#00e082',
      stroke: '#001a0d', strokeThickness: 4,
    }).setOrigin(0.5), 21);
    sc(this.add.text(CX, 132, 'They stay face-up all game — everyone can see them', {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#3d7755',
    }).setOrigin(0.5), 21);

    // Counter badge
    const countBg = sc(this.add.rectangle(CX, H / 2 + 146, 230, 46, 0x0d2218)
      .setStrokeStyle(2, 0x1a4433), 21);
    const countTxt = sc(this.add.text(CX, H / 2 + 146, '0 / 3 selected', {
      fontFamily: 'Georgia, serif', fontSize: '18px', color: '#55776a',
    }).setOrigin(0.5), 22);

    // Confirm button — direct on scene so hover events work
    const cfmY  = H / 2 + 210;
    const cfmBg = sc(this.add.rectangle(CX, cfmY, 270, 60, 0x122018)
      .setStrokeStyle(2, 0x1a3328).setOrigin(0.5).setInteractive({ useHandCursor: true }), 21);
    const cfmTxt = sc(this.add.text(CX, cfmY, 'Select 3 cards', {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#2d4a39',
    }).setOrigin(0.5), 22);

    // ── Per-card state helpers ───────────────────────────────────────────────
    const updateCounter = () => {
      const n = sel.size;
      countTxt.setText(`${n} / 3 selected`);
      countTxt.setColor(n === 3 ? '#00ff88' : n > 0 ? '#aaccbb' : '#55776a');
      countBg.setStrokeStyle(2, n === 3 ? 0x00cc77 : 0x1a4433);
      cfmBg.setFillStyle(n === 3 ? 0x007a3e : 0x122018);
      cfmBg.setStrokeStyle(2, n === 3 ? 0x00cc66 : 0x1a3328);
      cfmTxt.setText(n === 3 ? 'Confirm →' : `${3 - n} more to go`);
      cfmTxt.setColor(n === 3 ? '#ffffff' : '#2d4a39');
      if (n === 3) {
        this.tweens.add({ targets: cfmBg, scaleX: 1.05, scaleY: 1.05, duration: 100, yoyo: true });
        this.tweens.add({ targets: countBg, scaleX: 1.05, scaleY: 1.05, duration: 100, yoyo: true });
      }
    };

    // ── 6 hand cards — 2 rows of 3 ──────────────────────────────────────────
    const colW = 132, rowH = 168, cols = 3;
    const baseX = CX - (cols - 1) * colW / 2;
    const baseY = H / 2 - 92;

    p.hand.forEach((card, i) => {
      const cx = baseX + (i % cols) * colW;
      const cy = baseY + Math.floor(i / cols) * rowH;

      const glow = sc(this.add.rectangle(cx, cy, 96, 134, 0x00ff88, 0)
        .setStrokeStyle(3, 0x00ff88, 0), 22);
      const img  = sc(this.add.image(cx, cy, this.cardKey(card))
        .setDisplaySize(88, 122).setInteractive({ useHandCursor: true }), 23);

      const bsx = img.scaleX, bsy = img.scaleY;

      img.on('pointerover', () => {
        if (sel.has(card.id)) return;
        this.tweens.add({ targets: img, scaleX: bsx * 1.10, scaleY: bsy * 1.10, y: cy - 10, duration: 110, ease: 'Sine.easeOut' });
        img.setTint(0xccffdd);
      });
      img.on('pointerout', () => {
        if (sel.has(card.id)) return;
        this.tweens.add({ targets: img, scaleX: bsx, scaleY: bsy, y: cy, duration: 110, ease: 'Sine.easeIn' });
        img.clearTint();
      });
      img.on('pointerdown', () => {
        if (sel.has(card.id)) {
          sel.delete(card.id);
          this.tweens.add({ targets: img, y: cy, scaleX: bsx, scaleY: bsy, duration: 130, ease: 'Back.easeIn' });
          this.tweens.add({ targets: glow, alpha: 0, duration: 120 });
          glow.setStrokeStyle(3, 0x00ff88, 0);
          img.clearTint();
        } else if (sel.size < 3) {
          sel.add(card.id);
          this.tweens.add({ targets: img, y: cy - 20, scaleX: bsx * 1.05, scaleY: bsy * 1.05, duration: 160, ease: 'Back.easeOut' });
          this.tweens.add({ targets: glow, alpha: 0.35, duration: 120 });
          glow.setStrokeStyle(3, 0x00ff88, 0.85);
          img.setTint(0x88ffaa);
          playClick();
        }
        updateCounter();
      });
    });

    // Confirm button interactions (direct on scene = hover works)
    cfmBg.on('pointerover', () => { if (sel.size === 3) cfmBg.setFillStyle(0x009955); });
    cfmBg.on('pointerout',  () => { cfmBg.setFillStyle(sel.size === 3 ? 0x007a3e : 0x122018); });
    cfmBg.on('pointerdown', () => {
      if (sel.size !== 3) {
        // Shake + flash red to signal "not ready yet"
        const origColor = 0x122018;
        cfmBg.setFillStyle(0x441111).setStrokeStyle(2, 0xcc3322);
        this.tweens.add({
          targets: [cfmBg, cfmTxt], x: CX + 10, duration: 40,
          yoyo: true, repeat: 4, ease: 'Sine.easeInOut',
          onComplete: () => {
            cfmBg.setX(CX); cfmTxt.setX(CX);
            cfmBg.setFillStyle(origColor).setStrokeStyle(2, 0x1a3328);
          },
        });
        return;
      }
      playClick();
      this.g.playerSetup(playerId, [...sel]);
      // Fade out all setup objects
      this.tweens.add({
        targets: objs, alpha: 0, duration: 220,
        onComplete: () => { objs.forEach(o => o.destroy()); onDone(); },
      });
    });
  }

  private beginGame(): void {
    this.g.startGame();
    this.renderAll();
    this.startTurn();
  }

  // ── Turn flow ────────────────────────────────────────────────────────────────

  private startTurn(): void {
    if (this.g.phase === GamePhase.End) return;
    const cp     = this.g.currentPlayer;
    const player = this.g.players[cp];
    this.clearSel();
    this.renderAll();

    if (!player.isHuman) {
      this.scheduleAI();
    } else if (this.mode.startsWith('local') && cp !== this.viewerIndex) {
      this.showPassDevice(player.name, () => {
        this.viewerIndex = cp;
        this.renderAll();
      });
    }
  }

  private scheduleAI(): void {
    this.aiTimer?.remove();
    this.aiTimer = this.time.delayedCall(1100, () => {
      const cp  = this.g.currentPlayer;
      const dec = aiDecide(this.g, cp);
      const res: PlayResult =
        dec.action === 'play' ? this.g.playCards(dec.cardIds)
        : dec.action === 'flip' ? this.g.flipFaceDown(dec.slotIndex)
        : this.g.takePile();
      this.handleResult(res);
    });
  }

  private handleResult(res: PlayResult): void {
    this.logLines.unshift(res.message);
    if (this.logLines.length > 4) this.logLines.length = 4;
    if (res.burnedPile) this.flashEffect(PILE_X, CARD_ROW_Y, 0xff6600);
    if (res.gameOver) {
      this.renderAll();
      this.time.delayedCall(700, () => this.showEnd(res));
    } else {
      this.clearSel();
      this.time.delayedCall(300, () => this.startTurn());
    }
  }

  private clearSel(): void { this.selectedIds.clear(); this.selectedRank = null; }

  // ── Human actions ────────────────────────────────────────────────────────────

  private attemptPlay(): void {
    if (this.selectedIds.size === 0) return;
    playClick();
    this.flashEffect(PILE_X, CARD_ROW_Y, 0x00ff88);
    this.handleResult(this.g.playCards([...this.selectedIds]));
  }

  private attemptTakePile(): void {
    if (this.g.pile.length === 0) return;
    playClick();
    this.handleResult(this.g.takePile());
  }

  private toggleSel(cardId: string, rank: Rank): void {
    const hand = this.g.players[this.g.currentPlayer].hand;
    if (this.selectedIds.has(cardId)) {
      this.selectedIds.delete(cardId);
      if (this.selectedIds.size === 0) { this.selectedRank = null; }
      else {
        const rem = hand.filter(c => this.selectedIds.has(c.id));
        this.selectedRank = rem.every(c => c.rank === rem[0].rank) ? rem[0].rank : null;
      }
    } else {
      const newCard = hand.find(c => c.id === cardId);
      if (!newCard) return;
      if (this.selectedIds.size === 0) {
        this.selectedIds.add(cardId); this.selectedRank = rank;
      } else if (this.selectedRank !== null && this.selectedRank === rank) {
        this.selectedIds.add(cardId);
      } else if (this.selectedIds.size < 4 && newCard.suit !== null) {
        const suits = new Set(hand.filter(c => this.selectedIds.has(c.id)).map(c => c.suit));
        if (!suits.has(newCard.suit)) { this.selectedIds.add(cardId); this.selectedRank = null; }
        else { this.selectedIds.clear(); this.selectedIds.add(cardId); this.selectedRank = rank; }
      } else {
        this.selectedIds.clear(); this.selectedIds.add(cardId); this.selectedRank = rank;
      }
    }
    this.renderAll();
  }

  // ── Dynamic object pool ──────────────────────────────────────────────────────

  private addDyn<T extends Phaser.GameObjects.GameObject>(o: T): T { this.dyn.push(o); return o; }
  private clearDyn(): void { this.dyn.forEach(o => { this.tweens.killTweensOf(o); o.destroy(); }); this.dyn = []; }

  renderAll(): void {
    if (this.dragInProgress) return;
    this.clearDyn();
    this.renderTopBar();
    this.renderAIZone();
    this.renderCenter();
    this.renderHumanTable();
    this.renderHumanHand();
    this.renderActionButtons();
  }

  // ── Render: top bar ──────────────────────────────────────────────────────────

  private renderTopBar(): void {
    const cp     = this.g.currentPlayer;
    const myTurn = cp === this.viewerIndex && this.g.phase === GamePhase.Play;
    const name   = this.g.players[cp].name;
    const txt    = this.g.phase === GamePhase.Play
      ? (myTurn ? '▶  Your turn' : `${name}'s turn`)
      : 'Game Over';
    this.addDyn(this.add.rectangle(CX / 2, 22, CX - 40, 36, 0x0d2218, 0.9));
    this.addDyn(this.add.text(CX / 2, 22, txt, {
      fontFamily: 'Georgia, serif', fontSize: '18px',
      color: myTurn ? '#00ff88' : '#77aa99',
    }).setOrigin(0.5));
  }

  // ── Render: AI zone ──────────────────────────────────────────────────────────

  private renderAIZone(): void {
    const others = this.g.players.filter(p => p.id !== this.viewerIndex);
    if (others.length === 0) return;
    const pw = Math.floor(W / others.length);
    others.forEach((p, i) => this.renderPlayerPanel(p, i * pw, AI_TOP, pw, AI_H));
  }

  private renderPlayerPanel(p: PlayerState, px: number, py: number, pw: number, ph: number): void {
    const isActive = p.id === this.g.currentPlayer;
    const pcx = px + pw / 2;

    this.addDyn(
      this.add.rectangle(pcx, py + ph / 2, pw - 4, ph - 4, 0x0c1d16, 0.92)
        .setStrokeStyle(isActive ? 2 : 1, isActive ? 0x00ff88 : 0x1a3328),
    );

    // Name + FD count
    const fdLeft = p.faceDown.filter(c => c !== null).length;
    this.addDyn(this.add.text(pcx, py + 18, p.name + (isActive ? ' ▶' : ''), {
      fontFamily: 'Georgia, serif', fontSize: '14px',
      color: isActive ? '#00ff88' : '#66997a',
    }).setOrigin(0.5));
    if (fdLeft > 0) {
      this.addDyn(this.add.text(px + pw - 10, py + 18, `FD: ${fdLeft}`, {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#3d5e4e',
      }).setOrigin(1, 0.5));
    }

    // Hand backs
    const hc    = p.hand.length;
    const maxB  = Math.min(hc, Math.floor((pw - 60) / 20) + 1, 10);
    const bsp   = maxB > 1 ? Math.min(24, (pw - 60) / (maxB - 1)) : 0;
    const bstX  = pcx - (maxB - 1) * bsp / 2;
    for (let i = 0; i < maxB; i++) {
      this.addDyn(this.add.image(bstX + i * bsp, py + 80, 'cardBack').setDisplaySize(AI_CW, AI_CH));
    }
    if (hc === 0) {
      this.addDyn(this.add.text(pcx, py + 80, 'empty hand', {
        fontFamily: 'Georgia, serif', fontSize: '11px', color: '#2a4433',
      }).setOrigin(0.5));
    } else if (hc > maxB) {
      this.addDyn(this.add.text(pcx, py + 108, `+${hc - maxB} more`, {
        fontFamily: 'Georgia, serif', fontSize: '10px', color: '#3d5e4e',
      }).setOrigin(0.5));
    }

    // Face-up table cards (3 columns, right area of panel)
    const fuXs = [pcx - 56, pcx, pcx + 56];
    for (let i = 0; i < 3; i++) {
      const tx = fuXs[i];
      if (p.faceUp[i]) {
        this.addDyn(this.add.image(tx, py + 158, this.cardKey(p.faceUp[i]!)).setDisplaySize(AI_CW, AI_CH));
      } else {
        this.addDyn(this.add.rectangle(tx, py + 158, AI_CW - 2, AI_CH - 2, 0x0a1610).setStrokeStyle(1, 0x1a3322));
      }
    }
  }

  // ── Render: centre zone ──────────────────────────────────────────────────────

  private renderCenter(): void {
    const topCard = this.g.pile.length > 0 ? this.g.pile[this.g.pile.length - 1] : null;
    const cp      = this.g.currentPlayer;
    const source  = this.g.getSource(this.viewerIndex);
    const myTurn  = cp === this.viewerIndex && this.g.phase === GamePhase.Play;

    // Event log (most recent)
    if (this.logLines[0]) {
      this.addDyn(this.add.text(CX, LOG_Y, this.logLines[0], {
        fontFamily: 'Georgia, serif', fontSize: '15px', color: '#88ddbb',
        wordWrap: { width: 760 }, align: 'center',
      }).setOrigin(0.5));
    }

    // Guidance hint
    let guide = '';
    if (myTurn) {
      if (source === 'hand') {
        const n = this.selectedIds.size;
        guide = n === 0
          ? 'Tap cards to select, then tap ▶ PLAY  — or drag a card to the pile'
          : `${n} card${n > 1 ? 's' : ''} selected — tap ▶ PLAY or drag to pile`;
      } else if (source === 'faceup') {
        guide = 'Tap a face-up card to play it';
      } else if (source === 'facedown') {
        guide = 'Tap a face-down card to reveal it!';
      }
    }
    if (guide) {
      this.addDyn(this.add.text(CX, GUIDE_Y, guide, {
        fontFamily: 'Georgia, serif', fontSize: '13px', color: '#446655',
        wordWrap: { width: 700 }, align: 'center',
      }).setOrigin(0.5));
    }

    // Under-7 banner
    if (this.g.under7) {
      this.addDyn(this.add.text(CX, UNDER7_Y, '⬇  Must play UNDER 7!', {
        fontFamily: 'Georgia, serif', fontSize: '16px', color: '#ffdd44',
        backgroundColor: '#111100', padding: { x: 12, y: 4 },
      }).setOrigin(0.5));
    }

    // Deck
    this.addDyn(this.add.text(DECK_X, CARD_ROW_Y - 56, `Deck  ${this.g.deck.length}`, {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#448866',
    }).setOrigin(0.5));
    if (this.g.deck.length > 0) {
      this.addDyn(this.add.image(DECK_X, CARD_ROW_Y, 'cardBack').setDisplaySize(TBL_CW, TBL_CH));
    } else {
      this.addDyn(this.add.text(DECK_X, CARD_ROW_Y, 'Empty', {
        fontFamily: 'Georgia, serif', fontSize: '12px', color: '#2a4433',
      }).setOrigin(0.5));
    }

    // Pile
    this.addDyn(this.add.text(PILE_X, CARD_ROW_Y - 56, `Pile  ${this.g.pile.length}`, {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#448866',
    }).setOrigin(0.5));
    if (topCard) {
      const depth = Math.min(this.g.pile.length - 1, 3);
      for (let i = depth; i > 0; i--) {
        this.addDyn(this.add.image(PILE_X + i * 2, CARD_ROW_Y + i * 2, 'cardBack')
          .setDisplaySize(TBL_CW, TBL_CH).setAlpha(0.2));
      }
      this.addDyn(this.add.image(PILE_X, CARD_ROW_Y, this.cardKey(topCard)).setDisplaySize(TBL_CW, TBL_CH));
    } else {
      this.addDyn(this.add.text(PILE_X, CARD_ROW_Y, 'Empty', {
        fontFamily: 'Georgia, serif', fontSize: '12px', color: '#2a4433',
      }).setOrigin(0.5));
    }
  }

  // ── Render: human table cards ─────────────────────────────────────────────────

  private renderHumanTable(): void {
    const p       = this.g.players[this.viewerIndex];
    const source  = this.g.getSource(this.viewerIndex);
    const myTurn  = this.g.currentPlayer === this.viewerIndex && this.g.phase === GamePhase.Play;

    this.addDyn(this.add.text(CX, TABLE_LABEL_Y, 'YOUR TABLE', {
      fontFamily: 'Georgia, serif', fontSize: '11px', color: '#2d5544',
      letterSpacing: 3,
    }).setOrigin(0.5));

    for (let i = 0; i < 3; i++) {
      const tx  = TABLE_XS[i];
      const fu  = p.faceUp[i];
      const fd  = p.faceDown[i];

      // Face-up
      if (fu) {
        const img = this.addDyn(this.add.image(tx, FU_Y, this.cardKey(fu)).setDisplaySize(TBL_CW, TBL_CH));
        if (myTurn && source === 'faceup') {
          img.setInteractive({ useHandCursor: true }).setTint(0xaaffcc);
          const bsx = img.scaleX, bsy = img.scaleY;
          img.on('pointerdown', () => { playClick(); this.handleResult(this.g.playCards([fu.id])); });
          img.on('pointerover', () => { img.setTint(0x88ffaa); img.setScale(bsx * 1.14, bsy * 1.14); });
          img.on('pointerout',  () => { img.setTint(0xaaffcc); img.setScale(bsx, bsy); });
        }
      } else {
        this.addDyn(this.add.rectangle(tx, FU_Y, TBL_CW - 2, TBL_CH - 2, 0x091510).setStrokeStyle(1, 0x1a3322));
      }

      // Face-down
      if (fd) {
        const img = this.addDyn(this.add.image(tx, FD_Y, 'cardBack').setDisplaySize(TBL_CW, TBL_CH));
        if (myTurn && source === 'facedown') {
          img.setInteractive({ useHandCursor: true }).setTint(0xaaffcc);
          const bsx = img.scaleX, bsy = img.scaleY;
          img.on('pointerdown', () => { playClick(); this.handleResult(this.g.flipFaceDown(i)); });
          img.on('pointerover', () => { img.setTint(0x88ffaa); img.setScale(bsx * 1.14, bsy * 1.14); });
          img.on('pointerout',  () => { img.setTint(0xaaffcc); img.setScale(bsx, bsy); });
        }
      } else {
        this.addDyn(this.add.rectangle(tx, FD_Y, TBL_CW - 2, TBL_CH - 2, 0x091510).setStrokeStyle(1, 0x1a3322));
      }
    }
  }

  // ── Render: human hand ────────────────────────────────────────────────────────

  private renderHumanHand(): void {
    const p       = this.g.players[this.viewerIndex];
    const source  = this.g.getSource(this.viewerIndex);
    const cp      = this.g.currentPlayer;
    const myTurn  = cp === this.viewerIndex && this.g.phase === GamePhase.Play && source === 'hand';
    const hand    = p.hand;

    if (hand.length === 0) {
      this.addDyn(this.add.text(CX, HAND_CY, 'No cards in hand', {
        fontFamily: 'Georgia, serif', fontSize: '16px', color: '#2d4433',
      }).setOrigin(0.5));
      return;
    }

    const selCards     = hand.filter(c => this.selectedIds.has(c.id));
    const selIsRainbow = selCards.length === 4 && isRainbow(selCards);
    const rbPossible   = myTurn && canMakeRainbow(hand);

    const n       = hand.length;
    // Constrain span to x=[168, 1112] to leave room for side buttons
    const maxSpan = 944;
    const spacing = n <= 1 ? 0 : Math.min(HAND_CW + 6, maxSpan / (n - 1));
    const startX  = CX - ((n - 1) * spacing) / 2;

    hand.forEach((card, idx) => {
      const isSel    = this.selectedIds.has(card.id);
      const isSame   = !isSel && this.selectedRank !== null && this.selectedRank === card.rank;
      const isRbHint = !isSel && !isSame && rbPossible && card.suit !== null && !selIsRainbow;
      const cx = startX + idx * spacing;
      const cy = HAND_CY - (isSel ? 22 : 0);

      const img = this.addDyn(
        this.add.image(cx, cy, this.cardKey(card)).setDisplaySize(HAND_CW, HAND_CH),
      );
      img.setDepth(idx + (isSel ? 60 : 0));

      if      (isSel)    { img.setTint(0xaaffcc); }
      else if (isSame)   { img.setTint(0xccffee); img.setAlpha(0.92); }
      else if (isRbHint) { img.setTint(0xffffaa); }
      else if (!myTurn)  { img.setAlpha(0.42); }

      // Raised selection glow border
      if (isSel) {
        this.addDyn(
          this.add.rectangle(cx, cy, HAND_CW + 6, HAND_CH + 6, 0x000000, 0)
            .setStrokeStyle(2, 0x00ff88, 0.9).setDepth(idx + 55),
        );
      }

      if (!myTurn) return;

      img.setInteractive({ useHandCursor: true });
      let dragged = false;

      img.on('dragstart', () => {
        dragged = true;
        this.dragInProgress = true;
        // Auto-select all same-rank unless in rainbow mode
        const inRainbow = this.selectedRank === null && this.selectedIds.size > 1;
        if (!inRainbow || !this.selectedIds.has(card.id)) {
          this.selectedIds.clear(); this.selectedRank = card.rank;
          for (const c of hand) { if (c.rank === card.rank) this.selectedIds.add(c.id); }
        }
        img.setDepth(100);
        this.children.bringToTop(img);
        this.showPileGlow();
      });

      img.on('drag', (_ptr: Phaser.Input.Pointer, dx: number, dy: number) => {
        img.setPosition(dx, dy);
      });

      img.on('dragend', (ptr: Phaser.Input.Pointer) => {
        this.hidePileGlow();
        this.dragInProgress = false;
        const dist = Phaser.Math.Distance.Between(ptr.x, ptr.y, PILE_X, CARD_ROW_Y);
        if (dist < PILE_DROP_R) {
          this.attemptPlay();
        } else {
          img.setPosition(cx, cy);
          this.time.delayedCall(16, () => this.renderAll());
        }
      });

      img.on('pointerup', () => {
        if (!dragged) this.toggleSel(card.id, card.rank);
        dragged = false;
      });

      // Capture base scale set by setDisplaySize so hover multiplies correctly
      const bsx = img.scaleX, bsy = img.scaleY;
      img.on('pointerover', () => { if (!isSel) img.setScale(bsx * 1.10, bsy * 1.10); });
      img.on('pointerout',  () => img.setScale(bsx, bsy));

      this.input.setDraggable(img);
    });
  }

  // ── Render: action buttons ────────────────────────────────────────────────────

  private renderActionButtons(): void {
    const cp      = this.g.currentPlayer;
    const myTurn  = cp === this.viewerIndex && this.g.phase === GamePhase.Play;
    const source  = this.g.getSource(this.viewerIndex);

    if (!myTurn || source !== 'hand') return;

    const n      = this.selectedIds.size;
    const sc     = this.g.players[this.viewerIndex].hand.filter(c => this.selectedIds.has(c.id));
    const rb     = n === 4 && isRainbow(sc);
    const active = n > 0;

    // ── PLAY button (left) ──────────────────────────────────────────────────
    const playColor  = active ? (rb ? 0xaa6600 : 0x006e3c) : 0x1a3328;
    const playLabel1 = rb ? '🌈 RAINBOW' : '▶  PLAY';
    const playLabel2 = n === 0 ? 'select cards' : `${n} card${n > 1 ? 's' : ''}`;

    const playCont = this.add.container(PLAY_BTN_X, SIDE_BTN_Y).setDepth(10);
    const playBg   = this.add.rectangle(0, 0, 132, 92, playColor)
      .setStrokeStyle(2, active ? 0x00cc77 : 0x224433).setOrigin(0.5)
      .setInteractive({ useHandCursor: active });
    const playT1   = this.add.text(0, -14, playLabel1, {
      fontFamily: 'Georgia, serif', fontSize: '17px',
      color: active ? '#ffffff' : '#3d5544',
    }).setOrigin(0.5);
    const playT2   = this.add.text(0, 14, playLabel2, {
      fontFamily: 'Georgia, serif', fontSize: '13px',
      color: active ? '#aaffcc' : '#2d4433',
    }).setOrigin(0.5);
    playCont.add([this.add.rectangle(3, 5, 132, 92, 0x000000, 0.3).setOrigin(0.5), playBg, playT1, playT2]);
    this.addDyn(playCont);

    if (active) {
      const hc = rb ? 0xcc8800 : 0x009955;
      playBg.on('pointerover', () => playBg.setFillStyle(hc));
      playBg.on('pointerout',  () => playBg.setFillStyle(playColor));
      playBg.on('pointerdown', () => { this.tweens.add({ targets: playCont, y: SIDE_BTN_Y + 3, duration: 55 }); });
      playBg.on('pointerup',   () => {
        this.tweens.add({ targets: playCont, y: SIDE_BTN_Y, duration: 55 });
        this.attemptPlay();
      });
    }

    // ── TAKE PILE button (right) ────────────────────────────────────────────
    const pileCount   = this.g.pile.length;
    const takeActive  = pileCount > 0;
    const takeColor   = takeActive ? 0x4a1818 : 0x1a1818;
    const takeCont    = this.add.container(TAKE_BTN_X, SIDE_BTN_Y).setDepth(10);
    const takeBg      = this.add.rectangle(0, 0, 132, 92, takeColor)
      .setStrokeStyle(2, takeActive ? 0x884433 : 0x2a1a1a).setOrigin(0.5)
      .setInteractive({ useHandCursor: takeActive });
    const takeT1      = this.add.text(0, -14, 'TAKE', {
      fontFamily: 'Georgia, serif', fontSize: '17px',
      color: takeActive ? '#ffaabb' : '#3d2222',
    }).setOrigin(0.5);
    const takeT2      = this.add.text(0, 14, `PILE  (${pileCount})`, {
      fontFamily: 'Georgia, serif', fontSize: '13px',
      color: takeActive ? '#cc8888' : '#2a1818',
    }).setOrigin(0.5);
    takeCont.add([this.add.rectangle(3, 5, 132, 92, 0x000000, 0.3).setOrigin(0.5), takeBg, takeT1, takeT2]);
    this.addDyn(takeCont);

    if (takeActive) {
      takeBg.on('pointerover', () => takeBg.setFillStyle(0x661a1a));
      takeBg.on('pointerout',  () => takeBg.setFillStyle(takeColor));
      takeBg.on('pointerdown', () => { this.tweens.add({ targets: takeCont, y: SIDE_BTN_Y + 3, duration: 55 }); });
      takeBg.on('pointerup',   () => {
        this.tweens.add({ targets: takeCont, y: SIDE_BTN_Y, duration: 55 });
        this.attemptTakePile();
      });
    }
  }

  // ── Overlays ─────────────────────────────────────────────────────────────────

  private showPassDevice(name: string, onReady: () => void): void {
    const o = this.add.container(0, 0).setDepth(30);
    o.add([
      this.add.rectangle(CX, H / 2, W, H, 0x000000, 0.92),
      this.add.text(CX, H / 2 - 90, 'Pass the screen!', {
        fontFamily: 'Georgia, serif', fontSize: '32px', color: '#00e082',
      }).setOrigin(0.5),
      this.add.text(CX, H / 2 - 20, name, {
        fontFamily: 'Georgia, serif', fontSize: '52px', color: '#ffffff',
        stroke: '#004422', strokeThickness: 5,
      }).setOrigin(0.5),
      this.add.text(CX, H / 2 + 52, "it's your turn!", {
        fontFamily: 'Georgia, serif', fontSize: '22px', color: '#99bbaa',
      }).setOrigin(0.5),
    ]);
    const btn = this.makeOverlayBtn(CX, H / 2 + 130, 200, 54, 'Ready →', 0x00914f);
    o.add(btn.cont);
    btn.bg.on('pointerdown', () => { playClick(); o.destroy(); onReady(); });
  }

  private showEnd(res: PlayResult): void {
    const o        = this.add.container(0, 0).setDepth(40);
    const myName   = this.g.players[this.viewerIndex].name;
    const winName  = res.winner  !== undefined ? this.g.players[res.winner]?.name  : undefined;
    const shName   = res.shithead !== undefined ? this.g.players[res.shithead]?.name : undefined;
    const iWon     = winName === myName;

    o.add([
      this.add.rectangle(CX, H / 2, W, H, 0x000000, 0.90),
      this.add.text(CX, H / 2 - 120, iWon ? '🎉  You Win!' : 'Game Over', {
        fontFamily: 'Georgia, serif', fontSize: '60px',
        color: iWon ? '#00ff88' : '#ff6655',
        stroke: '#001a0d', strokeThickness: 7,
      }).setOrigin(0.5),
    ]);

    const lines: string[] = [];
    if (winName) lines.push(`${winName} finished first!`);
    if (shName && shName !== winName) lines.push(`${shName} is the Karma 💀`);
    if (lines.length) {
      o.add(this.add.text(CX, H / 2 - 30, lines.join('\n'), {
        fontFamily: 'Georgia, serif', fontSize: '24px', color: '#bbddcc',
        align: 'center', lineSpacing: 10,
      }).setOrigin(0.5));
    }

    const agBtn = this.makeOverlayBtn(CX - 110, H / 2 + 90, 200, 56, '▶  Play Again', 0x00914f);
    const mnBtn = this.makeOverlayBtn(CX + 110, H / 2 + 90, 180, 48, '≡  Menu',       0x334444);
    o.add([agBtn.cont, mnBtn.cont]);

    agBtn.bg.on('pointerdown', () => {
      playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('KarmaGame', { mode: this.mode }));
    });
    mnBtn.bg.on('pointerdown', () => {
      playClick();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('KarmaMenu'));
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private cardKey(card: Card): string {
    if (card.rank === Rank.Joker) return 'cardJoker';
    const r  = card.rank;
    const rs = r <= 10 ? String(r) : r === Rank.Jack ? 'J' : r === Rank.Queen ? 'Q' : r === Rank.King ? 'K' : 'A';
    return `card${card.suit}${rs}`;
  }

  private makeOverlayBtn(
    x: number, y: number, bw: number, bh: number, label: string, color: number,
  ): { cont: Phaser.GameObjects.Container; bg: Phaser.GameObjects.Rectangle } {
    const cont = this.add.container(x, y).setDepth(10);
    const bg   = this.add.rectangle(0, 0, bw, bh, color)
      .setStrokeStyle(2, 0x009966).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const txt  = this.add.text(0, 0, label, {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#ffffff',
    }).setOrigin(0.5);
    cont.add([this.add.rectangle(3, 4, bw, bh, 0x000000, 0.35).setOrigin(0.5), bg, txt]);
    const hc = Math.min(color + 0x1a2820, 0xffffff);
    bg.on('pointerover', () => bg.setFillStyle(hc));
    bg.on('pointerout',  () => bg.setFillStyle(color));
    return { cont, bg };
  }

  private showPileGlow(): void {
    this.pileGlow?.destroy();
    this.pileGlow = this.add.circle(PILE_X, CARD_ROW_Y, 52, 0x00ff88, 0)
      .setStrokeStyle(3, 0x00ff88, 0.9).setDepth(3);
    this.tweens.add({ targets: this.pileGlow, alpha: 0.45, duration: 220, yoyo: true, repeat: -1 });
  }

  private hidePileGlow(): void {
    if (this.pileGlow) this.tweens.killTweensOf(this.pileGlow);
    this.pileGlow?.destroy();
    this.pileGlow = undefined;
  }

  private flashEffect(x: number, y: number, color: number): void {
    const ring = this.add.circle(x, y, 44, color, 0.5).setDepth(8);
    this.tweens.add({
      targets: ring, alpha: 0, scaleX: 2.4, scaleY: 2.4,
      duration: 380, ease: 'Sine.easeOut',
      onComplete: () => ring.destroy(),
    });
  }
}
