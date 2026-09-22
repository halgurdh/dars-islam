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

// Short, everyday Islamic phrases and expressions.
export const PHRASES: BuilderItem[] = [
  { id: 1, arabic: 'بِسْمِ اللَّهِ', transliteration: 'Bismillah', meaningEn: 'In the name of Allah — said before starting something', meaningAr: 'بسم الله — تُقال قبل البدء بأي عمل', meaningNl: 'In naam van Allah — gezegd voordat je iets begint', meaningDe: 'Im Namen Allahs — gesagt, bevor man etwas beginnt', meaningEs: 'En el nombre de Allah — dicho antes de comenzar algo', meaningFr: "Au nom d'Allah — dit avant de commencer quelque chose" },
  { id: 2, arabic: 'الْحَمْدُ لِلَّه', transliteration: 'Alhamdulillah', meaningEn: 'All praise is due to Allah', meaningAr: 'كل الحمد والثناء لله', meaningNl: 'Alle lof is aan Allah', meaningDe: 'Alles Lob gebührt Allah', meaningEs: 'Toda alabanza es para Allah', meaningFr: 'Louange à Allah' },
  { id: 3, arabic: 'سُبْحَانَ اللَّه', transliteration: 'SubhanAllah', meaningEn: 'Glory be to Allah', meaningAr: 'تنزيه الله وتسبيحه عن كل نقص', meaningNl: 'Verheven is Allah', meaningDe: 'Erhaben ist Allah', meaningEs: 'Glorificado sea Allah', meaningFr: 'Gloire à Allah' },
  { id: 4, arabic: 'اللَّهُ أَكْبَر', transliteration: 'Allahu Akbar', meaningEn: 'Allah is the Greatest', meaningAr: 'الله هو الأكبر من كل شيء', meaningNl: 'Allah is de Grootste', meaningDe: 'Allah ist der Größte', meaningEs: 'Allah es el más grande', meaningFr: 'Allah est le plus grand' },
  { id: 5, arabic: 'أَسْتَغْفِرُ اللَّه', transliteration: 'Astaghfirullah', meaningEn: 'I seek forgiveness from Allah', meaningAr: 'أطلب المغفرة من الله', meaningNl: 'Ik vraag Allah om vergeving', meaningDe: 'Ich bitte Allah um Vergebung', meaningEs: 'Pido perdón a Allah', meaningFr: 'Je demande pardon à Allah' },
  { id: 6, arabic: 'لَا إِلَٰهَ إِلَّا اللَّه', transliteration: 'La ilaha illallah', meaningEn: 'There is no god but Allah', meaningAr: 'لا إله إلا الله', meaningNl: 'Er is geen god dan Allah', meaningDe: 'Es gibt keinen Gott außer Allah', meaningEs: 'No hay más dios que Allah', meaningFr: "Il n'y a de dieu qu'Allah" },
  { id: 7, arabic: 'إِنْ شَاءَ اللَّه', transliteration: 'In sha Allah', meaningEn: 'If Allah wills', meaningAr: 'إن شاء الله', meaningNl: 'Als Allah het wil', meaningDe: 'So Allah will', meaningEs: 'Si Allah quiere', meaningFr: 'Si Allah le veut' },
  { id: 8, arabic: 'مَا شَاءَ اللَّه', transliteration: 'Ma sha Allah', meaningEn: 'What Allah has willed — said to express appreciation', meaningAr: 'ما شاء الله — تُقال للتعبير عن الإعجاب والتقدير', meaningNl: 'Wat Allah heeft gewild — gezegd om waardering te tonen', meaningDe: 'Was Allah gewollt hat — gesagt, um Wertschätzung auszudrücken', meaningEs: 'Lo que Allah ha querido — dicho para expresar aprecio', meaningFr: "Ce qu'Allah a voulu — dit pour exprimer son appréciation" },
  { id: 9, arabic: 'جَزَاكَ اللَّهُ خَيْرًا', transliteration: 'Jazak Allahu Khayran', meaningEn: 'May Allah reward you with goodness', meaningAr: 'جزاك الله خيرًا', meaningNl: 'Moge Allah je belonen met goedheid', meaningDe: 'Möge Allah dich mit Gutem belohnen', meaningEs: 'Que Allah te recompense con bien', meaningFr: "Qu'Allah te récompense en bien" },
  { id: 10, arabic: 'السَّلَامُ عَلَيْكُم', transliteration: 'As-salamu alaykum', meaningEn: 'Peace be upon you — a greeting', meaningAr: 'السلام عليكم — تحية إسلامية', meaningNl: 'Vrede zij met u — een begroeting', meaningDe: 'Friede sei mit dir — ein Gruß', meaningEs: 'La paz sea contigo — un saludo', meaningFr: 'Que la paix soit sur toi — une salutation' },
];
