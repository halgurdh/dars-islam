import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  shapes: string;
  colors: string;
  mixed: string;
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
    title: 'Shapes & Colors',
    tagline: 'Learn your shapes and colors\nby playing simple matching games.',
    shapes: 'Shapes',
    colors: 'Colors',
    mixed: 'Mixed',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Great job! 🎨',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Tap the picture that matches the question.',
  },
  nl: {
    title: 'Shapes & Colors',
    tagline: 'Leer vormen en kleuren\nmet simpele spelletjes.',
    shapes: 'Vormen',
    colors: 'Kleuren',
    mixed: 'Gemengd',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Goed gedaan! 🎨',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Tik op het plaatje dat bij de vraag past.',
  },
  de: {
    title: 'Shapes & Colors',
    tagline: 'Lerne Formen und Farben\nmit einfachen Spielen.',
    shapes: 'Formen',
    colors: 'Farben',
    mixed: 'Gemischt',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Gut gemacht! 🎨',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Tippe auf das Bild, das zur Frage passt.',
  },
  es: {
    title: 'Shapes & Colors',
    tagline: 'Aprende formas y colores\ncon juegos sencillos.',
    shapes: 'Formas',
    colors: 'Colores',
    mixed: 'Mixto',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Muy bien! 🎨',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Toca la imagen que coincide con la pregunta.',
  },
  fr: {
    title: 'Shapes & Colors',
    tagline: 'Apprends les formes et les couleurs\navec des jeux simples.',
    shapes: 'Formes',
    colors: 'Couleurs',
    mixed: 'Mixte',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Bravo ! 🎨',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Touche l’image qui correspond à la question.',
  },
};

export const t = createI18n(STRINGS, getLang);
