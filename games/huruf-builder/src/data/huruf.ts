export interface BuilderItem {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningNl: string;
}

// The 28 primary letters of the Arabic alphabet. `arabic` is each letter's
// own full, diacritized name (e.g. ب → باء "Ba"), not the bare glyph — that
// gives real spelling pieces for the builder mechanic instead of a
// single-tile non-task. Order follows the traditional abjad sequence.
export const HURUF: BuilderItem[] = [
  { id: 1, arabic: 'أَلِف', transliteration: 'Alif', meaningEn: 'A long "a" sound', meaningNl: 'Een lange "a"-klank' },
  { id: 2, arabic: 'بَاء', transliteration: 'Ba', meaningEn: 'Sounds like B', meaningNl: 'Klinkt als B' },
  { id: 3, arabic: 'تَاء', transliteration: 'Ta', meaningEn: 'Sounds like T', meaningNl: 'Klinkt als T' },
  { id: 4, arabic: 'ثَاء', transliteration: 'Tha', meaningEn: 'Sounds like "th" in "think"', meaningNl: 'Klinkt als de Engelse "th" in "think"' },
  { id: 5, arabic: 'جِيم', transliteration: 'Jim', meaningEn: 'Sounds like J', meaningNl: 'Klinkt als J' },
  { id: 6, arabic: 'حَاء', transliteration: 'Ha', meaningEn: 'A breathy H, from deep in the throat', meaningNl: 'Een ademende H, diep uit de keel' },
  { id: 7, arabic: 'خَاء', transliteration: 'Kha', meaningEn: 'Like "ch" in the Scottish "loch"', meaningNl: 'Zoals de "ch" in het Schotse "loch"' },
  { id: 8, arabic: 'دَال', transliteration: 'Dal', meaningEn: 'Sounds like D', meaningNl: 'Klinkt als D' },
  { id: 9, arabic: 'ذَال', transliteration: 'Dhal', meaningEn: 'Sounds like "th" in "this"', meaningNl: 'Klinkt als de Engelse "th" in "this"' },
  { id: 10, arabic: 'رَاء', transliteration: 'Ra', meaningEn: 'A rolled R', meaningNl: 'Een rollende R' },
  { id: 11, arabic: 'زَاي', transliteration: 'Zay', meaningEn: 'Sounds like Z', meaningNl: 'Klinkt als Z' },
  { id: 12, arabic: 'سِين', transliteration: 'Sin', meaningEn: 'Sounds like S', meaningNl: 'Klinkt als S' },
  { id: 13, arabic: 'شِين', transliteration: 'Shin', meaningEn: 'Sounds like SH', meaningNl: 'Klinkt als SH' },
  { id: 14, arabic: 'صَاد', transliteration: 'Sad', meaningEn: 'A heavy, emphatic S', meaningNl: 'Een zware, nadrukkelijke S' },
  { id: 15, arabic: 'ضَاد', transliteration: 'Dad', meaningEn: 'A heavy, emphatic D', meaningNl: 'Een zware, nadrukkelijke D' },
  { id: 16, arabic: 'طَاء', transliteration: 'Ta (heavy)', meaningEn: 'A heavy, emphatic T', meaningNl: 'Een zware, nadrukkelijke T' },
  { id: 17, arabic: 'ظَاء', transliteration: 'Za (heavy)', meaningEn: 'A heavy, emphatic "th"', meaningNl: 'Een zware, nadrukkelijke "th"' },
  { id: 18, arabic: 'عَيْن', transliteration: "'Ayn", meaningEn: 'A throat sound with no English equivalent', meaningNl: 'Een keelklank zonder Nederlands equivalent' },
  { id: 19, arabic: 'غَيْن', transliteration: 'Ghayn', meaningEn: 'Like a French/German R', meaningNl: 'Zoals een Franse of Duitse R' },
  { id: 20, arabic: 'فَاء', transliteration: 'Fa', meaningEn: 'Sounds like F', meaningNl: 'Klinkt als F' },
  { id: 21, arabic: 'قَاف', transliteration: 'Qaf', meaningEn: 'A deep K, from the back of the throat', meaningNl: 'Een diepe K, achter in de keel' },
  { id: 22, arabic: 'كَاف', transliteration: 'Kaf', meaningEn: 'Sounds like K', meaningNl: 'Klinkt als K' },
  { id: 23, arabic: 'لَام', transliteration: 'Lam', meaningEn: 'Sounds like L', meaningNl: 'Klinkt als L' },
  { id: 24, arabic: 'مِيم', transliteration: 'Mim', meaningEn: 'Sounds like M', meaningNl: 'Klinkt als M' },
  { id: 25, arabic: 'نُون', transliteration: 'Nun', meaningEn: 'Sounds like N', meaningNl: 'Klinkt als N' },
  { id: 26, arabic: 'هَاء', transliteration: 'Ha (light)', meaningEn: 'A light, soft H', meaningNl: 'Een lichte, zachte H' },
  { id: 27, arabic: 'وَاو', transliteration: 'Waw', meaningEn: 'Sounds like W, or a long "u"', meaningNl: 'Klinkt als W, of een lange "oe"' },
  { id: 28, arabic: 'يَاء', transliteration: 'Ya', meaningEn: 'Sounds like Y, or a long "i"', meaningNl: 'Klinkt als J, of een lange "ie"' },
];
