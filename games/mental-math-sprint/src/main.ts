import { QuizScene, bootQuizGame } from '@shared/quiz-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#081715', [new MenuScene(), new QuizScene()]);
