import Peer, { type DataConnection } from 'peerjs';
import type { NetMsg, RoomMember, GameSnap } from './protocol';
import type { HeroClass } from '../game/data/classes';

type Role = 'offline' | 'host' | 'guest';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const JOIN_TIMEOUT_MS  = 30000; // 30 s — ICE over TURN can be slow on mobile/NAT
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000]; // ms between reconnect attempts

type JoinStage = 'boot' | 'peer-open' | 'connecting' | 'connected';

function peerOptions() {
  const iceServers: Array<{ urls: string | string[]; username?: string; credential?: string }> = [
    // STUN — direct connection when both peers can punch through NAT
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
    // Free public TURN relay — required for symmetric NAT / mobile / Firefox
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turns:openrelay.metered.ca:443',
      ],
      username:   'openrelayproject',
      credential: 'openrelayproject',
    },
  ];

  // Optional: override with your own TURN server (no rate limits)
  const turnUrl        = import.meta.env.VITE_TURN_URL        as string | undefined;
  const turnUsername   = import.meta.env.VITE_TURN_USERNAME   as string | undefined;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL as string | undefined;
  if (turnUrl && turnUsername && turnCredential) {
    iceServers.push({ urls: turnUrl, username: turnUsername, credential: turnCredential });
  }

  return {
    config: {
      iceServers,
      iceTransportPolicy: 'all' as const,
    },
  };
}

class NetworkManager {
  private peer:          Peer | null                 = null;
  private conns:         Map<string, DataConnection> = new Map();
  private _role:         Role                        = 'offline';
  private _members:      RoomMember[]                = [];
  private _name          = 'Player';
  private _hostId        = '';
  private _reconnectIdx  = 0;
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Callbacks (set by GameScene / HUD) ───────────────────────────────────
  onRosterUpdate?:   (members: RoomMember[]) => void;
  onClassPickStart?: () => void;   // host clicked "Start" → show class grid
  onGameStart?:      (picks: { name: string; cls: HeroClass }[]) => void;
  onSnapshot?:       (snap: GameSnap) => void;
  onAction?:         (name: string, payload?: unknown) => void; // host only

  // ── Getters ───────────────────────────────────────────────────────────────
  get isHost()   { return this._role === 'host'; }
  get isGuest()  { return this._role === 'guest'; }
  get isOnline() { return this._role !== 'offline'; }
  get members()  { return [...this._members]; }
  get myName()   { return this._name; }

  setName(name: string): void { this._name = name.trim() || 'Player'; }

  myPlayerIndex(): number {
    return this._members.findIndex(m => m.peerId === this.peer?.id);
  }

  // ── Host ──────────────────────────────────────────────────────────────────

  createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.destroy();
      const code = Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
      this.peer  = new Peer(`boardrush-${code}`, peerOptions());
      this._role = 'host';

      this.peer.on('open', (id) => {
        this._reconnectIdx = 0;
        this._members = [{ peerId: id, name: this._name, isHost: true }];
        this.onRosterUpdate?.(this.members);
        resolve(code);
      });

      // Signaling server dropped us (EXPIRE / idle timeout) — reconnect silently
      this.peer.on('disconnected', () => {
        if (this._role !== 'host' || !this.peer) return;
        this._scheduleReconnect();
      });

      this.peer.on('error', (err) => {
        const anyErr = err as Error & { type?: string };
        // Non-fatal: lost signaling but WebRTC connections still alive
        if (anyErr.type === 'server-disconnected' || anyErr.type === 'network') {
          if (this._role === 'host') { this._scheduleReconnect(); return; }
        }
        this.destroy();
        reject(err);
      });

      this.peer.on('connection', (conn) => {
        conn.on('open', () => {
          this.conns.set(conn.peer, conn);
          conn.on('data',  (raw) => this._onGuestMsg(conn.peer, raw as NetMsg));
          conn.on('close', () => {
            this.conns.delete(conn.peer);
            this._members = this._members.filter(m => m.peerId !== conn.peer);
            this._broadcastRoster();
          });
        });
      });
    });
  }

  // ── Guest ─────────────────────────────────────────────────────────────────

  joinRoom(code: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.destroy();

      let stage: JoinStage = 'boot';
      let settled = false;
      const finish = (err?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (err) {
          this.destroy();
          reject(this._describeJoinError(err, this._hostId, stage));
          return;
        }
        resolve();
      };

      const timer = setTimeout(() => {
        const hostHint = this._hostId.replace('boardrush-', '');
        const reason = stage === 'boot' || stage === 'peer-open'
          ? 'Could not reach the peer service — check your connection and try again.'
          : `Timed out joining room ${hostHint} — the host may be offline or the code may be wrong.`;
        finish(new Error(reason));
      }, JOIN_TIMEOUT_MS);

      this.peer    = new Peer(undefined, peerOptions());
      this._role   = 'guest';
      this._hostId = `boardrush-${code.toUpperCase().trim()}`;

      this.peer.on('open', () => {
        stage = 'peer-open';
        const conn = this.peer!.connect(this._hostId, { reliable: true });
        stage = 'connecting';
        this.conns.set(this._hostId, conn);

        conn.on('open',  () => {
          stage = 'connected';
          this._send(conn, { type: 'hello', name: this._name });
          finish();
        });
        conn.on('data',  (raw) => this._onHostMsg(raw as NetMsg));
        conn.on('close', ()    => {
          this.conns.delete(this._hostId);
          if (!settled) {
            finish(new Error(`Room ${code.toUpperCase().trim()} closed before the join completed.`));
          }
          else this.destroy();
        });
        conn.on('error', (e)   => finish(e));
      });

      this.peer.on('error', (err) => finish(err));
    });
  }

  // ── Sending ───────────────────────────────────────────────────────────────

  /** Host: broadcast "go to class-pick" to all guests, then trigger locally. */
  startClassPick(): void {
    if (!this.isHost) return;
    this.conns.forEach(c => this._send(c, { type: 'class-pick:start' }));
    this.onClassPickStart?.();
  }

  /** Send this player's class pick to the host (or handle locally if host). */
  sendClassPick(cls: HeroClass): void {
    if (this.isHost) {
      const me = this._members.find(m => m.peerId === this.peer?.id);
      if (me) { me.cls = cls; this._checkAllPicked(); }
    } else {
      this._sendToHost({ type: 'class:picked', cls });
    }
  }

  /** Send a player action (guest → host, or host executes directly). */
  sendAction(name: string, payload?: unknown): void {
    if (this.isHost) {
      this.onAction?.(name, payload);
    } else {
      this._sendToHost({ type: 'action', name, payload });
    }
  }

  /** Host: push the current game snapshot to all guests. */
  broadcastSnapshot(snap: GameSnap): void {
    if (!this.isHost) return;
    const msg: NetMsg = { type: 'snapshot', snap };
    this.conns.forEach(c => this._send(c, msg));
  }

  // ── Incoming ──────────────────────────────────────────────────────────────

  private _onGuestMsg(fromId: string, msg: NetMsg): void {
    switch (msg.type) {
      case 'hello':
        this._members.push({ peerId: fromId, name: msg.name, isHost: false });
        this._broadcastRoster();
        break;
      case 'class:picked': {
        const m = this._members.find(x => x.peerId === fromId);
        if (m) { m.cls = msg.cls; this._checkAllPicked(); }
        break;
      }
      case 'action':
        this.onAction?.(msg.name, msg.payload);
        break;
    }
  }

  private _onHostMsg(msg: NetMsg): void {
    switch (msg.type) {
      case 'roster':
        this._members = msg.members;
        this.onRosterUpdate?.(this.members);
        break;
      case 'class-pick:start':
        this.onClassPickStart?.();
        break;
      case 'game:start': {
        const picks = this._members.map(m => ({ name: m.name, cls: m.cls! }));
        this.onGameStart?.(picks);
        break;
      }
      case 'snapshot':
        this.onSnapshot?.(msg.snap);
        break;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _broadcastRoster(): void {
    const msg: NetMsg = { type: 'roster', members: this._members };
    this.conns.forEach(c => this._send(c, msg));
    this.onRosterUpdate?.(this.members);
  }

  private _checkAllPicked(): void {
    this._broadcastRoster();
    if (!this._members.every(m => m.cls !== undefined)) return;
    // All picked — signal game start
    this.conns.forEach(c => this._send(c, { type: 'game:start' }));
    const picks = this._members.map(m => ({ name: m.name, cls: m.cls! }));
    this.onGameStart?.(picks);
  }

  private _sendToHost(msg: NetMsg): void {
    const conn = this.conns.get(this._hostId);
    if (conn) this._send(conn, msg);
  }

  private _send(conn: DataConnection, msg: NetMsg): void {
    try { if (conn.open) conn.send(msg); } catch { /* ignore closed conn */ }
  }

  private _describeJoinError(err: unknown, hostId: string, stage: JoinStage): Error {
    if (err instanceof Error) {
      const anyErr = err as Error & { type?: string };
      const type = anyErr.type ?? '';
      const rawMessage = err.message || 'Unknown connection error.';
      const roomCode = hostId.replace('boardrush-', '') || 'unknown';

      if (type === 'peer-unavailable' || /peer-unavailable/i.test(rawMessage)) {
        return new Error(`Room ${roomCode} was not found — double-check the code and make sure the host is online.`);
      }
      if (type === 'network' || type === 'server-error' || type === 'socket-error' || /network|socket|server/i.test(rawMessage)) {
        return new Error('Could not reach the peer service — check your internet connection and try again.');
      }
      if (type === 'socket-closed' || /socket closed/i.test(rawMessage)) {
        return new Error('The peer connection closed unexpectedly — try creating the room again.');
      }
      if (type === 'webrtc' || /webrtc|ice|sdp|datachannel/i.test(rawMessage)) {
        return new Error('WebRTC connection failed — this browser, network, or extension setup may be blocking peer-to-peer connections.');
      }
      if (stage === 'boot' || stage === 'peer-open') {
        return new Error(`Could not start joining room ${roomCode} — ${rawMessage}`);
      }
      return new Error(rawMessage);
    }

    return new Error('Unknown connection error while joining the room.');
  }

  private _scheduleReconnect(): void {
    if (this._reconnectTimer !== null) return;
    const delay = RECONNECT_DELAYS[Math.min(this._reconnectIdx, RECONNECT_DELAYS.length - 1)];
    this._reconnectIdx++;
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null;
      if (this.peer && !this.peer.destroyed) {
        try { this.peer.reconnect(); } catch { /* peer already gone */ }
      }
    }, delay);
  }

  destroy(): void {
    if (this._reconnectTimer !== null) { clearTimeout(this._reconnectTimer); this._reconnectTimer = null; }
    this.conns.forEach(c => c.close());
    this.peer?.destroy();
    this.peer      = null;
    this._role     = 'offline';
    this._members  = [];
    this._hostId   = '';
    this._reconnectIdx = 0;
    this.conns.clear();
  }
}

export const networkManager = new NetworkManager();
