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
    title: 'Times Table Dojo',
    tagline: 'Master the multiplication tables\nfrom 1 to 12.',
    easy: 'Easy · tables 1–5',
    medium: 'Medium · tables 1–9',
    hard: 'Hard · tables 1–12',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Dojo cleared! 🥋',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: '💡 Tip: ×2 is just doubling, ×10 adds a zero.\nFor ×9 and ×11 shortcuts, see Math Tricks Lab!',
  },
  nl: {
    title: 'Times Table Dojo',
    tagline: 'Beheers de tafels van vermenigvuldiging\nvan 1 tot 12.',
    easy: 'Makkelijk · tafels 1–5',
    medium: 'Gemiddeld · tafels 1–9',
    hard: 'Moeilijk · tafels 1–12',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Dojo voltooid! 🥋',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: '💡 Tip: ×2 is verdubbelen, ×10 is een nul erbij.\nVoor ×9 en ×11 trucjes, zie Math Tricks Lab!',
  },
  de: {
    title: 'Times Table Dojo',
    tagline: 'Beherrsche die Einmaleins-Reihen\nvon 1 bis 12.',
    easy: 'Leicht · Reihen 1–5',
    medium: 'Mittel · Reihen 1–9',
    hard: 'Schwer · Reihen 1–12',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Dojo gemeistert! 🥋',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: '💡 Tipp: ×2 ist verdoppeln, ×10 fügt eine Null an.\nFür ×9 und ×11 Tricks, siehe Math Tricks Lab!',
  },
  es: {
    title: 'Times Table Dojo',
    tagline: 'Domina las tablas de multiplicar\ndel 1 al 12.',
    easy: 'Fácil · tablas 1–5',
    medium: 'Medio · tablas 1–9',
    hard: 'Difícil · tablas 1–12',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Dojo completado! 🥋',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: '💡 Consejo: ×2 es duplicar, ×10 añade un cero.\nPara trucos de ×9 y ×11, ¡visita Math Tricks Lab!',
  },
  fr: {
    title: 'Times Table Dojo',
    tagline: 'Maîtrise les tables de multiplication\nde 1 à 12.',
    easy: 'Facile · tables 1–5',
    medium: 'Moyen · tables 1–9',
    hard: 'Difficile · tables 1–12',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Dojo terminé ! 🥋',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: '💡 Astuce : ×2 double, ×10 ajoute un zéro.\nPour les astuces ×9 et ×11, va voir Math Tricks Lab !',
  },
};

export const t = createI18n(STRINGS, getLang);
