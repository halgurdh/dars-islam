import { QuizScene, bootQuizGame } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { MenuScene } from './scenes/MenuScene';
import { LearnScene } from './scenes/LearnScene';
import { createTrickHomeScenes } from './scenes/TrickHomeScenes';

bootQuizGame('#170817', [
  new MenuScene(),
  new LearnScene(),
  new QuizScene(),
  new MatchScene(),
  new SequenceScene(),
  ...createTrickHomeScenes(),
]);
