import type { ClientNetMsg, RoomEvent, RoomMember, GameSnap, ServerNetMsg } from './protocol';
import type { HeroClass } from '../game/data/classes';

type Role = 'offline' | 'host' | 'guest';
type JoinStage = 'connecting' | 'joining';
type PendingRequest =
  | { kind: 'create'; resolve: (code: string) => void; reject: (err: Error) => void }
  | { kind: 'join'; resolve: () => void; reject: (err: Error) => void };

const GAME_ID = 'board-rush';
const ROOM_REQUEST_TIMEOUT_MS = 15000;
const DEV_MULTIPLAYER_URL = 'ws://localhost:8787';

function resolveMultiplayerUrl(): string {
  const configured = import.meta.env.VITE_MULTIPLAYER_URL as string | undefined;
  if (configured && configured.trim()) return configured.trim();

  const { protocol, host, hostname } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return DEV_MULTIPLAYER_URL;
  }

  return `${protocol === 'https:' ? 'wss' : 'ws'}://${host}/ws`;
}

function normalizeRoomCode(code: string): string {
  return code.toUpperCase().trim();
}

function toError(message: string): Error {
  return new Error(message);
}

function isGameStartReady(members: RoomMember[]): members is Array<RoomMember & { cls: HeroClass }> {
  return members.length >= 2 && members.every((member) => member.cls !== undefined);
}

function mapGamePicks(members: Array<RoomMember & { cls: HeroClass }>): { name: string; cls: HeroClass }[] {
  return members.map(member => ({ name: member.name, cls: member.cls }));
}

class NetworkManager {
  private socket: WebSocket | null = null;
  private _role: Role = 'offline';
  private _members: RoomMember[] = [];
  private _name = 'Player';
  private _hostId = '';
  private _clientId = '';
  private _roomCode = '';
  private _pending: PendingRequest | null = null;
  private _requestTimer: ReturnType<typeof setTimeout> | null = null;
  private _manualClose = false;
  private _joinStage: JoinStage = 'connecting';
  private _lastError = '';
  private _sentGameStart = false;

  onRosterUpdate?:   (members: RoomMember[]) => void;
  onClassPickStart?: () => void;
  onGameStart?:      (picks: { name: string; cls: HeroClass }[]) => void;
  onSnapshot?:       (snap: GameSnap) => void;
  onAction?:         (name: string, payload?: unknown) => void;

  get isHost()   { return this._role === 'host'; }
  get isGuest()  { return this._role === 'guest'; }
  get isOnline() { return this._role !== 'offline' && this.socket?.readyState === WebSocket.OPEN; }
  get members()  { return [...this._members]; }
  get myName()   { return this._name; }
  get lastError(){ return this._lastError; }

  setName(name: string): void { this._name = name.trim() || 'Player'; }

  myPlayerIndex(): number {
    return this._members.findIndex(m => m.peerId === this._clientId);
  }

  async createRoom(): Promise<string> {
    this.destroy();
    this._role = 'host';
    this._joinStage = 'connecting';
    await this._ensureSocket();
    return new Promise((resolve, reject) => {
      this._beginRequest({ kind: 'create', resolve, reject });
      this._send({
        type: 'create_room',
        game: GAME_ID,
        name: this._name,
      });
    });
  }

  async joinRoom(code: string): Promise<void> {
    this.destroy();
    this._role = 'guest';
    this._roomCode = normalizeRoomCode(code);
    this._hostId = `room:${this._roomCode}`;
    this._joinStage = 'connecting';
    await this._ensureSocket();
    return new Promise((resolve, reject) => {
      this._joinStage = 'joining';
      this._beginRequest({ kind: 'join', resolve, reject });
      this._send({
        type: 'join_room',
        game: GAME_ID,
        roomCode: this._roomCode,
        name: this._name,
      });
    });
  }

  startClassPick(): void {
    if (!this.isHost) return;
    this._sentGameStart = false;
    this._sendRoomEvent('guests', { type: 'class-pick:start' });
    this.onClassPickStart?.();
  }

  sendClassPick(cls: HeroClass): void {
    const me = this._members.find(member => member.peerId === this._clientId);
    if (me) me.cls = cls;
    this._send({
      type: 'member_update',
      patch: { cls },
    });
    this.onRosterUpdate?.(this.members);
    if (this.isHost) this._checkAllPicked();
  }

  sendAction(name: string, payload?: unknown): void {
    if (this.isHost) {
      this.onAction?.(name, payload);
      return;
    }
    this._sendRoomEvent('host', { type: 'action', name, payload });
  }

  broadcastSnapshot(snap: GameSnap): void {
    if (!this.isHost) return;
    this._sendRoomEvent('guests', { type: 'snapshot', snap });
  }

  destroy(): void {
    this._clearPending();
    this._members = [];
    this._hostId = '';
    this._roomCode = '';
    this._sentGameStart = false;
    this._lastError = '';
    this._role = 'offline';
    this._manualClose = true;
    if (this.socket) {
      try {
        if (this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify({ type: 'leave_room' }));
        }
        this.socket.close();
      } catch {
        // Ignore close races.
      }
    }
    this.socket = null;
    this._manualClose = false;
  }

  private async _ensureSocket(): Promise<void> {
    const existing = this.socket;
    if (existing && existing.readyState === WebSocket.OPEN) return;
    if (existing && existing.readyState === WebSocket.CONNECTING) {
      await new Promise<void>((resolve, reject) => {
        const onOpen = () => { existing.removeEventListener('error', onError); resolve(); };
        const onError = () => { existing.removeEventListener('open', onOpen); reject(toError('Could not reach the multiplayer service — check your connection and try again.')); };
        existing.addEventListener('open', onOpen, { once: true });
        existing.addEventListener('error', onError, { once: true });
      });
      return;
    }

    this._manualClose = false;
    this.socket = new WebSocket(resolveMultiplayerUrl());
    this.socket.addEventListener('message', (event) => this._handleMessage(String(event.data)));
    this.socket.addEventListener('close', () => this._handleClose());
    this.socket.addEventListener('error', () => {
      if (this._pending) {
        this._rejectPending(toError('Could not reach the multiplayer service — check your connection and try again.'));
      }
    });

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(toError('Timed out connecting to the multiplayer service.')), ROOM_REQUEST_TIMEOUT_MS);
      this.socket!.addEventListener('open', () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      this.socket!.addEventListener('error', () => {
        clearTimeout(timer);
        reject(toError('Could not reach the multiplayer service — check your connection and try again.'));
      }, { once: true });
    });
  }

  private _beginRequest(pending: PendingRequest): void {
    this._clearPending();
    this._pending = pending;
    this._requestTimer = setTimeout(() => {
      const error = this._joinStage === 'connecting'
        ? toError('Could not reach the multiplayer service — check your connection and try again.')
        : toError(`Timed out joining room ${this._roomCode} — the host may be offline or the code may be wrong.`);
      this._rejectPending(error);
    }, ROOM_REQUEST_TIMEOUT_MS);
  }

  private _clearPending(): void {
    if (this._requestTimer !== null) {
      clearTimeout(this._requestTimer);
      this._requestTimer = null;
    }
    this._pending = null;
  }

  private _resolvePendingCreate(roomCode: string): void {
    if (this._pending?.kind !== 'create') return;
    const pending = this._pending;
    this._clearPending();
    pending.resolve(roomCode);
  }

  private _resolvePendingJoin(): void {
    if (this._pending?.kind !== 'join') return;
    const pending = this._pending;
    this._clearPending();
    pending.resolve();
  }

  private _rejectPending(error: Error): void {
    if (!this._pending) return;
    const pending = this._pending;
    this._clearPending();
    pending.reject(error);
  }

  private _send(message: ClientNetMsg): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw toError('The multiplayer connection is not open.');
    }
    this.socket.send(JSON.stringify(message));
  }

  private _sendRoomEvent(target: 'all' | 'host' | 'guests', event: RoomEvent): void {
    this._send({ type: 'room_event', target, event });
  }

  private _handleMessage(raw: string): void {
    let message: ServerNetMsg;
    try {
      message = JSON.parse(raw) as ServerNetMsg;
    } catch {
      console.warn('[multiplayer] Ignored invalid server message.');
      return;
    }

    switch (message.type) {
      case 'welcome':
        this._clientId = message.clientId;
        break;
      case 'room_created':
        this._roomCode = message.roomCode;
        this._hostId = this._clientId;
        this._members = message.members;
        this.onRosterUpdate?.(this.members);
        this._resolvePendingCreate(message.roomCode);
        break;
      case 'room_joined':
        this._roomCode = message.roomCode;
        this._members = message.members;
        this._hostId = message.members.find(member => member.isHost)?.peerId ?? '';
        this.onRosterUpdate?.(this.members);
        this._resolvePendingJoin();
        break;
      case 'roster':
        this._members = message.members;
        this._hostId = message.members.find(member => member.isHost)?.peerId ?? this._hostId;
        this.onRosterUpdate?.(this.members);
        if (this.isHost) this._checkAllPicked();
        break;
      case 'room_event':
        this._handleRoomEvent(message);
        break;
      case 'room_closed':
        this._lastError = message.reason;
        this._resetConnectionState();
        this.onRosterUpdate?.(this.members);
        break;
      case 'error':
        this._lastError = message.message;
        this._rejectPending(this._describeServerError(message.code, message.message));
        break;
    }
  }

  private _handleRoomEvent(message: Extract<ServerNetMsg, { type: 'room_event' }>): void {
    switch (message.event.type) {
      case 'class-pick:start':
        this._sentGameStart = false;
        this.onClassPickStart?.();
        break;
      case 'game:start':
        if (this.isGuest && isGameStartReady(this._members)) {
          this.onGameStart?.(mapGamePicks(this._members));
        }
        break;
      case 'snapshot':
        this.onSnapshot?.(message.event.snap);
        break;
      case 'action':
        if (this.isHost) {
          this.onAction?.(message.event.name, message.event.payload);
        }
        break;
    }
  }

  private _checkAllPicked(): void {
    if (!this.isHost || this._sentGameStart || !isGameStartReady(this._members)) return;
    this._sentGameStart = true;
    const picks = mapGamePicks(this._members);
    this._sendRoomEvent('guests', { type: 'game:start' });
    this.onGameStart?.(picks);
  }

  private _describeServerError(code: string, message: string): Error {
    if (code === 'room-not-found') {
      return toError(`Room ${this._roomCode} was not found — double-check the code and make sure the host is online.`);
    }
    if (code === 'room-full') {
      return toError(`Room ${this._roomCode} is full.`);
    }
    if (code === 'invalid-room-code') {
      return toError('Enter a valid 6-character room code.');
    }
    if (code === 'service-unavailable') {
      return toError('Could not reach the multiplayer service — check your connection and try again.');
    }
    return toError(message || 'Unknown multiplayer error.');
  }

  private _handleClose(): void {
    const wasManual = this._manualClose;
    const hadPending = this._pending !== null;
    if (hadPending) {
      this._rejectPending(toError('Could not reach the multiplayer service — check your connection and try again.'));
    }
    this.socket = null;
    if (wasManual) return;

    if (this._role !== 'offline' && !this._lastError) {
      this._lastError = 'The multiplayer connection closed unexpectedly — try reconnecting.';
    }
    this._resetConnectionState();
    this.onRosterUpdate?.(this.members);
  }

  private _resetConnectionState(): void {
    this._members = [];
    this._hostId = '';
    this._roomCode = '';
    this._sentGameStart = false;
    this._role = 'offline';
  }
}

export const networkManager = new NetworkManager();
