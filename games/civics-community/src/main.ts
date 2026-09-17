import { bootQuizGame } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#0f1a14', [new MenuScene(), new MatchScene()]);
