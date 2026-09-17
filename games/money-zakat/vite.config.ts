import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { mergeGamePublicAssets, mergeSharedAssets } from '../../shared/game-vite-plugins';

const GAME_BASE = '/games/money-zakat/';

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
      port: 5204,
      host: true,
      open: true,
    },

    plugins: [
      mergeGamePublicAssets(__dirname),
      mergeSharedAssets(__dirname),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Money & Zakat Math',
          short_name: 'MoneyZakatMath',
          description: 'Percentages, budgeting and calculating zakat',
          theme_color: '#0e1708',
          background_color: '#0e1708',
          display: 'standalone',
          orientation: 'portrait',
          scope: GAME_BASE,
          start_url: GAME_BASE,
          icons: [
            { src: '/games/money-zakat/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/games/money-zakat/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/games/money-zakat/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
