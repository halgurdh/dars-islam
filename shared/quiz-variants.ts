// Reusable content-generation helpers for two quiz-kit-based modes that
// don't need their own scene — "Fill-in-the-Blank" (mask one letter of a
// transliteration, pick the missing letter) and "True/False" (pair an item
// with its own meaning or a wrong one). Both produce a plain QuizQuestion,
// so a game just wires these into quizMode() again under a different mode
// id; there's no new gameplay engine here, only content shaping.
import type { QuizQuestion } from './quiz-kit';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const LETTER_POOL = 'abcdefghijklmnopqrstuvwxyz';

/** Masks one alphabetic character in a transliteration (e.g. "Ar-Rahman" →
 *  prompt "Ar-Ra_man", correct "h") — script-agnostic, works on any
 *  romanized word regardless of which language's game is using it. Returns
 *  null only if the word has no alphabetic characters at all. */
export function blankOneLetter(word: string): { prompt: string; correctLetter: string } | null {
  const letterIndices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (/[a-zA-Z]/.test(word[i])) letterIndices.push(i);
  }
  if (letterIndices.length === 0) return null;
  const idx = letterIndices[randInt(0, letterIndices.length - 1)];
  const correctLetter = word[idx].toLowerCase();
  const prompt = word.slice(0, idx) + '_' + word.slice(idx + 1);
  return { prompt, correctLetter };
}

/** Builds 4 unique uppercase-letter choices including the correct one. */
export function buildLetterChoices(correctLetter: string): { choices: string[]; correctIndex: number } {
  const set = new Set<string>([correctLetter]);
  while (set.size < 4) set.add(LETTER_POOL[randInt(0, LETTER_POOL.length - 1)]);
  const arr = shuffle([...set]);
  return { choices: arr.map((c) => c.toUpperCase()), correctIndex: arr.indexOf(correctLetter) };
}

/** Builds a fill-in-the-blank QuizQuestion from any item with a
 *  transliteration field. `sub` (e.g. the item's Arabic script) is optional
 *  extra context shown under the blanked word. Retries on the rare item
 *  whose transliteration has no letters at all (e.g. pure punctuation).
 *  Letter-level blanking is the right granularity only for games that teach
 *  individual letters (huruf-builder) — everywhere else, prefer
 *  fillBlankWordQuestion below, which blanks a whole word instead. */
export function fillBlankQuestion<T>(
  items: T[],
  transliterationOf: (item: T) => string,
  subOf?: (item: T) => string
): QuizQuestion {
  for (let attempt = 0; attempt < 10; attempt++) {
    const item = items[randInt(0, items.length - 1)];
    const blanked = blankOneLetter(transliterationOf(item));
    if (!blanked) continue;
    const { choices, correctIndex } = buildLetterChoices(blanked.correctLetter);
    return { prompt: blanked.prompt, sub: subOf?.(item), choices, correctIndex };
  }
  // Every item's transliteration was unusable (shouldn't happen in practice) —
  // fall back to a single fixed choice set rather than throwing.
  return { prompt: '?', choices: ['A', 'B', 'C', 'D'], correctIndex: 0 };
}

/** Masks one whole word in a phrase (e.g. "The Most Compassionate" →
 *  prompt "The Most _____", correct "Compassionate") — for any multi-word
 *  text where blanking a single letter would be too fine-grained to be a
 *  meaningful guess. Only considers words with 4+ letters, so the blank is
 *  never a trivial connector like "a"/"of"/"is"/"the". Returns null if no word in
 *  the text qualifies (e.g. a single very short word). */
export function blankOneWord(text: string): { prompt: string; correctWord: string } | null {
  const words = text.split(/\s+/);
  const candidates = words
    .map((w, i) => ({ w, i }))
    .filter(({ w }) => w.replace(/[^a-zA-Z']/g, '').length >= 4);
  if (candidates.length === 0) return null;
  const { w, i } = candidates[randInt(0, candidates.length - 1)];
  const blankedWords = [...words];
  blankedWords[i] = '_____';
  return { prompt: blankedWords.join(' '), correctWord: w };
}

/** Builds 4 unique word choices (the correct word plus 3 distractors drawn
 *  from a pool of other real words) — keeping distractors same-domain
 *  rather than obviously synthetic. */
export function buildWordChoices(correctWord: string, pool: string[]): { choices: string[]; correctIndex: number } {
  const cleanPool = pool.filter((w) => w.toLowerCase() !== correctWord.toLowerCase());
  const set = new Set<string>([correctWord]);
  for (const w of shuffle(cleanPool)) {
    if (set.size >= 4) break;
    set.add(w);
  }
  let pad = 1;
  while (set.size < 4) set.add(`${correctWord}${pad++}`); // extremely rare fallback, tiny pools only
  const arr = shuffle([...set]);
  return { choices: arr, correctIndex: arr.indexOf(correctWord) };
}

/** Builds a fill-in-the-blank QuizQuestion by masking one WORD (not letter)
 *  from an item's text — e.g. its `meaning` field. Distractor words are
 *  drawn from across the whole item pool's own text, so choices stay
 *  plausible and same-domain instead of random unrelated words. This is the
 *  right granularity for anything except individual-letter practice. */
export function fillBlankWordQuestion<T>(
  items: T[],
  textOf: (item: T) => string,
  subOf?: (item: T) => string
): QuizQuestion {
  const allWords = items
    .flatMap((item) => textOf(item).split(/\s+/))
    .filter((w) => w.replace(/[^a-zA-Z']/g, '').length >= 4);
  for (let attempt = 0; attempt < 10; attempt++) {
    const item = items[randInt(0, items.length - 1)];
    const blanked = blankOneWord(textOf(item));
    if (!blanked) continue;
    const { choices, correctIndex } = buildWordChoices(blanked.correctWord, allWords);
    return { prompt: blanked.prompt, sub: subOf?.(item), choices, correctIndex };
  }
  return { prompt: '?', choices: ['A', 'B', 'C', 'D'], correctIndex: 0 };
}

/** Builds a true/false statement pairing an item with its own meaning (50%,
 *  true) or a different item's meaning (50%, false). `id` distinguishes
 *  items so the "wrong" pairing never accidentally reuses the right one. */
export function trueFalseStatement<T extends { id: number }>(
  items: T[],
  nameOf: (item: T) => string,
  meaningOf: (item: T) => string,
  template: (name: string, meaning: string) => string
): { statement: string; isTrue: boolean } {
  const item = items[randInt(0, items.length - 1)];
  const isTrue = Math.random() < 0.5;
  if (isTrue) {
    return { statement: template(nameOf(item), meaningOf(item)), isTrue: true };
  }
  const others = items.filter((i) => i.id !== item.id);
  const wrongItem = others[randInt(0, others.length - 1)];
  return { statement: template(nameOf(item), meaningOf(wrongItem)), isTrue: false };
}

/** Converts a {statement, isTrue} pair into a QuizQuestion with fixed
 *  True/False choices. */
export function toTrueFalseQuestion(
  tf: { statement: string; isTrue: boolean },
  trueLabel: string,
  falseLabel: string
): QuizQuestion {
  return {
    prompt: tf.statement,
    choices: [trueLabel, falseLabel],
    correctIndex: tf.isTrue ? 0 : 1,
  };
}
