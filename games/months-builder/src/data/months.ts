export interface BuilderItem {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningNl: string;
}

// The 12 months of the Islamic (Hijri) calendar, in order.
export const MONTHS: BuilderItem[] = [
  { id: 1, arabic: 'مُحَرَّم', transliteration: 'Muharram', meaningEn: '1st month of the Hijri year', meaningNl: '1e maand van het Hijri-jaar' },
  { id: 2, arabic: 'صَفَر', transliteration: 'Safar', meaningEn: '2nd month of the Hijri year', meaningNl: '2e maand van het Hijri-jaar' },
  { id: 3, arabic: 'رَبِيع الْأَوَّل', transliteration: 'Rabi al-Awwal', meaningEn: '3rd month of the Hijri year', meaningNl: '3e maand van het Hijri-jaar' },
  { id: 4, arabic: 'رَبِيع الْآخِر', transliteration: 'Rabi al-Akhir', meaningEn: '4th month of the Hijri year', meaningNl: '4e maand van het Hijri-jaar' },
  { id: 5, arabic: 'جُمَادَى الْأُولَى', transliteration: 'Jumada al-Ula', meaningEn: '5th month of the Hijri year', meaningNl: '5e maand van het Hijri-jaar' },
  { id: 6, arabic: 'جُمَادَى الْآخِرَة', transliteration: 'Jumada al-Akhirah', meaningEn: '6th month of the Hijri year', meaningNl: '6e maand van het Hijri-jaar' },
  { id: 7, arabic: 'رَجَب', transliteration: 'Rajab', meaningEn: '7th month of the Hijri year — one of the four sacred months', meaningNl: '7e maand van het Hijri-jaar — een van de vier heilige maanden' },
  { id: 8, arabic: 'شَعْبَان', transliteration: 'Shaban', meaningEn: '8th month of the Hijri year', meaningNl: '8e maand van het Hijri-jaar' },
  { id: 9, arabic: 'رَمَضَان', transliteration: 'Ramadan', meaningEn: '9th month of the Hijri year — the month of fasting', meaningNl: '9e maand van het Hijri-jaar — de maand van het vasten' },
  { id: 10, arabic: 'شَوَّال', transliteration: 'Shawwal', meaningEn: '10th month of the Hijri year', meaningNl: '10e maand van het Hijri-jaar' },
  { id: 11, arabic: 'ذُو الْقَعْدَة', transliteration: 'Dhul-Qadah', meaningEn: '11th month of the Hijri year — one of the four sacred months', meaningNl: '11e maand van het Hijri-jaar — een van de vier heilige maanden' },
  { id: 12, arabic: 'ذُو الْحِجَّة', transliteration: 'Dhul-Hijjah', meaningEn: '12th month of the Hijri year — the month of Hajj', meaningNl: '12e maand van het Hijri-jaar — de maand van de Hajj' },
];
