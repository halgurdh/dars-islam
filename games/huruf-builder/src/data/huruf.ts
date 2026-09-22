export interface BuilderItem {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningAr: string;
  meaningNl: string;
  meaningDe: string;
  meaningEs: string;
  meaningFr: string;
}

// The 28 primary letters of the Arabic alphabet. `arabic` is each letter's
// own full, diacritized name (e.g. ب → باء "Ba"), not the bare glyph — that
// gives real spelling pieces for the builder mechanic instead of a
// single-tile non-task. Order follows the modern alphabetical (hijai)
// sequence grouped by letter shape (alif-ba-ta-tha, jim-ha-kha, ...) —
// this is the standard dictionary/school order, not the older abjad
// numeral sequence (alif-ba-jim-dal-ha-waw-zay...).
//
// The pronunciation clues reference whichever language actually has the
// closest native sound (e.g. Spanish "z"/soft "d" for the English "th"
// sounds, German "ch" for Kha, French "ch" for Shin) rather than
// translating the English clue literally — a literal translation of "like
// the th in think" means nothing in a language with no "th" sound.
export const HURUF: BuilderItem[] = [
  { id: 1, arabic: 'أَلِف', transliteration: 'Alif', meaningEn: 'A long "a" sound', meaningAr: 'صوت الألف الممدود', meaningNl: 'Een lange "a"-klank', meaningDe: 'Ein langer „a“-Laut', meaningEs: 'Un sonido largo de "a"', meaningFr: 'Un son "a" long' },
  { id: 2, arabic: 'بَاء', transliteration: 'Ba', meaningEn: 'Sounds like B', meaningAr: 'يُنطق مثل حرف الباء', meaningNl: 'Klinkt als B', meaningDe: 'Klingt wie B', meaningEs: 'Suena como B', meaningFr: 'Se prononce comme B' },
  { id: 3, arabic: 'تَاء', transliteration: 'Ta', meaningEn: 'Sounds like T', meaningAr: 'يُنطق مثل حرف التاء', meaningNl: 'Klinkt als T', meaningDe: 'Klingt wie T', meaningEs: 'Suena como T', meaningFr: 'Se prononce comme T' },
  { id: 4, arabic: 'ثَاء', transliteration: 'Tha', meaningEn: 'Sounds like "th" in "think"', meaningAr: 'يُنطق مثل حرف الثاء', meaningNl: 'Klinkt als de Engelse "th" in "think"', meaningDe: 'Wie das englische „th“ in „think“', meaningEs: 'Como la "z" española en "zapato" (pronunciación de España)', meaningFr: 'Comme le "th" anglais dans "think"' },
  { id: 5, arabic: 'جِيم', transliteration: 'Jim', meaningEn: 'Sounds like J', meaningAr: 'يُنطق مثل حرف الجيم', meaningNl: 'Klinkt als J', meaningDe: 'Klingt wie ein weiches „Dsch“ (wie im englischen „J“)', meaningEs: 'Suena como la "y" inglesa en "jam" (no como la "j" española)', meaningFr: 'Se prononce comme le "j" dans "jardin"' },
  { id: 6, arabic: 'حَاء', transliteration: 'Ha', meaningEn: 'A breathy H, from deep in the throat', meaningAr: 'صوت حاء مهموس يخرج من أعماق الحلق', meaningNl: 'Een ademende H, diep uit de keel', meaningDe: 'Ein gehauchtes H, tief aus dem Rachen', meaningEs: 'Una H aspirada, profunda desde la garganta', meaningFr: 'Un "h" soufflé, profond dans la gorge' },
  { id: 7, arabic: 'خَاء', transliteration: 'Kha', meaningEn: 'Like "ch" in the Scottish "loch"', meaningAr: 'صوت خاء يخرج من أقصى الحلق', meaningNl: 'Zoals de "ch" in het Schotse "loch"', meaningDe: 'Wie das „ch“ in „Bach“ oder „Buch“', meaningEs: 'Como la "j" española en "jamón"', meaningFr: 'Un son rauque au fond de la gorge, comme la "jota" espagnole' },
  { id: 8, arabic: 'دَال', transliteration: 'Dal', meaningEn: 'Sounds like D', meaningAr: 'يُنطق مثل حرف الدال', meaningNl: 'Klinkt als D', meaningDe: 'Klingt wie D', meaningEs: 'Suena como D', meaningFr: 'Se prononce comme D' },
  { id: 9, arabic: 'ذَال', transliteration: 'Dhal', meaningEn: 'Sounds like "th" in "this"', meaningAr: 'يُنطق مثل حرف الذال', meaningNl: 'Klinkt als de Engelse "th" in "this"', meaningDe: 'Wie das englische „th“ in „this“', meaningEs: 'Como la "d" española en "nada" (pronunciación suave)', meaningFr: 'Comme le "th" anglais dans "this"' },
  { id: 10, arabic: 'رَاء', transliteration: 'Ra', meaningEn: 'A rolled R', meaningAr: 'صوت راء مكرّر ومرقرق', meaningNl: 'Een rollende R', meaningDe: 'Ein gerolltes R', meaningEs: 'Una erre vibrante, como la "rr" en "perro"', meaningFr: 'Un "r" roulé (pas le "r" français guttural)' },
  { id: 11, arabic: 'زَاي', transliteration: 'Zay', meaningEn: 'Sounds like Z', meaningAr: 'يُنطق مثل حرف الزاي', meaningNl: 'Klinkt als Z', meaningDe: 'Klingt wie ein stimmhaftes S (wie das englische Z)', meaningEs: 'Suena como una "s" suave y sonora (como el inglés Z)', meaningFr: 'Se prononce comme Z' },
  { id: 12, arabic: 'سِين', transliteration: 'Sin', meaningEn: 'Sounds like S', meaningAr: 'يُنطق مثل حرف السين', meaningNl: 'Klinkt als S', meaningDe: 'Klingt wie S', meaningEs: 'Suena como S', meaningFr: 'Se prononce comme S' },
  { id: 13, arabic: 'شِين', transliteration: 'Shin', meaningEn: 'Sounds like SH', meaningAr: 'يُنطق مثل حرف الشين', meaningNl: 'Klinkt als SH', meaningDe: 'Klingt wie „sch“ (wie in „Schule“)', meaningEs: 'Suena como "sh" (como en inglés "shoe")', meaningFr: 'Se prononce comme "ch" (comme dans "chat")' },
  { id: 14, arabic: 'صَاد', transliteration: 'Sad', meaningEn: 'A heavy, emphatic S', meaningAr: 'صوت صاد مفخم وثقيل', meaningNl: 'Een zware, nadrukkelijke S', meaningDe: 'Ein schweres, betontes S', meaningEs: 'Una S pesada y enfática', meaningFr: 'Un "s" emphatique et grave' },
  { id: 15, arabic: 'ضَاد', transliteration: 'Dad', meaningEn: 'A heavy, emphatic D', meaningAr: 'صوت ضاد مفخم وثقيل', meaningNl: 'Een zware, nadrukkelijke D', meaningDe: 'Ein schweres, betontes D', meaningEs: 'Una D pesada y enfática', meaningFr: 'Un "d" emphatique et grave' },
  { id: 16, arabic: 'طَاء', transliteration: 'Ta (heavy)', meaningEn: 'A heavy, emphatic T', meaningAr: 'صوت طاء مفخم وثقيل', meaningNl: 'Een zware, nadrukkelijke T', meaningDe: 'Ein schweres, betontes T', meaningEs: 'Una T pesada y enfática', meaningFr: 'Un "t" emphatique et grave' },
  { id: 17, arabic: 'ظَاء', transliteration: 'Za (heavy)', meaningEn: 'A heavy, emphatic "th"', meaningAr: 'صوت ظاء مفخم وثقيل', meaningNl: 'Een zware, nadrukkelijke "th"', meaningDe: 'Ein schweres, betontes „th“', meaningEs: 'Una "z" pesada y enfática (como en "zapato")', meaningFr: 'Un "th" emphatique et grave' },
  { id: 18, arabic: 'عَيْن', transliteration: "'Ayn", meaningEn: 'A throat sound with no English equivalent', meaningAr: 'صوت حلقي مميز يخرج من وسط الحلق', meaningNl: 'Een keelklank zonder Nederlands equivalent', meaningDe: 'Ein Kehllaut ohne deutsche Entsprechung', meaningEs: 'Un sonido gutural sin equivalente en español', meaningFr: 'Un son guttural sans équivalent en français' },
  { id: 19, arabic: 'غَيْن', transliteration: 'Ghayn', meaningEn: 'Like a French/German R', meaningAr: 'صوت غين يشبه صوت الغرغرة من أعلى الحلق', meaningNl: 'Zoals een Franse of Duitse R', meaningDe: 'Wie ein französisches R', meaningEs: 'Como una R francesa gutural', meaningFr: 'Comme le "r" français guttural' },
  { id: 20, arabic: 'فَاء', transliteration: 'Fa', meaningEn: 'Sounds like F', meaningAr: 'يُنطق مثل حرف الفاء', meaningNl: 'Klinkt als F', meaningDe: 'Klingt wie F', meaningEs: 'Suena como F', meaningFr: 'Se prononce comme F' },
  { id: 21, arabic: 'قَاف', transliteration: 'Qaf', meaningEn: 'A deep K, from the back of the throat', meaningAr: 'صوت قاف عميق يخرج من أقصى الحلق', meaningNl: 'Een diepe K, achter in de keel', meaningDe: 'Ein tiefes K, hinten im Rachen', meaningEs: 'Una K profunda, desde el fondo de la garganta', meaningFr: 'Un "k" profond, au fond de la gorge' },
  { id: 22, arabic: 'كَاف', transliteration: 'Kaf', meaningEn: 'Sounds like K', meaningAr: 'يُنطق مثل حرف الكاف', meaningNl: 'Klinkt als K', meaningDe: 'Klingt wie K', meaningEs: 'Suena como K', meaningFr: 'Se prononce comme K' },
  { id: 23, arabic: 'لَام', transliteration: 'Lam', meaningEn: 'Sounds like L', meaningAr: 'يُنطق مثل حرف اللام', meaningNl: 'Klinkt als L', meaningDe: 'Klingt wie L', meaningEs: 'Suena como L', meaningFr: 'Se prononce comme L' },
  { id: 24, arabic: 'مِيم', transliteration: 'Mim', meaningEn: 'Sounds like M', meaningAr: 'يُنطق مثل حرف الميم', meaningNl: 'Klinkt als M', meaningDe: 'Klingt wie M', meaningEs: 'Suena como M', meaningFr: 'Se prononce comme M' },
  { id: 25, arabic: 'نُون', transliteration: 'Nun', meaningEn: 'Sounds like N', meaningAr: 'يُنطق مثل حرف النون', meaningNl: 'Klinkt als N', meaningDe: 'Klingt wie N', meaningEs: 'Suena como N', meaningFr: 'Se prononce comme N' },
  { id: 26, arabic: 'هَاء', transliteration: 'Ha (light)', meaningEn: 'A light, soft H', meaningAr: 'صوت هاء خفيف ولين', meaningNl: 'Een lichte, zachte H', meaningDe: 'Ein leichtes, weiches H', meaningEs: 'Una H ligera y suave (sí se pronuncia)', meaningFr: 'Un "h" léger et doux (aspiré, contrairement au français)' },
  { id: 27, arabic: 'وَاو', transliteration: 'Waw', meaningEn: 'Sounds like W, or a long "u"', meaningAr: 'يُنطق مثل الواو، أو كصوت "و" ممدودة', meaningNl: 'Klinkt als W, of een lange "oe"', meaningDe: 'Klingt wie W, oder ein langes „u“', meaningEs: 'Suena como la W inglesa, o una "u" larga', meaningFr: 'Se prononce comme le "w" anglais, ou un "ou" long' },
  { id: 28, arabic: 'يَاء', transliteration: 'Ya', meaningEn: 'Sounds like Y, or a long "i"', meaningAr: 'يُنطق مثل الياء، أو كصوت "ي" ممدودة', meaningNl: 'Klinkt als J, of een lange "ie"', meaningDe: 'Klingt wie J (wie im englischen Y), oder ein langes „i“', meaningEs: 'Suena como la Y inglesa, o una "i" larga', meaningFr: 'Se prononce comme le "y" anglais, ou un "i" long' },
];
