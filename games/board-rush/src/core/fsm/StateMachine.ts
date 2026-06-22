/**
 * Generic, framework-agnostic finite state machine.
 *
 * Reusable for any context type. States are objects implementing the
 * `State` interface. Transitions are requested from inside a state via
 * the `StateMachine` reference passed to each hook.
 *
 * @typeParam C - the shared context object passed to every state hook.
 */

export interface State<C> {
  /** Unique identifier for this state. */
  readonly name: string;

  /** Called once when the machine enters this state. */
  onEnter?(ctx: C, machine: StateMachine<C>, payload?: unknown): void;

  /** Called every tick while this state is active (optional). */
  onUpdate?(ctx: C, machine: StateMachine<C>, dt: number): void;

  /** Called with named events forwarded from the outside world. */
  onEvent?(ctx: C, machine: StateMachine<C>, event: string, payload?: unknown): void;

  /** Called once when the machine leaves this state. */
  onExit?(ctx: C, machine: StateMachine<C>): void;
}

export class StateMachine<C> {
  private states = new Map<string, State<C>>();
  private current: State<C> | null = null;
  private ctx: C;

  /** Optional hook fired after every transition (useful for UI / logging). */
  onTransition?: (from: string | null, to: string) => void;

  constructor(ctx: C) {
    this.ctx = ctx;
  }

  /** Register a state. Returns `this` for chaining. */
  add(state: State<C>): this {
    this.states.set(state.name, state);
    return this;
  }

  /** Current state name, or null before start(). */
  get currentName(): string | null {
    return this.current?.name ?? null;
  }

  /** Begin the machine in the named state. */
  start(name: string, payload?: unknown): void {
    this.transition(name, payload);
  }

  /** Transition to a new state, running exit/enter hooks. */
  transition(name: string, payload?: unknown): void {
    const next = this.states.get(name);
    if (!next) {
      throw new Error(`[FSM] Unknown state "${name}". Registered: ${[...this.states.keys()].join(', ')}`);
    }
    const fromName = this.current?.name ?? null;
    this.current?.onExit?.(this.ctx, this);
    this.current = next;
    this.current.onEnter?.(this.ctx, this, payload);
    this.onTransition?.(fromName, name);
  }

  /** Forward a per-frame update to the active state. */
  update(dt: number): void {
    this.current?.onUpdate?.(this.ctx, this, dt);
  }

  /** Forward a named event to the active state. */
  send(event: string, payload?: unknown): void {
    this.current?.onEvent?.(this.ctx, this, event, payload);
  }

  /** True if currently in the named state. */
  is(name: string): boolean {
    return this.current?.name === name;
  }
}
