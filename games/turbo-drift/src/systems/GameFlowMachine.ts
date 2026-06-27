import { StateMachine, type State } from '../../../../src/core/fsm/StateMachine';
import { WORLD } from '../constants';
import { GameState } from './GameState';
import { turboMusic } from './MusicStateMachine';

export type TurboFlowState =
  | 'garage_idle'
  | 'garage_customizing'
  | 'garage_unlock_ready'
  | 'race_countdown'
  | 'race_active'
  | 'race_finished'
  | 'returning_to_garage';

export interface FlowHooks {
  onGarageRefresh?: () => void;
  onCountdownTick?: (value: number) => void;
  onCountdownFinished?: () => void;
  onRaceFinished?: () => void;
  onReturnToGarage?: () => void;
}

interface FlowContext {
  countdownMs: number;
  lapsCompleted: number;
  hooks: FlowHooks;
}

const COUNTDOWN_MS = 3000;

class TurboFlowController {
  private readonly ctx: FlowContext = {
    countdownMs: COUNTDOWN_MS,
    lapsCompleted: 0,
    hooks: {},
  };

  private readonly machine = new StateMachine<FlowContext>(this.ctx);
  private lastCountdownSecond = 3;

  constructor() {
    this.machine
      .add(this.makeGarageIdleState())
      .add(this.makeGarageCustomizingState())
      .add(this.makeGarageUnlockReadyState())
      .add(this.makeRaceCountdownState())
      .add(this.makeRaceActiveState())
      .add(this.makeRaceFinishedState())
      .add(this.makeReturningState());
  }

  setHooks(hooks: FlowHooks): void {
    this.ctx.hooks = hooks;
  }

  clearHooks(): void {
    this.ctx.hooks = {};
  }

  start(): void {
    if (this.machine.currentName === null) {
      this.machine.start(this.evaluateGarageUnlock() ? 'garage_unlock_ready' : 'garage_idle');
    }
  }

  resetForGarage(): void {
    this.ctx.countdownMs = COUNTDOWN_MS;
    this.ctx.lapsCompleted = 0;
    this.machine.transition(this.evaluateGarageUnlock() ? 'garage_unlock_ready' : 'garage_idle');
  }

  update(delta: number): void {
    this.machine.update(delta);
  }

  send(event: string, payload?: unknown): void {
    this.machine.send(event, payload);
  }

  get currentState(): TurboFlowState | null {
    return this.machine.currentName as TurboFlowState | null;
  }

  private evaluateGarageUnlock(): boolean {
    return GameState.load().currentTier === 'hatchback'
      && (GameState.canUnlockSedanByTime() || GameState.canUnlockSedanByCurrency());
  }

  private makeGarageIdleState(): State<FlowContext> {
    return {
      name: 'garage_idle',
      onEnter: (ctx) => {
        turboMusic.transitionTo('garage');
        ctx.hooks.onGarageRefresh?.();
      },
      onEvent: (_ctx, machine, event) => {
        if (event === 'customize') machine.transition('garage_customizing');
        if (event === 'unlock_available') machine.transition('garage_unlock_ready');
        if (event === 'start_race') machine.transition('race_countdown');
      },
    };
  }

  private makeGarageCustomizingState(): State<FlowContext> {
    return {
      name: 'garage_customizing',
      onEnter: (ctx) => {
        turboMusic.transitionTo('garage');
        ctx.hooks.onGarageRefresh?.();
      },
      onEvent: (_ctx, machine, event) => {
        if (event === 'customize_done') machine.transition(this.evaluateGarageUnlock() ? 'garage_unlock_ready' : 'garage_idle');
        if (event === 'start_race') machine.transition('race_countdown');
      },
    };
  }

  private makeGarageUnlockReadyState(): State<FlowContext> {
    return {
      name: 'garage_unlock_ready',
      onEnter: (ctx) => {
        turboMusic.transitionTo('garage');
        ctx.hooks.onGarageRefresh?.();
      },
      onEvent: (_ctx, machine, event) => {
        if (event === 'customize') machine.transition('garage_customizing');
        if (event === 'unlock_claimed') machine.transition('garage_idle');
        if (event === 'unlock_hidden') machine.transition('garage_idle');
        if (event === 'start_race') machine.transition('race_countdown');
      },
    };
  }

  private makeRaceCountdownState(): State<FlowContext> {
    return {
      name: 'race_countdown',
      onEnter: (ctx) => {
        ctx.countdownMs = COUNTDOWN_MS;
        this.lastCountdownSecond = 3;
        turboMusic.transitionTo('cruise');
        ctx.hooks.onCountdownTick?.(3);
      },
      onUpdate: (ctx, machine, dt) => {
        ctx.countdownMs = Math.max(0, ctx.countdownMs - dt);
        const nextSecond = Math.ceil(ctx.countdownMs / 1000);
        if (nextSecond > 0 && nextSecond !== this.lastCountdownSecond) {
          this.lastCountdownSecond = nextSecond;
          ctx.hooks.onCountdownTick?.(nextSecond);
        }
        if (ctx.countdownMs <= 0) {
          ctx.hooks.onCountdownFinished?.();
          machine.transition('race_active');
        }
      },
      onEvent: (_ctx, machine, event) => {
        if (event === 'cancel_race') machine.transition('returning_to_garage');
      },
    };
  }

  private makeRaceActiveState(): State<FlowContext> {
    return {
      name: 'race_active',
      onEnter: () => {
        turboMusic.transitionTo('cruise');
      },
      onEvent: (ctx, machine, event, payload) => {
        if (event === 'drift_start') turboMusic.transitionTo('drift');
        if (event === 'drift_end') turboMusic.transitionTo('cruise');
        if (event === 'lap_complete') {
          ctx.lapsCompleted = typeof payload === 'number' ? payload : ctx.lapsCompleted + 1;
          if (ctx.lapsCompleted >= WORLD.lapsToWin) {
            machine.transition('race_finished');
          }
        }
        if (event === 'cancel_race') machine.transition('returning_to_garage');
      },
    };
  }

  private makeRaceFinishedState(): State<FlowContext> {
    return {
      name: 'race_finished',
      onEnter: (ctx) => {
        turboMusic.transitionTo('finish');
        ctx.hooks.onRaceFinished?.();
      },
      onEvent: (_ctx, machine, event) => {
        if (event === 'return_to_garage') machine.transition('returning_to_garage');
      },
    };
  }

  private makeReturningState(): State<FlowContext> {
    return {
      name: 'returning_to_garage',
      onEnter: (ctx, machine) => {
        turboMusic.transitionTo('garage');
        ctx.hooks.onReturnToGarage?.();
        machine.transition(this.evaluateGarageUnlock() ? 'garage_unlock_ready' : 'garage_idle');
      },
    };
  }
}

export const gameFlow = new TurboFlowController();
