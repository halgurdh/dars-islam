import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import fs from 'fs';

const GAME_BASE = '/games/asma-match/';

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

function mergeGamePublicAssets(gameDir: string) {
  let outDir = path.resolve(gameDir, 'dist');
  const localAssetsDir = path.resolve(gameDir, 'public/assets');

  return {
    name: 'merge-game-public-assets',
    configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, res: { setHeader: (name: string, value: string) => void; end: (body?: string | Buffer) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        const iconsIdx = url.indexOf('/assets/icons/');
        if (iconsIdx === -1) {
          next();
          return;
        }

        const relPath = url.slice(iconsIdx + '/assets/'.length);
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

// piper-tts-web's default onnxruntime-web CDN (cdnjs) is missing the .mjs
// loader it needs — cdnjs only mirrors a subset of the npm package, and
// fetching a nonexistent file 404s, breaking pronunciation entirely on
// every device. Serve it ourselves instead, straight from the copy already
// installed as our own dependency — free (no external host to depend on),
// no separate download/build step, always version-matched.
function serveOnnxWasm(gameDir: string) {
  let outDir = path.resolve(gameDir, 'dist');
  const files = ['ort-wasm-simd-threaded.wasm', 'ort-wasm-simd-threaded.mjs'];
  const srcDir = path.resolve(gameDir, '../../node_modules/onnxruntime-web/dist');

  return {
    name: 'serve-onnx-wasm',
    configureServer(server: { middlewares: { use: (handler: (req: { url?: string }, res: { setHeader: (name: string, value: string) => void; end: (body?: string | Buffer) => void }, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? '';
        const idx = url.indexOf('/ort/');
        const name = idx === -1 ? '' : url.slice(idx + '/ort/'.length);
        if (!files.includes(name)) {
          next();
          return;
        }
        res.setHeader('Content-Type', name.endsWith('.wasm') ? 'application/wasm' : 'text/javascript');
        res.end(fs.readFileSync(path.join(srcDir, name)));
      });
    },
    configResolved(config: { build: { outDir: string } }) {
      outDir = path.resolve(gameDir, config.build.outDir);
    },
    closeBundle() {
      const destDir = path.join(outDir, 'ort');
      fs.mkdirSync(destDir, { recursive: true });
      for (const file of files) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
      }
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
      port: 5179,
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
          name: 'Asma Match',
          short_name: 'AsmaMatch',
          description: 'A calm memory-match game for learning the 99 Names of Allah',
          theme_color: '#0d2b26',
          background_color: '#0d2b26',
          display: 'standalone',
          orientation: 'portrait',
          scope: GAME_BASE,
          start_url: GAME_BASE,
          icons: [
            {
              src: '/games/asma-match/assets/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/games/asma-match/assets/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/games/asma-match/assets/icons/icon-512.png',
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
