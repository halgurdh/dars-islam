/**
 * Cross-game XP, levels, daily streaks and badges.
 *
 * Local-first, same pattern as arcade-store.ts: every game on the same
 * origin shares this localStorage record, so finishing a round in any
 * game contributes to one global streak/level/badge set. When signed in,
 * sync.ts pushes/pulls this alongside the rest of the profile.
 */
import { BADGES, evaluateNewBadges, type Badge, type BadgeId, type ProgressStats } from './badges';

const STORE_KEY = 'darsislam:player-progress';

interface ProgressData {
  xp: number;
  dailyStreak: number;
  bestDailyStreak: number;
  lastPlayedDate: string | null; // YYYY-MM-DD, local time
  totalRounds: number;
  perfectRounds: number;
  gameRoundCounts: Record<string, number>;
  badges: BadgeId[];
}

function defaults(): ProgressData {
  return {
    xp: 0,
    dailyStreak: 0,
    bestDailyStreak: 0,
    lastPlayedDate: null,
    totalRounds: 0,
    perfectRounds: 0,
    gameRoundCounts: {},
    badges: [],
  };
}

function load(): ProgressData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    return defaults();
  }
}

// Registered by progress-bar.ts after init — called after every local write,
// same bridge pattern ArcadeStore uses to trigger sync.scheduleSync().
let _syncCallback: (() => void) | null = null;
function save(data: ProgressData): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  _syncCallback?.();
}

function todayStr(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayStr(d);
}

// XP curve: level N requires (N-1)^2 * 100 total XP (100, 400, 900, 1600, ...).
export function xpForLevel(level: number): number {
  return (level - 1) ** 2 * 100;
}

export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export interface CompletionInput {
  gameId: string;
  itemsCompleted: number;
  /** Omit if this game doesn't track mistakes — no perfect-round bonus/badge then. */
  mistakes?: number;
}

export interface CompletionResult {
  xpAwarded: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
  dailyStreak: number;
  streakExtended: boolean;
  newBadges: Badge[];
}

export interface ProgressState {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  dailyStreak: number;
  bestDailyStreak: number;
  totalRounds: number;
  badges: Badge[];
  gameRoundCounts: Record<string, number>;
}

export interface RoundTier { label: string; icon: string; }

// A "grading style" read on a single game's round count, for the student
// dashboard's per-game breakdown — not a real curriculum assessment, just
// enough to answer "how am I doing at this one" at a glance.
export function tierForRounds(count: number): RoundTier {
  if (count === 0) return { label: 'Not started', icon: '⚪' };
  if (count < 5) return { label: 'Bronze', icon: '🥉' };
  if (count < 15) return { label: 'Silver', icon: '🥈' };
  return { label: 'Gold', icon: '🥇' };
}

export const PlayerProgress = {
  registerSyncCallback(cb: () => void): void {
    _syncCallback = cb;
  },

  getState(): ProgressState {
    const data = load();
    const level = levelForXp(data.xp);
    return {
      xp: data.xp,
      level,
      xpIntoLevel: data.xp - xpForLevel(level),
      xpForNextLevel: xpForLevel(level + 1) - xpForLevel(level),
      dailyStreak: data.dailyStreak,
      bestDailyStreak: data.bestDailyStreak,
      totalRounds: data.totalRounds,
      badges: data.badges.map((id) => BADGES.find((b) => b.id === id)!).filter(Boolean),
      gameRoundCounts: data.gameRoundCounts,
    };
  },

  /** Call once when a game round finishes successfully. */
  recordCompletion(input: CompletionInput): CompletionResult {
    const data = load();
    const prevLevel = levelForXp(data.xp);
    const perfect = input.mistakes === 0;

    const xpAwarded = Math.max(0, input.itemsCompleted) * 10 + (perfect ? 20 : 0);
    data.xp += xpAwarded;
    data.totalRounds += 1;
    if (perfect) data.perfectRounds += 1;
    data.gameRoundCounts[input.gameId] = (data.gameRoundCounts[input.gameId] ?? 0) + 1;

    const today = todayStr();
    let streakExtended = false;
    if (data.lastPlayedDate !== today) {
      data.dailyStreak = data.lastPlayedDate === yesterdayStr() ? data.dailyStreak + 1 : 1;
      data.lastPlayedDate = today;
      data.bestDailyStreak = Math.max(data.bestDailyStreak, data.dailyStreak);
      streakExtended = true;
    }

    const level = levelForXp(data.xp);
    const stats: ProgressStats = {
      totalXp: data.xp,
      level,
      dailyStreak: data.dailyStreak,
      perfectRounds: data.perfectRounds,
      totalRounds: data.totalRounds,
      gameRoundCounts: data.gameRoundCounts,
    };
    const newBadges = evaluateNewBadges(stats, data.badges);
    data.badges.push(...newBadges.map((b) => b.id));

    save(data);

    return {
      xpAwarded,
      totalXp: data.xp,
      level,
      leveledUp: level > prevLevel,
      dailyStreak: data.dailyStreak,
      streakExtended,
      newBadges,
    };
  },

  // ── Sync bridge (mirrors ArcadeStore's server-facing snapshot) ──────────

  getSyncSnapshot() {
    const data = load();
    return {
      xp: data.xp,
      daily_streak: data.dailyStreak,
      best_daily_streak: data.bestDailyStreak,
      last_played_date: data.lastPlayedDate,
      badges: data.badges,
    };
  },

  applySyncSnapshot(snapshot: {
    xp?: number;
    daily_streak?: number;
    best_daily_streak?: number;
    last_played_date?: string | null;
    badges?: string[];
  }): void {
    const data = load();
    // Server never decreases progress made elsewhere — take the max/union,
    // same "local-first, merge on pull" rule sync.ts already applies to coins.
    data.xp = Math.max(data.xp, snapshot.xp ?? 0);
    data.bestDailyStreak = Math.max(data.bestDailyStreak, snapshot.best_daily_streak ?? 0);
    if ((snapshot.daily_streak ?? 0) > data.dailyStreak && snapshot.last_played_date) {
      data.dailyStreak = snapshot.daily_streak ?? data.dailyStreak;
      data.lastPlayedDate = snapshot.last_played_date;
    }
    const remoteBadges = (snapshot.badges ?? []) as BadgeId[];
    data.badges = [...new Set([...data.badges, ...remoteBadges])];
    localStorage.setItem(STORE_KEY, JSON.stringify(data)); // no _syncCallback: avoid pull->push loop
  },
};
