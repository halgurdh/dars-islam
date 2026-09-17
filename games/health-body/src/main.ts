import { bootQuizGame } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#1a0f0f', [new MenuScene(), new MatchScene()]);
