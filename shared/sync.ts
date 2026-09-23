/**
 * SyncManager — bridges ArcadeStore/PlayerProgress (localStorage) with
 * Supabase (auth + the `profiles` table).
 *
 * Local-first: all reads from localStorage (instant, offline-capable).
 * On login: pull server profile → merge into localStorage.
 * On writes: debounced push (2 s after last write).
 * Guest mode: full game playable without an account.
 *
 * Two account paths:
 *  - email magic-link (player/teacher/parent) via signIn(email)
 *  - anonymous (student, via a class join-code) via joinClassAsStudent()
 */
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from './supabase-client';
import { ArcadeStore } from './arcade-store';
import { PlayerProgress } from './player-progress';

type AuthListener = (loggedIn: boolean, email: string | null) => void;
export type UserRole = 'player' | 'teacher' | 'student' | 'parent';

interface ProfileRow {
  id: string;
  role: UserRole;
  display_name: string | null;
  coins: number;
  active_card_back: string;
  owned_card_backs: string[];
  wins: number;
  losses: number;
  games_played: number;
  best_streak: number;
  current_streak: number;
  xp: number;
  daily_streak: number;
  best_daily_streak: number;
  last_played_date: string | null;
  badges: string[];
  game_round_counts: Record<string, number>;
}

class SyncManager {
  private _userId: string | null = null;
  private _email: string | null = null;
  private _role: UserRole = 'player';
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _listeners: Set<AuthListener> = new Set();
  private _ready = false;
  private _initPromise: Promise<void> | null = null;

  get userId() { return this._userId; }
  get email() { return this._email; }
  get role() { return this._role; }
  get isTeacher() { return this._role === 'teacher'; }
  get isParent() { return this._role === 'parent'; }
  get isStudent() { return this._role === 'student'; }
  get isLoggedIn() { return !!this._userId; }
  get isReady() { return this._ready; }

  // Every game's ProgressBar calls this, and now the screen-time enforcer
  // does too — idempotent so a second caller just awaits the same in-flight
  // (or already-resolved) initialization instead of double-subscribing to
  // auth-state changes.
  async init(): Promise<void> {
    if (this._initPromise) return this._initPromise;
    this._initPromise = this._doInit();
    return this._initPromise;
  }

  private async _doInit(): Promise<void> {
    const supabase = getSupabase();

    supabase.auth.onAuthStateChange((_event, session) => {
      void this.applySession(session);
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        await this.pullProfile(session);
      } catch {
        this.resetSessionState();
      }
    }

    this._ready = true;
  }

  private async applySession(session: Session | null): Promise<void> {
    if (!session) {
      const wasLoggedIn = this.isLoggedIn;
      this.resetSessionState();
      if (wasLoggedIn) this._notify(false, null);
      return;
    }
    try {
      await this.pullProfile(session);
    } catch {
      /* transient — next scheduled sync or reload will retry */
    }
  }

  /** Email magic-link sign-in — player/teacher/parent accounts. */
  async signIn(email: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    if (error) throw error;
  }

  /** Anonymous student sign-in + join-class, in one call — mirrors the old
   *  join-class.php flow (no email, just a class code and a display name).
   *  If already signed in as *some* account, that identity is reused rather
   *  than starting a fresh anonymous one (e.g. re-running this after a
   *  page reload with an existing anonymous session). */
  async joinClassAsStudent(joinCode: string, displayName: string): Promise<{ class_name: string; school_name: string; family_code: string }> {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    }

    await supabase.rpc('record_code_attempt', { p_rpc_name: 'join_class' }).catch(() => {});

    const { data, error } = await supabase.rpc('join_class', {
      p_join_code: joinCode,
      p_display_name: displayName,
    });
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    const { data: { session: newSession } } = await supabase.auth.getSession();
    if (newSession) await this.pullProfile(newSession);

    return { class_name: row.class_name, school_name: row.school_name, family_code: row.family_code };
  }

  async signOut(): Promise<void> {
    const supabase = getSupabase();
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    this.resetSessionState();
    this._notify(false, null);
  }

  async pullProfile(session: Session): Promise<void> {
    const supabase = getSupabase();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single<ProfileRow>();
    if (error) throw error;

    this._userId = profile.id;
    this._email = session.user.email ?? null;
    this._role = profile.role;

    const localOwned = ArcadeStore.getOwnedCardBacks();
    const serverOwned = profile.owned_card_backs ?? ['cardBack_blue1'];
    const merged = [...new Set([...localOwned, ...serverOwned])];

    ArcadeStore.set('ownedCardBacks', merged);
    ArcadeStore.setCardBack(profile.active_card_back ?? ArcadeStore.getCardBack());
    ArcadeStore.setCoins(Math.max(ArcadeStore.getCoins(), profile.coins));
    ArcadeStore.set('wins', profile.wins ?? 0);
    ArcadeStore.set('losses', profile.losses ?? 0);
    ArcadeStore.set('gamesPlayed', profile.games_played ?? 0);
    ArcadeStore.set('bestStreak', profile.best_streak ?? 0);
    ArcadeStore.set('currentStreak', profile.current_streak ?? 0);

    if (profile.display_name && !ArcadeStore.getPlayerName()) {
      ArcadeStore.setPlayerName(profile.display_name);
    }
    PlayerProgress.applySyncSnapshot({
      xp: profile.xp,
      daily_streak: profile.daily_streak,
      best_daily_streak: profile.best_daily_streak,
      last_played_date: profile.last_played_date,
      badges: profile.badges,
      game_round_counts: profile.game_round_counts,
    });

    this._notify(true, this._email);

    const localProgress = PlayerProgress.getSyncSnapshot();
    if (
      ArcadeStore.getCoins() > profile.coins
      || merged.length > serverOwned.length
      || localProgress.xp > (profile.xp ?? 0)
      || (ArcadeStore.getPlayerName() && ArcadeStore.getPlayerName() !== profile.display_name)
    ) {
      void this.pushProfile();
    }
  }

  scheduleSync(): void {
    if (!this._userId) return;
    if (this._timer !== null) clearTimeout(this._timer);
    this._timer = setTimeout(() => {
      this._timer = null;
      void this.pushProfile();
    }, 2000);
  }

  async pushProfile(): Promise<void> {
    if (!this._userId) return;
    const supabase = getSupabase();
    const progress = PlayerProgress.getSyncSnapshot();
    await supabase.from('profiles').update({
      coins: ArcadeStore.getCoins(),
      active_card_back: ArcadeStore.getCardBack(),
      owned_card_backs: ArcadeStore.getOwnedCardBacks(),
      wins: Math.max(0, (ArcadeStore.get('wins') as number) ?? 0),
      losses: Math.max(0, (ArcadeStore.get('losses') as number) ?? 0),
      games_played: (ArcadeStore.get('gamesPlayed') as number) ?? 0,
      best_streak: (ArcadeStore.get('bestStreak') as number) ?? 0,
      current_streak: (ArcadeStore.get('currentStreak') as number) ?? 0,
      display_name: ArcadeStore.getPlayerName() ?? null,
      xp: progress.xp,
      daily_streak: progress.daily_streak,
      best_daily_streak: progress.best_daily_streak,
      last_played_date: progress.last_played_date,
      badges: progress.badges,
      game_round_counts: progress.game_round_counts,
    }).eq('id', this._userId).then(() => {}, () => { /* network error — will retry next write */ });
  }

  onAuthChange(cb: AuthListener): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private resetSessionState(): void {
    this._userId = null;
    this._email = null;
    this._role = 'player';
  }

  private _notify(loggedIn: boolean, email: string | null): void {
    this._listeners.forEach((cb) => cb(loggedIn, email));
  }
}

export const sync = new SyncManager();
