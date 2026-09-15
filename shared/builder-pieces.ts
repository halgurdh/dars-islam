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

  // Only explode an *other* item into its own word-pieces if it's itself
  // multi-word — a single-word other item (common: months/pillars mixed
  // with multi-word ones) contributes its whole word as one candidate,
  // not its individual letters. Without this, a word-building tray could
  // end up with a stray bare letter in it (caught in testing on
  // months-builder: "ل" leaking in from single-word "رَجَب").
  const wordPool = new Set<string>();
  for (const arabic of otherItemsArabic) {
    const candidates = pieceKindFor(arabic) === 'word' ? piecesFor(arabic) : [arabic.trim()];
    for (const word of candidates) {
      if (!correctSet.has(word)) wordPool.add(word);
    }
  }
  return sample([...wordPool], count);
}

// ── Round formats ────────────────────────────────────────────────────────
// 'build' is the original tap-pieces-into-blanks format (or, in
// 'toTranslation' mode, the existing type-the-meaning challenge — both
// scenes' own default). 'multipleChoice' and 'listening' are newer
// alternatives that reuse the same clue/direction rules but swap the
// interaction for picking one of a few whole-answer options instead of
// assembling one; 'listening' additionally hides the text clue so the
// audio is the only way to answer. Picked per item, not per round, so a
// single round mixes formats rather than committing to one throughout.
export type RoundFormat = 'build' | 'multipleChoice' | 'listening';

const ROUND_FORMATS: RoundFormat[] = ['build', 'multipleChoice', 'listening'];

// 'listening' hides the text clue entirely and relies on TTS audio being
// playable — callers must pass whether a voice is actually available
// (e.g. sfx.hasVoice(lang)) so a device with no installed Arabic voice
// never gets handed an unplayable, clueless round.
export function pickRoundFormat(canListen: boolean): RoundFormat {
  const pool = canListen ? ROUND_FORMATS : ROUND_FORMATS.filter((f) => f !== 'listening');
  return pool[Math.floor(Math.random() * pool.length)];
}

// Whole-answer options for a multiple-choice/listening round — distinct
// from pickDistractors, which builds tile-level decoys for the build
// format. Degrades gracefully for small datasets (e.g. the 5-item Pillars
// list) by returning fewer options rather than throwing or repeating.
export function pickAnswerOptions(correct: string, otherAnswers: string[], count = 4): string[] {
  const pool = [...new Set(otherAnswers)].filter((a) => a !== correct);
  const distractors = sample(pool, count - 1); // sample() already caps at pool.length itself
  return sample([correct, ...distractors], distractors.length + 1);
}
