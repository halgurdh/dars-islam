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
