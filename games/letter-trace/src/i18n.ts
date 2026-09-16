import { createI18n } from '@shared/i18n';
import { getLang, type LangMode } from './systems/Locale';

interface Strings {
  subtitle: string;
  tagline: string;
  alphabetArabic: string;
  alphabetEnglish: string;
  alphabetNumbers: string;
  itemsLearned: (n: number, total: number) => string;
  start: string;
  soundOn: string;
  soundOff: string;
  langToggle: string;
  footer: string;
  menu: string;
  accuracy: (n: number) => string;
  coverage: (n: number) => string;
  hear: string;
  reset: string;
  confirm: string;
  next: string;
  wellDone: string;
  itemComplete: string;
  roundSummary: (items: number, total: number) => string;
  nextLevelHint: string;
  playAgain: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    subtitle: 'Letter Trace',
    tagline: 'Practice handwriting by tracing each letter\nwith your finger or mouse.',
    alphabetArabic: '🔤 Arabic',
    alphabetEnglish: '🔤 English',
    alphabetNumbers: '🔢 Numbers',
    itemsLearned: (n, total) => `${n} / ${total} letters traced`,
    start: 'Start',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    accuracy: (n) => `Accuracy: ${n}%`,
    coverage: (n) => `Coverage: ${n}%`,
    hear: '🔊 Hear it',
    reset: '↻ Reset / Try Again',
    confirm: '✓ Confirm',
    next: 'Next →',
    wellDone: 'Well done! 🌿',
    itemComplete: 'Nicely traced!',
    roundSummary: (items, total) => `${items} letters traced this round\n${total} learned overall`,
    nextLevelHint: 'Next letter starting…',
    playAgain: '↻ Practice Again',
  },
  nl: {
    subtitle: 'Letter Trace',
    tagline: 'Oefen met schrijven door elke letter\nmet je vinger of muis na te trekken.',
    alphabetArabic: '🔤 Arabisch',
    alphabetEnglish: '🔤 Engels',
    alphabetNumbers: '🔢 Cijfers',
    itemsLearned: (n, total) => `${n} / ${total} letters getraced`,
    start: 'Start',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    accuracy: (n) => `Nauwkeurigheid: ${n}%`,
    coverage: (n) => `Dekking: ${n}%`,
    hear: '🔊 Uitspraak',
    reset: '↻ Reset / Opnieuw',
    confirm: '✓ Klaar',
    next: 'Volgende →',
    wellDone: 'Goed gedaan! 🌿',
    itemComplete: 'Mooi getraced!',
    roundSummary: (items, total) => `${items} letters getraced deze ronde\n${total} in totaal geleerd`,
    nextLevelHint: 'Volgende letter begint…',
    playAgain: '↻ Nog een keer',
  },
  de: {
    subtitle: 'Letter Trace',
    tagline: 'Übe das Schreiben, indem du jeden Buchstaben\nmit deinem Finger oder der Maus nachzeichnest.',
    alphabetArabic: '🔤 Arabisch',
    alphabetEnglish: '🔤 Englisch',
    alphabetNumbers: '🔢 Zahlen',
    itemsLearned: (n, total) => `${n} / ${total} Buchstaben nachgezeichnet`,
    start: 'Start',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    accuracy: (n) => `Genauigkeit: ${n}%`,
    coverage: (n) => `Abdeckung: ${n}%`,
    hear: '🔊 Anhören',
    reset: '↻ Zurücksetzen / Erneut versuchen',
    confirm: '✓ Fertig',
    next: 'Weiter →',
    wellDone: 'Gut gemacht! 🌿',
    itemComplete: 'Schön nachgezeichnet!',
    roundSummary: (items, total) => `${items} Buchstaben in dieser Runde nachgezeichnet\n${total} insgesamt gelernt`,
    nextLevelHint: 'Nächster Buchstabe startet…',
    playAgain: '↻ Nochmal üben',
  },
  es: {
    subtitle: 'Letter Trace',
    tagline: 'Practica la escritura trazando cada letra\ncon el dedo o el ratón.',
    alphabetArabic: '🔤 Árabe',
    alphabetEnglish: '🔤 Inglés',
    alphabetNumbers: '🔢 Números',
    itemsLearned: (n, total) => `${n} / ${total} letras trazadas`,
    start: 'Empezar',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    accuracy: (n) => `Precisión: ${n}%`,
    coverage: (n) => `Cobertura: ${n}%`,
    hear: '🔊 Escuchar',
    reset: '↻ Reiniciar / Intentar de nuevo',
    confirm: '✓ Listo',
    next: 'Siguiente →',
    wellDone: '¡Bien hecho! 🌿',
    itemComplete: '¡Bien trazado!',
    roundSummary: (items, total) => `${items} letras trazadas esta ronda\n${total} aprendidas en total`,
    nextLevelHint: 'Comienza la siguiente letra…',
    playAgain: '↻ Practicar de nuevo',
  },
  fr: {
    subtitle: 'Letter Trace',
    tagline: "Entraînez-vous à l'écriture en traçant chaque lettre\navec votre doigt ou votre souris.",
    alphabetArabic: '🔤 Arabe',
    alphabetEnglish: '🔤 Anglais',
    alphabetNumbers: '🔢 Chiffres',
    itemsLearned: (n, total) => `${n} / ${total} lettres tracées`,
    start: 'Commencer',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    accuracy: (n) => `Précision : ${n}%`,
    coverage: (n) => `Couverture : ${n}%`,
    hear: '🔊 Écouter',
    reset: '↻ Réinitialiser / Réessayer',
    confirm: '✓ Terminé',
    next: 'Suivant →',
    wellDone: 'Bien joué ! 🌿',
    itemComplete: 'Bien tracé !',
    roundSummary: (items, total) => `${items} lettres tracées ce tour\n${total} apprises au total`,
    nextLevelHint: 'La lettre suivante commence…',
    playAgain: '↻ Pratiquer à nouveau',
  },
};

export const t = createI18n(STRINGS, getLang);
