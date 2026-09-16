import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  round: (i: number, total: number) => string;
  score: (n: number) => string;
  menu: string;
  wellDone: string;
  roundSummary: (score: number, total: number) => string;
  playAgain: string;
  backToMenu: string;
  footer: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Number Basics',
    tagline: 'Addition & subtraction practice\nfrom counting to two-digit sums.',
    easy: 'Easy · sums to 10',
    medium: 'Medium · to 20, + and −',
    hard: 'Hard · two digits, to 100',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Well done! 🔢',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: '💡 Tip: for + facts, count on from the bigger number.\nFor −, ask "what’s missing to reach the total?"',
  },
  nl: {
    title: 'Number Basics',
    tagline: 'Oefen optellen & aftrekken,\nvan tellen tot tweecijferige sommen.',
    easy: 'Makkelijk · sommen tot 10',
    medium: 'Gemiddeld · tot 20, + en −',
    hard: 'Moeilijk · twee cijfers, tot 100',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Goed gedaan! 🔢',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: '💡 Tip: bij + tel je door vanaf het grootste getal.\nBij − vraag je: "wat mist er om bij het totaal te komen?"',
  },
  de: {
    title: 'Number Basics',
    tagline: 'Übe Addition & Subtraktion,\nvom Zählen bis zu zweistelligen Summen.',
    easy: 'Leicht · Summen bis 10',
    medium: 'Mittel · bis 20, + und −',
    hard: 'Schwer · zweistellig, bis 100',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Gut gemacht! 🔢',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: '💡 Tipp: Bei + zählst du von der größeren Zahl weiter.\nBei − frag: "Was fehlt bis zur Gesamtsumme?"',
  },
  es: {
    title: 'Number Basics',
    tagline: 'Practica sumas y restas,\ndesde contar hasta sumas de dos cifras.',
    easy: 'Fácil · sumas hasta 10',
    medium: 'Medio · hasta 20, + y −',
    hard: 'Difícil · dos cifras, hasta 100',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Bien hecho! 🔢',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: '💡 Consejo: para +, cuenta a partir del número mayor.\nPara −, pregunta: "¿qué falta para llegar al total?"',
  },
  fr: {
    title: 'Number Basics',
    tagline: 'Entraîne-toi à additionner et soustraire,\ndu comptage aux sommes à deux chiffres.',
    easy: 'Facile · sommes jusqu’à 10',
    medium: 'Moyen · jusqu’à 20, + et −',
    hard: 'Difficile · deux chiffres, jusqu’à 100',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Bien joué ! 🔢',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: '💡 Astuce : pour +, compte à partir du plus grand nombre.\nPour −, demande : "que manque-t-il pour atteindre le total ?"',
  },
};

export const t = createI18n(STRINGS, getLang);
