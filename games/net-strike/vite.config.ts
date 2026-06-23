import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import fs from 'fs';

const GAME_BASE = '/games/net-strike/';

function mergeBoardRushSharedAssets(gameDir: string) {
  let outDir = path.resolve(gameDir, 'dist');
  const sharedAssetsDir = path.resolve(gameDir, '../board-rush/public/assets');

  return {
    name: 'merge-board-rush-shared-assets',
    configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, res: { setHeader: (name: string, value: string) => void; end: (body?: string | Buffer) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/assets/')) {
          next();
          return;
        }

        const relPath = url.replace(/^\/assets\//, '');
        const fullPath = path.join(sharedAssetsDir, relPath);
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
      if (!fs.existsSync(sharedAssetsDir)) return;
      fs.cpSync(sharedAssetsDir, path.join(outDir, 'assets'), { recursive: true, force: true });
    },
  };
}

function mergeGamePublicAssets(gameDir: string) {
  let outDir = path.resolve(gameDir, 'dist');
  const localAssetsDir = path.resolve(gameDir, 'public/assets');

  return {
    name: 'merge-game-public-assets',
    configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, res: { setHeader: (name: string, value: string) => void; end: (body?: string | Buffer) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/assets/icons/')) {
          next();
          return;
        }

        const relPath = url.replace(/^\/assets\//, '');
        const filePath = path.join(localAssetsDir, relPath);
        if (!fs.existsSync(filePath)) {
          next();
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType =
          ext === '.png' ? 'image/png' :
          ext === '.mp3' ? 'audio/mpeg' :
          'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.end(fs.readFileSync(filePath));
      });
    },
    configResolved(config: { build: { outDir: string } }) {
      outDir = path.resolve(gameDir, config.build.outDir);
    },
    closeBundle() {
      if (!fs.existsSync(localAssetsDir)) return;
      fs.cpSync(localAssetsDir, path.join(outDir, 'assets'), { recursive: true, force: true });
    },
  };
}

export default defineConfig(({ mode }) => {
  const isPWA = mode === 'pwa';

  return {
    base: GAME_BASE,
    envDir: path.resolve(__dirname, '../../'),
    publicDir: path.resolve(__dirname, 'public'),
    resolve: {
      alias: {
        '@src': path.resolve(__dirname, '../../src'),
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
      port: 5177,
      host: true,
      open: true,
    },
    plugins: [
      mergeGamePublicAssets(__dirname),
      mergeBoardRushSharedAssets(__dirname),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'Net Strike',
          short_name: 'NetStrike',
          description: 'A polished cyber-grid combat prototype inspired by deck-and-battle arena classics.',
          theme_color: '#07111f',
          background_color: '#07111f',
          display: 'standalone',
          orientation: 'landscape',
          scope: GAME_BASE,
          start_url: GAME_BASE,
          icons: [
            {
              src: '/games/net-strike/assets/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/games/net-strike/assets/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/games/net-strike/assets/icons/icon-512.png',
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
