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
  trueFalseStatement: (singular: string, plural: string) => string;

  modeFlashcard: string;
  flashcardProgress: (i: number, total: number) => string;
  hear: string;
  flashcardKnowIt: string;
  flashcardStillLearning: string;
  flashcardRoundSummary: (known: number, total: number) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Arabic Grammar Basics',
    tagline: 'Match words to their plurals, answer quizzes,\nor sort by the Arabic alphabet.',
    easy: 'Easy · 4',
    medium: 'Medium · 6',
    hard: 'Hard · 8',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Excellent, ما شاء الله! 📖',
    footer: 'Say the words out loud — grammar sticks better when you hear it.',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} words learned overall`,
    nextLevelHint: 'Next round starting…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Alphabet Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the words in Arabic alphabetical order (ا→ي)',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    modeTrueFalse: '✓✗ True/False',
    trueLabel: 'True',
    falseLabel: 'False',
    trueFalseStatement: (singular, plural) => `"${plural}" is the plural of "${singular}"`,

    modeFlashcard: '🗂️ Review',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Hear it',
    flashcardKnowIt: '✓ I know it',
    flashcardStillLearning: '↻ Still learning',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marked as known`,
  },
  nl: {
    title: 'Arabic Grammar Basics',
    tagline: 'Koppel woorden aan hun meervoud, beantwoord\nquizvragen of sorteer op het Arabische alfabet.',
    easy: 'Makkelijk · 4',
    medium: 'Gemiddeld · 6',
    hard: 'Moeilijk · 8',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Uitstekend, ما شاء الله! 📖',
    footer: 'Zeg de woorden hardop — grammatica blijft beter hangen als je het hoort.',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} woorden in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Vraag ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Alfabet Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de woorden aan in Arabische alfabetische volgorde (ا→ي)',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    modeTrueFalse: '✓✗ Waar/Niet waar',
    trueLabel: 'Waar',
    falseLabel: 'Niet waar',
    trueFalseStatement: (singular, plural) => `"${plural}" is het meervoud van "${singular}"`,

    modeFlashcard: '🗂️ Herhalen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Uitspraak',
    flashcardKnowIt: '✓ Ik ken dit',
    flashcardStillLearning: '↻ Nog aan het leren',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als gekend gemarkeerd`,
  },
  de: {
    title: 'Arabic Grammar Basics',
    tagline: 'Ordne Wörtern ihren Plural zu, beantworte\nQuizfragen oder sortiere nach arabischem Alphabet.',
    easy: 'Leicht · 4',
    medium: 'Mittel · 6',
    hard: 'Schwer · 8',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Ausgezeichnet, ما شاء الله! 📖',
    footer: 'Sprich die Wörter laut aus — Grammatik bleibt besser hängen, wenn man sie hört.',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Wörter insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Frage ${i}/${total}`,
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Alphabet Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Wörter in arabischer alphabetischer Reihenfolge an (ا→ي)',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    modeTrueFalse: '✓✗ Wahr/Falsch',
    trueLabel: 'Wahr',
    falseLabel: 'Falsch',
    trueFalseStatement: (singular, plural) => `„${plural}" ist der Plural von „${singular}"`,

    modeFlashcard: '🗂️ Wiederholen',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Anhören',
    flashcardKnowIt: '✓ Ich kenne es',
    flashcardStillLearning: '↻ Noch am Lernen',
    flashcardRoundSummary: (known, total) => `${known} / ${total} als bekannt markiert`,
  },
  es: {
    title: 'Arabic Grammar Basics',
    tagline: 'Empareja palabras con su plural, responde\npreguntas u ordena por el alfabeto árabe.',
    easy: 'Fácil · 4',
    medium: 'Medio · 6',
    hard: 'Difícil · 8',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Excelente, ما شاء الله! 📖',
    footer: 'Di las palabras en voz alta — la gramática se aprende mejor al oírla.',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} palabras aprendidas en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Pregunta ${i}/${total}`,
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden Alfabético',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca las palabras en orden alfabético árabe (ا→ي)',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    modeTrueFalse: '✓✗ Verdadero/Falso',
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
    trueFalseStatement: (singular, plural) => `"${plural}" es el plural de "${singular}"`,

    modeFlashcard: '🗂️ Repasar',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Escuchar',
    flashcardKnowIt: '✓ Lo sé',
    flashcardStillLearning: '↻ Aún aprendiendo',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marcadas como conocidas`,
  },
  fr: {
    title: 'Arabic Grammar Basics',
    tagline: 'Associe des mots à leur pluriel, réponds à\nun quiz ou trie selon l’alphabet arabe.',
    easy: 'Facile · 4',
    medium: 'Moyen · 6',
    hard: 'Difficile · 8',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Excellent, ما شاء الله ! 📖',
    footer: 'Prononce les mots à voix haute — la grammaire s\'ancre mieux en l\'entendant.',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} mots appris au total`,
    nextLevelHint: 'La manche suivante commence…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Tri Alphabétique',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les mots dans l’ordre alphabétique arabe (ا→ي)',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    modeTrueFalse: '✓✗ Vrai/Faux',
    trueLabel: 'Vrai',
    falseLabel: 'Faux',
    trueFalseStatement: (singular, plural) => `« ${plural} » est le pluriel de « ${singular} »`,

    modeFlashcard: '🗂️ Réviser',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 Écouter',
    flashcardKnowIt: '✓ Je le sais',
    flashcardStillLearning: '↻ En apprentissage',
    flashcardRoundSummary: (known, total) => `${known} / ${total} marquées comme connues`,
  },
  ar: {
    title: 'Arabic Grammar Basics',
    tagline: 'طابق الكلمات بجموعها، أجب عن أسئلة الاختبار،\nأو رتبها حسب الحروف الأبجدية العربية.',
    easy: 'سهل · 4',
    medium: 'متوسط · 6',
    hard: 'صعب · 8',
    menu: '☰ القائمة',
    playAgain: 'العب مرة أخرى',
    wellDone: 'ممتاز، ما شاء الله! 📖',
    footer: 'انطق الكلمات بصوت عالٍ — القواعد ترسخ أفضل عندما تسمعها.',

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} كلمة تم تعلمها إجمالًا`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeQuiz: 'اختبار',
    round: (i, total) => `السؤال ${i}/${total}`,
    score: (n) => `النقاط: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} صحيحة`,

    modeSequence: 'ترتيب الحروف الأبجدية',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الكلمات حسب الترتيب الأبجدي العربي (ا→ي)',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,

    modeTrueFalse: '✓✗ صح/خطأ',
    trueLabel: 'صح',
    falseLabel: 'خطأ',
    trueFalseStatement: (singular, plural) => `"${plural}" هي جمع "${singular}"`,

    modeFlashcard: '🗂️ مراجعة',
    flashcardProgress: (i, total) => `${i} / ${total}`,
    hear: '🔊 استمع',
    flashcardKnowIt: '✓ أعرف هذا',
    flashcardStillLearning: '↻ ما زلت أتعلم',
    flashcardRoundSummary: (known, total) => `${known} / ${total} تم وضع علامة معروف عليها`,
  },
};

export const t = createI18n(STRINGS, getLang);
