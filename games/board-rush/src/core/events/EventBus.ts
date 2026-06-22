/**
 * Minimal typed publish/subscribe event bus.
 *
 * Decouples game logic, UI and systems. Define an event map describing
 * the payload type for each event name, then get full type-safety on
 * emit/on.
 *
 * @example
 *   interface Events { 'player:died': { playerId: number } }
 *   const bus = new EventBus<Events>();
 *   bus.on('player:died', e => console.log(e.playerId));
 *   bus.emit('player:died', { playerId: 2 });
 */
export type EventMap = Record<string, unknown>;
export type Handler<T> = (payload: T) => void;

export class EventBus<E extends EventMap> {
  private handlers: { [K in keyof E]?: Set<Handler<E[K]>> } = {};

  /** Subscribe. Returns an unsubscribe function. */
  on<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    (this.handlers[event] ??= new Set()).add(handler);
    return () => this.off(event, handler);
  }

  /** Subscribe once; auto-unsubscribes after the first emit. */
  once<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    const wrap: Handler<E[K]> = (p) => {
      this.off(event, wrap);
      handler(p);
    };
    return this.on(event, wrap);
  }

  /** Unsubscribe a specific handler. */
  off<K extends keyof E>(event: K, handler: Handler<E[K]>): void {
    this.handlers[event]?.delete(handler);
  }

  /** Emit an event to all subscribers. */
  emit<K extends keyof E>(event: K, payload: E[K]): void {
    this.handlers[event]?.forEach((h) => h(payload));
  }

  /** Remove all handlers (useful on scene shutdown / new game). */
  clear(): void {
    this.handlers = {};
  }
}
