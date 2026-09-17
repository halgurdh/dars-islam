import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { mergeGamePublicAssets, mergeSharedAssets } from '../../shared/game-vite-plugins';

const GAME_BASE = '/games/world-cultures/';

export default defineConfig(({ mode }) => {
  const isPWA = mode === 'pwa';

  return {
    base: GAME_BASE,
    envDir: path.resolve(__dirname, '../../'),
    publicDir: path.resolve(__dirname, 'public'),

    resolve: {
      alias: {
        '@src': path.resolve(__dirname, '../../src'),
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
      port: 5214,
      host: true,
      open: true,
    },

    plugins: [
      mergeGamePublicAssets(__dirname),
      mergeSharedAssets(__dirname),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: "World Cultures",
          short_name: "WorldCultures",
          description: "Flags, languages and traditions from around the world.",
          theme_color: '#1a0f1a',
          background_color: '#1a0f1a',
          display: 'standalone',
          orientation: 'portrait',
          scope: GAME_BASE,
          start_url: GAME_BASE,
          icons: [
            { src: '/games/world-cultures/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/games/world-cultures/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/games/world-cultures/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          navigateFallback: GAME_BASE + 'index.html',
        },
      }),
    ],
  };
});
