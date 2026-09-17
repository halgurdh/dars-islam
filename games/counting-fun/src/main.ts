import { QuizScene, bootQuizGame } from '@shared/quiz-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#170f08', [new MenuScene(), new QuizScene()]);
