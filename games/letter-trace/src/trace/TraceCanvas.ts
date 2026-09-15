// Freehand tracing over a translucent guide glyph, validated against a
// pixel mask of that same glyph — not hand-authored stroke paths. The
// guide is drawn once with the canvas text API (same approach as every
// other letter in this family, just rasterized instead of built from
// tiles), then an identical off-screen render at full opacity becomes the
// "is this pixel ink" lookup table for both live accuracy (is the point
// I'm drawing right now on the letter?) and coverage (how much of the
// letter's ink has actually been visited, so scribbling one spot over and
// over doesn't count as tracing the whole shape).
export class TraceCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private maskCanvas: HTMLCanvasElement;
  private maskCtx: CanvasRenderingContext2D;
  private dpr = window.devicePixelRatio || 1;
  private cssWidth = 0;
  private cssHeight = 0;

  private glyph = '';
  private font = '';
  private strokeColor: string;
  private missColor: string;
  private guideColor: string;

  private static readonly CELL_SIZE = 10; // CSS px
  private inkCells = new Set<string>();
  private visitedCells = new Set<string>();
  private samples = 0;
  private hits = 0;

  private drawing = false;
  private touching = false;
  private lastPoint: { x: number; y: number } | null = null;
  private lastSampledPoint: { x: number; y: number } | null = null;

  onStrokeEnd: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement, colors: { stroke: string; miss: string; guide: string }) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');
    this.ctx = ctx;
    this.strokeColor = colors.stroke;
    this.missColor = colors.miss;
    this.guideColor = colors.guide;

    this.maskCanvas = document.createElement('canvas'); // never attached to the DOM
    const maskCtx = this.maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!maskCtx) throw new Error('2D canvas context unavailable');
    this.maskCtx = maskCtx;

    this.bindEvents();
  }

  setGlyph(glyph: string, font: string): void {
    this.glyph = glyph;
    this.font = font;
    this.rebuild();
  }

  // Re-measures the canvas's actual on-screen box and rebuilds the guide +
  // mask at the matching resolution — call on mount and on resize/rotate.
  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.cssWidth = rect.width;
    this.cssHeight = rect.height;
    this.dpr = window.devicePixelRatio || 1;

    for (const c of [this.canvas, this.maskCanvas]) {
      c.width = Math.round(this.cssWidth * this.dpr);
      c.height = Math.round(this.cssHeight * this.dpr);
    }
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.maskCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.rebuild();
  }

  reset(): void {
    this.samples = 0;
    this.hits = 0;
    this.visitedCells.clear();
    this.drawGuide();
  }

  get accuracy(): number {
    if (this.samples === 0) return 0;
    return Math.round((this.hits / this.samples) * 100);
  }

  get coverage(): number {
    if (this.inkCells.size === 0) return 0;
    return Math.round((this.visitedCells.size / this.inkCells.size) * 100);
  }

  private rebuild(): void {
    if (!this.glyph || this.cssWidth === 0) return;
    this.drawGuide();
    this.buildMask();
    this.samples = 0;
    this.hits = 0;
    this.visitedCells.clear();
  }

  private drawGuide(): void {
    const { cssWidth: w, cssHeight: h } = this;
    this.ctx.clearRect(0, 0, w, h);
    this.ctx.save();
    this.ctx.globalAlpha = 0.22;
    this.ctx.fillStyle = this.guideColor;
    this.ctx.font = `${Math.floor(h * 0.62)}px ${this.font}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.glyph, w / 2, h / 2);
    this.ctx.restore();
  }

  private buildMask(): void {
    const { cssWidth: w, cssHeight: h } = this;
    this.maskCtx.clearRect(0, 0, w, h);
    this.maskCtx.save();
    this.maskCtx.fillStyle = '#000';
    this.maskCtx.font = `${Math.floor(h * 0.62)}px ${this.font}`;
    this.maskCtx.textAlign = 'center';
    this.maskCtx.textBaseline = 'middle';
    this.maskCtx.fillText(this.glyph, w / 2, h / 2);
    this.maskCtx.restore();

    this.inkCells.clear();
    const data = this.maskCtx.getImageData(0, 0, this.maskCanvas.width, this.maskCanvas.height).data;
    const cell = TraceCanvas.CELL_SIZE;
    for (let cy = 0; cy * cell < h; cy++) {
      for (let cx = 0; cx * cell < w; cx++) {
        const px = Math.min(Math.floor((cx * cell + cell / 2) * this.dpr), this.maskCanvas.width - 1);
        const py = Math.min(Math.floor((cy * cell + cell / 2) * this.dpr), this.maskCanvas.height - 1);
        const alpha = data[(py * this.maskCanvas.width + px) * 4 + 3];
        if (alpha > 128) this.inkCells.add(`${cx},${cy}`);
      }
    }
  }

  // Checking only the exact pixel under the cursor was too strict for a
  // finger or mouse — natural hand-wobble a few pixels off the guide's
  // centerline would count as a total miss even when it's visibly right
  // on the letter. This checks a small neighborhood instead: a hit if
  // *any* ink pixel falls within the tolerance radius.
  private static readonly HIT_RADIUS = 12; // CSS px

  private isInk(x: number, y: number): boolean {
    const r = TraceCanvas.HIT_RADIUS * this.dpr;
    const cx = x * this.dpr;
    const cy = y * this.dpr;
    const left = Math.max(0, Math.floor(cx - r));
    const top = Math.max(0, Math.floor(cy - r));
    const right = Math.min(this.maskCanvas.width, Math.ceil(cx + r));
    const bottom = Math.min(this.maskCanvas.height, Math.ceil(cy + r));
    const w = right - left;
    const h = bottom - top;
    if (w <= 0 || h <= 0) return false;

    const data = this.maskCtx.getImageData(left, top, w, h).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 128) return true;
    }
    return false;
  }

  // Marks every ink cell within the same hit-tolerance radius as visited,
  // not just the one exact cell under the point — a stroke passing near a
  // stretch of the letter should credit that whole stretch, consistent
  // with isInk()'s tolerance, not just the single 10px cell it happened
  // to be centered over.
  private markCell(x: number, y: number): void {
    const cell = TraceCanvas.CELL_SIZE;
    const r = Math.ceil(TraceCanvas.HIT_RADIUS / cell);
    const ccx = Math.floor(x / cell);
    const ccy = Math.floor(y / cell);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const key = `${ccx + dx},${ccy + dy}`;
        if (this.inkCells.has(key)) this.visitedCells.add(key);
      }
    }
  }

  private beginStroke(x: number, y: number): void {
    this.drawing = true;
    this.lastPoint = { x, y };
    this.lastSampledPoint = { x, y };
    this.samples++;
    if (this.isInk(x, y)) this.hits++;
    this.markCell(x, y);
  }

  private continueStroke(x: number, y: number): void {
    if (!this.drawing || !this.lastPoint) return;
    const hit = this.isInk(x, y);

    this.ctx.save();
    this.ctx.globalAlpha = 0.9;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = Math.max(8, this.cssWidth * 0.03);
    this.ctx.strokeStyle = hit ? this.strokeColor : this.missColor;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.restore();

    this.lastPoint = { x, y };

    // Throttle sampling — checking every single move event (which can fire
    // many times per pixel of movement) would make accuracy/coverage
    // oversensitive to how fast someone draws, not how well they trace.
    const last = this.lastSampledPoint;
    if (!last || Math.hypot(x - last.x, y - last.y) >= 4) {
      this.samples++;
      if (hit) this.hits++;
      this.markCell(x, y);
      this.lastSampledPoint = { x, y };
    }
  }

  private endStroke(): void {
    if (!this.drawing) return;
    this.drawing = false;
    this.lastPoint = null;
    this.onStrokeEnd?.();
  }

  private toCanvasPoint(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      if (this.touching) return;
      const p = this.toCanvasPoint(e.clientX, e.clientY);
      this.beginStroke(p.x, p.y);
    });
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.touching) return;
      const p = this.toCanvasPoint(e.clientX, e.clientY);
      this.continueStroke(p.x, p.y);
    });
    window.addEventListener('mouseup', () => {
      if (this.touching) return;
      this.endStroke();
    });

    this.canvas.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        this.touching = true;
        const t = e.touches[0];
        if (!t) return;
        const p = this.toCanvasPoint(t.clientX, t.clientY);
        this.beginStroke(p.x, p.y);
      },
      { passive: false }
    );
    this.canvas.addEventListener(
      'touchmove',
      (e) => {
        e.preventDefault();
        const t = e.touches[0];
        if (!t) return;
        const p = this.toCanvasPoint(t.clientX, t.clientY);
        this.continueStroke(p.x, p.y);
      },
      { passive: false }
    );
    this.canvas.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        this.endStroke();
        this.touching = false;
      },
      { passive: false }
    );
  }
}
