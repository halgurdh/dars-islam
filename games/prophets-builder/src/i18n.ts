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

  modeBuilder: string;
  startBuilder: string;

  modeMatch: string;
  moves: (n: number) => string;
  matchRoundSummary: (pairs: number, moves: number, time: string) => string;

  modeSequence: string;
  round: (i: number, total: number) => string;
  instruction: string;
  sequenceRoundSummary: (perfect: number, total: number) => string;
  playAgain: string;
  backToMenu: string;
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

    modeBuilder: 'Builder',
    startBuilder: '▶ Practice',

    modeMatch: 'Match',
    moves: (n) => `Moves: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} matched in ${moves} moves\nTime: ${time}`,

    modeSequence: 'Order',
    round: (i, total) => `Round ${i} / ${total}`,
    instruction: 'Tap the prophets in the traditional order',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rounds perfect`,
    playAgain: '↻ Play Again',
    backToMenu: '☰ Back to Menu',
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

    modeBuilder: 'Bouwen',
    startBuilder: '▶ Oefenen',

    modeMatch: 'Koppelen',
    moves: (n) => `Zetten: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} gematcht in ${moves} zetten\nTijd: ${time}`,

    modeSequence: 'Volgorde',
    round: (i, total) => `Ronde ${i} / ${total}`,
    instruction: 'Tik de profeten aan in de traditionele volgorde',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondes perfect`,
    playAgain: '↻ Opnieuw spelen',
    backToMenu: '☰ Terug naar menu',
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

    modeBuilder: 'Bauen',
    startBuilder: '▶ Üben',

    modeMatch: 'Zuordnen',
    moves: (n) => `Züge: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} gefunden in ${moves} Zügen\nZeit: ${time}`,

    modeSequence: 'Reihenfolge',
    round: (i, total) => `Runde ${i} / ${total}`,
    instruction: 'Tippe die Propheten in der traditionellen Reihenfolge an',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} Runden perfekt`,
    playAgain: '↻ Nochmal spielen',
    backToMenu: '☰ Zurück zum Menü',
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

    modeBuilder: 'Construir',
    startBuilder: '▶ Practicar',

    modeMatch: 'Emparejar',
    moves: (n) => `Movimientos: ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} emparejados en ${moves} movimientos\nTiempo: ${time}`,

    modeSequence: 'Orden',
    round: (i, total) => `Ronda ${i} / ${total}`,
    instruction: 'Toca los profetas en el orden tradicional',
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} rondas perfectas`,
    playAgain: '↻ Jugar de nuevo',
    backToMenu: '☰ Volver al menú',
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

    modeBuilder: 'Construction',
    startBuilder: '▶ Pratiquer',

    modeMatch: 'Associer',
    moves: (n) => `Coups : ${n}`,
    matchRoundSummary: (pairs, moves, time) => `${pairs} associés en ${moves} coups\nTemps : ${time}`,

    modeSequence: 'Ordre',
    round: (i, total) => `Manche ${i} / ${total}`,
    instruction: "Touche les prophètes dans l'ordre traditionnel",
    sequenceRoundSummary: (perfect, total) => `${perfect} / ${total} manches parfaites`,
    playAgain: '↻ Rejouer',
    backToMenu: '☰ Retour au menu',
  },
};

export const t = createI18n(STRINGS, getLang);
