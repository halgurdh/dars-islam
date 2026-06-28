/**
 * RoadMeshBuilder — converts an ordered 2D centerline into PlayCanvas
 * render entities: road surface ribbon + dashed centre-line markings.
 */

import * as pc from 'playcanvas';

// ---- Road surface -------------------------------------------------------------

export function buildRoadEntity(
  app:       pc.Application,
  centerline: Array<[number, number]>,
  roadWidth  = 16,
): pc.Entity {
  const halfW = roadWidth / 2;
  const positions: number[] = [];
  const normals:   number[] = [];
  const uvs:       number[] = [];
  const indices:   number[] = [];

  let vIdx = 0;
  let uAcc = 0;

  for (let i = 0; i < centerline.length - 1; i++) {
    const [x0, z0] = centerline[i];
    const [x1, z1] = centerline[i + 1];
    const dx = x1 - x0, dz = z1 - z0;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.1) continue;

    const px = -dz / len, pz = dx / len; // perpendicular left

    positions.push(
      x0 + px * halfW, 0.05, z0 + pz * halfW,  // left-back
      x0 - px * halfW, 0.05, z0 - pz * halfW,  // right-back
      x1 + px * halfW, 0.05, z1 + pz * halfW,  // left-front
      x1 - px * halfW, 0.05, z1 - pz * halfW,  // right-front
    );
    normals.push(0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0);

    const v0 = uAcc / roadWidth;
    const v1 = (uAcc + len) / roadWidth;
    uvs.push(0, v0,  1, v0,  0, v1,  1, v1);
    uAcc += len;

    indices.push(vIdx, vIdx + 2, vIdx + 1,  vIdx + 1, vIdx + 2, vIdx + 3);
    vIdx += 4;
  }

  const mesh = pc.createMesh(app.graphicsDevice, positions, { normals, uvs, indices });

  const mat = new pc.StandardMaterial();
  mat.diffuse = new pc.Color(0.11, 0.11, 0.14);
  mat.useMetalness = true;
  mat.metalness = 0.05;
  mat.gloss = 0.18;
  mat.update();

  const entity = new pc.Entity('osmRoad');
  entity.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, mat)] });
  return entity;
}

// ---- Edge kerbs ---------------------------------------------------------------

export function buildKerbEntity(
  app:       pc.Application,
  centerline: Array<[number, number]>,
  side:       1 | -1,   // +1 = left, -1 = right
  roadWidth  = 16,
  kerbWidth  = 0.8,
): pc.Entity {
  const halfW = roadWidth / 2;
  const positions: number[] = [];
  const normals:   number[] = [];
  const uvs:       number[] = [];
  const indices:   number[] = [];

  let vIdx = 0;

  for (let i = 0; i < centerline.length - 1; i++) {
    const [x0, z0] = centerline[i];
    const [x1, z1] = centerline[i + 1];
    const dx = x1 - x0, dz = z1 - z0;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.1) continue;

    const px = (-dz / len) * side, pz = (dx / len) * side;
    const inner = halfW, outer = halfW + kerbWidth;

    // Alternate red/white every 3 m
    const isRed = Math.floor(i / 3) % 2 === 0;
    const r = isRed ? 0.9 : 0.95, g = isRed ? 0.1 : 0.95, b = isRed ? 0.15 : 0.95;
    const mat = new pc.StandardMaterial();
    mat.diffuse = new pc.Color(r, g, b);
    mat.update();

    positions.push(
      x0 + px * inner, 0.06, z0 + pz * inner,
      x0 + px * outer, 0.06, z0 + pz * outer,
      x1 + px * inner, 0.06, z1 + pz * inner,
      x1 + px * outer, 0.06, z1 + pz * outer,
    );
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
    indices.push(vIdx, vIdx + 2, vIdx + 1, vIdx + 1, vIdx + 2, vIdx + 3);
    vIdx += 4;
  }

  if (positions.length === 0) return new pc.Entity(`kerb_empty_${side}`);

  const mesh = pc.createMesh(app.graphicsDevice, positions, { normals, uvs, indices });

  // Single white/red alternating material per entity (simplified: just white+red blend)
  const mat = new pc.StandardMaterial();
  mat.diffuse = new pc.Color(0.92, 0.92, 0.92);
  mat.emissive = new pc.Color(0.1, 0.1, 0.1);
  mat.emissiveIntensity = 0.2;
  mat.update();

  const entity = new pc.Entity(`kerb${side > 0 ? 'L' : 'R'}`);
  entity.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, mat)] });
  return entity;
}

// ---- Centre dashes ------------------------------------------------------------

export function buildCentreLineEntity(
  app:       pc.Application,
  centerline: Array<[number, number]>,
  dashLen    = 10,
  gapLen     = 8,
): pc.Entity {
  const halfW = 0.25;
  const positions: number[] = [];
  const normals:   number[] = [];
  const uvs:       number[] = [];
  const indices:   number[] = [];

  let vIdx = 0;
  let acc   = 0;
  let dash  = true;

  for (let i = 0; i < centerline.length - 1; i++) {
    const [x0, z0] = centerline[i];
    const [x1, z1] = centerline[i + 1];
    const dx = x1 - x0, dz = z1 - z0;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.1) continue;

    acc += len;
    const segLen = dash ? dashLen : gapLen;
    if (acc >= segLen) { acc = 0; dash = !dash; }
    if (!dash) continue;

    const px = -dz / len, pz = dx / len;
    positions.push(
      x0 + px * halfW, 0.09, z0 + pz * halfW,
      x0 - px * halfW, 0.09, z0 - pz * halfW,
      x1 + px * halfW, 0.09, z1 + pz * halfW,
      x1 - px * halfW, 0.09, z1 - pz * halfW,
    );
    normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
    uvs.push(0, 0,  1, 0,  0, 1,  1, 1);
    indices.push(vIdx, vIdx + 2, vIdx + 1, vIdx + 1, vIdx + 2, vIdx + 3);
    vIdx += 4;
  }

  if (positions.length === 0) return new pc.Entity('noDash');

  const mesh = pc.createMesh(app.graphicsDevice, positions, { normals, uvs, indices });
  const mat  = new pc.StandardMaterial();
  mat.diffuse = new pc.Color(1, 0.8, 0);
  mat.emissive = new pc.Color(1, 0.8, 0);
  mat.emissiveIntensity = 0.5;
  mat.update();

  const entity = new pc.Entity('osmCentre');
  entity.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, mat)] });
  return entity;
}

// ---- Finish line arch ---------------------------------------------------------

export function buildFinishArch(
  x: number, z: number,
  heading:   number,
  roadWidth  = 16,
): pc.Entity {
  const root = new pc.Entity('finishArch');
  root.setLocalPosition(x, 0, z);
  root.setEulerAngles(0, (heading * 180 / Math.PI) - 90, 0);

  const archMat = new pc.StandardMaterial();
  archMat.diffuse = new pc.Color(0, 0.83, 1);
  archMat.emissive = new pc.Color(0, 0.83, 1);
  archMat.emissiveIntensity = 1.4;
  archMat.useLighting = false;
  archMat.update();

  // Finish line stripe
  const lineMat = new pc.StandardMaterial();
  lineMat.diffuse = new pc.Color(1, 1, 1);
  lineMat.emissive = new pc.Color(1, 1, 1);
  lineMat.emissiveIntensity = 0.6;
  lineMat.update();

  for (const [lx, ly, lz, sx, sy, sz, m] of [
    [-roadWidth / 2, 2.5, 0,   0.35, 5, 0.35, archMat],
    [ roadWidth / 2, 2.5, 0,   0.35, 5, 0.35, archMat],
    [0,              5.1, 0,   roadWidth, 0.35, 0.35, archMat],
    [0,              0.1, 0,   roadWidth, 0.22, 1.4, lineMat],
  ] as [number, number, number, number, number, number, pc.StandardMaterial][]) {
    const part = new pc.Entity();
    part.addComponent('render', { type: 'box', material: m });
    part.setLocalPosition(lx, ly, lz);
    part.setLocalScale(sx, sy, sz);
    root.addChild(part);
  }

  return root;
}
