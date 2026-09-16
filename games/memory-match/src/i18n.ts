import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  subtitle: string;
  tagline: string;
  itemsLearned: (n: number, total: number) => string;
  easy: string;
  medium: string;
  hard: string;
  soundOn: string;
  soundOff: string;
  langToggle: string;
  footer: string;
  menu: string;
  moves: (n: number) => string;
  wellDone: string;
  roundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    subtitle: 'Memory Match',
    tagline: 'Flip the cards and match each picture\nto its name.',
    itemsLearned: (n, total) => `${n} / ${total} items learned`,
    easy: 'Easy · 6 pairs',
    medium: 'Medium · 8 pairs',
    hard: 'Hard · 10 pairs',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    moves: (n) => `Moves: ${n}`,
    wellDone: 'Well done! 🎉',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} items learned overall`,
    nextLevelHint: 'Next level starting…',
  },
  nl: {
    subtitle: 'Memory Match',
    tagline: 'Draai de kaarten om en koppel elk plaatje\naan zijn naam.',
    itemsLearned: (n, total) => `${n} / ${total} items geleerd`,
    easy: 'Makkelijk · 6 paren',
    medium: 'Gemiddeld · 8 paren',
    hard: 'Moeilijk · 10 paren',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    moves: (n) => `Zetten: ${n}`,
    wellDone: 'Goed gedaan! 🎉',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} items in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
  },
  de: {
    subtitle: 'Memory Match',
    tagline: 'Drehe die Karten um und finde zu jedem Bild\nden passenden Namen.',
    itemsLearned: (n, total) => `${n} / ${total} Dinge gelernt`,
    easy: 'Leicht · 6 Paare',
    medium: 'Mittel · 8 Paare',
    hard: 'Schwer · 10 Paare',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    moves: (n) => `Züge: ${n}`,
    wellDone: 'Gut gemacht! 🎉',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Dinge insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',
  },
  es: {
    subtitle: 'Memory Match',
    tagline: 'Voltea las cartas y une cada imagen\ncon su nombre.',
    itemsLearned: (n, total) => `${n} / ${total} elementos aprendidos`,
    easy: 'Fácil · 6 pares',
    medium: 'Medio · 8 pares',
    hard: 'Difícil · 10 pares',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    moves: (n) => `Movimientos: ${n}`,
    wellDone: '¡Bien hecho! 🎉',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} elementos aprendidos en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',
  },
  fr: {
    subtitle: 'Memory Match',
    tagline: 'Retourne les cartes et associe chaque image\nà son nom.',
    itemsLearned: (n, total) => `${n} / ${total} éléments appris`,
    easy: 'Facile · 6 paires',
    medium: 'Moyen · 8 paires',
    hard: 'Difficile · 10 paires',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    moves: (n) => `Coups : ${n}`,
    wellDone: 'Bien joué ! 🎉',
    roundSummary: (pairs, moves, time, learned, total) =>
      `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} éléments appris au total`,
    nextLevelHint: 'Le niveau suivant commence…',
  },
};

export const t = createI18n(STRINGS, getLang);
