import { bootQuizGame, QuizScene } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#170d08', [new MenuScene(), new MatchScene(), new QuizScene(), new SequenceScene()]);
