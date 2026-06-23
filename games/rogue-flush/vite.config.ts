import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const GAME_BASE = '/games/rogue-flush/';

export default defineConfig(({ mode }) => {
  const isPWA = mode === 'pwa';

  return {
    base: GAME_BASE,
    envDir: path.resolve(__dirname, '../../'),
    // Reuse board-rush's card/dice/piece asset library
    publicDir: path.resolve(__dirname, '../board-rush/public'),

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
      port: 5175,
      host: true,
      open: true,
    },

    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Rogue Flush',
          short_name: 'RogueFlush',
          description: 'The rogue-like poker deckbuilder — beat blinds, collect jokers, go infinite',
          theme_color: '#1a0505',
          background_color: '#1a0505',
          display: 'standalone',
          orientation: 'portrait',
          scope: GAME_BASE,
          start_url: GAME_BASE,
          icons: [
            {
              src: '/games/rogue-flush/assets/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/games/rogue-flush/assets/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/games/rogue-flush/assets/icons/icon-512.png',
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
