/**
 * ManifoldCarPipeline
 *
 * Generates a premium procedural car body using Manifold CSG boolean operations.
 * The union of body + cabin, with wheel-arch subtractions, produces a cohesive solid
 * that PlayCanvas can render with proper normals and no seams.
 *
 * meshoptimizer is applied post-generation to reorder triangles for vertex-cache
 * efficiency before the data is uploaded to the GPU.
 *
 * Offline note: for NURBS-quality surfacing, run rhino3dm preprocessing in Node.js
 * (rhino3dm is ~30 MB and not suitable for browser runtime). Export the rhino3dm
 * surfaces as a glTF, optimise with @gltf-transform, and load via PlayCanvas
 * asset registry — then skip the Manifold path entirely.
 */

import type { CarClass } from '../types';

// ---------------------------------------------------------------------------
// Manifold type stubs — the real types come from manifold-3d
// ---------------------------------------------------------------------------

interface ManifoldMesh {
  numProp: number;
  vertProperties: Float32Array;
  triVerts: Uint32Array;
}

interface ManifoldShape {
  add(other: ManifoldShape): ManifoldShape;
  subtract(other: ManifoldShape): ManifoldShape;
  translate(xyz: [number, number, number]): ManifoldShape;
  scale(xyz: [number, number, number]): ManifoldShape;
  rotate(xyz: [number, number, number]): ManifoldShape;
  getMesh(): ManifoldMesh;
}

interface ManifoldStatic {
  cube(size: [number, number, number], center?: boolean): ManifoldShape;
  sphere(radius: number, segments?: number): ManifoldShape;
  cylinder(height: number, radiusLow: number, radiusHigh?: number, segments?: number): ManifoldShape;
}

type ManifoldModule = { Manifold: ManifoldStatic };

// ---------------------------------------------------------------------------
// Singleton WASM loader
// ---------------------------------------------------------------------------

let manifoldWasm: ManifoldModule | null = null;

async function getManifold(): Promise<ManifoldModule> {
  if (manifoldWasm) return manifoldWasm;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const factory = (await import('manifold-3d')).default as () => Promise<ManifoldModule>;
  manifoldWasm = await factory();
  return manifoldWasm;
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface CarBodyMesh {
  positions: Float32Array; // x,y,z per vertex
  normals: Float32Array;   // nx,ny,nz per vertex (smooth)
  indices: Uint32Array;    // triangle vertex indices (optimised)
}

// ---------------------------------------------------------------------------
// Normal computation — smooth vertex normals from shared-vertex triangle list
// ---------------------------------------------------------------------------

function computeSmoothedNormals(positions: Float32Array, indices: Uint32Array): Float32Array {
  const normals = new Float32Array(positions.length); // zero-initialised
  const count = indices.length / 3;

  for (let t = 0; t < count; t++) {
    const i0 = indices[t * 3 + 0];
    const i1 = indices[t * 3 + 1];
    const i2 = indices[t * 3 + 2];

    const ax = positions[i1 * 3] - positions[i0 * 3];
    const ay = positions[i1 * 3 + 1] - positions[i0 * 3 + 1];
    const az = positions[i1 * 3 + 2] - positions[i0 * 3 + 2];
    const bx = positions[i2 * 3] - positions[i0 * 3];
    const by = positions[i2 * 3 + 1] - positions[i0 * 3 + 1];
    const bz = positions[i2 * 3 + 2] - positions[i0 * 3 + 2];

    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;

    for (const ii of [i0, i1, i2]) {
      normals[ii * 3] += nx;
      normals[ii * 3 + 1] += ny;
      normals[ii * 3 + 2] += nz;
    }
  }

  for (let i = 0; i < normals.length / 3; i++) {
    const nx = normals[i * 3];
    const ny = normals[i * 3 + 1];
    const nz = normals[i * 3 + 2];
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 1e-8) {
      normals[i * 3] /= len;
      normals[i * 3 + 1] /= len;
      normals[i * 3 + 2] /= len;
    }
  }

  return normals;
}

// ---------------------------------------------------------------------------
// meshoptimizer vertex-cache optimisation (applied when available)
// ---------------------------------------------------------------------------

async function optimiseIndices(indices: Uint32Array, vertexCount: number): Promise<Uint32Array> {
  try {
    const { MeshoptEncoder } = await import('meshoptimizer');
    await MeshoptEncoder.ready;
    // reorderMesh reorders the index buffer for vertex-cache efficiency.
    // It returns [reorderedIndices, remap] — we only need the indices.
    const [reordered] = MeshoptEncoder.reorderMesh(indices, /* triangles */ true, /* optsize */ false);
    void vertexCount; // vertex count is used by the encoder internally
    return reordered;
  } catch {
    return indices; // meshoptimizer unavailable — use raw Manifold output
  }
}

// ---------------------------------------------------------------------------
// Fallback — simple rounded-box car body for when Manifold fails
// ---------------------------------------------------------------------------

function makeFallbackMesh(carClass: CarClass): CarBodyMesh {
  const W = carClass === 'sedan' ? 1.95 : 1.82;
  const H = carClass === 'sedan' ? 0.52 : 0.50;
  const L = carClass === 'sedan' ? 4.6 : 4.2;
  const hw = W / 2, hh = H / 2, hl = L / 2;

  // 24 unique verts (4 per face, 6 faces) so each face can have its own normal
  const positions = new Float32Array([
    // +Z face
    -hw, -hh,  hl,  hw, -hh,  hl,  hw,  hh,  hl, -hw,  hh,  hl,
    // -Z face
     hw, -hh, -hl, -hw, -hh, -hl, -hw,  hh, -hl,  hw,  hh, -hl,
    // +X face
     hw, -hh,  hl,  hw, -hh, -hl,  hw,  hh, -hl,  hw,  hh,  hl,
    // -X face
    -hw, -hh, -hl, -hw, -hh,  hl, -hw,  hh,  hl, -hw,  hh, -hl,
    // +Y face
    -hw,  hh,  hl,  hw,  hh,  hl,  hw,  hh, -hl, -hw,  hh, -hl,
    // -Y face
    -hw, -hh, -hl,  hw, -hh, -hl,  hw, -hh,  hl, -hw, -hh,  hl,
  ]);

  const indices = new Uint32Array([
    0,1,2, 0,2,3,     // +Z
    4,5,6, 4,6,7,     // -Z
    8,9,10, 8,10,11,  // +X
    12,13,14, 12,14,15, // -X
    16,17,18, 16,18,19, // +Y
    20,21,22, 20,22,23, // -Y
  ]);

  const normals = computeSmoothedNormals(positions, indices);
  return { positions, normals, indices };
}

// ---------------------------------------------------------------------------
// Main export — generate car body mesh using Manifold CSG
// ---------------------------------------------------------------------------

export async function generateCarBodyMesh(carClass: CarClass): Promise<CarBodyMesh> {
  try {
    const { Manifold } = await getManifold();

    const W = carClass === 'sedan' ? 1.95 : 1.82;
    const H = carClass === 'sedan' ? 0.52 : 0.50;
    const L = carClass === 'sedan' ? 4.6 : 4.2;
    const cabinW = W * 0.86;
    const cabinH = carClass === 'sedan' ? 0.55 : 0.48;
    const cabinL = carClass === 'sedan' ? 2.4 : 2.1;
    const cabinOffsetZ = carClass === 'sedan' ? -0.1 : -0.05;

    // ── Body shell ──────────────────────────────────────────────────────────
    const body = Manifold.cube([W, H, L], true);

    // Taper the nose slightly by subtracting a rotated slab from the front
    const noseCut = Manifold.cube([W + 0.1, H * 0.6, 0.5], true)
      .rotate([12, 0, 0])
      .translate([0, -H * 0.15, L / 2 + 0.12]);
    const tailCut = Manifold.cube([W + 0.1, H * 0.5, 0.3], true)
      .rotate([-8, 0, 0])
      .translate([0, -H * 0.1, -(L / 2 + 0.05)]);

    const bodyShape = body.subtract(noseCut).subtract(tailCut);

    // ── Cabin top ───────────────────────────────────────────────────────────
    const cabinBox = Manifold.cube([cabinW, cabinH, cabinL], true)
      .translate([0, (H + cabinH) / 2, cabinOffsetZ]);

    // Windshield rake — cut the front roof edge at an angle
    const windshieldCut = Manifold.cube([cabinW + 0.1, cabinH * 0.8, 0.6], true)
      .rotate([28, 0, 0])
      .translate([0, (H + cabinH) * 0.88, cabinL / 2 + cabinOffsetZ - 0.1]);
    const rearWindowCut = Manifold.cube([cabinW + 0.1, cabinH * 0.8, 0.5], true)
      .rotate([-22, 0, 0])
      .translate([0, (H + cabinH) * 0.88, -(cabinL / 2 - cabinOffsetZ) + 0.05]);

    const cabin = cabinBox.subtract(windshieldCut).subtract(rearWindowCut);

    // ── Wheel arch subtractions ─────────────────────────────────────────────
    const archR = 0.44;
    const archH = W * 0.6;
    const wheelZF = L / 2 - 0.72;
    const wheelZR = -(L / 2 - 0.72);

    const arch = Manifold.cylinder(archH, archR, archR, 28);
    const archFL = arch.rotate([0, 0, 90]).translate([-W / 2, 0, wheelZF]);
    const archFR = arch.rotate([0, 0, 90]).translate([ W / 2, 0, wheelZF]);
    const archRL = arch.rotate([0, 0, 90]).translate([-W / 2, 0, wheelZR]);
    const archRR = arch.rotate([0, 0, 90]).translate([ W / 2, 0, wheelZR]);

    const carSolid = bodyShape
      .add(cabin)
      .subtract(archFL)
      .subtract(archFR)
      .subtract(archRL)
      .subtract(archRR);

    // ── Extract mesh ────────────────────────────────────────────────────────
    const raw = carSolid.getMesh();
    const numVerts = raw.vertProperties.length / raw.numProp;
    const positions = new Float32Array(numVerts * 3);

    for (let i = 0; i < numVerts; i++) {
      positions[i * 3]     = raw.vertProperties[i * raw.numProp];
      positions[i * 3 + 1] = raw.vertProperties[i * raw.numProp + 1];
      positions[i * 3 + 2] = raw.vertProperties[i * raw.numProp + 2];
    }

    const normals = computeSmoothedNormals(positions, raw.triVerts);
    const indices = await optimiseIndices(raw.triVerts, numVerts);

    return { positions, normals, indices };

  } catch (err) {
    console.warn('[ManifoldCarPipeline] Falling back to box mesh:', err);
    return makeFallbackMesh(carClass);
  }
}
