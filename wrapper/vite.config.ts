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
  },
});