import { QuizScene, bootQuizGame } from '@shared/quiz-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#1a1a0f', [new MenuScene(), new QuizScene()]);
