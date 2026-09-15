/**
 * Pure-logic verification for shared/player-progress.ts — level curve, XP
 * awarding, daily-streak transitions and badge unlocks. Runs in plain Node
 * via tsx, so localStorage is stubbed with a tiny in-memory Map.
 */
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string): void { this.store.set(key, value); }
  removeItem(key: string): void { this.store.delete(key); }
  clear(): void { this.store.clear(); }
}
(globalThis as any).localStorage = new MemoryStorage();

const { PlayerProgress, xpForLevel, levelForXp } = await import('../shared/player-progress');

let checks = 0, fails = 0;
function check(cond: boolean, msg: string) {
  checks++;
  if (!cond) { fails++; console.log(`  ✗ FAIL: ${msg}`); }
}
function section(t: string) { console.log(`\n[${t}]`); }

function resetStore() { (globalThis as any).localStorage.clear(); }

// ── Level curve ─────────────────────────────────────────────────────────
section('Level curve');
{
  check(levelForXp(0) === 1, 'level 1 at 0 xp');
  check(levelForXp(99) === 1, 'still level 1 just under 100 xp');
  check(levelForXp(100) === 2, 'level 2 at exactly 100 xp');
  check(levelForXp(399) === 2, 'level 2 just under 400 xp');
  check(levelForXp(400) === 3, 'level 3 at exactly 400 xp');
  check(xpForLevel(1) === 0 && xpForLevel(2) === 100 && xpForLevel(3) === 400, 'xpForLevel matches the curve');
}

// ── XP awarding ─────────────────────────────────────────────────────────
section('XP awarding');
{
  resetStore();
  const r1 = PlayerProgress.recordCompletion({ gameId: 'huruf-builder', itemsCompleted: 5, mistakes: 2 });
  check(r1.xpAwarded === 50, 'no perfect bonus with mistakes > 0');
  check(r1.totalXp === 50, 'totalXp reflects the award');
  check(r1.level === 1, 'still level 1 at 50 xp');

  const r2 = PlayerProgress.recordCompletion({ gameId: 'huruf-builder', itemsCompleted: 5, mistakes: 0 });
  check(r2.xpAwarded === 70, 'perfect round adds the +20 bonus');
  check(r2.totalXp === 120, 'xp accumulates across rounds');
  check(r2.level === 2 && r2.leveledUp, 'crossing 100 xp levels up');
}

// ── Daily streak ────────────────────────────────────────────────────────
section('Daily streak');
{
  resetStore();
  const first = PlayerProgress.recordCompletion({ gameId: 'salah-builder', itemsCompleted: 1 });
  check(first.dailyStreak === 1 && first.streakExtended, 'first-ever round starts a 1-day streak');

  const sameDay = PlayerProgress.recordCompletion({ gameId: 'salah-builder', itemsCompleted: 1 });
  check(sameDay.dailyStreak === 1 && !sameDay.streakExtended, 'a second round the same day does not extend the streak');

  // Simulate "yesterday" by rewriting the stored lastPlayedDate directly —
  // the module doesn't expose todayStr/yesterdayStr, so we replicate that
  // date math here to backdate the record by exactly one day.
  const raw = JSON.parse((globalThis as any).localStorage.getItem('darsislam:player-progress'));
  const d = new Date();
  d.setDate(d.getDate() - 1);
  raw.lastPlayedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  (globalThis as any).localStorage.setItem('darsislam:player-progress', JSON.stringify(raw));

  const nextDay = PlayerProgress.recordCompletion({ gameId: 'salah-builder', itemsCompleted: 1 });
  check(nextDay.dailyStreak === 2 && nextDay.streakExtended, 'playing the day after extends the streak to 2');

  // Skip two days entirely — streak should reset to 1, not stay broken at 0.
  const raw2 = JSON.parse((globalThis as any).localStorage.getItem('darsislam:player-progress'));
  const old = new Date();
  old.setDate(old.getDate() - 5);
  raw2.lastPlayedDate = `${old.getFullYear()}-${String(old.getMonth() + 1).padStart(2, '0')}-${String(old.getDate()).padStart(2, '0')}`;
  (globalThis as any).localStorage.setItem('darsislam:player-progress', JSON.stringify(raw2));

  const afterGap = PlayerProgress.recordCompletion({ gameId: 'salah-builder', itemsCompleted: 1 });
  check(afterGap.dailyStreak === 1, 'a gap in play resets the streak to 1, not 0');
}

// ── Badges ──────────────────────────────────────────────────────────────
section('Badges');
{
  resetStore();
  const r1 = PlayerProgress.recordCompletion({ gameId: 'asma-match', itemsCompleted: 3, mistakes: 0 });
  const badgeIds = r1.newBadges.map((b) => b.id);
  check(badgeIds.includes('first_steps'), 'first round unlocks First Steps');
  check(badgeIds.includes('perfectionist'), 'a zero-mistake round unlocks Perfectionist');

  const r2 = PlayerProgress.recordCompletion({ gameId: 'asma-match', itemsCompleted: 3, mistakes: 0 });
  check(r2.newBadges.length === 0, 'already-owned badges are not reawarded');

  const state = PlayerProgress.getState();
  check(state.badges.some((b) => b.id === 'first_steps'), 'getState reflects unlocked badges');
}

// ── Sync merge semantics ────────────────────────────────────────────────
section('Sync snapshot merge');
{
  resetStore();
  PlayerProgress.recordCompletion({ gameId: 'months-builder', itemsCompleted: 10 }); // 100 xp
  PlayerProgress.applySyncSnapshot({ xp: 40, daily_streak: 1, best_daily_streak: 1, last_played_date: null, badges: ['streak_3'] });
  const state = PlayerProgress.getState();
  check(state.xp === 100, 'a lower remote xp never overwrites higher local xp');
  check(state.badges.some((b) => b.id === 'streak_3'), 'remote-only badges are merged in');
  check(state.badges.some((b) => b.id === 'first_steps'), 'local-only badges survive the merge');
}

console.log(`\n${checks - fails}/${checks} checks passed.`);
if (fails > 0) process.exit(1);
