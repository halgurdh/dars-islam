import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  title: string;
  tagline: string;
  relaxed: string;
  normal: string;
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
    title: 'Mental Math Sprint',
    tagline: 'Timed mixed-operation drills.\nDifficulty ramps up as you go —\nuse the tricks you know!',
    relaxed: 'Relaxed · 12s per question',
    normal: 'Normal · 7s per question',
    round: (i, total) => `Round ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Sprint finished! ⚡',
    roundSummary: (score, total) => `${score} / ${total} correct`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
    footer: '💡 This sprint leans on the ×11, ×5 and other shortcuts\nfrom Math Tricks Lab — learn them there, then race here.',
  },
  nl: {
    title: 'Mental Math Sprint',
    tagline: 'Getimede oefeningen met gemengde bewerkingen.\nDe moeilijkheid stijgt gaandeweg —\ngebruik de trucjes die je kent!',
    relaxed: 'Relaxed · 12s per vraag',
    normal: 'Normaal · 7s per vraag',
    round: (i, total) => `Ronde ${i} / ${total}`,
    score: (n) => `Score: ${n}`,
    menu: '☰ Menu',
    wellDone: 'Sprint voltooid! ⚡',
    roundSummary: (score, total) => `${score} / ${total} goed`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
    footer: '💡 Deze sprint leunt op de ×11, ×5 en andere trucjes\nuit Math Tricks Lab — leer ze daar, race dan hier.',
  },
  de: {
    title: 'Mental Math Sprint',
    tagline: 'Zeitlich begrenzte Übungen mit gemischten Rechenarten.\nDer Schwierigkeitsgrad steigt —\nnutze die Tricks, die du kennst!',
    relaxed: 'Entspannt · 12s pro Frage',
    normal: 'Normal · 7s pro Frage',
    round: (i, total) => `Runde ${i} / ${total}`,
    score: (n) => `Punkte: ${n}`,
    menu: '☰ Menü',
    wellDone: 'Sprint beendet! ⚡',
    roundSummary: (score, total) => `${score} / ${total} richtig`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
    footer: '💡 Dieser Sprint nutzt die ×11-, ×5- und andere Tricks\naus Math Tricks Lab — lerne sie dort, dann sprinte hier.',
  },
  es: {
    title: 'Mental Math Sprint',
    tagline: 'Ejercicios cronometrados con operaciones mixtas.\nLa dificultad aumenta a medida que avanzas —\n¡usa los trucos que conoces!',
    relaxed: 'Relajado · 12s por pregunta',
    normal: 'Normal · 7s por pregunta',
    round: (i, total) => `Ronda ${i} / ${total}`,
    score: (n) => `Puntos: ${n}`,
    menu: '☰ Menú',
    wellDone: '¡Sprint terminado! ⚡',
    roundSummary: (score, total) => `${score} / ${total} correctas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
    footer: '💡 Este sprint usa los trucos ×11, ×5 y otros\nde Math Tricks Lab — apréndelos allí y compite aquí.',
  },
  fr: {
    title: 'Mental Math Sprint',
    tagline: 'Exercices chronométrés à opérations mixtes.\nLa difficulté augmente au fil des manches —\nutilise les astuces que tu connais !',
    relaxed: 'Détendu · 12s par question',
    normal: 'Normal · 7s par question',
    round: (i, total) => `Manche ${i} / ${total}`,
    score: (n) => `Score : ${n}`,
    menu: '☰ Menu',
    wellDone: 'Sprint terminé ! ⚡',
    roundSummary: (score, total) => `${score} / ${total} correctes`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
    footer: '💡 Ce sprint s’appuie sur les astuces ×11, ×5 et d’autres\nde Math Tricks Lab — apprends-les là-bas, puis fonce ici.',
  },
};

export const t = createI18n(STRINGS, getLang);
