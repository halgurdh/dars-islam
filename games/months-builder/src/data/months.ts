export interface BuilderItem {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningNl: string;
  meaningDe: string;
  meaningEs: string;
  meaningFr: string;
}

// The 12 months of the Islamic (Hijri) calendar, in order.
export const MONTHS: BuilderItem[] = [
  { id: 1, arabic: 'مُحَرَّم', transliteration: 'Muharram', meaningEn: '1st month of the Hijri year', meaningNl: '1e maand van het Hijri-jaar', meaningDe: '1. Monat des Hijri-Jahres', meaningEs: '1.º mes del año hégira', meaningFr: "1er mois de l'année hégirienne" },
  { id: 2, arabic: 'صَفَر', transliteration: 'Safar', meaningEn: '2nd month of the Hijri year', meaningNl: '2e maand van het Hijri-jaar', meaningDe: '2. Monat des Hijri-Jahres', meaningEs: '2.º mes del año hégira', meaningFr: "2e mois de l'année hégirienne" },
  { id: 3, arabic: 'رَبِيع الْأَوَّل', transliteration: 'Rabi al-Awwal', meaningEn: '3rd month of the Hijri year', meaningNl: '3e maand van het Hijri-jaar', meaningDe: '3. Monat des Hijri-Jahres', meaningEs: '3.º mes del año hégira', meaningFr: "3e mois de l'année hégirienne" },
  { id: 4, arabic: 'رَبِيع الْآخِر', transliteration: 'Rabi al-Akhir', meaningEn: '4th month of the Hijri year', meaningNl: '4e maand van het Hijri-jaar', meaningDe: '4. Monat des Hijri-Jahres', meaningEs: '4.º mes del año hégira', meaningFr: "4e mois de l'année hégirienne" },
  { id: 5, arabic: 'جُمَادَى الْأُولَى', transliteration: 'Jumada al-Ula', meaningEn: '5th month of the Hijri year', meaningNl: '5e maand van het Hijri-jaar', meaningDe: '5. Monat des Hijri-Jahres', meaningEs: '5.º mes del año hégira', meaningFr: "5e mois de l'année hégirienne" },
  { id: 6, arabic: 'جُمَادَى الْآخِرَة', transliteration: 'Jumada al-Akhirah', meaningEn: '6th month of the Hijri year', meaningNl: '6e maand van het Hijri-jaar', meaningDe: '6. Monat des Hijri-Jahres', meaningEs: '6.º mes del año hégira', meaningFr: "6e mois de l'année hégirienne" },
  { id: 7, arabic: 'رَجَب', transliteration: 'Rajab', meaningEn: '7th month of the Hijri year — one of the four sacred months', meaningNl: '7e maand van het Hijri-jaar — een van de vier heilige maanden', meaningDe: '7. Monat des Hijri-Jahres — einer der vier heiligen Monate', meaningEs: '7.º mes del año hégira — uno de los cuatro meses sagrados', meaningFr: "7e mois de l'année hégirienne — l'un des quatre mois sacrés" },
  { id: 8, arabic: 'شَعْبَان', transliteration: 'Shaban', meaningEn: '8th month of the Hijri year', meaningNl: '8e maand van het Hijri-jaar', meaningDe: '8. Monat des Hijri-Jahres', meaningEs: '8.º mes del año hégira', meaningFr: "8e mois de l'année hégirienne" },
  { id: 9, arabic: 'رَمَضَان', transliteration: 'Ramadan', meaningEn: '9th month of the Hijri year — the month of fasting', meaningNl: '9e maand van het Hijri-jaar — de maand van het vasten', meaningDe: '9. Monat des Hijri-Jahres — der Monat des Fastens', meaningEs: '9.º mes del año hégira — el mes del ayuno', meaningFr: "9e mois de l'année hégirienne — le mois du jeûne" },
  { id: 10, arabic: 'شَوَّال', transliteration: 'Shawwal', meaningEn: '10th month of the Hijri year', meaningNl: '10e maand van het Hijri-jaar', meaningDe: '10. Monat des Hijri-Jahres', meaningEs: '10.º mes del año hégira', meaningFr: "10e mois de l'année hégirienne" },
  { id: 11, arabic: 'ذُو الْقَعْدَة', transliteration: 'Dhul-Qadah', meaningEn: '11th month of the Hijri year — one of the four sacred months', meaningNl: '11e maand van het Hijri-jaar — een van de vier heilige maanden', meaningDe: '11. Monat des Hijri-Jahres — einer der vier heiligen Monate', meaningEs: '11.º mes del año hégira — uno de los cuatro meses sagrados', meaningFr: "11e mois de l'année hégirienne — l'un des quatre mois sacrés" },
  { id: 12, arabic: 'ذُو الْحِجَّة', transliteration: 'Dhul-Hijjah', meaningEn: '12th month of the Hijri year — the month of Hajj', meaningNl: '12e maand van het Hijri-jaar — de maand van de Hajj', meaningDe: '12. Monat des Hijri-Jahres — der Monat der Hadsch', meaningEs: '12.º mes del año hégira — el mes del Hajj', meaningFr: "12e mois de l'année hégirienne — le mois du Hajj" },
];
