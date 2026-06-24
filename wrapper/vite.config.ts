import { defineConfig } from 'vite';
import path from 'path';

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
    port: 5173,
    host: true,
    open: true,
    proxy: {
      // PHP API — run a local PHP server: `php -S localhost:8000 -t .` from repo root
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Forward requests under /games/board-rush to the board-rush dev server
      '/games/board-rush': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        secure: false,
      },
      '/games/karma': {
        target: 'http://localhost:5176',
        changeOrigin: true,
        secure: false,
      },
      '/games/rogue-flush': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        secure: false,
      },
      '/games/net-strike': {
        target: 'http://localhost:5177',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
