import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  round: (i: number, total: number) => string;
  mistakes: (n: number) => string;
  menu: string;
  instruction: string;
  wellDone: string;
  roundSummary: (perfectRounds: number, totalRounds: number) => string;
  playAgain: string;
  backToMenu: string;
  footer: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'World History',
    tagline: 'Put major world history\nmilestones in order.',
    easy: 'Easy · 4 Events',
    medium: 'Medium · 5 Events',
    hard: 'Hard · 6 Events',
    round: (i, total) => `Round ${i} / ${total}`,
    mistakes: (n) => `Mistakes: ${n}`,
    menu: '☰ Menu',
    instruction: 'Tap the events in the order they happened.',
    wellDone: 'History mastered! 🏛️',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rounds with no mistakes`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Think in centuries, not exact years — the big picture is what matters here.',
  },
  nl: {
    title: 'World History',
    tagline: 'Zet belangrijke mijlpalen uit de\nwereldgeschiedenis op volgorde.',
    easy: 'Makkelijk · 4 Gebeurtenissen',
    medium: 'Gemiddeld · 5 Gebeurtenissen',
    hard: 'Moeilijk · 6 Gebeurtenissen',
    round: (i, total) => `Ronde ${i} / ${total}`,
    mistakes: (n) => `Fouten: ${n}`,
    menu: '☰ Menu',
    instruction: 'Tik de gebeurtenissen aan in de volgorde waarin ze gebeurden.',
    wellDone: 'Geschiedenis onder de knie! 🏛️',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondes zonder fouten`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Denk in eeuwen, niet in exacte jaartallen — het grote plaatje telt hier.',
  },
  de: {
    title: 'World History',
    tagline: 'Bring wichtige Meilensteine der\nWeltgeschichte in die richtige Reihenfolge.',
    easy: 'Leicht · 4 Ereignisse',
    medium: 'Mittel · 5 Ereignisse',
    hard: 'Schwer · 6 Ereignisse',
    round: (i, total) => `Runde ${i} / ${total}`,
    mistakes: (n) => `Fehler: ${n}`,
    menu: '☰ Menü',
    instruction: 'Tippe die Ereignisse in der Reihenfolge an, in der sie geschahen.',
    wellDone: 'Geschichte gemeistert! 🏛️',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} Runden ohne Fehler`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Denke in Jahrhunderten, nicht in genauen Jahren — das große Ganze zählt hier.',
  },
  es: {
    title: 'World History',
    tagline: 'Ordena hitos importantes de\nla historia mundial.',
    easy: 'Fácil · 4 eventos',
    medium: 'Medio · 5 eventos',
    hard: 'Difícil · 6 eventos',
    round: (i, total) => `Ronda ${i} / ${total}`,
    mistakes: (n) => `Errores: ${n}`,
    menu: '☰ Menú',
    instruction: 'Toca los eventos en el orden en que ocurrieron.',
    wellDone: '¡Historia dominada! 🏛️',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondas sin errores`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Piensa en siglos, no en años exactos — aquí importa el panorama general.',
  },
  fr: {
    title: 'World History',
    tagline: "Mets en ordre des jalons importants\nde l'histoire mondiale.",
    easy: 'Facile · 4 événements',
    medium: 'Moyen · 5 événements',
    hard: 'Difficile · 6 événements',
    round: (i, total) => `Manche ${i} / ${total}`,
    mistakes: (n) => `Erreurs : ${n}`,
    menu: '☰ Menu',
    instruction: "Touche les événements dans l'ordre où ils se sont produits.",
    wellDone: 'Histoire maîtrisée ! 🏛️',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} manches sans erreur`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: "Pense en siècles, pas en années exactes — c'est la vue d'ensemble qui compte ici.",
  },
};

export const t = createI18n(STRINGS, getLang);
