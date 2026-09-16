import type { QuizQuestion } from '@shared/quiz-kit';

export const TOTAL_QUESTIONS = 10;

interface Item {
  prompt: string;
  answer: string;
  wrong: [string, string, string];
  sub?: string;
}

const ITEMS: Item[] = [
  { prompt: 'How does this face feel? 😢', answer: 'Sad', wrong: ['Happy', 'Excited', 'Silly'] },
  { prompt: 'How does this face feel? 😊', answer: 'Happy', wrong: ['Sad', 'Scared', 'Angry'] },
  { prompt: 'How does this face feel? 😠', answer: 'Angry', wrong: ['Happy', 'Sleepy', 'Calm'] },
  { prompt: 'How does this face feel? 😨', answer: 'Scared', wrong: ['Excited', 'Calm', 'Proud'] },
  { prompt: 'How does this face feel? 😴', answer: 'Tired', wrong: ['Angry', 'Surprised', 'Happy'] },
  { prompt: 'How does this face feel? 😲', answer: 'Surprised', wrong: ['Bored', 'Calm', 'Tired'] },
  { prompt: 'Your friend is crying.\nWhat’s kind?', answer: 'Comfort them', wrong: ['Laugh', 'Walk away', 'Take a toy'] },
  { prompt: 'A friend shares their snack.\nWhat do you say?', answer: 'Thank you', wrong: ['Nothing', 'Give it back', 'Ask for more'] },
  { prompt: 'Someone else has the toy\nyou want. What do you do?', answer: 'Ask and wait', wrong: ['Grab it', 'Cry loudly', 'Push them'] },
  { prompt: 'Someone helps you.\nWhat do you say?', answer: 'Thank you', wrong: ['Go away', 'Nothing', 'That’s mine'] },
  { prompt: 'Your sibling is scared\nof the dark. What’s kind?', answer: 'Comfort them', wrong: ['Laugh', 'Ignore them', 'Tell them off'] },
  { prompt: 'You broke a toy\nby accident. What’s kind?', answer: 'Say sorry', wrong: ['Hide it', 'Blame someone', 'Run away'] },
  { prompt: 'It’s time to share toys.\nWhat do you do?', answer: 'Take turns', wrong: ['Keep them all', 'Hide them', 'Say no'] },
  { prompt: 'A classmate sits alone.\nWhat’s kind?', answer: 'Invite them', wrong: ['Ignore them', 'Laugh', 'Walk past'] },
  { prompt: 'Someone drops their books.\nWhat do you do?', answer: 'Help them up', wrong: ['Walk past', 'Laugh', 'Step on them'] },
  { prompt: 'How should you greet a friend?', answer: 'Smile & say hi', wrong: ['Ignore them', 'Frown', 'Walk away'] },
  { prompt: 'What should you do\nbefore you eat?', answer: 'Wash hands', wrong: ['Nothing', 'Run around', 'Yell'] },
  { prompt: 'A friend got a new toy.\nWhat do you say?', answer: 'I’m happy for you!', wrong: ['That’s silly', 'I don’t care', 'Give it to me'] },
  { prompt: 'You made a mistake\non your work.', answer: 'Try again', wrong: ['Give up', 'Cry all day', 'Blame others'] },
  { prompt: 'What’s a kind way\nto ask for something?', answer: 'Please, may I?', wrong: ['Give me that!', 'Now!', 'Grab it'] },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(item: Item): QuizQuestion {
  const options = shuffle([item.answer, ...item.wrong]);
  return {
    prompt: item.prompt,
    sub: item.sub,
    choices: options,
    correctIndex: options.indexOf(item.answer),
  };
}

/**
 * Returns a generator that reshuffles its item pool every time a run
 * restarts at question 0 — including "Play Again", which reuses this same
 * closure instance, so replaying doesn't just repeat the same 10 items.
 */
export function makeRunGenerator(): (index: number) => QuizQuestion {
  let pool: Item[] = [];
  return (index: number) => {
    if (index === 0) pool = shuffle(ITEMS).slice(0, TOTAL_QUESTIONS);
    return buildQuestion(pool[index]);
  };
}
