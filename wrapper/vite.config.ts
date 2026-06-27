import { defineConfig } from 'vite';
import path from 'path';
import { getGamePortMap, WRAPPER_PORT } from '../scripts/dev-ports.mjs';

const gamePorts = getGamePortMap();
const gameProxyEntries = Object.fromEntries(
  Object.entries(gamePorts).map(([game, port]) => [
    `/games/${game}`,
    {
      target: `http://localhost:${port}`,
      changeOrigin: true,
      secure: false,
    },
  ]),
);

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },

  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0,
  },

  server: {
    port: WRAPPER_PORT,
    host: true,
    open: true,
    proxy: {
      // PHP API — run a local PHP server: `php -S localhost:8000 -t .` from repo root
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      ...gameProxyEntries,
    },
  },
});
