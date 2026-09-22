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
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'World History',
    tagline: 'Order milestones, answer quizzes, or match\nevents to their era — three ways to learn history.',
    easy: 'Easy · 6',
    medium: 'Medium · 8',
    hard: 'Hard · 10',
    round: (i, total) => `Round ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'History mastered! 🏛️',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Think in centuries, not exact years — the big picture is what matters here.',

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
  },
  nl: {
    title: 'World History',
    tagline: 'Zet mijlpalen op volgorde, beantwoord quizvragen\nof koppel gebeurtenissen aan hun tijdperk.',
    easy: 'Makkelijk · 6',
    medium: 'Gemiddeld · 8',
    hard: 'Moeilijk · 10',
    round: (i, total) => `Ronde ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Geschiedenis onder de knie! 🏛️',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Denk in eeuwen, niet in exacte jaartallen — het grote plaatje telt hier.',

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
  },
  de: {
    title: 'World History',
    tagline: 'Bring Meilensteine in die richtige Reihenfolge,\nbeantworte Quizfragen oder ordne Ereignisse ihrer Epoche zu.',
    easy: 'Leicht · 6',
    medium: 'Mittel · 8',
    hard: 'Schwer · 10',
    round: (i, total) => `Runde ${i} / ${total}`,
    menu: '☰ Menü',
    wellDone: 'Geschichte gemeistert! 🏛️',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Denke in Jahrhunderten, nicht in genauen Jahren — das große Ganze zählt hier.',

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
  },
  es: {
    title: 'World History',
    tagline: 'Ordena hitos, responde preguntas o empareja\neventos con su época — tres formas de aprender.',
    easy: 'Fácil · 6',
    medium: 'Medio · 8',
    hard: 'Difícil · 10',
    round: (i, total) => `Ronda ${i} / ${total}`,
    menu: '☰ Menú',
    wellDone: '¡Historia dominada! 🏛️',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Piensa en siglos, no en años exactos — aquí importa el panorama general.',

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
  },
  fr: {
    title: 'World History',
    tagline: "Mets des jalons en ordre, réponds à un quiz ou\nassocie des événements à leur époque.",
    easy: 'Facile · 6',
    medium: 'Moyen · 8',
    hard: 'Difficile · 10',
    round: (i, total) => `Manche ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Histoire maîtrisée ! 🏛️',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: "Pense en siècles, pas en années exactes — c'est la vue d'ensemble qui compte ici.",

    modeSequence: 'Ordre',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: "Touche les événements dans l'ordre où ils se sont produits.",
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} manches sans erreur`,

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} événements associés en ${moves} coups\nTemps : ${time}\n${learned} / ${total} appris au total`,
    nextLevelHint: 'Le niveau suivant commence…',

    modeQuiz: 'Quiz',
    score: (n) => `Score : ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} correctes`,
  },
  ar: {
    title: 'World History',
    tagline: 'رتب الأحداث المهمة، أجب عن أسئلة الاختبار، أو طابق\nالأحداث مع عصرها — ثلاث طرق لتعلم التاريخ.',
    easy: 'سهل · 6',
    medium: 'متوسط · 8',
    hard: 'صعب · 10',
    round: (i, total) => `الجولة ${i} / ${total}`,
    menu: '☰ القائمة',
    wellDone: 'أتقنت التاريخ! 🏛️',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'فكر بالقرون لا بالسنوات الدقيقة — الصورة الكبيرة هي ما يهم هنا.',

    modeSequence: 'الترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الأحداث بالترتيب الذي وقعت فيه.',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} جولات بلا أخطاء`,

    modeMatch: 'المطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} حدثًا تمت مطابقته في ${moves} حركة\nالوقت: ${time}\n${learned} / ${total} حدث تم تعلمه إجمالاً`,
    nextLevelHint: 'المستوى التالي يبدأ…',

    modeQuiz: 'اختبار',
    score: (n) => `النقاط: ${n}`,
    quizRoundSummary: (score, total) => `${score} / ${total} إجابة صحيحة`,
  },
};

export const t = createI18n(STRINGS, getLang);
