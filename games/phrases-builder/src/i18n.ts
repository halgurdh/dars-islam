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

  quizScore: (n: number) => string;
  quizRoundSummary: (score: number, total: number) => string;

  modeListen: string;
  listenReplay: string;

  modeFlashcard: string;
  flashcardProgress: (i: number, total: number) => string;
  flashcardKnowIt: string;
  flashcardStillLearning: string;
  flashcardRoundSummary: (known: number, total: number) => string;

  modeTrueFalse: string;
  trueLabel: string;
  falseLabel: string;
  trueFalseStatement: (name: string, meaning: string) => string;

  modeFillBlank: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    subtitle: 'Phrases Builder',
    tagline: 'Learn everyday Islamic phrases\nby building each one, word by word.',
    itemsLearned: (n, total) => `${n} / ${total} phrases learned`,
    easy: 'Easy · 4 phrases',
    medium: 'Medium · 7 phrases',
    hard: 'Hard · 10 phrases',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} phrases built in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} phrases learned overall`,
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

    modeSequence: 'Word Sort',
    round: (i, total) => `Round ${i} / ${total}`,
    instruction: 'Tap the phrases shortest to longest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',

    quizScore: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeListen: '🔊 Listen',
    listenReplay: '🔊 Tap to hear again',

    modeFlashcard: '🗂️ Review',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ I know it',
    flashcardStillLearning: '↻ Still learning',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marked as known`,

    modeTrueFalse: '✓✗ True/False',
    trueLabel: 'True',
    falseLabel: 'False',
    trueFalseStatement: (name, meaning) => `${name} means "${meaning}"`,

    modeFillBlank: '✏️ Fill in the Blank',
  },
  nl: {
    subtitle: 'Phrases Builder',
    tagline: 'Leer alledaagse islamitische uitdrukkingen\ndoor elke zin woord voor woord op te bouwen.',
    itemsLearned: (n, total) => `${n} / ${total} uitdrukkingen geleerd`,
    easy: 'Makkelijk · 4 uitdrukkingen',
    medium: 'Gemiddeld · 7 uitdrukkingen',
    hard: 'Moeilijk · 10 uitdrukkingen',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} uitdrukkingen gebouwd in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} uitdrukkingen in totaal geleerd`,
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

    modeSequence: 'Woorden Sorteren',
    round: (i, total) => `Ronde ${i} / ${total}`,
    instruction: 'Tik de uitdrukkingen van kort naar lang aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',

    quizScore: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeListen: '🔊 Luisteren',
    listenReplay: '🔊 Tik om opnieuw te horen',

    modeFlashcard: '🗂️ Herhalen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Ik ken dit',
    flashcardStillLearning: '↻ Nog aan het leren',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als gekend gemarkeerd`,

    modeTrueFalse: '✓✗ Waar/Niet waar',
    trueLabel: 'Waar',
    falseLabel: 'Niet waar',
    trueFalseStatement: (name, meaning) => `${name} betekent "${meaning}"`,

    modeFillBlank: '✏️ Vul de Letter In',
  },
  de: {
    subtitle: 'Phrases Builder',
    tagline: 'Lerne alltägliche islamische Redewendungen,\nindem du jede Wort für Wort aufbaust.',
    itemsLearned: (n, total) => `${n} / ${total} Redewendungen gelernt`,
    easy: 'Leicht · 4 Redewendungen',
    medium: 'Mittel · 7 Redewendungen',
    hard: 'Schwer · 10 Redewendungen',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    mistakes: (n) => `Fehler: ${n}`,
    wellDone: 'Gut gemacht! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} Redewendungen gebaut mit ${mistakes} Fehlern\nZeit: ${time}\n${learned} / ${total} Redewendungen insgesamt gelernt`,
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

    modeSequence: 'Wörter Sortieren',
    round: (i, total) => `Runde ${i} / ${total}`,
    instruction: 'Tippe die Redewendungen von kurz nach lang an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',

    quizScore: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeListen: '🔊 Hören',
    listenReplay: '🔊 Tippen zum erneuten Hören',

    modeFlashcard: '🗂️ Wiederholen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Ich kenne es',
    flashcardStillLearning: '↻ Noch am Lernen',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als bekannt markiert`,

    modeTrueFalse: '✓✗ Wahr/Falsch',
    trueLabel: 'Wahr',
    falseLabel: 'Falsch',
    trueFalseStatement: (name, meaning) => `${name} bedeutet „${meaning}“`,

    modeFillBlank: '✏️ Buchstabe Einsetzen',
  },
  es: {
    subtitle: 'Phrases Builder',
    tagline: 'Aprende frases islámicas cotidianas\nconstruyendo cada una, palabra por palabra.',
    itemsLearned: (n, total) => `${n} / ${total} frases aprendidas`,
    easy: 'Fácil · 4 frases',
    medium: 'Medio · 7 frases',
    hard: 'Difícil · 10 frases',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    mistakes: (n) => `Errores: ${n}`,
    wellDone: '¡Bien hecho! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} frases construidas con ${mistakes} errores\nTiempo: ${time}\n${learned} / ${total} frases aprendidas en total`,
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

    modeSequence: 'Orden de Palabras',
    round: (i, total) => `Ronda ${i} / ${total}`,
    instruction: 'Toca las frases de más corta a más larga',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',

    quizScore: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeListen: '🔊 Escuchar',
    listenReplay: '🔊 Toca para escuchar de nuevo',

    modeFlashcard: '🗂️ Repasar',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Lo sé',
    flashcardStillLearning: '↻ Aún aprendiendo',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marcados como conocidos`,

    modeTrueFalse: '✓✗ Verdadero/Falso',
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
    trueFalseStatement: (name, meaning) => `${name} significa "${meaning}"`,

    modeFillBlank: '✏️ Completa la Letra',
  },
  fr: {
    subtitle: 'Phrases Builder',
    tagline: 'Apprenez des phrases islamiques courantes\nen les construisant mot par mot.',
    itemsLearned: (n, total) => `${n} / ${total} phrases apprises`,
    easy: 'Facile · 4 phrases',
    medium: 'Moyen · 7 phrases',
    hard: 'Difficile · 10 phrases',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: "Passer à l'arabe",
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    mistakes: (n) => `Erreurs : ${n}`,
    wellDone: 'Bien joué ! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} phrases construites avec ${mistakes} erreurs\nTemps : ${time}\n${learned} / ${total} phrases apprises au total`,
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

    modeSequence: 'Tri de Mots',
    round: (i, total) => `Manche ${i} / ${total}`,
    instruction: 'Touche les phrases du plus court au plus long',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',

    quizScore: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeListen: '🔊 Écouter',
    listenReplay: '🔊 Touche pour réécouter',

    modeFlashcard: '🗂️ Réviser',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Je le sais',
    flashcardStillLearning: '↻ Encore en apprentissage',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marqués comme connus`,

    modeTrueFalse: '✓✗ Vrai/Faux',
    trueLabel: 'Vrai',
    falseLabel: 'Faux',
    trueFalseStatement: (name, meaning) => `${name} signifie « ${meaning} »`,

    modeFillBlank: '✏️ Complète la Lettre',
  },
  ar: {
    subtitle: 'Phrases Builder',
    tagline: 'تعلّم العبارات الإسلامية اليومية\nمن خلال بناء كل عبارة كلمة كلمة.',
    itemsLearned: (n, total) => `${n} / ${total} عبارات تم تعلّمها`,
    easy: 'سهل · 4 عبارات',
    medium: 'متوسط · 7 عبارات',
    hard: 'صعب · 10 عبارات',
    soundOn: '🔈 الصوت مُفعّل',
    soundOff: '🔇 الصوت متوقف',
    langToggle: 'التبديل إلى الإنجليزية',
    footer: 'بدون موسيقى. المؤثرات الصوتية بسيطة واختيارية.',
    menu: '☰ القائمة',
    mistakes: (n) => `الأخطاء: ${n}`,
    wellDone: 'أحسنت! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `تم بناء ${items} عبارات بـ ${mistakes} أخطاء\nالوقت: ${time}\n${learned} / ${total} عبارات تم تعلّمها إجمالًا`,
    nextLevelHint: 'المستوى التالي يبدأ…',
    hear: '🔊 استمع إليها',
    modeArabic: '🔤 العربية',
    modeToTranslation: '✍️ عربي → المعنى',
    modeToArabic: '🔤 المعنى → عربي',
    typeAnswerPlaceholder: 'اكتب المعنى…',
    checkAnswer: 'تحقق',
    listenAndChoose: '🎧 استمع، ثم اختر الإجابة',

    modeBuilder: 'البناء',
    startBuilder: '▶ تدرب',

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `تمت مطابقة ${pairs} في ${moves} حركة\nالوقت: ${time}`,

    modeSequence: 'ترتيب الكلمات',
    round: (i, total) => `الجولة ${i} / ${total}`,
    instruction: 'اضغط على العبارات من الأقصر إلى الأطول',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',

    quizScore: (n) => `النقاط: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} صحيحة`,

    modeListen: '🔊 استماع',
    listenReplay: '🔊 اضغط للاستماع مرة أخرى',

    modeFlashcard: '🗂️ مراجعة',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ أعرف هذا',
    flashcardStillLearning: '↻ ما زلت أتعلم',
    flashcardRoundSummary: (known, total) => `${known} / ${total} مُعلَّمة كمعروفة`,

    modeTrueFalse: '✓✗ صح/خطأ',
    trueLabel: 'صح',
    falseLabel: 'خطأ',
    trueFalseStatement: (name, meaning) => `${name} تعني "${meaning}"`,

    modeFillBlank: '✏️ أكمل الحرف',
  },
};

export const t = createI18n(STRINGS, getLang);
