import { QuizScene, bootQuizGame } from '@shared/quiz-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#0e1708', [new MenuScene(), new QuizScene()]);
