import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  howItWorks: string;
  example: string;
  practice: (n: number) => string;
  back: string;
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
    title: 'Math Tricks Lab',
    tagline: 'Learn classic mental-math shortcuts,\nthen drill them for speed.',
    howItWorks: 'How it works',
    example: 'Worked example',
    practice: (n) => `▶ Practice (${n} rounds)`,
    back: '← Tricks',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Trick mastered! 🧠',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Tricks',
    footer: 'Pick a trick to learn it, then practice until it’s automatic.',
  },
  nl: {
    title: 'Math Tricks Lab',
    tagline: 'Leer klassieke rekentrucjes,\nen oefen ze dan tot je ze razendsnel kent.',
    howItWorks: 'Hoe het werkt',
    example: 'Uitgewerkt voorbeeld',
    practice: (n) => `▶ Oefenen (${n} rondes)`,
    back: '← Trucjes',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Trucje onder de knie! 🧠',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar trucjes',
    footer: 'Kies een trucje om te leren, oefen dan tot het automatisch gaat.',
  },
  de: {
    title: 'Math Tricks Lab',
    tagline: 'Lerne klassische Kopfrechen-Tricks,\nund übe sie dann für mehr Tempo.',
    howItWorks: 'So funktioniert es',
    example: 'Rechenbeispiel',
    practice: (n) => `▶ Üben (${n} Runden)`,
    back: '← Tricks',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Trick gemeistert! 🧠',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zu Tricks',
    footer: 'Wähle einen Trick zum Lernen, dann üben, bis er automatisch geht.',
  },
  es: {
    title: 'Math Tricks Lab',
    tagline: 'Aprende trucos clásicos de cálculo mental,\ny practícalos hasta dominarlos.',
    howItWorks: 'Cómo funciona',
    example: 'Ejemplo resuelto',
    practice: (n) => `▶ Practicar (${n} rondas)`,
    back: '← Trucos',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Truco dominado! 🧠',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver a trucos',
    footer: 'Elige un truco para aprenderlo, luego practica hasta que sea automático.',
  },
  fr: {
    title: 'Math Tricks Lab',
    tagline: 'Apprends des astuces classiques de calcul mental,\npuis entraîne-toi jusqu’à la vitesse de l’éclair.',
    howItWorks: 'Comment ça marche',
    example: 'Exemple résolu',
    practice: (n) => `▶ S’entraîner (${n} manches)`,
    back: '← Astuces',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Astuce maîtrisée ! 🧠',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour aux astuces',
    footer: 'Choisis une astuce à apprendre, puis entraîne-toi jusqu’à l’automatisme.',
  },
};

export const t = createI18n(STRINGS, getLang);
