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
  },
};

export const t = createI18n(STRINGS, getLang);
