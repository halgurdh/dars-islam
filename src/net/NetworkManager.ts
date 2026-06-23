import type { RealtimeChannel } from '@supabase/supabase-js';
import type { RoomEvent, RoomMember, GameSnap } from './protocol';
import type { HeroClass } from '../game/data/classes';
import { getSupabaseClient } from './supabaseClient';

type Role = 'offline' | 'host' | 'guest';

const GAME_ID = 'board-rush';
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const JOIN_TIMEOUT_MS = 15000;
const EVENT_NAME = 'room_event';

interface PresenceMeta {
  playerGuid: string;
  name: string;
  isHost: boolean;
  cls?: HeroClass;
  joinedAt: string;
}

function normalizeRoomCode(code: string): string {
  return code.toUpperCase().trim();
}

function makeRoomCode(): string {
  return Array.from({ length: 6 }, () => ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]).join('');
}

function makePeerId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `peer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toError(message: string): Error {
  return new Error(message);
}

function isGameStartReady(members: RoomMember[]): members is Array<RoomMember & { cls: HeroClass }> {
  return members.length >= 2 && members.every((member) => member.cls !== undefined);
}

function mapGamePicks(members: Array<RoomMember & { cls: HeroClass }>): { name: string; cls: HeroClass }[] {
  return members.map((member) => ({ name: member.name, cls: member.cls }));
}

class NetworkManager {
  private channel: RealtimeChannel | null = null;
  private _role: Role = 'offline';
  private _members: RoomMember[] = [];
  private _name = 'Player';
  private _hostId = '';
  private _playerGuid = makePeerId();
  private _roomCode = '';
  private _lastError = '';
  private _sentGameStart = false;
  private _joinTimer: ReturnType<typeof setTimeout> | null = null;
  private _resolveJoin: (() => void) | null = null;
  private _awaitingJoin = false;
  private _hasTrackedPresence = false;

  onRosterUpdate?:   (members: RoomMember[]) => void;
  onClassPickStart?: () => void;
  onGameStart?:      (picks: { name: string; cls: HeroClass }[]) => void;
  onSnapshot?:       (snap: GameSnap) => void;
  onAction?:         (name: string, payload?: unknown) => void;

  get isHost()   { return this._role === 'host'; }
  get isGuest()  { return this._role === 'guest'; }
  get isOnline() { return this._role !== 'offline' && this.channel !== null; }
  get members()  { return [...this._members]; }
  get myName()   { return this._name; }
  get lastError(){ return this._lastError; }

  setName(name: string): void { this._name = name.trim() || 'Player'; }

  myPlayerIndex(): number {
    return this._members.findIndex((member) => member.peerId === this._playerGuid);
  }

  async createRoom(): Promise<string> {
    this.destroy();
    this._role = 'host';
    for (let attempt = 0; attempt < 5; attempt++) {
      const roomCode = makeRoomCode();
      const connected = await this._connectToRoom(roomCode, true, true);
      if (connected) {
        this._roomCode = roomCode;
        return roomCode;
      }
      this.destroy();
      this._role = 'host';
    }
    throw toError('Could not allocate an empty room code. Please try again.');
  }

  async joinRoom(code: string): Promise<void> {
    this.destroy();
    this._role = 'guest';
    this._roomCode = normalizeRoomCode(code);
    await this._connectToRoom(this._roomCode, false, false);
  }

  startClassPick(): void {
    if (!this.isHost || !this.channel) return;
    this._sentGameStart = false;
    void this._sendEvent({ type: 'class-pick:start' });
    this.onClassPickStart?.();
  }

  sendClassPick(cls: HeroClass): void {
    const me = this._members.find((member) => member.peerId === this._playerGuid);
    if (me) me.cls = cls;
    void this._trackPresence({ cls });
    this.onRosterUpdate?.(this.members);
    if (this.isHost) this._checkAllPicked();
  }

  sendAction(name: string, payload?: unknown): void {
    if (this.isHost) {
      this.onAction?.(name, payload);
      return;
    }
    void this._sendEvent({ type: 'action', name, payload });
  }

  broadcastSnapshot(snap: GameSnap): void {
    if (!this.isHost) return;
    void this._sendEvent({ type: 'snapshot', snap });
  }

  destroy(): void {
    this._clearJoinPending();
    this._members = [];
    this._hostId = '';
    this._roomCode = '';
    this._lastError = '';
    this._role = 'offline';
    this._sentGameStart = false;
    this._hasTrackedPresence = false;

    if (this.channel) {
      const supabase = getSupabaseClient();
      const channel = this.channel;
      this.channel = null;
      void channel.untrack();
      void supabase.removeChannel(channel);
    }
  }

  private async _connectToRoom(roomCode: string, isHost: boolean, allowHostCollisionRetry: boolean): Promise<boolean> {
    const supabase = getSupabaseClient();
    const topic = `room:${GAME_ID}:${roomCode}`;
    const channel = supabase.channel(topic, {
      config: {
        broadcast: { self: false, ack: true },
        presence: { key: this._playerGuid },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => this._syncRoster())
      .on('broadcast', { event: EVENT_NAME }, ({ payload }) => this._handleEvent(payload as RoomEvent));

    this.channel = channel;

    await new Promise<void>((resolve, reject) => {
      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await this._trackPresence({ isHost });
            resolve();
          } catch {
            reject(toError('Could not join the multiplayer room — presence tracking failed.'));
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          reject(toError('Could not reach the multiplayer service — check your connection and try again.'));
        }
      });
    });

    if (isHost) {
      this._syncRoster();
      const otherMembersExist = this._members.some((member) => member.peerId !== this._playerGuid);
      if (otherMembersExist && allowHostCollisionRetry) {
        return false;
      }
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
        reject(toError(`Room ${roomCode} was not found — double-check the code and make sure the host is online.`));
      }, JOIN_TIMEOUT_MS);
      this._syncRoster();
    });
    return true;
  }

  private async _trackPresence(patch: Partial<PresenceMeta> = {}): Promise<void> {
    if (!this.channel) return;

    const existing = this._members.find((member) => member.peerId === this._playerGuid);
    const payload: PresenceMeta = {
      playerGuid: this._playerGuid,
      name: patch.name ?? existing?.name ?? this._name,
      isHost: patch.isHost ?? this.isHost,
      cls: patch.cls ?? existing?.cls,
      joinedAt: patch.joinedAt ?? new Date().toISOString(),
    };

    if (this._hasTrackedPresence) {
      const untrackResult = await this.channel.untrack();
      if (untrackResult !== 'ok') {
        throw toError('Could not refresh multiplayer presence.');
      }
    }

    const result = await this.channel.track(payload);
    if (result !== 'ok') {
      throw toError('Could not update multiplayer presence.');
    }
    this._hasTrackedPresence = true;
  }

  private _syncRoster(): void {
    if (!this.channel) return;

    const state = this.channel.presenceState<PresenceMeta>();
    const deduped = new Map<string, PresenceMeta>();

    Object.values(state).forEach((entries) => {
      entries.forEach((entry) => {
        const current = deduped.get(entry.playerGuid);
        if (!current || entry.joinedAt >= current.joinedAt) {
          deduped.set(entry.playerGuid, entry);
        }
      });
    });

    const members: RoomMember[] = [...deduped.values()].map((entry) => ({
      peerId: entry.playerGuid,
      name: entry.name,
      isHost: !!entry.isHost,
      cls: entry.cls,
    }));

    members.sort((a, b) => {
      if (a.isHost && !b.isHost) return -1;
      if (!a.isHost && b.isHost) return 1;
      return a.peerId.localeCompare(b.peerId);
    });

    this._members = members;
    this._hostId = members.find((member) => member.isHost)?.peerId ?? '';
    this.onRosterUpdate?.(this.members);

    if (this._awaitingJoin && this._hostId) {
      const resolveJoin = this._resolveJoin;
      this._clearJoinPending();
      resolveJoin?.();
    }

    if (this.isHost) this._checkAllPicked();
  }

  private _clearJoinPending(): void {
    this._awaitingJoin = false;
    if (this._joinTimer !== null) {
      clearTimeout(this._joinTimer);
      this._joinTimer = null;
    }
    this._resolveJoin = null;
  }

  private async _sendEvent(event: RoomEvent): Promise<void> {
    if (!this.channel) return;
    const result = await this.channel.send({
      type: 'broadcast',
      event: EVENT_NAME,
      payload: event,
    });
    if (result !== 'ok') {
      throw toError('Could not send multiplayer event.');
    }
  }

  private _handleEvent(event: RoomEvent): void {
    switch (event.type) {
      case 'class-pick:start':
        this._sentGameStart = false;
        this.onClassPickStart?.();
        break;
      case 'game:start':
        if (this.isGuest) {
          this.onGameStart?.(event.picks);
        }
        break;
      case 'snapshot':
        this.onSnapshot?.(event.snap);
        break;
      case 'action':
        if (this.isHost) this.onAction?.(event.name, event.payload);
        break;
    }
  }

  private _checkAllPicked(): void {
    if (!this.isHost || this._sentGameStart || !isGameStartReady(this._members)) return;
    this._sentGameStart = true;
    const picks = mapGamePicks(this._members);
    void this._sendEvent({ type: 'game:start', picks });
    this.onGameStart?.(picks);
  }
}

export const networkManager = new NetworkManager();
