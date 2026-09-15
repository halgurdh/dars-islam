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
    subtitle: 'Phrases Builder',
    tagline: 'Learn everyday Islamic phrases\nby building each one, word by word.',
    itemsLearned: (n, total) => `${n} / ${total} phrases learned`,
    easy: 'Easy · 4 phrases',
    medium: 'Medium · 7 phrases',
    hard: 'Hard · 10 phrases',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} phrases built in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} phrases learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
    modeArabic: '🔤 Arabic',
    modeToTranslation: '✍️ AR → EN',
    modeToArabic: '🔤 EN → AR',
    typeAnswerPlaceholder: 'Type the meaning…',
    checkAnswer: 'Check',
  },
  nl: {
    subtitle: 'Phrases Builder',
    tagline: 'Leer alledaagse islamitische uitdrukkingen\ndoor elke zin woord voor woord op te bouwen.',
    itemsLearned: (n, total) => `${n} / ${total} uitdrukkingen geleerd`,
    easy: 'Makkelijk · 4 uitdrukkingen',
    medium: 'Gemiddeld · 7 uitdrukkingen',
    hard: 'Moeilijk · 10 uitdrukkingen',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} uitdrukkingen gebouwd in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} uitdrukkingen in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
    modeArabic: '🔤 Arabisch',
    modeToTranslation: '✍️ AR → NL',
    modeToArabic: '🔤 NL → AR',
    typeAnswerPlaceholder: 'Typ de betekenis…',
    checkAnswer: 'Controleer',
  },
  de: {
    subtitle: 'Phrases Builder',
    tagline: 'Lerne alltägliche islamische Redewendungen,\nindem du jede Wort für Wort aufbaust.',
    itemsLearned: (n, total) => `${n} / ${total} Redewendungen gelernt`,
    easy: 'Leicht · 4 Redewendungen',
    medium: 'Mittel · 7 Redewendungen',
    hard: 'Schwer · 10 Redewendungen',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    mistakes: (n) => `Fehler: ${n}`,
    wellDone: 'Gut gemacht! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} Redewendungen gebaut mit ${mistakes} Fehlern\nZeit: ${time}\n${learned} / ${total} Redewendungen insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',
    hear: '🔊 Anhören',
    modeArabic: '🔤 Arabisch',
    modeToTranslation: '✍️ AR → DE',
    modeToArabic: '🔤 DE → AR',
    typeAnswerPlaceholder: 'Bedeutung eingeben…',
    checkAnswer: 'Prüfen',
  },
  es: {
    subtitle: 'Phrases Builder',
    tagline: 'Aprende frases islámicas cotidianas\nconstruyendo cada una, palabra por palabra.',
    itemsLearned: (n, total) => `${n} / ${total} frases aprendidas`,
    easy: 'Fácil · 4 frases',
    medium: 'Medio · 7 frases',
    hard: 'Difícil · 10 frases',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    mistakes: (n) => `Errores: ${n}`,
    wellDone: '¡Bien hecho! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} frases construidas con ${mistakes} errores\nTiempo: ${time}\n${learned} / ${total} frases aprendidas en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',
    hear: '🔊 Escuchar',
    modeArabic: '🔤 Árabe',
    modeToTranslation: '✍️ AR → ES',
    modeToArabic: '🔤 ES → AR',
    typeAnswerPlaceholder: 'Escribe el significado…',
    checkAnswer: 'Comprobar',
  },
  fr: {
    subtitle: 'Phrases Builder',
    tagline: 'Apprenez des phrases islamiques courantes\nen les construisant mot par mot.',
    itemsLearned: (n, total) => `${n} / ${total} phrases apprises`,
    easy: 'Facile · 4 phrases',
    medium: 'Moyen · 7 phrases',
    hard: 'Difficile · 10 phrases',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    mistakes: (n) => `Erreurs : ${n}`,
    wellDone: 'Bien joué ! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} phrases construites avec ${mistakes} erreurs\nTemps : ${time}\n${learned} / ${total} phrases apprises au total`,
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
