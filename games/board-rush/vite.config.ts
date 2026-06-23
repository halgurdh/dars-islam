import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const GAME_BASE = '/games/board-rush/';

export default defineConfig(({ mode }) => {
  const isPWA = mode === 'pwa';

  return {
    base: GAME_BASE,

    resolve: {
      alias: {
        '@src':    path.resolve(__dirname, '../../src'),
        '@scenes': path.resolve(__dirname, '../../src/scenes'),
        '@shared': path.resolve(__dirname, '../../shared'),
      },
    },

    build: {
      target: 'es2020',
      outDir: isPWA ? './dist-pwa' : './dist',
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 2000,
    },

    server: {
      port: 5174,
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

    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Board Rush',
          short_name: 'BoardRush',
          description: 'A fantasy board game — Monopoly meets Yu-Gi-Oh',
          theme_color: '#0c0f0a',
          background_color: '#0c0f0a',
          display: 'standalone',
          orientation: 'landscape',
          scope: GAME_BASE,
          start_url: GAME_BASE,
          icons: [
            {
              src: '/games/board-rush/assets/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/games/board-rush/assets/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/games/board-rush/assets/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          navigateFallback: GAME_BASE + 'index.html',
        },
      }),
    ],
  };
});
