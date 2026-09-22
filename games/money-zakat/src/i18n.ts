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

  modeTrueFalse: string;
  trueLabel: string;
  falseLabel: string;
  trueFalseStatement: (equation: string) => string;

  modeFillBlank: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Money & Zakat Math',
    tagline: 'Needs vs. wants, discounts and percentages,\nand calculating zakat.',
    easy: 'Easy · Needs, Wants & Money',
    medium: 'Medium · Percentages & Discounts',
    hard: 'Hard · Zakat Calculation',
    menu: '☰ Menu',
    wellDone: 'Smart with money! 💰',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Zakat here uses the simplified 2.5%-of-savings rule taught to beginners.',
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
    instruction: 'Tap the amounts from smallest to largest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,

    modeTrueFalse: '✓✗ True/False',
    trueLabel: 'True',
    falseLabel: 'False',
    trueFalseStatement: (equation) => `${equation} — true or false?`,

    modeFillBlank: '✏️ Fill in the Blank',
  },
  nl: {
    title: 'Money & Zakat Math',
    tagline: 'Behoeften versus wensen, kortingen en procenten,\nen zakat berekenen.',
    easy: 'Makkelijk · Behoeften, Wensen & Geld',
    medium: 'Gemiddeld · Procenten & Korting',
    hard: 'Moeilijk · Zakat Berekenen',
    menu: '☰ Menu',
    wellDone: 'Slim met geld! 💰',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Zakat gebruikt hier de vereenvoudigde regel van 2,5% over spaargeld.',
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
    instruction: 'Tik de bedragen van klein naar groot aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,

    modeTrueFalse: '✓✗ Waar/Niet waar',
    trueLabel: 'Waar',
    falseLabel: 'Niet waar',
    trueFalseStatement: (equation) => `${equation} — waar of niet waar?`,

    modeFillBlank: '✏️ Vul het Cijfer In',
  },
  de: {
    title: 'Money & Zakat Math',
    tagline: 'Bedürfnisse und Wünsche, Rabatte und Prozente,\nund die Berechnung der Zakat.',
    easy: 'Leicht · Bedürfnisse, Wünsche & Geld',
    medium: 'Mittel · Prozente & Rabatte',
    hard: 'Schwer · Zakat-Berechnung',
    menu: '☰ Menü',
    wellDone: 'Klug mit Geld! 💰',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Zakat nutzt hier die vereinfachte Regel: 2,5% des Ersparten.',
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
    instruction: 'Tippe die Beträge vom kleinsten zum größten an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,

    modeTrueFalse: '✓✗ Wahr/Falsch',
    trueLabel: 'Wahr',
    falseLabel: 'Falsch',
    trueFalseStatement: (equation) => `${equation} — wahr oder falsch?`,

    modeFillBlank: '✏️ Ziffer Einsetzen',
  },
  es: {
    title: 'Money & Zakat Math',
    tagline: 'Necesidades y deseos, descuentos y porcentajes,\ny cómo calcular el zakat.',
    easy: 'Fácil · Necesidades, deseos y dinero',
    medium: 'Medio · Porcentajes y descuentos',
    hard: 'Difícil · Cálculo del zakat',
    menu: '☰ Menú',
    wellDone: '¡Listo con el dinero! 💰',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Aquí el zakat usa la regla simplificada del 2,5% de los ahorros.',
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
    instruction: 'Toca las cantidades de menor a mayor',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,

    modeTrueFalse: '✓✗ Verdadero/Falso',
    trueLabel: 'Verdadero',
    falseLabel: 'Falso',
    trueFalseStatement: (equation) => `${equation} — ¿verdadero o falso?`,

    modeFillBlank: '✏️ Completa el Dígito',
  },
  fr: {
    title: 'Money & Zakat Math',
    tagline: 'Besoins et envies, remises et pourcentages,\net le calcul de la zakat.',
    easy: 'Facile · Besoins, envies et argent',
    medium: 'Moyen · Pourcentages et remises',
    hard: 'Difficile · Calcul de la zakat',
    menu: '☰ Menu',
    wellDone: 'Malin avec l’argent ! 💰',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Ici, la zakat suit la règle simplifiée de 2,5 % de l’épargne.',
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
    instruction: 'Touche les montants du plus petit au plus grand',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,

    modeTrueFalse: '✓✗ Vrai/Faux',
    trueLabel: 'Vrai',
    falseLabel: 'Faux',
    trueFalseStatement: (equation) => `${equation} — vrai ou faux ?`,

    modeFillBlank: '✏️ Complète le Chiffre',
  },
  ar: {
    title: 'Money & Zakat Math',
    tagline: 'الاحتياجات مقابل الرغبات، الخصومات والنسب المئوية،\nوحساب الزكاة.',
    easy: 'سهل · الاحتياجات والرغبات والمال',
    medium: 'متوسط · النسب المئوية والخصومات',
    hard: 'صعب · حساب الزكاة',
    menu: '☰ القائمة',
    wellDone: 'بارع في إدارة المال! 💰',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة للقائمة',
    footer: 'تعتمد الزكاة هنا على القاعدة المبسطة: 2.5% من المدخرات، كما تُعلَّم للمبتدئين.',
    tierEasy: 'سهل',
    tierMedium: 'متوسط',
    tierHard: 'صعب',

    modeQuiz: 'اختبار',
    round: (i, total) => `الجولة ${i} / ${total}`,
    score: (n) => `النتيجة: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} صحيحة`,

    modeMatch: 'طابق',
    moves: (n) => `الحركات: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} أزواج تمت مطابقتها في ${moves} حركة\nالوقت: ${time}`,
    nextLevelHint: 'الجولة التالية تبدأ…',

    modeSequence: 'ترتيب',
    mistakes: (n) => `الأخطاء: ${n}`,
    instruction: 'اضغط على المبالغ من الأصغر إلى الأكبر',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,

    modeTrueFalse: '✓✗ صح/خطأ',
    trueLabel: 'صح',
    falseLabel: 'خطأ',
    trueFalseStatement: (equation) => `${equation} — صح أم خطأ؟`,

    modeFillBlank: '✏️ أكمل الرقم',
  },
};

export const t = createI18n(STRINGS, getLang);
