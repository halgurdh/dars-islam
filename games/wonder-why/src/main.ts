import { QuizScene, bootQuizGame } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { FlashcardScene } from '@shared/flashcard-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#0b1708', [new MenuScene(), new QuizScene(), new MatchScene(), new SequenceScene(), new FlashcardScene()]);
