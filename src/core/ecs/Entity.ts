/**
 * Lightweight Entity-Component System.
 *
 * An `Entity` is just an id plus a typed bag of components. A `Component`
 * is a plain data object tagged with a unique `type` string used as the
 * lookup key. `System`s (see ./System.ts) iterate entities that own a
 * required set of component types.
 *
 * This is intentionally minimal — no archetypes or bitsets — which is
 * the right scale for a turn-based board game with a handful of entities.
 */

let _nextId = 1;

export interface Component {
  /** Unique string key identifying the component type. */
  readonly type: string;
}

export class Entity {
  readonly id: number;
  readonly tags = new Set<string>();
  private components = new Map<string, Component>();

  constructor(id?: number) {
    this.id = id ?? _nextId++;
  }

  /** Add or replace a component. Returns `this` for chaining. */
  add<T extends Component>(component: T): this {
    this.components.set(component.type, component);
    return this;
  }

  /** Get a component by its type key, or undefined. */
  get<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  /** Get a component, throwing if absent (use when presence is guaranteed). */
  require<T extends Component>(type: string): T {
    const c = this.components.get(type);
    if (!c) throw new Error(`Entity ${this.id} missing required component "${type}"`);
    return c as T;
  }

  /** True if the entity owns every listed component type. */
  has(...types: string[]): boolean {
    return types.every((t) => this.components.has(t));
  }

  /** Remove a component by type. */
  remove(type: string): this {
    this.components.delete(type);
    return this;
  }

  /** Tag helpers (e.g. "player", "enemy"). */
  tag(name: string): this {
    this.tags.add(name);
    return this;
  }
  hasTag(name: string): boolean {
    return this.tags.has(name);
  }
}

/** Reset the global id counter (test isolation only). */
export function _resetEntityIds(): void {
  _nextId = 1;
}
