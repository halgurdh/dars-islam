import type { GameContext } from '@src/game/GameContext';
import type { StateMachine } from '@src/core/fsm/StateMachine';
import { S } from '@src/game/states/stateNames';
import { Access, isAlive, effectiveAttack } from '@src/game/systems/PlayerFactory';
import { HeroClass, CLASS_DEFS } from '@src/game/data/classes';
import { suitSymbol, rankLabel, effectSummary } from '@src/game/data/cards';
import { playClick } from '@src/sfx';
import { networkManager } from '@src/net/NetworkManager';
import { reconstitute } from '@src/net/GameSerializer';
import type { GameSnap } from '@src/net/protocol';

type UIMode = 'landing' | 'local' | 'online' | 'net-pick';

export class HUD {
  private root:    HTMLDivElement;
  private ctx:     GameContext;
  private machine: StateMachine<GameContext>;
  private logLines: string[] = [];

  // Multiplayer state
  private _uiMode:    UIMode  = 'landing';
  private _lobbyCode          = '';
  private _netPicked          = false;

  constructor(parent: HTMLElement, ctx: GameContext, machine: StateMachine<GameContext>) {
    this.ctx     = ctx;
    this.machine = machine;
    this.root    = document.createElement('div');
    this.root.className = 'hud-root';
    parent.appendChild(this.root);
    this.injectStyles();
    this.subscribe();
  }

  private subscribe(): void {
    const bus = this.ctx.bus;
    bus.on('log',          ({ text }) => this.addLog(text));
    bus.on('hud:refresh',  () => this.render());
    bus.on('state:changed',() => this.render());
    bus.on('dice:rolled',  ({ d1, d2, total }) => this.addLog(`🎲 ${d1} + ${d2} = ${total}`));
    bus.on('game:over',    () => this.render());
  }

  setMachine(machine: StateMachine<GameContext>): void { this.machine = machine; }
  setContext(ctx: GameContext): void { this.ctx = ctx; this.subscribe(); }

  /** Called by GameScene when host clicks "Start" in the lobby. */
  startNetClassPick(): void {
    this._uiMode   = 'net-pick';
    this._netPicked = false;
    this.render();
  }

  /** Called by GameScene for every snapshot received (guest only). */
  applySnapshot(snap: GameSnap): void {
    this.ctx      = reconstitute(snap);
    this.logLines = [...snap.log];
    if (snap.phase === S.GameOver) { this.renderGameOver(); return; }
    this.renderGame(snap.phase);
  }

  // ── Router ────────────────────────────────────────────────────────────────

  render(): void {
    const phase = this.machine.currentName as string | null;

    // Active game phase: render game HUD (host-driven)
    if (phase && phase !== S.ClassSelect && phase !== S.GameOver) {
      this.renderGame(phase); return;
    }
    if (phase === S.GameOver) { this.renderGameOver(); return; }

    // Pre-game screens
    if (this._uiMode === 'local')    { this.renderClassSelect(); return; }
    if (this._uiMode === 'online')   { this.renderOnlineLobby(); return; }
    if (this._uiMode === 'net-pick') { this.renderNetClassPick(); return; }
    this.renderLanding();
  }

  // ── Landing ───────────────────────────────────────────────────────────────

  private renderLanding(): void {
    this.root.innerHTML = `
      <div class="overlay">
        <div class="panel center">
          <h1>⚔ BOARD RUSH ⚔</h1>
          <p class="sub">A fantasy board game adventure</p>
          <div class="actions col" style="margin-top:24px; gap:14px">
            <button id="btnLocal"  style="font-size:16px; padding:12px 28px">👥 Local Hotseat</button>
            <button id="btnOnline" style="font-size:16px; padding:12px 28px">🌐 Play Online</button>
          </div>
        </div>
      </div>`;

    (this.root.querySelector('#btnLocal') as HTMLButtonElement).onclick = () => {
      playClick();
      this._uiMode    = 'local';
      this.pending    = [];
      this.numPlayers = 2;
      this.render();
    };
    (this.root.querySelector('#btnOnline') as HTMLButtonElement).onclick = () => {
      playClick();
      this._uiMode = 'online';
      this.render();
    };
  }

  // ── Online lobby ──────────────────────────────────────────────────────────

  private renderOnlineLobby(): void {
    const nm = networkManager;

    // ── Hosting: show room code + player list ──
    if (nm.isHost) {
      const members  = nm.members;
      const canStart = members.length >= 2;
      this.root.innerHTML = `
        <div class="overlay"><div class="panel center">
          <h2>🏠 Room Ready</h2>
          <div class="room-code">${this._lobbyCode}</div>
          <p class="sub">Share this code with friends</p>
          <div class="player-list">
            ${members.map(m => `<div class="pcard">${m.isHost ? '👑' : '👤'} ${m.name}</div>`).join('')}
          </div>
          <div class="actions" style="margin-top:16px">
            <button id="startGame" ${canStart ? '' : 'disabled'}>▶ Start${!canStart ? ' (need ≥2)' : ''}</button>
            <button id="cancelRoom">✕ Cancel</button>
          </div>
        </div></div>`;

      (this.root.querySelector('#startGame') as HTMLButtonElement).onclick = () => {
        if (!canStart) return;
        playClick();
        nm.startClassPick();
      };
      (this.root.querySelector('#cancelRoom') as HTMLButtonElement).onclick = () => {
        playClick(); nm.destroy(); this.render();
      };
      return;
    }

    // ── Guest: waiting for host ──
    if (nm.isGuest) {
      const members = nm.members;
      this.root.innerHTML = `
        <div class="overlay"><div class="panel center">
          <h2>✓ Joined Room</h2>
          <p class="sub">Waiting for host to start…</p>
          <div class="player-list">
            ${members.map(m => `<div class="pcard">${m.isHost ? '👑' : '👤'} ${m.name}</div>`).join('')}
          </div>
        </div></div>`;
      return;
    }

    // ── Not connected: create / join form ──
    this.root.innerHTML = `
      <div class="overlay"><div class="panel center">
        <h2>🌐 Play Online</h2>
        <div class="row"><label>Your name:&nbsp;
          <input id="pname" value="${nm.myName}" maxlength="16" style="width:140px" />
        </label></div>
        <div class="actions col" style="margin-top:16px; gap:10px">
          <button id="createRoom" style="font-size:15px">🏠 Create Room</button>
          <div style="display:flex; gap:8px; align-items:center; justify-content:center">
            <input id="joinCode" placeholder="XXXXXX" maxlength="6"
              style="width:100px; text-transform:uppercase; letter-spacing:3px; font-size:16px;
                     background:#2a3a24; color:#eee; border:1px solid #4d6640; border-radius:4px; padding:6px 8px; text-align:center" />
            <button id="joinRoom">🔗 Join</button>
          </div>
        </div>
        <div id="netErr" style="color:#e54040; font-size:12px; margin-top:8px; min-height:16px"></div>
        <div class="actions" style="margin-top:16px">
          <button id="backBtn">← Back</button>
        </div>
      </div></div>`;

    const pname    = this.root.querySelector('#pname')    as HTMLInputElement;
    const joinCode = this.root.querySelector('#joinCode') as HTMLInputElement;
    const netErr   = this.root.querySelector('#netErr')   as HTMLElement;

    pname.onchange = () => nm.setName(pname.value);

    const setStatus = (msg: string, isError = false) => {
      netErr.style.color = isError ? '#e54040' : '#d9c060';
      netErr.textContent = msg;
    };
    const setBusy = (busy: boolean) => {
      (this.root.querySelector('#createRoom') as HTMLButtonElement).disabled = busy;
      (this.root.querySelector('#joinRoom')   as HTMLButtonElement).disabled = busy;
    };

    (this.root.querySelector('#createRoom') as HTMLButtonElement).onclick = async () => {
      playClick();
      nm.setName(pname.value);
      setBusy(true); setStatus('Creating room…');
      try {
        this._lobbyCode = await nm.createRoom();
        this.render();
      } catch (e) {
        setBusy(false); setStatus('Could not create room — try again.', true);
        console.error(e);
      }
    };

    (this.root.querySelector('#joinRoom') as HTMLButtonElement).onclick = async () => {
      playClick();
      nm.setName(pname.value);
      const code = joinCode.value.trim();
      if (code.length !== 6) { setStatus('Enter the 6-character code.', true); return; }
      setBusy(true); setStatus('Connecting…');
      try {
        await nm.joinRoom(code);
        this.render();
      } catch (e: unknown) {
        setBusy(false);
        setStatus((e instanceof Error ? e.message : null) ?? 'Could not connect — check the code.', true);
        console.error(e);
      }
    };

    (this.root.querySelector('#backBtn') as HTMLButtonElement).onclick = () => {
      playClick(); this._uiMode = 'landing'; this.render();
    };
  }

  // ── Net class pick ────────────────────────────────────────────────────────

  private renderNetClassPick(): void {
    const nm = networkManager;

    if (this._netPicked) {
      const members     = nm.members;
      const pickedCount = members.filter(m => m.cls).length;
      this.root.innerHTML = `
        <div class="overlay"><div class="panel center">
          <h2>✓ Class selected</h2>
          <p class="sub">Waiting for others… (${pickedCount}/${members.length})</p>
          <div class="player-list">
            ${members.map(m => `<div class="pcard">${m.cls ? '✓' : '⏳'} ${m.name}${m.cls ? ` — ${m.cls}` : ''}</div>`).join('')}
          </div>
        </div></div>`;
      return;
    }

    const classes = Object.values(HeroClass);
    this.root.innerHTML = `
      <div class="overlay"><div class="panel center">
        <h1>⚔ BOARD RUSH ⚔</h1>
        <p class="sub">${nm.myName}, pick your class:</p>
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
      </div></div>`;

    this.root.querySelectorAll('.classCard').forEach((btn) => {
      (btn as HTMLButtonElement).onclick = () => {
        playClick();
        this._netPicked = true;
        nm.sendClassPick((btn as HTMLElement).dataset.cls as HeroClass);
        this.render();
      };
    });
  }

  // ── Local class select ────────────────────────────────────────────────────

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
          <div class="actions" style="margin-top:14px">
            <button id="backToLanding">← Back</button>
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

    (this.root.querySelector('#backToLanding') as HTMLButtonElement).onclick = () => {
      playClick(); this._uiMode = 'landing'; this.render();
    };
  }

  private updatePicksLabel(): void {
    const picks = this.root.querySelector('#picks');
    if (picks) {
      picks.innerHTML = `<p class="sub">Player ${this.pending.length + 1} of ${this.numPlayers}, pick a class:` +
        (this.pending.length ? ` <em>(${this.pending.map((p) => p.cls).join(', ')} chosen)</em>` : '') + '</p>';
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private _isMyTurn(): boolean {
    if (!networkManager.isOnline) return true;
    return this.ctx.currentIndex === networkManager.myPlayerIndex();
  }

  private _sendAction(name: string, payload?: unknown): void {
    if (networkManager.isGuest) {
      networkManager.sendAction(name, payload);
    } else {
      this.machine.send(name, payload);
    }
  }

  // ── Main game HUD ─────────────────────────────────────────────────────────

  private renderGame(phase: string | null): void {
    const ctx = this.ctx;
    const cur = ctx.current;
    const myTurn = this._isMyTurn();

    const playerCards = ctx.players.map((p) => {
      const id = Access.id(p), hp = Access.hp(p), w = Access.wallet(p), st = Access.stats(p), stt = Access.status(p);
      const active = p === cur;
      const dead   = !isAlive(p);
      return `<div class="pcard ${active ? 'active' : ''} ${dead ? 'dead' : ''}" style="border-left-color:#${CLASS_DEFS[id.cls].color.toString(16)}">
        <div class="pname">${active ? '▶ ' : ''}${id.name} <span class="pcls">${id.cls}</span></div>
        <div class="pstat">❤ ${hp.hp}/${hp.maxHP} &nbsp; 🪙 ${w.gold} &nbsp; ⚔ ${effectiveAttack(p)} 🛡 ${st.defense}${stt.shield ? ` ✦${stt.shield}` : ''}</div>
        <div class="pstat dim">pos ${Access.pos(p).square} · cards ${Access.hand(p).cards.length}${stt.skipNextTurn ? ' · 💤skip' : ''}</div>
      </div>`;
    }).join('');

    const sq   = ctx.board[Access.pos(cur).square];
    const hand = Access.hand(cur).cards;
    const handHtml = hand.length
      ? hand.map((c, i) => {
          const red = c.suit === 'Hearts' || c.suit === 'Diamonds';
          return `<button class="card ${red ? 'red' : 'black'}" data-i="${i}" title="${effectSummary(c)} — ${c.flavor}">
            <span class="crank">${rankLabel(c.rank)}</span><span class="csuit">${suitSymbol(c.suit)}</span>
          </button>`;
        }).join('')
      : '<span class="dim">no cards</span>';

    const canRoll = phase === S.Roll     && myTurn;
    const canEnd  = phase === S.CardPlay && myTurn;
    const inCombat = phase === S.Combat;
    const inMarket = phase === S.Market;

    const turnLabel = networkManager.isOnline && !myTurn
      ? `<span class="dim" style="font-size:12px"> · waiting for ${Access.id(cur).name}…</span>`
      : '';

    this.root.innerHTML = `
      <div class="sidebar">
        <div class="round">Round ${ctx.round} — ${Access.id(cur).name}'s turn${turnLabel}</div>
        <div class="players">${playerCards}</div>
        <div class="square"><b>${sq.label}</b><br><span class="dim">${sq.description}</span></div>
        <div class="actions">
          <button id="roll" ${canRoll ? '' : 'disabled'}>🎲 Roll Dice</button>
          <button id="end"  ${canEnd  ? '' : 'disabled'}>⏩ End Turn</button>
        </div>
        <div class="log">${this.logLines.map((l) => `<div>${l}</div>`).join('')}</div>
      </div>
      <div class="handbar"><span class="handlabel">Hand:</span>${handHtml}</div>
      ${inCombat ? this.combatPanel(myTurn) : ''}
      ${inMarket ? this.marketPanel(myTurn) : ''}
    `;

    (this.root.querySelector('#roll') as HTMLButtonElement | null)
      ?.addEventListener('click', () => { playClick(); this._sendAction('roll'); });
    (this.root.querySelector('#end') as HTMLButtonElement | null)
      ?.addEventListener('click', () => { playClick(); this._sendAction('endTurn'); });

    this.root.querySelectorAll('.card').forEach((b) => {
      (b as HTMLButtonElement).onclick = () => {
        if (phase !== S.CardPlay || !myTurn) return;
        playClick();
        this._sendAction('playCard', parseInt((b as HTMLElement).dataset.i!));
      };
    });

    if (inCombat && myTurn) {
      (this.root.querySelector('#atk')  as HTMLButtonElement | null)
        ?.addEventListener('click', () => { playClick(); this._sendAction('attack'); });
      (this.root.querySelector('#flee') as HTMLButtonElement | null)
        ?.addEventListener('click', () => { playClick(); this._sendAction('flee'); });
    }
    if (inMarket && myTurn) {
      this.root.querySelectorAll('[data-buy]').forEach((b) =>
        ((b as HTMLButtonElement).onclick = () => { playClick(); this._sendAction('buy', (b as HTMLElement).dataset.buy); }));
      (this.root.querySelector('#leave') as HTMLButtonElement | null)
        ?.addEventListener('click', () => { playClick(); this._sendAction('leave'); });
    }
  }

  private combatPanel(myTurn: boolean): string {
    const c = this.ctx.combat;
    if (!c) return '';
    const p = this.ctx.current;
    const dis = myTurn ? '' : 'disabled';
    return `<div class="overlay"><div class="panel">
      <h2 style="color:#e54040">⚔ COMBAT</h2>
      <p><b>${c.enemyName}</b> — HP ${Math.max(0, c.enemyHP)} · ATK ${c.enemyAttack} · DEF ${c.enemyDefense}</p>
      <p>${Access.id(p).name}: HP ${Access.hp(p).hp}/${Access.hp(p).maxHP} · ATK ${effectiveAttack(p)}</p>
      <div class="actions">
        <button id="atk"  ${dis}>⚔ Attack</button>
        <button id="flee" ${dis}>🏃 Flee (-5 HP)</button>
      </div>
    </div></div>`;
  }

  private marketPanel(myTurn: boolean): string {
    const p   = this.ctx.current;
    const s   = Access.stats(p);
    const dis = myTurn ? '' : 'disabled';
    return `<div class="overlay"><div class="panel">
      <h2 style="color:#e0a020">⚙ MARKET</h2>
      <p>Gold: ${Access.wallet(p).gold}</p>
      <div class="actions col">
        <button data-buy="attack"  ${dis}>⚔ +2 Attack (${15 + s.attackUpgrades * 10}g)</button>
        <button data-buy="defense" ${dis}>🛡 +2 Defense (${15 + s.defenseUpgrades * 10}g)</button>
        <button data-buy="potion"  ${dis}>🧪 Heal +10 HP (10g)</button>
        <button id="leave"         ${dis}>Leave Market</button>
      </div>
    </div></div>`;
  }

  // ── Game over ─────────────────────────────────────────────────────────────

  private renderGameOver(): void {
    const id  = this.ctx.winnerId;
    const w   = id !== null ? this.ctx.players[id] : null;
    const def = w ? CLASS_DEFS[Access.id(w).cls] : null;
    const isGuest = networkManager.isGuest;
    this.root.innerHTML = `
      <div class="overlay"><div class="panel center">
        <h1 style="color:#${def ? def.color.toString(16) : 'f2cc1a'}">🏆 ${w ? Access.id(w).name : 'Someone'} Wins!</h1>
        ${w ? `<p class="sub">${Access.id(w).cls} · ${Access.wallet(w).gold} gold · ${Access.hp(w).hp} HP</p>` : ''}
        <div class="actions">
          <button id="again">${isGuest ? 'Leave Game' : 'Play Again'}</button>
        </div>
      </div></div>`;

    (this.root.querySelector('#again') as HTMLButtonElement).onclick = () => {
      playClick();
      if (isGuest) {
        networkManager.destroy();
        this._uiMode = 'landing';
        this.render();
      } else {
        this._sendAction('restart');
      }
    };
  }

  // ── Log ───────────────────────────────────────────────────────────────────

  private addLog(text: string): void {
    this.logLines.unshift(text);
    if (this.logLines.length > 40) this.logLines.pop();
    const log = this.root.querySelector('.log');
    if (log) log.innerHTML = this.logLines.map((l) => `<div>${l}</div>`).join('');
  }

  // ── Styles ────────────────────────────────────────────────────────────────

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
        padding:8px 12px; font-size:14px; cursor:pointer;
        transition:transform 0.1s ease, background 0.1s ease, box-shadow 0.1s ease; }
      .hud-root button:hover:not(:disabled) { background:#3a5030; transform:scale(1.06); box-shadow:0 2px 10px rgba(0,0,0,0.5); }
      .hud-root button:active:not(:disabled) { transform:scale(0.94); box-shadow:none; }
      .hud-root button:disabled { opacity:0.4; cursor:default; }
      .log { flex:1; overflow-y:auto; font-size:11.5px; line-height:1.5; background:rgba(0,0,0,0.3);
        border-radius:4px; padding:6px 8px; } .log div { border-bottom:1px solid rgba(255,255,255,0.05); padding:1px 0; }
      .handbar { position:absolute; left:0; bottom:0; width:62%; padding:8px 12px; box-sizing:border-box;
        background:rgba(8,12,8,0.82); display:flex; align-items:center; gap:6px; flex-wrap:wrap; min-height:64px; }
      .handlabel { color:#d9c060; font-size:13px; }
      .card { width:46px; height:58px; border-radius:6px; background:#fff; border:2px solid #ccc;
        display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;
        transition:transform 0.1s ease, box-shadow 0.1s ease; }
      .card.red { color:#c0392b; } .card.black { color:#222; }
      .card:hover { transform:translateY(-8px) scale(1.08); box-shadow:0 6px 14px rgba(0,0,0,0.4); }
      .card:active { transform:translateY(-2px) scale(0.96); box-shadow:0 2px 4px rgba(0,0,0,0.3); }
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
        background:#1c241a !important; padding:12px !important;
        transition:transform 0.12s ease, box-shadow 0.12s ease !important; }
      .classCard:hover { transform:scale(1.04) !important; box-shadow:0 4px 14px rgba(0,0,0,0.55) !important; }
      .classCard:active { transform:scale(0.96) !important; box-shadow:none !important; }
      .cname { font-size:18px; font-weight:bold; } .cstat { font-size:12px; opacity:0.85; }
      .cdesc { font-size:11.5px; opacity:0.7; }
      select { background:#2a3a24; color:#eee; border:1px solid #4d6640; border-radius:4px; padding:3px 6px; }
      input  { background:#2a3a24; color:#eee; border:1px solid #4d6640; border-radius:4px; padding:4px 7px; }
      .room-code { font-size:42px; font-weight:bold; letter-spacing:8px; color:#f2cc1a;
        background:rgba(242,204,26,0.08); border:2px solid #f2cc1a44; border-radius:8px;
        padding:10px 20px; margin:10px auto; display:inline-block; }
      .player-list { display:flex; flex-direction:column; gap:6px; margin:10px 0; min-width:200px; }
    `;
    document.head.appendChild(s);
  }
}
