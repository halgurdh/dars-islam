/**
 * Development orchestrator.
 * Runs the wrapper hub and all games concurrently so developers can
 * see the full nested URL structure locally.
 *
 * Note: For true PWA scope testing, deploy to a real server or use
 * `npm run build && npx serve dist` to simulate the production layout.
 */

import { spawn } from 'child_process';
import { readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const GAMES_DIR = join(ROOT, 'games');

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

function startMultiplayerServer() {
  log('Starting multiplayer server on ws://localhost:8787 ...');
  const proc = spawn('node', ['scripts/multiplayer-server.mjs'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });
  proc.on('error', (err) => {
    console.error('[dev] Error starting multiplayer server:', err.message);
  });
  return proc;
}

// Start wrapper hub on port 5173
startMultiplayerServer();
startServer('wrapper hub', join(ROOT, 'wrapper'), 5173);

// Start each game on its own port (concurrently)
const games = readdirSync(GAMES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let port = 5174;
for (const game of games) {
  startServer(game, join(GAMES_DIR, game), port);
  port++;
}

log('All dev servers started (running concurrently).');
log('');
log('Multiplayer:  ws://localhost:8787');
log('');
log('Wrapper hub:  http://localhost:5173');
games.forEach((g, i) => {
  log(`${g}: http://localhost:${5174 + i}`);
});
log('');
log('Press Ctrl+C to stop all servers.');
