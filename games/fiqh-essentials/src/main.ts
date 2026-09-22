import { bootQuizGame, QuizScene } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#0f1a1a', [new MenuScene(), new SequenceScene(), new MatchScene(), new QuizScene()]);
