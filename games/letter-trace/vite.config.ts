import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { mergeGamePublicAssets, mergeSharedAssets, serveOnnxWasm, injectBasePath } from '../../shared/game-vite-plugins';

const GAME_BASE = `${process.env.VITE_BASE_PATH ?? '/'}games/letter-trace/`;

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
      port: 5186,
      host: true,
      open: true,
    },

    plugins: [
      injectBasePath(),
      mergeGamePublicAssets(__dirname),
      mergeSharedAssets(__dirname),
      serveOnnxWasm(__dirname),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Letter Trace',
          short_name: 'LetterTrace',
          description: 'Handwriting practice for the Arabic and English alphabets',
          theme_color: '#0f1420',
          background_color: '#0f1420',
          display: 'standalone',
          orientation: 'portrait',
          scope: GAME_BASE,
          start_url: GAME_BASE,
          icons: [
            { src: `${GAME_BASE}assets/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
            { src: `${GAME_BASE}assets/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
            { src: `${GAME_BASE}assets/icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
