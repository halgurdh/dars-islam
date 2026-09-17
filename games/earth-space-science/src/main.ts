import { bootQuizGame } from '@shared/quiz-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#0a0f1f', [new MenuScene(), new SequenceScene()]);
