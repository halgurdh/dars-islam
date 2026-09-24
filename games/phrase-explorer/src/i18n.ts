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
    title: 'Phrase Explorer',
    tagline: 'Match everyday sentences to their meaning, answer\nquizzes, or sort by how essential each one is.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Phrase explorer! 💬',
    footer: 'Try saying each phrase out loud — you\'ll be understood sooner than you think.',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} phrases learned overall`,
    nextLevelHint: 'Next round starting…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Phrase Order',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: "Tap the phrases in the order you'd learn them",
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    trueFalseStatement: (phrase, meaning) => `"${phrase}" means "${meaning}"`,
  },
  nl: {
    title: 'Phrase Explorer',
    tagline: 'Koppel alledaagse zinnen aan hun betekenis,\nbeantwoord quizvragen of sorteer op belang.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Zinnetjes-ontdekker! 💬',
    footer: 'Zeg elke zin hardop — je wordt sneller begrepen dan je denkt.',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} zinnen in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Vraag ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Zinsvolgorde',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de zinnen aan in de volgorde waarin je ze zou leren',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    trueFalseStatement: (phrase, meaning) => `"${phrase}" betekent "${meaning}"`,
  },
  de: {
    title: 'Phrase Explorer',
    tagline: 'Ordne alltäglichen Sätzen ihre Bedeutung zu,\nbeantworte Quizfragen oder sortiere nach Wichtigkeit.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Satzentdecker! 💬',
    footer: 'Sprich jeden Satz laut aus — du wirst schneller verstanden, als du denkst.',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Sätze insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Frage ${i}/${total}`,
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Satzreihenfolge',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Sätze in der Reihenfolge an, in der du sie lernen würdest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    trueFalseStatement: (phrase, meaning) => `„${phrase}" bedeutet „${meaning}"`,
  },
  es: {
    title: 'Phrase Explorer',
    tagline: 'Empareja frases cotidianas con su significado,\nresponde preguntas u ordénalas por importancia.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Explorador de frases! 💬',
    footer: 'Di cada frase en voz alta — te entenderán antes de lo que piensas.',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} frases aprendidas en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Pregunta ${i}/${total}`,
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden de Frases',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca las frases en el orden en que las aprenderías',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    trueFalseStatement: (phrase, meaning) => `"${phrase}" significa "${meaning}"`,
  },
  fr: {
    title: 'Phrase Explorer',
    tagline: 'Associe des phrases courantes à leur signification,\nréponds à un quiz ou trie-les par importance.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Explorateur de phrases ! 💬',
    footer: 'Prononce chaque phrase à voix haute — tu seras compris plus vite que tu ne le penses.',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} phrases apprises au total`,
    nextLevelHint: 'La manche suivante commence…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Ordre des Phrases',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: "Touche les phrases dans l'ordre où tu les apprendrais",
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    trueFalseStatement: (phrase, meaning) => `« ${phrase} » signifie « ${meaning} »`,
  },
  ar: {
    title: 'Phrase Explorer',
    tagline: 'طابق الجمل اليومية مع معانيها، أجب عن أسئلة\nالاختبار، أو رتبها حسب الأهمية.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    menu: '☰ القائمة',
    playAgain: 'العب مرة أخرى',
    wellDone: 'مستكشف الجمل! 💬',
    footer: 'جرب أن تقول كل جملة بصوت عالٍ — سيفهمك الناس أسرع مما تتوقع.',

    modeMatch: 'المطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} جملة تم تعلمها إجمالاً`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeQuiz: 'اختبار',
    round: (i, total) => `السؤال ${i}/${total}`,
    score: (n) => `النقاط: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeSequence: 'ترتيب الجمل',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الجمل بالترتيب الذي تتعلمها به',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,

    trueFalseStatement: (phrase, meaning) => `"${phrase}" تعني "${meaning}"`,
  },
};

export const t = createI18n(STRINGS, getLang);
