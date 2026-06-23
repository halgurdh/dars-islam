import Phaser from 'phaser';
import { playClick } from '@src/sfx';
import { rfNetwork } from '../net/NetworkManager';
import type { RFMember } from '../net/protocol';
import { Deck } from '../objects/Deck';
import { Card, HAND_CARD_W, HAND_CARD_H, PLAY_CARD_W, PLAY_CARD_H } from '../objects/Card';
import { type CardDef, cardChips } from '../data/cards';
import { HAND_BASE, evaluateHand, scoringCards } from '../data/pokerHands';

// ─── Layout constants (720 × 1280 portrait canvas) ────────────────────────────
const W  = 720;
const H  = 1280;
const CX = W / 2;

const HUD_Y         = 50;   // top strip centre
const JOKER_Y       = 148;  // joker slots row centre
const HAND_TYPE_Y   = 232;  // hand-type label
const PLAY_ZONE_Y   = 420;  // played card centre
const SCORE_DISP_Y  = 568;  // chips × mult boxes centre
const HAND_Y        = 762;  // player's hand card centre
const STATUS_Y      = 905;  // hands / discards / deck row
const BTN_Y         = 992;  // Play Hand button centre
const DISCARD_BTN_Y = 1076; // Discard button centre

const HAND_SPACING  = 72;   // x-distance between card centres in hand (8 cards)
const PLAY_SPACING  = 106;  // x-distance between card centres in play zone (5 max)

const HAND_SIZE     = 8;
const MAX_SELECTED  = 5;

// ─── Blind progression ────────────────────────────────────────────────────────
const BLIND_NAMES  = ['Small Blind', 'Big Blind', 'Boss Blind'];
const BLIND_SCORES: number[][] = [
  [300,   450,    600],
  [800,   1200,   1600],
  [2000,  3000,   4000],
  [5000,  7500,   10000],
  [11000, 16500,  22000],
  [20000, 30000,  40000],
  [35000, 52500,  70000],
  [50000, 75000,  100000],
];
const GOLD_REWARD = [4, 5, 6, 7, 8, 8, 9, 9];

const enum Phase { DEALING, PLAYER, PLAYING, SCORING, DISCARDING, ROUND_OVER, GAME_OVER }

export class PlayScene extends Phaser.Scene {
  // ── Online mode ──────────────────────────────────────────────────────────────
  private online = false;
  private _sbRows: Array<{
    name: Phaser.GameObjects.Text;
    score: Phaser.GameObjects.Text;
    status: Phaser.GameObjects.Text;
  }> = [];

  // ── Game state ──────────────────────────────────────────────────────────────
  private ante          = 0;
  private blind         = 0;
  private totalScore    = 0;
  private handsLeft     = 4;
  private discardsLeft  = 3;
  private gold          = 4;
  private phase: Phase  = Phase.DEALING;

  private deck!: Deck;
  private handCards: Card[]   = [];
  private playedCards: Card[] = [];

  // ── HUD text refs ────────────────────────────────────────────────────────────
  private scoreText!: Phaser.GameObjects.Text;
  private blindText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private anteText!: Phaser.GameObjects.Text;
  private handTypeText!: Phaser.GameObjects.Text;
  private chipsVal!: Phaser.GameObjects.Text;
  private multVal!: Phaser.GameObjects.Text;
  private roundScoreText!: Phaser.GameObjects.Text;
  private handsText!: Phaser.GameObjects.Text;
  private discardsText!: Phaser.GameObjects.Text;
  private deckText!: Phaser.GameObjects.Text;
  // Buttons are plain Rectangles (interactive) — Container children lose input tracking
  private playBtn!: Phaser.GameObjects.Rectangle;
  private discardBtn!: Phaser.GameObjects.Rectangle;
  private overlay!: Phaser.GameObjects.Container;
  // Overlay action button lives outside the overlay container so it stays on the display list
  private _overlayBtn?: Phaser.GameObjects.Rectangle;
  private _overlayBtnTxt?: Phaser.GameObjects.Text;

  constructor() { super('Play'); }

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  create(): void {
    const data = this.scene.settings.data as Record<string, unknown> | undefined;
    this.online = data?.['online'] === true;

    this._resetRun();
    this._buildBackground();
    this._buildHUD();
    this._buildJokerArea();
    this._buildHandTypeDisplay();
    this._buildPlayZone();
    this._buildScoreDisplay();
    this._buildActionButtons();
    this._buildStatusBar();
    this.overlay = this.add.container(CX, H / 2).setDepth(50).setVisible(false);
    if (this.online) this._initOnlineHandlers();
    this._startRound();
  }

  shutdown(): void {
    rfNetwork.onRosterUpdate = undefined;
    rfNetwork.onNextBlind    = undefined;
    rfNetwork.onGameOver     = undefined;
  }

  // ─── Run / Round ─────────────────────────────────────────────────────────────

  private _resetRun(): void {
    this.ante        = 0;
    this.blind       = 0;
    this.totalScore  = 0;
    this.gold        = 4;
    this.handCards   = [];
    this.playedCards = [];
  }

  private _startRound(): void {
    this.handsLeft    = 4;
    this.discardsLeft = 3;
    this.totalScore   = 0;
    this.phase        = Phase.DEALING;
    this.deck         = new Deck();

    this.handCards.forEach(c => c.destroy());
    this.handCards = [];
    this.playedCards.forEach(c => c.destroy());
    this.playedCards = [];

    this._updateHUD();
    this._setHandTypeText('');
    this._resetScoreDisplay();
    this._updateButtons();
    this._updateStatus();
    this._dealInitialHand();
  }

  // ─── Dealing ─────────────────────────────────────────────────────────────────

  private _dealInitialHand(): void {
    const drawn = this.deck.draw(HAND_SIZE);
    const positions = this._handPositions(HAND_SIZE);

    drawn.forEach((def, i) => {
      const card = new Card(this, positions[i].x, H + 100, def.suit, def.rank);
      card.baseY = positions[i].y;
      card.setDepth(10 + i);
      this.handCards.push(card);

      this.tweens.add({
        targets: card,
        x: positions[i].x,
        y: positions[i].y,
        duration: 340,
        ease: 'Back.easeOut',
        delay: i * 55,
        onComplete: () => {
          if (i === drawn.length - 1) this._flipHandCards();
        },
      });
    });
  }

  private _flipHandCards(): void {
    const flips = this.handCards.map((card, i) => card.flipUp(i * 50));
    Promise.all(flips).then(() => {
      this.handCards.forEach(c => {
        c.removeAllListeners('card:tap');
        c.setInteractable(true).on('card:tap', this._onCardTap, this);
      });
      this.phase = Phase.PLAYER;
      this._updateButtons();
    });
  }

  /**
   * Draws replacement cards to fill the hand to HAND_SIZE.
   * New cards are appended to `handCards`, then all cards are repositioned
   * via `_repositionHand()`. New cards flip after arriving.
   */
  private _drawReplacements(slotsNeeded: number): Promise<void> {
    if (slotsNeeded === 0) return Promise.resolve();
    const drawn = this.deck.draw(slotsNeeded);

    // Create cards off-screen bottom
    drawn.forEach((def, i) => {
      const card = new Card(this, CX, H + 80, def.suit, def.rank);
      card.setDepth(10 + this.handCards.length + i);
      this.handCards.push(card);
    });

    // Reposition ALL hand cards (fills gaps and places new ones)
    this._repositionHand();

    // Flip new cards after they arrive
    const newCards = this.handCards.slice(-drawn.length);
    return Promise.all(
      newCards.map((card, i) =>
        new Promise<void>(resolve => {
          this.time.delayedCall(i * 55 + 310, () => {
            card.flipUp().then(() => {
              card.removeAllListeners('card:tap');
              card.setInteractable(true).on('card:tap', this._onCardTap, this);
              resolve();
            });
          });
        }),
      ),
    ).then(() => { /* void */ });
  }

  // ─── Card interaction ─────────────────────────────────────────────────────────

  private _onCardTap(card: Card): void {
    if (this.phase !== Phase.PLAYER) return;

    const alreadySelected = card.selected;
    const selectedCount   = this.handCards.filter(c => c.selected).length;

    if (!alreadySelected && selectedCount >= MAX_SELECTED) {
      this._shakeCard(card);
      return;
    }

    playClick();
    card.select(!alreadySelected);
    this._updateButtons();
    this._previewHandType();
  }

  private _shakeCard(card: Card): void {
    this.tweens.add({ targets: card, x: card.x + 7, duration: 45, yoyo: true, repeat: 3 });
  }

  private _previewHandType(): void {
    const selected = this.handCards.filter(c => c.selected);
    if (selected.length === 0) { this._setHandTypeText(''); return; }

    const defs: CardDef[] = selected.map(c => ({ suit: c.suit, rank: c.rank }));
    const ht   = evaluateHand(defs);
    const base = HAND_BASE[ht];
    this._setHandTypeText(`${ht}  ·  ${base.chips} chips × ${base.mult}×`);
  }

  // ─── Play Hand ───────────────────────────────────────────────────────────────

  private _playHand(): void {
    const selected = this.handCards.filter(c => c.selected);
    if (selected.length === 0 || this.phase !== Phase.PLAYER || this.handsLeft <= 0) return;

    playClick();
    this.phase = Phase.PLAYING;
    this.handsLeft--;
    this._updateButtons();
    this._updateStatus();

    // Remove selected from hand
    this.handCards = this.handCards.filter(c => !c.selected);
    this.playedCards = selected;

    // Disable kept cards while animation plays
    this.handCards.forEach(c => c.setInteractable(false));

    // Fly selected to play zone
    const positions = this._playZonePositions(selected.length);
    Promise.all(
      selected.map((card, i) =>
        new Promise<void>(resolve => {
          card.select(false);
          card.resize(PLAY_CARD_W, PLAY_CARD_H);
          card.setDepth(20 + i);
          this.tweens.add({
            targets: card,
            x: positions[i].x,
            y: PLAY_ZONE_Y,
            duration: 380,
            ease: 'Back.easeOut',
            delay: i * 65,
            onComplete: () => resolve(),
          });
        }),
      ),
    ).then(() => this._scoreHand());
  }

  // ─── Scoring ─────────────────────────────────────────────────────────────────

  private async _scoreHand(): Promise<void> {
    this.phase = Phase.SCORING;

    const defs: CardDef[] = this.playedCards.map(c => ({ suit: c.suit, rank: c.rank }));
    const handType = evaluateHand(defs);
    const base     = HAND_BASE[handType];
    const scoring  = scoringCards(defs, handType);
    const scoringSet = new Set(scoring.map((_, i) => i)); // indices of scoring cards

    // Dim non-scoring played cards
    this.playedCards.forEach((c, i) => { if (!scoringSet.has(i)) c.setAlpha(0.45); });

    this._setHandTypeText(handType);
    this._resetScoreDisplay();

    // Animate chips accumulation
    let runChips = 0;
    await this._animateChips(0, base.chips);
    runChips = base.chips;

    for (const def of scoring) {
      const add = cardChips(def.rank);
      await this._animateChips(runChips, runChips + add, 175);
      runChips += add;
    }

    await this._animateMult(1, base.mult, 380);

    const roundScore = runChips * base.mult;
    this.totalScore += roundScore;
    await this._flashRoundScore(roundScore);

    // Move played cards to discard pile
    this.deck.discard(defs);
    this.playedCards.forEach(c => c.destroy());
    this.playedCards = [];

    this._updateHUD();
    this._updateStatus();

    const target = BLIND_SCORES[this.ante]?.[this.blind] ?? 999999;

    if (this.totalScore >= target) {
      await this._sleep(400);
      this._roundWon();
      return;
    }

    if (this.handsLeft <= 0) {
      await this._sleep(600);
      this._gameOver();
      return;
    }

    // Re-enable kept cards and draw replacements
    this.handCards.forEach(c => {
      c.removeAllListeners('card:tap');
      c.setInteractable(true).on('card:tap', this._onCardTap, this);
    });

    const needed = HAND_SIZE - this.handCards.length;
    await this._drawReplacements(needed);

    this.phase = Phase.PLAYER;
    this._resetScoreDisplay();
    this._setHandTypeText('');
    this._updateButtons();
  }

  // ─── Discard ─────────────────────────────────────────────────────────────────

  private async _discard(): Promise<void> {
    const selected = this.handCards.filter(c => c.selected);
    if (selected.length === 0 || this.discardsLeft <= 0 || this.phase !== Phase.PLAYER) return;

    playClick();
    this.phase = Phase.DISCARDING;
    this.discardsLeft--;
    this._updateButtons();
    this._updateStatus();

    const defs: CardDef[] = selected.map(c => ({ suit: c.suit, rank: c.rank }));
    this.handCards = this.handCards.filter(c => !c.selected);

    // Fly discarded cards away
    await Promise.all(
      selected.map((card, i) =>
        new Promise<void>(resolve => {
          this.tweens.add({
            targets: card,
            y: H + 100,
            alpha: 0,
            duration: 250,
            ease: 'Sine.easeIn',
            delay: i * 40,
            onComplete: () => { card.destroy(); resolve(); },
          });
        }),
      ),
    );

    this.deck.discard(defs);

    // Draw replacements (handles its own enablement)
    const needed = HAND_SIZE - this.handCards.length;
    await this._drawReplacements(needed);

    // Re-enable all kept cards (new ones were enabled inside _drawReplacements)
    this.handCards.forEach(c => {
      c.removeAllListeners('card:tap');
      c.setInteractable(true).on('card:tap', this._onCardTap, this);
    });

    this.phase = Phase.PLAYER;
    this._resetScoreDisplay();
    this._setHandTypeText('');
    this._updateButtons();
    this._updateStatus();
  }

  // ─── Round Over / Game Over ──────────────────────────────────────────────────

  private _roundWon(): void {
    this.phase = Phase.ROUND_OVER;
    const reward = GOLD_REWARD[this.ante] ?? 4;
    this.gold += reward;

    const anteComplete = this.blind === 2;
    const title = anteComplete ? `Ante ${this.ante + 1} Complete!` : 'Blind Beaten!';
    const body  = `+${reward} 💰   Score: ${this.totalScore.toLocaleString()}`;

    if (this.online) {
      rfNetwork.sendBlindResult(true, this.totalScore, this.ante, this.blind);
      this._showOverlay(title, `${body}\nWaiting for others…`);
    } else {
      this._showOverlay(title, body, anteComplete ? '▶ Next Ante' : '▶ Next Blind', () => {
        this.blind++;
        if (this.blind > 2) { this.blind = 0; this.ante++; }
        if (this.ante >= 8) { this._victory(); return; }
        this._startRound();
      });
    }
  }

  private _gameOver(): void {
    this.phase = Phase.GAME_OVER;
    const best = Math.max(this.totalScore, Number(localStorage.getItem('rogueFlush_best') ?? 0));
    localStorage.setItem('rogueFlush_best', String(best));

    if (this.online) {
      rfNetwork.sendBlindResult(false, this.totalScore, this.ante, this.blind);
      this._showOverlay(
        'Eliminated!',
        `Score: ${this.totalScore.toLocaleString()}\nWaiting for others…`,
        '✕ Leave Game',
        () => { rfNetwork.destroy(); this.scene.start('Menu'); },
      );
    } else {
      this._showOverlay(
        'Game Over',
        `Score: ${this.totalScore.toLocaleString()}\nBest: ${best.toLocaleString()}`,
        '↺ Try Again',
        () => { this._resetRun(); this._startRound(); },
      );
    }
  }

  private _victory(): void {
    this.phase = Phase.GAME_OVER;
    const best = Math.max(this.totalScore, Number(localStorage.getItem('rogueFlush_best') ?? 0));
    localStorage.setItem('rogueFlush_best', String(best));

    if (this.online) {
      this._showOverlay(
        '🏆 Victory!',
        `All 8 Antes Conquered!\nScore: ${this.totalScore.toLocaleString()}`,
        '✕ Leave Game',
        () => { rfNetwork.destroy(); this.scene.start('Menu'); },
      );
    } else {
      this._showOverlay(
        '🏆 Victory!',
        `All 8 Antes Conquered!\nScore: ${this.totalScore.toLocaleString()}`,
        '↺ Play Again',
        () => { this._resetRun(); this._startRound(); },
      );
    }
  }

  // ─── UI builders ─────────────────────────────────────────────────────────────

  private _buildBackground(): void {
    this.add.rectangle(CX, H / 2, W, H, 0x0a1a0a);
    const g = this.add.graphics();
    g.fillGradientStyle(0x0d2010, 0x0d2010, 0x061208, 0x061208, 0.7, 0.7, 0.4, 0.4);
    g.fillRect(0, 0, W, H);
    this.add.rectangle(CX, H / 2, W - 8, H - 8, 0x000000, 0).setStrokeStyle(4, 0x1a3a1a, 1);

    // Dividers
    [HUD_Y * 2 + 10, HAND_Y - HAND_CARD_H / 2 - 16].forEach(yy => {
      const g2 = this.add.graphics();
      g2.lineStyle(1, 0x1e3a1e, 0.8);
      g2.lineBetween(20, yy, W - 20, yy);
    });
  }

  private _buildHUD(): void {
    this.add.rectangle(CX, HUD_Y, W, HUD_Y * 2, 0x080808, 0.85);

    this.anteText = this.add.text(20, HUD_Y, 'Ante 1 · Small Blind', {
      fontFamily: 'Georgia, serif', fontSize: '17px', color: '#aaaaaa',
    }).setOrigin(0, 0.5);

    this.goldText = this.add.text(W - 16, HUD_Y, '💰 4', {
      fontFamily: 'Georgia, serif', fontSize: '17px', color: '#ffcc44',
    }).setOrigin(1, 0.5);

    const barY = HUD_Y * 2 - 10;
    this.add.rectangle(CX, barY - 6, W - 40, 30, 0x111111).setOrigin(0.5);

    this.scoreText = this.add.text(CX, barY - 6, '0 / 300', {
      fontFamily: 'Georgia, serif', fontSize: '19px', color: '#ffffff',
    }).setOrigin(0.5);

    this.blindText = this.add.text(CX, barY + 16, '', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#555555',
    }).setOrigin(0.5);
  }

  private _buildJokerArea(): void {
    if (this.online) { this._buildScoreboard(); return; }

    this.add.text(CX, JOKER_Y - 32, 'JOKERS', {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#334433', letterSpacing: 3,
    }).setOrigin(0.5);

    for (let i = 0; i < 5; i++) {
      const sx = CX + (i - 2) * 62;
      this.add.rectangle(sx, JOKER_Y, 52, 72, 0x111111).setStrokeStyle(1, 0x223322, 1);
      this.add.text(sx, JOKER_Y, '+', {
        fontFamily: 'sans-serif', fontSize: '22px', color: '#223322',
      }).setOrigin(0.5);
    }
  }

  private _buildScoreboard(): void {
    this.add.text(CX, JOKER_Y - 40, 'PLAYERS', {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#334466', letterSpacing: 3,
    }).setOrigin(0.5);

    this.add.rectangle(CX, JOKER_Y + 2, W - 20, 96, 0x080810, 0.85)
      .setStrokeStyle(1, 0x1a2a44, 1).setOrigin(0.5);

    this._sbRows = [];
    for (let i = 0; i < 4; i++) {
      const ry = JOKER_Y - 32 + i * 22;
      const nameTxt = this.add.text(28, ry, '—', {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#445566',
      }).setOrigin(0, 0);
      const scoreTxt = this.add.text(CX + 60, ry, '', {
        fontFamily: 'sans-serif', fontSize: '12px', color: '#aaaaaa',
      }).setOrigin(0.5, 0);
      const statusTxt = this.add.text(W - 20, ry, '', {
        fontFamily: 'sans-serif', fontSize: '11px', color: '#446644',
      }).setOrigin(1, 0);
      this._sbRows.push({ name: nameTxt, score: scoreTxt, status: statusTxt });
    }
  }

  private _updateScoreboard(members: RFMember[]): void {
    for (let i = 0; i < 4; i++) {
      const row = this._sbRows[i];
      if (!row) continue;
      const m = members[i];
      if (m) {
        const isMe = m.peerId === rfNetwork.myId;
        row.name.setText(`${m.isHost ? '♛' : '·'} ${m.name}${isMe ? ' (you)' : ''}`).setColor(m.isHost ? '#ffcc44' : '#cccccc');
        row.score.setText(m.score !== undefined ? m.score.toLocaleString() : '').setColor('#aabbcc');
        const st = m.status ?? '';
        row.status.setText(st === 'waiting' ? '✓' : st === 'lost' ? '✗' : st === 'playing' ? '…' : '');
        row.status.setColor(st === 'waiting' ? '#44cc44' : st === 'lost' ? '#cc4444' : '#aaaaaa');
      } else {
        row.name.setText(''); row.score.setText(''); row.status.setText('');
      }
    }
  }

  private _initOnlineHandlers(): void {
    rfNetwork.onRosterUpdate = (members) => {
      if (this.scene.isActive('Play')) this._updateScoreboard(members);
    };
    rfNetwork.onNextBlind = (ante, blind) => {
      if (!this.scene.isActive('Play')) return;
      this.ante  = ante;
      this.blind = blind;
      // Dismiss overlay and start next round (players who lost stay on game-over screen)
      this._overlayBtn?.destroy();  this._overlayBtn = undefined;
      this._overlayBtnTxt?.destroy(); this._overlayBtnTxt = undefined;
      this.overlay.setVisible(false);
      if (this.phase !== Phase.GAME_OVER) this._startRound();
    };
    rfNetwork.onGameOver = () => {
      if (!this.scene.isActive('Play')) return;
      this._overlayBtn?.destroy();  this._overlayBtn = undefined;
      this._overlayBtnTxt?.destroy(); this._overlayBtnTxt = undefined;
      this.overlay.setVisible(false);
      this._victory();
    };
    this._updateScoreboard(rfNetwork.members);
  }

  private _buildHandTypeDisplay(): void {
    this.add.rectangle(CX, HAND_TYPE_Y, W - 40, 42, 0x080808, 0.75).setOrigin(0.5);
    this.handTypeText = this.add.text(CX, HAND_TYPE_Y, '', {
      fontFamily: 'Georgia, serif', fontSize: '20px', color: '#ffdd88',
    }).setOrigin(0.5);
  }

  private _buildPlayZone(): void {
    this.add.rectangle(CX, PLAY_ZONE_Y, W - 20, 220, 0x0c1e0c, 0.9)
      .setStrokeStyle(1, 0x1c3a1c, 1).setOrigin(0.5);

    for (let i = 0; i < 5; i++) {
      const sx = CX + (i - 2) * PLAY_SPACING;
      this.add.rectangle(sx, PLAY_ZONE_Y, PLAY_CARD_W + 4, PLAY_CARD_H + 4, 0x000000, 0)
        .setStrokeStyle(1, 0x1a3a1a, 0.5).setOrigin(0.5);
    }
  }

  private _buildScoreDisplay(): void {
    // Chips box (blue)
    const chipsBox = this.add.container(CX - 100, SCORE_DISP_Y);
    chipsBox.add(this.add.rectangle(0, -4, 148, 72, 0x112244, 0.9).setStrokeStyle(1, 0x334488).setOrigin(0.5));
    chipsBox.add(this.add.text(0, 22, 'CHIPS', {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#445577', letterSpacing: 2,
    }).setOrigin(0.5));

    this.chipsVal = this.add.text(CX - 100, SCORE_DISP_Y - 10, '0', {
      fontFamily: 'Georgia, serif', fontSize: '30px', color: '#88ccff',
    }).setOrigin(0.5).setDepth(1);

    // Multiplier separator
    this.add.text(CX, SCORE_DISP_Y - 10, '×', {
      fontFamily: 'Georgia, serif', fontSize: '28px', color: '#666666',
    }).setOrigin(0.5);

    // Mult box (red)
    const multBox = this.add.container(CX + 100, SCORE_DISP_Y);
    multBox.add(this.add.rectangle(0, -4, 148, 72, 0x441111, 0.9).setStrokeStyle(1, 0x883333).setOrigin(0.5));
    multBox.add(this.add.text(0, 22, 'MULT', {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#775544', letterSpacing: 2,
    }).setOrigin(0.5));

    this.multVal = this.add.text(CX + 100, SCORE_DISP_Y - 10, '1', {
      fontFamily: 'Georgia, serif', fontSize: '30px', color: '#ff8888',
    }).setOrigin(0.5).setDepth(1);

    // Round score flash text
    this.roundScoreText = this.add.text(CX, SCORE_DISP_Y + 50, '', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ffdd44',
    }).setOrigin(0.5);
  }

  private _buildStatusBar(): void {
    this.add.rectangle(CX, STATUS_Y, W, 50, 0x060606, 0.6).setOrigin(0.5);

    this.handsText = this.add.text(40, STATUS_Y, '', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#cc4444',
    }).setOrigin(0, 0.5);

    this.discardsText = this.add.text(CX, STATUS_Y, '', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#cc8844',
    }).setOrigin(0.5);

    this.deckText = this.add.text(W - 40, STATUS_Y, '', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#336633',
    }).setOrigin(1, 0.5);
  }

  private _buildActionButtons(): void {
    this.playBtn    = this._makeButton(CX, BTN_Y,         W - 60,  68, '▶  PLAY HAND', 0xaa2200, 0xdd3311,
      () => { if (this.phase === Phase.PLAYER) this._playHand(); });
    this.discardBtn = this._makeButton(CX, DISCARD_BTN_Y, W - 100, 52, '↺  DISCARD',   0x443300, 0x775500,
      () => { if (this.phase === Phase.PLAYER) this._discard(); });
  }

  // ─── Overlay ─────────────────────────────────────────────────────────────────

  private _showOverlay(title: string, body: string, btnLabel?: string, onContinue?: () => void): void {
    // Destroy previous overlay button (it lives outside the overlay container)
    this._overlayBtn?.destroy();
    this._overlayBtnTxt?.destroy();
    this._overlayBtn = undefined;
    this._overlayBtnTxt = undefined;

    this.overlay.removeAll(true);
    this.overlay.setVisible(true).setAlpha(0).setScale(0.85);

    const panel  = this.add.rectangle(0, 0, W - 60, 420, 0x0a1a0a, 0.97).setStrokeStyle(3, 0xcc2200, 1).setOrigin(0.5);
    const titleT = this.add.text(0, -150, title, {
      fontFamily: 'Georgia, serif', fontSize: '44px', color: '#ff4433',
      stroke: '#440000', strokeThickness: 5,
      shadow: { offsetX: 3, offsetY: 4, color: '#000', blur: 12, fill: true },
    }).setOrigin(0.5);
    const bodyT = this.add.text(0, -30, body, {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ddbbbb', align: 'center',
    }).setOrigin(0.5);

    this.overlay.add([panel, titleT, bodyT]);
    this.tweens.add({ targets: this.overlay, alpha: 1, scale: 1, duration: 340, ease: 'Back.easeOut' });

    // Skip button creation when waiting for host (no btnLabel)
    if (!btnLabel || !onContinue) return;

    // The action button MUST live directly on the scene's display list (not inside
    // the overlay container) so Phaser's input system can track it.
    const btnY = H / 2 + 130;
    this._overlayBtn = this.add.rectangle(CX, btnY, 280, 64, 0xcc2200, 1)
      .setStrokeStyle(2, 0xff4433, 1)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(52)
      .setAlpha(0);
    this._overlayBtnTxt = this.add.text(CX, btnY, btnLabel, {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ffffff',
      stroke: '#330000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(53).setAlpha(0);

    this._overlayBtn.on('pointerover',  () => this._overlayBtn?.setFillStyle(0xff4433));
    this._overlayBtn.on('pointerout',   () => this._overlayBtn?.setFillStyle(0xcc2200));
    this._overlayBtn.on('pointerdown',  () => {
      playClick();
      this._overlayBtn?.destroy();   this._overlayBtn = undefined;
      this._overlayBtnTxt?.destroy(); this._overlayBtnTxt = undefined;
      this.overlay.setVisible(false);
      onContinue();
    });

    this.tweens.add({ targets: [this._overlayBtn, this._overlayBtnTxt], alpha: 1, duration: 280, delay: 260 });
  }

  // ─── Score animations ─────────────────────────────────────────────────────────

  private _animateChips(from: number, to: number, duration = 280): Promise<void> {
    return new Promise(resolve => {
      const obj = { val: from };
      this.tweens.add({
        targets: obj, val: to, duration, ease: 'Cubic.easeOut',
        onUpdate: () => this.chipsVal.setText(String(Math.floor(obj.val))),
        onComplete: () => { this.chipsVal.setText(String(to)); resolve(); },
      });
    });
  }

  private _animateMult(from: number, to: number, duration = 300): Promise<void> {
    return new Promise(resolve => {
      const obj = { val: from };
      this.tweens.add({
        targets: obj, val: to, duration, ease: 'Cubic.easeOut',
        onUpdate: () => this.multVal.setText(String(Math.floor(obj.val))),
        onComplete: () => { this.multVal.setText(String(to)); resolve(); },
      });
    });
  }

  private _flashRoundScore(score: number): Promise<void> {
    this.roundScoreText.setText(`= ${score.toLocaleString()} pts`).setAlpha(0).setScale(0.6);
    return new Promise(resolve => {
      this.tweens.add({
        targets: this.roundScoreText, alpha: 1, scale: 1,
        duration: 340, ease: 'Back.easeOut',
        onComplete: () => this.time.delayedCall(650, resolve),
      });
    });
  }

  private _sleep(ms: number): Promise<void> {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }

  // ─── Layout helpers ──────────────────────────────────────────────────────────

  private _handPositions(count: number): Array<{ x: number; y: number }> {
    const totalW = (count - 1) * HAND_SPACING + HAND_CARD_W;
    const startX = CX - totalW / 2 + HAND_CARD_W / 2;
    return Array.from({ length: count }, (_, i) => ({ x: startX + i * HAND_SPACING, y: HAND_Y }));
  }

  private _playZonePositions(count: number): Array<{ x: number; y: number }> {
    const totalW = (count - 1) * PLAY_SPACING + PLAY_CARD_W;
    const startX = CX - totalW / 2 + PLAY_CARD_W / 2;
    return Array.from({ length: count }, (_, i) => ({ x: startX + i * PLAY_SPACING, y: PLAY_ZONE_Y }));
  }

  /** Tween all cards in `handCards` to their canonical 0..N-1 positions. */
  private _repositionHand(): void {
    const positions = this._handPositions(HAND_SIZE);
    this.handCards.forEach((card, i) => {
      const pos = positions[i] ?? positions[positions.length - 1];
      card.baseY = pos.y;
      this.tweens.add({
        targets: card, x: pos.x, y: pos.y,
        duration: 240, ease: 'Cubic.easeOut', delay: i * 28,
      });
    });
  }

  // ─── HUD / state updates ──────────────────────────────────────────────────────

  private _updateHUD(): void {
    const target = BLIND_SCORES[this.ante]?.[this.blind] ?? 999999;
    this.scoreText.setText(`${this.totalScore.toLocaleString()} / ${target.toLocaleString()}`);
    this.anteText.setText(`Ante ${this.ante + 1}  ·  ${BLIND_NAMES[this.blind]}`);
    this.goldText.setText(`💰 ${this.gold}`);
    this.blindText.setText(`Score ${target.toLocaleString()} to beat this blind`);
  }

  private _updateStatus(): void {
    this.handsText.setText(`♥ × ${this.handsLeft}`);
    this.discardsText.setText(`↺ × ${this.discardsLeft} discards`);
    this.deckText.setText(`Deck: ${this.deck?.remaining ?? 0}`);
  }

  private _updateButtons(): void {
    const sel     = this.handCards.filter(c => c.selected).length;
    const isPlayer = this.phase === Phase.PLAYER;
    this._setButtonEnabled(this.playBtn,    sel > 0 && isPlayer && this.handsLeft > 0,    0xaa2200, 0x441100);
    this._setButtonEnabled(this.discardBtn, sel > 0 && isPlayer && this.discardsLeft > 0, 0x443300, 0x221a00);
  }

  private _setButtonEnabled(btn: Phaser.GameObjects.Rectangle, enabled: boolean, active: number, inactive: number): void {
    btn.setFillStyle(enabled ? active : inactive);
    // Fade the label text stored in btn data alongside the rectangle
    const txt = btn.getData('label') as Phaser.GameObjects.Text | undefined;
    const alpha = enabled ? 1 : 0.4;
    btn.setAlpha(alpha);
    txt?.setAlpha(alpha);
    if (enabled) btn.setInteractive({ useHandCursor: true });
    else btn.disableInteractive();
  }

  private _setHandTypeText(text: string): void {
    this.handTypeText.setText(text);
  }

  private _resetScoreDisplay(): void {
    this.chipsVal.setText('0');
    this.multVal.setText('1');
    this.roundScoreText.setText('');
  }

  // ─── Shared button factory ────────────────────────────────────────────────────

  /**
   * Creates a flat-scene button: shadow, bg Rectangle, and label Text — all added
   * directly to the scene's display list (NOT inside a Container). This is required
   * because Container children are removed from the Input Plugin's polling list,
   * making them non-interactive.
   *
   * Returns the background Rectangle, which is the interactive hit target.
   * The label Text is stored in bg.data under 'label' for alpha/enable control.
   */
  private _makeButton(
    x: number, y: number, bw: number, bh: number,
    label: string, color: number, hoverColor: number,
    onPress?: () => void,
  ): Phaser.GameObjects.Rectangle {
    // Drop shadow (non-interactive, depth 4)
    this.add.rectangle(x + 3, y + 5, bw, bh, 0x000000, 0.45)
      .setOrigin(0.5).setDepth(4);

    // Interactive hit area (depth 5)
    const bg = this.add.rectangle(x, y, bw, bh, color, 1)
      .setStrokeStyle(2, 0xff4422, 0.6)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(5);

    // Label above bg (depth 6, non-interactive)
    const txt = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ffffff',
      stroke: '#330000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6);

    // Store text ref so _setButtonEnabled can fade it
    bg.setData('label', txt);

    bg.on('pointerover',  () => bg.setFillStyle(hoverColor));
    bg.on('pointerout',   () => bg.setFillStyle(color));
    bg.on('pointerdown',  () => {
      this.tweens.add({ targets: [bg, txt], y: y + 3, duration: 50 });
      onPress?.();
    });
    bg.on('pointerup',    () => this.tweens.add({ targets: [bg, txt], y, duration: 50 }));

    return bg;
  }
}
