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

const STORE_KEY = 'board-rush:arcade-store';

interface ArcadeData {
  coins?: number;
  unlockedGames?: string[];
  playerName?: string;
  lastPlayedGame?: string;
  [key: string]: unknown;
}

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
  getCoins(): number {
    return load().coins ?? 0;
  },

  setCoins(amount: number): void {
    const data = load();
    data.coins = Math.max(0, amount);
    save(data);
  },

  addCoins(amount: number): number {
    const data = load();
    data.coins = Math.max(0, (data.coins ?? 0) + amount);
    save(data);
    return data.coins;
  },

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