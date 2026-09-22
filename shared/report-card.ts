// Shared "report card" renderer — the lenient per-game grading grid, used
// identically by the student dashboard, the teacher roster, and the parent
// dashboard so the visual (and the grading itself) never drifts between
// the three. Deliberately just a Bronze/Silver/Gold/Platinum read on rounds
// played (see tierForRounds in player-progress.ts) — no failing state.
import { GAME_CATALOG } from './game-catalog';
import { tierForRounds } from './player-progress';

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

let stylesInjected = false;
function injectReportCardStyles(): void {
  if (stylesInjected || document.getElementById('report-card-styles')) return;
  stylesInjected = true;
  const s = document.createElement('style');
  s.id = 'report-card-styles';
  s.textContent = `
    .report-card { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px; }
    .report-card__row { display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 6px 10px; border-radius: 8px; background: rgba(127,127,127,0.08); font-size: 0.82rem; }
    .report-card__game { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .report-card__tier { white-space: nowrap; font-weight: 700; opacity: 0.9; }
  `;
  document.head.appendChild(s);
}

/** Only the games a student has actually touched, plus everything untouched shown as "Not started yet". */
export function renderReportCard(gameRoundCounts: Record<string, number>): string {
  injectReportCardStyles();
  const rows = GAME_CATALOG.map((g) => {
    const count = gameRoundCounts[g.id] ?? 0;
    const tier = tierForRounds(count);
    return `<div class="report-card__row">
      <span class="report-card__game">${g.icon} ${escapeHtml(g.title)}</span>
      <span class="report-card__tier">${tier.icon} ${escapeHtml(tier.label)}</span>
    </div>`;
  }).join('');
  return `<div class="report-card">${rows}</div>`;
}

/** Compact one-line summary (e.g. for a roster table cell): "3 Gold · 5 Silver · 12 not started". */
export function summarizeReportCard(gameRoundCounts: Record<string, number>): string {
  const counts: Record<string, number> = {};
  for (const g of GAME_CATALOG) {
    const tier = tierForRounds(gameRoundCounts[g.id] ?? 0).label;
    counts[tier] = (counts[tier] ?? 0) + 1;
  }
  const order = ['Platinum', 'Gold', 'Silver', 'Bronze'];
  const parts = order.filter((t) => counts[t]).map((t) => `${counts[t]} ${t}`);
  return parts.length ? parts.join(' · ') : 'Just getting started';
}
