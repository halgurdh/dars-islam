// Generic "tap pieces into blanks to build the word/phrase" logic, shared by
// every Builder-style game (huruf/pillars/prophets/phrases/salah/months —
// not asma-match, which is memory-match). A data file only ever needs
// {id, arabic, transliteration, meaningEn, meaningNl} — the same shape as
// asma-match's names.ts — because the tappable pieces and their granularity
// are derived from `arabic` itself, never hand-authored.

const DIACRITIC = /[ً-ْٰ]/g;

export type PieceKind = 'letter' | 'word';

// A target with a space in it (e.g. "ربيع الأول") is built word-by-word —
// spelling a multi-word phrase letter-by-letter would mean a dozen-plus
// tiles on screen. A single-word target (almost everything else) is built
// letter-by-letter, since a single tile would make the "build" trivial.
export function pieceKindFor(arabic: string): PieceKind {
  return arabic.trim().includes(' ') ? 'word' : 'letter';
}

// The ordered, correct tap-pieces for a target. Word-kind pieces keep their
// own diacritics (whole diacritized words read fine as tiles). Letter-kind
// pieces are bare base letters — diacritics stay only in the original
// `arabic` string, shown on completion (see the scene's "reveal"), not on
// the tiles themselves; matching exact diacritic placement tile-by-tile
// would make an already-fiddly tap target fussier for no learning benefit.
export function piecesFor(arabic: string): string[] {
  if (pieceKindFor(arabic) === 'word') {
    return arabic.trim().split(/\s+/);
  }
  return Array.from(arabic.replace(DIACRITIC, ''));
}

// The 28 primary Arabic letters, used as the distractor pool for
// letter-kind items. Bare base forms — same alphabet piecesFor() would
// produce from any letter-kind target.
export const ARABIC_LETTERS = Array.from(
  'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'
);

function sample<T>(pool: T[], count: number): T[] {
  const copy = [...pool];
  const picked: T[] = [];
  while (picked.length < count && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(i, 1)[0]);
  }
  return picked;
}

// Distractor count scales with the item's own length, rather than a flat
// constant, so a 2-letter item (e.g. "با") isn't swamped by tiles and a
// long one still gets a meaningful number of wrong options.
function distractorCount(pieceCount: number): number {
  return Math.min(3, Math.max(1, Math.ceil(pieceCount / 2)));
}

// Wrong tiles to mix into the tray alongside the correct pieces.
// - letter-kind: random letters from ARABIC_LETTERS not already required.
// - word-kind: random words drawn from every *other* item's pieces in the
//   same dataset, filtered so nothing in the result duplicates a correct
//   piece or repeats itself (two identical tiles in one tray is confusing,
//   not challenging — flagged in review for small datasets like salah/months
//   where the word pool is thin).
export function pickDistractors(
  kind: PieceKind,
  correctPieces: string[],
  otherItemsArabic: string[],
  count = distractorCount(correctPieces.length)
): string[] {
  const correctSet = new Set(correctPieces);

  if (kind === 'letter') {
    const pool = ARABIC_LETTERS.filter((l) => !correctSet.has(l));
    return sample(pool, count);
  }

  const wordPool = new Set<string>();
  for (const arabic of otherItemsArabic) {
    for (const word of piecesFor(arabic)) {
      if (!correctSet.has(word)) wordPool.add(word);
    }
  }
  return sample([...wordPool], count);
}
