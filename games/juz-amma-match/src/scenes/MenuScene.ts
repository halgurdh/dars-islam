import { COLORS, ARABIC_FONT, LATIN_FONT } from '../theme';
import { JUZ_AMMA_SURAHS, meaningFor, type SurahEntry } from '../data/names';
import { getLang, setLang, detectDefaultLang } from '../systems/Locale';
import { sfx } from '../systems/Sfx';
import { t } from '../i18n';
import { createModeMenuScene, quizMode, sequenceMode, type GameMode } from '@shared/mode-menu-kit';
import type { QuizQuestion } from '@shared/quiz-kit';
import type { SequenceItem } from '@shared/sequence-kit';

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
  ],
});
