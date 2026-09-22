import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { mergeGamePublicAssets, mergeSharedAssets, serveOnnxWasm, injectBasePath } from '../../shared/game-vite-plugins';

const GAME_BASE = `${process.env.VITE_BASE_PATH ?? '/'}games/juz-amma-match/`;

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
      port: 5198,
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
          name: 'Quran Juz Amma Match',
          short_name: 'JuzAmmaMatch',
          description: 'A calm memory-match game for learning short surahs from Juz’ Amma',
          theme_color: '#141208',
          background_color: '#141208',
          display: 'standalone',
          orientation: 'portrait',
          scope: GAME_BASE,
          start_url: GAME_BASE,
          icons: [
            {
              src: `${GAME_BASE}assets/icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: `${GAME_BASE}assets/icons/icon-192.png`,
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: `${GAME_BASE}assets/icons/icon-512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // The optional Piper TTS fallback (onnxruntime-web's .wasm runtime,
          // ~14MB) must NOT be eagerly precached — it's only fetched at
          // runtime, lazily, the first time a visitor actually taps "Hear
          // it" on a language their device has no built-in voice for.
          // Precaching it would force every visitor to download it on
          // first load whether they ever use pronunciation or not.
          globIgnores: ['**/*.wasm', '**/*.mjs', '**/ort*.js', '**/piper*.js', '**/voices_static*.js'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          navigateFallback: GAME_BASE + 'index.html',
        },
      }),
    ],
  };
});
