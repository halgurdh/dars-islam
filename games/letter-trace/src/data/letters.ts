export interface TraceLetter {
  id: number;
  glyph: string;
  label: string;
  // What to hand the TTS engine. For Arabic this is the letter's own full
  // name (e.g. 'بَاء' for ب) rather than the bare glyph — a lone consonant
  // with no vowel doesn't pronounce reliably on its own.
  speak: string;
}

// The 28 primary Arabic letters, isolated form.
export const ARABIC_LETTERS: TraceLetter[] = [
  { id: 1, glyph: 'ا', label: 'Alif', speak: 'أَلِف' },
  { id: 2, glyph: 'ب', label: 'Ba', speak: 'بَاء' },
  { id: 3, glyph: 'ت', label: 'Ta', speak: 'تَاء' },
  { id: 4, glyph: 'ث', label: 'Tha', speak: 'ثَاء' },
  { id: 5, glyph: 'ج', label: 'Jim', speak: 'جِيم' },
  { id: 6, glyph: 'ح', label: 'Ha', speak: 'حَاء' },
  { id: 7, glyph: 'خ', label: 'Kha', speak: 'خَاء' },
  { id: 8, glyph: 'د', label: 'Dal', speak: 'دَال' },
  { id: 9, glyph: 'ذ', label: 'Dhal', speak: 'ذَال' },
  { id: 10, glyph: 'ر', label: 'Ra', speak: 'رَاء' },
  { id: 11, glyph: 'ز', label: 'Zay', speak: 'زَاي' },
  { id: 12, glyph: 'س', label: 'Sin', speak: 'سِين' },
  { id: 13, glyph: 'ش', label: 'Shin', speak: 'شِين' },
  { id: 14, glyph: 'ص', label: 'Sad', speak: 'صَاد' },
  { id: 15, glyph: 'ض', label: 'Dad', speak: 'ضَاد' },
  { id: 16, glyph: 'ط', label: 'Ta (heavy)', speak: 'طَاء' },
  { id: 17, glyph: 'ظ', label: 'Za (heavy)', speak: 'ظَاء' },
  { id: 18, glyph: 'ع', label: "'Ayn", speak: 'عَيْن' },
  { id: 19, glyph: 'غ', label: 'Ghayn', speak: 'غَيْن' },
  { id: 20, glyph: 'ف', label: 'Fa', speak: 'فَاء' },
  { id: 21, glyph: 'ق', label: 'Qaf', speak: 'قَاف' },
  { id: 22, glyph: 'ك', label: 'Kaf', speak: 'كَاف' },
  { id: 23, glyph: 'ل', label: 'Lam', speak: 'لَام' },
  { id: 24, glyph: 'م', label: 'Mim', speak: 'مِيم' },
  { id: 25, glyph: 'ن', label: 'Nun', speak: 'نُون' },
  { id: 26, glyph: 'ه', label: 'Ha (light)', speak: 'هَاء' },
  { id: 27, glyph: 'و', label: 'Waw', speak: 'وَاو' },
  { id: 28, glyph: 'ي', label: 'Ya', speak: 'يَاء' },
];

// The 26 English letters, uppercase (the standard print form for early
// handwriting practice).
export const ENGLISH_LETTERS: TraceLetter[] = Array.from({ length: 26 }, (_, i) => {
  const letter = String.fromCharCode(65 + i);
  return { id: i + 1, glyph: letter, label: letter, speak: letter };
});
