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
  'letter-trace': { bgLight: '#1c2440', bgDark: '#0a0e1a', accent: '#7c93e0', accentLight: '#d6def7' },
  'number-basics': { bgLight: '#163d20', bgDark: '#08170e', accent: '#4fd97a', accentLight: '#c2f7d9' },
  'times-table-dojo': { bgLight: '#3d3016', bgDark: '#171208', accent: '#e0b34f', accentLight: '#f7e3c2' },
  'math-tricks-lab': { bgLight: '#3d163d', bgDark: '#170817', accent: '#d94fd9', accentLight: '#f7c2f7' },
  'mental-math-sprint': { bgLight: '#163d3a', bgDark: '#081715', accent: '#4fd9d0', accentLight: '#c2f7f2' },
  'math-mastery': { bgLight: '#3d1f16', bgDark: '#170b08', accent: '#e0574f', accentLight: '#f7c2ba' },
  'shapes-colors': { bgLight: '#163540', bgDark: '#081619', accent: '#4fb8e0', accentLight: '#c2ecf7' },
  'counting-fun': { bgLight: '#3d2a16', bgDark: '#170f08', accent: '#e0954f', accentLight: '#f7dcc2' },
  'pattern-play': { bgLight: '#3d1628', bgDark: '#170a11', accent: '#e04f95', accentLight: '#f7c2da' },
  'wonder-why': { bgLight: '#1c3d16', bgDark: '#0b1708', accent: '#6bcf4f', accentLight: '#d6f7c2' },
  'kind-hearts': { bgLight: '#3d1c26', bgDark: '#170b0f', accent: '#e06b8a', accentLight: '#f7d0dc' },
  'duas-builder': { bgLight: '#163538', bgDark: '#081416', accent: '#4fc9d9', accentLight: '#c2eff7' },
  'juz-amma-match': { bgLight: '#3d3816', bgDark: '#141208', accent: '#d9c94f', accentLight: '#f7f0c2' },
  'memory-match': { bgLight: '#3d2416', bgDark: '#170d08', accent: '#e0764f', accentLight: '#f7d4c2' },
  'geometry-essentials': { bgLight: '#16324a', bgDark: '#08131a', accent: '#4f9de0', accentLight: '#c2e0f7' },
  'world-history': { bgLight: '#3d3220', bgDark: '#14100a', accent: '#c9954f', accentLight: '#f0ddc2' },
  'stats-probability': { bgLight: '#163d38', bgDark: '#081716', accent: '#4fe0c9', accentLight: '#c2f7ef' },
  'arabic-grammar': { bgLight: '#32163d', bgDark: '#120817', accent: '#9d4fe0', accentLight: '#e0c2f7' },
  'money-zakat': { bgLight: '#2a3d16', bgDark: '#0e1708', accent: '#7ae04f', accentLight: '#dcf7c2' },
  'geography': { bgLight: '#163540', bgDark: '#081a1f', accent: '#4fb8e0', accentLight: '#c2ecf7' },
  'language-arts': { bgLight: '#2e1638', bgDark: '#120817', accent: '#c94fe0', accentLight: '#f0c2f7' },
  'civics-community': { bgLight: '#1a3524', bgDark: '#0a170f', accent: '#4fd97a', accentLight: '#c2f7d9' },
  'health-body': { bgLight: '#3d1f1a', bgDark: '#17090a', accent: '#e0704f', accentLight: '#f7d4c2' },
  'earth-space-science': { bgLight: '#161f3d', bgDark: '#080a1f', accent: '#7c93e0', accentLight: '#d6def7' },
  'algebra-basics': { bgLight: '#35331a', bgDark: '#1a1a0f', accent: '#d9c94f', accentLight: '#f7f0c2' },
  'number-theory-logic': { bgLight: '#1a3038', bgDark: '#0a1216', accent: '#4fc9e0', accentLight: '#c2eff7' },
  'seerah-timeline': { bgLight: '#3d2e16', bgDark: '#1a1006', accent: '#e0a94f', accentLight: '#f7e3c2' },
  'fiqh-essentials': { bgLight: '#1a3535', bgDark: '#0a1616', accent: '#4fd9c4', accentLight: '#c2f7ef' },
  'world-cultures': { bgLight: '#351a35', bgDark: '#160a16', accent: '#e04fd0', accentLight: '#f7c2ef' },
  'advanced-trigonometry': { bgLight: '#352010', bgDark: '#1a0f0a', accent: '#e0854f', accentLight: '#f7d9c2' },
  'precalc-functions': { bgLight: '#10352c', bgDark: '#0a1a17', accent: '#4fe0b8', accentLight: '#c2f7e9' },
  'digital-literacy': { bgLight: '#1a1a35', bgDark: '#0f0f1a', accent: '#6b7ae0', accentLight: '#d0d6f7' },
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
