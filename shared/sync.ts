/**
 * SyncManager — bridges ArcadeStore (localStorage) with the PHP/MySQL API.
 *
 * Local-first: all reads from localStorage (instant, offline-capable).
 * Server is authoritative for premium status and coins.
 * On login: pull server profile → update localStorage.
 * On writes: debounced push (2 s after last write).
 * Guest mode: full game playable without an account.
 */

import { api, getSessionToken, setSessionToken, clearSessionToken } from './api';
import { ArcadeStore } from './arcade-store';

type AuthListener = (loggedIn: boolean, email: string | null) => void;
export type AccountType = 'consumer' | 'commercial';

export interface WorkspaceSettings {
  brand_name: string;
  brand_tagline: string | null;
  accent_color: string;
  logo_url: string | null;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  plan_key: string;
  account_type: AccountType;
  email_domain: string | null;
  is_personal: boolean;
  role: string;
  member_count: number;
  limits: {
    members: number;
    games: number;
    private_rooms: number;
  };
  usage: {
    members: number;
  };
  settings: WorkspaceSettings;
}

export interface WorkspaceMember {
  user_id: string;
  email: string;
  account_type: AccountType;
  role: string;
  created_at: string;
}

export interface WorkspaceInvite {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  created_at: string;
}

interface ServerProfile {
  user_id:          string;
  email:            string;
  account_type:     AccountType;
  workspace:        WorkspaceSummary;
  workspaces:       WorkspaceSummary[];
  coins:            number;
  active_card_back: string;
  owned_card_backs: string[];
  premium_until:    string | null;
  premium_active:   boolean;
  wins:             number;
  losses:           number;
  games_played:     number;
  best_streak:      number;
  current_streak:   number;
}

class SyncManager {
  private _userId:    string | null = null;
  private _email:     string | null = null;
  private _accountType: AccountType = 'consumer';
  private _workspace: WorkspaceSummary | null = null;
  private _workspaces: WorkspaceSummary[] = [];
  private _members: WorkspaceMember[] = [];
  private _invites: WorkspaceInvite[] = [];
  private _timer:     ReturnType<typeof setTimeout> | null = null;
  private _listeners: Set<AuthListener> = new Set();
  private _ready      = false;

  get userId()    { return this._userId; }
  get email()     { return this._email; }
  get accountType(){ return this._accountType; }
  get workspace() { return this._workspace; }
  get workspaceId(){ return this._workspace?.id ?? null; }
  get workspaces(){ return this._workspaces; }
  get workspaceMembers(){ return this._members; }
  get workspaceInvites(){ return this._invites; }
  get isLoggedIn(){ return !!this._userId; }
  get isReady()   { return this._ready; }

  /**
   * Call once on app start.
   * Detects magic-link return (?mt_session=TOKEN) and restores existing sessions.
   */
  async init(): Promise<void> {
    // Detect magic-link redirect: ?mt_session=TOKEN
    const params = new URLSearchParams(window.location.search);
    const incoming = params.get('mt_session');
    const incomingInvite = params.get('mt_invite');
    if (incoming) {
      setSessionToken(incoming);
      params.delete('mt_session');
    }
    if (incomingInvite) {
      localStorage.setItem('minitoon:pending-invite', incomingInvite);
      params.delete('mt_invite');
    }
    if (incoming || incomingInvite) {
      const newUrl = [window.location.pathname, params.toString()].filter(Boolean).join('?');
      window.history.replaceState({}, '', newUrl);
    }

    // Restore existing session
    if (getSessionToken()) {
      try {
        await this.pullProfile();
        await this.acceptPendingInvite();
      } catch {
        // Token may be expired — clear it
        clearSessionToken();
        this._userId = null;
        this._email  = null;
        this._accountType = 'consumer';
        this._workspace = null;
        this._workspaces = [];
        this._members = [];
        this._invites = [];
      }
    }

    this._ready = true;
  }

  /** POST email → server sends magic link. */
  async signIn(email: string): Promise<void> {
    await api.post('/auth/request-link.php', { email });
  }

  /** Clear local session and notify listeners. */
  async signOut(): Promise<void> {
    try { await api.post('/auth/logout.php'); } catch { /* ignore */ }
    clearSessionToken();
    this._userId = null;
    this._email  = null;
    this._accountType = 'consumer';
    this._workspace = null;
    this._workspaces = [];
    this._members = [];
    this._invites = [];
    this._notify(false, null);
  }

  /** Pull server profile into localStorage (server wins for premium + coins). */
  async pullProfile(): Promise<void> {
    const profile = await api.get<ServerProfile>('/profile/get.php');

    this._userId = profile.user_id;
    this._email  = profile.email;
    this._accountType = profile.account_type;
    this._workspace = profile.workspace;
    this._workspaces = profile.workspaces ?? [profile.workspace];

    // Merge card backs (union: never lose locally unlocked ones)
    const localOwned  = ArcadeStore.getOwnedCardBacks();
    const serverOwned = profile.owned_card_backs ?? ['cardBack_blue1'];
    const merged      = [...new Set([...localOwned, ...serverOwned])];

    // Coins: take the higher value
    const finalCoins = Math.max(ArcadeStore.getCoins(), profile.coins);

    ArcadeStore.setCoins(finalCoins);
    ArcadeStore.set('ownedCardBacks',  merged);
    ArcadeStore.setCardBack(profile.active_card_back ?? ArcadeStore.getCardBack());
    ArcadeStore.set('wins',            profile.wins           ?? 0);
    ArcadeStore.set('losses',          profile.losses         ?? 0);
    ArcadeStore.set('gamesPlayed',     profile.games_played   ?? 0);
    ArcadeStore.set('bestStreak',      profile.best_streak    ?? 0);
    ArcadeStore.set('currentStreak',   profile.current_streak ?? 0);

    // Premium: always from server — cannot be faked client-side
    if (profile.premium_active && profile.premium_until) {
      ArcadeStore.set('premium', { until: new Date(profile.premium_until).getTime() });
    } else {
      ArcadeStore.set('premium', null);
    }

    this._notify(true, this._email);

    // Push back any local advantages (e.g. coins earned as guest)
    if (finalCoins > profile.coins || merged.length > serverOwned.length) {
      void this.pushProfile();
    }
  }

  async saveWorkspaceSettings(input: Partial<WorkspaceSettings>): Promise<WorkspaceSummary> {
    const result = await api.post<{ ok: true; workspace: WorkspaceSummary }>('/workspace/update.php', input);
    this._workspace = result.workspace;
    return result.workspace;
  }

  async refreshWorkspace(): Promise<void> {
    if (!getSessionToken()) return;
    const result = await api.get<{
      workspace: WorkspaceSummary;
      workspaces: WorkspaceSummary[];
      members: WorkspaceMember[];
      invites: WorkspaceInvite[];
    }>('/workspace/get.php');
    this._workspace = result.workspace;
    this._workspaces = result.workspaces;
    this._members = result.members;
    this._invites = result.invites;
  }

  async switchWorkspace(workspaceId: string): Promise<void> {
    const result = await api.post<{
      ok: true;
      workspace: WorkspaceSummary;
      workspaces: WorkspaceSummary[];
      members: WorkspaceMember[];
      invites: WorkspaceInvite[];
    }>('/workspace/switch.php', { workspace_id: workspaceId });
    this._workspace = result.workspace;
    this._workspaces = result.workspaces;
    this._members = result.members;
    this._invites = result.invites;
  }

  async inviteToWorkspace(email: string, role: 'admin' | 'member' = 'member'): Promise<{ invite_url: string }> {
    const result = await api.post<{
      ok: true;
      invite_url: string;
      members: WorkspaceMember[];
      invites: WorkspaceInvite[];
    }>('/workspace/invite.php', { email, role });
    this._members = result.members;
    this._invites = result.invites;
    return { invite_url: result.invite_url };
  }

  async revokeWorkspaceInvite(inviteId: string): Promise<void> {
    const result = await api.post<{ ok: true; invites: WorkspaceInvite[] }>('/workspace/revoke-invite.php', { invite_id: inviteId });
    this._invites = result.invites;
  }

  async acceptPendingInvite(): Promise<void> {
    const token = localStorage.getItem('minitoon:pending-invite');
    if (!token || !getSessionToken()) return;
    try {
      const result = await api.post<{
        ok: true;
        workspace: WorkspaceSummary;
        workspaces: WorkspaceSummary[];
        members: WorkspaceMember[];
        invites: WorkspaceInvite[];
      }>('/workspace/accept-invite.php', { token });
      this._workspace = result.workspace;
      this._workspaces = result.workspaces;
      this._members = result.members;
      this._invites = result.invites;
      localStorage.removeItem('minitoon:pending-invite');
    } catch {
      // Keep token if acceptance fails, so the user can retry after reauth or deployment fixes.
    }
  }

  /** Debounced — triggers after any local write. Pushes after 2 s of silence. */
  scheduleSync(): void {
    if (!getSessionToken()) return;
    if (this._timer !== null) clearTimeout(this._timer);
    this._timer = setTimeout(() => { this._timer = null; void this.pushProfile(); }, 2000);
  }

  /** Push current localStorage state to server. */
  async pushProfile(): Promise<void> {
    if (!getSessionToken()) return;
    await api.post('/profile/update.php', {
      coins:           ArcadeStore.getCoins(),
      active_card_back:ArcadeStore.getCardBack(),
      owned_card_backs:ArcadeStore.getOwnedCardBacks(),
      wins:            (ArcadeStore.get('wins')          as number) ?? 0,
      losses:          (ArcadeStore.get('losses')        as number) ?? 0,
      games_played:    (ArcadeStore.get('gamesPlayed')   as number) ?? 0,
      best_streak:     (ArcadeStore.get('bestStreak')    as number) ?? 0,
      current_streak:  (ArcadeStore.get('currentStreak') as number) ?? 0,
    }).catch(() => { /* network error — will retry next write */ });
  }

  /** Verify premium directly with the server (authoritative). */
  async checkPremium(): Promise<boolean> {
    if (!getSessionToken()) return ArcadeStore.getPremium().active;
    try {
      const profile = await api.get<ServerProfile>('/profile/get.php');
      if (profile.premium_active && profile.premium_until) {
        ArcadeStore.set('premium', { until: new Date(profile.premium_until).getTime() });
        return true;
      }
      ArcadeStore.set('premium', null);
      return false;
    } catch {
      return ArcadeStore.getPremium().active;
    }
  }

  onAuthChange(cb: AuthListener): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _notify(loggedIn: boolean, email: string | null): void {
    this._listeners.forEach(cb => cb(loggedIn, email));
  }
}

export const sync = new SyncManager();
