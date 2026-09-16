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
    title: 'Counting Fun',
    tagline: 'Count and recognize numbers,\nfrom 1 all the way to 20.',
    easy: 'Easy · up to 5',
    medium: 'Medium · up to 10',
    hard: 'Hard · up to 20',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Well counted! 🔢',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Count carefully, then tap the right number.',
  },
  nl: {
    title: 'Counting Fun',
    tagline: 'Tel en herken getallen,\nvan 1 tot 20.',
    easy: 'Makkelijk · tot 5',
    medium: 'Gemiddeld · tot 10',
    hard: 'Moeilijk · tot 20',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Goed geteld! 🔢',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Tel goed en tik dan op het juiste getal.',
  },
  de: {
    title: 'Counting Fun',
    tagline: 'Zähle und erkenne Zahlen,\nvon 1 bis 20.',
    easy: 'Leicht · bis 5',
    medium: 'Mittel · bis 10',
    hard: 'Schwer · bis 20',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Gut gezählt! 🔢',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Zähle sorgfältig, dann tippe die richtige Zahl an.',
  },
  es: {
    title: 'Counting Fun',
    tagline: 'Cuenta y reconoce números,\ndel 1 al 20.',
    easy: 'Fácil · hasta 5',
    medium: 'Medio · hasta 10',
    hard: 'Difícil · hasta 20',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Bien contado! 🔢',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Cuenta con cuidado y toca el número correcto.',
  },
  fr: {
    title: 'Counting Fun',
    tagline: 'Compte et reconnais les nombres,\nde 1 à 20.',
    easy: 'Facile · jusqu’à 5',
    medium: 'Moyen · jusqu’à 10',
    hard: 'Difficile · jusqu’à 20',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Bien compté ! 🔢',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Compte bien, puis touche le bon nombre.',
  },
};

export const t = createI18n(STRINGS, getLang);
