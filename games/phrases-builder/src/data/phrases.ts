export interface BuilderItem {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningNl: string;
}

// Short, everyday Islamic phrases and expressions.
export const PHRASES: BuilderItem[] = [
  { id: 1, arabic: 'بِسْمِ اللَّهِ', transliteration: 'Bismillah', meaningEn: 'In the name of Allah — said before starting something', meaningNl: 'In naam van Allah — gezegd voordat je iets begint' },
  { id: 2, arabic: 'الْحَمْدُ لِلَّه', transliteration: 'Alhamdulillah', meaningEn: 'All praise is due to Allah', meaningNl: 'Alle lof is aan Allah' },
  { id: 3, arabic: 'سُبْحَانَ اللَّه', transliteration: 'SubhanAllah', meaningEn: 'Glory be to Allah', meaningNl: 'Verheven is Allah' },
  { id: 4, arabic: 'اللَّهُ أَكْبَر', transliteration: 'Allahu Akbar', meaningEn: 'Allah is the Greatest', meaningNl: 'Allah is de Grootste' },
  { id: 5, arabic: 'أَسْتَغْفِرُ اللَّه', transliteration: 'Astaghfirullah', meaningEn: 'I seek forgiveness from Allah', meaningNl: 'Ik vraag Allah om vergeving' },
  { id: 6, arabic: 'لَا إِلَٰهَ إِلَّا اللَّه', transliteration: 'La ilaha illallah', meaningEn: 'There is no god but Allah', meaningNl: 'Er is geen god dan Allah' },
  { id: 7, arabic: 'إِنْ شَاءَ اللَّه', transliteration: 'In sha Allah', meaningEn: 'If Allah wills', meaningNl: 'Als Allah het wil' },
  { id: 8, arabic: 'مَا شَاءَ اللَّه', transliteration: 'Ma sha Allah', meaningEn: 'What Allah has willed — said to express appreciation', meaningNl: 'Wat Allah heeft gewild — gezegd om waardering te tonen' },
  { id: 9, arabic: 'جَزَاكَ اللَّهُ خَيْرًا', transliteration: 'Jazak Allahu Khayran', meaningEn: 'May Allah reward you with goodness', meaningNl: 'Moge Allah je belonen met goedheid' },
  { id: 10, arabic: 'السَّلَامُ عَلَيْكُم', transliteration: 'As-salamu alaykum', meaningEn: 'Peace be upon you — a greeting', meaningNl: 'Vrede zij met u — een begroeting' },
];
