import { COLORS, ARABIC_FONT, LATIN_FONT } from '../theme';
import { JUZ_AMMA_SURAHS, meaningFor, type SurahEntry } from '../data/names';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { sfx } from '../systems/Sfx';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, trueFalseMode, fillBlankMode, listenIdentifyMode, reviewMode, type GameMode, type VariantBase } from '@shared/mode-menu-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion, listenQuestion } from '@shared/quiz-variants';
import { SPEECH_LANG } from '@shared/tts';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The existing Match scene (GameScene) has Arabic text-to-speech on tile
// flip, a feature the generic shared match-kit doesn't have — so Match mode
// keeps using it directly instead of migrating to match-kit, and only Quiz
// + Order (new) are built on the shared kits.
const matchMode: GameMode = {
  id: 'match',
  label: () => t().modeMatch,
  icon: '🎴',
  difficulties: [
    { label: () => t().easy, onSelect: (scene) => { sfx.flip(); scene.scene.start('GameScene', { pairs: 6 }); } },
    { label: () => t().medium, onSelect: (scene) => { sfx.flip(); scene.scene.start('GameScene', { pairs: 8 }); } },
    { label: () => t().hard, onSelect: (scene) => { sfx.flip(); scene.scene.start('GameScene', { pairs: 10 }); } },
  ],
};

function generateQuizQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(JUZ_AMMA_SURAHS).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((n) => meaningFor(n)));
  return {
    prompt: correct.arabic,
    sub: correct.transliteration,
    choices,
    correctIndex: choices.indexOf(meaningFor(correct)),
  };
}

// "Listen & Identify": the Arabic audio plays instead of showing the surah
// name as text — the player has to recognize it by ear, picking its meaning
// from four written choices.
function generateListenQuestion(): QuizQuestion {
  return listenQuestion(JUZ_AMMA_SURAHS, (n) => ({ text: n.arabic, lang: SPEECH_LANG.arabic }), (n) => meaningFor(n));
}

function generateFlashcardDeck(): FlashcardItem[] {
  return JUZ_AMMA_SURAHS.map((n) => ({
    id: n.id,
    primary: n.arabic,
    secondary: n.transliteration,
    meaning: meaningFor(n),
    speak: { text: n.arabic, lang: SPEECH_LANG.arabic },
  }));
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(
    JUZ_AMMA_SURAHS,
    (n) => n.transliteration,
    (n) => meaningFor(n),
    (name, meaning) => t().trueFalseStatement(name, meaning)
  );
  return toTrueFalseQuestion(tf);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(JUZ_AMMA_SURAHS, (n) => meaningFor(n), (n) => n.arabic);
}

// JUZ_AMMA_SURAHS is already ordered the way children traditionally
// memorize Juz' Amma (starting from An-Nas and working back toward
// Al-Fatihah) — a contiguous slice tests real recall of that order.
function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const start = Math.floor(Math.random() * (JUZ_AMMA_SURAHS.length - count + 1));
    const slice = JUZ_AMMA_SURAHS.slice(start, start + count) as SurahEntry[];
    return slice.map((n) => ({ id: n.id, label: `${n.arabic}  ·  ${n.transliteration}` }));
  };
}

// One description of this game shared by every variant mode below —
// each mode then only supplies its own content generator.
const variants: VariantBase = {
  gameId: 'juz-amma-match',
  theme: COLORS,
  fontFamily: ARABIC_FONT,
  getLang,
  strings: () => ({
    round: t().quizRound,
    score: t().quizScore,
    menu: t().menu,
    wellDone: t().wellDone,
    roundSummary: t().quizRoundSummary,
    playAgain: t().playAgain,
    backToMenu: t().menu,
  }),
  tiers: [
    { label: () => t().easy, totalQuestions: 6 },
    { label: () => t().medium, totalQuestions: 8 },
    { label: () => t().hard, totalQuestions: 10 },
  ],
};

export const MenuScene = createModeMenuScene({
  theme: COLORS,
  fontFamily: LATIN_FONT,
  title: () => t().subtitle,
  tagline: () => t().tagline,
  footer: () => t().footer,
  locale: { getLang, setLang, detectDefaultLang },
  modes: [
    matchMode,
    quizMode({
      label: () => t().modeQuiz,
      icon: '❓',
      gameId: 'juz-amma-match',
      theme: COLORS,
      fontFamily: ARABIC_FONT,
      strings: () => ({
        round: t().quizRound,
        score: t().quizScore,
        menu: t().menu,
        wellDone: t().wellDone,
        roundSummary: t().quizRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateQuizQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateQuizQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateQuizQuestion },
      ],
    }),
    sequenceMode({
      label: () => t().modeSequence,
      icon: '📜',
      gameId: 'juz-amma-match',
      theme: COLORS,
      fontFamily: ARABIC_FONT,
      strings: () => ({
        round: t().quizRound,
        mistakes: t().sequenceMistakes,
        menu: t().menu,
        instruction: t().sequenceInstruction,
        wellDone: t().wellDone,
        roundSummary: t().sequenceRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().easy, totalRounds: 4, generateRound: generateSequenceRound(4) },
        { label: () => t().medium, totalRounds: 4, generateRound: generateSequenceRound(6) },
        { label: () => t().hard, totalRounds: 4, generateRound: generateSequenceRound(8) },
      ],
    }),
    listenIdentifyMode(variants, generateListenQuestion),
    reviewMode(variants, generateFlashcardDeck),
    trueFalseMode(variants, generateTrueFalseQuestion),
    fillBlankMode(variants, generateFillBlankQuestion, { fontFamily: LATIN_FONT }),
  ],
});
