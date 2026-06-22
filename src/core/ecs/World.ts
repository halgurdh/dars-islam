import { Entity } from './Entity';

/**
 * A System encapsulates behaviour that operates over entities owning a
 * particular set of components. Concrete systems extend this and
 * implement their own methods; the base provides a `query` helper.
 */
export abstract class System {
  protected world!: World;

  /** Called by World when the system is registered. */
  attach(world: World): void {
    this.world = world;
  }

  /** Entities owning all of the given component types. */
  protected query(...types: string[]): Entity[] {
    return this.world.entities.filter((e) => e.has(...types));
  }
}

/**
 * The World owns all entities and systems and is the single source of
 * truth for game state. Logic systems read/write components here; the
 * Phaser layer only ever reads from it to render.
 */
export class World {
  readonly entities: Entity[] = [];
  private systems = new Map<string, System>();

  /** Create + register a new entity. */
  createEntity(): Entity {
    const e = new Entity();
    this.entities.push(e);
    return e;
  }

  /** Register an already-built entity. */
  addEntity(e: Entity): Entity {
    this.entities.push(e);
    return e;
  }

  /** Remove an entity by id. */
  removeEntity(id: number): void {
    const i = this.entities.findIndex((e) => e.id === id);
    if (i >= 0) this.entities.splice(i, 1);
  }

  /** Register a system under a key for later retrieval. */
  registerSystem<T extends System>(key: string, system: T): T {
    system.attach(this);
    this.systems.set(key, system);
    return system;
  }

  /** Fetch a previously-registered system. */
  system<T extends System>(key: string): T {
    const s = this.systems.get(key);
    if (!s) throw new Error(`No system registered under "${key}"`);
    return s as T;
  }

  /** All entities carrying a given tag. */
  byTag(tag: string): Entity[] {
    return this.entities.filter((e) => e.hasTag(tag));
  }

  /** First entity matching all component types, or undefined. */
  first(...types: string[]): Entity | undefined {
    return this.entities.find((e) => e.has(...types));
  }
}
