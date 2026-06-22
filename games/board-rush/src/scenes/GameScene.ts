import Phaser from 'phaser';
import { GameContext } from '../game/GameContext';
import { StateMachine } from '../core/fsm/StateMachine';
import { registerAllStates } from '../game/states/gameStates';
import { S } from '../game/states/stateNames';
import { BoardView } from './BoardView';
import { TokenView } from './TokenView';
import { DiceView } from './DiceView';
import { HUD } from './HUD';
import { musicManager } from '../music';
import { networkManager } from '../net/NetworkManager';
import { serialize } from '../net/GameSerializer';

export class GameScene extends Phaser.Scene {
  private ctx!:     GameContext;
  private machine!: StateMachine<GameContext>;
  private board!:   BoardView;
  private tokens!:  TokenView;
  private dice!:    DiceView;
  private hud!:     HUD;

  constructor() { super('Game'); }

  create(): void {
    this.add.image(640, 400, 'background').setAlpha(0.25).setDisplaySize(1280, 800);
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
    this.dice   = new DiceView(this, 400, 400);

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
    });

    bus.on('dice:rolled',   ({ d1, d2 }) => { this.dice.roll(d1, d2); broadcast(); });
    bus.on('player:moved',  ({ playerId, to }) => { this.tokens.moveTo(playerId, to); broadcast(); });
    bus.on('player:damaged', broadcast);
    bus.on('player:healed',  broadcast);
    bus.on('hud:refresh',    broadcast);
    bus.on('game:over',     () => { this.hud.render(); broadcast(); });

    bus.on('state:changed', ({ to }) => {
      broadcast();
      // "Play Again": destroy network and restart scene
      if (to === S.ClassSelect && this.ctx.players.length > 0) {
        nm.destroy();
        this.scene.restart();
      }
    });
  }
}
