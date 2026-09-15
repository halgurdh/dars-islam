import { ARABIC_LETTERS, ENGLISH_LETTERS, TraceLetter } from '../data/letters';
import { arabicProgress, englishProgress } from '../systems/Progress';
import { sfx } from '../systems/Sfx';
import { getLang, toggleLang, detectDefaultLang } from '../systems/Locale';
import { PlayerProgress } from '@shared/player-progress';
import { ProgressBar } from '@shared/progress-bar';
import { t } from '../i18n';
import { TraceCanvas } from './TraceCanvas';

const progressBar = new ProgressBar();

type AlphabetKey = 'arabic' | 'english';

const ARABIC_FONT = "'Noto Naskh Arabic', 'Scheherazade New', 'Traditional Arabic', 'Segoe UI', sans-serif";
const ENGLISH_FONT = "'Arial Black', 'Arial', 'Segoe UI', sans-serif";

// A round is solved once the trace covers most of the glyph's ink and
// mostly stays on it — generous enough that normal hand-wobble doesn't
// fail someone, strict enough that scribbling once across the canvas
// doesn't pass.
const COVERAGE_THRESHOLD = 45;
const ACCURACY_THRESHOLD = 40;
const ITEM_SOLVED_DELAY_MS = 1300;
const AUTO_ADVANCE_MS = 2200;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function el<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing #${id}`);
  return found as T;
}

export class TraceApp {
  private alphabet: AlphabetKey = 'arabic';
  private roundQueue: TraceLetter[] = [];
  private currentIndex = 0;
  private currentItem!: TraceLetter;
  private itemsTracedThisRound = 0;
  private autoAdvanceTimer: number | null = null;
  private trace!: TraceCanvas;

  private views = {
    menu: el<HTMLDivElement>('menu-view'),
    trace: el<HTMLDivElement>('trace-view'),
    complete: el<HTMLDivElement>('complete-view'),
  };

  private menuEls = {
    title: el<HTMLHeadingElement>('menu-title'),
    tagline: el<HTMLParagraphElement>('menu-tagline'),
    progress: el<HTMLParagraphElement>('menu-progress'),
    arabicBtn: el<HTMLButtonElement>('alpha-arabic-btn'),
    englishBtn: el<HTMLButtonElement>('alpha-english-btn'),
    startBtn: el<HTMLButtonElement>('start-btn'),
    langBtn: el<HTMLButtonElement>('lang-toggle-btn'),
    muteBtn: el<HTMLButtonElement>('mute-toggle-btn'),
    footer: el<HTMLParagraphElement>('menu-footer'),
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
    resetBtn: el<HTMLButtonElement>('reset-btn'),
  };

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
    this.bindTrace();
    this.bindComplete();
    this.renderMenu();
  }

  private progressFor(alphabet: AlphabetKey) {
    return alphabet === 'arabic' ? arabicProgress : englishProgress;
  }

  private dataFor(alphabet: AlphabetKey): TraceLetter[] {
    return alphabet === 'arabic' ? ARABIC_LETTERS : ENGLISH_LETTERS;
  }

  private fontFor(alphabet: AlphabetKey): string {
    return alphabet === 'arabic' ? ARABIC_FONT : ENGLISH_FONT;
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

  private renderMenu(): void {
    if (this.autoAdvanceTimer !== null) {
      window.clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    this.views.menu.hidden = false;
    this.views.trace.hidden = true;
    this.views.complete.hidden = true;

    this.menuEls.title.textContent = t().subtitle;
    this.menuEls.tagline.textContent = t().tagline;
    this.menuEls.arabicBtn.textContent = t().alphabetArabic;
    this.menuEls.englishBtn.textContent = t().alphabetEnglish;
    this.menuEls.startBtn.textContent = t().start;
    this.menuEls.langBtn.textContent = t().langToggle;
    this.menuEls.muteBtn.textContent = sfx.isMuted() ? t().soundOff : t().soundOn;
    this.menuEls.footer.textContent = t().footer;

    this.menuEls.arabicBtn.classList.toggle('selected', this.alphabet === 'arabic');
    this.menuEls.englishBtn.classList.toggle('selected', this.alphabet === 'english');

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
      this.updateStats();
    });
  }

  private startRound(): void {
    const items = this.dataFor(this.alphabet);
    const progress = this.progressFor(this.alphabet);
    const unlearned = items.filter((i) => !progress.has(i.id));
    const learned = items.filter((i) => progress.has(i.id));
    this.roundQueue = shuffle([...shuffle(unlearned), ...shuffle(learned)]);
    this.itemsTracedThisRound = 0;

    this.views.menu.hidden = true;
    this.views.trace.hidden = false;
    this.views.complete.hidden = true;
    this.traceEls.muteBtn.textContent = sfx.isMuted() ? '🔇' : '🔈';

    this.trace.resize();
    this.loadItem(0);
  }

  private loadItem(index: number): void {
    if (index >= this.roundQueue.length) {
      this.showComplete();
      return;
    }
    this.currentIndex = index;
    this.currentItem = this.roundQueue[index];

    this.traceEls.clueLabel.textContent = this.currentItem.label;
    this.traceEls.completionBadge.hidden = true;
    this.trace.setGlyph(this.currentItem.glyph, this.fontFor(this.alphabet));
    this.updateStats();
    this.refreshHearBtn();
  }

  private onStrokeEnd(): void {
    this.updateStats();
    if (this.trace.coverage >= COVERAGE_THRESHOLD && this.trace.accuracy >= ACCURACY_THRESHOLD) {
      this.onItemSolved();
    }
  }

  private onItemSolved(): void {
    sfx.solved();
    this.progressFor(this.alphabet).markLearned([this.currentItem.id]);
    this.itemsTracedThisRound++;
    this.traceEls.completionBadge.hidden = false;
    window.setTimeout(() => this.loadItem(this.currentIndex + 1), ITEM_SOLVED_DELAY_MS);
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

  private showComplete(): void {
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
}
