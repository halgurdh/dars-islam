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

// The 12 months of the Islamic (Hijri) calendar, in order — the array's own
// order carries the sequence, deliberately not spelled out as "1st month" /
// "2nd month" inside the meaning text itself. `meaning` is used verbatim as
// the typed answer to check against in 'toTranslation' mode (see
// shared/builder-typing.ts's isCorrectAnswer) and shown as a direct clue in
// the other two modes — an ordinal baked into that text would force the
// player to type the month's number to pass, and would hand them the
// round's ordering for free as a side effect of just reading a clue.
export const MONTHS: BuilderItem[] = [
  { id: 1, arabic: 'مُحَرَّم', transliteration: 'Muharram', meaningEn: 'one of the four sacred months; includes the Day of Ashura', meaningAr: 'أحد الأشهر الحرم الأربعة، ويشمل يوم عاشوراء', meaningNl: 'een van de vier heilige maanden; bevat de Dag van Ashura', meaningDe: 'einer der vier heiligen Monate; enthält den Tag von Aschura', meaningEs: 'uno de los cuatro meses sagrados; incluye el Día de Ashura', meaningFr: "l'un des quatre mois sacrés ; comprend le jour d'Achoura" },
  { id: 2, arabic: 'صَفَر', transliteration: 'Safar', meaningEn: "comes right after Muharram; its Arabic name means 'empty'", meaningAr: "يأتي مباشرة بعد محرم، ويعني اسمه بالعربية 'الخالي'", meaningNl: "komt direct na Muharram; de Arabische naam betekent 'leeg'", meaningDe: 'folgt direkt auf Muharram; der arabische Name bedeutet „leer"', meaningEs: "viene justo después de Muharram; su nombre árabe significa 'vacío'", meaningFr: 'vient juste après Mouharram ; son nom arabe signifie « vide »' },
  { id: 3, arabic: 'رَبِيع الْأَوَّل', transliteration: 'Rabi al-Awwal', meaningEn: 'traditionally linked to the birth of the Prophet Muhammad ﷺ', meaningAr: 'يرتبط تقليديًا بمولد النبي محمد ﷺ', meaningNl: 'traditioneel verbonden met de geboorte van de Profeet Mohammed ﷺ', meaningDe: 'traditionell mit der Geburt des Propheten Muhammad ﷺ verbunden', meaningEs: 'tradicionalmente vinculado al nacimiento del Profeta Muhammad ﷺ', meaningFr: 'traditionnellement associé à la naissance du Prophète Muhammad ﷺ' },
  { id: 4, arabic: 'رَبِيع الْآخِر', transliteration: 'Rabi al-Akhir', meaningEn: "the second of the two 'Rabi' months", meaningAr: "الثاني من شهري 'ربيع'", meaningNl: "de tweede van de twee 'Rabi'-maanden", meaningDe: 'der zweite der beiden „Rabi"-Monate', meaningEs: "el segundo de los dos meses 'Rabi'", meaningFr: 'le second des deux mois « Rabi »' },
  { id: 5, arabic: 'جُمَادَى الْأُولَى', transliteration: 'Jumada al-Ula', meaningEn: "the first of the two 'Jumada' months", meaningAr: "الأول من شهري 'جمادى'", meaningNl: "de eerste van de twee 'Jumada'-maanden", meaningDe: 'der erste der beiden „Dschumada"-Monate', meaningEs: "el primero de los dos meses 'Jumada'", meaningFr: 'le premier des deux mois « Joumada »' },
  { id: 6, arabic: 'جُمَادَى الْآخِرَة', transliteration: 'Jumada al-Akhirah', meaningEn: "the second of the two 'Jumada' months", meaningAr: "الثاني من شهري 'جمادى'", meaningNl: "de tweede van de twee 'Jumada'-maanden", meaningDe: 'der zweite der beiden „Dschumada"-Monate', meaningEs: "el segundo de los dos meses 'Jumada'", meaningFr: 'le second des deux mois « Joumada »' },
  { id: 7, arabic: 'رَجَب', transliteration: 'Rajab', meaningEn: 'one of the four sacred months', meaningAr: 'أحد الأشهر الحرم الأربعة', meaningNl: 'een van de vier heilige maanden', meaningDe: 'einer der vier heiligen Monate', meaningEs: 'uno de los cuatro meses sagrados', meaningFr: "l'un des quatre mois sacrés" },
  { id: 8, arabic: 'شَعْبَان', transliteration: 'Shaban', meaningEn: 'the month before Ramadan, when many Muslims fast more often', meaningAr: 'الشهر الذي يسبق رمضان، يكثر فيه كثير من المسلمين من الصيام', meaningNl: 'de maand voor Ramadan, waarin veel moslims meer gaan vasten', meaningDe: 'der Monat vor Ramadan, in dem viele Muslime vermehrt fasten', meaningEs: 'el mes antes de Ramadán, cuando muchos musulmanes ayunan más', meaningFr: 'le mois avant le Ramadan, où de nombreux musulmans jeûnent davantage' },
  { id: 9, arabic: 'رَمَضَان', transliteration: 'Ramadan', meaningEn: 'the month of fasting', meaningAr: 'شهر الصيام', meaningNl: 'de vastenmaand', meaningDe: 'der Monat des Fastens', meaningEs: 'el mes del ayuno', meaningFr: 'le mois du jeûne' },
  { id: 10, arabic: 'شَوَّال', transliteration: 'Shawwal', meaningEn: 'the month right after Ramadan; includes the Eid al-Fitr celebration', meaningAr: 'الشهر الذي يلي رمضان مباشرة، ويشمل عيد الفطر', meaningNl: 'de maand direct na Ramadan; bevat het Eid al-Fitr-feest', meaningDe: 'der Monat direkt nach Ramadan; enthält das Fest Eid al-Fitr', meaningEs: 'el mes justo después de Ramadán; incluye la celebración de Eid al-Fitr', meaningFr: "le mois juste après le Ramadan ; comprend la fête de l'Aïd al-Fitr" },
  { id: 11, arabic: 'ذُو الْقَعْدَة', transliteration: 'Dhul-Qadah', meaningEn: 'one of the four sacred months', meaningAr: 'أحد الأشهر الحرم الأربعة', meaningNl: 'een van de vier heilige maanden', meaningDe: 'einer der vier heiligen Monate', meaningEs: 'uno de los cuatro meses sagrados', meaningFr: "l'un des quatre mois sacrés" },
  { id: 12, arabic: 'ذُو الْحِجَّة', transliteration: 'Dhul-Hijjah', meaningEn: 'the month of Hajj', meaningAr: 'شهر الحج', meaningNl: 'de maand van de Hajj', meaningDe: 'der Monat der Hadsch', meaningEs: 'el mes del Hajj', meaningFr: 'le mois du Hajj' },
];
