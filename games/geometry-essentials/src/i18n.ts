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
    title: 'Geometry Essentials',
    tagline: 'Area, perimeter, angles and\nthe Pythagorean theorem.',
    easy: 'Easy · Area & Perimeter',
    medium: 'Medium · Triangles & Circles',
    hard: 'Hard · Pythagorean Theorem',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Well shaped! 📐',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Sketch it on paper if it helps — geometry rewards a quick drawing.',
  },
  nl: {
    title: 'Geometry Essentials',
    tagline: 'Oppervlakte, omtrek, hoeken en\nde stelling van Pythagoras.',
    easy: 'Makkelijk · Oppervlakte & Omtrek',
    medium: 'Gemiddeld · Driehoeken & Cirkels',
    hard: 'Moeilijk · Stelling van Pythagoras',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Goed gevormd! 📐',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Teken het op papier als dat helpt — meetkunde is makkelijker met een schets.',
  },
  de: {
    title: 'Geometry Essentials',
    tagline: 'Fläche, Umfang, Winkel und\nder Satz des Pythagoras.',
    easy: 'Leicht · Fläche & Umfang',
    medium: 'Mittel · Dreiecke & Kreise',
    hard: 'Schwer · Satz des Pythagoras',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Gut geformt! 📐',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Zeichne es auf Papier, wenn es hilft — eine Skizze macht Geometrie leichter.',
  },
  es: {
    title: 'Geometry Essentials',
    tagline: 'Área, perímetro, ángulos y\nel teorema de Pitágoras.',
    easy: 'Fácil · Área y perímetro',
    medium: 'Medio · Triángulos y círculos',
    hard: 'Difícil · Teorema de Pitágoras',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Bien formado! 📐',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Dibújalo en papel si te ayuda — un boceto facilita la geometría.',
  },
  fr: {
    title: 'Geometry Essentials',
    tagline: 'Aire, périmètre, angles et\nle théorème de Pythagore.',
    easy: 'Facile · Aire et périmètre',
    medium: 'Moyen · Triangles et cercles',
    hard: 'Difficile · Théorème de Pythagore',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Bien formé ! 📐',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Dessine-le sur papier si ça aide — un croquis facilite la géométrie.',
  },
};

export const t = createI18n(STRINGS, getLang);
