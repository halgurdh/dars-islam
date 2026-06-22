import { World } from '../core/ecs/World';
import { EventBus } from '../core/events/EventBus';
import type { GameEvents } from './events';
import { CombatSystem } from './systems/CombatSystem';
import { DeckSystem } from './systems/DeckSystem';
import { RNG } from './util/RNG';
import { createBoard, type BoardSquare } from './data/board';
import { createPlayer, Access, isAlive } from './systems/PlayerFactory';
import { HeroClass } from './data/classes';
import { Entity } from '../core/ecs/Entity';

export interface CombatState {
  enemyName: string;
  enemyHP: number;
  enemyAttack: number;
  enemyDefense: number;
  resolved: boolean;
}

/**
 * The context shared by every FSM state. Holds the ECS world, all
 * systems, the board, turn bookkeeping, and the event bus. States read
 * and mutate this; they never talk to Phaser directly.
 */
export class GameContext {
  readonly world = new World();
  readonly bus = new EventBus<GameEvents>();
  readonly rng: RNG;
  readonly board: BoardSquare[] = createBoard();
  readonly combatSys: CombatSystem;
  readonly deckSys: DeckSystem;

  players: Entity[] = [];
  currentIndex = 0;
  round = 1;
  potGold = 0;
  combat: CombatState | null = null;
  winnerId: number | null = null;

  constructor(seed?: number) {
    this.rng = new RNG(seed);
    this.combatSys = this.world.registerSystem('combat', new CombatSystem());
    this.deckSys = this.world.registerSystem('deck', new DeckSystem(this.rng));
  }

  /** Set up a fresh game with the chosen classes. */
  init(picks: { name: string; cls: HeroClass }[]): void {
    this.players = picks.map((p, i) => {
      const e = createPlayer(i, p.name, p.cls);
      this.world.addEntity(e);
      return e;
    });
    this.deckSys.reset();
    this.currentIndex = 0;
    this.round = 1;
    this.winnerId = null;
  }

  get current(): Entity {
    return this.players[this.currentIndex];
  }

  log(text: string): void {
    this.bus.emit('log', { text });
  }

  /** Advance currentIndex to the next living player; returns false if game over. */
  advanceTurn(): boolean {
    const living = this.players.filter(isAlive);
    if (living.length <= 1) return false;
    let next = this.currentIndex;
    for (let i = 0; i < this.players.length; i++) {
      next = (next + 1) % this.players.length;
      if (isAlive(this.players[next])) break;
    }
    if (next <= this.currentIndex) this.round++;
    this.currentIndex = next;
    return true;
  }

  /** Win check: last player alive, or first to 300 gold. */
  checkWin(): boolean {
    const living = this.players.filter(isAlive);
    if (living.length === 1) {
      this.winnerId = Access.id(living[0]).index;
      return true;
    }
    const rich = this.players.find((p) => isAlive(p) && Access.wallet(p).gold >= 300);
    if (rich) {
      this.winnerId = Access.id(rich).index;
      return true;
    }
    return false;
  }
}
