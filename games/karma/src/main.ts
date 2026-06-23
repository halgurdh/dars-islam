import './style.css';
import { escapeHtml } from './utils';
import { Card, Rank, cardImgSrc, cardLabel, CARD_BACK, rankName, suitSymbol } from './Card';
const esc = escapeHtml;
import { KarmaGame, GamePhase, PlayResult } from './KarmaGame';
import { canPlay, getValidGroups } from './Rules';
import { aiDecide, validateAIDecision } from './AI';
import { karmaNet } from './net/KarmaNetManager';
import type { KarmaSnap, KarmaSnapPlayer } from './net/karmaProtocol';

// ─── Types ────────────────────────────────────────────────────────────────────

type GameMode = 'solo' | 'local' | 'online-host' | 'online-guest';

/** Unified view model: used by all render functions regardless of mode. */
interface PlayerView {
  id:            number;
  name:          string;
  hand:          Card[];
  faceUp:        (Card | null)[];
  faceDownCount: number;
  hasFinished:   boolean;
  isHuman:       boolean;
}

// ─── Global State ─────────────────────────────────────────────────────────────

let game: KarmaGame;                    // host / local / solo
let guestSnap: KarmaSnap | null = null; // guest online view
let mode: GameMode = 'solo';
let myIndex  = 0;   // which player am I? (online: roster index; local: current viewer)
let viewerIndex = 0; // local hot-seat: whose hand we're currently showing

// Selection & drag
let selectedIds: Set<string>  = new Set();
let selectedRank: Rank | null = null;
let pointerDown: { id: string; rank: Rank; el: HTMLElement } | null = null;
let isDragging   = false;
let dragStartX   = 0;
let dragStartY   = 0;
let dragGhosts: HTMLElement[] = [];

// AI timer
let aiTimerId: ReturnType<typeof setTimeout> | null = null;

// Log
const logLines: string[] = [];

// ─── Boot ─────────────────────────────────────────────────────────────────────

showMenu();

// ─── MENU ─────────────────────────────────────────────────────────────────────

function showMenu() {
  _clearAITimer();
  karmaNet.destroy();
  guestSnap = null;

  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="menu-screen">
      <h1>♣ Karma ♠</h1>
      <p>The Shithead | Karma card game</p>
      <div class="menu-btn-group">
        <button class="menu-btn" id="m-solo">🤖 Solo (vs AI)</button>
        <button class="menu-btn" id="m-local">👥 Local (2-4)</button>
        <button class="menu-btn" id="m-online">🌐 Online</button>
      </div>
      <div class="menu-card-preview" id="card-preview"></div>
    </div>
  `;

  doc('m-solo').addEventListener('click', showSoloMenu);
  doc('m-local').addEventListener('click', showLocalMenu);
  doc('m-online').addEventListener('click', showOnlineLobby);

  const preview = doc('card-preview');
  ['cardSpadesA', 'cardHeartsK', 'cardDiamondsQ', 'cardClubsJ', 'cardSpades10'].forEach(key => {
    const img = document.createElement('img');
    img.src = `assets/cards/${key}.png`;
    preview.appendChild(img);
  });
}

// ─── SOLO MENU ────────────────────────────────────────────────────────────────

function showSoloMenu() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="menu-screen">
      <h1>🤖 Solo</h1>
      <p>Jij vs AI tegenstanders</p>
      <div class="menu-btn-group">
        <button class="menu-btn" id="s2">2 Players (1 AI)</button>
        <button class="menu-btn" id="s3">3 Players (2 AI)</button>
        <button class="menu-btn" id="s4">4 Players (3 AI)</button>
      </div>
      <button class="back-btn" id="back">← Back</button>
    </div>
  `;
  [2, 3, 4].forEach(n => doc(`s${n}`).addEventListener('click', () => startSolo(n)));
  doc('back').addEventListener('click', showMenu);
}

function startSolo(playerCount: number) {
  mode = 'solo';
  myIndex = 0;
  viewerIndex = 0;
  game = new KarmaGame(playerCount, [0]);
  logLines.length = 0;
  showSetupForPlayer(0, () => {
    game.startGame();
    initGameView();
  });
}

// ─── LOCAL MENU ───────────────────────────────────────────────────────────────

function showLocalMenu() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="menu-screen">
      <h1>👥 Local</h1>
      <p>Pass the screen between players</p>
      <div class="name-inputs" id="name-area">
        <p style="opacity:.6;margin-bottom:8px">Choose player count:</p>
        <div class="menu-btn-group" style="gap:10px">
          <button class="menu-btn" id="l2">2</button>
          <button class="menu-btn" id="l3">3</button>
          <button class="menu-btn" id="l4">4</button>
        </div>
      </div>
      <button class="back-btn" id="back">← Back</button>
    </div>
  `;
  [2, 3, 4].forEach(n => doc(`l${n}`).addEventListener('click', () => startLocal(n)));
  doc('back').addEventListener('click', showMenu);
}

let localSetupQueue: number[] = [];

function startLocal(playerCount: number) {
  mode = 'local';
  myIndex = 0;
  viewerIndex = 0;
  game = new KarmaGame(playerCount, Array.from({ length: playerCount }, (_, i) => i));
  logLines.length = 0;

  // Allow customising names
  const app = document.getElementById('app')!;
  const names = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
  app.innerHTML = `
    <div class="menu-screen">
      <h1>👥 Local — ${playerCount} players</h1>
      <p>Enter names (optional)</p>
      <div class="name-inputs">
        ${Array.from({ length: playerCount }, (_, i) => `
          <div class="name-row">
            <label>Player ${i + 1}:</label>
            <input type="text" id="name-${i}" value="${names[i]}" maxlength="16">
          </div>
        `).join('')}
      </div>
      <button class="menu-btn" id="start-local" style="margin-top:16px">Start game →</button>
      <button class="back-btn" id="back">← Back</button>
    </div>
  `;
  doc('start-local').addEventListener('click', () => {
    for (let i = 0; i < playerCount; i++) {
      const val = (document.getElementById(`name-${i}`) as HTMLInputElement).value.trim();
      game.setPlayerName(i, val || `Player ${i + 1}`);
    }
    localSetupQueue = Array.from({ length: playerCount }, (_, i) => i);
    runNextLocalSetup();
  });
  doc('back').addEventListener('click', showLocalMenu);
}

function runNextLocalSetup() {
  if (localSetupQueue.length === 0) {
    game.startGame();
    initGameView();
    return;
  }
  const playerId = localSetupQueue.shift()!;

  if (playerId === 0) {
    viewerIndex = 0;
    showSetupForPlayer(0, runNextLocalSetup);
  } else {
    showPassDevice(game.players[playerId].name, 'setup', () => {
      viewerIndex = playerId;
      showSetupForPlayer(playerId, runNextLocalSetup);
    });
  }
}

// ─── SETUP UI ─────────────────────────────────────────────────────────────────

function showSetupForPlayer(playerId: number, onDone: () => void) {
  const p = game.players[playerId];
  const app = document.getElementById('app')!;
  const setupSelected = new Set<string>();

  function render() {
    const count = setupSelected.size;
    app.innerHTML = `
      <div class="setup-overlay">
        <div class="setup-box">
          <h2>🃏 ${esc(p.name)} — choose 3 table cards</h2>
          <p>These will be placed face-up on the table. The rest becomes your starting hand.</p>
          <div class="setup-cards" id="setup-cards"></div>
          <div class="setup-counter">${count} / 3 selected</div>
          <button class="setup-confirm" id="setup-confirm" ${count === 3 ? '' : 'disabled'}>Confirm →</button>
        </div>
      </div>
    `;

    const container = doc('setup-cards');
    for (const card of p.hand) {
      const el = document.createElement('div');
      el.className = 'setup-card' + (setupSelected.has(card.id) ? ' selected' : '');
      el.innerHTML = `<img src="${cardImgSrc(card)}" alt="${cardLabel(card)}"><div class="setup-check">✓</div>`;
      el.title = cardTooltip(card);
      el.addEventListener('click', () => {
        if (setupSelected.has(card.id)) setupSelected.delete(card.id);
        else if (setupSelected.size < 3) setupSelected.add(card.id);
        render();
      });
      container.appendChild(el);
    }

    doc('setup-confirm').addEventListener('click', () => {
      if (setupSelected.size !== 3) return;
      game.playerSetup(playerId, [...setupSelected]);
      onDone();
    });
  }

  render();
}

// ─── PASS DEVICE OVERLAY ──────────────────────────────────────────────────────

function showPassDevice(playerName: string, reason: 'turn' | 'setup', onReady: () => void) {
  const app = document.getElementById('app')!;
  const label = reason === 'setup'
    ? 'Pass the screen for setup'
    : 'It is your turn!';
  const overlay = document.createElement('div');
  overlay.className = 'pass-device-overlay';
  overlay.innerHTML = `
    <div class="pass-device-box">
      <div class="pass-device-icon">📱</div>
      <h2>${label}</h2>
      <h3>${esc(playerName)}</h3>
      <p>Pass the screen and tap Ready.</p>
      <button class="menu-btn" id="pass-ready">Ready →</button>
    </div>
  `;
  app.appendChild(overlay);
  overlay.querySelector('#pass-ready')!.addEventListener('click', () => {
    overlay.remove();
    onReady();
  });
}

// ─── ONLINE LOBBY ─────────────────────────────────────────────────────────────

function showOnlineLobby() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="lobby-screen">
      <h1>🌐 Play Online</h1>
      <div class="lobby-form">
        <div class="name-row">
          <label>Your name:</label>
          <input id="online-name" type="text" maxlength="16" placeholder="Name" value="Player">
        </div>
        <div class="lobby-actions">
          <button class="menu-btn" id="create-room">🏠 Create room</button>
          <div class="join-row">
            <input id="join-code" type="text" maxlength="6" placeholder="XXXXXX">
            <button class="menu-btn" id="join-room">🔗 Join</button>
          </div>
        </div>
        <div class="lobby-error" id="lobby-error"></div>
      </div>
      <button class="back-btn" id="back">← Back</button>
    </div>
  `;

  const nameInput = document.getElementById('online-name') as HTMLInputElement;

  doc('create-room').addEventListener('click', async () => {
    const name = nameInput.value.trim() || 'Player';
    karmaNet.setName(name);
    try {
      setLobbyError('Creating room…');
      const code = await karmaNet.createRoom();
      showRoomScreen(code, true, name);
    } catch (e) {
      setLobbyError((e as Error).message);
    }
  });

  doc('join-room').addEventListener('click', async () => {
    const code = (document.getElementById('join-code') as HTMLInputElement).value.trim().toUpperCase();
    const name = nameInput.value.trim() || 'Player';
    if (code.length < 4) { setLobbyError('Enter a valid room code.'); return; }
    karmaNet.setName(name);
    try {
      setLobbyError('Connecting…');
      await karmaNet.joinRoom(code);
      showRoomScreen(code, false, name);
    } catch (e) {
      setLobbyError((e as Error).message);
    }
  });

  doc('back').addEventListener('click', showMenu);
}

function setLobbyError(msg: string) {
  const el = document.getElementById('lobby-error');
  if (el) el.textContent = msg;
}

function showRoomScreen(code: string, isHost: boolean, myName: string) {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="room-screen">
      <h1>Room</h1>
      <div class="room-code-display">${code}</div>
      <p class="room-hint">${isHost ? 'Share this code with friends' : 'Wait for the host to start…'}</p>
      <div class="member-list" id="member-list"></div>
      <div class="room-status" id="room-status">Waiting for more players…</div>
      ${isHost ? '<button class="menu-btn" id="start-online" disabled>▶ Start game (min. 2)</button>' : ''}
      <button class="back-btn" id="leave-room">← Leave</button>
    </div>
  `;

  if (!isHost) {
    karmaNet.onGameStart = (snap) => {
      const myIdx = karmaNet.myPlayerIndex();
      startOnlineGuest(snap, myIdx < 0 ? 1 : myIdx);
    };
  }

  karmaNet.onRosterUpdate = (members) => {
    const list = document.getElementById('member-list');
    if (!list) return;
    list.innerHTML = members.map(m =>
      `<div class="member-item">${m.isHost ? '👑' : '👤'} ${esc(m.name)}</div>`,
    ).join('');

    const statusEl = document.getElementById('room-status');
    if (statusEl) statusEl.textContent = `${members.length} player(s) present`;

    if (isHost) {
      const startBtn = document.getElementById('start-online') as HTMLButtonElement | null;
      if (startBtn) startBtn.disabled = members.length < 2;
    }
  };

  if (isHost) {
    doc('start-online').addEventListener('click', () => launchOnlineGame(myName));
  }

  doc('leave-room').addEventListener('click', () => {
    karmaNet.destroy();
    showMenu();
  });
}

function launchOnlineGame(hostName: string) {
  const members = karmaNet.members;
  const playerCount = members.length;

  mode = 'online-host';
  myIndex = 0; // host is always player 0
  viewerIndex = 0;
  logLines.length = 0;

  // All players are human in online mode (no AI)
  game = new KarmaGame(playerCount, Array.from({ length: playerCount }, (_, i) => i));

  // Set player names from roster
  members.forEach((m, i) => game.setPlayerName(i, m.name));
  game.setPlayerName(0, hostName);

  // Host does setup first, then sends initial snapshot
  karmaNet.onAction = handleOnlineAction;
  karmaNet.onSnapshot = undefined; // host doesn't need this

  // Track which players (guests) have completed setup
  const guestSetupsReceived = new Set<number>([0]); // host will do setup immediately

  showSetupForPlayer(0, () => {
    // Host setup done — now wait for guests to setup too
    const hostSetupDone = true; void hostSetupDone;
    broadcastSnap('🃏 Choose your table cards!');
    showOnlineWaitingForSetup(guestSetupsReceived, playerCount);
  });

  function handleOnlineAction(action: import('./net/karmaProtocol').KarmaAction) {
    if (game.phase === GamePhase.Setup) {
      if (action.type === 'setup') {
        game.playerSetup(action.playerIndex, action.selectedIds);
        guestSetupsReceived.add(action.playerIndex);
        broadcastSnap(`${game.players[action.playerIndex].name} finished setup`);
        if (guestSetupsReceived.size >= playerCount) {
          game.startGame();
          broadcastSnap('Game starting!');
          initGameView();
        }
      }
    } else if (game.phase === GamePhase.Play) {
      // Reject any action that claims a player index other than the current player.
      if (action.playerIndex !== game.currentPlayer) return;
      let result: PlayResult | undefined;
      if (action.type === 'play')  result = game.playCards(action.cardIds);
      if (action.type === 'flip')  result = game.flipFaceDown(action.slotIndex);
      if (action.type === 'take')  result = game.takePile();
      if (result) processOnlineResult(result);
    }
  }
}

function showOnlineWaitingForSetup(done: Set<number>, total: number) {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="menu-screen">
      <h2>⏳ Waiting for other players…</h2>
      <p>${done.size} / ${total} finished setup</p>
      <div class="setup-waiting" id="setup-progress"></div>
    </div>
  `;
  // Live updates come via broadcastSnap which guests receive
}

function startOnlineGuest(snap: KarmaSnap, myPlayerIdx: number) {
  mode = 'online-guest';
  myIndex = myPlayerIdx;
  viewerIndex = myPlayerIdx;
  logLines.length = 0;

  guestSnap = snap;
  karmaNet.onSnapshot = (s) => { guestSnap = s; logLines.push(s.lastMessage); renderGuestGame(); };

  if (snap.phase === 'setup') {
    // Show setup for my player slot
    // Build a dummy game object just for the setup UI (we have our own cards in the snap)
    const myCards = snap.players[myPlayerIdx].hand;
    showGuestSetup(myCards, myPlayerIdx);
  } else {
    initGuestGameView();
  }
}

function showGuestSetup(cards: Card[], playerIndex: number) {
  const app = document.getElementById('app')!;
  const setupSelected = new Set<string>();

  function render() {
    const count = setupSelected.size;
    app.innerHTML = `
      <div class="setup-overlay">
        <div class="setup-box">
          <h2>🃏 Choose your 3 table cards</h2>
          <p>These will be placed face-up on the table. The rest becomes your starting hand.</p>
          <div class="setup-cards" id="setup-cards-g"></div>
          <div class="setup-counter">${count} / 3 selected</div>
          <button class="setup-confirm" id="setup-confirm-g" ${count === 3 ? '' : 'disabled'}>Confirm →</button>
        </div>
      </div>
    `;
    const container = doc('setup-cards-g');
    for (const card of cards) {
      const el = document.createElement('div');
      el.className = 'setup-card' + (setupSelected.has(card.id) ? ' selected' : '');
      el.innerHTML = `<img src="${cardImgSrc(card)}" alt="${cardLabel(card)}"><div class="setup-check">✓</div>`;
      el.addEventListener('click', () => {
        if (setupSelected.has(card.id)) setupSelected.delete(card.id);
        else if (setupSelected.size < 3) setupSelected.add(card.id);
        render();
      });
      container.appendChild(el);
    }
    doc('setup-confirm-g').addEventListener('click', () => {
      if (setupSelected.size !== 3) return;
      karmaNet.sendAction({ type: 'setup', playerIndex, selectedIds: [...setupSelected] });
      const app2 = document.getElementById('app')!;
      app2.innerHTML = `<div class="menu-screen"><h2>⏳ Waiting for other players…</h2></div>`;
      karmaNet.onSnapshot = (s) => { guestSnap = s; if (s.phase === 'play') initGuestGameView(); };
    });
  }
  render();
}

function processOnlineResult(result: PlayResult) {
  logLines.push(result.message);
  if (result.burnedPile) flashBurn();
  if (result.playerFinished && !result.gameOver) {
    const total = game.totalCards(result.playerId);
    if (total === 1) showKnock(game.players[result.playerId].name);
  }
  broadcastSnap(result.message);

  if (result.gameOver) {
    setTimeout(() => showEndScreen(result), 600);
    return;
  }
  renderAll();
  startTurn();
}

function broadcastSnap(msg: string) {
  const snap = gameToSnap(msg);
  karmaNet.broadcastSnapshot(snap);
}

function gameToSnap(msg: string): KarmaSnap {
  return {
    phase: game.phase === GamePhase.Play ? 'play' : game.phase === GamePhase.Setup ? 'setup' : 'end',
    currentPlayer: game.currentPlayer,
    deckCount: game.deck.length,
    pile: [...game.pile],
    under7: game.under7,
    lastMessage: msg,
    players: game.players.map(p => ({
      id: p.id,
      name: p.name,
      hand: [...p.hand],
      faceUp: [...p.faceUp],
      faceDownCount: p.faceDown.filter(c => c !== null).length,
      hasFinished: p.hasFinished,
    })),
  };
}

// ─── GAME VIEW INIT ───────────────────────────────────────────────────────────

function initGameView() {
  _buildGameTable();
  initDragDrop();
  renderAll();
  startTurn();
}

function initGuestGameView() {
  karmaNet.onSnapshot = (s) => {
    guestSnap = s;
    logLines.push(s.lastMessage);
    renderGuestGame();
    if (s.phase === 'end') setTimeout(() => showEndFromSnap(s), 600);
  };
  _buildGameTable();
  initDragDrop();
  renderGuestGame();
}

function _buildGameTable() {
  const app = document.getElementById('app')!;
  const players = mode === 'online-guest' && guestSnap
    ? guestSnap.players
    : game.players;
  const aiAreas = players.filter((_, i) => i !== myIndex).map(p => `
    <div class="ai-area" id="ai-area-${p.id}">
      <div class="ai-name" id="ai-name-${p.id}">${esc(p.name)}</div>
      <div class="ai-cards-row" id="ai-facedown-${p.id}"></div>
      <div class="ai-cards-row" id="ai-faceup-${p.id}"></div>
      <div class="ai-hand-count" id="ai-handcount-${p.id}"></div>
      <div class="ai-status" id="ai-status-${p.id}"></div>
    </div>
  `).join('');

  app.innerHTML = `
    <div class="game-table">
      <div class="ai-row">${aiAreas}</div>
      <div class="center-table">
        <div class="deck-pile" id="deck-pile">
          <img src="${CARD_BACK}" alt="Deck" id="deck-img">
          <div class="deck-count" id="deck-count">—</div>
        </div>
        <div class="discard-zone" id="discard-zone">
          <div class="pile-shadow"></div>
          <div class="pile-empty-label" id="pile-empty">Empty<br>pile</div>
          <img class="discard-top" id="discard-top" src="" alt="" style="display:none">
        </div>
        <div class="game-info">
          <div class="status-text" id="status-text">—</div>
          <div class="under7-banner" id="under7-banner">⬇️ Onder 7!</div>
          <button class="take-pile-btn" id="take-pile-btn">Take pile</button>
          <div class="game-log" id="game-log"></div>
        </div>
      </div>
      <div class="human-area">
        <div class="table-cards-row" id="human-table-cards"></div>
        <div class="human-label" id="human-label">Jij</div>
        <div class="hand-area" id="human-hand"></div>
      </div>
    </div>
  `;

  doc('take-pile-btn').addEventListener('click', () => {
    if (mode === 'online-guest') {
      karmaNet.sendAction({ type: 'take', playerIndex: myIndex });
      return;
    }
    if (game.currentPlayer !== viewerIndex || game.phase !== GamePhase.Play) return;
    handleResult(game.takePile());
  });
}

// ─── RENDER FROM LOCAL GAME ───────────────────────────────────────────────────

function renderAll() {
  const players = _playerViews();
  renderAIAreas(players);
  renderCenter(players);
  renderHumanArea(players);
}

function _playerViews(): PlayerView[] {
  return game.players.map(p => ({
    id: p.id,
    name: p.name,
    hand: [...p.hand],
    faceUp: [...p.faceUp],
    faceDownCount: p.faceDown.filter(c => c !== null).length,
    hasFinished: p.hasFinished,
    isHuman: p.isHuman,
  }));
}

function renderAIAreas(players: PlayerView[]) {
  for (const pv of players) {
    if (pv.id === viewerIndex) continue; // skip current viewer's area

    const isActive = game.currentPlayer === pv.id;
    const nameEl   = document.getElementById(`ai-name-${pv.id}`);
    const fdEl     = document.getElementById(`ai-facedown-${pv.id}`);
    const fuEl     = document.getElementById(`ai-faceup-${pv.id}`);
    const hcEl     = document.getElementById(`ai-handcount-${pv.id}`);
    const stEl     = document.getElementById(`ai-status-${pv.id}`);
    const areaEl   = document.getElementById(`ai-area-${pv.id}`);
    if (!nameEl || !fdEl || !fuEl || !hcEl || !stEl || !areaEl) continue;

    nameEl.className = 'ai-name' + (isActive ? ' active-player' : '');
    areaEl.className = 'ai-area' + (pv.hasFinished ? ' finished' : '');

    fdEl.innerHTML = Array.from({ length: pv.faceDownCount }, () =>
      `<div class="ai-card"><img src="${CARD_BACK}" alt="?"></div>`).join('');

    fuEl.innerHTML = pv.faceUp.map(c => c
      ? `<div class="ai-card"><img src="${cardImgSrc(c)}" alt="${cardLabel(c)}"></div>`
      : '',
    ).join('');

    hcEl.textContent = pv.hasFinished
      ? '✓ Done!'
      : `${pv.hand.length} card${pv.hand.length !== 1 ? 's' : ''} in hand`;
    stEl.textContent = isActive ? '▼ current turn' : '';
  }
}

function renderCenter(players: PlayerView[]) {
  const deckCountEl = document.getElementById('deck-count');
  const deckImgEl   = document.getElementById('deck-img') as HTMLImageElement | null;
  if (deckCountEl) deckCountEl.textContent = String(game.deck.length);
  if (deckImgEl)   deckImgEl.style.opacity = game.deck.length === 0 ? '0.2' : '1';

  const discardTop = document.getElementById('discard-top') as HTMLImageElement | null;
  const pileEmpty  = document.getElementById('pile-empty');
  if (discardTop && pileEmpty) {
    if (game.pile.length > 0) {
      discardTop.src = cardImgSrc(game.pile[game.pile.length - 1]);
      discardTop.style.display = 'block';
      pileEmpty.style.display = 'none';
    } else {
      discardTop.style.display = 'none';
      pileEmpty.style.display = 'flex';
    }
  }

  const u7 = document.getElementById('under7-banner');
  if (u7) u7.className = 'under7-banner' + (game.under7 ? ' active' : '');

  const me = players[viewerIndex];
  const source = game.getSource(viewerIndex);
  const isTurn = game.currentPlayer === viewerIndex;
  const statusEl = document.getElementById('status-text');
  if (statusEl) {
    if (isTurn) {
      if (source === 'hand') {
        const validGroups = getValidGroups(me.hand, game.pile, game.under7);
        statusEl.textContent = validGroups.length > 0
          ? 'Your turn — drag a card to the pile'
          : 'No valid card — take the pile!';
      } else if (source === 'faceup') {
        statusEl.textContent = 'Click a face-up table card to play it';
      } else if (source === 'facedown') {
        statusEl.textContent = 'Click a face-down card to flip it';
      } else {
        statusEl.textContent = '✓ Done!';
      }
    } else {
      statusEl.textContent = `${game.players[game.currentPlayer].name} is taking their turn…`;
    }
  }

  const takePileBtn = document.getElementById('take-pile-btn') as HTMLButtonElement | null;
  if (takePileBtn) {
    const hasNoPlay = isTurn && source !== 'done' && source !== 'facedown' && !game.hasValidPlay(viewerIndex);
    takePileBtn.className = 'take-pile-btn' + (hasNoPlay ? ' visible' : '');
  }

  const logEl = document.getElementById('game-log');
  if (logEl) logEl.innerHTML = logLines.slice(-20).map(l => `<div>${l}</div>`).join('');
}

function renderHumanArea(players: PlayerView[]) {
  const me = players[viewerIndex];
  const humanLabel = document.getElementById('human-label');
  const isTurn = game.currentPlayer === viewerIndex;
  if (humanLabel) {
    humanLabel.textContent = me.name;
    humanLabel.className = 'human-label' + (isTurn ? ' active-player' : '');
  }
  renderHumanTableCards(me);
  renderHumanHand(me);
}

function renderHumanTableCards(me: PlayerView) {
  const container = document.getElementById('human-table-cards');
  if (!container) return;
  const source = game.getSource(me.id);
  const isTurn = game.currentPlayer === me.id;

  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const fd = game.players[me.id].faceDown[i];
    const fu = me.faceUp[i];
    const slot = document.createElement('div');
    slot.className = 'table-slot';

    if (fd) {
      const img = document.createElement('img');
      img.className = 'face-down-card'; img.src = CARD_BACK; img.alt = '?';
      slot.appendChild(img);
    }
    if (fu) {
      const img = document.createElement('img');
      img.className = 'face-up-card'; img.src = cardImgSrc(fu); img.alt = cardLabel(fu);
      slot.appendChild(img);
    }

    if (isTurn && source === 'faceup' && fu) {
      slot.style.cursor = 'pointer';
      slot.addEventListener('click', () => {
        if (mode === 'online-guest') {
          karmaNet.sendAction({ type: 'play', playerIndex: myIndex, cardIds: [fu.id] });
        } else {
          handleResult(game.playCards([fu.id]));
        }
      });
    }
    if (isTurn && source === 'facedown' && fd && !fu) {
      slot.className += ' flip-target';
      slot.title = 'Draai om';
      slot.addEventListener('click', () => {
        if (mode === 'online-guest') {
          karmaNet.sendAction({ type: 'flip', playerIndex: myIndex, slotIndex: i });
        } else {
          handleResult(game.flipFaceDown(i));
        }
      });
    }
    container.appendChild(slot);
  }
}

function renderHumanHand(me: PlayerView) {
  const container = document.getElementById('human-hand');
  if (!container) return;
  const source = game.getSource(me.id);
  if (source !== 'hand') { container.innerHTML = ''; return; }

  const isTurn = game.currentPlayer === me.id;
  const validGroups = isTurn ? getValidGroups(me.hand, game.pile, game.under7) : [];
  const validRanks = new Set(validGroups.map(g => g[0].rank));

  container.innerHTML = '';
  for (const card of me.hand) {
    const el = document.createElement('div');
    el.className = 'hand-card';
    el.dataset['id'] = card.id;
    el.dataset['rank'] = String(card.rank);
    if (selectedIds.has(card.id)) el.classList.add('selected');
    else if (selectedRank !== null && card.rank === selectedRank) el.classList.add('same-rank-hint');

    const img = document.createElement('img');
    img.src = cardImgSrc(card); img.alt = cardLabel(card);
    el.appendChild(img);
    el.title = cardTooltip(card);

    if (isTurn) {
      el.addEventListener('pointerdown', (e: PointerEvent) => {
        e.preventDefault();
        dragStartX = e.clientX; dragStartY = e.clientY;
        pointerDown = { id: card.id, rank: card.rank, el };
        isDragging = false;
      });
    } else {
      el.style.cursor = 'default';
    }

    if (!isTurn || !validRanks.has(card.rank)) el.classList.add('not-turn');
    container.appendChild(el);
  }
}

// ─── RENDER FROM SNAPSHOT (ONLINE GUEST) ─────────────────────────────────────

function renderGuestGame() {
  if (!guestSnap) return;
  const snap = guestSnap;

  // Deck / pile
  const deckCountEl = document.getElementById('deck-count');
  const deckImgEl   = document.getElementById('deck-img') as HTMLImageElement | null;
  if (deckCountEl) deckCountEl.textContent = String(snap.deckCount);
  if (deckImgEl)   deckImgEl.style.opacity = snap.deckCount === 0 ? '0.2' : '1';

  const discardTop = document.getElementById('discard-top') as HTMLImageElement | null;
  const pileEmpty  = document.getElementById('pile-empty');
  if (discardTop && pileEmpty) {
    if (snap.pile.length > 0) {
      discardTop.src = cardImgSrc(snap.pile[snap.pile.length - 1]);
      discardTop.style.display = 'block';
      pileEmpty.style.display = 'none';
    } else {
      discardTop.style.display = 'none';
      pileEmpty.style.display = 'flex';
    }
  }

  const u7 = document.getElementById('under7-banner');
  if (u7) u7.className = 'under7-banner' + (snap.under7 ? ' active' : '');

  // AI areas (other players)
  for (const sp of snap.players) {
    if (sp.id === myIndex) continue;
    const nameEl = document.getElementById(`ai-name-${sp.id}`);
    const fdEl   = document.getElementById(`ai-facedown-${sp.id}`);
    const fuEl   = document.getElementById(`ai-faceup-${sp.id}`);
    const hcEl   = document.getElementById(`ai-handcount-${sp.id}`);
    const stEl   = document.getElementById(`ai-status-${sp.id}`);
    const areaEl = document.getElementById(`ai-area-${sp.id}`);
    if (!nameEl || !fdEl || !fuEl || !hcEl || !stEl || !areaEl) continue;

    const isActive = snap.currentPlayer === sp.id;
    nameEl.className = 'ai-name' + (isActive ? ' active-player' : '');
    areaEl.className = 'ai-area' + (sp.hasFinished ? ' finished' : '');

    fdEl.innerHTML = Array.from({ length: sp.faceDownCount }, () =>
      `<div class="ai-card"><img src="${CARD_BACK}" alt="?"></div>`).join('');
    fuEl.innerHTML = sp.faceUp.map(c => c
      ? `<div class="ai-card"><img src="${cardImgSrc(c)}" alt="${cardLabel(c)}"></div>` : '').join('');
    hcEl.textContent = sp.hasFinished ? '✓ Done!' : `${sp.hand.length} cards`;
    stEl.textContent = isActive ? '▼ current turn' : '';
  }

  // My player
  const me: KarmaSnapPlayer = snap.players[myIndex];
  const isTurn = snap.currentPlayer === myIndex;

  const humanLabel = document.getElementById('human-label');
  if (humanLabel) {
    humanLabel.textContent = me.name;
    humanLabel.className = 'human-label' + (isTurn ? ' active-player' : '');
  }

  const statusEl = document.getElementById('status-text');
  if (statusEl) {
    if (isTurn) {
      if (me.hand.length > 0) {
        const vg = getValidGroups(me.hand, snap.pile, snap.under7);
        statusEl.textContent = vg.length > 0
          ? 'Your turn — drag a card'
          : 'No valid card — take the pile!';
      } else if (me.faceUp.some(c => c !== null)) {
        statusEl.textContent = 'Click a face-up table card';
      } else if (me.faceDownCount > 0) {
        statusEl.textContent = 'Click a face-down card';
      } else {
        statusEl.textContent = '✓ Done!';
      }
    } else {
      statusEl.textContent = `${snap.players[snap.currentPlayer]?.name ?? '?'} is taking their turn…`;
    }
  }

  // Take pile button
  const takePileBtn = document.getElementById('take-pile-btn') as HTMLButtonElement | null;
  if (takePileBtn) {
    const hasHand = me.hand.length > 0 || me.faceUp.some(c => c !== null);
    const validGroups2 = hasHand
      ? getValidGroups(
          me.hand.length > 0 ? me.hand : me.faceUp.filter((c): c is Card => c !== null),
          snap.pile, snap.under7)
      : [];
    const hasNoPlay = isTurn && hasHand && me.faceDownCount === 0 && validGroups2.length === 0;
    takePileBtn.className = 'take-pile-btn' + (hasNoPlay ? ' visible' : '');
  }

  // Table cards
  const tableContainer = document.getElementById('human-table-cards');
  if (tableContainer) {
    tableContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const fu = me.faceUp[i];
      const slot = document.createElement('div');
      slot.className = 'table-slot';

      if (i < me.faceDownCount) {
        const img = document.createElement('img');
        img.className = 'face-down-card'; img.src = CARD_BACK; img.alt = '?';
        slot.appendChild(img);
      }
      if (fu) {
        const img = document.createElement('img');
        img.className = 'face-up-card'; img.src = cardImgSrc(fu); img.alt = cardLabel(fu);
        slot.appendChild(img);

        if (isTurn && me.hand.length === 0) {
          slot.style.cursor = 'pointer';
          slot.addEventListener('click', () =>
            karmaNet.sendAction({ type: 'play', playerIndex: myIndex, cardIds: [fu.id] }));
        }
      }
      if (isTurn && me.hand.length === 0 && me.faceUp.every(c => c === null) && i < me.faceDownCount) {
        slot.className += ' flip-target';
        slot.addEventListener('click', () =>
          karmaNet.sendAction({ type: 'flip', playerIndex: myIndex, slotIndex: i }));
      }
      tableContainer.appendChild(slot);
    }
  }

  // Hand
  const handContainer = document.getElementById('human-hand');
  if (handContainer) {
    if (me.hand.length === 0) { handContainer.innerHTML = ''; return; }
    const validRanks = isTurn
      ? new Set(getValidGroups(me.hand, snap.pile, snap.under7).map(g => g[0].rank))
      : new Set<Rank>();
    handContainer.innerHTML = '';
    for (const card of me.hand) {
      const el = document.createElement('div');
      el.className = 'hand-card';
      el.dataset['id'] = card.id;
      el.dataset['rank'] = String(card.rank);
      if (selectedIds.has(card.id)) el.classList.add('selected');
      else if (selectedRank !== null && card.rank === selectedRank) el.classList.add('same-rank-hint');

      const img = document.createElement('img');
      img.src = cardImgSrc(card); img.alt = cardLabel(card);
      el.appendChild(img);
      el.title = cardTooltip(card);

      if (isTurn) {
        el.addEventListener('pointerdown', (e: PointerEvent) => {
          e.preventDefault();
          dragStartX = e.clientX; dragStartY = e.clientY;
          pointerDown = { id: card.id, rank: card.rank, el };
          isDragging = false;
        });
      }
      if (!validRanks.has(card.rank)) el.classList.add('not-turn');
      handContainer.appendChild(el);
    }
  }

  const logEl = document.getElementById('game-log');
  if (logEl) logEl.innerHTML = logLines.slice(-20).map(l => `<div>${l}</div>`).join('');
}

// ─── DRAG & DROP ──────────────────────────────────────────────────────────────

function initDragDrop() {
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup',   onPointerUp);
}

function onPointerMove(e: PointerEvent) {
  if (!pointerDown) return;
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  if (!isDragging && Math.sqrt(dx * dx + dy * dy) > 8) {
    isDragging = true;
    const { id, rank } = pointerDown;
    if (!selectedIds.has(id)) {
      if (selectedRank !== null && selectedRank !== rank) { selectedIds.clear(); }
      selectedIds.add(id); selectedRank = rank;
      if (mode === 'online-guest') renderGuestGame(); else renderAll();
    }
    createDragGhosts();
  }

  if (isDragging) {
    moveDragGhosts(dx, dy);
    updatePileHighlight(e.clientX, e.clientY);
  }
}

function onPointerUp(e: PointerEvent) {
  if (!pointerDown) return;

  if (isDragging) {
    const overPile = isOverPile(e.clientX, e.clientY);
    removeDragGhosts(); clearPileHighlight();
    if (overPile) attemptPlaySelected();
    isDragging = false;
  } else {
    toggleSelect(pointerDown.id, pointerDown.rank);
  }
  pointerDown = null;
}

function toggleSelect(cardId: string, rank: Rank) {
  if (selectedIds.has(cardId)) {
    selectedIds.delete(cardId);
    if (selectedIds.size === 0) selectedRank = null;
  } else {
    if (selectedRank !== null && selectedRank !== rank) selectedIds.clear();
    selectedIds.add(cardId); selectedRank = rank;
  }
  if (mode === 'online-guest') renderGuestGame(); else renderAll();
}

function attemptPlaySelected() {
  if (!selectedIds.size) return;
  const isTurn = mode === 'online-guest'
    ? guestSnap?.currentPlayer === myIndex
    : game.currentPlayer === viewerIndex;
  if (!isTurn) return;

  const cards = mode === 'online-guest'
    ? (guestSnap?.players[myIndex].hand ?? []).filter(c => selectedIds.has(c.id))
    : game.players[viewerIndex].hand.filter(c => selectedIds.has(c.id));

  const pile  = mode === 'online-guest' ? (guestSnap?.pile ?? []) : game.pile;
  const under7 = mode === 'online-guest' ? (guestSnap?.under7 ?? false) : game.under7;

  if (!canPlay(cards, pile, under7)) {
    showToast('Cannot play on the current pile!', 'error');
    clearSelection();
    if (mode === 'online-guest') renderGuestGame(); else renderAll();
    return;
  }

  if (mode === 'online-guest') {
    karmaNet.sendAction({ type: 'play', playerIndex: myIndex, cardIds: [...selectedIds] });
    clearSelection();
  } else {
    const result = game.playCards([...selectedIds]);
    clearSelection();
    handleResult(result);
  }
}

function clearSelection() { selectedIds.clear(); selectedRank = null; }

function createDragGhosts() {
  const layer = document.getElementById('drag-layer')!;
  const handEl = document.getElementById('human-hand');
  if (!handEl) return;
  for (const id of selectedIds) {
    const cardEl = handEl.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
    if (!cardEl) continue;
    const rect = cardEl.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px`;
    const img = document.createElement('img');
    img.src = (cardEl.querySelector('img') as HTMLImageElement)?.src ?? '';
    ghost.appendChild(img);
    layer.appendChild(ghost);
    dragGhosts.push(ghost);
    cardEl.style.opacity = '0.3';
  }
}

function moveDragGhosts(dx: number, dy: number) {
  dragGhosts.forEach((g, i) => {
    g.style.transform = `translate(${dx + i * 5}px,${dy - i * 5}px) rotate(${i * 2}deg)`;
  });
}

function removeDragGhosts() {
  dragGhosts.forEach(g => g.remove());
  dragGhosts = [];
  document.getElementById('human-hand')
    ?.querySelectorAll('.hand-card')
    .forEach(el => { (el as HTMLElement).style.opacity = ''; });
}

function isOverPile(x: number, y: number): boolean {
  const zone = document.getElementById('discard-zone');
  if (!zone) return false;
  const r = zone.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function updatePileHighlight(x: number, y: number) {
  const zone = document.getElementById('discard-zone');
  if (!zone) return;
  if (!isOverPile(x, y)) { clearPileHighlight(); return; }

  const me = mode === 'online-guest'
    ? guestSnap?.players[myIndex]
    : game.players[viewerIndex];
  const cards = (me?.hand ?? []).filter(c => selectedIds.has(c.id));
  const pile   = mode === 'online-guest' ? (guestSnap?.pile ?? []) : game.pile;
  const under7 = mode === 'online-guest' ? (guestSnap?.under7 ?? false) : game.under7;
  const valid  = cards.length > 0 && canPlay(cards, pile, under7);
  zone.classList.toggle('pile-valid',   valid);
  zone.classList.toggle('pile-invalid', !valid);
}

function clearPileHighlight() {
  document.getElementById('discard-zone')?.classList.remove('pile-valid', 'pile-invalid');
}

// ─── TURN LOGIC ───────────────────────────────────────────────────────────────

function startTurn() {
  if (game.phase === GamePhase.End) return;
  renderAll();

  const cp = game.currentPlayer;

  if (!game.players[cp].isHuman) {
    // AI (solo mode)
    _scheduleAITurn();
    return;
  }

  if (mode === 'local' && cp !== viewerIndex) {
    // Local hot-seat: show pass-device overlay
    showPassDevice(game.players[cp].name, 'turn', () => {
      viewerIndex = cp;
      myIndex = cp;
      renderAll();
    });
    return;
  }

  // It's my turn (solo or local current viewer or online host)
  renderAll();
}

function _scheduleAITurn() {
  _clearAITimer();
  aiTimerId = setTimeout(() => {
    if (game.phase !== GamePhase.Play) return;
    const cp = game.currentPlayer;
    if (game.players[cp].isHuman) return;

    const decision = aiDecide(game, cp);
    if (!validateAIDecision(game, cp, decision)) { handleResult(game.takePile()); return; }

    let result: PlayResult;
    if (decision.action === 'flip') result = game.flipFaceDown(decision.slotIndex);
    else if (decision.action === 'play') result = game.playCards(decision.cardIds);
    else result = game.takePile();
    handleResult(result);
  }, 1400);
}

function handleResult(result: PlayResult) {
  logLines.push(result.message);
  if (result.burnedPile) flashBurn();

  if (!result.gameOver && result.type === 'played') {
    const total = game.totalCards(result.playerId);
    if (total === 1) showKnock(game.players[result.playerId].name);
  }

  renderAll();
  if (result.gameOver) { setTimeout(() => showEndScreen(result), 600); return; }
  setTimeout(() => startTurn(), result.type === 'cant_flip' ? 1200 : 300);
}

// ─── END SCREEN ───────────────────────────────────────────────────────────────

function showEndScreen(result: PlayResult) {
  const winner   = result.winner   !== undefined ? game.players[result.winner]   : null;
  const shithead = result.shithead !== undefined ? game.players[result.shithead] : null;
  _renderEndScreen(winner?.name, shithead?.name, result.message, game.players.length);
}

function showEndFromSnap(snap: KarmaSnap) {
  const winner   = snap.winner   !== undefined ? snap.players[snap.winner]   : null;
  const shithead = snap.shithead !== undefined ? snap.players[snap.shithead] : null;
  _renderEndScreen(winner?.name, shithead?.name, snap.lastMessage, snap.players.length);
}

function _renderEndScreen(winnerName?: string, shitheadName?: string, msg?: string, playerCount?: number) {
  const app = document.getElementById('app')!;
  const endDiv = document.createElement('div');
  endDiv.className = 'end-screen';
  endDiv.innerHTML = `
    <h2>🏆 ${esc(winnerName ?? '?')} wins!</h2>
    ${shitheadName ? `<div class="shithead-label">💀 ${esc(shitheadName)} is de Karma!</div>` : ''}
    ${msg ? `<p>${esc(msg)}</p>` : ''}
    <button class="play-again-btn" id="end-again">Play again</button>
    <button class="play-again-btn" id="end-menu" style="border-color:#aaa;color:#aaa">Menu</button>
  `;
  app.appendChild(endDiv);

  doc('end-again').addEventListener('click', () => {
    endDiv.remove();
    if (mode === 'solo')  startSolo(playerCount ?? 2);
    else if (mode === 'local') startLocal(playerCount ?? 2);
    else showMenu();
  });
  doc('end-menu').addEventListener('click', showMenu);
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────

let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(msg: string, type: 'error' | 'success' | '' = '') {
  const el = document.getElementById('toast')!;
  el.textContent = msg; el.className = type; el.style.display = 'block'; el.style.opacity = '1';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => { el.style.display = 'none'; }, 300);
  }, 2400);
}

function showKnock(playerName: string) {
  document.querySelector('.knock-overlay')?.remove();
  const ov = document.createElement('div');
  ov.className = 'knock-overlay';
  ov.innerHTML = `<div class="knock-badge">🤜 ${esc(playerName)} knocks! Last card!</div>`;
  document.body.appendChild(ov);
  setTimeout(() => ov.remove(), 2500);
}

function flashBurn() {
  const zone = document.getElementById('discard-zone');
  if (!zone) return;
  zone.style.transition = 'box-shadow 0s';
  zone.style.boxShadow = '0 0 60px 20px rgba(255,100,0,.9)';
  setTimeout(() => { zone.style.transition = 'box-shadow .6s'; zone.style.boxShadow = ''; }, 50);
}

function cardTooltip(card: Card): string {
  const tips: Partial<Record<Rank, string>> = {
    [Rank.Two]:   '2 — Play on anything (reset)',
    [Rank.Three]: '3 — Transparent (pile value unchanged)',
    [Rank.Seven]: '7 — Next player must play UNDER 7',
    [Rank.Eight]: '8 — Next player is skipped',
    [Rank.Ten]:   '10 — BURN: the whole pile is cleared',
    [Rank.Ace]:   'Ace — Highest; after this only Ace, 2, 3, or 10',
    [Rank.Joker]: 'Joker — Transparent (like 3)',
  };
  return tips[card.rank] ?? `${rankName(card.rank)} ${suitSymbol(card.suit)}`;
}

function doc(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el;
}

function _clearAITimer() {
  if (aiTimerId !== null) { clearTimeout(aiTimerId); aiTimerId = null; }
}
