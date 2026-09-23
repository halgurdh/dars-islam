import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  menu: string;
  wellDone: string;
  playAgain: string;
  backToMenu: string;
  footer: string;

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

  askPrime: string;
  askMultiple: (n: number) => string;
  askGcf: (a: number, b: number) => string;
  askLcm: (a: number, b: number) => string;
  askNextInPattern: (terms: string) => string;
  askRemainder: (a: number, b: number) => string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Number Theory & Logic',
    tagline: 'Primes, factors, multiples\nand number patterns.',
    easy: 'Easy · Primes & Multiples',
    medium: 'Medium · GCF & LCM',
    hard: 'Hard · Patterns & Remainders',
    menu: '☰ Menu',
    wellDone: 'Logical thinker! 🔢',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'List the factors out on paper — patterns jump out once you see them all.',

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
    instruction: 'Tap the problems from smallest to largest answer',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    askPrime: 'Which of these numbers is prime?',
    askMultiple: (n) => `Which of these numbers is a multiple of ${n}?`,
    askGcf: (a, b) => `What is the greatest common factor (GCF) of ${a} and ${b}?`,
    askLcm: (a, b) => `What is the least common multiple (LCM) of ${a} and ${b}?`,
    askNextInPattern: (terms) => `What comes next in the pattern: ${terms}, ___?`,
    askRemainder: (a, b) => `What is the remainder when ${a} is divided by ${b}?`,
  },
  nl: {
    title: 'Number Theory & Logic',
    tagline: 'Priemgetallen, factoren, veelvouden\nen getalpatronen.',
    easy: 'Makkelijk · Priemgetallen & Veelvouden',
    medium: 'Gemiddeld · GGD & KGV',
    hard: 'Moeilijk · Patronen & Restwaarden',
    menu: '☰ Menu',
    wellDone: 'Logisch denker! 🔢',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Schrijf de factoren op papier — patronen vallen op als je ze allemaal ziet.',

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
    instruction: 'Tik de opgaven van kleinste naar grootste antwoord aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    askPrime: 'Welk van deze getallen is een priemgetal?',
    askMultiple: (n) => `Welk van deze getallen is een veelvoud van ${n}?`,
    askGcf: (a, b) => `Wat is de grootste gemene deler (GGD) van ${a} en ${b}?`,
    askLcm: (a, b) => `Wat is het kleinste gemene veelvoud (KGV) van ${a} en ${b}?`,
    askNextInPattern: (terms) => `Wat komt hierna in het patroon: ${terms}, ___?`,
    askRemainder: (a, b) => `Wat is de rest als ${a} wordt gedeeld door ${b}?`,
  },
  de: {
    title: 'Number Theory & Logic',
    tagline: 'Primzahlen, Faktoren, Vielfache\nund Zahlenmuster.',
    easy: 'Leicht · Primzahlen & Vielfache',
    medium: 'Mittel · ggT & kgV',
    hard: 'Schwer · Muster & Reste',
    menu: '☰ Menü',
    wellDone: 'Logisches Denken! 🔢',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Schreib die Faktoren auf — Muster fallen auf, wenn du sie alle siehst.',

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
    instruction: 'Tippe die Aufgaben vom kleinsten zum größten Ergebnis an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    askPrime: 'Welche dieser Zahlen ist eine Primzahl?',
    askMultiple: (n) => `Welche dieser Zahlen ist ein Vielfaches von ${n}?`,
    askGcf: (a, b) => `Was ist der größte gemeinsame Teiler (GGT) von ${a} und ${b}?`,
    askLcm: (a, b) => `Was ist das kleinste gemeinsame Vielfache (KGV) von ${a} und ${b}?`,
    askNextInPattern: (terms) => `Was kommt als Nächstes in diesem Muster: ${terms}, ___?`,
    askRemainder: (a, b) => `Was ist der Rest, wenn ${a} durch ${b} geteilt wird?`,
  },
  es: {
    title: 'Number Theory & Logic',
    tagline: 'Números primos, factores, múltiplos\ny patrones numéricos.',
    easy: 'Fácil · Primos y múltiplos',
    medium: 'Medio · MCD y MCM',
    hard: 'Difícil · Patrones y restos',
    menu: '☰ Menú',
    wellDone: '¡Pensador lógico! 🔢',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Escribe los factores en papel — los patrones se ven mejor todos juntos.',

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
    instruction: 'Toca los problemas de menor a mayor resultado',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    askPrime: '¿Cuál de estos números es primo?',
    askMultiple: (n) => `¿Cuál de estos números es múltiplo de ${n}?`,
    askGcf: (a, b) => `¿Cuál es el máximo común divisor (MCD) de ${a} y ${b}?`,
    askLcm: (a, b) => `¿Cuál es el mínimo común múltiplo (MCM) de ${a} y ${b}?`,
    askNextInPattern: (terms) => `¿Qué sigue en el patrón: ${terms}, ___?`,
    askRemainder: (a, b) => `¿Cuál es el resto de dividir ${a} entre ${b}?`,
  },
  fr: {
    title: 'Number Theory & Logic',
    tagline: 'Nombres premiers, facteurs, multiples\net motifs numériques.',
    easy: 'Facile · Premiers et multiples',
    medium: 'Moyen · PGCD et PPCM',
    hard: 'Difficile · Motifs et restes',
    menu: '☰ Menu',
    wellDone: 'Esprit logique ! 🔢',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Écris les facteurs sur papier — les motifs sautent aux yeux une fois réunis.',

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
    instruction: 'Touche les problèmes du plus petit au plus grand résultat',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    askPrime: 'Lequel de ces nombres est un nombre premier ?',
    askMultiple: (n) => `Lequel de ces nombres est un multiple de ${n} ?`,
    askGcf: (a, b) => `Quel est le plus grand commun diviseur (PGCD) de ${a} et ${b} ?`,
    askLcm: (a, b) => `Quel est le plus petit commun multiple (PPCM) de ${a} et ${b} ?`,
    askNextInPattern: (terms) => `Qu'est-ce qui vient ensuite dans le motif : ${terms}, ___ ?`,
    askRemainder: (a, b) => `Quel est le reste de la division de ${a} par ${b} ?`,
  },
  ar: {
    title: 'Number Theory & Logic',
    tagline: 'الأعداد الأولية، العوامل، المضاعفات\nوأنماط الأعداد.',
    easy: 'سهل · الأعداد الأولية والمضاعفات',
    medium: 'متوسط · القاسم المشترك الأكبر والمضاعف المشترك الأصغر',
    hard: 'صعب · الأنماط والبواقي',
    menu: '☰ القائمة',
    wellDone: 'مفكر منطقي! 🔢',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'اكتب العوامل على ورقة — الأنماط تظهر بوضوح عندما تراها كلها معًا.',

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
    instruction: 'اضغط على المسائل من الإجابة الأصغر إلى الأكبر',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,

    askPrime: 'أي من هذه الأرقام هو عدد أولي؟',
    askMultiple: (n) => `أي من هذه الأرقام مضاعف لـ ${n}؟`,
    askGcf: (a, b) => `ما هو القاسم المشترك الأكبر لـ ${a} و ${b}؟`,
    askLcm: (a, b) => `ما هو المضاعف المشترك الأصغر لـ ${a} و ${b}؟`,
    askNextInPattern: (terms) => `ما الذي يأتي بعد ذلك في النمط: ${terms}، ___؟`,
    askRemainder: (a, b) => `ما هو الباقي عند قسمة ${a} على ${b}؟`,
  },
};

export const t = createI18n(STRINGS, getLang);
