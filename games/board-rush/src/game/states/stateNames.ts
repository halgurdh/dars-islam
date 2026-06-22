/** Canonical FSM state identifiers. */
export const S = {
  ClassSelect: 'ClassSelect',
  Roll: 'Roll',
  Moving: 'Moving',
  SquareEffect: 'SquareEffect',
  CardPlay: 'CardPlay',
  Combat: 'Combat',
  Market: 'Market',
  EndTurn: 'EndTurn',
  GameOver: 'GameOver',
} as const;

export type StateName = (typeof S)[keyof typeof S];
