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
  hear: string;

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
  trueFalseStatement: (term: string, label: string) => string;

  modeFillBlank: string;

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
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Fiqh Essentials',
    tagline: 'Order the steps of wudu, answer quizzes, or\nmatch each step to its Arabic name.',
    easy: 'Easy · 4',
    medium: 'Medium · 6',
    hard: 'Hard · 8',
    round: (i, total) => `Round ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Well learned, ما شاء الله! 🤲',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Practicing wudu step by step helps these answers stick.',
    hear: '🔊 Hear it',

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
    trueFalseStatement: (term, label) => `${term} means "${label}"`,

    modeFillBlank: '✏️ Fill in the Blank',

    modeSequence: 'Order',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the steps of wudu in the correct order.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rounds with no mistakes`,

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} steps matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} steps learned overall`,
    nextLevelHint: 'Next level starting…',

    modeQuiz: 'Quiz',
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,
  },
  nl: {
    title: 'Fiqh Essentials',
    tagline: 'Zet de stappen van de wudu op volgorde,\nbeantwoord quizvragen of koppel elke stap aan zijn Arabische naam.',
    easy: 'Makkelijk · 4',
    medium: 'Gemiddeld · 6',
    hard: 'Moeilijk · 8',
    round: (i, total) => `Ronde ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Goed geleerd, ما شاء الله! 🤲',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Stap voor stap wudu oefenen helpt om dit te onthouden.',
    hear: '🔊 Uitspraak',

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
    trueFalseStatement: (term, label) => `${term} betekent "${label}"`,

    modeFillBlank: '✏️ Vul de Letter In',

    modeSequence: 'Volgorde',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de stappen van de wudu aan in de juiste volgorde.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondes zonder fouten`,

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} stappen gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} stappen in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',

    modeQuiz: 'Quiz',
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,
  },
  de: {
    title: 'Fiqh Essentials',
    tagline: 'Bring die Schritte der Wudu in die richtige\nReihenfolge, beantworte Quizfragen oder ordne jedem Schritt seinen arabischen Namen zu.',
    easy: 'Leicht · 4',
    medium: 'Mittel · 6',
    hard: 'Schwer · 8',
    round: (i, total) => `Runde ${i} / ${total}`,
    menu: '☰ Menü',
    wellDone: 'Gut gelernt, ما شاء الله! 🤲',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Die Wudu Schritt für Schritt zu üben hilft, sich das zu merken.',
    hear: '🔊 Anhören',

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
    trueFalseStatement: (term, label) => `${term} bedeutet „${label}“`,

    modeFillBlank: '✏️ Buchstabe Einsetzen',

    modeSequence: 'Reihenfolge',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Schritte der Wudu in der richtigen Reihenfolge an.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} Runden ohne Fehler`,

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Schritte zugeordnet in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Schritte insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',

    modeQuiz: 'Quiz',
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,
  },
  es: {
    title: 'Fiqh Essentials',
    tagline: 'Ordena los pasos del wudu, responde preguntas\no empareja cada paso con su nombre árabe.',
    easy: 'Fácil · 4',
    medium: 'Medio · 6',
    hard: 'Difícil · 8',
    round: (i, total) => `Ronda ${i} / ${total}`,
    menu: '☰ Menú',
    wellDone: '¡Bien aprendido, ما شاء الله! 🤲',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Practicar el wudu paso a paso ayuda a recordar estas respuestas.',
    hear: '🔊 Escuchar',

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
    trueFalseStatement: (term, label) => `${term} significa "${label}"`,

    modeFillBlank: '✏️ Completa la Letra',

    modeSequence: 'Orden',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca los pasos del wudu en el orden correcto.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondas sin errores`,

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pasos emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} pasos aprendidos en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',

    modeQuiz: 'Quiz',
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,
  },
  fr: {
    title: 'Fiqh Essentials',
    tagline: 'Mets les étapes du wudu dans le bon ordre,\nréponds à un quiz ou associe chaque étape à son nom arabe.',
    easy: 'Facile · 4',
    medium: 'Moyen · 6',
    hard: 'Difficile · 8',
    round: (i, total) => `Manche ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Bien appris, ما شاء الله ! 🤲',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Pratiquer le wudu étape par étape aide à retenir ces réponses.',
    hear: '🔊 Écouter',

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
    trueFalseStatement: (term, label) => `${term} signifie « ${label} »`,

    modeFillBlank: '✏️ Complète la Lettre',

    modeSequence: 'Ordre',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les étapes du wudu dans le bon ordre.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} manches sans erreur`,

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} étapes associées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} étapes apprises au total`,
    nextLevelHint: 'Le niveau suivant commence…',

    modeQuiz: 'Quiz',
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,
  },
  ar: {
    title: 'Fiqh Essentials',
    tagline: 'رتّب خطوات الوضوء، أجب عن الأسئلة، أو\nطابق كل خطوة باسمها العربي.',
    easy: 'سهل · 4',
    medium: 'متوسط · 6',
    hard: 'صعب · 8',
    round: (i, total) => `الجولة ${i} / ${total}`,
    menu: '☰ القائمة',
    wellDone: 'أحسنت التعلم، ما شاء الله! 🤲',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'التدرب على خطوات الوضوء واحدة تلو الأخرى يساعد على تثبيت هذه الإجابات.',
    hear: '🔊 استمع',

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
    trueFalseStatement: (term, label) => `${term} تعني "${label}"`,

    modeFillBlank: '✏️ أكمل الحرف',

    modeSequence: 'الترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على خطوات الوضوء بالترتيب الصحيح.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} جولة بدون أخطاء`,

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} خطوة تمت مطابقتها في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} خطوة تم تعلمها إجمالًا`,
    nextLevelHint: 'المستوى التالي يبدأ…',

    modeQuiz: 'اختبار',
    score: (n) => `النتيجة: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,
  },
};

export const t = createI18n(STRINGS, getLang);
