import type { QuizQuestion } from '@shared/quiz-kit';
import type { MatchItem } from '@shared/match-kit';
import type { SequenceItem } from '@shared/sequence-kit';

export const TOTAL_QUESTIONS = 10;

interface Fact {
  prompt: string;
  answer: string;
  wrong: [string, string, string];
  sub?: string;
}

const FACTS: Fact[] = [
  { prompt: 'Which animal says "Moo"?', answer: 'Cow', wrong: ['Dog', 'Cat', 'Duck'] },
  { prompt: 'What do bees collect from flowers?', answer: 'Nectar', wrong: ['Water', 'Leaves', 'Rocks'] },
  { prompt: 'What do plants need to grow?', answer: 'Sun & water', wrong: ['Candy', 'Rocks', 'Ice'] },
  { prompt: 'What gives us light and heat in the day?', answer: 'The Sun', wrong: ['The Moon', 'Stars', 'Clouds'] },
  { prompt: 'What do we call frozen rain?', answer: 'Snow', wrong: ['Fog', 'Wind', 'Steam'] },
  { prompt: 'Which part of your body do you see with?', answer: 'Eyes', wrong: ['Ears', 'Nose', 'Feet'] },
  { prompt: 'What do fish use to breathe underwater?', answer: 'Gills', wrong: ['Lungs', 'Nose', 'Mouth'] },
  { prompt: 'How many legs does a spider have?', answer: '8', wrong: ['6', '4', '2'] },
  { prompt: 'What do caterpillars turn into?', answer: 'Butterflies', wrong: ['Birds', 'Bees', 'Frogs'] },
  { prompt: 'What is a baby dog called?', answer: 'Puppy', wrong: ['Kitten', 'Cub', 'Chick'] },
  { prompt: 'What season is the coldest?', answer: 'Winter', wrong: ['Summer', 'Spring', 'Fall'], sub: 'Trees lose their leaves before winter comes.' },
  { prompt: 'Which sense do you use to hear?', answer: 'Ears', wrong: ['Eyes', 'Nose', 'Skin'] },
  { prompt: 'What color is the sky on a clear day?', answer: 'Blue', wrong: ['Green', 'Red', 'Purple'] },
  { prompt: 'What is a baby cat called?', answer: 'Kitten', wrong: ['Puppy', 'Cub', 'Chick'] },
  { prompt: 'Which part of a plant is usually underground?', answer: 'Roots', wrong: ['Leaves', 'Flowers', 'Petals'] },
  { prompt: 'What happens to water when it gets very cold?', answer: 'Freezes', wrong: ['Boils', 'Vanishes', 'Turns pink'] },
  { prompt: 'What happens to water when it gets very hot?', answer: 'Boils', wrong: ['Freezes', 'Turns solid', 'Turns blue'] },
  { prompt: 'Which of these animals can fly?', answer: 'Bird', wrong: ['Elephant', 'Fish', 'Turtle'] },
  { prompt: 'How many colors are in a rainbow?', answer: '7', wrong: ['3', '5', '10'] },
  { prompt: 'What do we call baby cows?', answer: 'Calves', wrong: ['Cubs', 'Foals', 'Kids'] },
  { prompt: 'What season comes right after winter?', answer: 'Spring', wrong: ['Summer', 'Fall', 'Winter again'] },
  { prompt: 'Which animal has a very long neck?', answer: 'Giraffe', wrong: ['Elephant', 'Lion', 'Zebra'] },
  { prompt: 'What do we call it when the sun goes down and it gets dark?', answer: 'Night', wrong: ['Morning', 'Noon', 'Sunrise'] },
  { prompt: 'What do you call frozen water you can skate on?', answer: 'Ice', wrong: ['Snow', 'Steam', 'Fog'] },
  { prompt: 'Which of these is a fruit?', answer: 'Apple', wrong: ['Carrot', 'Potato', 'Broccoli'] },
  { prompt: 'What do bees make in their hive?', answer: 'Honey', wrong: ['Milk', 'Bread', 'Juice'] },
  { prompt: 'How many days are in one week?', answer: '7', wrong: ['5', '10', '30'] },
  { prompt: 'What do plants make using sunlight?', answer: 'Food', wrong: ['Rain', 'Wind', 'Sand'] },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestion(fact: Fact): QuizQuestion {
  const options = shuffle([fact.answer, ...fact.wrong]);
  return {
    prompt: fact.prompt,
    sub: fact.sub,
    choices: options,
    correctIndex: options.indexOf(fact.answer),
  };
}

/**
 * Returns a generator that reshuffles its fact pool every time a run
 * restarts at question 0 — including "Play Again", which reuses this same
 * closure instance, so replaying doesn't just repeat the same 10 facts.
 */
export function makeRunGenerator(): (index: number) => QuizQuestion {
  let pool: Fact[] = [];
  return (index: number) => {
    if (index === 0) pool = shuffle(FACTS).slice(0, TOTAL_QUESTIONS);
    return buildQuestion(pool[index]);
  };
}

// Match: a couple of facts share an answer (both "7 days in a week" and
// "7 colors in a rainbow") — deduped by answer so no two cards tie.
export function generateMatchItems(pairs: number): MatchItem[] {
  const seen = new Set<string>();
  const unique = shuffle(FACTS).filter((fact) => {
    if (seen.has(fact.answer)) return false;
    seen.add(fact.answer);
    return true;
  });
  return unique.slice(0, Math.min(pairs, unique.length)).map((fact, i) => ({
    id: i,
    sideA: fact.prompt,
    sideB: fact.answer,
  }));
}

// Sequence: these facts span totally different topics with no shared
// magnitude — ordering by answer length is the one honest orderable
// property, deduped so no two cards tie on length.
export function generateSequenceRound(count: number): SequenceItem[] {
  const seen = new Set<number>();
  const unique = shuffle(FACTS).filter((fact) => {
    if (seen.has(fact.answer.length)) return false;
    seen.add(fact.answer.length);
    return true;
  });
  const n = Math.min(count, unique.length);
  return unique
    .slice(0, n)
    .sort((a, b) => a.answer.length - b.answer.length)
    .map((fact, i) => ({ id: i, label: fact.answer }));
}
