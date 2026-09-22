import { QuizScene, bootQuizGame } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#0f171a', [new MenuScene(), new QuizScene(), new MatchScene(), new SequenceScene()]);
