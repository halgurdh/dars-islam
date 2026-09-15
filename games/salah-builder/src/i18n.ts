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
    subtitle: 'Salah Builder',
    tagline: 'Learn the steps of the daily prayer\nby spelling each one.',
    itemsLearned: (n, total) => `${n} / ${total} steps learned`,
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    soundOn: '🔈 Sound On',
    soundOff: '🔇 Sound Off',
    langToggle: '🇳🇱 Switch to Dutch',
    footer: 'No music. Sound effects are minimal and optional.',
    menu: '☰ Menu',
    mistakes: (n) => `Mistakes: ${n}`,
    wellDone: 'Well done! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} steps spelled in ${mistakes} mistakes\nTime: ${time}\n${learned} / ${total} steps learned overall`,
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
    subtitle: 'Salah Builder',
    tagline: 'Leer de stappen van het gebed\ndoor elke stap te spellen.',
    itemsLearned: (n, total) => `${n} / ${total} stappen geleerd`,
    easy: 'Makkelijk',
    medium: 'Gemiddeld',
    hard: 'Moeilijk',
    soundOn: '🔈 Geluid Aan',
    soundOff: '🔇 Geluid Uit',
    langToggle: '🇩🇪 Naar Duits wisselen',
    footer: 'Geen muziek. Geluidseffecten zijn minimaal en optioneel.',
    menu: '☰ Menu',
    mistakes: (n) => `Fouten: ${n}`,
    wellDone: 'Goed gedaan! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} stappen gespeld in ${mistakes} fouten\nTijd: ${time}\n${learned} / ${total} stappen in totaal geleerd`,
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
    subtitle: 'Salah Builder',
    tagline: 'Lerne die Schritte des täglichen Gebets,\nindem du jeden buchstabierst.',
    itemsLearned: (n, total) => `${n} / ${total} Schritte gelernt`,
    easy: 'Leicht',
    medium: 'Mittel',
    hard: 'Schwer',
    soundOn: '🔈 Ton An',
    soundOff: '🔇 Ton Aus',
    langToggle: '🇪🇸 Zu Spanisch wechseln',
    footer: 'Keine Musik. Soundeffekte sind minimal und optional.',
    menu: '☰ Menü',
    mistakes: (n) => `Fehler: ${n}`,
    wellDone: 'Gut gemacht! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} Schritte buchstabiert mit ${mistakes} Fehlern\nZeit: ${time}\n${learned} / ${total} Schritte insgesamt gelernt`,
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
    subtitle: 'Salah Builder',
    tagline: 'Aprende los pasos de la oración diaria\ndeletreando cada uno.',
    itemsLearned: (n, total) => `${n} / ${total} pasos aprendidos`,
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
    soundOn: '🔈 Sonido Activado',
    soundOff: '🔇 Sonido Desactivado',
    langToggle: '🇫🇷 Cambiar a francés',
    footer: 'Sin música. Los efectos de sonido son mínimos y opcionales.',
    menu: '☰ Menú',
    mistakes: (n) => `Errores: ${n}`,
    wellDone: '¡Bien hecho! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} pasos deletreados con ${mistakes} errores\nTiempo: ${time}\n${learned} / ${total} pasos aprendidos en total`,
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
    subtitle: 'Salah Builder',
    tagline: 'Apprenez les étapes de la prière quotidienne\nen épelant chacune.',
    itemsLearned: (n, total) => `${n} / ${total} étapes apprises`,
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
    soundOn: '🔈 Son Activé',
    soundOff: '🔇 Son Désactivé',
    langToggle: '🇬🇧 Switch to English',
    footer: 'Pas de musique. Les effets sonores sont minimes et facultatifs.',
    menu: '☰ Menu',
    mistakes: (n) => `Erreurs : ${n}`,
    wellDone: 'Bien joué ! 🌿',
    roundSummary: (items, mistakes, time, learned, total) =>
      `${items} étapes épelées avec ${mistakes} erreurs\nTemps : ${time}\n${learned} / ${total} étapes apprises au total`,
    nextLevelHint: "L'étape suivante commence…",
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
