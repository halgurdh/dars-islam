/**
 * Development orchestrator.
 * Runs the wrapper hub and all games concurrently so developers can
 * see the full nested URL structure locally.
 *
 * Note: For true PWA scope testing, deploy to a real server or use
 * `npm run build && npx serve dist` to simulate the production layout.
 */

import { spawn } from 'child_process';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const GAMES_DIR = join(ROOT, 'games');
const GAME_PORTS = {
  'board-rush': 5174,
  'karma': 5175,
  'net-strike': 5176,
  'rogue-flush': 5177,
};

function log(msg) {
  console.log(`[dev] ${msg}`);
}

function startServer(name, cwd, port) {
  log(`Starting ${name} on http://localhost:${port} ...`);
  const proc = spawn('npx', ['vite', '--port', port.toString()], {
    cwd,
    stdio: 'inherit',
    shell: true,
  });
  proc.on('error', (err) => {
    console.error(`[dev] Error starting ${name}:`, err.message);
  });
  return proc;
}

// Start wrapper hub on port 5173
startServer('wrapper hub', join(ROOT, 'wrapper'), 5173);

// Start each game on its own port (concurrently)
const games = Object.keys(GAME_PORTS);
for (const game of games) {
  startServer(game, join(GAMES_DIR, game), GAME_PORTS[game]);
}

log('All dev servers started (running concurrently).');
log('');
log('Wrapper hub:  http://localhost:5173');
games.forEach((g, i) => {
  log(`${g}: http://localhost:${GAME_PORTS[g]}`);
});
log('');
log('Press Ctrl+C to stop all servers.');
