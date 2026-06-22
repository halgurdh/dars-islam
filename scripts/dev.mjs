/**
 * Development orchestrator.
 * Runs the wrapper hub and all games concurrently so developers can
 * see the full nested URL structure locally.
 *
 * Note: For true PWA scope testing, deploy to a real server or use
 * `npm run build && npx serve dist` to simulate the production layout.
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const GAMES_DIR = join(ROOT, 'games');

const processes = [];

function log(msg) {
  console.log(`[dev] ${msg}`);
}

// Start wrapper hub on port 5173
log('Starting wrapper hub on http://localhost:5173 ...');
const wrapperProc = execSync('npx vite --port 5173', {
  cwd: join(ROOT, 'wrapper'),
  stdio: 'inherit',
  shell: true,
});

// Start each game on its own port
const games = readdirSync(GAMES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let port = 5174;
for (const game of games) {
  log(`Starting ${game} on http://localhost:${port} ...`);
  execSync(`npx vite --port ${port}`, {
    cwd: join(GAMES_DIR, game),
    stdio: 'inherit',
    shell: true,
  });
  port++;
}

log('All dev servers started.');
log('');
log('Wrapper hub:  http://localhost:5173');
games.forEach((g, i) => {
  log(`${g}: http://localhost:${5174 + i}`);
});