// One-off tool, not part of the build: rasterizes shared/icon.svg (the same
// abstract 8-point-star motif Asma Match already ships) into each new
// game's PWA icon sizes, with that game's own color pair substituted in.
// Run manually when adding a game: node scripts/generate-game-icons.mjs
//
// SVG stays the source of truth (favicon + wrapper hub cards reference it
// directly) — PNG is only generated because iOS home-screen install
// (apple-touch-icon) and some PWA manifest parsers don't accept SVG.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TEMPLATE = readFileSync(join(ROOT, 'shared/icon.svg'), 'utf8');

// One color pair per game — bg gradient + star fill/outline. Each new game
// gets its own hue so the hub grid stays visually distinct while keeping
// the exact same shape as Asma Match (zero new imagery decisions, zero new
// ad-review risk).
const GAMES = {
  'huruf-builder': { bgLight: '#16223d', bgDark: '#080c17', accent: '#5fb3d9', accentLight: '#cdeaf7' },
  'pillars-builder': { bgLight: '#3d2a16', bgDark: '#170e08', accent: '#e08a4f', accentLight: '#f7d9c2' },
  'prophets-builder': { bgLight: '#2a163d', bgDark: '#0e0817', accent: '#a87ce0', accentLight: '#e6d6f7' },
  'phrases-builder': { bgLight: '#163d2e', bgDark: '#081712', accent: '#4fd9a0', accentLight: '#cdf7e6' },
  'salah-builder': { bgLight: '#3d1620', bgDark: '#17080b', accent: '#e04f6a', accentLight: '#f7c2cd' },
  'months-builder': { bgLight: '#16333d', bgDark: '#081417', accent: '#4fa8d9', accentLight: '#cde8f7' },
};

function renderSvg(colors) {
  let svg = TEMPLATE;
  for (const [key, value] of Object.entries(colors)) {
    svg = svg.replaceAll(`{{${key}}}`, value);
  }
  return svg;
}

async function main() {
  const only = process.argv[2];
  const entries = only ? [[only, GAMES[only]]] : Object.entries(GAMES);

  for (const [slug, colors] of entries) {
    if (!colors) {
      console.error(`Unknown game slug: ${slug}`);
      process.exitCode = 1;
      continue;
    }
    const iconsDir = join(ROOT, 'games', slug, 'public', 'assets', 'icons');
    mkdirSync(iconsDir, { recursive: true });

    const svg = renderSvg(colors);
    writeFileSync(join(iconsDir, 'icon.svg'), svg);

    const buffer = Buffer.from(svg);
    await sharp(buffer).resize(192, 192).png().toFile(join(iconsDir, 'icon-192.png'));
    await sharp(buffer).resize(512, 512).png().toFile(join(iconsDir, 'icon-512.png'));

    console.log(`[icons] ${slug}: icon.svg, icon-192.png, icon-512.png`);
  }
}

main();
