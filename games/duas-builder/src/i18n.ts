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
    subtitle: 'Duas Builder',
    tagline: 'Learn short daily duas\nby building each one, word by word.',
    itemsLearned: (n, total) => `${n} / ${total} duas learned`,
    easy: 'Easy · 4 duas',
    medium: 'Medium · 7 duas',
    hard: 'Hard · 10 duas',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} duas built in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} duas learned overall`,
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
    instruction: 'Tap the duas in the order of a daily routine',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
  },
  nl: {
    subtitle: 'Duas Builder',
    tagline: 'Leer korte dagelijkse smeekbeden (dua’s)\ndoor elke zin woord voor woord op te bouwen.',
    itemsLearned: (n, total) => `${n} / ${total} smeekbeden geleerd`,
    easy: 'Makkelijk · 4 smeekbeden',
    medium: 'Gemiddeld · 7 smeekbeden',
    hard: 'Moeilijk · 10 smeekbeden',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} smeekbeden gebouwd in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} smeekbeden in totaal geleerd`,
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
    instruction: 'Tik de smeekbeden aan in de volgorde van een dagelijkse routine',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
  },
  de: {
    subtitle: 'Duas Builder',
    tagline: 'Lerne kurze tägliche Bittgebete (Duas),\nindem du jedes Wort für Wort aufbaust.',
    itemsLearned: (n, total) => `${n} / ${total} Bittgebete gelernt`,
    easy: 'Leicht · 4 Bittgebete',
    medium: 'Mittel · 7 Bittgebete',
    hard: 'Schwer · 10 Bittgebete',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    mistakes: (n) => `Fehler: ${n}`,
    wellDone: 'Gut gemacht! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} Bittgebete gebaut mit ${mistakes} Fehlern\nZeit: ${time}\n${learned} / ${total} Bittgebete insgesamt gelernt`,
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
    instruction: 'Tippe die Bittgebete in der Reihenfolge einer täglichen Routine an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
  },
  es: {
    subtitle: 'Duas Builder',
    tagline: 'Aprende breves súplicas diarias (duas)\nconstruyendo cada una, palabra por palabra.',
    itemsLearned: (n, total) => `${n} / ${total} súplicas aprendidas`,
    easy: 'Fácil · 4 súplicas',
    medium: 'Medio · 7 súplicas',
    hard: 'Difícil · 10 súplicas',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    mistakes: (n) => `Errores: ${n}`,
    wellDone: '¡Bien hecho! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} súplicas construidas con ${mistakes} errores\nTiempo: ${time}\n${learned} / ${total} súplicas aprendidas en total`,
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
    matchRoundSummary: (pairs, moves, time) => `${pairs} emparejadas en ${moves} movimientos\nTiempo: ${time}`,

    modeSequence: 'Orden',
    round: (i, total) => `Ronda ${i} / ${total}`,
    instruction: 'Toca las súplicas en el orden de una rutina diaria',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
  },
  fr: {
    subtitle: 'Duas Builder',
    tagline: 'Apprends de courtes invocations quotidiennes (duas)\nen les construisant mot par mot.',
    itemsLearned: (n, total) => `${n} / ${total} duas apprises`,
    easy: 'Facile · 4 duas',
    medium: 'Moyen · 7 duas',
    hard: 'Difficile · 10 duas',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: "Passer à l'arabe",
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    mistakes: (n) => `Erreurs : ${n}`,
    wellDone: 'Bien joué ! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} duas construites avec ${mistakes} erreurs\nTemps : ${time}\n${learned} / ${total} duas apprises au total`,
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
    matchRoundSummary: (pairs, moves, time) => `${pairs} associées en ${moves} coups\nTemps : ${time}`,

    modeSequence: 'Ordre',
    round: (i, total) => `Manche ${i} / ${total}`,
    instruction: "Touche les duas dans l'ordre d'une routine quotidienne",
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
  },
  ar: {
    subtitle: 'Duas Builder',
    tagline: 'تعلّم أدعية يومية قصيرة\nمن خلال بناء كل دعاء، كلمة كلمة.',
    itemsLearned: (n, total) => `${n} / ${total} دعاء تم تعلمه`,
    easy: 'سهل · 4 أدعية',
    medium: 'متوسط · 7 أدعية',
    hard: 'صعب · 10 أدعية',
    soundOn: '🔈 الصوت يعمل',
    soundOff: '🔇 الصوت متوقف',
    langToggle: 'التبديل إلى الإنجليزية',
    footer: 'بدون موسيقى. المؤثرات الصوتية بسيطة واختيارية.',
    menu: '☰ القائمة',
    mistakes: (n) => `الأخطاء: ${n}`,
    wellDone: 'أحسنت! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} دعاء تم بناؤه بـ ${mistakes} أخطاء\nالوقت: ${time}\n${learned} / ${total} دعاء تم تعلمه إجمالًا`,
    nextLevelHint: 'المستوى التالي يبدأ…',
    hear: '🔊 استمع إليه',
    modeArabic: '🔤 عربي',
    modeToTranslation: '✍️ عربي → المعنى',
    modeToArabic: '🔤 المعنى → عربي',
    typeAnswerPlaceholder: 'اكتب المعنى…',
    checkAnswer: 'تحقق',
    listenAndChoose: '🎧 استمع، ثم اختر الإجابة',

    modeBuilder: 'البناء',
    startBuilder: '▶ تدرّب',

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} تمت مطابقتها في ${moves} حركة\nالوقت: ${time}`,

    modeSequence: 'الترتيب',
    round: (i, total) => `الجولة ${i} / ${total}`,
    instruction: 'اضغط على الأدعية بترتيب الروتين اليومي',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولة مثالية`,
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
  },
};

export const t = createI18n(STRINGS, getLang);
