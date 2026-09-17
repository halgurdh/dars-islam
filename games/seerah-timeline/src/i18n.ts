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
    title: 'Seerah Timeline',
    tagline: 'Put key events in the life of\nProphet Muhammad (peace be upon him) in order.',
    easy: 'Easy · 4 Events',
    medium: 'Medium · 5 Events',
    hard: 'Hard · 6 Events',
    round: (i, total) => `Round ${i} / ${total}`,
    mistakes: (n) => `Mistakes: ${n}`,
    menu: '☰ Menu',
    instruction: 'Tap the events in the order they happened.',
    wellDone: 'Excellent, ما شاء الله! 📖',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rounds with no mistakes`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Think about what had to happen first — the order usually makes sense once you do.',
  },
  nl: {
    title: 'Seerah Timeline',
    tagline: 'Zet belangrijke gebeurtenissen uit het leven van\nProfeet Mohammed (vrede zij met hem) op volgorde.',
    easy: 'Makkelijk · 4 Gebeurtenissen',
    medium: 'Gemiddeld · 5 Gebeurtenissen',
    hard: 'Moeilijk · 6 Gebeurtenissen',
    round: (i, total) => `Ronde ${i} / ${total}`,
    mistakes: (n) => `Fouten: ${n}`,
    menu: '☰ Menu',
    instruction: 'Tik de gebeurtenissen aan in de volgorde waarin ze gebeurden.',
    wellDone: 'Uitstekend, ما شاء الله! 📖',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondes zonder fouten`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Denk na over wat eerst moest gebeuren — de volgorde is dan vaak logisch.',
  },
  de: {
    title: 'Seerah Timeline',
    tagline: 'Bring wichtige Ereignisse im Leben von Prophet\nMuhammad (Friede sei mit ihm) in die richtige Reihenfolge.',
    easy: 'Leicht · 4 Ereignisse',
    medium: 'Mittel · 5 Ereignisse',
    hard: 'Schwer · 6 Ereignisse',
    round: (i, total) => `Runde ${i} / ${total}`,
    mistakes: (n) => `Fehler: ${n}`,
    menu: '☰ Menü',
    instruction: 'Tippe die Ereignisse in der Reihenfolge an, in der sie geschahen.',
    wellDone: 'Ausgezeichnet, ما شاء الله! 📖',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} Runden ohne Fehler`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Überlege, was zuerst passieren musste — die Reihenfolge ergibt dann meist Sinn.',
  },
  es: {
    title: 'Seerah Timeline',
    tagline: 'Ordena eventos clave en la vida del\nProfeta Muhammad (la paz sea con él).',
    easy: 'Fácil · 4 eventos',
    medium: 'Medio · 5 eventos',
    hard: 'Difícil · 6 eventos',
    round: (i, total) => `Ronda ${i} / ${total}`,
    mistakes: (n) => `Errores: ${n}`,
    menu: '☰ Menú',
    instruction: 'Toca los eventos en el orden en que ocurrieron.',
    wellDone: '¡Excelente, ما شاء الله! 📖',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondas sin errores`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Piensa en qué tuvo que pasar primero — el orden suele tener sentido así.',
  },
  fr: {
    title: 'Seerah Timeline',
    tagline: 'Mets en ordre des événements clés de la vie\ndu Prophète Muhammad (paix sur lui).',
    easy: 'Facile · 4 événements',
    medium: 'Moyen · 5 événements',
    hard: 'Difficile · 6 événements',
    round: (i, total) => `Manche ${i} / ${total}`,
    mistakes: (n) => `Erreurs : ${n}`,
    menu: '☰ Menu',
    instruction: 'Touche les événements dans l\'ordre où ils se sont produits.',
    wellDone: 'Excellent, ما شاء الله ! 📖',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} manches sans erreur`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Pense à ce qui devait se passer en premier — l\'ordre a alors du sens.',
  },
};

export const t = createI18n(STRINGS, getLang);
