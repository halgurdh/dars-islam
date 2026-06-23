import Phaser from 'phaser';
import { rfNetwork } from '../net/NetworkManager';
import type { RFMember } from '../net/protocol';

// Layout constants matching the 720×1280 portrait canvas
const W  = 720;
const H  = 1280;
const CX = W / 2;

type LobbyState = 'menu' | 'connecting' | 'lobby';

export class LobbyScene extends Phaser.Scene {
  private playerName = 'Player';
  private _inputEl?: HTMLInputElement;

  // Dynamic UI groups swapped between states
  private _menuGroup: Phaser.GameObjects.GameObject[] = [];
  private _connectingGroup: Phaser.GameObjects.GameObject[] = [];
  private _lobbyGroup: Phaser.GameObjects.GameObject[] = [];

  // Lobby UI refs
  private _roomCodeText?: Phaser.GameObjects.Text;
  private _startBtn?: Phaser.GameObjects.Rectangle;
  private _startBtnTxt?: Phaser.GameObjects.Text;
  private _playerRows: Array<{
    bg: Phaser.GameObjects.Rectangle;
    name: Phaser.GameObjects.Text;
    status: Phaser.GameObjects.Text;
  }> = [];
  private _statusText?: Phaser.GameObjects.Text;
  private _errorText?: Phaser.GameObjects.Text;
  private _nameDisplay?: Phaser.GameObjects.Text;

  constructor() { super('Lobby'); }

  create(): void {
    // Initialise with a generated player name
    this.playerName = `Player${Math.floor(Math.random() * 9000) + 1000}`;
    rfNetwork.setName(this.playerName);

    this._drawBackground();
    this._drawTitle();
    this._buildMenuState();
    this._buildConnectingState();
    this._buildLobbyState();
    this._showState('menu');
  }

  shutdown(): void {
    this._removeInputEl();
  }

  // ── Background & static title ────────────────────────────────────────────────

  private _drawBackground(): void {
    this.add.rectangle(CX, H / 2, W, H, 0x0d0202);
    this.add.ellipse(CX, H * 0.5, W * 0.9, H * 0.85, 0x0d2010, 0.3);
  }

  private _drawTitle(): void {
    this.add.text(CX, 80, 'ROGUE FLUSH', {
      fontFamily: 'Georgia, serif', fontSize: '52px', color: '#ff3322',
      stroke: '#7a0000', strokeThickness: 6,
      shadow: { offsetX: 3, offsetY: 4, color: '#000', blur: 12, fill: true },
    }).setOrigin(0.5);

    this.add.text(CX, 140, 'Multiplayer Lobby', {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#cc8866',
    }).setOrigin(0.5);

    const g = this.add.graphics();
    g.lineStyle(1, 0xcc2200, 0.5);
    g.lineBetween(CX - 280, 168, CX + 280, 168);
  }

  // ── State builders (all objects built up-front, shown/hidden per state) ──────

  private _buildMenuState(): void {
    // Name display row
    const nameLabelY = 230;
    this.add.text(CX - 240, nameLabelY, 'YOUR NAME', {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#556655', letterSpacing: 3,
    }).setOrigin(0, 0.5);

    const nameBg = this.add.rectangle(CX, nameLabelY + 46, W - 60, 52, 0x110808)
      .setStrokeStyle(1, 0x552200, 0.8).setInteractive({ useHandCursor: true });
    this._nameDisplay = this.add.text(CX, nameLabelY + 46, this.playerName, {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ffccaa',
    }).setOrigin(0.5);
    const editHint = this.add.text(CX + 200, nameLabelY + 46, '✎', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#553322',
    }).setOrigin(0.5);

    nameBg.on('pointerover', () => nameBg.setStrokeStyle(2, 0xcc4422, 1));
    nameBg.on('pointerout',  () => nameBg.setStrokeStyle(1, 0x552200, 0.8));
    nameBg.on('pointerdown', () => this._openNameInput());

    this._menuGroup.push(nameBg, this._nameDisplay, editHint);

    // Error text (shows under buttons when something goes wrong)
    this._errorText = this.add.text(CX, 368, '', {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#ff4422', align: 'center',
    }).setOrigin(0.5).setWordWrapWidth(W - 80);
    this._menuGroup.push(this._errorText);

    // HOST ROOM button
    const hostBtn = this._makeButton(CX, 430, W - 80, 70, '♠  HOST ROOM', 0xaa2200, 0xdd3311, () => {
      this._clearError();
      this._enterConnecting('Creating room…');
      rfNetwork.createRoom().then((code) => {
        this._enterLobby(code);
      }).catch((err: Error) => {
        this._showError(err.message);
        this._showState('menu');
      });
    });
    this._menuGroup.push(...hostBtn);

    // JOIN WITH CODE button
    const joinBtn = this._makeButton(CX, 530, W - 80, 70, '♥  JOIN WITH CODE', 0x223355, 0x334477, () => {
      this._openCodeInput();
    });
    this._menuGroup.push(...joinBtn);

    // Divider
    const div = this.add.text(CX, 480, '── or ──', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#334433',
    }).setOrigin(0.5);
    this._menuGroup.push(div);

    // Back to menu
    const backBtn = this._makeButton(CX, H - 80, 200, 52, '← Back', 0x1a1a1a, 0x333333, () => {
      this._removeInputEl();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Menu'));
    });
    this._menuGroup.push(...backBtn);
  }

  private _buildConnectingState(): void {
    const txt = this.add.text(CX, H / 2, 'Connecting…', {
      fontFamily: 'Georgia, serif', fontSize: '26px', color: '#cc8866',
    }).setOrigin(0.5);

    const spinner = this.add.text(CX, H / 2 + 60, '⟳', {
      fontFamily: 'sans-serif', fontSize: '40px', color: '#cc2200',
    }).setOrigin(0.5);
    this.tweens.add({ targets: spinner, angle: 360, duration: 1000, repeat: -1 });

    this._connectingGroup.push(txt, spinner);

    // We keep a ref to update the connecting label
    Object.defineProperty(this, '_connectingLabel', { value: txt, writable: true });
  }

  private _buildLobbyState(): void {
    // Room code display
    this.add.text(CX, 220, 'ROOM CODE', {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#556655', letterSpacing: 4,
    }).setOrigin(0.5);
    this._roomCodeText = this.add.text(CX, 262, '------', {
      fontFamily: 'Georgia, serif', fontSize: '42px', color: '#ffcc44',
      stroke: '#443300', strokeThickness: 4, letterSpacing: 12,
    }).setOrigin(0.5);

    const copyHint = this.add.text(CX, 296, 'Share this code with friends', {
      fontFamily: 'sans-serif', fontSize: '13px', color: '#446644',
    }).setOrigin(0.5);

    this._lobbyGroup.push(this._roomCodeText, copyHint);

    // Player list header
    this.add.text(60, 340, 'PLAYERS', {
      fontFamily: 'sans-serif', fontSize: '11px', color: '#334433', letterSpacing: 3,
    });
    const listBg = this.add.rectangle(CX, 500, W - 40, 316, 0x0a0a0a, 0.7)
      .setStrokeStyle(1, 0x1a3a1a, 1);
    this._lobbyGroup.push(listBg);

    // 4 player row slots
    for (let i = 0; i < 4; i++) {
      const rowY = 366 + i * 74;
      const bg = this.add.rectangle(CX, rowY + 20, W - 60, 60, 0x080808, 0.9)
        .setStrokeStyle(1, 0x1c2c1c, 1);
      const name = this.add.text(80, rowY + 20, '', {
        fontFamily: 'Georgia, serif', fontSize: '18px', color: '#cccccc',
      }).setOrigin(0, 0.5);
      const status = this.add.text(W - 60, rowY + 20, '', {
        fontFamily: 'sans-serif', fontSize: '13px', color: '#448844',
      }).setOrigin(1, 0.5);
      this._playerRows.push({ bg, name, status });
      this._lobbyGroup.push(bg, name, status);
    }

    // Status text (e.g. "Waiting for host to start…")
    this._statusText = this.add.text(CX, 680, 'Waiting for host to start…', {
      fontFamily: 'Georgia, serif', fontSize: '17px', color: '#777777', align: 'center',
    }).setOrigin(0.5);
    this._lobbyGroup.push(this._statusText);

    // START GAME button (host only, enabled when ≥2 players)
    const [startBg, startShadow, startTxt] = this._makeButtonParts(CX, 760, W - 80, 72, '▶  START GAME', 0x336600, 0x448800);
    this._startBtn = startBg;
    this._startBtnTxt = startTxt;
    this._lobbyGroup.push(startShadow, startBg, startTxt);

    startBg.on('pointerdown', () => {
      if (rfNetwork.members.length < 1) return; // need at least host
      rfNetwork.startGame();
      this._goToPlay();
    });

    // Leave lobby
    const leaveBtn = this._makeButton(CX, H - 80, 200, 52, '✕  Leave', 0x221111, 0x441111, () => {
      rfNetwork.destroy();
      this._showState('menu');
    });
    this._lobbyGroup.push(...leaveBtn);
  }

  // ── State transitions ─────────────────────────────────────────────────────────

  private _showState(state: LobbyState): void {
    const groups: Record<LobbyState, Phaser.GameObjects.GameObject[]> = {
      menu:       this._menuGroup,
      connecting: this._connectingGroup,
      lobby:      this._lobbyGroup,
    };
    for (const [s, group] of Object.entries(groups) as [LobbyState, Phaser.GameObjects.GameObject[]][]) {
      const visible = s === state;
      group.forEach((o) => { if ('setVisible' in o) (o as { setVisible: (v: boolean) => void }).setVisible(visible); });
    }
  }

  private _enterConnecting(msg: string): void {
    const label = (this as unknown as Record<string, unknown>)['_connectingLabel'] as Phaser.GameObjects.Text | undefined;
    label?.setText(msg);
    this._showState('connecting');
  }

  private _enterLobby(roomCode: string): void {
    this._roomCodeText?.setText(roomCode);
    this._updateLobbyForRole();
    rfNetwork.onRosterUpdate = (members) => this._onRoster(members);
    rfNetwork.onGameStart    = () => this._goToPlay();
    this._onRoster(rfNetwork.members);
    this._showState('lobby');
  }

  private _updateLobbyForRole(): void {
    const isHost = rfNetwork.isHost;
    this._startBtn?.setVisible(isHost);
    this._startBtnTxt?.setVisible(isHost);
    this._statusText?.setVisible(!isHost);
    this._statusText?.setText('Waiting for host to start…');
  }

  private _onRoster(members: RFMember[]): void {
    for (let i = 0; i < 4; i++) {
      const row = this._playerRows[i];
      const m   = members[i];
      if (m) {
        row.bg.setFillStyle(0x0d1a0d, 0.9).setStrokeStyle(1, 0x2a4a2a, 1);
        row.name.setText(`${m.isHost ? '♛ ' : '  '}${m.name}`).setColor(m.isHost ? '#ffcc44' : '#cccccc');
        row.status.setText(m.peerId === rfNetwork.myId ? '(you)' : 'ready').setColor('#448844');
      } else {
        row.bg.setFillStyle(0x080808, 0.9).setStrokeStyle(1, 0x1c2c1c, 1);
        row.name.setText('');
        row.status.setText('');
      }
    }

    // Enable Start button for host when at least 2 players present
    if (rfNetwork.isHost && this._startBtn) {
      const canStart = members.length >= 2;
      this._startBtn.setFillStyle(canStart ? 0x336600 : 0x1a3300);
      this._startBtnTxt?.setAlpha(canStart ? 1 : 0.4);
    }
  }

  private _goToPlay(): void {
    rfNetwork.onRosterUpdate = undefined;
    rfNetwork.onGameStart    = undefined;
    this._removeInputEl();
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Play', { online: true });
    });
  }

  // ── DOM inputs ────────────────────────────────────────────────────────────────

  private _openNameInput(): void {
    this._removeInputEl();
    const el = this._createInputEl('Your name', this.playerName, 20);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        const val = el.value.trim();
        if (val) {
          this.playerName = val.slice(0, 20);
          rfNetwork.setName(this.playerName);
          this._nameDisplay?.setText(this.playerName);
        }
        this._removeInputEl();
      }
    });
    el.addEventListener('blur', () => {
      const val = el.value.trim();
      if (val) {
        this.playerName = val.slice(0, 20);
        rfNetwork.setName(this.playerName);
        this._nameDisplay?.setText(this.playerName);
      }
      this._removeInputEl();
    });
  }

  private _openCodeInput(): void {
    this._removeInputEl();
    const el = this._createInputEl('Room code (6 chars)', '', 6);
    el.style.letterSpacing = '8px';
    el.addEventListener('input', () => { el.value = el.value.toUpperCase(); });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && el.value.length >= 4) {
        const code = el.value.trim();
        this._removeInputEl();
        this._clearError();
        this._enterConnecting('Joining room…');
        rfNetwork.joinRoom(code).then(() => {
          this._enterLobby(code.toUpperCase());
        }).catch((err: Error) => {
          this._showError(err.message);
          this._showState('menu');
        });
      }
      if (e.key === 'Escape') this._removeInputEl();
    });
  }

  private _createInputEl(placeholder: string, value: string, maxLength: number): HTMLInputElement {
    const el = document.createElement('input');
    el.type = 'text';
    el.placeholder = placeholder;
    el.value = value;
    el.maxLength = maxLength;
    el.style.cssText = [
      'position:fixed', 'top:50%', 'left:50%',
      'transform:translate(-50%,-50%)',
      'font-size:28px', 'text-align:center',
      'padding:14px 24px',
      'background:#1a0505', 'color:#ffffff',
      'border:2px solid #cc2200', 'border-radius:8px',
      'outline:none', 'z-index:9999',
      'width:300px', 'text-transform:uppercase',
    ].join(';');
    document.body.appendChild(el);
    this.time.delayedCall(50, () => el.focus());
    this._inputEl = el;
    return el;
  }

  private _removeInputEl(): void {
    this._inputEl?.remove();
    this._inputEl = undefined;
  }

  // ── Error display ─────────────────────────────────────────────────────────────

  private _showError(msg: string): void {
    this._errorText?.setText(msg);
  }

  private _clearError(): void {
    this._errorText?.setText('');
  }

  // ── Button factory (flat scene objects — safe for enable/disable) ─────────────

  private _makeButton(
    x: number, y: number, bw: number, bh: number,
    label: string, color: number, hover: number,
    onPress: () => void,
  ): Phaser.GameObjects.GameObject[] {
    const [bg, shadow, txt] = this._makeButtonParts(x, y, bw, bh, label, color, hover);
    bg.on('pointerdown', () => {
      this.tweens.add({ targets: [bg, txt], y: y + 3, duration: 50 });
      onPress();
    });
    bg.on('pointerup', () => this.tweens.add({ targets: [bg, txt], y, duration: 50 }));
    return [shadow, bg, txt];
  }

  private _makeButtonParts(
    x: number, y: number, bw: number, bh: number,
    label: string, color: number, hover: number,
  ): [Phaser.GameObjects.Rectangle, Phaser.GameObjects.Rectangle, Phaser.GameObjects.Text] {
    const shadow = this.add.rectangle(x + 3, y + 5, bw, bh, 0x000000, 0.45).setOrigin(0.5).setDepth(4);
    const bg = this.add.rectangle(x, y, bw, bh, color, 1)
      .setStrokeStyle(2, 0xff4422, 0.5).setOrigin(0.5)
      .setInteractive({ useHandCursor: true }).setDepth(5);
    const txt = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#ffffff',
      stroke: '#220000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6);

    bg.on('pointerover', () => bg.setFillStyle(hover));
    bg.on('pointerout',  () => bg.setFillStyle(color));
    return [bg, shadow, txt];
  }
}
