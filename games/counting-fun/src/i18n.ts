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
    title: 'Counting Fun',
    tagline: 'Count and recognize numbers,\nfrom 1 all the way to 20.',
    easy: 'Easy · up to 5',
    medium: 'Medium · up to 10',
    hard: 'Hard · up to 20',
    menu: '☰ Menu',
    wellDone: 'Well counted! 🔢',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Count carefully, then tap the right number.',

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
    instruction: 'Tap the groups from fewest to most',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    title: 'Counting Fun',
    tagline: 'Tel en herken getallen,\nvan 1 tot 20.',
    easy: 'Makkelijk · tot 5',
    medium: 'Gemiddeld · tot 10',
    hard: 'Moeilijk · tot 20',
    menu: '☰ Menu',
    wellDone: 'Goed geteld! 🔢',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Tel goed en tik dan op het juiste getal.',

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
    instruction: 'Tik de groepjes van minste naar meeste aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'Counting Fun',
    tagline: 'Zähle und erkenne Zahlen,\nvon 1 bis 20.',
    easy: 'Leicht · bis 5',
    medium: 'Mittel · bis 10',
    hard: 'Schwer · bis 20',
    menu: '☰ Menü',
    wellDone: 'Gut gezählt! 🔢',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Zähle sorgfältig, dann tippe die richtige Zahl an.',

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
    instruction: 'Tippe die Gruppen von wenigsten zu meisten an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    title: 'Counting Fun',
    tagline: 'Cuenta y reconoce números,\ndel 1 al 20.',
    easy: 'Fácil · hasta 5',
    medium: 'Medio · hasta 10',
    hard: 'Difícil · hasta 20',
    menu: '☰ Menú',
    wellDone: '¡Bien contado! 🔢',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Cuenta con cuidado y toca el número correcto.',

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
    instruction: 'Toca los grupos de menos a más',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    title: 'Counting Fun',
    tagline: 'Compte et reconnais les nombres,\nde 1 à 20.',
    easy: 'Facile · jusqu’à 5',
    medium: 'Moyen · jusqu’à 10',
    hard: 'Difficile · jusqu’à 20',
    menu: '☰ Menu',
    wellDone: 'Bien compté ! 🔢',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Compte bien, puis touche le bon nombre.',

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
    instruction: 'Touche les groupes du moins nombreux au plus nombreux',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
  ar: {
    title: 'Counting Fun',
    tagline: 'عدّ الأرقام وتعرّف عليها،\nمن 1 إلى 20.',
    easy: 'سهل · حتى 5',
    medium: 'متوسط · حتى 10',
    hard: 'صعب · حتى 20',
    menu: '☰ القائمة',
    wellDone: 'أحسنت العد! 🔢',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'عدّ بعناية، ثم اضغط على الرقم الصحيح.',

    modeQuiz: 'اختبار',
    round: (i, total) => `الجولة ${i} / ${total}`,
    score: (n) => `النقاط: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} صحيحة`,

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeSequence: 'ترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على المجموعات من الأقل إلى الأكثر',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,
  },
};

export const t = createI18n(STRINGS, getLang);
