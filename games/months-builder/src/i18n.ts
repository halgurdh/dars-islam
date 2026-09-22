import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  subtitle: string;
  tagline: string;
  itemsLearned: (n: number, total: number) => string;
  easy: string;
  medium: string;
  hard: string;
  soundOn: string;
  soundOff: string;
  langToggle: string;
  footer: string;
  menu: string;
  mistakes: (n: number) => string;
  wellDone: string;
  roundSummary: (items: number, mistakes: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;
  hear: string;
  modeArabic: string;
  modeToTranslation: string;
  modeToArabic: string;
  typeAnswerPlaceholder: string;
  checkAnswer: string;
  listenAndChoose: string;

  modeBuilder: string;
  startBuilder: string;

  modeMatch: string;
  moves: (n: number) => string;
  matchRoundSummary: (pairs: number, moves: number, time: string) => string;

  modeSequence: string;
  round: (i: number, total: number) => string;
  instruction: string;
  sequenceRoundSummary: (perfect: number, total: number) => string;
  playAgain: string;
  backToMenu: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    subtitle: 'Months Builder',
    tagline: 'Learn the 12 Islamic months\nby spelling each one.',
    itemsLearned: (n, total) => `${n} / ${total} months learned`,
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} months spelled in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} months learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
    modeArabic: '🔤 Arabic',
    modeToTranslation: '✍️ AR → EN',
    modeToArabic: '🔤 EN → AR',
    typeAnswerPlaceholder: 'Type the meaning…',
    checkAnswer: 'Check',
    listenAndChoose: '🎧 Listen, then choose the answer',

    modeBuilder: 'Builder',
    startBuilder: '▶ Practice',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} matched in ${moves} moves\nTime: ${time}`,

    modeSequence: 'Order',
    round: (i, total) => `Round ${i} / ${total}`,
    instruction: 'Tap the months in calendar order',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
  },
  nl: {
    subtitle: 'Months Builder',
    tagline: 'Leer de 12 islamitische maanden\ndoor elke maand te spellen.',
    itemsLearned: (n, total) => `${n} / ${total} maanden geleerd`,
    easy: 'Makkelijk',
    medium: 'Gemiddeld',
    hard: 'Moeilijk',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} maanden gespeld in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} maanden in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
    modeArabic: '🔤 Arabisch',
    modeToTranslation: '✍️ AR → NL',
    modeToArabic: '🔤 NL → AR',
    typeAnswerPlaceholder: 'Typ de betekenis…',
    checkAnswer: 'Controleer',
    listenAndChoose: '🎧 Luister en kies het antwoord',

    modeBuilder: 'Bouwen',
    startBuilder: '▶ Oefenen',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} gematcht in ${moves} zetten\nTijd: ${time}`,

    modeSequence: 'Volgorde',
    round: (i, total) => `Ronde ${i} / ${total}`,
    instruction: 'Tik de maanden aan in kalendervolgorde',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
  },
  de: {
    subtitle: 'Months Builder',
    tagline: 'Lerne die 12 islamischen Monate,\nindem du jeden buchstabierst.',
    itemsLearned: (n, total) => `${n} / ${total} Monate gelernt`,
    easy: 'Leicht',
    medium: 'Mittel',
    hard: 'Schwer',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    mistakes: (n) => `Fehler: ${n}`,
    wellDone: 'Gut gemacht! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} Monate buchstabiert mit ${mistakes} Fehlern\nZeit: ${time}\n${learned} / ${total} Monate insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',
    hear: '🔊 Anhören',
    modeArabic: '🔤 Arabisch',
    modeToTranslation: '✍️ AR → DE',
    modeToArabic: '🔤 DE → AR',
    typeAnswerPlaceholder: 'Bedeutung eingeben…',
    checkAnswer: 'Prüfen',
    listenAndChoose: '🎧 Hör zu und wähle die Antwort',

    modeBuilder: 'Bauen',
    startBuilder: '▶ Üben',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} gefunden in ${moves} Zügen\nZeit: ${time}`,

    modeSequence: 'Reihenfolge',
    round: (i, total) => `Runde ${i} / ${total}`,
    instruction: 'Tippe die Monate in Kalenderreihenfolge an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
  },
  es: {
    subtitle: 'Months Builder',
    tagline: 'Aprende los 12 meses islámicos\ndeletreando cada uno.',
    itemsLearned: (n, total) => `${n} / ${total} meses aprendidos`,
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    mistakes: (n) => `Errores: ${n}`,
    wellDone: '¡Bien hecho! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} meses deletreados con ${mistakes} errores\nTiempo: ${time}\n${learned} / ${total} meses aprendidos en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',
    hear: '🔊 Escuchar',
    modeArabic: '🔤 Árabe',
    modeToTranslation: '✍️ AR → ES',
    modeToArabic: '🔤 ES → AR',
    typeAnswerPlaceholder: 'Escribe el significado…',
    checkAnswer: 'Comprobar',
    listenAndChoose: '🎧 Escucha y elige la respuesta',

    modeBuilder: 'Construir',
    startBuilder: '▶ Practicar',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} emparejados en ${moves} movimientos\nTiempo: ${time}`,

    modeSequence: 'Orden',
    round: (i, total) => `Ronda ${i} / ${total}`,
    instruction: 'Toca los meses en orden del calendario',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
  },
  fr: {
    subtitle: 'Months Builder',
    tagline: 'Apprenez les 12 mois islamiques\nen épelant chacun.',
    itemsLearned: (n, total) => `${n} / ${total} mois appris`,
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: 'Passer à l’arabe',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    mistakes: (n) => `Erreurs : ${n}`,
    wellDone: 'Bien joué ! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} mois épelés avec ${mistakes} erreurs\nTemps : ${time}\n${learned} / ${total} mois appris au total`,
    nextLevelHint: 'Le niveau suivant commence…',
    hear: '🔊 Écouter',
    modeArabic: '🔤 Arabe',
    modeToTranslation: '✍️ AR → FR',
    modeToArabic: '🔤 FR → AR',
    typeAnswerPlaceholder: 'Tapez la signification…',
    checkAnswer: 'Vérifier',
    listenAndChoose: '🎧 Écoute, puis choisis la réponse',

    modeBuilder: 'Construction',
    startBuilder: '▶ Pratiquer',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} associés en ${moves} coups\nTemps : ${time}`,

    modeSequence: 'Ordre',
    round: (i, total) => `Manche ${i} / ${total}`,
    instruction: "Touche les mois dans l'ordre du calendrier",
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
  },
  ar: {
    subtitle: 'Months Builder',
    tagline: 'تعلّم الأشهر الهجرية الاثني عشر\nبتهجئة كل واحد منها.',
    itemsLearned: (n, total) => `${n} / ${total} أشهر تم تعلمها`,
    easy: 'سهل',
    medium: 'متوسط',
    hard: 'صعب',
    soundOn: '🔈 الصوت مفعّل',
    soundOff: '🔇 الصوت متوقف',
    langToggle: 'التبديل إلى الإنجليزية',
    footer: 'بدون موسيقى. المؤثرات الصوتية قليلة واختيارية.',
    menu: '☰ القائمة',
    mistakes: (n) => `الأخطاء: ${n}`,
    wellDone: 'أحسنت! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} أشهر تمت تهجئتها بـ ${mistakes} أخطاء\nالوقت: ${time}\n${learned} / ${total} أشهر تم تعلمها إجمالًا`,
    nextLevelHint: 'المستوى التالي يبدأ…',
    hear: '🔊 استمع إليها',
    modeArabic: '🔤 العربية',
    modeToTranslation: '✍️ عربي → المعنى',
    modeToArabic: '🔤 المعنى → عربي',
    typeAnswerPlaceholder: 'اكتب المعنى…',
    checkAnswer: 'تحقق',
    listenAndChoose: '🎧 استمع، ثم اختر الإجابة',

    modeBuilder: 'بناء',
    startBuilder: '▶ تدرّب',

    modeMatch: 'طابق',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} تمت مطابقتها في ${moves} حركة\nالوقت: ${time}`,

    modeSequence: 'ترتيب',
    round: (i, total) => `الجولة ${i} / ${total}`,
    instruction: 'اضغط على الأشهر بترتيب التقويم',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة للقائمة',
  },
};

export const t = createI18n(STRINGS, getLang);
