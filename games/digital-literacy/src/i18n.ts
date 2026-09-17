import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  easy: string;
  medium: string;
  hard: string;
  menu: string;
  moves: (n: number) => string;
  wellDone: string;
  roundSummary: (pairs: number, moves: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;
  soundOn: string;
  soundOff: string;
  footer: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    title: 'Digital Literacy',
    tagline: 'Match each tech term\nto its meaning.',
    easy: 'Easy · 6 pairs',
    medium: 'Medium · 8 pairs',
    hard: 'Hard · 10 pairs',
    menu: '☰ Menu',
    moves: (n) => `Moves: ${n}`,
    wellDone: 'Smart and safe! 💻',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pairs matched in ${moves} moves\nTime: ${time}\n${learned} / ${total} terms learned overall`,
    nextLevelHint: 'Next round starting…',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    footer: 'When in doubt online, ask a trusted adult before you click.',
  },
  nl: {
    title: 'Digital Literacy',
    tagline: 'Koppel elke techterm aan\nzijn betekenis.',
    easy: 'Makkelijk · 6 paren',
    medium: 'Gemiddeld · 8 paren',
    hard: 'Moeilijk · 10 paren',
    menu: '☰ Menu',
    moves: (n) => `Zetten: ${n}`,
    wellDone: 'Slim en veilig! 💻',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paren gematcht in ${moves} zetten\nTijd: ${time}\n${learned} / ${total} termen in totaal geleerd`,
    nextLevelHint: 'Volgende ronde begint…',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    footer: 'Twijfel je online ergens over? Vraag het eerst aan een volwassene die je vertrouwt.',
  },
  de: {
    title: 'Digital Literacy',
    tagline: 'Ordne jedem Technikbegriff\nseine Bedeutung zu.',
    easy: 'Leicht · 6 Paare',
    medium: 'Mittel · 8 Paare',
    hard: 'Schwer · 10 Paare',
    menu: '☰ Menü',
    moves: (n) => `Züge: ${n}`,
    wellDone: 'Klug und sicher! 💻',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} Paare gefunden in ${moves} Zügen\nZeit: ${time}\n${learned} / ${total} Begriffe insgesamt gelernt`,
    nextLevelHint: 'Nächste Runde startet…',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    footer: 'Bist du dir online unsicher? Frag zuerst einen Erwachsenen, dem du vertraust.',
  },
  es: {
    title: 'Digital Literacy',
    tagline: 'Une cada término tecnológico\ncon su significado.',
    easy: 'Fácil · 6 pares',
    medium: 'Medio · 8 pares',
    hard: 'Difícil · 10 pares',
    menu: '☰ Menú',
    moves: (n) => `Movimientos: ${n}`,
    wellDone: '¡Inteligente y seguro! 💻',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} pares emparejados en ${moves} movimientos\nTiempo: ${time}\n${learned} / ${total} términos aprendidos en total`,
    nextLevelHint: 'Comienza la siguiente ronda…',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    footer: 'Si tienes dudas en línea, pregunta primero a un adulto de confianza.',
  },
  fr: {
    title: 'Digital Literacy',
    tagline: 'Associe chaque terme technique\nà sa signification.',
    easy: 'Facile · 6 paires',
    medium: 'Moyen · 8 paires',
    hard: 'Difficile · 10 paires',
    menu: '☰ Menu',
    moves: (n) => `Coups : ${n}`,
    wellDone: 'Malin et prudent ! 💻',
    roundSummary: (pairs, moves, time, learned, total) => `${pairs} paires trouvées en ${moves} coups\nTemps : ${time}\n${learned} / ${total} termes appris au total`,
    nextLevelHint: 'La manche suivante commence…',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    footer: "En cas de doute en ligne, demande d'abord à un adulte de confiance.",
  },
};

export const t = createI18n(STRINGS, getLang);
