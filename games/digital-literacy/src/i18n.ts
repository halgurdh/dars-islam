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

  trueFalseStatement: (term: string, meaning: string) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Digital Literacy',
    tagline: 'Match tech terms, answer quizzes, or sort\nfrom hardware to online behavior.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    menu: '☰ Menu',
    playAgain: 'Play Again',
    wellDone: 'Smart and safe! 💻',
    footer: 'When in doubt online, ask a trusted adult before you click.',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} terms learned overall`,
    nextLevelHint: 'Next round starting…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correct`,

    modeSequence: 'Layer Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap them from internet hardware to online behavior',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    trueFalseStatement: (term, meaning) => `${term} means "${meaning}"`,
  },
  nl: {
    title: 'Digital Literacy',
    tagline: 'Koppel techtermen, beantwoord quizvragen of\nsorteer van hardware naar online gedrag.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    menu: '☰ Menu',
    playAgain: 'Opnieuw spelen',
    wellDone: 'Slim en veilig! 💻',
    footer: 'Twijfel je online ergens over? Vraag het eerst aan een volwassene die je vertrouwt.',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} termen in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Vraag ${i}/${total}`,
    score: (n) => `Score: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} goed`,

    modeSequence: 'Laag Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik ze aan van hardware naar online gedrag',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    trueFalseStatement: (term, meaning) => `${term} betekent "${meaning}"`,
  },
  de: {
    title: 'Digital Literacy',
    tagline: 'Ordne Technikbegriffe zu, beantworte Quizfragen\noder sortiere von Hardware zu Online-Verhalten.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    menu: '☰ Menü',
    playAgain: 'Nochmal spielen',
    wellDone: 'Klug und sicher! 💻',
    footer: 'Bist du dir online unsicher? Frag zuerst einen Erwachsenen, dem du vertraust.',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Begriffe insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Frage ${i}/${total}`,
    score: (n) => `Punkte: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} richtig`,

    modeSequence: 'Ebene Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe sie von Hardware bis Online-Verhalten an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    trueFalseStatement: (term, meaning) => `${term} bedeutet „${meaning}"`,
  },
  es: {
    title: 'Digital Literacy',
    tagline: 'Empareja términos tecnológicos, responde\npreguntas u ordena de hardware a comportamiento online.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    menu: '☰ Menú',
    playAgain: 'Jugar de nuevo',
    wellDone: '¡Inteligente y seguro! 💻',
    footer: 'Si tienes dudas en línea, pregunta primero a un adulto de confianza.',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} términos aprendidos en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Pregunta ${i}/${total}`,
    score: (n) => `Puntuación: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctas`,

    modeSequence: 'Orden por Capa',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Tócalos desde el hardware hasta el comportamiento en línea',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    trueFalseStatement: (term, meaning) => `${term} significa "${meaning}"`,
  },
  fr: {
    title: 'Digital Literacy',
    tagline: "Associe des termes techniques, réponds à un\nquiz ou trie du matériel au comportement en ligne.",
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    menu: '☰ Menu',
    playAgain: 'Rejouer',
    wellDone: 'Malin et prudent ! 💻',
    footer: "En cas de doute en ligne, demande d'abord à un adulte de confiance.",

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} termes appris au total`,
    nextLevelHint: 'La manche suivante commence…',

    modeQuiz: 'Quiz',
    round: (i, total) => `Question ${i}/${total}`,
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,

    modeSequence: 'Tri par Couche',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche-les du matériel au comportement en ligne',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    trueFalseStatement: (term, meaning) => `${term} signifie « ${meaning} »`,
  },
  ar: {
    title: 'Digital Literacy',
    tagline: 'طابق المصطلحات التقنية، أجب عن الأسئلة، أو رتب\nمن الأجهزة إلى السلوك على الإنترنت.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    menu: '☰ القائمة',
    playAgain: 'العب مرة أخرى',
    wellDone: 'ذكي وآمن! 💻',
    footer: 'إذا شككت في شيء على الإنترنت، اسأل شخصًا بالغًا تثق به قبل أن تضغط.',

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} مصطلح تم تعلمه إجمالًا`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeQuiz: 'اختبار',
    round: (i, total) => `السؤال ${i}/${total}`,
    score: (n) => `النتيجة: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,

    modeSequence: 'ترتيب الطبقات',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط عليها من أجهزة الإنترنت إلى السلوك على الإنترنت',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولة مثالية`,

    trueFalseStatement: (term, meaning) => `${term} يعني "${meaning}"`,
  },
};

export const t = createI18n(STRINGS, getLang);
