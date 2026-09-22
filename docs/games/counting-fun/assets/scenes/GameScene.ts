import Phaser from 'phaser';
import { GameContext } from '@src/game/GameContext';
import { StateMachine } from '@src/core/fsm/StateMachine';
import { registerAllStates } from '@src/game/states/gameStates';
import { S } from '@src/game/states/stateNames';
import { Access } from '@src/game/systems/PlayerFactory';
import { BoardView } from '../views/BoardView';
import { TokenView } from '../views/TokenView';
import { DiceView } from '../views/DiceView';
import { HUD } from '../views/HUD';
import { musicManager } from '@src/music';
import { networkManager } from '@src/net/NetworkManager';
import { serialize } from '@src/net/GameSerializer';

const TURN_IDLE_TIMEOUT_MS = 30_000;

export class GameScene extends Phaser.Scene {
  private ctx!:     GameContext;
  private machine!: StateMachine<GameContext>;
  private board!:   BoardView;
  private tokens!:  TokenView;
  private dice!:    DiceView;
  private hud!:     HUD;
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() { super('Game'); }

  create(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.clearInactivityTimer();
      this.hud?.destroy();
    });
    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      this.clearInactivityTimer();
      this.hud?.destroy();
    });
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, 'background').setAlpha(0.25).setDisplaySize(width, height);
    this.startNewGame();
  }

  private startNewGame(): void {
    this.ctx     = new GameContext();
    this.machine = new StateMachine<GameContext>(this.ctx);
    registerAllStates(this.machine);

    this.machine.onTransition = (from, to) => {
      this.ctx.bus.emit('state:changed', { from, to });
    };

    this.board  = new BoardView(this, this.ctx.board);
    this.tokens = new TokenView(this, this.board.centres);
    this.dice   = new DiceView(this, this.scale.width * 0.3125, this.scale.height * 0.5);

    const parent = document.getElementById('game') ?? document.body;
    this.hud = new HUD(parent as HTMLElement, this.ctx, this.machine);

    musicManager.bindBus(this.ctx.bus, () => this.ctx);
    this.wireNetwork();
    this.wireEvents();

    this.machine.start(S.ClassSelect);
    this.hud.render();
  }

  // ── Network wiring ────────────────────────────────────────────────────────

  private wireNetwork(): void {
    const nm = networkManager;

    // Roster updates refresh the lobby UI
    nm.onRosterUpdate = () => this.hud.render();

    // Host clicked "Start" → show class-pick grid on all clients
    nm.onClassPickStart = () => this.hud.startNetClassPick();

    // All players picked → host starts the FSM
    nm.onGameStart = (picks) => {
      if (nm.isHost) {
        this.machine.send('players:chosen', picks);
      }
      // Guests wait for the first snapshot
    };

    // Host: route guest actions into the FSM
    nm.onAction = (name, payload) => {
      this.machine.send(name, payload);
    };

    // Guest: apply incoming snapshots directly to the HUD
    nm.onSnapshot = (snap) => {
      this.hud.applySnapshot(snap);
    };
  }

  // ── Bus wiring ────────────────────────────────────────────────────────────

  private wireEvents(): void {
    const bus     = this.ctx.bus;
    const nm      = networkManager;
    const getPhase = () => this.machine.currentName ?? '';
    const getLog   = () => (this.hud as unknown as { logLines: string[] }).logLines ?? [];

    // Broadcast snapshot to guests after every meaningful change
    const broadcast = () => {
      if (nm.isHost) {
        nm.broadcastSnapshot(serialize(this.ctx, getPhase(), getLog()));
      }
    };

    let spawned = false;
    bus.on('turn:started', () => {
      if (!spawned) { this.tokens.spawn(this.ctx.players); spawned = true; }
      this.hud.render();
      broadcast();
      this.scheduleInactivityTimer();
    });

    bus.on('dice:rolled',   ({ d1, d2 }) => { this.dice.roll(d1, d2); broadcast(); this.scheduleInactivityTimer(); });
    bus.on('player:moved',  ({ playerId: id, to }) => { this.tokens.moveTo(id, to); broadcast(); this.scheduleInactivityTimer(); });
    bus.on('player:damaged', () => { broadcast(); this.scheduleInactivityTimer(); });
    bus.on('player:healed',  () => { broadcast(); this.scheduleInactivityTimer(); });
    bus.on('card:played',    () => this.scheduleInactivityTimer());
    bus.on('combat:round',   () => this.scheduleInactivityTimer());
    bus.on('hud:refresh',    () => { broadcast(); this.scheduleInactivityTimer(); });
    bus.on('game:over',     () => {
      this.clearInactivityTimer();
      this.hud.render();
      broadcast();
    });

    bus.on('state:changed', ({ to }) => {
      broadcast();
      this.scheduleInactivityTimer();
      // "Play Again": destroy network and restart scene
      if (to === S.ClassSelect && this.ctx.players.length > 0) {
        nm.destroy();
        this.scene.restart();
      }
    });
  }

  private scheduleInactivityTimer(): void {
    this.clearInactivityTimer();

    if (networkManager.isGuest) return;

    const phase = this.machine.currentName;
    const action = this.getAutoActionForPhase(phase);
    if (!action) return;

    this.inactivityTimer = setTimeout(() => {
      if (this.machine.currentName !== phase) {
        this.scheduleInactivityTimer();
        return;
      }

      const playerName = Access.id(this.ctx.current).name;
      const message = ({
        roll: `⏱ ${playerName} was inactive for 30s, so the game rolled automatically.`,
        flee: `⏱ ${playerName} was inactive for 30s, so the game fled combat automatically.`,
        leave: `⏱ ${playerName} was inactive for 30s, so the game left the market automatically.`,
        endTurn: `⏱ ${playerName} was inactive for 30s, so the turn ended automatically.`,
      } as const)[action];

      this.ctx.log(message);
      this.machine.send(action);
    }, TURN_IDLE_TIMEOUT_MS);
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer !== null) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private getAutoActionForPhase(phase: string | null): 'roll' | 'flee' | 'leave' | 'endTurn' | null {
    switch (phase) {
      case S.Roll:
        return 'roll';
      case S.Combat:
        return 'flee';
      case S.Market:
        return 'leave';
      case S.CardPlay:
        return 'endTurn';
      default:
        return null;
    }
  }
}
