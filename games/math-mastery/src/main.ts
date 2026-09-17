import { QuizScene, bootQuizGame } from '@shared/quiz-kit';
import { MenuScene } from './scenes/MenuScene';
import { LearnScene } from './scenes/LearnScene';

bootQuizGame('#170b08', [new MenuScene(), new LearnScene(), new QuizScene()]);
