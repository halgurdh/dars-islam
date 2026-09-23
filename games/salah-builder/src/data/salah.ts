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

// The steps of a single rak'ah (unit) of the Islamic daily prayer (Salah), in
// order — the array's own order carries the sequence, deliberately NOT
// spelled out as "Step N:" inside the meaning text itself. `meaning` is used
// verbatim as the typed answer to check against in 'toTranslation' mode (see
// shared/builder-typing.ts's isCorrectAnswer), and shown as a direct clue in
// the other two modes — a "Step 1:"/"Stap 1:" prefix baked into that text
// would force the player to type the step number to pass, and would hand
// them the round's ordering for free as a side effect of just reading a clue.
export const SALAH_STEPS: BuilderItem[] = [
  { id: 1, arabic: 'نِيَّة', transliteration: 'Niyyah', meaningEn: 'making the intention in the heart before starting', meaningAr: 'عقد النية في القلب قبل البدء', meaningNl: 'de intentie in het hart maken voor je begint', meaningDe: 'die Absicht im Herzen fassen, bevor man beginnt', meaningEs: 'formular la intención en el corazón antes de comenzar', meaningFr: "formuler l'intention dans le cœur avant de commencer" },
  { id: 2, arabic: 'تَكْبِير', transliteration: 'Takbir', meaningEn: "raising the hands and saying 'Allahu Akbar'", meaningAr: 'رفع اليدين وقول «الله أكبر»', meaningNl: "de handen opheffen en 'Allahu Akbar' zeggen", meaningDe: 'die Hände erheben und „Allahu Akbar“ sagen', meaningEs: 'levantar las manos y decir "Allahu Akbar"', meaningFr: 'lever les mains et dire « Allahu Akbar »' },
  { id: 3, arabic: 'قِيَام', transliteration: 'Qiyam', meaningEn: 'standing and reciting from the Quran', meaningAr: 'القيام وتلاوة القرآن', meaningNl: 'staan en reciteren uit de Koran', meaningDe: 'stehen und aus dem Koran rezitieren', meaningEs: 'ponerse de pie y recitar del Corán', meaningFr: 'se tenir debout et réciter le Coran' },
  { id: 4, arabic: 'رُكُوع', transliteration: 'Ruku', meaningEn: 'bowing with hands on the knees', meaningAr: 'الركوع مع وضع اليدين على الركبتين', meaningNl: 'buigen met de handen op de knieën', meaningDe: 'sich verbeugen, Hände auf den Knien', meaningEs: 'inclinarse con las manos sobre las rodillas', meaningFr: "s'incliner, les mains sur les genoux" },
  { id: 5, arabic: 'اِعْتِدَال', transliteration: "I'tidal", meaningEn: 'rising back up from the bow', meaningAr: 'الاعتدال والعودة إلى الوقوف بعد الركوع', meaningNl: 'weer rechtop komen uit de buiging', meaningDe: 'sich aus der Verbeugung wieder aufrichten', meaningEs: 'erguirse de nuevo tras la inclinación', meaningFr: "se redresser après l'inclinaison" },
  { id: 6, arabic: 'سُجُود', transliteration: 'Sujud', meaningEn: 'prostrating with the forehead to the ground', meaningAr: 'السجود بوضع الجبهة على الأرض', meaningNl: 'neerknielen met het voorhoofd op de grond', meaningDe: 'sich niederwerfen, die Stirn auf dem Boden', meaningEs: 'postrarse con la frente en el suelo', meaningFr: 'se prosterner, le front au sol' },
  { id: 7, arabic: 'جِلْسَة', transliteration: 'Jalsa', meaningEn: 'sitting between the two prostrations', meaningAr: 'الجلوس بين السجدتين', meaningNl: 'zitten tussen de twee neerknielingen', meaningDe: 'zwischen den beiden Niederwerfungen sitzen', meaningEs: 'sentarse entre las dos postraciones', meaningFr: "s'asseoir entre les deux prosternations" },
  { id: 8, arabic: 'تَشَهُّد', transliteration: 'Tashahhud', meaningEn: 'sitting recitation of the testimony of faith', meaningAr: 'الجلوس لتلاوة التشهد', meaningNl: 'zittend de geloofsgetuigenis reciteren', meaningDe: 'sitzend das Glaubensbekenntnis rezitieren', meaningEs: 'recitar sentado el testimonio de fe', meaningFr: 'réciter assis le témoignage de foi' },
  { id: 9, arabic: 'تَسْلِيم', transliteration: 'Taslim', meaningEn: 'turning the head to end the prayer with peace', meaningAr: 'تحويل الرأس لإنهاء الصلاة بالسلام', meaningNl: 'het hoofd draaien om het gebed met vrede te beëindigen', meaningDe: 'den Kopf wenden, um das Gebet mit Frieden zu beenden', meaningEs: 'girar la cabeza para terminar la oración con paz', meaningFr: 'tourner la tête pour terminer la prière en paix' },
];
