/**
 * Multi-app PWA build script.
 * Builds the wrapper hub and each game independently, then assembles
 * them into the final `dist/` directory deployable to a static host.
 *
 * Resulting structure:
 *   dist/
 *     index.html              (wrapper hub)
 *     style.css
 *     games/
 *       board-rush/
 *         index.html          (Board Rush PWA)
 *         assets/             (game-specific assets)
 *         manifest.json       (scoped to /games/board-rush/)
 *         sw.js               (scoped to /games/board-rush/)
 *         ...
 */

import { execSync, spawn } from 'child_process';
import { existsSync, mkdirSync, cpSync, rmSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = join(ROOT, 'dist');
const GAMES_DIR = join(ROOT, 'games');

const isPWA = process.argv.includes('--pwa');
const mode = isPWA ? 'pwa' : 'production';

function log(msg) {
  console.log(`[build] ${msg}`);
}

function run(cmd, cwd) {
  log(`Running: ${cmd} (in ${cwd})`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

// Async, non-blocking version of run() — lets N builds run concurrently
// instead of one at a time (each `vite build` is its own subprocess with
// real Node/Rollup startup cost, and there's nothing shared between one
// game's build and the next, so this parallelizes for free).
function runAsync(cmd, cwd) {
  return new Promise((resolvePromise, reject) => {
    const [bin, ...args] = cmd.split(' ');
    const child = spawn(bin, args, { cwd, stdio: 'inherit', shell: true });
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`"${cmd}" (in ${cwd}) exited with code ${code}`));
    });
    child.on('error', reject);
  });
}

// Runs `tasks` (functions returning promises) with at most `concurrency`
// in flight at once — a minimal worker pool, no extra dependency needed.
async function runPool(tasks, concurrency) {
  const queue = [...tasks];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const task = queue.shift();
      await task();
    }
  });
  await Promise.all(workers);
}

// 1. Clean previous build
log('Cleaning dist...');
if (existsSync(DIST)) {
  rmSync(DIST, { recursive: true, force: true });
}

// 2. Build the wrapper hub
log('Building wrapper hub...');
run(`npx vite build --mode ${mode}`, join(ROOT, 'wrapper'));

// Copy wrapper output into dist
const wrapperDist = join(ROOT, 'wrapper', 'dist');
if (existsSync(wrapperDist)) {
  cpSync(wrapperDist, DIST, { recursive: true });
  rmSync(wrapperDist, { recursive: true, force: true });
}

// 3. Build each game — in parallel (bounded by CPU count). These builds
// are fully independent (each is its own Vite project/subprocess), so
// running them one at a time was pure wasted wall-clock, especially in CI.
const games = readdirSync(GAMES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const CONCURRENCY = Math.max(2, os.cpus().length);
log(`Building ${games.length} games with concurrency ${CONCURRENCY}...`);

await runPool(games.map((game) => async () => {
  const gameDir = join(GAMES_DIR, game);
  log(`Building game: ${game}...`);
  await runAsync(`npx vite build --mode ${mode}`, gameDir);

  const gameDist = join(gameDir, isPWA ? 'dist-pwa' : 'dist');
  if (existsSync(gameDist)) {
    // Game builds with base path /games/<game-name>/,
    // so copy into dist/games/<game-name>/
    const targetDir = join(DIST, 'games', game);
    mkdirSync(targetDir, { recursive: true });
    cpSync(gameDist, targetDir, { recursive: true });
    rmSync(gameDist, { recursive: true, force: true });
  }
  log(`Finished game: ${game}`);
}), CONCURRENCY);

// 4. (formerly copied api/ PHP files + database/ SQL schema into dist/ —
// removed now that the app talks to Supabase directly from the client;
// nothing serves or needs those files in the deployed bundle anymore.
// They still live at api/ and database/ in the repo for reference.)

// 6. Copy shared assets from root public/ into dist if they exist
const rootPublic = join(ROOT, 'public');
if (existsSync(rootPublic)) {
  for (const entry of readdirSync(rootPublic)) {
    const src = join(rootPublic, entry);
    const dest = join(DIST, entry);
    if (!existsSync(dest)) {
      cpSync(src, dest, { recursive: true });
    }
  }
}

// 7. Copy wrapper assets explicitly
const wrapperAssetsSource = join(ROOT, 'wrapper', 'public');
if (existsSync(wrapperAssetsSource)) {
  for (const entry of readdirSync(wrapperAssetsSource)) {
    const src = join(wrapperAssetsSource, entry);
    const dest = join(DIST, entry);
    cpSync(src, dest, { recursive: true });
  }
}

log('Build complete! Dist output at:', DIST);
log('');
log('Structure:');
printTree(DIST, '');

function printTree(dir, prefix) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    console.log(`${prefix}${entry.isDirectory() ? '📁' : '📄'} ${entry.name}`);
    if (entry.isDirectory()) {
      printTree(join(dir, entry.name), prefix + '  ');
    }
  }
}