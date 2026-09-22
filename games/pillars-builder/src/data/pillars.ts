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

// The 5 Pillars of Islam (Arkan al-Islam).
export const PILLARS: BuilderItem[] = [
  { id: 1, arabic: 'شَهَادَة', transliteration: 'Shahada', meaningEn: 'Testimony of faith: there is no god but Allah, and Muhammad is His messenger', meaningAr: 'شهادة الإيمان: لا إله إلا الله، وأن محمدًا رسول الله', meaningNl: 'Getuigenis van geloof: er is geen god dan Allah, en Mohammed is Zijn boodschapper', meaningDe: 'Glaubensbekenntnis: Es gibt keinen Gott außer Allah, und Muhammad ist Sein Gesandter', meaningEs: 'Testimonio de fe: no hay más dios que Allah, y Muhammad es Su mensajero', meaningFr: "Témoignage de foi : il n'y a de dieu qu'Allah, et Muhammad est Son messager" },
  { id: 2, arabic: 'صَلاَة', transliteration: 'Salah', meaningEn: 'Prayer, performed five times a day', meaningAr: 'الصلاة، وتُؤدى خمس مرات في اليوم', meaningNl: 'Gebed, vijf keer per dag verricht', meaningDe: 'Gebet, fünfmal täglich verrichtet', meaningEs: 'Oración, realizada cinco veces al día', meaningFr: 'La prière, accomplie cinq fois par jour' },
  { id: 3, arabic: 'زَكَاة', transliteration: 'Zakat', meaningEn: "Giving a share of one's wealth to those in need", meaningAr: 'إعطاء جزء من المال للمحتاجين', meaningNl: 'Een deel van je bezit geven aan wie het nodig heeft', meaningDe: 'Einen Teil des eigenen Vermögens an Bedürftige geben', meaningEs: 'Dar una parte de los propios bienes a quienes lo necesitan', meaningFr: 'Donner une part de ses biens à ceux qui en ont besoin' },
  { id: 4, arabic: 'صَوْم', transliteration: 'Sawm', meaningEn: 'Fasting from dawn to sunset during Ramadan', meaningAr: 'الصيام من الفجر إلى غروب الشمس في شهر رمضان', meaningNl: 'Vasten van zonsopgang tot zonsondergang tijdens Ramadan', meaningDe: 'Fasten von der Morgendämmerung bis zum Sonnenuntergang während des Ramadan', meaningEs: 'Ayunar desde el amanecer hasta el atardecer durante el Ramadán', meaningFr: "Jeûner de l'aube au coucher du soleil pendant le Ramadan" },
  { id: 5, arabic: 'حَجّ', transliteration: 'Hajj', meaningEn: 'Pilgrimage to Makkah, once in a lifetime if able', meaningAr: 'الحج إلى مكة، مرة واحدة في العمر لمن استطاع إلى ذلك سبيلًا', meaningNl: 'Bedevaart naar Mekka, eenmaal in het leven indien mogelijk', meaningDe: 'Pilgerfahrt nach Mekka, einmal im Leben, sofern möglich', meaningEs: 'Peregrinación a La Meca, una vez en la vida si es posible', meaningFr: 'Le pèlerinage à La Mecque, une fois dans sa vie si possible' },
];
