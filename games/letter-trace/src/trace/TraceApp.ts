import { ARABIC_LETTERS, ENGLISH_LETTERS, NUMBER_LETTERS, TraceLetter } from '../data/letters';
import { arabicProgress, englishProgress, numbersProgress } from '../systems/Progress';
import { sfx } from '../systems/Sfx';
import { getLang, toggleLang, detectDefaultLang } from '../systems/Locale';
import { PlayerProgress } from '@shared/player-progress';
import { ProgressBar } from '@shared/progress-bar';
import { t } from '../i18n';
import { TraceCanvas } from './TraceCanvas';

const progressBar = new ProgressBar();

type AlphabetKey = 'arabic' | 'english' | 'numbers';

const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
const ENGLISH_FONT = "'Arial Black', 'Arial', 'Segoe UI', sans-serif";
const NUMBER_FONT = "'Arial Black', 'Arial', 'Segoe UI', sans-serif";

// A round is solved once the trace covers most of the glyph's ink and
// mostly stays on it — generous enough that normal hand-wobble doesn't
// fail someone, strict enough that scribbling once across the canvas
// doesn't pass. Checked only when the learner taps Confirm (not after every
// single stroke) so multi-stroke glyphs — "X", "T", the dot on "ب"/"ن" — get
// a chance to draw every stroke before being judged; one diagonal of an "X"
// alone often already covers ~50% of the ink, so checking mid-trace would
// mark it solved before the second stroke ever happens.
const COVERAGE_THRESHOLD = 45;
const ACCURACY_THRESHOLD = 40;
const AUTO_ADVANCE_MS = 2200;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Splits the alphabet (already stored in its natural/correct order) into
// Sequence-mode rounds. A trailing remainder under half a chunk is folded
// into the previous chunk instead of shipping a 1-2 item "round".
function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  if (chunks.length > 1 && chunks[chunks.length - 1].length < size / 2) {
    const last = chunks.pop()!;
    chunks[chunks.length - 1].push(...last);
  }
  return chunks;
}

type MatchCard = { id: number; kind: 'glyph' | 'label'; text: string };

function el<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing #${id}`);
  return found as T;
}

export class TraceApp {
  private mode: 'trace' | 'match' | 'sequence' = 'trace';
  private alphabet: AlphabetKey = 'arabic';
  private roundQueue: TraceLetter[] = [];
  private currentIndex = 0;
  private currentItem!: TraceLetter;
  private itemsTracedThisRound = 0;
  private autoAdvanceTimer: number | null = null;
  private trace!: TraceCanvas;

  private matchItems: TraceLetter[] = [];
  private matchCards: MatchCard[] = [];
  private matchFlipped: number[] = [];
  private matchWrongIndices: number[] = [];
  private matchMatchedIds = new Set<number>();
  private matchMoves = 0;
  private matchLocked = false;

  private sequenceChunks: TraceLetter[][] = [];
  private sequenceChunkIndex = 0;
  private sequencePool: TraceLetter[] = [];
  private sequencePlaced: TraceLetter[] = [];
  private sequenceMistakes = 0;
  private sequenceMistakesTotal = 0;
  private sequenceTotalItems = 0;

  private views = {
    menu: el<HTMLDivElement>('menu-view'),
    trace: el<HTMLDivElement>('trace-view'),
    match: el<HTMLDivElement>('match-view'),
    sequence: el<HTMLDivElement>('sequence-view'),
    complete: el<HTMLDivElement>('complete-view'),
  };

  private modeEls = {
    traceBtn: el<HTMLButtonElement>('mode-trace-btn'),
    matchBtn: el<HTMLButtonElement>('mode-match-btn'),
    sequenceBtn: el<HTMLButtonElement>('mode-sequence-btn'),
  };

  private menuEls = {
    title: el<HTMLHeadingElement>('menu-title'),
    tagline: el<HTMLParagraphElement>('menu-tagline'),
    progress: el<HTMLParagraphElement>('menu-progress'),
    arabicBtn: el<HTMLButtonElement>('alpha-arabic-btn'),
    englishBtn: el<HTMLButtonElement>('alpha-english-btn'),
    numbersBtn: el<HTMLButtonElement>('alpha-numbers-btn'),
    startBtn: el<HTMLButtonElement>('start-btn'),
    langBtn: el<HTMLButtonElement>('lang-toggle-btn'),
    muteBtn: el<HTMLButtonElement>('mute-toggle-btn'),
    footer: el<HTMLParagraphElement>('menu-footer'),
  };

  private matchEls = {
    menuBtn: el<HTMLButtonElement>('match-menu-btn'),
    muteBtn: el<HTMLButtonElement>('match-mute-btn'),
    movesLabel: el<HTMLDivElement>('match-moves-label'),
    grid: el<HTMLDivElement>('match-grid'),
  };

  private sequenceEls = {
    menuBtn: el<HTMLButtonElement>('sequence-menu-btn'),
    roundLabel: el<HTMLDivElement>('sequence-round-label'),
    mistakesLabel: el<HTMLButtonElement>('sequence-mistakes-label'),
    instruction: el<HTMLParagraphElement>('sequence-instruction'),
    placed: el<HTMLParagraphElement>('sequence-placed'),
    pool: el<HTMLDivElement>('sequence-pool'),
  };

  private traceEls = {
    menuBtn: el<HTMLButtonElement>('trace-menu-btn'),
    muteBtn: el<HTMLButtonElement>('trace-mute-btn'),
    clueLabel: el<HTMLDivElement>('clue-label'),
    accuracyLabel: el<HTMLSpanElement>('accuracy-label'),
    coverageLabel: el<HTMLSpanElement>('coverage-label'),
    hearBtn: el<HTMLButtonElement>('hear-btn'),
    canvas: el<HTMLCanvasElement>('trace-canvas'),
    completionBadge: el<HTMLDivElement>('completion-badge'),
    confirmBtn: el<HTMLButtonElement>('confirm-btn'),
    resetBtn: el<HTMLButtonElement>('reset-btn'),
  };

  // Confirm doubles as Next once an item is solved, rather than adding a
  // second button — one tap target, its meaning just changes.
  private itemSolved = false;

  private completeEls = {
    title: el<HTMLHeadingElement>('complete-title'),
    summary: el<HTMLParagraphElement>('complete-summary'),
    hint: el<HTMLParagraphElement>('complete-hint'),
    menuBtn: el<HTMLButtonElement>('complete-menu-btn'),
  };

  constructor() {
    this.trace = new TraceCanvas(this.traceEls.canvas, {
      stroke: '#4fd98a',
      miss: '#e0757c',
      guide: '#7c93e0',
    });
    this.trace.onStrokeEnd = () => this.onStrokeEnd();

    window.addEventListener('resize', () => {
      if (!this.views.trace.hidden) this.trace.resize();
    });

    this.bindMenu();
    this.bindModeSelector();
    this.bindTrace();
    this.bindMatch();
    this.bindSequence();
    this.bindComplete();
    this.renderMenu();
  }

  private progressFor(alphabet: AlphabetKey) {
    if (alphabet === 'arabic') return arabicProgress;
    if (alphabet === 'numbers') return numbersProgress;
    return englishProgress;
  }

  private dataFor(alphabet: AlphabetKey): TraceLetter[] {
    if (alphabet === 'arabic') return ARABIC_LETTERS;
    if (alphabet === 'numbers') return NUMBER_LETTERS;
    return ENGLISH_LETTERS;
  }

  private fontFor(alphabet: AlphabetKey): string {
    if (alphabet === 'arabic') return ARABIC_FONT;
    if (alphabet === 'numbers') return NUMBER_FONT;
    return ENGLISH_FONT;
  }

  private speechLangFor(alphabet: AlphabetKey): string {
    return alphabet === 'arabic' ? 'ar-SA' : 'en-US';
  }

  // ---- Menu ----

  private bindMenu(): void {
    const langBefore = getLang();
    void detectDefaultLang().then(() => {
      if (getLang() !== langBefore) this.renderMenu();
    });

    this.menuEls.arabicBtn.addEventListener('click', () => {
      this.alphabet = 'arabic';
      sfx.tap();
      this.renderMenu();
    });
    this.menuEls.englishBtn.addEventListener('click', () => {
      this.alphabet = 'english';
      sfx.tap();
      this.renderMenu();
    });
    this.menuEls.numbersBtn.addEventListener('click', () => {
      this.alphabet = 'numbers';
      sfx.tap();
      this.renderMenu();
    });
    this.menuEls.startBtn.addEventListener('click', () => {
      sfx.tap();
      this.startRound();
    });
    this.menuEls.langBtn.addEventListener('click', () => {
      toggleLang();
      sfx.tap();
      this.renderMenu();
    });
    this.menuEls.muteBtn.addEventListener('click', () => {
      const muted = sfx.toggleMuted();
      this.menuEls.muteBtn.textContent = muted ? t().soundOff : t().soundOn;
    });
  }

  private bindModeSelector(): void {
    this.modeEls.traceBtn.addEventListener('click', () => {
      this.mode = 'trace';
      sfx.tap();
      this.renderMenu();
    });
    this.modeEls.matchBtn.addEventListener('click', () => {
      this.mode = 'match';
      sfx.tap();
      this.renderMenu();
    });
    this.modeEls.sequenceBtn.addEventListener('click', () => {
      this.mode = 'sequence';
      sfx.tap();
      this.renderMenu();
    });
  }

  private renderMenu(): void {
    if (this.autoAdvanceTimer !== null) {
      window.clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    this.views.menu.hidden = false;
    this.views.trace.hidden = true;
    this.views.match.hidden = true;
    this.views.sequence.hidden = true;
    this.views.complete.hidden = true;

    this.menuEls.title.textContent = t().subtitle;
    this.menuEls.tagline.textContent = t().tagline;
    this.menuEls.arabicBtn.textContent = t().alphabetArabic;
    this.menuEls.englishBtn.textContent = t().alphabetEnglish;
    this.menuEls.numbersBtn.textContent = t().alphabetNumbers;
    this.menuEls.startBtn.textContent = t().start;
    this.menuEls.langBtn.textContent = t().langToggle;
    this.menuEls.muteBtn.textContent = sfx.isMuted() ? t().soundOff : t().soundOn;
    this.menuEls.footer.textContent = t().footer;

    this.menuEls.arabicBtn.classList.toggle('selected', this.alphabet === 'arabic');
    this.menuEls.englishBtn.classList.toggle('selected', this.alphabet === 'english');
    this.menuEls.numbersBtn.classList.toggle('selected', this.alphabet === 'numbers');

    this.modeEls.traceBtn.textContent = t().modeTrace;
    this.modeEls.matchBtn.textContent = t().modeMatch;
    this.modeEls.sequenceBtn.textContent = t().modeSequence;
    this.modeEls.traceBtn.classList.toggle('selected', this.mode === 'trace');
    this.modeEls.matchBtn.classList.toggle('selected', this.mode === 'match');
    this.modeEls.sequenceBtn.classList.toggle('selected', this.mode === 'sequence');

    const progress = this.progressFor(this.alphabet);
    const total = this.dataFor(this.alphabet).length;
    this.menuEls.progress.textContent = t().itemsLearned(progress.count(), total);
  }

  // ---- Trace ----

  private bindTrace(): void {
    this.traceEls.menuBtn.addEventListener('click', () => this.renderMenu());
    this.traceEls.muteBtn.addEventListener('click', () => {
      const muted = sfx.toggleMuted();
      this.traceEls.muteBtn.textContent = muted ? '🔇' : '🔈';
      this.refreshHearBtn();
    });
    this.traceEls.hearBtn.addEventListener('click', () => void this.speakCurrent());
    this.traceEls.resetBtn.addEventListener('click', () => {
      sfx.tap();
      this.trace.reset();
      this.itemSolved = false;
      this.traceEls.completionBadge.hidden = true;
      this.traceEls.confirmBtn.textContent = t().confirm;
      this.updateStats();
    });
    this.traceEls.confirmBtn.addEventListener('click', () => {
      if (this.itemSolved) {
        this.loadItem(this.currentIndex + 1);
      } else {
        this.checkSolution();
      }
    });
  }

  private startRound(): void {
    if (this.mode === 'match') {
      this.startMatchRound();
      return;
    }
    if (this.mode === 'sequence') {
      this.startSequenceRound();
      return;
    }
    this.startTraceRound();
  }

  private startTraceRound(): void {
    const items = this.dataFor(this.alphabet);
    const progress = this.progressFor(this.alphabet);
    const unlearned = items.filter((i) => !progress.has(i.id));
    const learned = items.filter((i) => progress.has(i.id));
    this.roundQueue = shuffle([...shuffle(unlearned), ...shuffle(learned)]);
    this.itemsTracedThisRound = 0;

    this.views.menu.hidden = true;
    this.views.trace.hidden = false;
    this.views.match.hidden = true;
    this.views.sequence.hidden = true;
    this.views.complete.hidden = true;
    this.traceEls.muteBtn.textContent = sfx.isMuted() ? '🔇' : '🔈';

    this.trace.resize();
    this.loadItem(0);
  }

  private loadItem(index: number): void {
    if (index >= this.roundQueue.length) {
      this.showTraceComplete();
      return;
    }
    this.currentIndex = index;
    this.currentItem = this.roundQueue[index];

    this.itemSolved = false;
    this.traceEls.clueLabel.textContent = this.currentItem.label;
    this.traceEls.completionBadge.hidden = true;
    this.traceEls.confirmBtn.textContent = t().confirm;
    this.trace.setGlyph(this.currentItem.glyph, this.fontFor(this.alphabet));
    this.updateStats();
    this.refreshHearBtn();
  }

  private onStrokeEnd(): void {
    this.updateStats();
  }

  // Only runs when the learner taps Confirm — see the threshold comment
  // above for why this isn't automatic after every stroke.
  private checkSolution(): void {
    sfx.tap();
    if (this.trace.coverage >= COVERAGE_THRESHOLD && this.trace.accuracy >= ACCURACY_THRESHOLD) {
      this.onItemSolved();
    } else {
      this.nudgeIncomplete();
    }
  }

  // A short shake on the clue label — "not yet, keep going" — rather than
  // silently doing nothing, which would look like the tap didn't register.
  private nudgeIncomplete(): void {
    const label = this.traceEls.clueLabel;
    label.classList.remove('nudge');
    // Reflow forces the animation to restart if it's still mid-shake from a
    // rapid repeat tap, instead of the class no-op'ing on an unchanged value.
    void label.offsetWidth;
    label.classList.add('nudge');
  }

  private onItemSolved(): void {
    sfx.solved();
    this.itemSolved = true;
    this.progressFor(this.alphabet).markLearned([this.currentItem.id]);
    this.itemsTracedThisRound++;
    this.traceEls.completionBadge.hidden = false;
    this.traceEls.confirmBtn.textContent = t().next;
  }

  private updateStats(): void {
    this.traceEls.accuracyLabel.textContent = t().accuracy(this.trace.accuracy);
    this.traceEls.coverageLabel.textContent = t().coverage(this.trace.coverage);
  }

  private refreshHearBtn(): void {
    const lang = this.speechLangFor(this.alphabet);
    this.traceEls.hearBtn.style.opacity = sfx.hasVoice(lang) ? '1' : '0.35';
    this.traceEls.hearBtn.textContent = t().hear;
  }

  private async speakCurrent(): Promise<void> {
    if (!this.currentItem) return;
    const lang = this.speechLangFor(this.alphabet);
    if (await sfx.needsDownload(lang)) {
      this.traceEls.hearBtn.textContent = '⏳ …';
    }
    await sfx.speak(this.currentItem.speak, lang);
    this.traceEls.hearBtn.textContent = t().hear;
  }

  // ---- Complete ----

  private bindComplete(): void {
    this.completeEls.menuBtn.addEventListener('click', () => this.renderMenu());
  }

  private showTraceComplete(): void {
    sfx.complete();
    this.views.trace.hidden = true;
    this.views.complete.hidden = false;
    progressBar.showCompletionToast(PlayerProgress.recordCompletion({
      gameId: 'letter-trace',
      itemsCompleted: this.itemsTracedThisRound,
    }));

    const total = this.progressFor(this.alphabet).count();
    this.completeEls.title.textContent = t().wellDone;
    this.completeEls.summary.textContent = t().roundSummary(this.itemsTracedThisRound, total);
    this.completeEls.hint.textContent = t().nextLevelHint;
    this.completeEls.menuBtn.textContent = t().menu;

    // Same "the round IS the confirmation, it advances on its own" pattern
    // as every other game in this family — Menu is the one manual way out.
    this.autoAdvanceTimer = window.setTimeout(() => this.startRound(), AUTO_ADVANCE_MS);
  }

  // ---- Match ----

  private bindMatch(): void {
    this.matchEls.menuBtn.addEventListener('click', () => this.renderMenu());
    this.matchEls.muteBtn.addEventListener('click', () => {
      const muted = sfx.toggleMuted();
      this.matchEls.muteBtn.textContent = muted ? '🔇' : '🔈';
    });
  }

  private startMatchRound(): void {
    const items = this.dataFor(this.alphabet);
    const pairsCount = Math.min(6, items.length);
    this.matchItems = shuffle(items).slice(0, pairsCount);
    this.matchCards = shuffle(
      this.matchItems.flatMap((item) => [
        { id: item.id, kind: 'glyph' as const, text: item.glyph },
        { id: item.id, kind: 'label' as const, text: item.label },
      ]),
    );
    this.matchMatchedIds = new Set();
    this.matchFlipped = [];
    this.matchWrongIndices = [];
    this.matchMoves = 0;
    this.matchLocked = false;

    this.views.menu.hidden = true;
    this.views.trace.hidden = true;
    this.views.match.hidden = false;
    this.views.sequence.hidden = true;
    this.views.complete.hidden = true;
    this.matchEls.muteBtn.textContent = sfx.isMuted() ? '🔇' : '🔈';

    this.updateMatchHud();
    this.renderMatchGrid();
  }

  private updateMatchHud(): void {
    this.matchEls.movesLabel.textContent = t().matchMoves(this.matchMoves);
  }

  private renderMatchGrid(): void {
    this.matchEls.grid.innerHTML = '';
    this.matchCards.forEach((card, idx) => {
      const btn = document.createElement('button');
      btn.className = 'match-tile';
      const isMatched = this.matchMatchedIds.has(card.id);
      const isFlipped = isMatched || this.matchFlipped.includes(idx);
      btn.textContent = isFlipped ? card.text : '?';
      if (isFlipped) btn.classList.add('flipped');
      if (isMatched) btn.classList.add('matched');
      if (this.matchWrongIndices.includes(idx)) btn.classList.add('wrong');
      btn.addEventListener('click', () => this.onMatchTileClick(idx));
      this.matchEls.grid.appendChild(btn);
    });
  }

  private onMatchTileClick(idx: number): void {
    if (this.matchLocked) return;
    if (this.matchFlipped.includes(idx)) return;
    if (this.matchMatchedIds.has(this.matchCards[idx].id)) return;

    sfx.tap();
    this.matchFlipped.push(idx);
    this.renderMatchGrid();
    if (this.matchFlipped.length < 2) return;

    this.matchMoves++;
    this.updateMatchHud();
    const [a, b] = this.matchFlipped;
    const cardA = this.matchCards[a];
    const cardB = this.matchCards[b];

    if (cardA.id === cardB.id) {
      this.matchMatchedIds.add(cardA.id);
      sfx.solved();
      this.matchFlipped = [];
      this.renderMatchGrid();
      if (this.matchMatchedIds.size === this.matchItems.length) {
        window.setTimeout(() => this.showMatchComplete(), 400);
      }
    } else {
      this.matchLocked = true;
      this.matchWrongIndices = [a, b];
      this.renderMatchGrid();
      window.setTimeout(() => {
        this.matchWrongIndices = [];
        this.matchFlipped = [];
        this.matchLocked = false;
        this.renderMatchGrid();
      }, 700);
    }
  }

  private showMatchComplete(): void {
    sfx.complete();
    this.views.match.hidden = true;
    this.views.complete.hidden = false;
    progressBar.showCompletionToast(PlayerProgress.recordCompletion({
      gameId: 'letter-trace',
      itemsCompleted: this.matchItems.length,
    }));
    this.progressFor(this.alphabet).markLearned(this.matchItems.map((i) => i.id));

    this.completeEls.title.textContent = t().wellDone;
    this.completeEls.summary.textContent = t().matchRoundSummary(this.matchItems.length, this.matchMoves);
    this.completeEls.hint.textContent = '';
    this.completeEls.menuBtn.textContent = t().menu;

    this.autoAdvanceTimer = window.setTimeout(() => this.startRound(), AUTO_ADVANCE_MS);
  }

  // ---- Sequence ----

  private bindSequence(): void {
    this.sequenceEls.menuBtn.addEventListener('click', () => this.renderMenu());
  }

  private startSequenceRound(): void {
    const items = this.dataFor(this.alphabet);
    this.sequenceChunks = chunk(items, 5);
    this.sequenceChunkIndex = 0;
    this.sequenceMistakesTotal = 0;
    this.sequenceTotalItems = items.length;

    this.views.menu.hidden = true;
    this.views.trace.hidden = true;
    this.views.match.hidden = true;
    this.views.sequence.hidden = false;
    this.views.complete.hidden = true;

    this.loadSequenceChunk();
  }

  private loadSequenceChunk(): void {
    if (this.sequenceChunkIndex >= this.sequenceChunks.length) {
      this.showSequenceComplete();
      return;
    }
    const currentChunk = this.sequenceChunks[this.sequenceChunkIndex];
    this.sequencePlaced = [];
    this.sequenceMistakes = 0;
    this.sequencePool = shuffle(currentChunk);

    this.sequenceEls.roundLabel.textContent = t().sequenceRound(this.sequenceChunkIndex + 1, this.sequenceChunks.length);
    this.sequenceEls.mistakesLabel.textContent = t().sequenceMistakes(this.sequenceMistakes);
    this.sequenceEls.instruction.textContent = t().sequenceInstruction;

    this.renderSequence();
  }

  private renderSequence(): void {
    this.sequenceEls.placed.textContent = this.sequencePlaced.map((i) => i.glyph).join('   ') || ' ';

    this.sequenceEls.pool.innerHTML = '';
    this.sequencePool.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'sequence-card';
      btn.textContent = `${item.glyph}   ${item.label}`;
      btn.addEventListener('click', () => this.onSequenceTap(item));
      this.sequenceEls.pool.appendChild(btn);
    });
  }

  private onSequenceTap(item: TraceLetter): void {
    const currentChunk = this.sequenceChunks[this.sequenceChunkIndex];
    const expected = currentChunk[this.sequencePlaced.length];

    if (item.id === expected.id) {
      sfx.tap();
      this.sequencePlaced.push(item);
      this.sequencePool = this.sequencePool.filter((i) => i.id !== item.id);

      if (this.sequencePlaced.length === currentChunk.length) {
        sfx.solved();
        this.progressFor(this.alphabet).markLearned(currentChunk.map((i) => i.id));
        this.sequenceChunkIndex++;
        window.setTimeout(() => this.loadSequenceChunk(), 500);
        return;
      }
      this.renderSequence();
    } else {
      this.sequenceMistakes++;
      this.sequenceMistakesTotal++;
      this.sequenceEls.mistakesLabel.textContent = t().sequenceMistakes(this.sequenceMistakes);
      this.nudgeSequence();
    }
  }

  private nudgeSequence(): void {
    const label = this.sequenceEls.placed;
    label.classList.remove('nudge');
    void label.offsetWidth;
    label.classList.add('nudge');
  }

  private showSequenceComplete(): void {
    sfx.complete();
    this.views.sequence.hidden = true;
    this.views.complete.hidden = false;
    progressBar.showCompletionToast(PlayerProgress.recordCompletion({
      gameId: 'letter-trace',
      itemsCompleted: this.sequenceTotalItems,
    }));

    const perfect = Math.max(0, this.sequenceTotalItems - this.sequenceMistakesTotal);
    this.completeEls.title.textContent = t().wellDone;
    this.completeEls.summary.textContent = t().sequenceRoundSummary(perfect, this.sequenceTotalItems);
    this.completeEls.hint.textContent = '';
    this.completeEls.menuBtn.textContent = t().menu;

    this.autoAdvanceTimer = window.setTimeout(() => this.startRound(), AUTO_ADVANCE_MS);
  }
}
