// Client-side parental-controls enforcement — daily screen-time limits and
// per-game blocking, set by a linked parent (see shared/parent-api.ts).
// Enforcement is necessarily client-side: a static-hosted site has no
// server to intervene at request time, so this is the same trust model as
// the rest of the app (a genuine speed bump for a young kid, not a
// tamper-proof lock) — worth being upfront about rather than a hidden gap.
import { sync } from './sync';
import { getSupabase } from './supabase-client';

const TICK_MS = 30_000;
const STORAGE_PREFIX = 'darsislam:screen-time:';

interface Controls {
  daily_time_limit_minutes: number | null;
  blocked_game_ids: string[];
}

let cachedControls: Controls | null | undefined;
let loadingControls: Promise<Controls | null> | null = null;

function todayKey(): string {
  const d = new Date();
  return `${STORAGE_PREFIX}${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getElapsedMinutesToday(): number {
  try {
    return Number(localStorage.getItem(todayKey())) || 0;
  } catch {
    return 0;
  }
}

function addElapsedMinutes(minutes: number): void {
  try {
    localStorage.setItem(todayKey(), String(getElapsedMinutesToday() + minutes));
  } catch {
    /* storage unavailable — enforcement just won't persist across reloads */
  }
}

async function loadControls(): Promise<Controls | null> {
  if (cachedControls !== undefined) return cachedControls;
  if (loadingControls) return loadingControls;

  loadingControls = (async () => {
    await sync.init().catch(() => {});
    if (!sync.isStudent || !sync.userId) {
      cachedControls = null;
      return cachedControls;
    }
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('parental_controls')
        .select('daily_time_limit_minutes, blocked_game_ids')
        .eq('student_id', sync.userId)
        .maybeSingle();
      cachedControls = data
        ? { daily_time_limit_minutes: data.daily_time_limit_minutes, blocked_game_ids: data.blocked_game_ids ?? [] }
        : null;
    } catch {
      cachedControls = null;
    }
    return cachedControls;
  })();

  return loadingControls;
}

/** Used by the wrapper hub to hide/gray out blocked game cards. Resolves
 *  false immediately (no network call) for any non-student account. */
export async function isGameBlocked(gameId: string): Promise<boolean> {
  const controls = await loadControls();
  return !!controls?.blocked_game_ids.includes(gameId);
}

/** Used by the wrapper hub before navigating into a game — returns true if
 *  today's time budget is already used up. */
export async function isTimeUpForToday(): Promise<boolean> {
  const controls = await loadControls();
  if (!controls?.daily_time_limit_minutes) return false;
  return getElapsedMinutesToday() >= controls.daily_time_limit_minutes;
}

function showTimeUpOverlay(): void {
  if (document.getElementById('parental-time-up-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'parental-time-up-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(10,10,15,0.96);'
    + 'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;'
    + 'padding:24px;color:#fff;font-family:system-ui,sans-serif;';
  overlay.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px;">⏰</div>
    <h2 style="margin:0 0 8px;font-size:22px;">Time's up for today!</h2>
    <p style="margin:0;color:#a9a9c4;max-width:320px;">Ask a parent if you'd like more time.</p>`;
  document.body.appendChild(overlay);
}

/** Called once per game boot (from bootQuizGame). No-ops entirely for
 *  non-student accounts — no timer, no network call — so this costs
 *  nothing for the vast majority of players/guests. */
export function startScreenTimeEnforcement(): void {
  void loadControls().then((controls) => {
    if (!sync.isStudent) return;

    if (controls?.daily_time_limit_minutes && getElapsedMinutesToday() >= controls.daily_time_limit_minutes) {
      showTimeUpOverlay();
    }

    setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      addElapsedMinutes(TICK_MS / 60_000);
      if (controls?.daily_time_limit_minutes && getElapsedMinutesToday() >= controls.daily_time_limit_minutes) {
        showTimeUpOverlay();
      }
    }, TICK_MS);
  });
}
