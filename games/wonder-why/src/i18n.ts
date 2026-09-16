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
    title: 'Wonder Why',
    tagline: 'Fun facts about animals, weather,\nplants and how the world works.',
    start: '▶ Start (10 questions)',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'What a wonder! 🌱',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Every round mixes a fresh set of fun facts.',
  },
  nl: {
    title: 'Wonder Why',
    tagline: 'Leuke feitjes over dieren, weer,\nplanten en hoe de wereld werkt.',
    start: '▶ Start (10 vragen)',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Wat knap! 🌱',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Elke ronde krijg je een nieuwe mix van feitjes.',
  },
  de: {
    title: 'Wonder Why',
    tagline: 'Spannende Fakten über Tiere, Wetter,\nPflanzen und die Welt.',
    start: '▶ Start (10 Fragen)',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Wie spannend! 🌱',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Jede Runde bringt eine neue Mischung an Fakten.',
  },
  es: {
    title: 'Wonder Why',
    tagline: 'Datos divertidos sobre animales, el clima,\nlas plantas y cómo funciona el mundo.',
    start: '▶ Empezar (10 preguntas)',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Qué maravilla! 🌱',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Cada ronda mezcla un nuevo grupo de datos.',
  },
  fr: {
    title: 'Wonder Why',
    tagline: 'Des faits amusants sur les animaux, la météo,\nles plantes et le fonctionnement du monde.',
    start: '▶ Commencer (10 questions)',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Quelle merveille ! 🌱',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Chaque manche mélange un nouveau lot de faits.',
  },
};

export const t = createI18n(STRINGS, getLang);
