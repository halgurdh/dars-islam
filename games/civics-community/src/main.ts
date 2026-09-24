import { bootQuizGame, QuizScene } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { FlashcardScene } from '@shared/flashcard-kit';
import { MenuScene } from './scenes/MenuScene';

bootQuizGame('#0f1a14', [new MenuScene(), new MatchScene(), new QuizScene(), new SequenceScene(), new FlashcardScene()]);
