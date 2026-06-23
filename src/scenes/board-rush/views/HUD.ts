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
  private busUnsubs: (() => void)[] = [];
  private parent: HTMLElement;
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;
  private windowResizeHandler: () => void;
  private visualViewportHandler: (() => void) | null = null;

  // Multiplayer state
  private _uiMode:    UIMode  = 'landing';
  private _lobbyCode          = '';
  private _netPicked          = false;

  constructor(parent: HTMLElement, ctx: GameContext, machine: StateMachine<GameContext>) {
    this.parent  = parent;
    this.ctx     = ctx;
    this.machine = machine;
    this.root    = document.createElement('div');
    this.root.className = 'hud-root';
    this.windowResizeHandler = () => this.syncLayout();
    const parentPosition = window.getComputedStyle(parent).position;
    if (parentPosition === 'static') {
      parent.style.position = 'relative';
    }
    parent.appendChild(this.root);
    this.injectStyles();
    this.subscribe();
    this.bindLayoutTracking();
  }

  private subscribe(): void {
    this.busUnsubs.forEach((unsub) => unsub());
    this.busUnsubs = [];

    const bus = this.ctx.bus;
    this.busUnsubs = [
      bus.on('log',          ({ text }) => this.addLog(text)),
      bus.on('hud:refresh',  () => this.render()),
      bus.on('state:changed',() => this.render()),
      bus.on('dice:rolled',  ({ d1, d2, total }) => this.addLog(`🎲 ${d1} + ${d2} = ${total}`)),
      bus.on('game:over',    () => this.render()),
    ];
  }

  setMachine(machine: StateMachine<GameContext>): void { this.machine = machine; }
  setContext(ctx: GameContext): void { this.ctx = ctx; this.subscribe(); }

  destroy(): void {
    this.busUnsubs.forEach((unsub) => unsub());
    this.busUnsubs = [];
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    window.removeEventListener('resize', this.windowResizeHandler);
    if (this.visualViewportHandler) {
      window.visualViewport?.removeEventListener('resize', this.visualViewportHandler);
      window.visualViewport?.removeEventListener('scroll', this.visualViewportHandler);
      this.visualViewportHandler = null;
    }
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.root.remove();
  }

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
    const gold = Access.wallet(p).gold;
    const attackCost = 15 + s.attackUpgrades * 10;
    const defenseCost = 15 + s.defenseUpgrades * 10;
    const potionCost = 10;
    const dis = myTurn ? '' : 'disabled';
    const attackDisabled = !myTurn || gold < attackCost ? 'disabled' : '';
    const defenseDisabled = !myTurn || gold < defenseCost ? 'disabled' : '';
    const potionDisabled = !myTurn || gold < potionCost ? 'disabled' : '';
    return `<div class="overlay"><div class="panel">
      <h2 style="color:#e0a020">⚙ MARKET</h2>
      <p>Gold: ${gold}</p>
      <div class="actions col">
        <button data-buy="attack"  ${attackDisabled}>⚔ +2 Attack (${attackCost}g)</button>
        <button data-buy="defense" ${defenseDisabled}>🛡 +2 Defense (${defenseCost}g)</button>
        <button data-buy="potion"  ${potionDisabled}>🧪 Heal +10 HP (${potionCost}g)</button>
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

  private bindLayoutTracking(): void {
    const syncSoon = () => {
      if (this.rafId !== null) {
        window.cancelAnimationFrame(this.rafId);
      }
      this.rafId = window.requestAnimationFrame(() => {
        this.rafId = null;
        this.syncLayout();
      });
    };

    window.addEventListener('resize', this.windowResizeHandler);
    if (window.visualViewport) {
      this.visualViewportHandler = () => syncSoon();
      window.visualViewport.addEventListener('resize', this.visualViewportHandler);
      window.visualViewport.addEventListener('scroll', this.visualViewportHandler);
    }
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => syncSoon());
      this.resizeObserver.observe(this.parent);
      const canvas = this.parent.querySelector('canvas');
      if (canvas) this.resizeObserver.observe(canvas);
    }

    syncSoon();
  }

  private syncLayout(): void {
    const target = this.parent.querySelector('canvas') ?? this.parent;
    const parentRect = this.parent.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const width = Math.round(targetRect.width || parentRect.width);
    const height = Math.round(targetRect.height || parentRect.height);
    const viewportScale = window.visualViewport?.scale ?? 1;
    const effectiveWidth = width * viewportScale;
    const effectiveHeight = height * viewportScale;
    const shortEdge = Math.min(effectiveWidth, effectiveHeight);
    const left = Math.round(targetRect.left - parentRect.left);
    const top = Math.round(targetRect.top - parentRect.top);
    const scale = Math.max(0.55, Math.min(1.35, Math.min(width / 1280, height / 720)));
    const aspect = height > 0 ? width / height : 16 / 9;
    const layout =
      effectiveWidth <= 420 || effectiveHeight <= 340 ? 'xs' :
      effectiveWidth <= 720 || effectiveHeight <= 560 ? 'sm' :
      effectiveWidth <= 980 ? 'md' : 'lg';
    const aspectMode =
      aspect >= 1.7 ? 'wide' :
      aspect >= 1.15 ? 'landscape' :
      aspect > 0.85 ? 'square' : 'portrait';
    const deviceMode =
      shortEdge <= 430 ? 'phone' :
      shortEdge <= 820 ? 'tablet' : 'desktop';

    this.root.style.left = '0px';
    this.root.style.top = '0px';
    this.root.style.width = '1280px';
    this.root.style.height = '720px';
    this.root.style.transformOrigin = 'top left';
    this.root.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
    this.root.style.setProperty('--hud-scale', scale.toFixed(3));
    this.root.style.setProperty('--hud-aspect', aspect.toFixed(3));
    this.root.style.setProperty('--hud-short-edge', `${shortEdge}px`);
    this.root.style.setProperty('--hud-effective-width', `${Math.round(effectiveWidth)}px`);
    this.root.style.setProperty('--hud-effective-height', `${Math.round(effectiveHeight)}px`);
    this.root.dataset.layout = layout;
    this.root.dataset.orientation = width >= height ? 'landscape' : 'portrait';
    this.root.dataset.aspectMode = aspectMode;
    this.root.dataset.device = deviceMode;
  }

  // ── Styles ────────────────────────────────────────────────────────────────

  private injectStyles(): void {
    if (document.getElementById('hud-styles')) return;
    const s = document.createElement('style');
    s.id = 'hud-styles';
    s.textContent = `
      .hud-root { position:absolute; pointer-events:none; font-family:'Segoe UI',system-ui,sans-serif; color:var(--text-primary);
        --hud-scale: 1;
        --hud-gap: clamp(6px, calc(10px * var(--hud-scale)), 12px);
        --hud-sidebar-width: clamp(220px, calc(420px * var(--hud-scale)), 520px);
        --hud-hand-width: calc(100% - var(--hud-sidebar-width));
        --hud-panel-width: min(92%, 700px);
        --hud-card-width: clamp(34px, calc(44px * var(--hud-scale)), 52px);
        --hud-card-height: clamp(46px, calc(58px * var(--hud-scale)), 64px);
        --hud-button-font: clamp(12px, calc(14px * var(--hud-scale)), 15px);
        --hud-text-sm: clamp(10px, calc(12px * var(--hud-scale)), 13px);
        --hud-text-md: clamp(11px, calc(13px * var(--hud-scale)), 14px);
        --hud-text-lg: clamp(14px, calc(18px * var(--hud-scale)), 20px);
      }
      .hud-root button, .hud-root select, .hud-root .card { pointer-events:auto; }
      .sidebar { position:absolute; right:0; top:0; width:var(--hud-sidebar-width); height:100%; padding:12px 14px calc(12px + var(--safe-bottom, 0px));
        box-sizing:border-box; background:var(--surface); display:flex; flex-direction:column; gap:var(--hud-gap); border-left:1px solid var(--border-color);
        backdrop-filter: blur(8px); }
      .round { font-size:var(--hud-text-lg); font-weight:bold; color:var(--accent); line-height:1.25; }
      .players { display:flex; flex-direction:column; gap:6px; }
      .pcard { background:var(--surface-muted); border-left:4px solid var(--text-secondary); border-radius:4px; padding:5px 8px; }
      .pcard.active { background:var(--surface-strong); border-left-color:var(--accent); }
      .pcard.dead { opacity:0.4; text-decoration:line-through; }
      .pname { font-size:var(--hud-text-md); font-weight:600; } .pcls { font-size:var(--hud-text-sm); opacity:0.7; }
      .pstat { font-size:var(--hud-text-sm); line-height:1.35; }
      .pstat.dim, .dim { opacity:0.6; }
      [data-theme="light"] .sidebar { background: rgba(255,255,255,0.92); color: var(--text-primary); }
      .square { background:var(--surface-muted); border-radius:4px; padding:8px 10px; font-size:var(--hud-text-md); line-height:1.35; }
      .actions { display:flex; gap:8px; flex-wrap:wrap; } .actions.col { flex-direction:column; }
      .hud-root button { background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border-color); border-radius:5px;
        padding:10px 12px; font-size:var(--hud-button-font); cursor:pointer; min-height:44px;
        transition:transform 0.1s ease, background 0.1s ease, box-shadow 0.1s ease; }
      @media (hover: hover) and (pointer: fine) {
        .hud-root button:hover:not(:disabled) { background:var(--accent-light); transform:scale(1.06); box-shadow:0 2px 10px rgba(0,0,0,0.15); }
        .card:hover { transform:translateY(-8px) scale(1.08); box-shadow:0 6px 14px rgba(0,0,0,0.15); }
        .classCard:hover { transform:scale(1.04) !important; box-shadow:0 4px 14px rgba(0,0,0,0.12) !important; }
      }
      .hud-root button:active:not(:disabled) { transform:scale(0.94); box-shadow:none; }
      .hud-root button:disabled { opacity:0.4; cursor:default; }
      .log { flex:1; overflow-y:auto; font-size:var(--hud-text-sm); line-height:1.5; background:var(--surface-muted);
        border-radius:4px; padding:6px 8px; } .log div { border-bottom:1px solid var(--border-color); padding:1px 0; }
      .handbar { position:absolute; left:0; bottom:0; width:var(--hud-hand-width); padding:8px 12px calc(8px + var(--safe-bottom, 0px)); box-sizing:border-box;
        background:var(--surface); display:flex; align-items:center; align-content:flex-start; gap:6px; flex-wrap:wrap; min-height:64px; border-top:1px solid var(--border-color);
        backdrop-filter: blur(8px); }
      .handlabel { color:var(--text-secondary); font-size:var(--hud-text-md); }
      .card { width:var(--hud-card-width); height:var(--hud-card-height); border-radius:6px; background:var(--bg-primary); border:2px solid var(--border-color);
        display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;
        transition:transform 0.1s ease, box-shadow 0.1s ease; color:var(--text-primary); }
      .card.red { color:#c0392b; } .card.black { color:#222; }
      .card:active { transform:translateY(-2px) scale(0.96); box-shadow:0 2px 4px rgba(0,0,0,0.1); }
      .crank { font-size:clamp(14px, 1.4vw, 17px); font-weight:bold; } .csuit { font-size:clamp(16px, 1.6vw, 19px); }
      .overlay { position:absolute; inset:0; background:var(--surface-overlay); display:flex; align-items:center;
        justify-content:center; pointer-events:auto; padding:16px max(16px, var(--safe-right, 0px)) max(16px, var(--safe-bottom, 0px)) max(16px, var(--safe-left, 0px)); }
      .panel { background:var(--bg-secondary); border:2px solid var(--border-color); border-radius:10px; padding:24px 30px;
        width:var(--hud-panel-width); max-width:var(--hud-panel-width); max-height:calc(100% - 32px - var(--safe-top, 0px) - var(--safe-bottom, 0px));
        overflow:auto; box-shadow:0 8px 40px rgba(0,0,0,0.15); color:var(--text-primary); }
      .panel.center { text-align:center; }
      .panel h1 { margin:0 0 6px; font-size:clamp(26px, 3vw, 34px); color:var(--accent); } .panel h2 { margin:0 0 10px; font-size:clamp(21px, 2.2vw, 28px); }
      .sub { opacity:0.8; margin:4px 0 14px; color:var(--text-secondary); }
      .row { margin:10px 0; } .row label { font-size:var(--hud-text-md); }
      .classGrid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px; margin-top:14px; }
      .classCard { display:flex; flex-direction:column; gap:4px; text-align:left; border:2px solid var(--border-color) !important;
        background:var(--bg-secondary) !important; padding:12px !important;
        transition:transform 0.12s ease, box-shadow 0.12s ease !important; color:var(--text-primary); }
      .classCard:active { transform:scale(0.96) !important; box-shadow:none !important; }
      .cname { font-size:clamp(17px, 1.5vw, 20px); font-weight:bold; } .cstat { font-size:var(--hud-text-sm); opacity:0.85; }
      .cdesc { font-size:var(--hud-text-sm); opacity:0.7; color:var(--text-secondary); line-height:1.35; }
      select { background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border-color); border-radius:4px; padding:6px 8px; min-height:40px; }
      input  { background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border-color); border-radius:4px; padding:8px 10px; min-height:40px; max-width:100%; }
      .room-code { font-size:clamp(28px, 5vw, 42px); font-weight:bold; letter-spacing:clamp(4px, 1vw, 8px); color:var(--accent);
        background:rgba(255, 107, 53, 0.12); border:2px solid rgba(255, 107, 53, 0.27); border-radius:8px;
        padding:10px 20px; margin:10px auto; display:inline-block; }
      .player-list { display:flex; flex-direction:column; gap:6px; margin:10px 0; min-width:min(200px, 100%); }

      .hud-root[data-layout="lg"] {
        --hud-panel-width: min(84vw, 760px);
      }

      .hud-root[data-layout="md"] {
        --hud-sidebar-width: min(38%, 360px);
      }

      .hud-root[data-layout="sm"],
      .hud-root[data-layout="xs"] {
        --hud-sidebar-width: 100%;
        --hud-hand-width: 100%;
      }

      .hud-root[data-layout="sm"] .sidebar,
      .hud-root[data-layout="xs"] .sidebar {
        width:100%;
        height:auto;
        max-height:46%;
        left:0;
        right:0;
        top:0;
        border-left:none;
        border-bottom:1px solid var(--border-color);
      }

      .hud-root[data-layout="sm"] .log,
      .hud-root[data-layout="xs"] .log {
        min-height:72px;
      }

      .hud-root[data-layout="sm"] .handbar,
      .hud-root[data-layout="xs"] .handbar {
        width:100%;
      }

      .hud-root[data-aspect-mode="landscape"][data-layout="sm"],
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"],
      .hud-root[data-aspect-mode="wide"][data-layout="sm"],
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] {
        --hud-sidebar-width: clamp(220px, calc(420px * var(--hud-scale)), 360px);
        --hud-hand-width: calc(100% - var(--hud-sidebar-width));
      }

      .hud-root[data-aspect-mode="landscape"][data-layout="sm"] .sidebar,
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"] .sidebar,
      .hud-root[data-aspect-mode="wide"][data-layout="sm"] .sidebar,
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] .sidebar {
        width:var(--hud-sidebar-width);
        height:100%;
        max-height:none;
        left:auto;
        right:0;
        top:0;
        border-left:1px solid var(--border-color);
        border-bottom:none;
      }

      .hud-root[data-aspect-mode="landscape"][data-layout="sm"] .handbar,
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"] .handbar,
      .hud-root[data-aspect-mode="wide"][data-layout="sm"] .handbar,
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] .handbar {
        width:var(--hud-hand-width);
      }

      .hud-root[data-aspect-mode="portrait"][data-layout="sm"] .sidebar,
      .hud-root[data-aspect-mode="portrait"][data-layout="xs"] .sidebar,
      .hud-root[data-aspect-mode="square"][data-layout="xs"] .sidebar {
        width:100%;
        height:auto;
        max-height:46%;
        left:0;
        right:0;
        top:0;
        border-left:none;
        border-bottom:1px solid var(--border-color);
      }

      .hud-root[data-aspect-mode="portrait"][data-layout="sm"] .handbar,
      .hud-root[data-aspect-mode="portrait"][data-layout="xs"] .handbar,
      .hud-root[data-aspect-mode="square"][data-layout="xs"] .handbar {
        width:100%;
      }

      .hud-root[data-layout="sm"] .classGrid,
      .hud-root[data-layout="xs"] .classGrid {
        grid-template-columns:1fr;
      }

      .hud-root[data-layout="xs"] .overlay {
        align-items:flex-end;
      }

      .hud-root[data-layout="xs"] .panel {
        width:100%;
        max-width:100%;
        border-radius:14px;
      }

      @media (min-width: 1500px) {
        .hud-root {
          --hud-sidebar-width: clamp(360px, 30vw, 600px);
          --hud-card-width: 54px;
          --hud-card-height: 66px;
        }

        .sidebar {
          padding:16px 18px calc(16px + var(--safe-bottom, 0px));
        }
      }

      @media (max-width: 900px) {
        .hud-root {
          --hud-sidebar-width: min(100vw, 360px);
          --hud-hand-width: 100%;
        }

        .sidebar {
          width:100%;
          height:auto;
          max-height:46dvh;
          left:0;
          right:0;
          top:0;
          border-left:none;
          border-bottom:1px solid var(--border-color);
        }

        .log {
          min-height:88px;
        }

        .handbar {
          width:100%;
        }
      }

      @media (max-width: 720px), (max-height: 720px) {
        .hud-root {
          --hud-gap: 6px;
          --hud-card-width: 38px;
          --hud-card-height: 50px;
          --hud-button-font: 13px;
        }

        .sidebar {
          padding:10px 10px calc(10px + var(--safe-bottom, 0px));
          max-height:50dvh;
        }

        .actions {
          gap:6px;
        }

        .hud-root button {
          flex:1 1 140px;
          padding:9px 10px;
        }

        .handbar {
          padding:8px 10px calc(8px + var(--safe-bottom, 0px));
          min-height:58px;
        }

        .panel {
          padding:18px 16px;
          width:min(94%, 640px);
        }

        .classGrid {
          grid-template-columns:1fr;
        }

        .room-code {
          padding:10px 14px;
        }
      }

      @media (max-width: 540px) {
        .overlay {
          align-items:flex-end;
          padding:10px max(10px, var(--safe-right, 0px)) max(10px, var(--safe-bottom, 0px)) max(10px, var(--safe-left, 0px));
        }

        .panel {
          width:100%;
          max-width:100%;
          border-radius:14px;
        }

        .sidebar {
          max-height:52dvh;
        }

        .players {
          display:grid;
          grid-template-columns:1fr;
        }

        .pname, .pstat, .square, .handlabel, .sub, .row label {
          line-height:1.35;
        }
      }

      @media (max-width: 420px), (max-height: 620px) {
        .hud-root {
          --hud-card-width: 34px;
          --hud-card-height: 46px;
          --hud-text-sm: 10px;
          --hud-text-md: 11px;
          --hud-text-lg: 14px;
        }

        .sidebar {
          max-height:56dvh;
        }

        .log {
          min-height:72px;
        }

        .crank { font-size:13px; }
        .csuit { font-size:15px; }
      }

      /* Keep landscape-ish phone ratios docked right even when generic mobile media rules match later. */
      .hud-root[data-aspect-mode="landscape"][data-layout="sm"] .sidebar,
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"] .sidebar,
      .hud-root[data-aspect-mode="wide"][data-layout="sm"] .sidebar,
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] .sidebar {
        width:var(--hud-sidebar-width);
        height:100%;
        max-height:none;
        left:auto;
        right:0;
        top:0;
        border-left:1px solid var(--border-color);
        border-bottom:none;
      }

      .hud-root[data-aspect-mode="landscape"][data-layout="sm"] .handbar,
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"] .handbar,
      .hud-root[data-aspect-mode="wide"][data-layout="sm"] .handbar,
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] .handbar {
        width:var(--hud-hand-width);
        min-height:52px;
        padding:6px 8px calc(6px + var(--safe-bottom, 0px));
        gap:4px;
      }

      .hud-root[data-aspect-mode="landscape"][data-layout="sm"],
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"],
      .hud-root[data-aspect-mode="wide"][data-layout="sm"],
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] {
        --hud-card-width: clamp(28px, calc(34px * var(--hud-scale)), 40px);
        --hud-card-height: clamp(38px, calc(46px * var(--hud-scale)), 52px);
        --hud-text-sm: clamp(9px, calc(10px * var(--hud-scale)), 11px);
        --hud-text-md: clamp(10px, calc(11px * var(--hud-scale)), 12px);
      }

      .hud-root[data-aspect-mode="landscape"][data-layout="sm"] .handlabel,
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"] .handlabel,
      .hud-root[data-aspect-mode="wide"][data-layout="sm"] .handlabel,
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] .handlabel {
        flex:0 0 100%;
        font-size:10px;
      }

      .hud-root[data-aspect-mode="landscape"][data-layout="sm"] .card,
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"] .card,
      .hud-root[data-aspect-mode="wide"][data-layout="sm"] .card,
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] .card {
        border-width:1.5px;
      }

      .hud-root[data-aspect-mode="landscape"][data-layout="sm"] .crank,
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"] .crank,
      .hud-root[data-aspect-mode="wide"][data-layout="sm"] .crank,
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] .crank {
        font-size:11px;
      }

      .hud-root[data-aspect-mode="landscape"][data-layout="sm"] .csuit,
      .hud-root[data-aspect-mode="landscape"][data-layout="xs"] .csuit,
      .hud-root[data-aspect-mode="wide"][data-layout="sm"] .csuit,
      .hud-root[data-aspect-mode="wide"][data-layout="xs"] .csuit {
        font-size:12px;
      }

      /* Final device-specific overrides for real phones. */
      .hud-root[data-device="phone"] {
        --hud-gap: clamp(4px, calc(6px * var(--hud-scale)), 8px);
        --hud-text-sm: clamp(9px, calc(10px * var(--hud-scale)), 11px);
        --hud-text-md: clamp(10px, calc(11px * var(--hud-scale)), 12px);
        --hud-text-lg: clamp(12px, calc(14px * var(--hud-scale)), 16px);
      }

      .hud-root[data-device="phone"] .sidebar,
      .hud-root[data-device="phone"] .log,
      .hud-root[data-device="phone"] .panel {
        scrollbar-width: thin;
      }

      .hud-root[data-device="phone"] .handbar {
        display:flex;
        flex-wrap:nowrap;
        align-items:center;
        align-content:center;
        justify-content:flex-start;
        overflow-x:auto;
        overflow-y:hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width:none;
        scroll-snap-type:x proximity;
      }

      .hud-root[data-device="phone"] .handbar::-webkit-scrollbar {
        display:none;
      }

      .hud-root[data-device="phone"] .handlabel {
        flex:0 0 auto;
        position:sticky;
        left:0;
        z-index:2;
        padding-right:6px;
        background:linear-gradient(90deg, var(--surface) 72%, transparent);
      }

      .hud-root[data-device="phone"] .card {
        flex:0 0 auto;
        scroll-snap-align:start;
      }

      .hud-root[data-device="phone"] .dim {
        flex:0 0 auto;
      }

      .hud-root[data-device="phone"] .players,
      .hud-root[data-device="phone"] .log {
        min-height:0;
      }

      .hud-root[data-device="phone"][data-aspect-mode="portrait"],
      .hud-root[data-device="phone"][data-aspect-mode="square"] {
        --hud-sidebar-width: 100%;
        --hud-hand-width: 100%;
        --hud-card-width: 40px;
        --hud-card-height: 54px;
      }

      .hud-root[data-device="phone"][data-aspect-mode="portrait"] .sidebar,
      .hud-root[data-device="phone"][data-aspect-mode="square"] .sidebar {
        left:var(--safe-left, 0px);
        right:var(--safe-right, 0px);
        top:0;
        width:auto;
        height:auto;
        max-height:40%;
        padding:8px 8px 10px;
        border-left:none;
        border-bottom:1px solid var(--border-color);
      }

      .hud-root[data-device="phone"][data-aspect-mode="portrait"] .handbar,
      .hud-root[data-device="phone"][data-aspect-mode="square"] .handbar {
        left:var(--safe-left, 0px);
        width:calc(100% - var(--safe-left, 0px) - var(--safe-right, 0px));
        min-height:58px;
        padding:6px 8px calc(6px + var(--safe-bottom, 0px));
        gap:4px;
      }

      .hud-root[data-device="phone"][data-aspect-mode="portrait"] .panel,
      .hud-root[data-device="phone"][data-aspect-mode="square"] .panel {
        width:100%;
        max-width:100%;
        border-radius:14px;
        padding:16px 14px;
      }

      .hud-root[data-device="phone"][data-aspect-mode="landscape"],
      .hud-root[data-device="phone"][data-aspect-mode="wide"] {
        --hud-sidebar-width: clamp(250px, calc(390px * var(--hud-scale)), 360px);
        --hud-hand-width: calc(100% - var(--hud-sidebar-width));
        --hud-card-width: clamp(28px, calc(34px * var(--hud-scale)), 38px);
        --hud-card-height: clamp(38px, calc(44px * var(--hud-scale)), 48px);
      }

      .hud-root[data-device="phone"][data-aspect-mode="landscape"] .sidebar,
      .hud-root[data-device="phone"][data-aspect-mode="wide"] .sidebar {
        width:var(--hud-sidebar-width);
        height:100%;
        max-height:none;
        left:auto;
        right:var(--safe-right, 0px);
        top:0;
        padding:8px 8px 10px;
        border-left:1px solid var(--border-color);
        border-bottom:none;
      }

      .hud-root[data-device="phone"][data-aspect-mode="landscape"] .handbar,
      .hud-root[data-device="phone"][data-aspect-mode="wide"] .handbar {
        left:var(--safe-left, 0px);
        width:calc(100% - var(--hud-sidebar-width) - var(--safe-left, 0px) - var(--safe-right, 0px));
        min-height:46px;
        padding:5px 6px calc(5px + var(--safe-bottom, 0px));
        gap:3px;
      }

      .hud-root[data-device="phone"][data-aspect-mode="landscape"] .handlabel,
      .hud-root[data-device="phone"][data-aspect-mode="wide"] .handlabel {
        font-size:9px;
      }

      .hud-root[data-device="phone"][data-aspect-mode="landscape"] .card,
      .hud-root[data-device="phone"][data-aspect-mode="wide"] .card {
        border-width:1.5px;
      }

      .hud-root[data-device="phone"][data-aspect-mode="landscape"] .crank,
      .hud-root[data-device="phone"][data-aspect-mode="wide"] .crank {
        font-size:10px;
      }

      .hud-root[data-device="phone"][data-aspect-mode="landscape"] .csuit,
      .hud-root[data-device="phone"][data-aspect-mode="wide"] .csuit {
        font-size:11px;
      }
    `;
    document.head.appendChild(s);
  }
}
