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

interface ServerProfile {
  user_id: string;
  email: string;
  account_type: AccountType;
  coins: number;
  active_card_back: string;
  owned_card_backs: string[];
  premium_until: string | null;
  premium_active: boolean;
  wins: number;
  losses: number;
  games_played: number;
  best_streak: number;
  current_streak: number;
}

class SyncManager {
  private _userId: string | null = null;
  private _email: string | null = null;
  private _accountType: AccountType = 'consumer';
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _listeners: Set<AuthListener> = new Set();
  private _ready = false;

  get userId() { return this._userId; }
  get email() { return this._email; }
  get accountType() { return this._accountType; }
  get isLoggedIn() { return !!this._userId; }
  get isReady() { return this._ready; }

  async init(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const incoming = params.get('mt_session');
    if (incoming) {
      setSessionToken(incoming);
      params.delete('mt_session');
      const newUrl = [window.location.pathname, params.toString()].filter(Boolean).join('?');
      window.history.replaceState({}, '', newUrl);
    }

    if (getSessionToken()) {
      try {
        await this.pullProfile();
      } catch {
        clearSessionToken();
        this.resetSessionState();
      }
    }

    this._ready = true;
  }

  async signIn(email: string): Promise<void> {
    await api.post('/auth/request-link.php', { email });
  }

  async signOut(): Promise<void> {
    try { await api.post('/auth/logout.php'); } catch { /* ignore */ }
    clearSessionToken();
    this.resetSessionState();
    this._notify(false, null);
  }

  async pullProfile(): Promise<void> {
    const profile = await api.get<ServerProfile>('/profile/get.php');

    this._userId = profile.user_id;
    this._email = profile.email;
    this._accountType = profile.account_type;

    const localOwned = ArcadeStore.getOwnedCardBacks();
    const serverOwned = profile.owned_card_backs ?? ['cardBack_blue1'];
    const merged = [...new Set([...localOwned, ...serverOwned])];
    const finalCoins = Math.max(ArcadeStore.getCoins(), profile.coins);

    ArcadeStore.setCoins(finalCoins);
    ArcadeStore.set('ownedCardBacks', merged);
    ArcadeStore.setCardBack(profile.active_card_back ?? ArcadeStore.getCardBack());
    ArcadeStore.set('wins', profile.wins ?? 0);
    ArcadeStore.set('losses', profile.losses ?? 0);
    ArcadeStore.set('gamesPlayed', profile.games_played ?? 0);
    ArcadeStore.set('bestStreak', profile.best_streak ?? 0);
    ArcadeStore.set('currentStreak', profile.current_streak ?? 0);

    if (profile.premium_active && profile.premium_until) {
      ArcadeStore.set('premium', { until: new Date(profile.premium_until).getTime() });
    } else {
      ArcadeStore.set('premium', null);
    }

    this._notify(true, this._email);

    if (finalCoins > profile.coins || merged.length > serverOwned.length) {
      void this.pushProfile();
    }
  }

  scheduleSync(): void {
    if (!getSessionToken()) return;
    if (this._timer !== null) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._timer = null;
      void this.pushProfile();
    }, 2000);
  }

  async pushProfile(): Promise<void> {
    if (!getSessionToken()) return;
    await api.post('/profile/update.php', {
      coins: ArcadeStore.getCoins(),
      active_card_back: ArcadeStore.getCardBack(),
      owned_card_backs: ArcadeStore.getOwnedCardBacks(),
      wins: (ArcadeStore.get('wins') as number) ?? 0,
      losses: (ArcadeStore.get('losses') as number) ?? 0,
      games_played: (ArcadeStore.get('gamesPlayed') as number) ?? 0,
      best_streak: (ArcadeStore.get('bestStreak') as number) ?? 0,
      current_streak: (ArcadeStore.get('currentStreak') as number) ?? 0,
    }).catch(() => { /* network error — will retry next write */ });
  }

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

  private resetSessionState(): void {
    this._userId = null;
    this._email = null;
    this._accountType = 'consumer';
  }

  private _notify(loggedIn: boolean, email: string | null): void {
    this._listeners.forEach((cb) => cb(loggedIn, email));
  }
}

export const sync = new SyncManager();
