import { getLang } from '../systems/Locale';

export interface SurahEntry {
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

// Short surahs from Juz' Amma (the 30th part of the Quran) — the ones most
// children memorize first. Meanings are the surah's name/theme, not a full
// verse translation, to keep the content short, safe and factual.
export const JUZ_AMMA_SURAHS: SurahEntry[] = [
  { id: 1, arabic: 'الْفَاتِحَة', transliteration: 'Al-Fatihah', meaningEn: 'The Opening — recited in every prayer', meaningAr: 'الفاتحة — تُتلى في كل ركعة من الصلاة', meaningNl: 'De Opening — voorgedragen in elk gebed', meaningDe: 'Die Eröffnung — in jedem Gebet rezitiert', meaningEs: 'La Apertura — recitada en cada oración', meaningFr: "L'Ouverture — récitée à chaque prière" },
  { id: 2, arabic: 'النَّاس', transliteration: 'An-Nas', meaningEn: 'Mankind — seeking refuge from evil whispers', meaningAr: 'الناس — الاستعاذة من وساوس الشر', meaningNl: 'De Mensheid — bescherming zoeken tegen kwade influisteringen', meaningDe: 'Die Menschen — Zuflucht vor bösen Einflüsterungen suchen', meaningEs: 'La Humanidad — buscar refugio de los malos susurros', meaningFr: "Les Hommes — chercher refuge contre les mauvaises suggestions" },
  { id: 3, arabic: 'الْفَلَق', transliteration: 'Al-Falaq', meaningEn: 'The Daybreak — seeking refuge in the Lord of dawn', meaningAr: 'الفلق — الاستعاذة برب الفجر', meaningNl: 'De Ochtendschemering — bescherming zoeken bij de Heer van de dageraad', meaningDe: 'Die Morgendämmerung — Zuflucht beim Herrn der Morgenröte suchen', meaningEs: 'El Amanecer — buscar refugio en el Señor del alba', meaningFr: "L'Aube — chercher refuge auprès du Seigneur de l'aube" },
  { id: 4, arabic: 'الْإِخْلَاص', transliteration: 'Al-Ikhlas', meaningEn: 'Sincerity — declaring that Allah is One', meaningAr: 'الإخلاص — الإعلان بأن الله واحد', meaningNl: 'Oprechtheid — verklaren dat Allah Eén is', meaningDe: 'Aufrichtigkeit — erklären, dass Allah Einer ist', meaningEs: 'La Sinceridad — declarar que Allah es Uno', meaningFr: "La Pureté — déclarer qu'Allah est Un" },
  { id: 5, arabic: 'الْمَسَد', transliteration: 'Al-Masad', meaningEn: 'The Palm Fibre — a warning to Abu Lahab, who opposed the Prophet (peace be upon him)', meaningAr: 'ليف النخل — تحذير لأبي لهب الذي عادى النبي صلى الله عليه وسلم', meaningNl: 'De Palmvezel — een waarschuwing voor Abu Lahab, die zich tegen de Profeet (vrede zij met hem) verzette', meaningDe: 'Die Palmfaser — eine Warnung an Abu Lahab, der sich dem Propheten (Friede sei mit ihm) widersetzte', meaningEs: 'La Fibra de Palma — una advertencia a Abu Lahab, quien se opuso al Profeta (la paz sea con él)', meaningFr: "La Fibre de Palmier — un avertissement à Abu Lahab, qui s'est opposé au Prophète (paix sur lui)" },
  { id: 6, arabic: 'النَّصْر', transliteration: 'An-Nasr', meaningEn: 'The Help — Allah’s victory and support', meaningAr: 'النصر — نصر الله وتأييده', meaningNl: 'De Hulp — Allahs overwinning en steun', meaningDe: 'Die Hilfe — Allahs Sieg und Unterstützung', meaningEs: 'La Ayuda — la victoria y el apoyo de Allah', meaningFr: "Le Secours — la victoire et le soutien d'Allah" },
  { id: 7, arabic: 'الْكَافِرُون', transliteration: 'Al-Kafirun', meaningEn: 'The Disbelievers — to you your religion, to me mine', meaningAr: 'الكافرون — لكم دينكم ولي دين', meaningNl: 'De Ongelovigen — aan jullie jullie religie, aan mij de mijne', meaningDe: 'Die Ungläubigen — euch eure Religion, mir meine', meaningEs: 'Los Incrédulos — para ustedes su religión, para mí la mía', meaningFr: "Les Infidèles — à vous votre religion, à moi la mienne" },
  { id: 8, arabic: 'الْكَوْثَر', transliteration: 'Al-Kawthar', meaningEn: 'Abundance — a gift given to the Prophet (peace be upon him)', meaningAr: 'الكوثر — عطية أعطاها الله للنبي صلى الله عليه وسلم', meaningNl: 'Overvloed — een gave aan de Profeet (vrede zij met hem)', meaningDe: 'Fülle — ein Geschenk an den Propheten (Friede sei mit ihm)', meaningEs: 'La Abundancia — un don dado al Profeta (la paz sea con él)', meaningFr: "L'Abondance — un don donné au Prophète (paix sur lui)" },
  { id: 9, arabic: 'الْمَاعُون', transliteration: 'Al-Ma’un', meaningEn: 'Small Kindnesses — helping others in small ways', meaningAr: 'الماعون — مساعدة الآخرين بأعمال صغيرة', meaningNl: 'Kleine Vriendelijkheden — anderen op kleine manieren helpen', meaningDe: 'Kleine Freundlichkeiten — anderen auf kleine Weise helfen', meaningEs: 'Pequeñas Bondades — ayudar a otros de pequeñas maneras', meaningFr: "Les Petites Bontés — aider les autres de petites manières" },
  { id: 10, arabic: 'قُرَيْش', transliteration: 'Quraish', meaningEn: 'Quraysh — gratitude for safety and provision', meaningAr: 'قريش — الشكر على الأمن والرزق', meaningNl: 'Quraysh — dankbaarheid voor veiligheid en voorziening', meaningDe: 'Quraisch — Dankbarkeit für Sicherheit und Versorgung', meaningEs: 'Quraish — gratitud por la seguridad y el sustento', meaningFr: "Quraysh — gratitude pour la sécurité et les provisions" },
  { id: 11, arabic: 'الْفِيل', transliteration: 'Al-Fil', meaningEn: 'The Elephant — the story of the elephant army', meaningAr: 'الفيل — قصة جيش الفيل', meaningNl: 'De Olifant — het verhaal van het olifantenleger', meaningDe: 'Der Elefant — die Geschichte der Elefantenarmee', meaningEs: 'El Elefante — la historia del ejército de elefantes', meaningFr: "L'Éléphant — l'histoire de l'armée des éléphants" },
  { id: 12, arabic: 'الْعَصْر', transliteration: 'Al-Asr', meaningEn: 'Time — believe, do good, and be patient', meaningAr: 'العصر — الإيمان والعمل الصالح والصبر', meaningNl: 'De Tijd — geloven, goed doen en geduldig zijn', meaningDe: 'Die Zeit — glauben, Gutes tun und geduldig sein', meaningEs: 'El Tiempo — creer, hacer el bien y ser paciente', meaningFr: "Le Temps — croire, faire le bien et être patient" },
];

export function meaningFor(name: SurahEntry): string {
  switch (getLang()) {
    case 'ar': return name.meaningAr;
    case 'nl': return name.meaningNl;
    case 'de': return name.meaningDe;
    case 'es': return name.meaningEs;
    case 'fr': return name.meaningFr;
    default: return name.meaningEn;
  }
}
