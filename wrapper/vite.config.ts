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
      // Forward requests under /games/board-rush to the board-rush dev server
      '/games/board-rush': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});