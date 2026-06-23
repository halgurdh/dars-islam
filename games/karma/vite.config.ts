import { defineConfig } from 'vite';
import path from 'path';

const GAME_BASE = '/games/karma/';

export default defineConfig({
  base: GAME_BASE,
  envDir: path.resolve(__dirname, '../../'),
  publicDir: path.resolve(__dirname, '../board-rush/public'),

  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared'),
      '@src':    path.resolve(__dirname, '../../src'),
    },
  },

  build: {
    target: 'es2020',
    outDir: './dist',
    assetsInlineLimit: 0,
  },

  server: {
    port: 5176,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
