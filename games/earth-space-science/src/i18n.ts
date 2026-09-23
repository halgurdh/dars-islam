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

  modeTrueFalse: string;
  trueLabel: string;
  falseLabel: string;
  trueFalseStatement: (planet: string, fact: string) => string;

  modeFillBlank: string;

  modeFlashcard: string;
  flashcardProgress: (i: number, total: number) => string;
  hear: string;
  flashcardKnowIt: string;
  flashcardStillLearning: string;
  flashcardRoundSummary: (known: number, total: number) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Earth & Space Science',
    tagline: 'Order the planets, answer quizzes, or match\neach one to what makes it special.',
    easy: 'Easy · 4',
    medium: 'Medium · 6',
    hard: 'Hard · 8',
    round: (i, total) => `Round ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Stellar work! 🪐',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'My Very Educated Mother Just Served Us Noodles — a classic memory trick for planet order.',

    modeSequence: 'Order',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the planets in order, starting closest to the sun.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rounds with no mistakes`,

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} planets matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} planets learned overall`,
    nextLevelHint: 'Next level starting…',

    modeQuiz: 'Quiz',
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeTrueFalse: '✓✗ True/False',
    trueLabel: 'True',
    falseLabel: 'False',
    trueFalseStatement: (planet, fact) => `${planet} is known for: ${fact}`,

    modeFillBlank: '✏️ Fill in the Blank',

    modeFlashcard: '🗂️ Review',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Hear it',
    flashcardKnowIt: '✓ I know it',
    flashcardStillLearning: '↻ Still learning',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marked as known`,
  },
  nl: {
    title: 'Earth & Space Science',
    tagline: 'Zet de planeten op volgorde, beantwoord\nquizvragen of koppel elke planeet aan wat hem bijzonder maakt.',
    easy: 'Makkelijk · 4',
    medium: 'Gemiddeld · 6',
    hard: 'Moeilijk · 8',
    round: (i, total) => `Ronde ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Stellair werk! 🪐',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Bedenk een eigen ezelsbruggetje voor de volgorde van de planeten — dat helpt echt.',

    modeSequence: 'Volgorde',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de planeten aan op volgorde, beginnend dichtst bij de zon.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondes zonder fouten`,

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} planeten gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} planeten in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',

    modeQuiz: 'Quiz',
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeTrueFalse: '✓✗ Waar/Niet waar',
    trueLabel: 'Waar',
    falseLabel: 'Niet waar',
    trueFalseStatement: (planet, fact) => `${planet} staat bekend om: ${fact}`,

    modeFillBlank: '✏️ Vul het Woord In',

    modeFlashcard: '🗂️ Herhalen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Uitspraak',
    flashcardKnowIt: '✓ Ik ken dit',
    flashcardStillLearning: '↻ Nog aan het leren',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als gekend gemarkeerd`,
  },
  de: {
    title: 'Earth & Space Science',
    tagline: 'Bring die Planeten in die richtige Reihenfolge,\nbeantworte Quizfragen oder ordne jedem seine Besonderheit zu.',
    easy: 'Leicht · 4',
    medium: 'Mittel · 6',
    hard: 'Schwer · 8',
    round: (i, total) => `Runde ${i} / ${total}`,
    menu: '☰ Menü',
    wellDone: 'Stellare Arbeit! 🪐',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Denk dir einen eigenen Merksatz für die Planetenreihenfolge aus — das hilft wirklich.',

    modeSequence: 'Reihenfolge',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Planeten der Reihe nach an, beginnend bei der Sonne.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} Runden ohne Fehler`,

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Planeten zugeordnet in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Planeten insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',

    modeQuiz: 'Quiz',
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeTrueFalse: '✓✗ Wahr/Falsch',
    trueLabel: 'Wahr',
    falseLabel: 'Falsch',
    trueFalseStatement: (planet, fact) => `${planet} ist bekannt für: ${fact}`,

    modeFillBlank: '✏️ Lücke Füllen',

    modeFlashcard: '🗂️ Wiederholen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Anhören',
    flashcardKnowIt: '✓ Ich kenne es',
    flashcardStillLearning: '↻ Noch am Lernen',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als bekannt markiert`,
  },
  es: {
    title: 'Earth & Space Science',
    tagline: 'Ordena los planetas, responde preguntas o\nempareja cada uno con lo que lo hace especial.',
    easy: 'Fácil · 4',
    medium: 'Medio · 6',
    hard: 'Difícil · 8',
    round: (i, total) => `Ronda ${i} / ${total}`,
    menu: '☰ Menú',
    wellDone: '¡Trabajo estelar! 🪐',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Inventa tu propio truco para recordar el orden de los planetas — funciona de verdad.',

    modeSequence: 'Orden',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca los planetas en orden, empezando por el más cercano al sol.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondas sin errores`,

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} planetas emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} planetas aprendidos en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',

    modeQuiz: 'Quiz',
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeTrueFalse: '✓✗ Verdadero/Falso',
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
    trueFalseStatement: (planet, fact) => `${planet} es conocido por: ${fact}`,

    modeFillBlank: '✏️ Completa el Espacio',

    modeFlashcard: '🗂️ Repasar',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Escuchar',
    flashcardKnowIt: '✓ Lo sé',
    flashcardStillLearning: '↻ Aún aprendiendo',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marcadas como conocidas`,
  },
  fr: {
    title: 'Earth & Space Science',
    tagline: 'Mets les planètes en ordre, réponds à un\nquiz ou associe chacune à ce qui la rend spéciale.',
    easy: 'Facile · 4',
    medium: 'Moyen · 6',
    hard: 'Difficile · 8',
    round: (i, total) => `Manche ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Travail stellaire ! 🪐',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: "Invente ton propre moyen mnémotechnique pour l'ordre des planètes — ça marche vraiment.",

    modeSequence: 'Ordre',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: "Touche les planètes dans l'ordre, en commençant par la plus proche du soleil.",
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} manches sans erreur`,

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} planètes associées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} planètes apprises au total`,
    nextLevelHint: 'Le niveau suivant commence…',

    modeQuiz: 'Quiz',
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeTrueFalse: '✓✗ Vrai/Faux',
    trueLabel: 'Vrai',
    falseLabel: 'Faux',
    trueFalseStatement: (planet, fact) => `${planet} est connu pour : ${fact}`,

    modeFillBlank: '✏️ Complète le Mot',

    modeFlashcard: '🗂️ Réviser',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Écouter',
    flashcardKnowIt: '✓ Je le sais',
    flashcardStillLearning: '↻ En apprentissage',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marquées comme connues`,
  },
  ar: {
    title: 'Earth & Space Science',
    tagline: 'رتّب الكواكب، أجب عن الأسئلة، أو طابق\nكل كوكب بما يميزه.',
    easy: 'سهل · 4',
    medium: 'متوسط · 6',
    hard: 'صعب · 8',
    round: (i, total) => `الجولة ${i} / ${total}`,
    menu: '☰ القائمة',
    wellDone: 'عمل رائع! 🪐',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'ابتكر طريقتك الخاصة لتذكر ترتيب الكواكب — إنها تساعد فعلًا.',

    modeSequence: 'الترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الكواكب بالترتيب، بدءًا من الأقرب إلى الشمس.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} جولة بدون أخطاء`,

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} كوكب تمت مطابقته في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} كوكب تم تعلمه إجمالًا`,
    nextLevelHint: 'المستوى التالي يبدأ…',

    modeQuiz: 'اختبار',
    score: (n) => `النتيجة: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeTrueFalse: '✓✗ صح/خطأ',
    trueLabel: 'صح',
    falseLabel: 'خطأ',
    trueFalseStatement: (planet, fact) => `${planet} معروف بـ: ${fact}`,

    modeFillBlank: '✏️ أكمل الفراغ',

    modeFlashcard: '🗂️ مراجعة',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 استمع',
    flashcardKnowIt: '✓ أعرف هذا',
    flashcardStillLearning: '↻ ما زلت أتعلم',
    flashcardRoundSummary: (known, total) => `${known} / ${total} تم وضع علامة معروف عليها`,
  },
};

export const t = createI18n(STRINGS, getLang);
