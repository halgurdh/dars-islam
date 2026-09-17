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
    title: 'Money & Zakat Math',
    tagline: 'Needs vs. wants, discounts and percentages,\nand calculating zakat.',
    easy: 'Easy · Needs, Wants & Money',
    medium: 'Medium · Percentages & Discounts',
    hard: 'Hard · Zakat Calculation',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Smart with money! 💰',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Zakat here uses the simplified 2.5%-of-savings rule taught to beginners.',
  },
  nl: {
    title: 'Money & Zakat Math',
    tagline: 'Behoeften versus wensen, kortingen en procenten,\nen zakat berekenen.',
    easy: 'Makkelijk · Behoeften, Wensen & Geld',
    medium: 'Gemiddeld · Procenten & Korting',
    hard: 'Moeilijk · Zakat Berekenen',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Slim met geld! 💰',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Zakat gebruikt hier de vereenvoudigde regel van 2,5% over spaargeld.',
  },
  de: {
    title: 'Money & Zakat Math',
    tagline: 'Bedürfnisse und Wünsche, Rabatte und Prozente,\nund die Berechnung der Zakat.',
    easy: 'Leicht · Bedürfnisse, Wünsche & Geld',
    medium: 'Mittel · Prozente & Rabatte',
    hard: 'Schwer · Zakat-Berechnung',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Klug mit Geld! 💰',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Zakat nutzt hier die vereinfachte Regel: 2,5% des Ersparten.',
  },
  es: {
    title: 'Money & Zakat Math',
    tagline: 'Necesidades y deseos, descuentos y porcentajes,\ny cómo calcular el zakat.',
    easy: 'Fácil · Necesidades, deseos y dinero',
    medium: 'Medio · Porcentajes y descuentos',
    hard: 'Difícil · Cálculo del zakat',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Listo con el dinero! 💰',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Aquí el zakat usa la regla simplificada del 2,5% de los ahorros.',
  },
  fr: {
    title: 'Money & Zakat Math',
    tagline: 'Besoins et envies, remises et pourcentages,\net le calcul de la zakat.',
    easy: 'Facile · Besoins, envies et argent',
    medium: 'Moyen · Pourcentages et remises',
    hard: 'Difficile · Calcul de la zakat',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Malin avec l’argent ! 💰',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Ici, la zakat suit la règle simplifiée de 2,5 % de l’épargne.',
  },
};

export const t = createI18n(STRINGS, getLang);
