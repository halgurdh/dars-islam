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

// The steps of a single rak'ah (unit) of the Islamic daily prayer (Salah), in order.
export const SALAH_STEPS: BuilderItem[] = [
  { id: 1, arabic: 'نِيَّة', transliteration: 'Niyyah', meaningEn: 'Step 1: making the intention in the heart before starting', meaningAr: 'الخطوة 1: عقد النية في القلب قبل البدء', meaningNl: 'Stap 1: de intentie in het hart maken voor je begint', meaningDe: 'Schritt 1: die Absicht im Herzen fassen, bevor man beginnt', meaningEs: 'Paso 1: formular la intención en el corazón antes de comenzar', meaningFr: "Étape 1 : formuler l'intention dans le cœur avant de commencer" },
  { id: 2, arabic: 'تَكْبِير', transliteration: 'Takbir', meaningEn: "Step 2: raising the hands and saying 'Allahu Akbar'", meaningAr: 'الخطوة 2: رفع اليدين وقول «الله أكبر»', meaningNl: "Stap 2: de handen opheffen en 'Allahu Akbar' zeggen", meaningDe: 'Schritt 2: die Hände erheben und „Allahu Akbar“ sagen', meaningEs: 'Paso 2: levantar las manos y decir "Allahu Akbar"', meaningFr: 'Étape 2 : lever les mains et dire « Allahu Akbar »' },
  { id: 3, arabic: 'قِيَام', transliteration: 'Qiyam', meaningEn: 'Step 3: standing and reciting from the Quran', meaningAr: 'الخطوة 3: القيام وتلاوة القرآن', meaningNl: 'Stap 3: staan en reciteren uit de Koran', meaningDe: 'Schritt 3: stehen und aus dem Koran rezitieren', meaningEs: 'Paso 3: ponerse de pie y recitar del Corán', meaningFr: 'Étape 3 : se tenir debout et réciter le Coran' },
  { id: 4, arabic: 'رُكُوع', transliteration: 'Ruku', meaningEn: 'Step 4: bowing with hands on the knees', meaningAr: 'الخطوة 4: الركوع مع وضع اليدين على الركبتين', meaningNl: 'Stap 4: buigen met de handen op de knieën', meaningDe: 'Schritt 4: sich verbeugen, Hände auf den Knien', meaningEs: 'Paso 4: inclinarse con las manos sobre las rodillas', meaningFr: "Étape 4 : s'incliner, les mains sur les genoux" },
  { id: 5, arabic: 'اِعْتِدَال', transliteration: "I'tidal", meaningEn: 'Step 5: rising back up from the bow', meaningAr: 'الخطوة 5: الاعتدال والعودة إلى الوقوف بعد الركوع', meaningNl: 'Stap 5: weer rechtop komen uit de buiging', meaningDe: 'Schritt 5: sich aus der Verbeugung wieder aufrichten', meaningEs: 'Paso 5: erguirse de nuevo tras la inclinación', meaningFr: "Étape 5 : se redresser après l'inclinaison" },
  { id: 6, arabic: 'سُجُود', transliteration: 'Sujud', meaningEn: 'Step 6: prostrating with the forehead to the ground', meaningAr: 'الخطوة 6: السجود بوضع الجبهة على الأرض', meaningNl: 'Stap 6: neerknielen met het voorhoofd op de grond', meaningDe: 'Schritt 6: sich niederwerfen, die Stirn auf dem Boden', meaningEs: 'Paso 6: postrarse con la frente en el suelo', meaningFr: 'Étape 6 : se prosterner, le front au sol' },
  { id: 7, arabic: 'جِلْسَة', transliteration: 'Jalsa', meaningEn: 'Step 7: sitting between the two prostrations', meaningAr: 'الخطوة 7: الجلوس بين السجدتين', meaningNl: 'Stap 7: zitten tussen de twee neerknielingen', meaningDe: 'Schritt 7: zwischen den beiden Niederwerfungen sitzen', meaningEs: 'Paso 7: sentarse entre las dos postraciones', meaningFr: "Étape 7 : s'asseoir entre les deux prosternations" },
  { id: 8, arabic: 'تَشَهُّد', transliteration: 'Tashahhud', meaningEn: 'Step 8: sitting recitation of the testimony of faith', meaningAr: 'الخطوة 8: الجلوس لتلاوة التشهد', meaningNl: 'Stap 8: zittend de geloofsgetuigenis reciteren', meaningDe: 'Schritt 8: sitzend das Glaubensbekenntnis rezitieren', meaningEs: 'Paso 8: recitar sentado el testimonio de fe', meaningFr: 'Étape 8 : réciter assis le témoignage de foi' },
  { id: 9, arabic: 'تَسْلِيم', transliteration: 'Taslim', meaningEn: 'Step 9: turning the head to end the prayer with peace', meaningAr: 'الخطوة 9: تحويل الرأس لإنهاء الصلاة بالسلام', meaningNl: 'Stap 9: het hoofd draaien om het gebed met vrede te beëindigen', meaningDe: 'Schritt 9: den Kopf wenden, um das Gebet mit Frieden zu beenden', meaningEs: 'Paso 9: girar la cabeza para terminar la oración con paz', meaningFr: 'Étape 9 : tourner la tête pour terminer la prière en paix' },
];
