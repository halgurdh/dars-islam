import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  shapes: string;
  numbers: string;
  oddOneOut: string;
  menu: string;
  wellDone: string;
  playAgain: string;
  backToMenu: string;
  footer: string;
  tierEasy: string;
  tierMedium: string;
  tierHard: string;

  modeQuiz: string;
  round: (i: number, total: number) => string;
  score: (n: number) => string;
  roundSummary: (score: number, total: number) => string;

  modeMatch: string;
  moves: (n: number) => string;
  matchRoundSummary: (pairs: number, moves: number, time: string) => string;
  nextLevelHint: string;

  modeSequence: string;
  mistakes: (n: number) => string;
  instruction: string;
  sequenceRoundSummary: (perfect: number, total: number) => string;

  promptNext: string;
  promptOddOneOut: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Pattern Play',
    tagline: 'Spot the pattern and figure out\nwhat comes next.',
    shapes: 'Shape Patterns',
    numbers: 'Number Patterns',
    oddOneOut: 'Odd One Out',
    menu: '☰ Menu',
    wellDone: 'Pattern spotted! 🧩',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Look for what repeats, then guess what comes next.',
    tierEasy: 'Easy',
    tierMedium: 'Medium',
    tierHard: 'Hard',

    modeQuiz: 'Quiz',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correct`,

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} pairs matched in ${moves} moves\nTime: ${time}`,
    nextLevelHint: 'Next round starting…',

    modeSequence: 'Sort',
    mistakes: (n) => `Mistakes: ${n}`,
    instruction: 'Tap the numbers in counting order',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    promptNext: 'What comes next?',
    promptOddOneOut: 'Which one doesn’t belong?',
  },
  nl: {
    title: 'Pattern Play',
    tagline: 'Ontdek het patroon en\nraad wat er hierna komt.',
    shapes: 'Vormpatronen',
    numbers: 'Getalpatronen',
    oddOneOut: 'Wat hoort er niet bij?',
    menu: '☰ Menu',
    wellDone: 'Patroon gevonden! 🧩',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Zoek wat zich herhaalt en raad wat erna komt.',
    tierEasy: 'Makkelijk',
    tierMedium: 'Gemiddeld',
    tierHard: 'Moeilijk',

    modeQuiz: 'Quiz',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} goed`,

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}`,
    nextLevelHint: 'Volgende ronde begint…',

    modeSequence: 'Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de getallen op telvolgorde aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    promptNext: 'Wat komt er hierna?',
    promptOddOneOut: 'Welke hoort er niet bij?',
  },
  de: {
    title: 'Pattern Play',
    tagline: 'Erkenne das Muster und\nfinde heraus, was als Nächstes kommt.',
    shapes: 'Formmuster',
    numbers: 'Zahlenmuster',
    oddOneOut: 'Was passt nicht?',
    menu: '☰ Menü',
    wellDone: 'Muster erkannt! 🧩',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Suche, was sich wiederholt, und rate, was als Nächstes kommt.',
    tierEasy: 'Leicht',
    tierMedium: 'Mittel',
    tierHard: 'Schwer',

    modeQuiz: 'Quiz',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} richtig`,

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}`,
    nextLevelHint: 'Nächste Runde startet…',

    modeSequence: 'Sortieren',
    mistakes: (n) => `Fehler: ${n}`,
    instruction: 'Tippe die Zahlen in Zählreihenfolge an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    promptNext: 'Was kommt als Nächstes?',
    promptOddOneOut: 'Welches gehört nicht dazu?',
  },
  es: {
    title: 'Pattern Play',
    tagline: 'Descubre el patrón y\nadivina qué viene después.',
    shapes: 'Patrones de formas',
    numbers: 'Patrones de números',
    oddOneOut: '¿Cuál no encaja?',
    menu: '☰ Menú',
    wellDone: '¡Patrón encontrado! 🧩',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Busca lo que se repite y adivina qué sigue.',
    tierEasy: 'Fácil',
    tierMedium: 'Medio',
    tierHard: 'Difícil',

    modeQuiz: 'Quiz',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correctas`,

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}`,
    nextLevelHint: 'Comienza la siguiente ronda…',

    modeSequence: 'Ordenar',
    mistakes: (n) => `Errores: ${n}`,
    instruction: 'Toca los números en orden de conteo',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    promptNext: '¿Qué viene después?',
    promptOddOneOut: '¿Cuál no pertenece al grupo?',
  },
  fr: {
    title: 'Pattern Play',
    tagline: 'Repère le motif et\ndevine ce qui vient après.',
    shapes: 'Motifs de formes',
    numbers: 'Suites de nombres',
    oddOneOut: 'L’intrus',
    menu: '☰ Menu',
    wellDone: 'Motif trouvé ! 🧩',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Cherche ce qui se répète, puis devine ce qui vient après.',
    tierEasy: 'Facile',
    tierMedium: 'Moyen',
    tierHard: 'Difficile',

    modeQuiz: 'Quiz',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correctes`,

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}`,
    nextLevelHint: 'La manche suivante commence…',

    modeSequence: 'Trier',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les nombres dans l’ordre de comptage',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    promptNext: 'Qu’est-ce qui vient ensuite ?',
    promptOddOneOut: 'Lequel ne va pas avec les autres ?',
  },
  ar: {
    title: 'Pattern Play',
    tagline: 'اكتشف النمط\nوخمّن ماذا يأتي بعده.',
    shapes: 'أنماط الأشكال',
    numbers: 'أنماط الأعداد',
    oddOneOut: 'العنصر المختلف',
    menu: '☰ القائمة',
    wellDone: 'اكتشفت النمط! 🧩',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'ابحث عمّا يتكرر، ثم خمّن ماذا يأتي بعده.',
    tierEasy: 'سهل',
    tierMedium: 'متوسط',
    tierHard: 'صعب',

    modeQuiz: 'اختبار',
    round: (i, total) => `الجولة ${i} / ${total}`,
    score: (n) => `النقاط: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} صحيحة`,

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `تمت مطابقة ${pairs} أزواج في ${moves} حركة\nالوقت: ${time}`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeSequence: 'ترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على الأعداد بترتيب العدّ',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,

    promptNext: 'ما الذي يأتي بعد ذلك؟',
    promptOddOneOut: 'أيها لا ينتمي إلى المجموعة؟',
  },
};

export const t = createI18n(STRINGS, getLang);
