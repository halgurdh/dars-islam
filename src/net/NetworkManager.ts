import Peer, { type DataConnection } from 'peerjs';
import type { NetMsg, RoomMember, GameSnap } from './protocol';
import type { HeroClass } from '../game/data/classes';

type Role = 'offline' | 'host' | 'guest';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

class NetworkManager {
  private peer:       Peer | null                    = null;
  private conns:      Map<string, DataConnection>    = new Map();
  private _role:      Role                           = 'offline';
  private _members:   RoomMember[]                   = [];
  private _name       = 'Player';
  private _hostId     = '';

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
      this.peer  = new Peer(`boardrush-${code}`);
      this._role = 'host';

      this.peer.on('open', (id) => {
        this._members = [{ peerId: id, name: this._name, isHost: true }];
        this.onRosterUpdate?.(this.members);
        resolve(code);
      });

      this.peer.on('error', (err) => {
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

      let settled = false;
      const finish = (err?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (err) {
          this.destroy();
          reject(err);
          return;
        }
        resolve();
      };

      const timer = setTimeout(() => {
        finish(new Error('Connection timed out — check the code and try again.'));
      }, 12000);

      this.peer    = new Peer();
      this._role   = 'guest';
      this._hostId = `boardrush-${code.toUpperCase().trim()}`;

      this.peer.on('open', () => {
        const conn = this.peer!.connect(this._hostId, { reliable: true });
        this.conns.set(this._hostId, conn);

        conn.on('open',  () => { this._send(conn, { type: 'hello', name: this._name }); finish(); });
        conn.on('data',  (raw) => this._onHostMsg(raw as NetMsg));
        conn.on('close', ()    => {
          this.conns.delete(this._hostId);
          if (!settled) finish(new Error('Connection closed before the room finished joining.'));
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

  destroy(): void {
    this.conns.forEach(c => c.close());
    this.peer?.destroy();
    this.peer   = null;
    this._role  = 'offline';
    this._members = [];
    this._hostId = '';
    this.conns.clear();
  }
}

export const networkManager = new NetworkManager();
