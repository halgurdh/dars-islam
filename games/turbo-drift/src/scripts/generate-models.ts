#!/usr/bin/env tsx
/**
 * generate-models
 *
 * Generates every GLB asset currently required by Turbo Drift:
 *   - car.glb
 *   - grandstand.glb
 *   - tree.glb
 *
 * Reads reference images from:
 *   public/assets/model-inputs/
 *
 * Saves them locally to:
 *   public/assets/models/
 *
 * Root .env keys needed:
 *   HUNYUAN_URL=http://localhost:8081   (default if omitted)
 *
 * Start your Hunyuan3D API server first:
 *   python api_server.py --port 8081
 *
 * Then run:
 *   npm run generate-models  (from games/turbo-drift/)
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname, extname } from 'path';
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

const DEFAULT_HUNYUAN_URL = 'http://localhost:8081';
const HUNYUAN_URL = (process.env.HUNYUAN_URL ?? DEFAULT_HUNYUAN_URL).replace(/\/$/, '');
const OUT_DIR     = join(__dirname, '../../public/assets/models');
const INPUT_DIR   = join(__dirname, '../../public/assets/model-inputs');
const VIEW_API    = process.argv.includes('--view-api');
const FORCE_REGEN = process.argv.includes('--force');
const PROBE_PATHS = ['/', '/health', '/info', '/config', '/gradio_api/info', '/gradio_api/openapi.json'] as const;
const SUPPORTED_INPUT_EXTS = ['.png', '.jpg', '.jpeg', '.webp'] as const;

interface ModelSpec {
  filename:  string;
  prompt:    string;
  notes:     string;
  steps:     number;
  faceCount: number;
  seed:      number;
  texture:   boolean;
  required:  boolean;
}

const REQUIRED_MODEL_FILENAMES = [
  'car',
  'grandstand',
  'tree',
] as const;

const MODELS: ModelSpec[] = [
  {
    filename:  'car',
    prompt:
      'Arcade race car, futuristic sleek design, aerodynamic body with smooth curves, ' +
      'wide racing stance, sport rear spoiler, neon accent stripe along the side, ' +
      'glossy metallic paint, four visible racing tires, front bumper with air intakes, ' +
      'small side mirrors, clean game-ready geometry, car centered at origin facing +Z',
    steps:     15,
    faceCount: 30_000,
    seed:      42,
    texture:   true,
    required:  true,
    notes:
      'Use a clean side/front 3/4 reference of the arcade race car on a plain background.',
  },
  {
    filename:  'grandstand',
    prompt:
      'Futuristic night-time racing circuit grandstand, stepped concrete seating rows, ' +
      'thin metal roof canopy with neon strip underneath, colorful banners on front railing, ' +
      'no spectators, isolated asset',
    steps:     12,
    faceCount: 20_000,
    seed:      99,
    texture:   true,
    required:  true,
    notes:
      'Use an isolated grandstand reference image with the full structure visible.',
  },
  {
    filename:  'tree',
    prompt:
      'Stylized trackside palm tree, slightly curved trunk, six fronds at top, ' +
      'night-time race track decoration, base at origin, isolated asset',
    steps:     10,
    faceCount: 8_000,
    seed:      7,
    texture:   true,
    required:  true,
    notes:
      'Use an isolated trackside tree reference image on a simple background.',
  },
  {
    filename:  'tower-block',
    prompt:
      'Chunky racing-district tower block, mid-rise apartment building with strong silhouette, ' +
      'balconies, window bands, rooftop units, isolated asset',
    steps:     12,
    faceCount: 22_000,
    seed:      120,
    texture:   true,
    required:  false,
    notes:
      'Use a clear reference of a chunky racing-district tower block or apartment building on a plain background.',
  },
  {
    filename:  'pit-building',
    prompt:
      'Pit building facade for an arcade racing circuit, paddock garage doors, windows, signage, ' +
      'control room volume, isolated asset',
    steps:     12,
    faceCount: 24_000,
    seed:      121,
    texture:   true,
    required:  false,
    notes:
      'Use a reference of a pit building or paddock garage facade with doors, windows, and signage visible.',
  },
  {
    filename:  'track-gate',
    prompt:
      'Start-finish gantry for a racing circuit, bold support columns, overhead sign bridge, ' +
      'clean silhouette, isolated asset',
    steps:     10,
    faceCount: 12_000,
    seed:      122,
    texture:   true,
    required:  false,
    notes:
      'Use a reference of a start-finish gantry or track entry gate with the whole silhouette visible.',
  },
  {
    filename:  'billboard',
    prompt:
      'Roadside racing billboard with support frame, bold rectangular panel, metal braces, isolated asset',
    steps:     8,
    faceCount: 6_000,
    seed:      123,
    texture:   true,
    required:  false,
    notes:
      'Use a reference of a roadside racing billboard with supports and panel fully visible.',
  },
  {
    filename:  'lamp-post',
    prompt:
      'Trackside lamp post with floodlight head, tall slim mast, sturdy base, isolated asset',
    steps:     8,
    faceCount: 5_000,
    seed:      124,
    texture:   true,
    required:  false,
    notes:
      'Use a reference of a trackside lamp post or floodlight mast on a clean background.',
  },
  {
    filename:  'barrier-stack',
    prompt:
      'Stacked tire barrier cluster for a racing circuit, layered protective wall, isolated asset',
    steps:     8,
    faceCount: 7_000,
    seed:      125,
    texture:   true,
    required:  false,
    notes:
      'Use a reference of stacked tire barriers or safety blocks with the full cluster isolated.',
  },
  {
    filename:  'tunnel-module',
    prompt:
      'Road tunnel portal module for an arcade racing track, enclosed overpass section, ' +
      'concrete shell, bold silhouette, isolated asset',
    steps:     10,
    faceCount: 16_000,
    seed:      126,
    texture:   true,
    required:  false,
    notes:
      'Use a reference of a road tunnel portal or enclosed overpass section, isolated and fully framed.',
  },
];

function validateModelCoverage(): void {
  const expected = new Set(REQUIRED_MODEL_FILENAMES);
  const actual = new Set(MODELS.filter((model) => model.required).map((model) => model.filename));

  const missing = [...expected].filter((name) => !actual.has(name));

  if (!missing.length) return;

  throw new Error(`Turbo Drift required model manifest is out of sync: missing specs: ${missing.join(', ')}`);
}

function validateHunyuanUrl(): void {
  let parsed: URL;
  try {
    parsed = new URL(HUNYUAN_URL);
  } catch {
    throw new Error(
      `Invalid HUNYUAN_URL: ${HUNYUAN_URL}\n` +
      `  → Expected something like ${DEFAULT_HUNYUAN_URL}`,
    );
  }

  const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
  if (!isHttp) {
    throw new Error(
      `Unsupported HUNYUAN_URL protocol: ${parsed.protocol}\n` +
      `  → Expected http:// or https://, for example ${DEFAULT_HUNYUAN_URL}`,
    );
  }

  const pathname = parsed.pathname.replace(/\/+$/, '');
  const looksLikeBucket =
    parsed.hostname === 'huggingface.co' ||
    pathname.includes('/buckets/') ||
    pathname.includes('/resolve');

  if (looksLikeBucket) {
    throw new Error(
      `HUNYUAN_URL points to a file bucket, not a local Hunyuan API server: ${HUNYUAN_URL}\n` +
      `  → Set HUNYUAN_URL=${DEFAULT_HUNYUAN_URL}\n` +
      `  → Current .env contains a Hugging Face bucket URL, which cannot handle POST /generate`,
    );
  }
}

function findInputImagePath(filename: string): string | null {
  for (const ext of SUPPORTED_INPUT_EXTS) {
    const fullPath = join(INPUT_DIR, `${filename}${ext}`);
    if (existsSync(fullPath)) return fullPath;
  }
  return null;
}

function listExpectedInputPaths(): string {
  return MODELS
    .map((model) => `${model.filename}{${SUPPORTED_INPUT_EXTS.join(',')}}${model.required ? '  [required]' : '  [optional]'}`)
    .join('\n    ');
}

function getImageBase64(filename: string): string | null {
  const imagePath = findInputImagePath(filename);
  if (!imagePath) {
    return null;
  }

  const image = readFileSync(imagePath);
  const ext = extname(imagePath).toLowerCase();
  if (!SUPPORTED_INPUT_EXTS.includes(ext as typeof SUPPORTED_INPUT_EXTS[number])) {
    throw new Error(`Unsupported input image format for ${imagePath}`);
  }

  return image.toString('base64');
}

function getModelsToGenerate(): ModelSpec[] {
  const required = MODELS.filter((model) => model.required);
  const optional = MODELS.filter((model) => !model.required && findInputImagePath(model.filename));
  return [...required, ...optional];
}

function getModelOutputPath(filename: string): string {
  return join(OUT_DIR, `${filename}.glb`);
}

function modelAlreadyExists(filename: string): boolean {
  return existsSync(getModelOutputPath(filename));
}

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

const GENERATE_MAX_ATTEMPTS = 4;
const GENERATE_RETRY_DELAYS_MS = [3000, 6000, 12000] as const;
const STATUS_POLL_INTERVAL_MS = 5000;
const STATUS_POLL_TIMEOUT_MS = 40 * 60_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientHighTrafficError(status: number, body: string): boolean {
  return status === 404 &&
    body.includes('NETWORK ERROR DUE TO HIGH TRAFFIC') &&
    body.includes('"error_code":1');
}

type GenerationTaskResponse = {
  uid: string;
};

type GenerationStatusResponse = {
  status: string;
  model_base64?: string | null;
  message?: string | null;
};

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fetch(url, init),
      new Promise<Response>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs} ms: ${url}`)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function probeEndpoint(path: string): Promise<ProbeResult> {
  try {
    const res = await fetchWithTimeout(`${HUNYUAN_URL}${path}`, {}, 4000);
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
  const imageBase64 = getImageBase64(spec.filename);
  const payload = {
    image:                imageBase64,
    prompt:               spec.prompt,
    caption:              spec.prompt,
    remove_background:    false,
    texture:              spec.texture,
    seed:                 spec.seed,
    octree_resolution:    256,
    num_inference_steps:  spec.steps,
    guidance_scale:       5.0,
    num_chunks:           8_000,
    face_count:           spec.faceCount,
    type:                 'glb',
  };

  for (let attempt = 1; attempt <= GENERATE_MAX_ATTEMPTS; attempt += 1) {
    const sendRes = await fetchWithTimeout(`${HUNYUAN_URL}/send`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 20 * 60_000);

    if (!sendRes.ok) {
      const body = await sendRes.text();
      if (attempt < GENERATE_MAX_ATTEMPTS && isTransientHighTrafficError(sendRes.status, body)) {
        const delayMs = GENERATE_RETRY_DELAYS_MS[attempt - 1] ?? GENERATE_RETRY_DELAYS_MS[GENERATE_RETRY_DELAYS_MS.length - 1];
        console.log(`   Backend busy (attempt ${attempt}/${GENERATE_MAX_ATTEMPTS}); retrying in ${(delayMs / 1000).toFixed(0)} s`);
        await sleep(delayMs);
        continue;
      }

      throw new Error(`Send ${sendRes.status}: ${body.slice(0, 500)}`);
    }

    const task = await sendRes.json() as GenerationTaskResponse;
    if (!task.uid) {
      throw new Error('Send did not return a task uid');
    }

    console.log(`   Task: ${task.uid}`);
    const startedAt = Date.now();

    while (Date.now() - startedAt < STATUS_POLL_TIMEOUT_MS) {
      await sleep(STATUS_POLL_INTERVAL_MS);

      const statusRes = await fetchWithTimeout(`${HUNYUAN_URL}/status/${task.uid}`, {}, 30_000);
      if (!statusRes.ok) {
        const body = await statusRes.text();
        throw new Error(`Status ${statusRes.status}: ${body.slice(0, 500)}`);
      }

      const status = await statusRes.json() as GenerationStatusResponse;
      if (status.status === 'completed') {
        if (!status.model_base64) {
          throw new Error(`Status completed without model payload for task ${task.uid}`);
        }
        return Buffer.from(status.model_base64, 'base64');
      }

      if (status.status === 'error') {
        const message = status.message ?? 'Unknown generation error';
        if (attempt < GENERATE_MAX_ATTEMPTS && isTransientHighTrafficError(404, message)) {
          const delayMs = GENERATE_RETRY_DELAYS_MS[attempt - 1] ?? GENERATE_RETRY_DELAYS_MS[GENERATE_RETRY_DELAYS_MS.length - 1];
          console.log(`   Backend busy after task start (attempt ${attempt}/${GENERATE_MAX_ATTEMPTS}); retrying in ${(delayMs / 1000).toFixed(0)} s`);
          await sleep(delayMs);
          break;
        }
        throw new Error(`Generation error for task ${task.uid}: ${message}`);
      }

      console.log(`   Status: ${status.status}`);
    }

    if (Date.now() - startedAt >= STATUS_POLL_TIMEOUT_MS) {
      throw new Error(`Generation timed out after ${(STATUS_POLL_TIMEOUT_MS / 60000).toFixed(0)} minutes for task ${task.uid}`);
    }
  }
  throw new Error('Generate failed after retries');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  if (VIEW_API) {
    await viewApi();
    return;
  }

  validateModelCoverage();
  validateHunyuanUrl();

  console.log(`\nHunyuan3D server: ${HUNYUAN_URL}`);
  await checkServer();
  console.log('  Server OK\n');

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(INPUT_DIR, { recursive: true });

  const modelsToGenerate = getModelsToGenerate();
  const skippedModels = !FORCE_REGEN
    ? modelsToGenerate.filter((model) => modelAlreadyExists(model.filename))
    : [];
  const pendingModels = FORCE_REGEN
    ? modelsToGenerate
    : modelsToGenerate.filter((model) => !modelAlreadyExists(model.filename));

  console.log(`  Candidate models: ${modelsToGenerate.length} Turbo Drift models`);
  console.log(`  Required: ${MODELS.filter((model) => model.required).length}`);
  console.log(`  Optional with source images found: ${modelsToGenerate.length - MODELS.filter((model) => model.required).length}`);
  console.log(`  Existing outputs skipped: ${skippedModels.length}${FORCE_REGEN ? ' (disabled by --force)' : ''}`);
  console.log(`  Remaining to generate: ${pendingModels.length}\n`);
  console.log(`  Input images: ${INPUT_DIR}\n`);

  for (const spec of skippedModels) {
    console.log(`↷  ${spec.filename}.glb`);
    console.log(`   Existing: ${getModelOutputPath(spec.filename)}`);
  }

  if (skippedModels.length) {
    console.log();
  }

  for (const spec of pendingModels) {
    console.log(`▶  ${spec.filename}.glb`);
    const hasImage = findInputImagePath(spec.filename) !== null;
    console.log(`   Mode: ${hasImage ? 'image-to-3D' : 'text-to-3D'}`);
    console.log(`   Prompt: ${spec.prompt}`);
    if (hasImage) console.log(`   Reference: ${spec.notes}`);

    const t0  = Date.now();
    const buf = await generate(spec);
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`   Generated in ${secs} s  (${(buf.length / 1024).toFixed(1)} KB)`);

    // Save locally
    const localPath = getModelOutputPath(spec.filename);
    writeFileSync(localPath, buf);
    console.log(`   Local: ${localPath}`);
    console.log();
  }

  console.log('✓  Done — restart the dev server to serve the new models.');
}

main().catch((err: unknown) => {
  console.error('\n✗  Failed:', err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
