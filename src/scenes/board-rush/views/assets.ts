import { fullDeck, cardAsset } from '@src/game/data/cards';
import { CLASS_DEFS, HeroClass } from '@src/game/data/classes';

/**
 * Builds the list of image keys → file paths to preload.
 * Keys mirror filenames (without extension) for easy lookup.
 */
export function assetManifest(): { key: string; path: string }[] {
  const list: { key: string; path: string }[] = [];

  // Card faces (52)
  for (const card of fullDeck()) {
    const file = cardAsset(card);
    list.push({ key: file.replace('.png', ''), path: `assets/cards/${file}` });
  }

  // All card back variants — blue (1-5), green (1-5), red (1-5)
  for (const color of ['blue', 'green', 'red']) {
    for (let n = 1; n <= 5; n++) {
      const key = `cardBack_${color}${n}`;
      list.push({ key, path: `assets/cards/${key}.png` });
    }
  }

  // Dice (white + red, faces 1-6)
  for (let f = 1; f <= 6; f++) {
    list.push({ key: `dieWhite${f}`, path: `assets/dice/dieWhite${f}.png` });
    list.push({ key: `dieRed${f}`, path: `assets/dice/dieRed${f}.png` });
  }

  // Class pieces
  for (const cls of Object.values(HeroClass)) {
    const def = CLASS_DEFS[cls];
    list.push({ key: def.pieceSprite, path: `assets/pieces/${def.pieceColor}/${def.pieceSprite}.png` });
  }

  // Background
  list.push({ key: 'background', path: 'assets/Background.jpg' });

  return list;
}
