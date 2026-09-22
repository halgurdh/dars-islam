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
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Advanced Trigonometry',
    tagline: 'Sine, cosine, tangent,\nthe unit circle and identities.',
    easy: 'Easy · Ratios & Vocabulary',
    medium: 'Medium · Special Angles',
    hard: 'Hard · Radians & Identities',
    menu: '☰ Menu',
    wellDone: 'Right on angle! 📐',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Sketch the triangle and label the sides — SOH-CAH-TOA becomes obvious.',
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
    instruction: 'Tap the values from smallest to largest',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
  },
  nl: {
    title: 'Advanced Trigonometry',
    tagline: 'Sinus, cosinus, tangens,\nde eenheidscirkel en identiteiten.',
    easy: 'Makkelijk · Verhoudingen & Termen',
    medium: 'Gemiddeld · Speciale Hoeken',
    hard: 'Moeilijk · Radialen & Identiteiten',
    menu: '☰ Menu',
    wellDone: 'Precies goed! 📐',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Teken de driehoek en label de zijden — SOH-CAH-TOA wordt dan duidelijk.',
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
    instruction: 'Tik de waarden van klein naar groot aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'Advanced Trigonometry',
    tagline: 'Sinus, Kosinus, Tangens,\nder Einheitskreis und Identitäten.',
    easy: 'Leicht · Verhältnisse & Begriffe',
    medium: 'Mittel · Besondere Winkel',
    hard: 'Schwer · Bogenmaß & Identitäten',
    menu: '☰ Menü',
    wellDone: 'Genau richtig! 📐',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Zeichne das Dreieck und beschrifte die Seiten — SOH-CAH-TOA wird dann klar.',
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
    instruction: 'Tippe die Werte vom kleinsten zum größten an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
  },
  es: {
    title: 'Advanced Trigonometry',
    tagline: 'Seno, coseno, tangente,\nel círculo unitario e identidades.',
    easy: 'Fácil · Razones y vocabulario',
    medium: 'Medio · Ángulos especiales',
    hard: 'Difícil · Radianes e identidades',
    menu: '☰ Menú',
    wellDone: '¡En el ángulo correcto! 📐',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Dibuja el triángulo y etiqueta los lados — SOH-CAH-TOA se vuelve obvio.',
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
    instruction: 'Toca los valores de menor a mayor',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
  },
  fr: {
    title: 'Advanced Trigonometry',
    tagline: 'Sinus, cosinus, tangente,\nle cercle unité et les identités.',
    easy: 'Facile · Rapports et vocabulaire',
    medium: 'Moyen · Angles spéciaux',
    hard: 'Difficile · Radians et identités',
    menu: '☰ Menu',
    wellDone: 'Angle parfait ! 📐',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Dessine le triangle et nomme les côtés — SOH-CAH-TOA devient évident.',
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
    instruction: 'Touche les valeurs du plus petit au plus grand',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
  ar: {
    title: 'Advanced Trigonometry',
    tagline: 'الجيب وجيب التمام والظل،\nدائرة الوحدة والمتطابقات.',
    easy: 'سهل · النسب والمفردات',
    medium: 'متوسط · الزوايا الخاصة',
    hard: 'صعب · الراديان والمتطابقات',
    menu: '☰ القائمة',
    wellDone: 'إصابة في الزاوية الصحيحة! 📐',
    playAgain: '↻ العب مرة أخرى',
    backToMenu: '☰ العودة إلى القائمة',
    footer: 'ارسم المثلث وسمِّ الأضلاع — عندها تصبح قاعدة SOH-CAH-TOA واضحة.',
    tierEasy: 'سهل',
    tierMedium: 'متوسط',
    tierHard: 'صعب',

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
    instruction: 'اضغط على القيم من الأصغر إلى الأكبر',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} جولات مثالية`,
  },
};

export const t = createI18n(STRINGS, getLang);
