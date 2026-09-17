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
    title: 'Advanced Trigonometry',
    tagline: 'Sine, cosine, tangent,\nthe unit circle and identities.',
    easy: 'Easy · Ratios & Vocabulary',
    medium: 'Medium · Special Angles',
    hard: 'Hard · Radians & Identities',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Right on angle! 📐',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Sketch the triangle and label the sides — SOH-CAH-TOA becomes obvious.',
  },
  nl: {
    title: 'Advanced Trigonometry',
    tagline: 'Sinus, cosinus, tangens,\nde eenheidscirkel en identiteiten.',
    easy: 'Makkelijk · Verhoudingen & Termen',
    medium: 'Gemiddeld · Speciale Hoeken',
    hard: 'Moeilijk · Radialen & Identiteiten',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Precies goed! 📐',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Teken de driehoek en label de zijden — SOH-CAH-TOA wordt dan duidelijk.',
  },
  de: {
    title: 'Advanced Trigonometry',
    tagline: 'Sinus, Kosinus, Tangens,\nder Einheitskreis und Identitäten.',
    easy: 'Leicht · Verhältnisse & Begriffe',
    medium: 'Mittel · Besondere Winkel',
    hard: 'Schwer · Bogenmaß & Identitäten',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Genau richtig! 📐',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Zeichne das Dreieck und beschrifte die Seiten — SOH-CAH-TOA wird dann klar.',
  },
  es: {
    title: 'Advanced Trigonometry',
    tagline: 'Seno, coseno, tangente,\nel círculo unitario e identidades.',
    easy: 'Fácil · Razones y vocabulario',
    medium: 'Medio · Ángulos especiales',
    hard: 'Difícil · Radianes e identidades',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡En el ángulo correcto! 📐',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Dibuja el triángulo y etiqueta los lados — SOH-CAH-TOA se vuelve obvio.',
  },
  fr: {
    title: 'Advanced Trigonometry',
    tagline: 'Sinus, cosinus, tangente,\nle cercle unité et les identités.',
    easy: 'Facile · Rapports et vocabulaire',
    medium: 'Moyen · Angles spéciaux',
    hard: 'Difficile · Radians et identités',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Angle parfait ! 📐',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Dessine le triangle et nomme les côtés — SOH-CAH-TOA devient évident.',
  },
};

export const t = createI18n(STRINGS, getLang);
