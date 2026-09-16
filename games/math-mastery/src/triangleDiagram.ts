import Phaser from 'phaser';

interface Vec { x: number; y: number; }

function sub(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y };
}

function normalize(v: Vec): Vec {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

export interface TriangleDiagramColors {
  edge: number;
  rightAngle: number;
  angleArc: number;
  opposite: string;
  adjacent: string;
  hypotenuse: string;
  angleLabel: string;
}

/**
 * Draws a labeled right triangle for teaching SOH-CAH-TOA: right angle at
 * the bottom-left, angle θ at the bottom-right, opposite/adjacent/hypotenuse
 * labeled on their respective sides.
 */
export function drawTriangleDiagram(
  scene: Phaser.Scene,
  x0: number,
  y0: number,
  w: number,
  h: number,
  colors: TriangleDiagramColors,
  fontFamily: string
): Phaser.GameObjects.Graphics {
  const A: Vec = { x: x0, y: y0 + h }; // right angle
  const B: Vec = { x: x0 + w * 0.72, y: y0 + h }; // angle theta
  const C: Vec = { x: x0, y: y0 }; // top

  const g = scene.add.graphics();
  g.lineStyle(3, colors.edge, 1);
  g.beginPath();
  g.moveTo(A.x, A.y);
  g.lineTo(B.x, B.y);
  g.lineTo(C.x, C.y);
  g.lineTo(A.x, A.y);
  g.strokePath();

  // Right-angle marker at A: a small square in the corner.
  const s = Math.min(w, h) * 0.07;
  g.lineStyle(2, colors.rightAngle, 1);
  g.strokeRect(A.x, A.y - s, s, s);

  // Angle arc at B, swept from BA toward BC (interpolating unit vectors
  // stays correct regardless of which quadrant the sides fall in).
  const dirBA = normalize(sub(A, B));
  const dirBC = normalize(sub(C, B));
  const radius = Math.min(w, h) * 0.16;
  const steps = 16;
  g.lineStyle(2, colors.angleArc, 1);
  g.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const dir = normalize({ x: dirBA.x + (dirBC.x - dirBA.x) * t, y: dirBA.y + (dirBC.y - dirBA.y) * t });
    const p = { x: B.x + dir.x * radius, y: B.y + dir.y * radius };
    if (i === 0) g.moveTo(p.x, p.y);
    else g.lineTo(p.x, p.y);
  }
  g.strokePath();

  scene.add.text(B.x - radius * 1.9, B.y - radius * 0.9, 'θ', {
    fontFamily,
    fontSize: '25px',
    fontStyle: 'bold',
    color: colors.angleLabel,
  }).setOrigin(0.5);

  scene.add.text((A.x + B.x) / 2, A.y + 24, 'Adjacent', {
    fontFamily,
    fontSize: '18px',
    color: colors.adjacent,
  }).setOrigin(0.5, 0);

  scene.add.text(A.x - 16, (A.y + C.y) / 2, 'Opposite', {
    fontFamily,
    fontSize: '18px',
    color: colors.opposite,
  }).setOrigin(1, 0.5);

  scene.add.text((B.x + C.x) / 2 + 16, (B.y + C.y) / 2, 'Hypotenuse', {
    fontFamily,
    fontSize: '18px',
    color: colors.hypotenuse,
  }).setOrigin(0, 0.5);

  return g;
}
