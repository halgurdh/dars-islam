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
    title: 'Earth & Space Science',
    tagline: 'Put the planets in order\nof distance from the sun.',
    easy: 'Easy · 4 Planets',
    medium: 'Medium · 5 Planets',
    hard: 'Hard · 6 Planets',
    round: (i, total) => `Round ${i} / ${total}`,
    mistakes: (n) => `Mistakes: ${n}`,
    menu: '☰ Menu',
    instruction: 'Tap the planets in order, starting closest to the sun.',
    wellDone: 'Stellar work! 🪐',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rounds with no mistakes`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'My Very Educated Mother Just Served Us Noodles — a classic memory trick for planet order.',
  },
  nl: {
    title: 'Earth & Space Science',
    tagline: 'Zet de planeten op volgorde\nvan afstand tot de zon.',
    easy: 'Makkelijk · 4 Planeten',
    medium: 'Gemiddeld · 5 Planeten',
    hard: 'Moeilijk · 6 Planeten',
    round: (i, total) => `Ronde ${i} / ${total}`,
    mistakes: (n) => `Fouten: ${n}`,
    menu: '☰ Menu',
    instruction: 'Tik de planeten aan op volgorde, beginnend dichtst bij de zon.',
    wellDone: 'Stellair werk! 🪐',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondes zonder fouten`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Bedenk een eigen ezelsbruggetje voor de volgorde van de planeten — dat helpt echt.',
  },
  de: {
    title: 'Earth & Space Science',
    tagline: 'Bring die Planeten in die Reihenfolge\nihrer Entfernung von der Sonne.',
    easy: 'Leicht · 4 Planeten',
    medium: 'Mittel · 5 Planeten',
    hard: 'Schwer · 6 Planeten',
    round: (i, total) => `Runde ${i} / ${total}`,
    mistakes: (n) => `Fehler: ${n}`,
    menu: '☰ Menü',
    instruction: 'Tippe die Planeten der Reihe nach an, beginnend bei der Sonne.',
    wellDone: 'Stellare Arbeit! 🪐',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} Runden ohne Fehler`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Denk dir einen eigenen Merksatz für die Planetenreihenfolge aus — das hilft wirklich.',
  },
  es: {
    title: 'Earth & Space Science',
    tagline: 'Ordena los planetas según su\ndistancia al sol.',
    easy: 'Fácil · 4 planetas',
    medium: 'Medio · 5 planetas',
    hard: 'Difícil · 6 planetas',
    round: (i, total) => `Ronda ${i} / ${total}`,
    mistakes: (n) => `Errores: ${n}`,
    menu: '☰ Menú',
    instruction: 'Toca los planetas en orden, empezando por el más cercano al sol.',
    wellDone: '¡Trabajo estelar! 🪐',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondas sin errores`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Inventa tu propio truco para recordar el orden de los planetas — funciona de verdad.',
  },
  fr: {
    title: 'Earth & Space Science',
    tagline: 'Mets les planètes en ordre\nselon leur distance au soleil.',
    easy: 'Facile · 4 planètes',
    medium: 'Moyen · 5 planètes',
    hard: 'Difficile · 6 planètes',
    round: (i, total) => `Manche ${i} / ${total}`,
    mistakes: (n) => `Erreurs : ${n}`,
    menu: '☰ Menu',
    instruction: "Touche les planètes dans l'ordre, en commençant par la plus proche du soleil.",
    wellDone: 'Travail stellaire ! 🪐',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} manches sans erreur`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: "Invente ton propre moyen mnémotechnique pour l'ordre des planètes — ça marche vraiment.",
  },
};

export const t = createI18n(STRINGS, getLang);
