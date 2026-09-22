import { QuizScene, bootQuizGame } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#081716', [new MenuScene(), new QuizScene(), new MatchScene(), new SequenceScene()]);
