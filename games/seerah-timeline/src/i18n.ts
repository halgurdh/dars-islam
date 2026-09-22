import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  round: (i: number, total: number) => string;
  menu: string;
  wellDone: string;
  playAgain: string;
  backToMenu: string;
  footer: string;

  modeSequence: string;
  mistakes: (n: number) => string;
  instruction: string;
  roundSummary: (perfectRounds: number, totalRounds: number) => string;

  modeMatch: string;
  moves: (n: number) => string;
  matchRoundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;

  modeQuiz: string;
  score: (n: number) => string;
  quizRoundSummary: (score: number, total: number) => string;

  hear: string;

  modeFlashcard: string;
  flashcardProgress: (i: number, total: number) => string;
  flashcardKnowIt: string;
  flashcardStillLearning: string;
  flashcardRoundSummary: (known: number, total: number) => string;

  modeTrueFalse: string;
  trueLabel: string;
  falseLabel: string;
  trueFalseStatement: (label: string, era: string) => string;

  modeFillBlank: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Seerah Timeline',
    tagline: 'Order events, answer quizzes, or match them to\ntheir era — three ways to learn the Seerah.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    round: (i, total) => `Round ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Excellent, ما شاء الله! 📖',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Think about what had to happen first — the order usually makes sense once you do.',

    modeSequence: 'Order',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the events in the order they happened.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rounds with no mistakes`,

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} events matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} events learned overall`,
    nextLevelHint: 'Next level starting…',

    modeQuiz: 'Quiz',
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    hear: '🔊 Hear it',

    modeFlashcard: '🗂️ Review',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ I know it',
    flashcardStillLearning: '↻ Still learning',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marked as known`,

    modeTrueFalse: '✓✗ True/False',
    trueLabel: 'True',
    falseLabel: 'False',
    trueFalseStatement: (label, era) => `"${label}" happened in ${era}`,

    modeFillBlank: '✏️ Fill in the Blank',
  },
  nl: {
    title: 'Seerah Timeline',
    tagline: 'Zet gebeurtenissen op volgorde, beantwoord\nquizvragen of koppel ze aan hun tijdperk.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    round: (i, total) => `Ronde ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Uitstekend, ما شاء الله! 📖',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Denk na over wat eerst moest gebeuren — de volgorde is dan vaak logisch.',

    modeSequence: 'Volgorde',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de gebeurtenissen aan in de volgorde waarin ze gebeurden.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondes zonder fouten`,

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} gebeurtenissen gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',

    modeQuiz: 'Quiz',
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    hear: '🔊 Uitspraak',

    modeFlashcard: '🗂️ Herhalen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Ik ken dit',
    flashcardStillLearning: '↻ Nog aan het leren',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als gekend gemarkeerd`,

    modeTrueFalse: '✓✗ Waar/Niet waar',
    trueLabel: 'Waar',
    falseLabel: 'Niet waar',
    trueFalseStatement: (label, era) => `"${label}" gebeurde in ${era}`,

    modeFillBlank: '✏️ Vul de Letter In',
  },
  de: {
    title: 'Seerah Timeline',
    tagline: 'Bring Ereignisse in die richtige Reihenfolge,\nbeantworte Quizfragen oder ordne sie ihrer Epoche zu.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    round: (i, total) => `Runde ${i} / ${total}`,
    menu: '☰ Menü',
    wellDone: 'Ausgezeichnet, ما شاء الله! 📖',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Überlege, was zuerst passieren musste — die Reihenfolge ergibt dann meist Sinn.',

    modeSequence: 'Reihenfolge',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Ereignisse in der Reihenfolge an, in der sie geschahen.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} Runden ohne Fehler`,

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Ereignisse zugeordnet in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',

    modeQuiz: 'Quiz',
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    hear: '🔊 Anhören',

    modeFlashcard: '🗂️ Wiederholen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Ich kenne es',
    flashcardStillLearning: '↻ Noch am Lernen',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als bekannt markiert`,

    modeTrueFalse: '✓✗ Wahr/Falsch',
    trueLabel: 'Wahr',
    falseLabel: 'Falsch',
    trueFalseStatement: (label, era) => `„${label}“ geschah im Jahr ${era}`,

    modeFillBlank: '✏️ Buchstabe Einsetzen',
  },
  es: {
    title: 'Seerah Timeline',
    tagline: 'Ordena eventos, responde preguntas o\nempareja cada uno con su época.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    round: (i, total) => `Ronda ${i} / ${total}`,
    menu: '☰ Menú',
    wellDone: '¡Excelente, ما شاء الله! 📖',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Piensa en qué tuvo que pasar primero — el orden suele tener sentido así.',

    modeSequence: 'Orden',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca los eventos en el orden en que ocurrieron.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondas sin errores`,

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} eventos emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} aprendidos en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',

    modeQuiz: 'Quiz',
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    hear: '🔊 Escuchar',

    modeFlashcard: '🗂️ Repasar',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Lo sé',
    flashcardStillLearning: '↻ Aún aprendiendo',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marcados como conocidos`,

    modeTrueFalse: '✓✗ Verdadero/Falso',
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
    trueFalseStatement: (label, era) => `"${label}" ocurrió en ${era}`,

    modeFillBlank: '✏️ Completa la Letra',
  },
  fr: {
    title: 'Seerah Timeline',
    tagline: "Mets des événements en ordre, réponds à un\nquiz ou associe-les à leur époque.",
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    round: (i, total) => `Manche ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Excellent, ما شاء الله ! 📖',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Pense à ce qui devait se passer en premier — l\'ordre a alors du sens.',

    modeSequence: 'Ordre',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les événements dans l\'ordre où ils se sont produits.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} manches sans erreur`,

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} événements associés en ${moves} coups\nTemps : ${time}\n${learned} / ${total} appris au total`,
    nextLevelHint: 'Le niveau suivant commence…',

    modeQuiz: 'Quiz',
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    hear: '🔊 Écouter',

    modeFlashcard: '🗂️ Réviser',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ Je le sais',
    flashcardStillLearning: '↻ Encore en apprentissage',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marqués comme connus`,

    modeTrueFalse: '✓✗ Vrai/Faux',
    trueLabel: 'Vrai',
    falseLabel: 'Faux',
    trueFalseStatement: (label, era) => `« ${label} » a eu lieu en ${era}`,

    modeFillBlank: '✏️ Complète la Lettre',
  },
  ar: {
    title: 'Seerah Timeline',
    tagline: 'رتّب الأحداث، أجب عن أسئلة الاختبار، أو طابقها\nمع حقبتها الزمنية — ثلاث طرق لتعلّم السيرة.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    round: (i, total) => `الجولة ${i} / ${total}`,
    menu: '☰ القائمة',
    wellDone: 'ممتاز، ما شاء الله! 📖',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'فكّر فيما كان يجب أن يحدث أولًا — عادةً يصبح الترتيب منطقيًا بعد ذلك.',

    modeSequence: 'ترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الأحداث بالترتيب الذي وقعت فيه.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} جولات بدون أخطاء`,

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} أحداث تمت مطابقتها في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} أحداث تم تعلّمها إجمالًا`,
    nextLevelHint: 'المستوى التالي يبدأ…',

    modeQuiz: 'اختبار',
    score: (n) => `النتيجة: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابات صحيحة`,

    hear: '🔊 استمع',

    modeFlashcard: '🗂️ مراجعة',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    flashcardKnowIt: '✓ أعرف هذا',
    flashcardStillLearning: '↻ ما زلت أتعلم',
    flashcardRoundSummary: (known, total) => `${known} / ${total} مُعلَّمة كمعروفة`,

    modeTrueFalse: '✓✗ صح/خطأ',
    trueLabel: 'صح',
    falseLabel: 'خطأ',
    trueFalseStatement: (label, era) => `"${label}" حدث في ${era}`,

    modeFillBlank: '✏️ أكمل الحرف',
  },
};

export const t = createI18n(STRINGS, getLang);
