import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  start: string;
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
    title: 'Kind Hearts',
    tagline: 'Simple lessons in kindness,\nsharing and understanding feelings.',
    start: '▶ Start (10 questions)',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Kind heart! 💛',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'There’s always a kind choice — can you spot it?',
  },
  nl: {
    title: 'Kind Hearts',
    tagline: 'Simpele lessen over vriendelijkheid,\ndelen en gevoelens begrijpen.',
    start: '▶ Start (10 vragen)',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Wat aardig! 💛',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Er is altijd een vriendelijke keuze — kun je die vinden?',
  },
  de: {
    title: 'Kind Hearts',
    tagline: 'Einfache Lektionen über Freundlichkeit,\nTeilen und Gefühle verstehen.',
    start: '▶ Start (10 Fragen)',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Wie freundlich! 💛',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Es gibt immer eine freundliche Wahl — findest du sie?',
  },
  es: {
    title: 'Kind Hearts',
    tagline: 'Lecciones sencillas sobre bondad,\ncompartir y entender los sentimientos.',
    start: '▶ Empezar (10 preguntas)',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Qué amable! 💛',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Siempre hay una opción amable — ¿puedes encontrarla?',
  },
  fr: {
    title: 'Kind Hearts',
    tagline: 'De petites leçons sur la gentillesse,\nle partage et les émotions.',
    start: '▶ Commencer (10 questions)',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Quel bon cœur ! 💛',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Il y a toujours un choix gentil — peux-tu le trouver ?',
  },
};

export const t = createI18n(STRINGS, getLang);
