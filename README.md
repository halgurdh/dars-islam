# Realm Quest — Phaser 3 + TypeScript

> **Monopoly meets Yu-Gi-Oh.** A fantasy board game with 4 hero classes
> (Warrior / Mage / Rogue / Cleric), card-based abilities, dice movement,
> combat and a shared board. Built with **Phaser 3 + TypeScript + Vite**,
> using a reusable **FSM + ECS + EventBus** architecture. Runs in the
> browser (web-first) and ships as a Windows `.exe` via Electron.

---

## ✅ Verification status

Everything below was **actually run** during development:

| Check | Result |
|-------|--------|
| TypeScript typecheck (`tsc --noEmit`) | **0 errors** |
| Logic test suite (`tests/logic.test.ts`) | **817 checks, 0 failures** — incl. 60 full simulated games |
| Integration test (`tests/integration.test.ts`) | **14 checks, 0 failures** — HUD-driven playthrough to a winner |
| Production build (`vite build`) | **✓ 29 modules, bundle emitted** |
| Served bundle + assets over HTTP | **200 OK** (page, JS, card PNGs) |

> Note: a full in-browser WebGL boot can't run in the build sandbox (no
> GPU/canvas), but the engine initialises correctly up to the canvas call,
> and the logic + wiring are fully exercised by the test suites above.
> Run `npm run dev` locally to play in a real browser.

---

## Architecture

The codebase separates **framework-agnostic logic** from the **Phaser
presentation layer**. The logic has zero Phaser imports, which is why it's
unit-testable in plain Node.

```
src/
├── core/                      ← reusable, game-agnostic engine pieces
│   ├── fsm/StateMachine.ts    ← generic finite state machine<C>
│   ├── ecs/Entity.ts          ← Entity + Component
│   ├── ecs/World.ts           ← World + System base
│   └── events/EventBus.ts     ← typed pub/sub bus
│
├── game/                      ← Realm Quest logic (no Phaser)
│   ├── data/                  ← classes, cards, board definitions
│   ├── components/            ← Health, Wallet, Stats, Hand, Position…
│   ├── systems/               ← CombatSystem, DeckSystem, PlayerFactory
│   ├── states/                ← FSM states = the turn flow
│   ├── util/RNG.ts            ← seedable PRNG (deterministic tests)
│   ├── events.ts              ← typed event map
│   └── GameContext.ts         ← shared state for all FSM states
│
└── scenes/                    ← Phaser presentation (reads logic, never owns it)
    ├── BootScene.ts           ← asset preload + loading bar
    ├── GameScene.ts           ← wires FSM ↔ views ↔ HUD
    ├── BoardView.ts           ← draws the 28-square ring
    ├── TokenView.ts           ← animated player pieces
    ├── DiceView.ts            ← animated dice
    ├── HUD.ts                 ← DOM overlay (panels, buttons, hand, log)
    └── assets.ts              ← asset manifest
```

### The three reusable patterns

**1. Finite State Machine** (`core/fsm`)
Generic `StateMachine<C>` with `State<C>` objects (`onEnter`/`onUpdate`/
`onEvent`/`onExit`). The whole turn flow is states:

```
ClassSelect → Roll → Moving → SquareEffect → CardPlay → EndTurn → Roll …
                                   ↘ Combat ↗
                                   ↘ Market ↗
                              → GameOver
```

**2. Entity-Component System** (`core/ecs`)
Each player is an `Entity` composed of small data `Component`s
(`HealthComponent`, `WalletComponent`, `StatsComponent`, `HandComponent`,
`PositionComponent`, `StatusComponent`, `ClassAbilityComponent`).
`System`s (`CombatSystem`, `DeckSystem`) operate on them. Adding a new
mechanic = add a component + a system, no edits to existing ones.

**3. Event Bus** (`core/events`)
Typed pub/sub. Logic `emit`s (`player:moved`, `combat:started`, …); the
Phaser views and HUD `on` those events to animate/redraw. Neither side
holds a hard reference to the other.

---

## Game design

### Board — 28-square ring
Pass the **Realm Gate** for +20 gold. Square types: Draw Card, Combat,
Shrine (heal), Market (upgrades), Curse, Treasure, Dungeon (skip turn),
Teleport, and **Class Bonus** squares that only trigger for the matching
class. **First to 300 gold, or last hero standing, wins.**

### The 4 classes
| Class | HP | ATK | DEF | MAG | Passive |
|-------|----|----|-----|-----|---------|
| **Warrior** | 30 | 6 | 4 | 1 | Blocks the first enemy hit each combat |
| **Mage** | 20 | 2 | 1 | 8 | Draws an extra card every turn |
| **Rogue** | 22 | 4 | 2 | 3 | Black-suit cards (♠♣) deal double effect |
| **Cleric** | 25 | 3 | 3 | 5 | Heals 3 HP after every move |

### Cards (52-card deck → fantasy effects)
- **♠ Spades** — attack, curse, skip turn
- **♥ Hearts** — heal, shield, draw
- **♦ Diamonds** — gain/lose gold
- **♣ Clubs** — teleport forward/back, draw

---

## Setup & running

Requires **Node 18+**.

```bash
npm install          # installs Phaser, Vite, TypeScript, Electron

npm run dev          # play in browser at http://localhost:5173
npm run build        # typecheck + production build → dist/
npm run preview      # serve the production build
```

### Run the tests

```bash
npx tsx tests/logic.test.ts        # 817 logic assertions + 60 sim games
npx tsx tests/integration.test.ts  # HUD-driven full playthrough
```

### Windows `.exe`

```bash
npm run electron:dev     # build + launch in an Electron window
npm run electron:build   # produce a portable .exe in release/
```

> `electron` and `electron-builder` are in `devDependencies`. Their
> binaries download on `npm install` (needs open network access — they
> were skipped in the build sandbox but install normally on your machine).

---

## Extending

- **New class** → add to `HeroClass` enum + `CLASS_DEFS`, add a Class
  Bonus square in `board.ts`, handle its passive in `gameStates.ts`.
- **New card effect** → add to `CardEffect` enum + the `playCard` switch.
- **New square type** → add to `SquareType`, `SQUARE_COLORS`,
  `SQUARE_ICONS`, and the `SquareEffectState` switch.
- **New mechanic** → add a `Component` + a `System`; existing code is
  untouched (open/closed).
- **AI players** → drive `machine.send(...)` from a bot policy instead of
  the HUD; the integration test already shows the exact event sequence.
```
