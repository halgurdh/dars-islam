export interface BuilderItem {
  id: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningNl: string;
}

// The 5 Pillars of Islam (Arkan al-Islam).
export const PILLARS: BuilderItem[] = [
  { id: 1, arabic: 'شَهَادَة', transliteration: 'Shahada', meaningEn: 'Testimony of faith: there is no god but Allah, and Muhammad is His messenger', meaningNl: 'Getuigenis van geloof: er is geen god dan Allah, en Mohammed is Zijn boodschapper' },
  { id: 2, arabic: 'صَلاَة', transliteration: 'Salah', meaningEn: 'Prayer, performed five times a day', meaningNl: 'Gebed, vijf keer per dag verricht' },
  { id: 3, arabic: 'زَكَاة', transliteration: 'Zakat', meaningEn: "Giving a share of one's wealth to those in need", meaningNl: 'Een deel van je bezit geven aan wie het nodig heeft' },
  { id: 4, arabic: 'صَوْم', transliteration: 'Sawm', meaningEn: 'Fasting from dawn to sunset during Ramadan', meaningNl: 'Vasten van zonsopgang tot zonsondergang tijdens Ramadan' },
  { id: 5, arabic: 'حَجّ', transliteration: 'Hajj', meaningEn: 'Pilgrimage to Makkah, once in a lifetime if able', meaningNl: 'Bedevaart naar Mekka, eenmaal in het leven indien mogelijk' },
];
