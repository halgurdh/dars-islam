import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const PWA_SUBPATH = '/board-rush/';

export default defineConfig(({ mode }) => {
  const isPWA = mode === 'pwa';

  return {
    // Electron needs './' (file:// protocol); PWA web build needs the subpath
    base: isPWA ? PWA_SUBPATH : './',

    build: {
      target: 'es2020',
      outDir: isPWA ? 'dist-pwa' : 'dist',
      assetsInlineLimit: 0,
    },

    server: {
      port: 5173,
      host: true,  // listen on all interfaces so other devices on the network can connect
      open: true,
    },

    plugins: isPWA
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['assets/**/*'],
            manifest: {
              name: 'Board Rush',
              short_name: 'BoardRush',
              description: 'A fantasy board game — Monopoly meets Yu-Gi-Oh',
              theme_color: '#0c0f0a',
              background_color: '#0c0f0a',
              display: 'standalone',
              orientation: 'landscape',
              scope: PWA_SUBPATH,
              start_url: PWA_SUBPATH,
              icons: [
                {
                  src: 'assets/icons/icon-192.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                  src: 'assets/icons/icon-512.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
                {
                  src: 'assets/icons/icon-512.png',
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'maskable',
                },
              ],
            },
            workbox: {
              // Cache all game assets for offline play
              globPatterns: ['**/*.{js,css,html,png,jpg,mp3,webp}'],
              maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB (covers audio)
              navigateFallback: PWA_SUBPATH + 'index.html',
            },
          }),
        ]
      : [],
  };
});
