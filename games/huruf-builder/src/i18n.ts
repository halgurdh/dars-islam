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
  mistakes: (n: number) => string;
  wellDone: string;
  roundSummary: (items: number, mistakes: number, time: string, learned: number, total: number) => string;
  nextLevelHint: string;
  hear: string;
  modeArabic: string;
  modeToTranslation: string;
  modeToArabic: string;
  typeAnswerPlaceholder: string;
  checkAnswer: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    subtitle: 'Huruf Builder',
    tagline: 'Learn the Arabic alphabet\nby spelling each letter’s name.',
    itemsLearned: (n, total) => `${n} / ${total} letters learned`,
    easy: 'Easy · 6 letters',
    medium: 'Medium · 10 letters',
    hard: 'Hard · 16 letters',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} letters spelled in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} letters learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
    modeArabic: '🔤 Arabic',
    modeToTranslation: '✍️ AR → EN',
    modeToArabic: '🔤 EN → AR',
    typeAnswerPlaceholder: 'Type the meaning…',
    checkAnswer: 'Check',
  },
  nl: {
    subtitle: 'Huruf Builder',
    tagline: 'Leer het Arabische alfabet\ndoor de naam van elke letter te spellen.',
    itemsLearned: (n, total) => `${n} / ${total} letters geleerd`,
    easy: 'Makkelijk · 6 letters',
    medium: 'Gemiddeld · 10 letters',
    hard: 'Moeilijk · 16 letters',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} letters gespeld in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} letters in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
    modeArabic: '🔤 Arabisch',
    modeToTranslation: '✍️ AR → NL',
    modeToArabic: '🔤 NL → AR',
    typeAnswerPlaceholder: 'Typ de betekenis…',
    checkAnswer: 'Controleer',
  },
  de: {
    subtitle: 'Huruf Builder',
    tagline: 'Lerne das arabische Alphabet,\nindem du den Namen jedes Buchstabens buchstabierst.',
    itemsLearned: (n, total) => `${n} / ${total} Buchstaben gelernt`,
    easy: 'Leicht · 6 Buchstaben',
    medium: 'Mittel · 10 Buchstaben',
    hard: 'Schwer · 16 Buchstaben',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    mistakes: (n) => `Fehler: ${n}`,
    wellDone: 'Gut gemacht! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} Buchstaben buchstabiert mit ${mistakes} Fehlern\nZeit: ${time}\n${learned} / ${total} Buchstaben insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',
    hear: '🔊 Anhören',
    modeArabic: '🔤 Arabisch',
    modeToTranslation: '✍️ AR → DE',
    modeToArabic: '🔤 DE → AR',
    typeAnswerPlaceholder: 'Bedeutung eingeben…',
    checkAnswer: 'Prüfen',
  },
  es: {
    subtitle: 'Huruf Builder',
    tagline: 'Aprende el alfabeto árabe\ndeletreando el nombre de cada letra.',
    itemsLearned: (n, total) => `${n} / ${total} letras aprendidas`,
    easy: 'Fácil · 6 letras',
    medium: 'Medio · 10 letras',
    hard: 'Difícil · 16 letras',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    mistakes: (n) => `Errores: ${n}`,
    wellDone: '¡Bien hecho! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} letras deletreadas con ${mistakes} errores\nTiempo: ${time}\n${learned} / ${total} letras aprendidas en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',
    hear: '🔊 Escuchar',
    modeArabic: '🔤 Árabe',
    modeToTranslation: '✍️ AR → ES',
    modeToArabic: '🔤 ES → AR',
    typeAnswerPlaceholder: 'Escribe el significado…',
    checkAnswer: 'Comprobar',
  },
  fr: {
    subtitle: 'Huruf Builder',
    tagline: "Apprenez l'alphabet arabe\nen épelant le nom de chaque lettre.",
    itemsLearned: (n, total) => `${n} / ${total} lettres apprises`,
    easy: 'Facile · 6 lettres',
    medium: 'Moyen · 10 lettres',
    hard: 'Difficile · 16 lettres',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    mistakes: (n) => `Erreurs : ${n}`,
    wellDone: 'Bien joué ! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} lettres épelées avec ${mistakes} erreurs\nTemps : ${time}\n${learned} / ${total} lettres apprises au total`,
    nextLevelHint: 'Le niveau suivant commence…',
    hear: '🔊 Écouter',
    modeArabic: '🔤 Arabe',
    modeToTranslation: '✍️ AR → FR',
    modeToArabic: '🔤 FR → AR',
    typeAnswerPlaceholder: 'Tapez la signification…',
    checkAnswer: 'Vérifier',
  },
};

export const t = createI18n(STRINGS, getLang);
