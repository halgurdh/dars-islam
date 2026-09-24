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

  trueFalseStatement: (part: string, fn: string) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Health & The Body',
    tagline: 'Match body parts, answer quizzes, or sort by\nweight — three ways to learn how your body works.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Healthy habits! 💪',
    footer: 'Point to each part on yourself as you play — it helps it stick.',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} body parts learned overall`,
    nextLevelHint: 'Next round starting…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Weight Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the body parts lightest to heaviest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    trueFalseStatement: (part, fn) => `The ${part}: ${fn}`,
  },
  nl: {
    title: 'Health & The Body',
    tagline: 'Koppel lichaamsdelen, beantwoord quizvragen\nof sorteer op gewicht.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Gezonde gewoontes! 💪',
    footer: 'Wijs naar elk lichaamsdeel bij jezelf terwijl je speelt — dat helpt om te onthouden.',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} lichaamsdelen in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Vraag ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Gewicht Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de lichaamsdelen van licht naar zwaar aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    trueFalseStatement: (part, fn) => `${part}: ${fn}`,
  },
  de: {
    title: 'Health & The Body',
    tagline: 'Ordne Körperteile zu, beantworte Quizfragen\noder sortiere nach Gewicht.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Gesunde Gewohnheiten! 💪',
    footer: 'Zeig beim Spielen auf dich selbst — das hilft beim Merken.',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Körperteile insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Frage ${i}/${total}`,
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Gewicht Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Körperteile von leicht nach schwer an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    trueFalseStatement: (part, fn) => `${part}: ${fn}`,
  },
  es: {
    title: 'Health & The Body',
    tagline: 'Empareja partes del cuerpo, responde preguntas\no ordena por peso.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Hábitos saludables! 💪',
    footer: 'Señala cada parte en ti mismo mientras juegas — ayuda a recordarlo.',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} partes del cuerpo aprendidas en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Pregunta ${i}/${total}`,
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden por Peso',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca las partes del cuerpo de más ligera a más pesada',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    trueFalseStatement: (part, fn) => `${part}: ${fn}`,
  },
  fr: {
    title: 'Health & The Body',
    tagline: 'Associe des parties du corps, réponds à un quiz\nou trie par poids.',
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Bonnes habitudes ! 💪',
    footer: 'Montre chaque partie sur toi en jouant — ça aide à mémoriser.',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} parties du corps apprises au total`,
    nextLevelHint: 'La manche suivante commence…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Tri par Poids',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les parties du corps de la plus légère à la plus lourde',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    trueFalseStatement: (part, fn) => `${part} : ${fn}`,
  },
  ar: {
    title: 'Health & The Body',
    tagline: 'طابق أجزاء الجسم، أجب عن الأسئلة، أو رتبها\nحسب الوزن — ثلاث طرق لتتعلم كيف يعمل جسمك.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    menu: '☰ القائمة',
    playAgain: 'العب مجددًا',
    wellDone: 'عادات صحية! 💪',
    footer: 'أشر إلى كل جزء على جسمك أثناء اللعب — هذا يساعدك على تذكره.',

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `تمت مطابقة ${pairs} من الأزواج في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} من أجزاء الجسم تم تعلمها إجمالًا`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeQuiz: 'اختبار',
    round: (i, total) => `السؤال ${i}/${total}`,
    score: (n) => `النتيجة: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeSequence: 'ترتيب حسب الوزن',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على أجزاء الجسم من الأخف إلى الأثقل',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولة مثالية`,

    trueFalseStatement: (part, fn) => `${part}: ${fn}`,
  },
};

export const t = createI18n(STRINGS, getLang);
