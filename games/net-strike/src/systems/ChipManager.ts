import Phaser from 'phaser';
import { CHIP_LIBRARY } from '../constants';
import type { ChipDefinition } from '../types';

export class ChipManager {
  private readonly rng: Phaser.Math.RandomDataGenerator;
  private readonly queue: ChipDefinition[] = [];

  constructor() {
    this.rng = new Phaser.Math.RandomDataGenerator([Date.now().toString()]);
  }

  drawHand(): ChipDefinition[] {
    const hand: ChipDefinition[] = [];
    for (let index = 0; index < 5; index += 1) {
      const blueprint = CHIP_LIBRARY[this.rng.between(0, CHIP_LIBRARY.length - 1)];
      const code = blueprint.allowedCodes[this.rng.between(0, blueprint.allowedCodes.length - 1)];
      hand.push({ ...blueprint, code });
    }
    return hand;
  }

  queueSelected(chips: ChipDefinition[]): void {
    chips.forEach((chip) => this.queue.push({ ...chip }));
  }

  consumeNext(): ChipDefinition | undefined {
    return this.queue.shift();
  }

  getQueue(): ChipDefinition[] {
    return [...this.queue];
  }
}
