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
  { id: 'number-basics',      title: 'Number Basics',      icon: '🔢' },
  { id: 'times-table-dojo',   title: 'Times Table Dojo',   icon: '🥋' },
  { id: 'math-tricks-lab',    title: 'Math Tricks Lab',    icon: '🧠' },
  { id: 'mental-math-sprint', title: 'Mental Math Sprint', icon: '⚡' },
  { id: 'math-mastery',       title: 'Math Mastery',       icon: '🎓' },
  { id: 'shapes-colors',      title: 'Shapes & Colors',    icon: '🎨' },
  { id: 'counting-fun',       title: 'Counting Fun',       icon: '🔢' },
  { id: 'pattern-play',       title: 'Pattern Play',       icon: '🧩' },
  { id: 'wonder-why',         title: 'Wonder Why',         icon: '🌱' },
  { id: 'kind-hearts',        title: 'Kind Hearts',        icon: '💛' },
  { id: 'duas-builder',       title: 'Duas Builder',       icon: '🤲' },
  { id: 'juz-amma-match',     title: 'Quran Juz Amma Match', icon: '📗' },
  { id: 'memory-match',       title: 'Memory Match',       icon: '🎴' },
  { id: 'geometry-essentials', title: 'Geometry Essentials', icon: '📐' },
  { id: 'world-history',       title: 'World History',       icon: '🏛️' },
  { id: 'stats-probability',   title: 'Statistics Essentials', icon: '📊' },
  { id: 'arabic-grammar',      title: 'Arabic Grammar Basics', icon: '📖' },
  { id: 'money-zakat',         title: 'Money & Zakat Math',   icon: '💰' },
  { id: 'geography',           title: 'World Geography',       icon: '🌍' },
  { id: 'language-arts',       title: 'Language Arts',         icon: '✏️' },
  { id: 'civics-community',    title: 'Civics & Community',    icon: '🏛️' },
  { id: 'health-body',         title: 'Health & The Body',     icon: '💪' },
  { id: 'earth-space-science', title: 'Earth & Space Science', icon: '🪐' },
  { id: 'algebra-basics',      title: 'Algebra Basics',         icon: '📐' },
  { id: 'number-theory-logic', title: 'Number Theory & Logic',  icon: '🔢' },
  { id: 'seerah-timeline',     title: 'Seerah Timeline',        icon: '🕋' },
  { id: 'fiqh-essentials',     title: 'Fiqh Essentials',        icon: '🤲' },
  { id: 'world-cultures',      title: 'World Cultures',         icon: '🌐' },
  { id: 'advanced-trigonometry', title: 'Advanced Trigonometry', icon: '📐' },
  { id: 'precalc-functions',     title: 'Pre-Calc Functions',    icon: '📈' },
  { id: 'digital-literacy',      title: 'Digital Literacy',      icon: '💻' },
];

export function gameTitle(gameId: string): string {
  return GAME_CATALOG.find((g) => g.id === gameId)?.title ?? gameId;
}
