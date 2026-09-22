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

  modeQuiz: string;
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
    title: 'Number Basics',
    tagline: 'Addition & subtraction practice\nfrom counting to two-digit sums.',
    easy: 'Easy · sums to 10',
    medium: 'Medium · to 20, + and −',
    hard: 'Hard · two digits, to 100',
    round: (i, total) => `Round ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Well done! 🔢',
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: '💡 Tip: for + facts, count on from the bigger number.\nFor −, ask "what’s missing to reach the total?"',

    modeQuiz: 'Quiz',
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
    title: 'Number Basics',
    tagline: 'Oefen optellen & aftrekken,\nvan tellen tot tweecijferige sommen.',
    easy: 'Makkelijk · sommen tot 10',
    medium: 'Gemiddeld · tot 20, + en −',
    hard: 'Moeilijk · twee cijfers, tot 100',
    round: (i, total) => `Ronde ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Goed gedaan! 🔢',
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: '💡 Tip: bij + tel je door vanaf het grootste getal.\nBij − vraag je: "wat mist er om bij het totaal te komen?"',

    modeQuiz: 'Quiz',
    score: (n) => `Score: ${n}`,
    roundSummary: (score, total) => `${score} / ${total} goed`,

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}`,
    nextLevelHint: 'Volgende ronde begint…',

    modeSequence: 'Sorteren',
    mistakes: (n) => `Fouten: ${n}`,
    instruction: 'Tik de sommen van kleinste naar grootste antwoord aan',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
  },
  de: {
    title: 'Number Basics',
    tagline: 'Übe Addition & Subtraktion,\nvom Zählen bis zu zweistelligen Summen.',
    easy: 'Leicht · Summen bis 10',
    medium: 'Mittel · bis 20, + und −',
    hard: 'Schwer · zweistellig, bis 100',
    round: (i, total) => `Runde ${i} / ${total}`,
    menu: '☰ Menü',
    wellDone: 'Gut gemacht! 🔢',
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: '💡 Tipp: Bei + zählst du von der größeren Zahl weiter.\nBei − frag: "Was fehlt bis zur Gesamtsumme?"',

    modeQuiz: 'Quiz',
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
    title: 'Number Basics',
    tagline: 'Practica sumas y restas,\ndesde contar hasta sumas de dos cifras.',
    easy: 'Fácil · sumas hasta 10',
    medium: 'Medio · hasta 20, + y −',
    hard: 'Difícil · dos cifras, hasta 100',
    round: (i, total) => `Ronda ${i} / ${total}`,
    menu: '☰ Menú',
    wellDone: '¡Bien hecho! 🔢',
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: '💡 Consejo: para +, cuenta a partir del número mayor.\nPara −, pregunta: "¿qué falta para llegar al total?"',

    modeQuiz: 'Quiz',
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
    title: 'Number Basics',
    tagline: 'Entraîne-toi à additionner et soustraire,\ndu comptage aux sommes à deux chiffres.',
    easy: 'Facile · sommes jusqu’à 10',
    medium: 'Moyen · jusqu’à 20, + et −',
    hard: 'Difficile · deux chiffres, jusqu’à 100',
    round: (i, total) => `Manche ${i} / ${total}`,
    menu: '☰ Menu',
    wellDone: 'Bien joué ! 🔢',
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: '💡 Astuce : pour +, compte à partir du plus grand nombre.\nPour −, demande : "que manque-t-il pour atteindre le total ?"',

    modeQuiz: 'Quiz',
    score: (n) => `Score : ${n}`,
    roundSummary: (score, total) => `${score} / ${total} correctes`,

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}`,
    nextLevelHint: 'La manche suivante commence…',

    modeSequence: 'Trier',
    mistakes: (n) => `Erreurs : ${n}`,
    instruction: 'Touche les calculs du plus petit au plus grand résultat',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
  },
};

export const t = createI18n(STRINGS, getLang);
