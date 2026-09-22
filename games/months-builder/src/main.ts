import { bootQuizGame } from '@shared/quiz-kit';
import { MatchScene } from '@shared/match-kit';
import { SequenceScene } from '@shared/sequence-kit';
import { SPEECH_LANG } from '@shared/tts';
import { HomeScene } from './scenes/HomeScene';
import { BuilderMenuScene } from './scenes/BuilderMenuScene';
import { BuilderScene } from './scenes/BuilderScene';
import { sfx } from './systems/Sfx';

// Start downloading the Arabic voice model in the background right away —
// by the time a player reaches a "Hear it" button, it's usually cached.
sfx.prewarm(SPEECH_LANG.arabic);

bootQuizGame('#0d1c21', [new HomeScene(), new BuilderMenuScene(), new BuilderScene(), new MatchScene(), new SequenceScene()]);
