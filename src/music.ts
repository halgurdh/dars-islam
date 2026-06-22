import type { EventBus } from './core/events/EventBus';
import type { GameEvents } from './game/events';
import type { GameContext } from './game/GameContext';
import { S } from './game/states/stateNames';
import { Access, isAlive } from './game/systems/PlayerFactory';

// ── Music FSM states ────────────────────────────────────────────────────────

export type MusicState =
  | 'Menu'           // class-select — base layer only, quiet
  | 'Normal'         // regular gameplay — base layer full
  | 'AlmostWinning'  // current player dominant — base + mid
  | 'AlmostDefeated' // current player low HP — base + mid + top
  | 'Combat'         // combat overlay — base + mid + top
  | 'GameOver';      // fade everything to silence

// Gain values per layer [base, mid, top] for each state
const GAINS: Record<MusicState, [number, number, number]> = {
  Menu:           [0.45, 0.00, 0.00],
  Normal:         [0.70, 0.00, 0.00],
  AlmostWinning:  [0.70, 0.70, 0.00],
  AlmostDefeated: [0.70, 0.70, 0.70],
  Combat:         [0.70, 0.70, 0.70],
  GameOver:       [0.00, 0.00, 0.00],
};

const LAYER_FILES = ['assets/bg1.mp3', 'assets/bg2.mp3', 'assets/bg3.mp3'];
const FADE_S = 2.0; // crossfade duration in seconds

// ── Manager ─────────────────────────────────────────────────────────────────

class MusicManager {
  private ac:      AudioContext | null          = null;
  private sources: AudioBufferSourceNode[]      = [];
  private gains:   GainNode[]                   = [];

  private state:   MusicState = 'Menu';
  private unsubs:  (() => void)[]               = [];

  /**
   * Call once on the first user gesture (browser autoplay policy).
   * Loads all layers and starts them in sync. Safe to call multiple times.
   */
  async init(): Promise<void> {
    if (this.ac) return;
    try {
      this.ac = new AudioContext();
      const buffers = await Promise.all(
        LAYER_FILES.map(async (path) => {
          const res = await fetch(path);
          const buf = await res.arrayBuffer();
          return this.ac!.decodeAudioData(buf);
        }),
      );
      this._startGraph(buffers);
    } catch (err) {
      console.warn('[Music] Failed to load layers — music disabled.', err);
    }
  }

  private _startGraph(buffers: AudioBuffer[]): void {
    const ac = this.ac!;
    const initial = GAINS[this.state];

    buffers.forEach((buffer, i) => {
      const gain   = ac.createGain();
      const source = ac.createBufferSource();
      source.buffer = buffer;
      source.loop   = true;
      source.connect(gain);
      gain.connect(ac.destination);
      gain.gain.value = initial[i] ?? 0;
      source.start(0); // all layers start at exactly the same time
      this.gains.push(gain);
      this.sources.push(source);
    });
  }

  // ── FSM transition ────────────────────────────────────────────────────────

  transitionTo(next: MusicState): void {
    if (next === this.state) return;
    this.state = next;

    if (!this.ac || this.gains.length === 0) return;

    const targets = GAINS[next];
    const t = this.ac.currentTime;

    this.gains.forEach((gain, i) => {
      const current = gain.gain.value;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(current, t);
      gain.gain.linearRampToValueAtTime(targets[i] ?? 0, t + FADE_S);
    });
  }

  // ── Bus binding ──────────────────────────────────────────────────────────

  bindBus(bus: EventBus<GameEvents>, getCtx: () => GameContext): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];

    let phase = S.ClassSelect;
    const evaluate = () => this._evaluate(phase, getCtx());

    this.unsubs = [
      bus.on('state:changed',  ({ to }) => { phase = to; evaluate(); }),
      bus.on('player:damaged', ()       => evaluate()),
      bus.on('player:healed',  ()       => evaluate()),
      bus.on('game:over',      ()       => this.transitionTo('GameOver')),
    ];
  }

  // ── Evaluation ───────────────────────────────────────────────────────────

  private _evaluate(phase: string, ctx: GameContext): void {
    if (ctx.players.length === 0 || phase === S.ClassSelect) {
      this.transitionTo('Menu'); return;
    }
    if (phase === S.GameOver) {
      this.transitionTo('GameOver'); return;
    }
    if (phase === S.Combat) {
      this.transitionTo('Combat'); return;
    }

    const cur     = ctx.current;
    const hp      = Access.hp(cur);
    const gold    = Access.wallet(cur).gold;
    const hpRatio = hp.hp / hp.maxHP;

    if (hpRatio <= 0.25) {
      this.transitionTo('AlmostDefeated'); return;
    }

    if (gold >= 200) {
      this.transitionTo('AlmostWinning'); return;
    }

    const others = ctx.players.filter((p) => isAlive(p) && p !== cur);
    if (others.length > 0) {
      const maxOtherGold = Math.max(...others.map((p) => Access.wallet(p).gold));
      if (gold >= maxOtherGold * 1.5 && gold >= 80 && hpRatio > 0.5) {
        this.transitionTo('AlmostWinning'); return;
      }
    }

    this.transitionTo('Normal');
  }
}

export const musicManager = new MusicManager();
