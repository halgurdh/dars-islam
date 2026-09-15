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
  listenAndChoose: string;
}

const STRINGS: Record<LangMode, Strings> = {
  en: {
    subtitle: 'Prophets Builder',
    tagline: 'Learn the Prophets\nby spelling each name.',
    itemsLearned: (n, total) => `${n} / ${total} prophets learned`,
    easy: 'Easy · 8 prophets',
    medium: 'Medium · 15 prophets',
    hard: 'Hard · 25 prophets',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} prophets spelled in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} prophets learned overall`,
    nextLevelHint: 'Next level starting…',
    hear: '🔊 Hear it',
    modeArabic: '🔤 Arabic',
    modeToTranslation: '✍️ AR → EN',
    modeToArabic: '🔤 EN → AR',
    typeAnswerPlaceholder: 'Type the meaning…',
    checkAnswer: 'Check',
    listenAndChoose: '🎧 Listen, then choose the answer',
  },
  nl: {
    subtitle: 'Prophets Builder',
    tagline: 'Leer de profeten\ndoor elke naam te spellen.',
    itemsLearned: (n, total) => `${n} / ${total} profeten geleerd`,
    easy: 'Makkelijk · 8 profeten',
    medium: 'Gemiddeld · 15 profeten',
    hard: 'Moeilijk · 25 profeten',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} profeten gespeld in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} profeten in totaal geleerd`,
    nextLevelHint: 'Volgend level begint…',
    hear: '🔊 Uitspraak',
    modeArabic: '🔤 Arabisch',
    modeToTranslation: '✍️ AR → NL',
    modeToArabic: '🔤 NL → AR',
    typeAnswerPlaceholder: 'Typ de betekenis…',
    checkAnswer: 'Controleer',
    listenAndChoose: '🎧 Luister en kies het antwoord',
  },
  de: {
    subtitle: 'Prophets Builder',
    tagline: 'Lerne die Propheten,\nindem du jeden Namen buchstabierst.',
    itemsLearned: (n, total) => `${n} / ${total} Propheten gelernt`,
    easy: 'Leicht · 8 Propheten',
    medium: 'Mittel · 15 Propheten',
    hard: 'Schwer · 25 Propheten',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    mistakes: (n) => `Fehler: ${n}`,
    wellDone: 'Gut gemacht! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} Propheten buchstabiert mit ${mistakes} Fehlern\nZeit: ${time}\n${learned} / ${total} Propheten insgesamt gelernt`,
    nextLevelHint: 'Nächstes Level startet…',
    hear: '🔊 Anhören',
    modeArabic: '🔤 Arabisch',
    modeToTranslation: '✍️ AR → DE',
    modeToArabic: '🔤 DE → AR',
    typeAnswerPlaceholder: 'Bedeutung eingeben…',
    checkAnswer: 'Prüfen',
    listenAndChoose: '🎧 Hör zu und wähle die Antwort',
  },
  es: {
    subtitle: 'Prophets Builder',
    tagline: 'Aprende los Profetas\ndeletreando cada nombre.',
    itemsLearned: (n, total) => `${n} / ${total} profetas aprendidos`,
    easy: 'Fácil · 8 profetas',
    medium: 'Medio · 15 profetas',
    hard: 'Difícil · 25 profetas',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    mistakes: (n) => `Errores: ${n}`,
    wellDone: '¡Bien hecho! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} profetas deletreados con ${mistakes} errores\nTiempo: ${time}\n${learned} / ${total} profetas aprendidos en total`,
    nextLevelHint: 'Comienza el siguiente nivel…',
    hear: '🔊 Escuchar',
    modeArabic: '🔤 Árabe',
    modeToTranslation: '✍️ AR → ES',
    modeToArabic: '🔤 ES → AR',
    typeAnswerPlaceholder: 'Escribe el significado…',
    checkAnswer: 'Comprobar',
    listenAndChoose: '🎧 Escucha y elige la respuesta',
  },
  fr: {
    subtitle: 'Prophets Builder',
    tagline: 'Apprenez les Prophètes\nen épelant chaque nom.',
    itemsLearned: (n, total) => `${n} / ${total} prophètes appris`,
    easy: 'Facile · 8 prophètes',
    medium: 'Moyen · 15 prophètes',
    hard: 'Difficile · 25 prophètes',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    mistakes: (n) => `Erreurs : ${n}`,
    wellDone: 'Bien joué ! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} prophètes épelés avec ${mistakes} erreurs\nTemps : ${time}\n${learned} / ${total} prophètes appris au total`,
    nextLevelHint: 'Le niveau suivant commence…',
    hear: '🔊 Écouter',
    modeArabic: '🔤 Arabe',
    modeToTranslation: '✍️ AR → FR',
    modeToArabic: '🔤 FR → AR',
    typeAnswerPlaceholder: 'Tapez la signification…',
    checkAnswer: 'Vérifier',
    listenAndChoose: '🎧 Écoute, puis choisis la réponse',
  },
};

export const t = createI18n(STRINGS, getLang);
