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
    title: 'Statistics Essentials',
    tagline: 'Mean, median, mode, reading charts\nand spotting outliers in data.',
    easy: 'Easy · Mean, Median, Mode',
    medium: 'Medium · Range & Charts',
    hard: 'Hard · Reading Data',
    menu: '☰ Menu',
    wellDone: 'Solid data sense! 📊',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Sort the numbers first — it makes median and range much easier.',

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
    title: 'Statistics Essentials',
    tagline: 'Gemiddelde, mediaan, modus, grafieken lezen\nen uitschieters in data herkennen.',
    easy: 'Makkelijk · Gemiddelde, Mediaan, Modus',
    medium: 'Gemiddeld · Bereik & Grafieken',
    hard: 'Moeilijk · Data Lezen',
    menu: '☰ Menu',
    wellDone: 'Sterk cijfergevoel! 📊',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Sorteer de getallen eerst — dat maakt mediaan en bereik veel makkelijker.',

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
    title: 'Statistics Essentials',
    tagline: 'Mittelwert, Median, Modus, Diagramme lesen\nund Ausreißer in Daten erkennen.',
    easy: 'Leicht · Mittelwert, Median, Modus',
    medium: 'Mittel · Spannweite & Diagramme',
    hard: 'Schwer · Daten Lesen',
    menu: '☰ Menü',
    wellDone: 'Gutes Zahlengefühl! 📊',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Sortiere die Zahlen zuerst — das macht Median und Spannweite viel einfacher.',

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
    title: 'Statistics Essentials',
    tagline: 'Media, mediana, moda, lectura de gráficos\ny cómo detectar valores atípicos.',
    easy: 'Fácil · Media, mediana, moda',
    medium: 'Medio · Rango y gráficos',
    hard: 'Difícil · Lectura de datos',
    menu: '☰ Menú',
    wellDone: '¡Buen sentido numérico! 📊',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Ordena los números primero — hace que la mediana y el rango sean más fáciles.',

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
    title: 'Statistics Essentials',
    tagline: 'Moyenne, médiane, mode, lecture de graphiques\net repérer les valeurs aberrantes.',
    easy: 'Facile · Moyenne, médiane, mode',
    medium: 'Moyen · Étendue et graphiques',
    hard: 'Difficile · Lecture de données',
    menu: '☰ Menu',
    wellDone: 'Bon sens des chiffres ! 📊',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Trie les nombres d’abord — cela facilite la médiane et l’étendue.',

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
    title: 'Statistics Essentials',
    tagline: 'المتوسط، الوسيط، المنوال، قراءة الرسوم البيانية\nواكتشاف القيم الشاذة في البيانات.',
    easy: 'سهل · المتوسط، الوسيط، المنوال',
    medium: 'متوسط · المدى والرسوم البيانية',
    hard: 'صعب · قراءة البيانات',
    menu: '☰ القائمة',
    wellDone: 'حس رياضي رائع! 📊',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'رتّب الأرقام أولًا — هذا يجعل الوسيط والمدى أسهل بكثير.',

    modeQuiz: 'اختبار',
    round: (i, total) => `الجولة ${i} / ${total}`,
    score: (n) => `النتيجة: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} إجابات صحيحة`,

    modeMatch: 'مطابقة',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeSequence: 'ترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على المسائل من الأصغر إلى الأكبر إجابةً',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,
  },
};

export const t = createI18n(STRINGS, getLang);
