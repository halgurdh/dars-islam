import { fullDeck, cardAsset } from '../game/data/cards';
import { CLASS_DEFS, HeroClass } from '../game/data/classes';

/**
 * Builds the list of image keys → file paths to preload.
 * Keys mirror filenames (without extension) for easy lookup.
 */
export function assetManifest(): { key: string; path: string }[] {
  const list: { key: string; path: string }[] = [];

  // Card faces (52) + a back
  for (const card of fullDeck()) {
    const file = cardAsset(card);
    list.push({ key: file.replace('.png', ''), path: `assets/cards/${file}` });
  }
  list.push({ key: 'cardBack', path: 'assets/cards/cardBack_blue2.png' });

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
