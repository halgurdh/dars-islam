import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

const GAME_BASE = '/games/karma/';

function mergeSharedAssets(gameDir: string) {
  let outDir = path.resolve(gameDir, 'dist');
  const sharedDir = path.resolve(gameDir, '../../shared');

  return {
    name: 'merge-shared-assets',
    configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, res: { setHeader: (name: string, value: string) => void; end: (body?: string | Buffer) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        if (!url.startsWith('/assets/') || url.startsWith('/assets/icons/')) {
          next();
          return;
        }

        const relPath = url.replace(/^\/assets\//, '');
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

export default defineConfig({
  base: GAME_BASE,
  envDir: path.resolve(__dirname, '../../'),
  publicDir: path.resolve(__dirname, 'public'),

  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared'),
      '@src':    path.resolve(__dirname, '../../src'),
    },
  },

  build: {
    target: 'es2020',
    outDir: './dist',
    assetsInlineLimit: 0,
  },

  server: {
    port: 5176,
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
    mergeGamePublicAssets(__dirname),
    mergeSharedAssets(__dirname),
  ],
});
