import { bootQuizGame } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#0a1a1f', [new MenuScene(), new MatchScene()]);
