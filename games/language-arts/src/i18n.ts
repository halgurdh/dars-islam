import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  menu: string;
  playAgain: string;
  wellDone: string;
  footer: string;

  modeMatch: string;
  moves: (n: number) => string;
  matchRoundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;

  modeQuiz: string;
  round: (i: number, total: number) => string;
  score: (n: number) => string;
  quizRoundSummary: (score: number, total: number) => string;

  modeSequence: string;
  mistakes: (n: number) => string;
  instruction: string;
  sequenceRoundSummary: (perfect: number, total: number) => string;

  modeTrueFalse: string;
  trueLabel: string;
  falseLabel: string;
  trueFalseStatement: (a: string, b: string) => string;

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
    title: 'Language Arts',
    tagline: 'Match words to synonyms, answer quizzes, or\nsort them shortest to longest.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Word wizard! ✏️',
    footer: 'Say each word out loud — your ear often knows the synonym first.',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} words learned overall`,
    nextLevelHint: 'Next round starting…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Word Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the words shortest to longest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    modeTrueFalse: '✓✗ True/False',
    trueLabel: 'True',
    falseLabel: 'False',
    trueFalseStatement: (a, b) => `"${a}" and "${b}" are synonyms`,

    modeFillBlank: '✏️ Fill in the Blank',

    modeFlashcard: '🗂️ Review',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Hear it',
    flashcardKnowIt: '✓ I know it',
    flashcardStillLearning: '↻ Still learning',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marked as known`,
  },
  nl: {
    title: 'Language Arts',
    tagline: 'Koppel woorden aan synoniemen, beantwoord\nquizvragen of sorteer van kort naar lang.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Woordwonder! ✏️',
    footer: 'Zeg elk woord hardop — je oor weet het synoniem vaak als eerste.',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} woorden in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Vraag ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Woorden Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de woorden van kort naar lang aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    modeTrueFalse: '✓✗ Waar/Niet waar',
    trueLabel: 'Waar',
    falseLabel: 'Niet waar',
    trueFalseStatement: (a, b) => `"${a}" en "${b}" zijn synoniemen`,

    modeFillBlank: '✏️ Vul het Woord In',

    modeFlashcard: '🗂️ Herhalen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Uitspraak',
    flashcardKnowIt: '✓ Ik ken dit',
    flashcardStillLearning: '↻ Nog aan het leren',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als gekend gemarkeerd`,
  },
  de: {
    title: 'Language Arts',
    tagline: 'Ordne Wörtern ihr Synonym zu, beantworte\nQuizfragen oder sortiere von kurz nach lang.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Wortzauberer! ✏️',
    footer: 'Sprich jedes Wort laut aus — dein Ohr kennt das Synonym oft zuerst.',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Wörter insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Frage ${i}/${total}`,
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Wörter Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Wörter von kurz nach lang an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    modeTrueFalse: '✓✗ Wahr/Falsch',
    trueLabel: 'Wahr',
    falseLabel: 'Falsch',
    trueFalseStatement: (a, b) => `„${a}" und „${b}" sind Synonyme`,

    modeFillBlank: '✏️ Lücke Füllen',

    modeFlashcard: '🗂️ Wiederholen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Anhören',
    flashcardKnowIt: '✓ Ich kenne es',
    flashcardStillLearning: '↻ Noch am Lernen',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als bekannt markiert`,
  },
  es: {
    title: 'Language Arts',
    tagline: 'Empareja palabras con sinónimos, responde\npreguntas u ordénalas de corta a larga.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Mago de las palabras! ✏️',
    footer: 'Di cada palabra en voz alta — tu oído suele reconocer el sinónimo primero.',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} palabras aprendidas en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Pregunta ${i}/${total}`,
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden de Palabras',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca las palabras de más corta a más larga',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    modeTrueFalse: '✓✗ Verdadero/Falso',
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
    trueFalseStatement: (a, b) => `"${a}" y "${b}" son sinónimos`,

    modeFillBlank: '✏️ Completa el Espacio',

    modeFlashcard: '🗂️ Repasar',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Escuchar',
    flashcardKnowIt: '✓ Lo sé',
    flashcardStillLearning: '↻ Aún aprendiendo',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marcadas como conocidas`,
  },
  fr: {
    title: 'Language Arts',
    tagline: 'Associe des mots à leurs synonymes, réponds\nà un quiz ou trie du plus court au plus long.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Magicien des mots ! ✏️',
    footer: "Dis chaque mot à voix haute — l'oreille reconnaît souvent le synonyme en premier.",

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} mots appris au total`,
    nextLevelHint: 'La manche suivante commence…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Tri de Mots',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les mots du plus court au plus long',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    modeTrueFalse: '✓✗ Vrai/Faux',
    trueLabel: 'Vrai',
    falseLabel: 'Faux',
    trueFalseStatement: (a, b) => `« ${a} » et « ${b} » sont des synonymes`,

    modeFillBlank: '✏️ Complète le Mot',

    modeFlashcard: '🗂️ Réviser',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Écouter',
    flashcardKnowIt: '✓ Je le sais',
    flashcardStillLearning: '↻ En apprentissage',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marquées comme connues`,
  },
  ar: {
    title: 'Language Arts',
    tagline: 'طابق الكلمات مع مرادفاتها، أجب عن الأسئلة،\nأو رتبها من الأقصر إلى الأطول.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    menu: '☰ القائمة',
    playAgain: 'العب مجددًا',
    wellDone: 'ساحر الكلمات! ✏️',
    footer: 'انطق كل كلمة بصوت عالٍ — أذنك غالبًا تعرف المرادف أولًا.',

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `تمت مطابقة ${pairs} من الأزواج في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} كلمة تم تعلمها إجمالًا`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeQuiz: 'اختبار',
    round: (i, total) => `السؤال ${i}/${total}`,
    score: (n) => `النتيجة: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeSequence: 'ترتيب الكلمات',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الكلمات من الأقصر إلى الأطول',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولة مثالية`,

    modeTrueFalse: '✓✗ صح/خطأ',
    trueLabel: 'صح',
    falseLabel: 'خطأ',
    trueFalseStatement: (a, b) => `"${a}" و"${b}" مترادفتان`,

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
