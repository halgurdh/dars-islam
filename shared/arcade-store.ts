/**
 * Shared storage utility for cross-PWA communication.
 *
 * Since all PWAs live under the same origin (arcade.com/*), they share
 * the same localStorage & IndexedDB. This module provides a consistent
 * API for storing/retrieving cross-app data like coins, progress, etc.
 *
 * Usage (in any PWA or the hub):
 *   import { ArcadeStore } from '../../shared/arcade-store.js';
 *   await ArcadeStore.setCoins(100);
 *   const coins = await ArcadeStore.getCoins();
 */

const STORE_KEY = 'minitoon:arcade-store';

const DEFAULT_CARD_BACK = 'cardBack_blue2';

// Set this to match the token in your Stripe Payment Link success URL.
// In Stripe dashboard: Success URL = https://minitoon.games/?pt=YOUR_SECRET_TOKEN
// Replace the placeholder below with your actual token before going live.
export const PREMIUM_TOKEN = 'mt_premium_2025_change_me';

const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface ArcadeData {
  coins?: number;
  unlockedGames?: string[];
  playerName?: string;
  lastPlayedGame?: string;
  activeCardBack?: string;
  ownedCardBacks?: string[];
  premium?: { until: number };
  lastAdTime?: number;
  [key: string]: unknown;
}

// Registered by sync.ts after init — called after every local write.
let _syncCallback: (() => void) | null = null;
function afterWrite() { _syncCallback?.(); }

function load(): ArcadeData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data: ArcadeData): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

export const ArcadeStore = {
  // ── Sync bridge (called by sync.ts) ─────────────────────────────────────

  registerSyncCallback(cb: () => void): void { _syncCallback = cb; },

  // ── Coins ────────────────────────────────────────────────────────────────

  getCoins(): number {
    return load().coins ?? 0;
  },

  setCoins(amount: number): void {
    const data = load();
    data.coins = Math.max(0, amount);
    save(data); afterWrite();
  },

  addCoins(amount: number): number {
    const data = load();
    data.coins = Math.max(0, (data.coins ?? 0) + amount);
    save(data); afterWrite();
    return data.coins as number;
  },

  spendCoins(amount: number): boolean {
    const data = load();
    const current = data.coins ?? 0;
    if (current < amount) return false;
    data.coins = current - amount;
    save(data); afterWrite();
    return true;
  },

  // ── Card backs ───────────────────────────────────────────────────────────

  getCardBack(): string {
    return (load().activeCardBack as string | undefined) ?? DEFAULT_CARD_BACK;
  },

  setCardBack(key: string): void {
    const data = load();
    data.activeCardBack = key;
    save(data); afterWrite();
  },

  getOwnedCardBacks(): string[] {
    const owned = load().ownedCardBacks as string[] | undefined;
    if (!owned) return [DEFAULT_CARD_BACK];
    if (!owned.includes(DEFAULT_CARD_BACK)) return [DEFAULT_CARD_BACK, ...owned];
    return owned;
  },

  unlockCardBack(key: string): void {
    const data = load();
    if (!data.ownedCardBacks) data.ownedCardBacks = [DEFAULT_CARD_BACK];
    const owned = data.ownedCardBacks as string[];
    if (!owned.includes(key)) owned.push(key);
    save(data); afterWrite();
  },

  // ── Premium / Battle Pass ────────────────────────────────────────────────

  getPremium(): { active: boolean; until?: number } {
    const p = load().premium;
    if (!p) return { active: false };
    const active = p.until > Date.now();
    return { active, until: p.until };
  },

  activatePremium(): void {
    const data = load();
    const until = Date.now() + PREMIUM_DURATION_MS;
    data.premium = { until };
    // grant 500 bonus coins
    data.coins = Math.max(0, (data.coins ?? 0) + 500);
    // unlock all red card backs
    if (!data.ownedCardBacks) data.ownedCardBacks = [DEFAULT_CARD_BACK];
    const owned = data.ownedCardBacks as string[];
    for (let i = 1; i <= 5; i++) {
      const key = `cardBack_red${i}`;
      if (!owned.includes(key)) owned.push(key);
    }
    save(data);
  },

  // ── Rewarded ads ─────────────────────────────────────────────────────────

  getLastAdTime(): number {
    return (load().lastAdTime as number | undefined) ?? 0;
  },

  setLastAdTime(t: number): void {
    const data = load();
    data.lastAdTime = t;
    save(data);
  },

  canWatchAd(): boolean {
    const cooldownMs = 5 * 60 * 1000; // 5 minutes
    return Date.now() - this.getLastAdTime() >= cooldownMs;
  },

  adCooldownRemaining(): number {
    const cooldownMs = 5 * 60 * 1000;
    return Math.max(0, cooldownMs - (Date.now() - this.getLastAdTime()));
  },

  // ── Games ────────────────────────────────────────────────────────────────

  getUnlockedGames(): string[] {
    return load().unlockedGames ?? [];
  },

  unlockGame(gameId: string): void {
    const data = load();
    if (!data.unlockedGames) data.unlockedGames = [];
    if (!data.unlockedGames.includes(gameId)) {
      data.unlockedGames.push(gameId);
    }
    save(data);
  },

  getPlayerName(): string | undefined {
    return load().playerName;
  },

  setPlayerName(name: string): void {
    const data = load();
    data.playerName = name;
    save(data);
  },

  setLastPlayedGame(gameId: string): void {
    const data = load();
    data.lastPlayedGame = gameId;
    save(data);
  },

  getLastPlayedGame(): string | undefined {
    return load().lastPlayedGame;
  },

  get(key: string): unknown {
    return load()[key];
  },

  set(key: string, value: unknown): void {
    const data = load();
    data[key] = value;
    save(data);
  },

  clear(): void {
    localStorage.removeItem(STORE_KEY);
  },
};
