import * as pc from 'playcanvas';
import type { CarBodyMesh } from '../pipeline/ManifoldCarPipeline';
import type { BumperStyle, CarConfig, HoodStyle, SpoilerStyle } from '../types';

// ---------------------------------------------------------------------------
// Colour helpers
// ---------------------------------------------------------------------------

function fromHex(hex: number): pc.Color {
  return new pc.Color(
    ((hex >> 16) & 255) / 255,
    ((hex >> 8) & 255) / 255,
    (hex & 255) / 255,
  );
}

function darken(c: pc.Color, t: number): pc.Color {
  return new pc.Color(c.r * t, c.g * t, c.b * t);
}

// ---------------------------------------------------------------------------
// Material factories
// ---------------------------------------------------------------------------

function bodyMat(diffuse: pc.Color, metalness = 0.32, roughness = 0.28): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = diffuse.clone();
  m.useMetalness = true;
  m.metalness = metalness;
  m.gloss = 1 - roughness;
  m.update();
  return m;
}

function glowMat(diffuse: pc.Color, emissive: pc.Color, intensity = 2.5): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = diffuse.clone();
  m.emissive = emissive.clone();
  m.emissiveIntensity = intensity;
  m.useLighting = false;
  m.update();
  return m;
}

function glassMat(tint: pc.Color): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = tint.clone();
  m.useMetalness = true;
  m.metalness = 0;
  m.gloss = 0.9;
  m.opacity = 0.32;
  m.blendType = pc.BLEND_NORMAL;
  m.depthWrite = false;
  m.update();
  return m;
}

function outlineMat(color: pc.Color): pc.StandardMaterial {
  const m = new pc.StandardMaterial();
  m.diffuse = color.clone();
  m.useLighting = false;
  m.cull = pc.CULLFACE_FRONT;
  m.update();
  return m;
}

// ---------------------------------------------------------------------------
// Entity builders
// ---------------------------------------------------------------------------

function addBox(
  parent: pc.Entity,
  name: string,
  x: number, y: number, z: number,
  sx: number, sy: number, sz: number,
  mat: pc.StandardMaterial,
  cast = true,
): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'box', material: mat, castShadows: cast, receiveShadows: false });
  e.setLocalPosition(x, y, z);
  e.setLocalScale(sx, sy, sz);
  parent.addChild(e);
  return e;
}

function addCylinder(
  parent: pc.Entity,
  name: string,
  x: number, y: number, z: number,
  rx: number, ry: number, rz: number,
  eulerX: number, eulerY: number, eulerZ: number,
  mat: pc.StandardMaterial,
  cast = true,
): pc.Entity {
  const e = new pc.Entity(name);
  e.addComponent('render', { type: 'cylinder', material: mat, castShadows: cast, receiveShadows: false });
  e.setLocalPosition(x, y, z);
  e.setLocalScale(rx, ry, rz);
  e.setLocalEulerAngles(eulerX, eulerY, eulerZ);
  parent.addChild(e);
  return e;
}

// ---------------------------------------------------------------------------
// Car mesh entity builder result
// ---------------------------------------------------------------------------

export interface CarMeshResult {
  root: pc.Entity;
  wheels: pc.Entity[];        // spin-axes — call rotateLocal(deg, 0, 0) each frame
  bumperGroup: pc.Entity;
  hoodGroup: pc.Entity;
  spoilerGroup: pc.Entity;
}

// ---------------------------------------------------------------------------
// Build the body mesh entity from the Manifold-generated mesh data
// ---------------------------------------------------------------------------

function buildBodyMeshEntity(
  device: pc.GraphicsDevice,
  bodyData: CarBodyMesh,
  mat: pc.StandardMaterial,
  name: string,
): pc.Entity {
  const mesh = new pc.Mesh(device);
  mesh.setPositions(Array.from(bodyData.positions));
  mesh.setNormals(Array.from(bodyData.normals));
  mesh.setIndices(Array.from(bodyData.indices));
  mesh.update(pc.PRIMITIVE_TRIANGLES);

  const entity = new pc.Entity(name);
  entity.addComponent('render', {
    meshInstances: [new pc.MeshInstance(mesh, mat)],
    castShadows: true,
    receiveShadows: false,
  });
  return entity;
}

// ---------------------------------------------------------------------------
// Inverted-hull outline entity (same mesh, front-culled, slightly scaled)
// ---------------------------------------------------------------------------

function buildOutlineEntity(
  device: pc.GraphicsDevice,
  bodyData: CarBodyMesh,
  color: pc.Color,
): pc.Entity {
  const mesh = new pc.Mesh(device);
  mesh.setPositions(Array.from(bodyData.positions));
  mesh.setNormals(Array.from(bodyData.normals));
  mesh.setIndices(Array.from(bodyData.indices));
  mesh.update(pc.PRIMITIVE_TRIANGLES);

  const entity = new pc.Entity('car-outline');
  entity.addComponent('render', {
    meshInstances: [new pc.MeshInstance(mesh, outlineMat(color))],
    castShadows: false,
    receiveShadows: false,
  });
  entity.setLocalScale(1.055, 1.055, 1.055);
  return entity;
}

// ---------------------------------------------------------------------------
// Wheel assembly (spin around local X = axle direction)
// ---------------------------------------------------------------------------

function buildWheel(parent: pc.Entity, name: string, lx: number, ly: number, lz: number): pc.Entity {
  const tireMat = bodyMat(new pc.Color(0.1, 0.1, 0.1), 0, 0.9);
  const rimMat  = bodyMat(new pc.Color(0.62, 0.65, 0.72), 0.9, 0.08);
  const hubMat  = bodyMat(new pc.Color(0.82, 0.84, 0.9), 1.0, 0.04);

  // wheelRoot is the spin axis — rotate it to align axle with local X
  const wheelRoot = new pc.Entity(name);
  wheelRoot.setLocalPosition(lx, ly, lz);
  // Rotate 90° around Z so the cylinder height (Y) aligns with X = axle direction
  wheelRoot.setLocalEulerAngles(0, 0, 90);
  parent.addChild(wheelRoot);

  // Tire — cylinder, height (Y) = 0.30, radius (X/Z) = 0.37
  const tire = new pc.Entity('tire');
  tire.addComponent('render', { type: 'cylinder', material: tireMat, castShadows: true, receiveShadows: false });
  tire.setLocalScale(0.74, 0.30, 0.74); // diameter, width, diameter
  wheelRoot.addChild(tire);

  // Rim — 6-segment (hexagonal) via cone or cylinder with low segments (PlayCanvas cylinder doesn't expose segments, use scale trick)
  const rim = new pc.Entity('rim');
  rim.addComponent('render', { type: 'cylinder', material: rimMat, castShadows: true, receiveShadows: false });
  rim.setLocalScale(0.46, 0.32, 0.46);
  wheelRoot.addChild(rim);

  // Hub
  const hub = new pc.Entity('hub');
  hub.addComponent('render', { type: 'sphere', material: hubMat, castShadows: false, receiveShadows: false });
  hub.setLocalScale(0.14, 0.14, 0.14);
  wheelRoot.addChild(hub);

  return wheelRoot; // caller spins this around its local Y (which is world X after the Z-rotation)
}

// ---------------------------------------------------------------------------
// Bumper part
// ---------------------------------------------------------------------------

function buildBumper(device: pc.GraphicsDevice, style: BumperStyle, bodyColor: pc.Color, L: number, W: number): pc.Entity {
  const group = new pc.Entity('bumperGroup');
  const dark = darken(bodyColor, 0.78);
  const chrome = bodyMat(new pc.Color(0.7, 0.72, 0.76), 0.88, 0.1);
  const mat = bodyMat(dark);
  void device;

  if (style === 'stock') {
    addBox(group, 'bumperCore', 0, 0, -(L / 2 + 0.06), W * 0.9, 0.2, 0.22, mat);
  } else if (style === 'street') {
    addBox(group, 'bumperCore', 0, 0, -(L / 2 + 0.06), W * 0.95, 0.22, 0.28, mat);
    addBox(group, 'bumperWedge', 0, -0.12, -(L / 2 + 0.26), W * 0.8, 0.08, 0.4, bodyMat(new pc.Color(0.1, 0.1, 0.14)));
  } else {
    // race
    addBox(group, 'bumperCore', 0, 0, -(L / 2 + 0.08), W * 1.02, 0.2, 0.3, mat);
    addBox(group, 'splitter',   0, -0.16, -(L / 2 + 0.36), W * 1.3, 0.06, 0.66, chrome);
  }
  return group;
}

// ---------------------------------------------------------------------------
// Hood part
// ---------------------------------------------------------------------------

function buildHood(style: HoodStyle, bodyColor: pc.Color, L: number, W: number): pc.Entity {
  const group = new pc.Entity('hoodGroup');
  const color = style === 'carbon' ? new pc.Color(0.06, 0.07, 0.09) : darken(bodyColor, 0.88);
  const mat = bodyMat(color, style === 'carbon' ? 0.5 : 0.2, 0.4);

  addBox(group, 'hoodPanel', 0, 0.32, -(L * 0.22), W * 0.78, 0.08, L * 0.38, mat);

  if (style !== 'stock') {
    const ventMat = bodyMat(new pc.Color(0.04, 0.04, 0.06));
    addBox(group, 'ventL', -(W * 0.26), 0.36, -(L * 0.22), W * 0.12, 0.06, L * 0.28, ventMat);
    addBox(group, 'ventR',  (W * 0.26), 0.36, -(L * 0.22), W * 0.12, 0.06, L * 0.28, ventMat);
  }
  return group;
}

// ---------------------------------------------------------------------------
// Spoiler part
// ---------------------------------------------------------------------------

function buildSpoiler(style: SpoilerStyle, bodyColor: pc.Color, L: number, W: number): pc.Entity {
  const group = new pc.Entity('spoilerGroup');
  const mat = bodyMat(darken(bodyColor, 0.72));
  const darkMat = bodyMat(new pc.Color(0.08, 0.09, 0.12));

  if (style === 'lip') {
    addBox(group, 'lip', 0, 0.36, L / 2 + 0.02, W * 0.72, 0.08, 0.16, mat);
  } else if (style === 'wing') {
    addBox(group, 'postL', -(W * 0.32), 0.62, L / 2 - 0.28, 0.08, 0.48, 0.08, darkMat);
    addBox(group, 'postR',  (W * 0.32), 0.62, L / 2 - 0.28, 0.08, 0.48, 0.08, darkMat);
    addBox(group, 'blade',  0, 0.9,  L / 2 - 0.28, W * 0.88, 0.09, 0.32, darkMat);
  }
  return group;
}

// ---------------------------------------------------------------------------
// Primitive-based car body — hull + cabin + details, no Manifold needed
// ---------------------------------------------------------------------------

function addBodyPrimitives(
  root: pc.Entity,
  W: number, H: number, L: number,
  cabinW: number, cabinH: number, cabinL: number, cabinOffZ: number,
  bodyColor: pc.Color,
): void {
  const bMat  = bodyMat(bodyColor);
  const darkMat  = bodyMat(darken(bodyColor, 0.72));
  const vDark    = bodyMat(new pc.Color(0.07, 0.08, 0.12));
  const outColor = new pc.Color(0.07, 0.05, 0.02);
  const oMat = outlineMat(outColor);

  // Main hull
  addBox(root, 'hull',    0, 0, 0, W, H, L, bMat);
  addBox(root, 'hullOut', 0, 0, 0, W*1.045, H*1.06, L*1.02, oMat, false);

  // Cabin
  addBox(root, 'cabin',    0, H/2+cabinH/2, cabinOffZ, cabinW, cabinH, cabinL, bMat);
  addBox(root, 'cabinOut', 0, H/2+cabinH/2, cabinOffZ, cabinW*1.06, cabinH*1.07, cabinL*1.03, oMat, false);

  // Front nose drop (lower than main hull, creates a sloping nose look)
  addBox(root, 'nose',  0, -H*0.22, -(L/2-0.22), W*0.80, H*0.56, 0.44, darkMat);

  // Rear deck (hatchback lower rear, creates boot silhouette)
  addBox(root, 'deck',  0, -H*0.15, (L/2-0.24), W*0.86, H*0.68, 0.48, darkMat);

  // Side skirts (below door line)
  for (const [sx, sfx] of [[-1, 'L'], [1, 'R']] as [number, string][]) {
    addBox(root, `skirt${sfx}`, sx*(W/2+0.045), -H*0.28, -L*0.02, 0.09, H*0.44, L*0.66, vDark, false);
  }

  // Wheel arch lips — slight protrusion around each wheel
  const archW = 0.095, archH2 = H*0.22, archLen = 0.78;
  for (const [az, afx] of [[-(L*0.32), 'F'], [L*0.34, 'R']] as [number, string][]) {
    for (const [ax, alx] of [[-1, 'L'], [1, 'R']] as [number, string][]) {
      addBox(root, `arch${afx}${alx}`, ax*(W/2+archW/2-0.01), -H*0.1, az, archW, archH2, archLen, vDark, false);
    }
  }
}

// ---------------------------------------------------------------------------
// Main builder — call after Manifold pipeline resolves
// ---------------------------------------------------------------------------

export function buildCarMesh(device: pc.GraphicsDevice, config: CarConfig, bodyData: CarBodyMesh): CarMeshResult {
  const bodyColor = fromHex(config.customization.bodyColor);
  const neonColor = fromHex(config.customization.neonColor);
  const isSedan = config.carClass === 'sedan';

  const W = isSedan ? 1.95 : 1.82;
  const H = isSedan ? 0.52 : 0.50;
  const L = isSedan ? 4.6  : 4.2;
  const cabinH = isSedan ? 0.55 : 0.48;
  const cabinL = isSedan ? 2.4  : 2.1;
  const cabinOffZ = isSedan ? -0.1 : -0.05;
  const cabinW = W * 0.86;

  const root = new pc.Entity('car');

  // ── Body: Manifold mesh when valid; primitive fallback otherwise ───────────
  // Manifold body has many vertices; the flat-box fallback has exactly 24 (72 floats).
  const isManifoldMesh = bodyData.positions.length > 200;
  if (isManifoldMesh) {
    const bMat = bodyMat(bodyColor);
    root.addChild(buildBodyMeshEntity(device, bodyData, bMat, 'car-body'));
    root.addChild(buildOutlineEntity(device, bodyData, new pc.Color(0.12, 0.08, 0.05)));
  } else {
    addBodyPrimitives(root, W, H, L, cabinW, cabinH, cabinL, cabinOffZ, bodyColor);
  }

  // ── Cabin glass strips (side windows) ────────────────────────────────────
  const gMat = glassMat(new pc.Color(0.5, 0.68, 0.9));
  addBox(root, 'winL', -(W * 0.44), H + cabinH * 0.58, cabinOffZ, 0.04, cabinH * 0.72, cabinL * 0.72, gMat, false);
  addBox(root, 'winR',  (W * 0.44), H + cabinH * 0.58, cabinOffZ, 0.04, cabinH * 0.72, cabinL * 0.72, gMat, false);
  addBox(root, 'windshieldF', 0, H + cabinH * 0.56,  cabinL * 0.5 + cabinOffZ - 0.04, W * 0.84, cabinH * 0.78, 0.06, gMat, false);
  addBox(root, 'windshieldR', 0, H + cabinH * 0.56, -cabinL * 0.5 + cabinOffZ + 0.04, W * 0.84, cabinH * 0.78, 0.06, gMat, false);

  // ── Emissive headlights (front) ───────────────────────────────────────────
  const headEl = new pc.Color(0.88, 0.96, 1.0);
  const headGl = new pc.Color(0.55, 0.82, 1.0);
  addBox(root, 'hll', -(W * 0.22), H * 0.62, -(L / 2 + 0.01), W * 0.18, H * 0.22, 0.04, glowMat(headEl, headGl, 3.5));
  addBox(root, 'hlr',  (W * 0.22), H * 0.62, -(L / 2 + 0.01), W * 0.18, H * 0.22, 0.04, glowMat(headEl, headGl, 3.5));
  addBox(root, 'hlol', -(W * 0.36), H * 0.62, -(L / 2 + 0.01), W * 0.1, H * 0.16, 0.04, glowMat(headEl, new pc.Color(0.6, 0.8, 1.0), 2.0));
  addBox(root, 'hlor',  (W * 0.36), H * 0.62, -(L / 2 + 0.01), W * 0.1, H * 0.16, 0.04, glowMat(headEl, new pc.Color(0.6, 0.8, 1.0), 2.0));

  // ── Emissive taillights (rear) ────────────────────────────────────────────
  const tailEl = new pc.Color(1.0, 0.08, 0.04);
  addBox(root, 'tll', -(W * 0.24), H * 0.64, L / 2 + 0.01, W * 0.2, H * 0.2, 0.04, glowMat(tailEl, tailEl, 2.8));
  addBox(root, 'tlr',  (W * 0.24), H * 0.64, L / 2 + 0.01, W * 0.2, H * 0.2, 0.04, glowMat(tailEl, tailEl, 2.8));
  addBox(root, 'brk', 0, H * 0.82, L / 2 + 0.01, W * 0.28, H * 0.09, 0.04, glowMat(new pc.Color(1.0, 0.32, 0.04), new pc.Color(1.0, 0.32, 0.04), 1.8));

  // ── Neon undercarriage strip ──────────────────────────────────────────────
  addCylinder(root, 'neon', 0, 0.06, 0, W * 0.88, 0.04, L * 0.88, 0, 0, 0, glowMat(neonColor, neonColor, 2.5), false);

  // ── Mirrors ───────────────────────────────────────────────────────────────
  const mirMat = bodyMat(darken(bodyColor, 0.62));
  addBox(root, 'mirL', -(W / 2 + 0.09), H + cabinH * 0.76, cabinL * 0.28 + cabinOffZ, 0.1, 0.08, 0.22, mirMat);
  addBox(root, 'mirR',  (W / 2 + 0.09), H + cabinH * 0.76, cabinL * 0.28 + cabinOffZ, 0.1, 0.08, 0.22, mirMat);

  // ── Roof scoop ────────────────────────────────────────────────────────────
  addBox(root, 'scoop', 0, H + cabinH + 0.04, cabinOffZ, W * 0.26, 0.1, cabinL * 0.32, bodyMat(darken(bodyColor, 0.55)));

  // ── Rear diffuser ─────────────────────────────────────────────────────────
  addBox(root, 'diffuser', 0, 0.06, L / 2 + 0.04, W * 0.72, 0.08, 0.2, bodyMat(new pc.Color(0.06, 0.07, 0.1)));

  // ── Engine intake glow ────────────────────────────────────────────────────
  const intakeColor = new pc.Color(1.0, 0.62, 0.25);
  addBox(root, 'intake', W * 0.24, H * 0.8, -(L * 0.32), 0.18, 0.15, 0.34, glowMat(intakeColor, intakeColor, 2.8));

  // ── Wheels ────────────────────────────────────────────────────────────────
  const wheelXOff = W / 2 + 0.11;
  const wheelY = -0.24;
  const wheelZF = -(L * 0.32);
  const wheelZR =  (L * 0.34);
  const wheels: pc.Entity[] = [];
  wheels.push(buildWheel(root, 'wheelFL', -wheelXOff, wheelY, wheelZF));
  wheels.push(buildWheel(root, 'wheelFR',  wheelXOff, wheelY, wheelZF));
  wheels.push(buildWheel(root, 'wheelRL', -wheelXOff, wheelY, wheelZR));
  wheels.push(buildWheel(root, 'wheelRR',  wheelXOff, wheelY, wheelZR));

  // ── Customisable parts ────────────────────────────────────────────────────
  const bumperGroup = buildBumper(device, config.customization.bumper, bodyColor, L, W);
  root.addChild(bumperGroup);

  const hoodGroup = buildHood(config.customization.hood, bodyColor, L, W);
  root.addChild(hoodGroup);

  const spoilerGroup = buildSpoiler(config.customization.spoiler, bodyColor, L, W);
  root.addChild(spoilerGroup);

  return { root, wheels, bumperGroup, hoodGroup, spoilerGroup };
}

// ---------------------------------------------------------------------------
// Wheel spin helper — called from game update loop
// ---------------------------------------------------------------------------

export function spinWheels(wheels: pc.Entity[], dt: number, speedKmh: number): void {
  const speedMs = speedKmh / 3.6;
  const spinDeg = (speedMs * dt / 0.37) * pc.math.RAD_TO_DEG;
  if (Math.abs(spinDeg) < 0.0001) return;
  // wheelRoot is tilted 90° around Z so its local Y is the axle;
  // rotating around local Y spins the wheel in the rolling direction.
  for (const w of wheels) {
    w.rotateLocal(0, spinDeg, 0);
  }
}

// ---------------------------------------------------------------------------
// Swap a customisable part at runtime without rebuilding the whole car
// ---------------------------------------------------------------------------

export function swapBumper(root: pc.Entity, style: BumperStyle, bodyColor: number, L: number, W: number): pc.Entity {
  const old = root.findByName('bumperGroup');
  if (old) root.removeChild(old);
  const part = buildBumper(root.name as unknown as pc.GraphicsDevice, style, fromHex(bodyColor), L, W);
  root.addChild(part);
  return part;
}

export function swapHood(root: pc.Entity, style: HoodStyle, bodyColor: number, L: number, W: number): pc.Entity {
  const old = root.findByName('hoodGroup');
  if (old) root.removeChild(old);
  const part = buildHood(style, fromHex(bodyColor), L, W);
  root.addChild(part);
  return part;
}

export function swapSpoiler(root: pc.Entity, style: SpoilerStyle, bodyColor: number, L: number, W: number): pc.Entity {
  const old = root.findByName('spoilerGroup');
  if (old) root.removeChild(old);
  const part = buildSpoiler(style, fromHex(bodyColor), L, W);
  root.addChild(part);
  return part;
}
