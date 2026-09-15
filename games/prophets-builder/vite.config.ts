import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { mergeGamePublicAssets, mergeSharedAssets, serveOnnxWasm } from '../../shared/game-vite-plugins';

const GAME_BASE = '/games/prophets-builder/';

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
      port: 5182,
      host: true,
      open: true,
    },

    plugins: [
      mergeGamePublicAssets(__dirname),
      mergeSharedAssets(__dirname),
      serveOnnxWasm(__dirname),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Prophets Builder',
          short_name: 'ProphetsBuilder',
          description: 'Learn the names of the Prophets by spelling each one',
          theme_color: '#0e0817',
          background_color: '#0e0817',
          display: 'standalone',
          orientation: 'portrait',
          scope: GAME_BASE,
          start_url: GAME_BASE,
          icons: [
            { src: '/games/prophets-builder/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/games/prophets-builder/assets/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/games/prophets-builder/assets/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globIgnores: ['**/*.wasm', '**/*.mjs', '**/ort*.js', '**/piper*.js', '**/voices_static*.js'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          navigateFallback: GAME_BASE + 'index.html',
        },
      }),
    ],
  };
});
