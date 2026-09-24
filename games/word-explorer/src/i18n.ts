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

  trueFalseStatement: (a: string, b: string) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Word Explorer',
    tagline: 'Match words to their meaning, answer quizzes,\nor sort by how essential each one is.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Word explorer! 🗺️',
    footer: 'Try saying each word out loud — a little vocabulary goes a long way.',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} words learned overall`,
    nextLevelHint: 'Next round starting…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Word Order',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: "Tap the words in the order you'd learn them",
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    trueFalseStatement: (word, meaning) => `"${word}" means "${meaning}"`,
  },
  nl: {
    title: 'Word Explorer',
    tagline: 'Koppel woorden aan hun betekenis, beantwoord\nquizvragen of sorteer op belang.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Woordenschat-ontdekker! 🗺️',
    footer: 'Zeg elk woord hardop — een beetje woordenschat brengt je al ver.',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} woorden in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Vraag ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Woordvolgorde',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de woorden aan in de volgorde waarin je ze zou leren',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    trueFalseStatement: (word, meaning) => `"${word}" betekent "${meaning}"`,
  },
  de: {
    title: 'Word Explorer',
    tagline: 'Ordne Wörtern ihre Bedeutung zu, beantworte\nQuizfragen oder sortiere nach Wichtigkeit.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Wortentdecker! 🗺️',
    footer: 'Sprich jedes Wort laut aus — ein bisschen Wortschatz bringt dich schon weit.',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Wörter insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Frage ${i}/${total}`,
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Wortreihenfolge',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Wörter in der Reihenfolge an, in der du sie lernen würdest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    trueFalseStatement: (word, meaning) => `„${word}" bedeutet „${meaning}"`,
  },
  es: {
    title: 'Word Explorer',
    tagline: 'Empareja palabras con su significado, responde\npreguntas u ordénalas por importancia.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Explorador de palabras! 🗺️',
    footer: 'Di cada palabra en voz alta — un poco de vocabulario llega lejos.',

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
    instruction: 'Toca las palabras en el orden en que las aprenderías',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    trueFalseStatement: (word, meaning) => `"${word}" significa "${meaning}"`,
  },
  fr: {
    title: 'Word Explorer',
    tagline: 'Associe des mots à leur signification, réponds\nà un quiz ou trie-les par importance.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Explorateur de mots ! 🗺️',
    footer: 'Prononce chaque mot à voix haute — un peu de vocabulaire va loin.',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} mots appris au total`,
    nextLevelHint: 'La manche suivante commence…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Ordre des Mots',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: "Touche les mots dans l'ordre où tu les apprendrais",
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    trueFalseStatement: (word, meaning) => `« ${word} » signifie « ${meaning} »`,
  },
  ar: {
    title: 'Word Explorer',
    tagline: 'طابق الكلمات مع معانيها، أجب عن أسئلة الاختبار،\nأو رتبها حسب الأهمية — ثلاث طرق للتعلم.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    menu: '☰ القائمة',
    playAgain: 'العب مرة أخرى',
    wellDone: 'مستكشف الكلمات! 🗺️',
    footer: 'جرب أن تقول كل كلمة بصوت عالٍ — القليل من المفردات يوصلك بعيدًا.',

    modeMatch: 'المطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} كلمة تم تعلمها إجمالاً`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeQuiz: 'اختبار',
    round: (i, total) => `السؤال ${i}/${total}`,
    score: (n) => `النقاط: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeSequence: 'ترتيب الكلمات',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الكلمات بالترتيب الذي تتعلمها به',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,

    trueFalseStatement: (word, meaning) => `"${word}" تعني "${meaning}"`,
  },
};

export const t = createI18n(STRINGS, getLang);
