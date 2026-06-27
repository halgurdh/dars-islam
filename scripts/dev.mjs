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
import net from 'net';
import { WRAPPER_PORT, getGamePortMap } from './dev-ports.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const GAMES_DIR = join(ROOT, 'games');
const VITE_BIN = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
const GAME_PORTS = getGamePortMap();
const processes = [];

function log(msg) {
  console.log(`[dev] ${msg}`);
}

function startServer(name, cwd, port) {
  log(`Starting ${name} on http://localhost:${port} ...`);
  const proc = spawn(process.execPath, [VITE_BIN, '--host', '127.0.0.1', '--port', port.toString()], {
    cwd,
    stdio: 'inherit',
    shell: false,
  });
  proc.on('error', (err) => {
    console.error(`[dev] Error starting ${name}:`, err.message);
  });
  proc.on('exit', (code, signal) => {
    log(`${name} exited${signal ? ` with signal ${signal}` : ` with code ${code ?? 0}`}`);
  });
  processes.push(proc);
  return proc;
}

function ensurePortAvailable(port) {
  return new Promise((resolvePort, rejectPort) => {
    const server = net.createServer();
    server.unref();
    server.on('error', (error) => {
      if (error && error.code === 'EADDRINUSE') {
        rejectPort(new Error(`Port ${port} is already in use.`));
        return;
      }
      rejectPort(error);
    });
    server.listen(port, '127.0.0.1', () => {
      server.close((closeError) => {
        if (closeError) {
          rejectPort(closeError);
          return;
        }
        resolvePort();
      });
    });
  });
}

async function verifyPorts() {
  const expectedPorts = [WRAPPER_PORT, ...Object.values(GAME_PORTS)];
  const conflicts = [];

  for (const port of expectedPorts) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await ensurePortAvailable(port);
    } catch (error) {
      conflicts.push({ port, message: error instanceof Error ? error.message : String(error) });
    }
  }

  if (conflicts.length === 0) return;

  console.error('[dev] Port check failed. Root `npm run dev` expects these ports:');
  console.error(`[dev] wrapper=${WRAPPER_PORT}`);
  Object.entries(GAME_PORTS).forEach(([game, port]) => {
    console.error(`[dev] ${game}=${port}`);
  });
  for (const conflict of conflicts) {
    console.error(`[dev] ${conflict.message}`);
  }
  console.error('[dev] Stop stale Vite servers on those ports, then run `npm run dev` again.');
  process.exit(1);
}

async function main() {
  await verifyPorts();

  // Start wrapper hub on port 5173
  startServer('wrapper hub', join(ROOT, 'wrapper'), WRAPPER_PORT);

  // Start each game on its own port (concurrently)
  const games = Object.keys(GAME_PORTS);
  for (const game of games) {
    startServer(game, join(GAMES_DIR, game), GAME_PORTS[game]);
  }

  log('All dev servers started (running concurrently).');
  log('');
  log(`Wrapper hub:  http://localhost:${WRAPPER_PORT}`);
  games.forEach((g) => {
    log(`${g}: http://localhost:${GAME_PORTS[g]}`);
  });
  log('');
  log('Press Ctrl+C to stop all servers.');
}

function shutdown(signal) {
  log(`Shutting down dev servers (${signal})...`);
  for (const proc of processes) {
    if (!proc.killed) {
      proc.kill('SIGTERM');
    }
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.stdin.resume();

main().catch((error) => {
  console.error('[dev] Failed to start dev servers:', error);
  process.exit(1);
});
