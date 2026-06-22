import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works both on a web server and from
  // Electron's file:// protocol (Windows .exe).
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    port: 5173,
    open: true,
  },
});
