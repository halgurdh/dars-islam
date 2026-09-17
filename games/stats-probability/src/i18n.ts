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
    title: 'Statistics Essentials',
    tagline: 'Mean, median, mode, reading charts\nand spotting outliers in data.',
    easy: 'Easy · Mean, Median, Mode',
    medium: 'Medium · Range & Charts',
    hard: 'Hard · Reading Data',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Solid data sense! 📊',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Sort the numbers first — it makes median and range much easier.',
  },
  nl: {
    title: 'Statistics Essentials',
    tagline: 'Gemiddelde, mediaan, modus, grafieken lezen\nen uitschieters in data herkennen.',
    easy: 'Makkelijk · Gemiddelde, Mediaan, Modus',
    medium: 'Gemiddeld · Bereik & Grafieken',
    hard: 'Moeilijk · Data Lezen',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Sterk cijfergevoel! 📊',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Sorteer de getallen eerst — dat maakt mediaan en bereik veel makkelijker.',
  },
  de: {
    title: 'Statistics Essentials',
    tagline: 'Mittelwert, Median, Modus, Diagramme lesen\nund Ausreißer in Daten erkennen.',
    easy: 'Leicht · Mittelwert, Median, Modus',
    medium: 'Mittel · Spannweite & Diagramme',
    hard: 'Schwer · Daten Lesen',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Gutes Zahlengefühl! 📊',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Sortiere die Zahlen zuerst — das macht Median und Spannweite viel einfacher.',
  },
  es: {
    title: 'Statistics Essentials',
    tagline: 'Media, mediana, moda, lectura de gráficos\ny cómo detectar valores atípicos.',
    easy: 'Fácil · Media, mediana, moda',
    medium: 'Medio · Rango y gráficos',
    hard: 'Difícil · Lectura de datos',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Buen sentido numérico! 📊',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Ordena los números primero — hace que la mediana y el rango sean más fáciles.',
  },
  fr: {
    title: 'Statistics Essentials',
    tagline: 'Moyenne, médiane, mode, lecture de graphiques\net repérer les valeurs aberrantes.',
    easy: 'Facile · Moyenne, médiane, mode',
    medium: 'Moyen · Étendue et graphiques',
    hard: 'Difficile · Lecture de données',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Bon sens des chiffres ! 📊',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Trie les nombres d’abord — cela facilite la médiane et l’étendue.',
  },
};

export const t = createI18n(STRINGS, getLang);
