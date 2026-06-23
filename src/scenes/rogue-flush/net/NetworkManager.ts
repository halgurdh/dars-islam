import type { RealtimeChannel } from '@supabase/supabase-js';
import type { RFMember, RFEvent } from './protocol';
import { getSupabaseClient } from '../../../net/supabaseClient';

type Role = 'offline' | 'host' | 'guest';

const GAME_ID = 'rogue-flush';
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const JOIN_TIMEOUT_MS = 15000;
const BLIND_ADVANCE_TIMEOUT_MS = 30000;
const EVENT_NAME = 'room_event';

interface PresenceMeta {
  playerGuid: string;
  name: string;
  isHost: boolean;
  joinedAt: string;
  score?: number;
  ante?: number;
  blind?: number;
  status?: 'lobby' | 'playing' | 'waiting' | 'lost';
}

function makeRoomCode(): string {
  return Array.from({ length: 6 }, () =>
    ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)],
  ).join('');
}

function makePeerId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `peer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toError(msg: string): Error { return new Error(msg); }

class RFNetworkManager {
  private channel: RealtimeChannel | null = null;
  private _role: Role = 'offline';
  private _members: RFMember[] = [];
  private _name = 'Player';
  private _playerGuid = makePeerId();
  private _roomCode = '';
  private _hasTrackedPresence = false;
  private _awaitingJoin = false;
  private _joinTimer: ReturnType<typeof setTimeout> | null = null;
  private _resolveJoin: (() => void) | null = null;
  // Host-side blind tracking
  private _pendingBlindKey = '';
  private _pendingReporters = new Set<string>();
  private _blindAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  onRosterUpdate?: (members: RFMember[]) => void;
  onGameStart?: () => void;
  onNextBlind?: (ante: number, blind: number) => void;
  onGameOver?: () => void;

  get isHost()   { return this._role === 'host'; }
  get isGuest()  { return this._role === 'guest'; }
  get isOnline() { return this._role !== 'offline' && this.channel !== null; }
  get members()  { return [...this._members]; }
  get myName()   { return this._name; }
  get myId()     { return this._playerGuid; }
  get roomCode() { return this._roomCode; }

  setName(name: string): void { this._name = name.trim() || 'Player'; }

  async createRoom(): Promise<string> {
    this.destroy();
    this._role = 'host';
    for (let i = 0; i < 5; i++) {
      const code = makeRoomCode();
      const ok = await this._connectToRoom(code, true, true);
      if (ok) { this._roomCode = code; return code; }
      this.destroy();
      this._role = 'host';
    }
    throw toError('Could not allocate a room code. Please try again.');
  }

  async joinRoom(code: string): Promise<void> {
    this.destroy();
    this._role = 'guest';
    this._roomCode = code.toUpperCase().trim();
    await this._connectToRoom(this._roomCode, false, false);
  }

  startGame(): void {
    if (!this.isHost || !this.channel) return;
    void this._send({ type: 'game:start' });
    this.onGameStart?.();
  }

  sendBlindResult(won: boolean, score: number, ante: number, blind: number): void {
    void this._send({ type: 'player:blind-result', peerId: this._playerGuid, won, score, ante, blind });
    void this._trackPresence({ score, ante, blind, status: won ? 'waiting' : 'lost' });
    if (this.isHost) this._recordBlindResult(this._playerGuid, ante, blind);
  }

  destroy(): void {
    this._clearJoinPending();
    this._clearBlindTimer();
    this._members = [];
    this._roomCode = '';
    this._role = 'offline';
    this._hasTrackedPresence = false;
    this._pendingReporters.clear();
    this._pendingBlindKey = '';
    if (this.channel) {
      const supabase = getSupabaseClient();
      const ch = this.channel;
      this.channel = null;
      void ch.untrack();
      void supabase.removeChannel(ch);
    }
  }

  private async _connectToRoom(roomCode: string, isHost: boolean, retryOnCollision: boolean): Promise<boolean> {
    const supabase = getSupabaseClient();
    const channel = supabase.channel(`room:${GAME_ID}:${roomCode}`, {
      config: {
        broadcast: { self: false, ack: true },
        presence:  { key: this._playerGuid },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => this._syncRoster())
      .on('broadcast', { event: EVENT_NAME }, ({ payload }) => this._handleEvent(payload as RFEvent));

    this.channel = channel;

    await new Promise<void>((resolve, reject) => {
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try { await this._trackPresence({ isHost, status: 'lobby' }); resolve(); }
          catch { reject(toError('Presence tracking failed.')); }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          reject(toError('Could not reach the multiplayer service.'));
        }
      });
    });

    if (isHost) {
      this._syncRoster();
      if (retryOnCollision && this._members.some((m) => m.peerId !== this._playerGuid)) return false;
      return true;
    }

    await new Promise<void>((resolve, reject) => {
      this._awaitingJoin = true;
      this._resolveJoin = resolve;
      this._joinTimer = setTimeout(() => {
        if (!this._awaitingJoin) return;
        this._awaitingJoin = false;
        this._resolveJoin = null;
        this.destroy();
        reject(toError(`Room "${roomCode}" not found — check the code and try again.`));
      }, JOIN_TIMEOUT_MS);
      this._syncRoster();
    });
    return true;
  }

  private async _trackPresence(patch: Partial<PresenceMeta> = {}): Promise<void> {
    if (!this.channel) return;
    const existing = this._members.find((m) => m.peerId === this._playerGuid);
    const payload: PresenceMeta = {
      playerGuid: this._playerGuid,
      name:       patch.name   ?? existing?.name   ?? this._name,
      isHost:     patch.isHost ?? this.isHost,
      joinedAt:   patch.joinedAt ?? new Date().toISOString(),
      score:      patch.score  ?? existing?.score,
      ante:       patch.ante   ?? existing?.ante,
      blind:      patch.blind  ?? existing?.blind,
      status:     patch.status ?? existing?.status ?? 'lobby',
    };
    if (this._hasTrackedPresence) {
      const r = await this.channel.untrack();
      if (r !== 'ok') throw toError('Could not refresh presence.');
    }
    const r = await this.channel.track(payload);
    if (r !== 'ok') throw toError('Could not update presence.');
    this._hasTrackedPresence = true;
  }

  private _syncRoster(): void {
    if (!this.channel) return;
    const state = this.channel.presenceState<PresenceMeta>();
    const deduped = new Map<string, PresenceMeta>();
    Object.values(state).forEach((entries) =>
      entries.forEach((e) => {
        const cur = deduped.get(e.playerGuid);
        if (!cur || e.joinedAt >= cur.joinedAt) deduped.set(e.playerGuid, e);
      }),
    );
    this._members = [...deduped.values()]
      .map((e) => ({
        peerId: e.playerGuid,
        name:   e.name,
        isHost: !!e.isHost,
        score:  e.score,
        ante:   e.ante,
        blind:  e.blind,
        status: e.status ?? 'lobby',
      }))
      .sort((a, b) => {
        if (a.isHost && !b.isHost) return -1;
        if (!a.isHost && b.isHost) return 1;
        return a.peerId.localeCompare(b.peerId);
      });
    this.onRosterUpdate?.(this.members);

    if (this._awaitingJoin && this._members.some((m) => m.isHost)) {
      const fn = this._resolveJoin;
      this._clearJoinPending();
      fn?.();
    }
  }

  private _clearJoinPending(): void {
    this._awaitingJoin = false;
    if (this._joinTimer !== null) { clearTimeout(this._joinTimer); this._joinTimer = null; }
    this._resolveJoin = null;
  }

  private _clearBlindTimer(): void {
    if (this._blindAdvanceTimer !== null) { clearTimeout(this._blindAdvanceTimer); this._blindAdvanceTimer = null; }
  }

  private async _send(event: RFEvent): Promise<void> {
    if (!this.channel) return;
    const r = await this.channel.send({ type: 'broadcast', event: EVENT_NAME, payload: event });
    if (r !== 'ok') throw toError('Could not send event.');
  }

  private _handleEvent(event: RFEvent): void {
    switch (event.type) {
      case 'game:start':
        if (this.isGuest) this.onGameStart?.();
        break;
      case 'player:blind-result':
        if (this.isHost) this._recordBlindResult(event.peerId, event.ante, event.blind);
        break;
      case 'host:next-blind':
        if (this.isGuest) this.onNextBlind?.(event.ante, event.blind);
        break;
      case 'host:game-over':
        if (this.isGuest) this.onGameOver?.();
        break;
    }
  }

  private _recordBlindResult(peerId: string, ante: number, blind: number): void {
    const key = `${ante}:${blind}`;
    if (key !== this._pendingBlindKey) {
      this._pendingBlindKey = key;
      this._pendingReporters.clear();
      this._clearBlindTimer();
    }
    this._pendingReporters.add(peerId);
    const expected = this._members.length;
    if (this._pendingReporters.size >= expected) {
      this._clearBlindTimer();
      this._advanceBlind(ante, blind);
    } else if (!this._blindAdvanceTimer) {
      this._blindAdvanceTimer = setTimeout(() => this._advanceBlind(ante, blind), BLIND_ADVANCE_TIMEOUT_MS);
    }
  }

  private _advanceBlind(ante: number, blind: number): void {
    this._clearBlindTimer();
    let nextBlind = blind + 1;
    let nextAnte  = ante;
    if (nextBlind > 2) { nextBlind = 0; nextAnte++; }
    if (nextAnte >= 8) {
      void this._send({ type: 'host:game-over' });
      this.onGameOver?.();
    } else {
      void this._send({ type: 'host:next-blind', ante: nextAnte, blind: nextBlind });
      this.onNextBlind?.(nextAnte, nextBlind);
    }
  }
}

export const rfNetwork = new RFNetworkManager();
