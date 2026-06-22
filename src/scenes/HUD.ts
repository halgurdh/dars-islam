import type { GameContext } from '../game/GameContext';
import type { StateMachine } from '../core/fsm/StateMachine';
import { S } from '../game/states/stateNames';
import { Access, isAlive, effectiveAttack } from '../game/systems/PlayerFactory';
import { HeroClass, CLASS_DEFS } from '../game/data/classes';
import { suitSymbol, rankLabel, effectSummary } from '../game/data/cards';
import { playClick } from '../sfx';

/**
 * HTML/CSS overlay HUD. Phaser renders the board; the DOM renders crisp
 * text, buttons and the card hand. Communicates with the FSM purely via
 * machine.send(); reads state from GameContext for display.
 */
export class HUD {
  private root: HTMLDivElement;
  private ctx: GameContext;
  private machine: StateMachine<GameContext>;
  private logLines: string[] = [];

  constructor(parent: HTMLElement, ctx: GameContext, machine: StateMachine<GameContext>) {
    this.ctx = ctx;
    this.machine = machine;
    this.root = document.createElement('div');
    this.root.className = 'hud-root';
    parent.appendChild(this.root);
    this.injectStyles();
    this.subscribe();
  }

  private subscribe(): void {
    const bus = this.ctx.bus;
    bus.on('log', ({ text }) => this.addLog(text));
    bus.on('hud:refresh', () => this.render());
    bus.on('state:changed', () => this.render());
    bus.on('dice:rolled', ({ d1, d2, total }) => this.addLog(`🎲 ${d1} + ${d2} = ${total}`));
    bus.on('game:over', () => this.render());
  }

  // ── public ──
  setMachine(machine: StateMachine<GameContext>): void {
    this.machine = machine;
  }
  setContext(ctx: GameContext): void {
    this.ctx = ctx;
    this.subscribe();
  }

  render(): void {
    const phase = this.machine.currentName as string | null;
    if (phase === S.ClassSelect) { this.renderClassSelect(); return; }
    if (phase === S.GameOver) { this.renderGameOver(); return; }
    this.renderGame(phase);
  }

  // ── Class select ──
  private pending: { name: string; cls: HeroClass }[] = [];
  private numPlayers = 2;

  private renderClassSelect(): void {
    this.pending = [];
    const classes = Object.values(HeroClass);
    this.root.innerHTML = `
      <div class="overlay">
        <div class="panel center">
          <h1>⚔ BOARD RUSH ⚔</h1>
          <p class="sub">Choose classes for each player</p>
          <div class="row">
            <label>Players:
              <select id="numPlayers">
                <option value="2">2</option><option value="3">3</option><option value="4">4</option>
              </select>
            </label>
          </div>
          <div id="picks"></div>
          <div class="classGrid">
            ${classes.map((c) => {
              const d = CLASS_DEFS[c];
              return `<button class="classCard" data-cls="${c}" style="border-color:#${d.color.toString(16)}">
                <span class="cname" style="color:#${d.color.toString(16)}">${c}</span>
                <span class="cstat">HP ${d.maxHP} · ATK ${d.attack} · DEF ${d.defense} · MAG ${d.magic}</span>
                <span class="cdesc">${d.description}</span>
              </button>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    const numSel = this.root.querySelector('#numPlayers') as HTMLSelectElement;
    numSel.value = String(this.numPlayers);
    numSel.onchange = () => { playClick(); this.numPlayers = parseInt(numSel.value); this.updatePicksLabel(); };
    this.updatePicksLabel();

    this.root.querySelectorAll('.classCard').forEach((btn) => {
      (btn as HTMLButtonElement).onclick = () => {
        playClick();
        const cls = (btn as HTMLElement).dataset.cls as HeroClass;
        this.pending.push({ name: `Player ${this.pending.length + 1}`, cls });
        if (this.pending.length >= this.numPlayers) {
          this.machine.send('players:chosen', this.pending);
        } else {
          this.updatePicksLabel();
        }
      };
    });
  }

  private updatePicksLabel(): void {
    const picks = this.root.querySelector('#picks');
    if (picks) {
      picks.innerHTML = `<p class="sub">Player ${this.pending.length + 1} of ${this.numPlayers}, pick a class:` +
        (this.pending.length ? ` <em>(${this.pending.map((p) => p.cls).join(', ')} chosen)</em>` : '') + '</p>';
    }
  }

  // ── Main game HUD ──
  private renderGame(phase: string | null): void {
    const ctx = this.ctx;
    const cur = ctx.current;
    const playerCards = ctx.players.map((p) => {
      const id = Access.id(p), hp = Access.hp(p), w = Access.wallet(p), st = Access.stats(p), stt = Access.status(p);
      const active = p === cur;
      const dead = !isAlive(p);
      return `<div class="pcard ${active ? 'active' : ''} ${dead ? 'dead' : ''}" style="border-left-color:#${CLASS_DEFS[id.cls].color.toString(16)}">
        <div class="pname">${active ? '▶ ' : ''}${id.name} <span class="pcls">${id.cls}</span></div>
        <div class="pstat">❤ ${hp.hp}/${hp.maxHP} &nbsp; 🪙 ${w.gold} &nbsp; ⚔ ${effectiveAttack(p)} 🛡 ${st.defense}${stt.shield ? ` ✦${stt.shield}` : ''}</div>
        <div class="pstat dim">pos ${Access.pos(p).square} · cards ${Access.hand(p).cards.length}${stt.skipNextTurn ? ' · 💤skip' : ''}</div>
      </div>`;
    }).join('');

    const sq = ctx.board[Access.pos(cur).square];
    const hand = Access.hand(cur).cards;
    const handHtml = hand.length
      ? hand.map((c, i) => {
          const red = c.suit === 'Hearts' || c.suit === 'Diamonds';
          return `<button class="card ${red ? 'red' : 'black'}" data-i="${i}" title="${effectSummary(c)} — ${c.flavor}">
            <span class="crank">${rankLabel(c.rank)}</span><span class="csuit">${suitSymbol(c.suit)}</span>
          </button>`;
        }).join('')
      : '<span class="dim">no cards</span>';

    const canRoll = phase === S.Roll;
    const canEnd = phase === S.CardPlay;
    const inCombat = phase === S.Combat;
    const inMarket = phase === S.Market;

    this.root.innerHTML = `
      <div class="sidebar">
        <div class="round">Round ${ctx.round} — ${Access.id(cur).name}'s turn</div>
        <div class="players">${playerCards}</div>
        <div class="square"><b>${sq.label}</b><br><span class="dim">${sq.description}</span></div>
        <div class="actions">
          <button id="roll" ${canRoll ? '' : 'disabled'}>🎲 Roll Dice</button>
          <button id="end" ${canEnd ? '' : 'disabled'}>⏩ End Turn</button>
        </div>
        <div class="log">${this.logLines.map((l) => `<div>${l}</div>`).join('')}</div>
      </div>
      <div class="handbar"><span class="handlabel">Hand:</span>${handHtml}</div>
      ${inCombat ? this.combatPanel() : ''}
      ${inMarket ? this.marketPanel() : ''}
    `;

    const roll = this.root.querySelector('#roll') as HTMLButtonElement | null;
    if (roll) roll.onclick = () => { playClick(); this.machine.send('roll'); };
    const end = this.root.querySelector('#end') as HTMLButtonElement | null;
    if (end) end.onclick = () => { playClick(); this.machine.send('endTurn'); };

    this.root.querySelectorAll('.card').forEach((b) => {
      (b as HTMLButtonElement).onclick = () => {
        if (phase !== S.CardPlay) return;
        playClick();
        this.machine.send('playCard', parseInt((b as HTMLElement).dataset.i!));
      };
    });

    if (inCombat) {
      (this.root.querySelector('#atk') as HTMLButtonElement).onclick = () => { playClick(); this.machine.send('attack'); };
      (this.root.querySelector('#flee') as HTMLButtonElement).onclick = () => { playClick(); this.machine.send('flee'); };
    }
    if (inMarket) {
      this.root.querySelectorAll('[data-buy]').forEach((b) =>
        ((b as HTMLButtonElement).onclick = () => { playClick(); this.machine.send('buy', (b as HTMLElement).dataset.buy); }));
      (this.root.querySelector('#leave') as HTMLButtonElement).onclick = () => { playClick(); this.machine.send('leave'); };
    }
  }

  private combatPanel(): string {
    const c = this.ctx.combat;
    if (!c) return '';
    const p = this.ctx.current;
    return `<div class="overlay"><div class="panel">
      <h2 style="color:#e54040">⚔ COMBAT</h2>
      <p><b>${c.enemyName}</b> — HP ${Math.max(0, c.enemyHP)} · ATK ${c.enemyAttack} · DEF ${c.enemyDefense}</p>
      <p>${Access.id(p).name}: HP ${Access.hp(p).hp}/${Access.hp(p).maxHP} · ATK ${effectiveAttack(p)}</p>
      <div class="actions">
        <button id="atk">⚔ Attack</button>
        <button id="flee">🏃 Flee (-5 HP)</button>
      </div>
    </div></div>`;
  }

  private marketPanel(): string {
    const p = this.ctx.current;
    const s = Access.stats(p);
    return `<div class="overlay"><div class="panel">
      <h2 style="color:#e0a020">⚙ MARKET</h2>
      <p>Gold: ${Access.wallet(p).gold}</p>
      <div class="actions col">
        <button data-buy="attack">⚔ +2 Attack (${15 + s.attackUpgrades * 10}g)</button>
        <button data-buy="defense">🛡 +2 Defense (${15 + s.defenseUpgrades * 10}g)</button>
        <button data-buy="potion">🧪 Heal +10 HP (10g)</button>
        <button id="leave">Leave Market</button>
      </div>
    </div></div>`;
  }

  private renderGameOver(): void {
    const id = this.ctx.winnerId;
    const w = id !== null ? this.ctx.players[id] : null;
    const def = w ? CLASS_DEFS[Access.id(w).cls] : null;
    this.root.innerHTML = `
      <div class="overlay"><div class="panel center">
        <h1 style="color:#${def ? def.color.toString(16) : 'f2cc1a'}">🏆 ${w ? Access.id(w).name : 'Someone'} Wins!</h1>
        ${w ? `<p class="sub">${Access.id(w).cls} · ${Access.wallet(w).gold} gold · ${Access.hp(w).hp} HP</p>` : ''}
        <div class="actions"><button id="again">Play Again</button></div>
      </div></div>`;
    (this.root.querySelector('#again') as HTMLButtonElement).onclick = () => { playClick(); this.machine.send('restart'); };
  }

  private addLog(text: string): void {
    this.logLines.unshift(text);
    if (this.logLines.length > 40) this.logLines.pop();
    const log = this.root.querySelector('.log');
    if (log) log.innerHTML = this.logLines.map((l) => `<div>${l}</div>`).join('');
  }

  private injectStyles(): void {
    if (document.getElementById('hud-styles')) return;
    const s = document.createElement('style');
    s.id = 'hud-styles';
    s.textContent = `
      .hud-root { position:absolute; inset:0; pointer-events:none; font-family:'Segoe UI',system-ui,sans-serif; color:#eee; }
      .hud-root button, .hud-root select, .hud-root .card { pointer-events:auto; }
      .sidebar { position:absolute; right:0; top:0; width:38%; max-width:490px; height:100%; padding:10px 14px;
        box-sizing:border-box; background:rgba(8,12,8,0.82); display:flex; flex-direction:column; gap:8px; }
      .round { font-size:17px; font-weight:bold; color:#f2cc1a; }
      .players { display:flex; flex-direction:column; gap:5px; }
      .pcard { background:rgba(255,255,255,0.04); border-left:4px solid #888; border-radius:4px; padding:5px 8px; }
      .pcard.active { background:rgba(242,204,26,0.10); }
      .pcard.dead { opacity:0.4; text-decoration:line-through; }
      .pname { font-size:13px; font-weight:600; } .pcls { font-size:11px; opacity:0.7; }
      .pstat { font-size:12px; } .pstat.dim, .dim { opacity:0.6; }
      .square { background:rgba(255,255,255,0.05); border-radius:4px; padding:6px 9px; font-size:13px; }
      .actions { display:flex; gap:8px; } .actions.col { flex-direction:column; }
      .hud-root button { background:#2a3a24; color:#eee; border:1px solid #4d6640; border-radius:5px;
        padding:8px 12px; font-size:14px; cursor:pointer; }
      .hud-root button:hover:not(:disabled) { background:#3a5030; }
      .hud-root button:disabled { opacity:0.4; cursor:default; }
      .log { flex:1; overflow-y:auto; font-size:11.5px; line-height:1.5; background:rgba(0,0,0,0.3);
        border-radius:4px; padding:6px 8px; } .log div { border-bottom:1px solid rgba(255,255,255,0.05); padding:1px 0; }
      .handbar { position:absolute; left:0; bottom:0; width:62%; padding:8px 12px; box-sizing:border-box;
        background:rgba(8,12,8,0.82); display:flex; align-items:center; gap:6px; flex-wrap:wrap; min-height:64px; }
      .handlabel { color:#d9c060; font-size:13px; }
      .card { width:46px; height:58px; border-radius:6px; background:#fff; border:2px solid #ccc;
        display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; }
      .card.red { color:#c0392b; } .card.black { color:#222; }
      .card:hover { transform:translateY(-6px); transition:transform .1s; }
      .crank { font-size:16px; font-weight:bold; } .csuit { font-size:18px; }
      .overlay { position:absolute; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center;
        justify-content:center; pointer-events:auto; }
      .panel { background:#141a12; border:2px solid #4d6640; border-radius:10px; padding:24px 30px;
        max-width:640px; box-shadow:0 8px 40px rgba(0,0,0,0.6); }
      .panel.center { text-align:center; }
      .panel h1 { margin:0 0 6px; font-size:32px; color:#f2cc1a; } .panel h2 { margin:0 0 10px; }
      .sub { opacity:0.8; margin:4px 0 14px; }
      .row { margin:10px 0; } .row label { font-size:14px; }
      .classGrid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:14px; }
      .classCard { display:flex; flex-direction:column; gap:4px; text-align:left; border:2px solid #555 !important;
        background:#1c241a !important; padding:12px !important; }
      .cname { font-size:18px; font-weight:bold; } .cstat { font-size:12px; opacity:0.85; }
      .cdesc { font-size:11.5px; opacity:0.7; }
      select { background:#2a3a24; color:#eee; border:1px solid #4d6640; border-radius:4px; padding:3px 6px; }
    `;
    document.head.appendChild(s);
  }
}
