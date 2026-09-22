import { bootQuizGame, QuizScene } from '@shared/quiz-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';

bootQuizGame('#0d2b26', [new MenuScene(), new GameScene(), new QuizScene(), new SequenceScene()]);
