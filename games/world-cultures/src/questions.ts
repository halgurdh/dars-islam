export interface Difficulty {
  id: string;
  pairs: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { id: 'easy', pairs: 6 },
  { id: 'medium', pairs: 8 },
  { id: 'hard', pairs: 10 },
];

// Greeting ↔ language, with approximate total speakers (millions, L1+L2)
// so Speaker Sort tests real "which language is spoken by more people?"
// intuition instead of an alphabetical sort.
export interface Greeting {
  id: number;
  greeting: string;
  language: string;
  speakersMillions: number;
}

export const GREETINGS: Greeting[] = [
  { id: 1, greeting: 'Hola', language: 'Spanish', speakersMillions: 560 },
  { id: 2, greeting: 'Bonjour', language: 'French', speakersMillions: 280 },
  { id: 3, greeting: 'Konnichiwa', language: 'Japanese', speakersMillions: 125 },
  { id: 4, greeting: 'Guten Tag', language: 'German', speakersMillions: 135 },
  { id: 5, greeting: 'Ciao', language: 'Italian', speakersMillions: 65 },
  { id: 6, greeting: 'Namaste', language: 'Hindi', speakersMillions: 600 },
  { id: 7, greeting: 'Merhaba', language: 'Turkish', speakersMillions: 80 },
  { id: 8, greeting: 'Shalom', language: 'Hebrew', speakersMillions: 9 },
  { id: 9, greeting: 'Ni Hao', language: 'Chinese', speakersMillions: 1100 },
  { id: 10, greeting: 'Olá', language: 'Portuguese', speakersMillions: 260 },
];
