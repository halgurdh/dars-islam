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
    title: 'Fiqh Essentials',
    tagline: 'Put the steps of wudu\nin the correct order.',
    easy: 'Easy · 4 Steps',
    medium: 'Medium · 5 Steps',
    hard: 'Hard · 6 Steps',
    round: (i, total) => `Round ${i} / ${total}`,
    mistakes: (n) => `Mistakes: ${n}`,
    menu: '☰ Menu',
    instruction: 'Tap the steps of wudu in the correct order.',
    wellDone: 'Well learned, ما شاء الله! 🤲',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rounds with no mistakes`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: 'Practicing wudu step by step helps these answers stick.',
  },
  nl: {
    title: 'Fiqh Essentials',
    tagline: 'Zet de stappen van de wudu\nin de juiste volgorde.',
    easy: 'Makkelijk · 4 Stappen',
    medium: 'Gemiddeld · 5 Stappen',
    hard: 'Moeilijk · 6 Stappen',
    round: (i, total) => `Ronde ${i} / ${total}`,
    mistakes: (n) => `Fouten: ${n}`,
    menu: '☰ Menu',
    instruction: 'Tik de stappen van de wudu aan in de juiste volgorde.',
    wellDone: 'Goed geleerd, ما شاء الله! 🤲',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondes zonder fouten`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: 'Stap voor stap wudu oefenen helpt om dit te onthouden.',
  },
  de: {
    title: 'Fiqh Essentials',
    tagline: 'Bring die Schritte der Wudu\nin die richtige Reihenfolge.',
    easy: 'Leicht · 4 Schritte',
    medium: 'Mittel · 5 Schritte',
    hard: 'Schwer · 6 Schritte',
    round: (i, total) => `Runde ${i} / ${total}`,
    mistakes: (n) => `Fehler: ${n}`,
    menu: '☰ Menü',
    instruction: 'Tippe die Schritte der Wudu in der richtigen Reihenfolge an.',
    wellDone: 'Gut gelernt, ما شاء الله! 🤲',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} Runden ohne Fehler`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: 'Die Wudu Schritt für Schritt zu üben hilft, sich das zu merken.',
  },
  es: {
    title: 'Fiqh Essentials',
    tagline: 'Ordena los pasos del wudu\nen la secuencia correcta.',
    easy: 'Fácil · 4 pasos',
    medium: 'Medio · 5 pasos',
    hard: 'Difícil · 6 pasos',
    round: (i, total) => `Ronda ${i} / ${total}`,
    mistakes: (n) => `Errores: ${n}`,
    menu: '☰ Menú',
    instruction: 'Toca los pasos del wudu en el orden correcto.',
    wellDone: '¡Bien aprendido, ما شاء الله! 🤲',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} rondas sin errores`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: 'Practicar el wudu paso a paso ayuda a recordar estas respuestas.',
  },
  fr: {
    title: 'Fiqh Essentials',
    tagline: 'Mets les étapes du wudu\ndans le bon ordre.',
    easy: 'Facile · 4 étapes',
    medium: 'Moyen · 5 étapes',
    hard: 'Difficile · 6 étapes',
    round: (i, total) => `Manche ${i} / ${total}`,
    mistakes: (n) => `Erreurs : ${n}`,
    menu: '☰ Menu',
    instruction: 'Touche les étapes du wudu dans le bon ordre.',
    wellDone: 'Bien appris, ما شاء الله ! 🤲',
    roundSummary: (perfectRounds, totalRounds) => `${perfectRounds} / ${totalRounds} manches sans erreur`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: 'Pratiquer le wudu étape par étape aide à retenir ces réponses.',
  },
};

export const t = createI18n(STRINGS, getLang);
