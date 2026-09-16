import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  practice: (n: number) => string;
  back: string;
  prevPage: string;
  next: string;
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
    title: 'Math Mastery',
    tagline: 'The advanced set: multi-digit multiplication,\nsquare roots, fractions and trigonometry.',
    practice: (n) => `▶ Practice (${n} rounds)`,
    back: '← Topics',
    prevPage: '‹',
    next: 'Next →',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Mastery! 🎓',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Pick a topic below to start a 10-round set.',
  },
  nl: {
    title: 'Math Mastery',
    tagline: 'De gevorderde set: vermenigvuldigen met meerdere cijfers,\nvierkantswortels, breuken en goniometrie.',
    practice: (n) => `▶ Oefenen (${n} rondes)`,
    back: '← Onderwerpen',
    prevPage: '‹',
    next: 'Volgende →',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Meesterschap! 🎓',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Kies hieronder een onderwerp voor een reeks van 10 rondes.',
  },
  de: {
    title: 'Math Mastery',
    tagline: 'Die fortgeschrittene Reihe: mehrstellige Multiplikation,\nQuadratwurzeln, Brüche und Trigonometrie.',
    practice: (n) => `▶ Üben (${n} Runden)`,
    back: '← Themen',
    prevPage: '‹',
    next: 'Weiter →',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Meisterschaft! 🎓',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Wähle unten ein Thema für 10 Runden.',
  },
  es: {
    title: 'Math Mastery',
    tagline: 'El set avanzado: multiplicación de varias cifras,\nraíces cuadradas, fracciones y trigonometría.',
    practice: (n) => `▶ Practicar (${n} rondas)`,
    back: '← Temas',
    prevPage: '‹',
    next: 'Siguiente →',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Maestría! 🎓',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Elige un tema abajo para empezar una ronda de 10.',
  },
  fr: {
    title: 'Math Mastery',
    tagline: 'La série avancée : multiplication à plusieurs chiffres,\nracines carrées, fractions et trigonométrie.',
    practice: (n) => `▶ S’entraîner (${n} manches)`,
    back: '← Sujets',
    prevPage: '‹',
    next: 'Suivant →',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Maîtrise ! 🎓',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Choisis un sujet ci-dessous pour commencer une série de 10 manches.',
  },
};

export const t = createI18n(STRINGS, getLang);
