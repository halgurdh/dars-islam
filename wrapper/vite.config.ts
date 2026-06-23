import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',

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