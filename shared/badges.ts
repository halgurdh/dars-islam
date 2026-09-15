// Badge catalog shared by every game's progress widget. Content-only —
// the unlock logic lives in player-progress.ts next to the stats it reads.
export type BadgeId =
  | 'first_steps'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'perfectionist'
  | 'well_rounded'
  | 'level_5'
  | 'level_10'
  | 'level_20'
  | 'centurion'
  | 'dedicated_20'
  | 'dedicated_50';

export interface Badge {
  id: BadgeId;
  icon: string;
  name: string;
  description: string;
}

export const BADGES: Badge[] = [
  { id: 'first_steps',   icon: '🌱', name: 'First Steps',      description: 'Complete your first round' },
  { id: 'streak_3',      icon: '🔥', name: '3-Day Streak',     description: 'Play 3 days in a row' },
  { id: 'streak_7',      icon: '🔥', name: 'Week Streak',      description: 'Play 7 days in a row' },
  { id: 'streak_30',     icon: '🔥', name: 'Month Streak',     description: 'Play 30 days in a row' },
  { id: 'perfectionist', icon: '💎', name: 'Perfectionist',    description: 'Finish a round with zero mistakes' },
  { id: 'well_rounded',  icon: '🧭', name: 'Well-Rounded',     description: 'Play rounds in 5 different games' },
  { id: 'level_5',       icon: '⭐', name: 'Level 5',          description: 'Reach level 5' },
  { id: 'level_10',      icon: '🌟', name: 'Level 10',         description: 'Reach level 10' },
  { id: 'level_20',      icon: '👑', name: 'Level 20',         description: 'Reach level 20' },
  { id: 'centurion',     icon: '🏆', name: 'Centurion',        description: 'Earn 1,000 total XP' },
  { id: 'dedicated_20',  icon: '📚', name: 'Dedicated Learner', description: 'Complete 20 rounds' },
  { id: 'dedicated_50',  icon: '🎓', name: 'Scholar',          description: 'Complete 50 rounds' },
];

export interface ProgressStats {
  totalXp: number;
  level: number;
  dailyStreak: number;
  perfectRounds: number;
  totalRounds: number;
  gameRoundCounts: Record<string, number>;
}

/** Returns newly-unlocked badges (those in `stats` not already in `owned`). */
export function evaluateNewBadges(stats: ProgressStats, owned: BadgeId[]): Badge[] {
  const has = new Set(owned);
  const unlocked: Badge[] = [];
  const check = (id: BadgeId, met: boolean) => {
    if (has.has(id) || !met) return;
    has.add(id);
    unlocked.push(BADGES.find((b) => b.id === id)!);
  };

  check('first_steps', stats.totalRounds >= 1);
  check('streak_3', stats.dailyStreak >= 3);
  check('streak_7', stats.dailyStreak >= 7);
  check('streak_30', stats.dailyStreak >= 30);
  check('perfectionist', stats.perfectRounds >= 1);
  check('well_rounded', Object.keys(stats.gameRoundCounts).length >= 5);
  check('level_5', stats.level >= 5);
  check('level_10', stats.level >= 10);
  check('level_20', stats.level >= 20);
  check('centurion', stats.totalXp >= 1000);
  check('dedicated_20', stats.totalRounds >= 20);
  check('dedicated_50', stats.totalRounds >= 50);

  return unlocked;
}
