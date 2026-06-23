/**
 * KarmaNetManager — Supabase Realtime networking for Karma.
 * Adapted from board-rush NetworkManager (host-authoritative snapshot model).
 *
 * Architecture:
 *  - Host: runs KarmaGame, broadcasts snapshots after every action
 *  - Guests: render from snapshots, send actions back to host
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import type { KarmaRoomEvent, KarmaRoomMember, KarmaSnap, KarmaAction } from './karmaProtocol';
import { getSupabaseClient } from '@src/net/supabaseClient';

type Role = 'offline' | 'host' | 'guest';

const GAME_ID        = 'karma';
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const JOIN_TIMEOUT   = 15_000;
const EVENT_NAME     = 'karma_event';

interface PresenceMeta {
  playerGuid: string;
  name:       string;
  isHost:     boolean;
  joinedAt:   string;
}

function makeCode(): string {
  return Array.from({ length: 6 }, () =>
    ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)],
  ).join('');
}

function makeGuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `k-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class KarmaNetManager {
  private channel:             RealtimeChannel | null = null;
  private _role:               Role = 'offline';
  private _members:            KarmaRoomMember[] = [];
  private _name                = 'Speler';
  private _guid                = makeGuid();
  private _roomCode            = '';
  private _awaitingJoin        = false;
  private _resolveJoin:        (() => void) | null = null;
  private _rejectJoin:         ((e: Error) => void) | null = null;
  private _joinTimer:          ReturnType<typeof setTimeout> | null = null;
  private _hasTrackedPresence  = false;

  // ── callbacks ──────────────────────────────────────────────────────────────
  onRosterUpdate?: (members: KarmaRoomMember[]) => void;
  onGameStart?:   (snap: KarmaSnap) => void;
  onSnapshot?:    (snap: KarmaSnap) => void;
  onAction?:      (action: KarmaAction) => void;

  // ── public state ───────────────────────────────────────────────────────────
  get isHost()    { return this._role === 'host'; }
  get isGuest()   { return this._role === 'guest'; }
  get isOnline()  { return this._role !== 'offline' && this.channel !== null; }
  get members()   { return [...this._members]; }
  get roomCode()  { return this._roomCode; }

  setName(name: string) { this._name = name.trim() || 'Speler'; }

  /** Returns this client's player index in the roster (host = 0). */
  myPlayerIndex(): number {
    return this._members.findIndex(m => m.peerId === this._guid);
  }

  // ── room lifecycle ─────────────────────────────────────────────────────────

  async createRoom(): Promise<string> {
    this.destroy();
    this._role = 'host';
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeCode();
      const ok = await this._connect(code, true, true);
      if (ok) { this._roomCode = code; return code; }
      this.destroy();
      this._role = 'host';
    }
    throw new Error('Kon geen lege kamer aanmaken. Probeer opnieuw.');
  }

  async joinRoom(code: string): Promise<void> {
    this.destroy();
    this._role = 'guest';
    this._roomCode = code.toUpperCase().trim();
    await this._connect(this._roomCode, false, false);
  }

  /** Host: send game:start event with initial snapshot. */
  startGame(snap: KarmaSnap): void {
    if (!this.isHost) return;
    void this._send({ type: 'game:start', snap });
  }

  /** Host: broadcast updated game state snapshot. */
  broadcastSnapshot(snap: KarmaSnap): void {
    if (!this.isHost) return;
    void this._send({ type: 'snapshot', snap });
  }

  /** Any player: send an action to the host. */
  sendAction(action: KarmaAction): void {
    if (this.isHost) {
      // Host handles its own actions directly
      this.onAction?.(action);
      return;
    }
    void this._send({ type: 'action', action });
  }

  destroy(): void {
    this._clearJoin();
    this._members = [];
    this._roomCode = '';
    this._role = 'offline';
    this._hasTrackedPresence = false;

    if (this.channel) {
      const supabase = getSupabaseClient();
      const ch = this.channel;
      this.channel = null;
      void ch.untrack();
      void supabase.removeChannel(ch);
    }
  }

  // ── private ────────────────────────────────────────────────────────────────

  private async _connect(code: string, isHost: boolean, retryOnCollision: boolean): Promise<boolean> {
    const supabase = getSupabaseClient();
    const topic = `room:${GAME_ID}:public:${code}`;
    const ch = supabase.channel(topic, {
      config: {
        broadcast: { self: false, ack: true },
        presence:  { key: this._guid },
      },
    });

    ch
      .on('presence',  { event: 'sync' },   () => this._syncRoster())
      .on('broadcast', { event: EVENT_NAME }, ({ payload }) => this._handleEvent(payload as KarmaRoomEvent));

    this.channel = ch;

    await new Promise<void>((resolve, reject) => {
      ch.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try { await this._trackPresence({ isHost }); resolve(); }
          catch { reject(new Error('Aanwezigheid bijhouden mislukt.')); }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          reject(new Error('Kan de multiplayer service niet bereiken.'));
        }
      });
    });

    if (isHost) {
      this._syncRoster();
      const others = this._members.some(m => m.peerId !== this._guid);
      if (others && retryOnCollision) return false;
      return true;
    }

    // Guest: wait until host presence is detected
    await new Promise<void>((resolve, reject) => {
      this._awaitingJoin = true;
      this._resolveJoin = resolve;
      this._rejectJoin  = reject;
      this._joinTimer = setTimeout(() => {
        if (!this._awaitingJoin) return;
        const rej = this._rejectJoin;
        this._clearJoin();
        this.destroy();
        rej?.(new Error(`Kamer ${code} niet gevonden — controleer de code.`));
      }, JOIN_TIMEOUT);
      this._syncRoster();
    });
    return true;
  }

  private async _trackPresence(patch: Partial<PresenceMeta> = {}): Promise<void> {
    if (!this.channel) return;
    const existing = this._members.find(m => m.peerId === this._guid);
    const payload: PresenceMeta = {
      playerGuid: this._guid,
      name:       patch.name     ?? existing?.name ?? this._name,
      isHost:     patch.isHost   ?? this.isHost,
      joinedAt:   patch.joinedAt ?? new Date().toISOString(),
    };
    if (this._hasTrackedPresence) {
      const r = await this.channel.untrack();
      if (r !== 'ok') throw new Error('Kon aanwezigheid niet verversen.');
    }
    const r = await this.channel.track(payload);
    if (r !== 'ok') throw new Error('Kon aanwezigheid niet bijhouden.');
    this._hasTrackedPresence = true;
  }

  private _syncRoster(): void {
    if (!this.channel) return;
    const state = this.channel.presenceState<PresenceMeta>();
    const deduped = new Map<string, PresenceMeta>();

    Object.values(state).forEach(entries =>
      entries.forEach(e => {
        const cur = deduped.get(e.playerGuid);
        if (!cur || e.joinedAt >= cur.joinedAt) deduped.set(e.playerGuid, e);
      }),
    );

    const members: KarmaRoomMember[] = [...deduped.values()].map(e => ({
      peerId: e.playerGuid,
      name:   e.name,
      isHost: !!e.isHost,
    }));
    members.sort((a, b) => {
      if (a.isHost && !b.isHost) return -1;
      if (!a.isHost && b.isHost) return 1;
      return a.peerId.localeCompare(b.peerId);
    });

    this._members = members;
    this.onRosterUpdate?.(this.members);

    const hasHost = members.some(m => m.isHost);
    if (this._awaitingJoin && hasHost) {
      const res = this._resolveJoin;
      this._clearJoin();
      res?.();
    }
  }

  private _clearJoin(): void {
    this._awaitingJoin = false;
    if (this._joinTimer !== null) { clearTimeout(this._joinTimer); this._joinTimer = null; }
    this._resolveJoin = null;
    this._rejectJoin  = null;
  }

  private async _send(event: KarmaRoomEvent): Promise<void> {
    if (!this.channel) return;
    const r = await this.channel.send({ type: 'broadcast', event: EVENT_NAME, payload: event });
    if (r !== 'ok') throw new Error('Kon bericht niet sturen.');
  }

  private _handleEvent(event: KarmaRoomEvent): void {
    switch (event.type) {
      case 'game:start': this.onGameStart?.(event.snap); break;
      case 'snapshot':   this.onSnapshot?.(event.snap);  break;
      case 'action':     if (this.isHost) this.onAction?.(event.action); break;
    }
  }
}

export const karmaNet = new KarmaNetManager();
