import { COLORS, ARABIC_FONT, LATIN_FONT } from '../theme';
import { ASMA_UL_HUSNA, meaningFor, type AsmaName } from '../data/names';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { sfx } from '../systems/Sfx';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, listenMode, flashcardMode, type GameMode } from '@shared/mode-menu-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { SequenceItem } from '@shared/sequence-kit';
import type { FlashcardItem } from '@shared/flashcard-kit';
import { fillBlankWordQuestion, trueFalseStatement, toTrueFalseQuestion } from '@shared/quiz-variants';
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
  const [correct, ...distractors] = shuffle(ASMA_UL_HUSNA).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((n) => meaningFor(n)));
  return {
    prompt: correct.arabic,
    sub: correct.transliteration,
    choices,
    correctIndex: choices.indexOf(meaningFor(correct)),
  };
}

// "Listen & Identify": the Arabic audio plays instead of showing the Name
// as text — the player has to recognize it by ear, picking its meaning
// from four written choices.
function generateListenQuestion(): QuizQuestion {
  const [correct, ...distractors] = shuffle(ASMA_UL_HUSNA).slice(0, 4);
  const choices = shuffle([correct, ...distractors].map((n) => meaningFor(n)));
  return {
    prompt: '',
    choices,
    correctIndex: choices.indexOf(meaningFor(correct)),
    speak: { text: correct.arabic, lang: SPEECH_LANG.arabic },
  };
}

function generateFlashcardDeck(): FlashcardItem[] {
  return ASMA_UL_HUSNA.map((n) => ({
    id: n.id,
    primary: n.arabic,
    secondary: n.transliteration,
    meaning: meaningFor(n),
    speak: { text: n.arabic, lang: SPEECH_LANG.arabic },
  }));
}

function generateTrueFalseQuestion(): QuizQuestion {
  const tf = trueFalseStatement(
    ASMA_UL_HUSNA,
    (n) => n.transliteration,
    (n) => meaningFor(n),
    (name, meaning) => t().trueFalseStatement(name, meaning)
  );
  return toTrueFalseQuestion(tf, t().trueLabel, t().falseLabel);
}

function generateFillBlankQuestion(): QuizQuestion {
  return fillBlankWordQuestion(ASMA_UL_HUSNA, (n) => meaningFor(n), (n) => n.arabic);
}

// The 99 Names are listed in their traditional order (id 1..99) — a
// contiguous slice tests real recall of that memorized sequence, unlike an
// arbitrary sort key.
function generateSequenceRound(count: number): () => SequenceItem[] {
  return () => {
    const start = Math.floor(Math.random() * (ASMA_UL_HUSNA.length - count + 1));
    const slice = ASMA_UL_HUSNA.slice(start, start + count) as AsmaName[];
    return slice.map((n) => ({ id: n.id, label: `${n.arabic}  ·  ${n.transliteration}` }));
  };
}

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
      gameId: 'asma-match',
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
      gameId: 'asma-match',
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
        { label: () => t().easy, totalRounds: 4, generateRound: generateSequenceRound(3) },
        { label: () => t().medium, totalRounds: 4, generateRound: generateSequenceRound(4) },
        { label: () => t().hard, totalRounds: 4, generateRound: generateSequenceRound(5) },
      ],
    }),
    listenMode({
      label: () => t().modeListen,
      icon: '🔊',
      gameId: 'asma-match',
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
      replayLabel: () => t().listenReplay,
      difficulties: [
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateListenQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateListenQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateListenQuestion },
      ],
    }),
    flashcardMode({
      label: () => t().modeFlashcard,
      icon: '🗂️',
      gameId: 'asma-match',
      theme: COLORS,
      fontFamily: ARABIC_FONT,
      strings: () => ({
        menu: t().menu,
        progress: t().flashcardProgress,
        hear: t().hear,
        knowIt: t().flashcardKnowIt,
        stillLearning: t().flashcardStillLearning,
        wellDone: t().wellDone,
        roundSummary: t().flashcardRoundSummary,
        playAgain: t().playAgain,
        backToMenu: t().menu,
      }),
      difficulties: [
        { label: () => t().hard, cards: generateFlashcardDeck },
      ],
    }),
    quizMode({
      id: 'truefalse',
      label: () => t().modeTrueFalse,
      icon: '✓✗',
      gameId: 'asma-match',
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
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateTrueFalseQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateTrueFalseQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateTrueFalseQuestion },
      ],
    }),
    quizMode({
      id: 'fillblank',
      label: () => t().modeFillBlank,
      icon: '✏️',
      gameId: 'asma-match',
      theme: COLORS,
      fontFamily: LATIN_FONT,
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
        { label: () => t().easy, totalQuestions: 6, generateQuestion: generateFillBlankQuestion },
        { label: () => t().medium, totalQuestions: 8, generateQuestion: generateFillBlankQuestion },
        { label: () => t().hard, totalQuestions: 10, generateQuestion: generateFillBlankQuestion },
      ],
    }),
  ],
});
