import { bootQuizGame } from '@shared/quiz-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#1f160a', [new MenuScene(), new SequenceScene()]);
