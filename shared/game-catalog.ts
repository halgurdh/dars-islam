// Display metadata for the games that report into PlayerProgress — used by
// the student/teacher dashboards to render a friendly name instead of a
// raw gameId slug. Keep in sync with the game cards in wrapper/index.html.
export interface GameCatalogEntry { id: string; title: string; icon: string; }

export const GAME_CATALOG: GameCatalogEntry[] = [
  { id: 'asma-match',       title: 'Asma Match',       icon: '📿' },
  { id: 'huruf-builder',    title: 'Huruf Builder',    icon: '🔤' },
  { id: 'pillars-builder',  title: 'Pillars Builder',  icon: '🕌' },
  { id: 'prophets-builder', title: 'Prophets Builder', icon: '📖' },
  { id: 'phrases-builder',  title: 'Phrases Builder',  icon: '💬' },
  { id: 'salah-builder',    title: 'Salah Builder',    icon: '🤲' },
  { id: 'months-builder',   title: 'Months Builder',   icon: '🌙' },
  { id: 'letter-trace',     title: 'Letter Trace',     icon: '✍️' },
];

export function gameTitle(gameId: string): string {
  return GAME_CATALOG.find((g) => g.id === gameId)?.title ?? gameId;
}
