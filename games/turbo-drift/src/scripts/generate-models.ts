#!/usr/bin/env tsx
/**
 * generate-models
 *
 * Calls your own Hunyuan3D-2.1 server to generate GLB assets, then:
 *   1. Saves them locally  → public/assets/models/
 *   2. Uploads to HF bucket → cdgbrands/Hunyuan3D-2.1-bucket
 *
 * Root .env keys needed:
 *   HUNYUAN_URL=http://localhost:8081   (default if omitted)
 *   HUGGINGFACE_API_KEY=hf_xxx          (for bucket upload)
 *
 * Start your Hunyuan3D API server first:
 *   python api_server.py --port 8081
 *
 * Then run:
 *   npm run generate-models  (from games/turbo-drift/)
 */

import { uploadFile } from '@huggingface/hub';
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

// ---------------------------------------------------------------------------
// Load root .env
// ---------------------------------------------------------------------------

function loadEnv(): void {
  const envPath = join(__dirname, '../../../../.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t  = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const HUNYUAN_URL = (process.env.HUNYUAN_URL ?? 'http://localhost:8081').replace(/\/$/, '');
const HF_TOKEN    = process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN ?? '';
const BUCKET      = 'cdgbrands/Hunyuan3D-2.1-bucket';
const OUT_DIR     = join(__dirname, '../../public/assets/models');
const VIEW_API    = process.argv.includes('--view-api');
const PROBE_PATHS = ['/', '/health', '/info', '/config', '/gradio_api/info', '/gradio_api/openapi.json'] as const;

interface ModelSpec {
  filename:  string;
  prompt:    string;
  steps:     number;
  faceCount: number;
  seed:      number;
}

const MODELS: ModelSpec[] = [
  {
    filename:  'car',
    steps:     50,
    faceCount: 30_000,
    seed:      42,
    prompt:
      'Low-poly arcade race car, futuristic sleek design, aerodynamic body with smooth curves, ' +
      'wide racing stance, sport rear spoiler, neon accent stripe along the side, ' +
      'glossy metallic paint, four visible racing tires, front bumper with air intakes, ' +
      'small side mirrors, game-ready clean geometry, car centered at origin facing +Z',
  },
  {
    filename:  'grandstand',
    steps:     50,
    faceCount: 20_000,
    seed:      99,
    prompt:
      'Futuristic night-time racing circuit grandstand, low-poly, ' +
      'stepped concrete seating rows, thin metal roof canopy with neon strip underneath, ' +
      'colorful banners on front railing, no spectators, isolated asset',
  },
  {
    filename:  'tree',
    steps:     30,
    faceCount: 8_000,
    seed:      7,
    prompt:
      'Stylized low-poly palm tree, slightly curved trunk, 6 fronds at top, ' +
      'night-time race track decoration, base at origin',
  },
];

// ---------------------------------------------------------------------------
// Hunyuan3D local server
// ---------------------------------------------------------------------------

type ProbeResult = {
  path: string;
  ok: boolean;
  status?: number;
  contentType?: string | null;
  snippet?: string;
  error?: string;
};

async function probeEndpoint(path: string): Promise<ProbeResult> {
  try {
    const res = await fetch(`${HUNYUAN_URL}${path}`, { signal: AbortSignal.timeout(4000) });
    const contentType = res.headers.get('content-type');
    const isText = contentType?.includes('json') || contentType?.includes('text') || contentType?.includes('html');
    const snippet = isText ? (await res.text()).slice(0, 180).replace(/\s+/g, ' ') : undefined;
    return { path, ok: res.ok, status: res.status, contentType, snippet };
  } catch (error) {
    return {
      path,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkServer(): Promise<void> {
  const probes = await Promise.all(PROBE_PATHS.map((path) => probeEndpoint(path)));
  const healthy = probes.find((probe) => probe.ok);
  if (healthy) return;

  const noOverride = !process.env.HUNYUAN_URL;
  const details = probes
    .map((probe) => probe.error
      ? `  - ${probe.path} → ${probe.error}`
      : `  - ${probe.path} → HTTP ${probe.status ?? 'unknown'}`)
    .join('\n');

  throw new Error(
    `Hunyuan3D server not reachable at ${HUNYUAN_URL}\n` +
    (noOverride ? '  → No HUNYUAN_URL found in .env, so the default localhost:8081 was used.\n' : '') +
    `  → Start it with:  python api_server.py --port 8081\n` +
    `  → Or set HUNYUAN_URL in .env if it runs on a different port\n` +
    `  → Probe results:\n${details}`,
  );
}

async function viewApi(): Promise<void> {
  console.log(`\nHunyuan3D server probe: ${HUNYUAN_URL}\n`);
  const probes = await Promise.all(PROBE_PATHS.map((path) => probeEndpoint(path)));
  for (const probe of probes) {
    if (probe.error) {
      console.log(`- ${probe.path} :: ERROR ${probe.error}`);
      continue;
    }
    const type = probe.contentType ? ` :: ${probe.contentType}` : '';
    const body = probe.snippet ? `\n    ${probe.snippet}` : '';
    console.log(`- ${probe.path} :: HTTP ${probe.status}${type}${body}`);
  }
}

async function generate(spec: ModelSpec): Promise<Buffer> {
  // Sync endpoint — returns binary GLB directly when done.
  // Hunyuan3D-2.1 local server accepts JSON with prompt for text-to-3D.
  const res = await fetch(`${HUNYUAN_URL}/generate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt:               spec.prompt,
      image:                null,   // null = text-to-3D (requires --enable_t23d)
      remove_background:    false,
      texture:              true,
      seed:                 spec.seed,
      octree_resolution:    256,
      num_inference_steps:  spec.steps,
      guidance_scale:       5.0,
      num_chunks:           8_000,
      face_count:           spec.faceCount,
      type:                 'glb',
    }),
    signal: AbortSignal.timeout(20 * 60_000), // 20 min
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Generate ${res.status}: ${body.slice(0, 200)}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------
// HF bucket upload (optional — skipped if no HF token)
// ---------------------------------------------------------------------------

async function uploadToBucket(buf: Buffer, filename: string): Promise<void> {
  await uploadFile({
    repo:        { type: 'bucket', name: BUCKET },
    accessToken: HF_TOKEN,
    file: {
      path:    filename,
      content: new Blob([buf], { type: 'model/gltf-binary' }),
    },
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (VIEW_API) {
    await viewApi();
    process.exit(0);
  }

  console.log(`\nHunyuan3D server: ${HUNYUAN_URL}`);
  await checkServer();
  console.log('  Server OK\n');

  mkdirSync(OUT_DIR, { recursive: true });

  if (!HF_TOKEN) {
    console.log('  Note: HUGGINGFACE_API_KEY not set — skipping bucket upload.\n');
  }

  for (const spec of MODELS) {
    console.log(`▶  ${spec.filename}.glb`);
    console.log(`   Prompt: "${spec.prompt.slice(0, 70)}…"`);

    const t0  = Date.now();
    const buf = await generate(spec);
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`   Generated in ${secs} s  (${(buf.length / 1024).toFixed(1)} KB)`);

    // Save locally
    const localPath = join(OUT_DIR, `${spec.filename}.glb`);
    writeFileSync(localPath, buf);
    console.log(`   Local: ${localPath}`);

    // Upload to bucket
    if (HF_TOKEN) {
      await uploadToBucket(buf, `${spec.filename}.glb`);
      console.log(`   Bucket: https://huggingface.co/buckets/${BUCKET}/resolve/${spec.filename}.glb`);
    }
    console.log();
  }

  console.log('✓  Done — restart the dev server to serve the new models.');
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error('\n✗  Failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
