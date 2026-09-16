import Phaser from 'phaser';

interface Point { x: number; y: number; }

function lineIntersect(p1: Point, p2: Point, p3: Point, p4: Point): Point {
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  const a = p1.x * p2.y - p1.y * p2.x;
  const b = p3.x * p4.y - p3.y * p4.x;
  return {
    x: (a * (p3.x - p4.x) - (p1.x - p2.x) * b) / denom,
    y: (a * (p3.y - p4.y) - (p1.y - p2.y) * b) / denom,
  };
}

function evenPositions(count: number, start: number, end: number): number[] {
  if (count <= 1) return [(start + end) / 2];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + i * step);
}

export interface LineDiagramColors {
  lineA: number;
  lineB: number;
  dotHundreds: number;
  dotTens: number;
  dotOnes: number;
}

/**
 * Draws the "stick multiplication" (Chinese/Japanese line) crossing-lines
 * illustration for a 2-digit × 2-digit example: `da` lines (tens of the
 * first number) then `ua` lines (its ones) run one direction, crossing `db`
 * then `ub` lines (tens/ones of the second number) the other way. Counting
 * intersection dots by group reproduces the standard multiplication place
 * values — that's the whole trick, made visible. Shared between
 * math-tricks-lab (which teaches it) and math-mastery (which reuses it as
 * a worked example before moving to full long multiplication).
 */
export function drawLineDiagram(
  scene: Phaser.Scene,
  x0: number,
  y0: number,
  w: number,
  h: number,
  digits: { da: number; ua: number; db: number; ub: number },
  colors: LineDiagramColors
): Phaser.GameObjects.Graphics {
  const { da, ua, db, ub } = digits;
  const g = scene.add.graphics();

  // Runs/rises are kept small relative to the box, and the start-position
  // spans leave room for them, so every line stays fully inside [x0, x0+w] /
  // [y0, y0+h] instead of running off the edge of the canvas.
  const runA = w * 0.14;
  const riseB = h * 0.14;

  const bottomXs = [
    ...evenPositions(da, x0 + w * 0.05, x0 + w * 0.32),
    ...evenPositions(ua, x0 + w * 0.46, x0 + w * 0.78),
  ];
  const topYs = [
    ...evenPositions(db, y0 + h * 0.05, y0 + h * 0.32),
    ...evenPositions(ub, y0 + h * 0.46, y0 + h * 0.78),
  ];

  const linesA = bottomXs.map((bx) => ({ p1: { x: bx, y: y0 + h }, p2: { x: bx + runA, y: y0 } }));
  const linesB = topYs.map((ty) => ({ p1: { x: x0, y: ty }, p2: { x: x0 + w, y: ty + riseB } }));

  g.lineStyle(2, colors.lineA, 0.8);
  linesA.forEach(({ p1, p2 }) => g.lineBetween(p1.x, p1.y, p2.x, p2.y));

  g.lineStyle(2, colors.lineB, 0.8);
  linesB.forEach(({ p1, p2 }) => g.lineBetween(p1.x, p1.y, p2.x, p2.y));

  linesA.forEach((lineA, i) => {
    linesB.forEach((lineB, j) => {
      const pt = lineIntersect(lineA.p1, lineA.p2, lineB.p1, lineB.p2);
      const inHundreds = i < da && j < db;
      const inOnes = i >= da && j >= db;
      const color = inHundreds ? colors.dotHundreds : inOnes ? colors.dotOnes : colors.dotTens;
      g.fillStyle(color, 1);
      g.fillCircle(pt.x, pt.y, 4.5);
    });
  });

  return g;
}
