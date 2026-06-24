import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import fs from 'fs';

function mergeSharedAssets(gameDir: string) {
  let outDir = path.resolve(gameDir, 'dist');
  const sharedDir = path.resolve(gameDir, '../../shared');

  return {
    name: 'merge-shared-assets',
    configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, res: { setHeader: (name: string, value: string) => void; end: (body?: string | Buffer) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        const assetsIdx = url.indexOf('/assets/');
        if (assetsIdx === -1 || url.includes('/assets/icons/') || url.includes('/assets/music/')) {
          next();
          return;
        }

        const relPath = url.slice(assetsIdx + '/assets/'.length);
        const fullPath = path.join(sharedDir, relPath);
        if (!fs.existsSync(fullPath)) {
          next();
          return;
        }

        const ext = path.extname(fullPath).toLowerCase();
        const contentType =
          ext === '.png' ? 'image/png' :
          ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
          ext === '.webp' ? 'image/webp' :
          ext === '.mp3' ? 'audio/mpeg' :
          ext === '.json' ? 'application/json' :
          'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.end(fs.readFileSync(fullPath));
      });
    },
    configResolved(config: { build: { outDir: string } }) {
      outDir = path.resolve(gameDir, config.build.outDir);
    },
    closeBundle() {
      if (!fs.existsSync(sharedDir)) return;
      const skipExts = new Set(['.ts', '.js', '.css', '.md']);
      const destAssets = path.join(outDir, 'assets');
      for (const item of fs.readdirSync(sharedDir)) {
        const srcPath = path.join(sharedDir, item);
        if (fs.statSync(srcPath).isDirectory()) {
          fs.cpSync(srcPath, path.join(destAssets, item), { recursive: true, force: true });
        } else if (!skipExts.has(path.extname(item).toLowerCase())) {
          if (!fs.existsSync(destAssets)) fs.mkdirSync(destAssets, { recursive: true });
          fs.copyFileSync(srcPath, path.join(destAssets, item));
        }
      }
    },
  };
}

const GAME_BASE = '/games/board-rush/';

export default defineConfig(({ mode }) => {
  const isPWA = mode === 'pwa';

  return {
    base: GAME_BASE,
    envDir: path.resolve(__dirname, '../../'),

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
      mergeSharedAssets(__dirname),
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
