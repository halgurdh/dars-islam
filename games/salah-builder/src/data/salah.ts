export interface BuilderItem {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningNl: string;
}

// The steps of a single rak'ah (unit) of the Islamic daily prayer (Salah), in order.
export const SALAH_STEPS: BuilderItem[] = [
  { id: 1, arabic: 'نِيَّة', transliteration: 'Niyyah', meaningEn: 'Step 1: making the intention in the heart before starting', meaningNl: 'Stap 1: de intentie in het hart maken voor je begint' },
  { id: 2, arabic: 'تَكْبِير', transliteration: 'Takbir', meaningEn: "Step 2: raising the hands and saying 'Allahu Akbar'", meaningNl: "Stap 2: de handen opheffen en 'Allahu Akbar' zeggen" },
  { id: 3, arabic: 'قِيَام', transliteration: 'Qiyam', meaningEn: 'Step 3: standing and reciting from the Quran', meaningNl: 'Stap 3: staan en reciteren uit de Koran' },
  { id: 4, arabic: 'رُكُوع', transliteration: 'Ruku', meaningEn: 'Step 4: bowing with hands on the knees', meaningNl: 'Stap 4: buigen met de handen op de knieën' },
  { id: 5, arabic: 'اِعْتِدَال', transliteration: "I'tidal", meaningEn: 'Step 5: rising back up from the bow', meaningNl: 'Stap 5: weer rechtop komen uit de buiging' },
  { id: 6, arabic: 'سُجُود', transliteration: 'Sujud', meaningEn: 'Step 6: prostrating with the forehead to the ground', meaningNl: 'Stap 6: neerknielen met het voorhoofd op de grond' },
  { id: 7, arabic: 'جُلُوس', transliteration: 'Julus', meaningEn: 'Step 7: sitting between the two prostrations', meaningNl: 'Stap 7: zitten tussen de twee neerknielingen' },
  { id: 8, arabic: 'تَشَهُّد', transliteration: 'Tashahhud', meaningEn: 'Step 8: sitting recitation of the testimony of faith', meaningNl: 'Stap 8: zittend de geloofsgetuigenis reciteren' },
  { id: 9, arabic: 'تَسْلِيم', transliteration: 'Taslim', meaningEn: 'Step 9: turning the head to end the prayer with peace', meaningNl: 'Stap 9: het hoofd draaien om het gebed met vrede te beëindigen' },
];
