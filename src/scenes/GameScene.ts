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

/**
 * The Phaser scene. Owns the GameContext + StateMachine (logic) and the
 * view objects (board, tokens, dice) + HUD (DOM). It subscribes to the
 * event bus to drive animations, and inserts a "Moving" animation gate
 * between Roll and SquareEffect so token movement is visible.
 */
export class GameScene extends Phaser.Scene {
  private ctx!: GameContext;
  private machine!: StateMachine<GameContext>;
  private board!: BoardView;
  private tokens!: TokenView;
  private dice!: DiceView;
  private hud!: HUD;

  constructor() {
    super('Game');
  }

  create(): void {
    this.add.image(640, 400, 'background').setAlpha(0.25).setDisplaySize(1280, 800);
    this.startNewGame();
  }

  private startNewGame(): void {
    this.ctx = new GameContext();
    this.machine = new StateMachine<GameContext>(this.ctx);
    registerAllStates(this.machine);

    this.machine.onTransition = (from, to) => {
      this.ctx.bus.emit('state:changed', { from, to });
    };

    // Board is created once players exist; build a placeholder board now.
    this.board = new BoardView(this, this.ctx.board);
    this.tokens = new TokenView(this, this.board.centres);
    this.dice = new DiceView(this, 400, 400);

    const parent = document.getElementById('game') ?? document.body;
    this.hud = new HUD(parent as HTMLElement, this.ctx, this.machine);

    musicManager.bindBus(this.ctx.bus, () => this.ctx);

    this.wireEvents();

    this.machine.start(S.ClassSelect);
    this.hud.render();
  }

  private wireEvents(): void {
    const bus = this.ctx.bus;

    // Spawn tokens once the game initialises (first turn starts).
    let spawned = false;
    bus.on('turn:started', () => {
      if (!spawned) {
        this.tokens.spawn(this.ctx.players);
        spawned = true;
      }
      this.hud.render();
    });

    bus.on('dice:rolled', ({ d1, d2 }) => this.dice.roll(d1, d2));

    bus.on('player:moved', ({ playerId, to }) => {
      this.tokens.moveTo(playerId, to);
    });

    bus.on('game:over', () => this.hud.render());

    // Handle restart (GameOver → ClassSelect) by rebuilding everything.
    bus.on('state:changed', ({ to }) => {
      if (to === S.ClassSelect && this.ctx.players.length > 0) {
        // Player pressed "Play Again": rebuild fresh scene state.
        this.scene.restart();
      }
    });
  }
}
