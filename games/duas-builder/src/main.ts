import { bootQuizGame } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { HomeScene } from './scenes/HomeScene';
import { BuilderMenuScene } from './scenes/BuilderMenuScene';
import { BuilderScene } from './scenes/BuilderScene';

bootQuizGame('#0d1f18', [new HomeScene(), new BuilderMenuScene(), new BuilderScene(), new MatchScene(), new SequenceScene()]);
