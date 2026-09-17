import { readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const GAMES_DIR = join(ROOT, 'games');

export const WRAPPER_PORT = 5173;

export const PREFERRED_GAME_PORTS = {
  'board-rush': 5174,
  'rogue-flush': 5175,
  'karma': 5176,
  'net-strike': 5177,
  'turbo-drift': 5178,
  'number-basics': 5187,
  'times-table-dojo': 5188,
  'math-tricks-lab': 5189,
  'mental-math-sprint': 5190,
  'math-mastery': 5191,
  'shapes-colors': 5192,
  'counting-fun': 5193,
  'pattern-play': 5194,
  'wonder-why': 5195,
  'kind-hearts': 5196,
  'duas-builder': 5197,
  'juz-amma-match': 5198,
  'memory-match': 5199,
  'geometry-essentials': 5200,
  'world-history': 5201,
  'stats-probability': 5202,
  'arabic-grammar': 5203,
  'money-zakat': 5204,
  'geography': 5205,
  'language-arts': 5206,
  'civics-community': 5207,
  'health-body': 5208,
  'earth-space-science': 5209,
  'algebra-basics': 5210,
  'number-theory-logic': 5211,
  'seerah-timeline': 5212,
  'fiqh-essentials': 5213,
  'world-cultures': 5214,
  'advanced-trigonometry': 5215,
  'precalc-functions': 5216,
  'digital-literacy': 5217,
};

export function getGamePortMap() {
  const games = readdirSync(GAMES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const gamePorts = { ...PREFERRED_GAME_PORTS };
  let nextPort = Math.max(...Object.values(PREFERRED_GAME_PORTS)) + 1;

  for (const game of games) {
    if (gamePorts[game]) continue;
    while (Object.values(gamePorts).includes(nextPort)) nextPort++;
    gamePorts[game] = nextPort;
    nextPort++;
  }

  return gamePorts;
}
