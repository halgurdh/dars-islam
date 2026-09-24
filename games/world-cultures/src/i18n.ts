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

  trueFalseStatement: (greeting: string, language: string) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'World Cultures',
    tagline: 'Match greetings to languages, answer quizzes,\nor sort by speakers — three ways to learn.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Global citizen! 🌐',
    footer: 'Try saying each greeting out loud — every culture has something worth learning.',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} greetings learned overall`,
    nextLevelHint: 'Next round starting…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Speaker Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the languages fewest to most speakers',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    trueFalseStatement: (greeting, language) => `"${greeting}" is a greeting in ${language}`,
  },
  nl: {
    title: 'World Cultures',
    tagline: 'Koppel begroetingen aan talen, beantwoord\nquizvragen of sorteer op sprekers.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Wereldburger! 🌐',
    footer: 'Zeg elke begroeting hardop — elke cultuur heeft iets waardevols om te leren.',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} begroetingen in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Vraag ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Sprekers Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de talen van minste naar meeste sprekers aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    trueFalseStatement: (greeting, language) => `"${greeting}" is een begroeting in het ${language}`,
  },
  de: {
    title: 'World Cultures',
    tagline: 'Ordne Grüßen ihre Sprache zu, beantworte\nQuizfragen oder sortiere nach Sprechern.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Weltbürger! 🌐',
    footer: 'Sprich jeden Gruß laut aus — jede Kultur hat etwas Wertvolles zu bieten.',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Grüße insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Frage ${i}/${total}`,
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Sprecher Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Sprachen von wenigsten zu meisten Sprechern an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    trueFalseStatement: (greeting, language) => `„${greeting}" ist ein Gruß auf ${language}`,
  },
  es: {
    title: 'World Cultures',
    tagline: 'Empareja saludos con idiomas, responde\npreguntas u ordena por hablantes.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Ciudadano del mundo! 🌐',
    footer: 'Di cada saludo en voz alta — cada cultura tiene algo valioso que enseñar.',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} saludos aprendidos en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Pregunta ${i}/${total}`,
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden por Hablantes',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca los idiomas de menos a más hablantes',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    trueFalseStatement: (greeting, language) => `"${greeting}" es un saludo en ${language}`,
  },
  fr: {
    title: 'World Cultures',
    tagline: 'Associe des salutations à des langues, réponds\nà un quiz ou trie par locuteurs.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Citoyen du monde ! 🌐',
    footer: 'Prononce chaque salutation à voix haute — chaque culture a quelque chose à offrir.',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} salutations apprises au total`,
    nextLevelHint: 'La manche suivante commence…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Tri par Locuteurs',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les langues du moins au plus parlées',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    trueFalseStatement: (greeting, language) => `« ${greeting} » est une salutation en ${language}`,
  },
  ar: {
    title: 'World Cultures',
    tagline: 'طابق التحيات مع اللغات، أجب عن أسئلة الاختبار،\nأو رتب حسب عدد المتحدثين — ثلاث طرق للتعلم.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    menu: '☰ القائمة',
    playAgain: 'العب مرة أخرى',
    wellDone: 'مواطن عالمي! 🌐',
    footer: 'جرب أن تقول كل تحية بصوت عالٍ — كل ثقافة لديها ما يستحق التعلم.',

    modeMatch: 'المطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} تحية تم تعلمها إجمالاً`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeQuiz: 'اختبار',
    round: (i, total) => `السؤال ${i}/${total}`,
    score: (n) => `النقاط: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeSequence: 'ترتيب المتحدثين',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على اللغات من الأقل إلى الأكثر عدد متحدثين',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,

    trueFalseStatement: (greeting, language) => `"${greeting}" هي تحية باللغة ${language}`,
  },
};

export const t = createI18n(STRINGS, getLang);
