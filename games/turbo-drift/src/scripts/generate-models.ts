#!/usr/bin/env tsx
/**
 * generate-models
 *
 * 1. Generates GLB assets via the 3D AI Studio API (Hunyuan3D 3.5).
 * 2. Saves them locally to public/assets/models/.
 * 3. Uploads them to the HuggingFace bucket cdgbrands/Hunyuan3D-2.1-bucket.
 *
 * Token requirements (fine-grained at huggingface.co/settings/tokens):
 *   - Repositories → Read   (whoami / token validation)
 *   - Repositories → Write  (upload to bucket)
 *
 * API key source (3D AI Studio):
 *   https://www.3daistudio.com → Dashboard → API Keys
 *
 * Both keys are read from the root .env:
 *   HUGGINGFACE_API_KEY=hf_xxx
 *   THREEDAI_API_KEY=xxx
 *
 * Usage:
 *   npm run generate-models           (from games/turbo-drift/)
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

const HF_TOKEN      = process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN ?? '';
const THREEDAI_KEY  = process.env.THREEDAI_API_KEY    ?? '';
const BUCKET        = 'cdgbrands/Hunyuan3D-2.1-bucket';
const THREEDAI_BASE = 'https://api.3daistudio.com';
const OUT_DIR       = join(__dirname, '../../public/assets/models');

// Public download URL for a file in the bucket
const bucketUrl = (path: string) =>
  `https://huggingface.co/buckets/${BUCKET}/resolve/${path}`;

interface ModelSpec { filename: string; prompt: string; faceCount: number }

const MODELS: ModelSpec[] = [
  {
    filename: 'car',
    faceCount: 30_000,
    prompt:
      'Low-poly arcade race car, futuristic sleek design, aerodynamic body with smooth curves, ' +
      'wide racing stance, sport rear spoiler, neon accent stripe along the side, ' +
      'glossy metallic paint, four visible racing tires, front bumper with air intakes, ' +
      'small side mirrors, game-ready clean geometry, car centered at origin facing +Z, ' +
      'no background, transparent floor',
  },
  {
    filename: 'grandstand',
    faceCount: 20_000,
    prompt:
      'Futuristic night-time racing circuit grandstand, low-poly game asset, ' +
      'stepped concrete seating rows rising from front to back, thin metal roof canopy ' +
      'with a glowing neon strip light underneath, colorful team banners on the front railing, ' +
      'clean boxy geometry, no spectators, isolated 3D asset, no background',
  },
  {
    filename: 'tree',
    faceCount: 8_000,
    prompt:
      'Stylized low-poly palm tree, game asset, slightly curved thick trunk, ' +
      '6 green fronds at the top, night-time neon race track decoration, ' +
      'tree base at origin, no background',
  },
];

// ---------------------------------------------------------------------------
// Preflight checks
// ---------------------------------------------------------------------------

async function validateHfToken(token: string): Promise<string> {
  const res  = await fetch('https://huggingface.co/api/whoami', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json() as { name?: string; error?: string };
  if (!res.ok || json.error) {
    throw new Error(
      'HuggingFace token is invalid or expired.\n' +
      '  → Renew at https://huggingface.co/settings/tokens\n' +
      '  → Fine-grained token needs: Repositories → Read + Write\n' +
      '  → Update HUGGINGFACE_API_KEY in root .env',
    );
  }
  return json.name ?? '(unknown)';
}

// ---------------------------------------------------------------------------
// 3D AI Studio (Hunyuan3D 3.5) generation
// ---------------------------------------------------------------------------

interface SubmitResp   { task_id: string }
interface StatusResult { asset_url?: string; asset?: string }
interface StatusResp   { status: 'FINISHED' | 'IN_PROGRESS' | 'FAILED'; progress?: number; results?: StatusResult[]; failure_reason?: string }

const threedaiHeaders = {
  Authorization: `Bearer ${THREEDAI_KEY}`,
  'Content-Type': 'application/json',
};

async function submitGeneration(spec: ModelSpec): Promise<string> {
  const res = await fetch(`${THREEDAI_BASE}/v1/3d-models/tencent/generate/pro/`, {
    method: 'POST',
    headers: threedaiHeaders,
    body: JSON.stringify({ model: '3.5', prompt: spec.prompt, enable_pbr: true, face_count: spec.faceCount }),
  });
  if (!res.ok) throw new Error(`Submit ${res.status}: ${await res.text()}`);
  return ((await res.json()) as SubmitResp).task_id;
}

async function pollUntilDone(taskId: string): Promise<string> {
  const spin    = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  const deadline = Date.now() + 15 * 60_000;
  let tick = 0;

  while (Date.now() < deadline) {
    await sleep(6_000);
    const res  = await fetch(`${THREEDAI_BASE}/v1/generation-request/${taskId}/status/`, { headers: threedaiHeaders });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const json = await res.json() as StatusResp;

    const pct = json.progress != null ? ` ${json.progress}%` : '';
    process.stdout.write(`\r  ${spin[tick++ % spin.length]} ${json.status}${pct}   `);

    if (json.status === 'FAILED') {
      process.stdout.write('\n');
      throw new Error(`Generation failed: ${json.failure_reason ?? 'unknown'}`);
    }
    if (json.status === 'FINISHED') {
      process.stdout.write('\n');
      const r = json.results?.[0];
      const url = r?.asset_url ?? r?.asset;
      if (!url) throw new Error('Finished but no asset URL');
      return url;
    }
  }
  throw new Error('Timed out waiting for Hunyuan3D');
}

// ---------------------------------------------------------------------------
// Bucket upload
// ---------------------------------------------------------------------------

async function uploadToBucket(buf: Buffer, remotePath: string): Promise<void> {
  await uploadFile({
    repo: { type: 'bucket', name: BUCKET },
    accessToken: HF_TOKEN,
    file: {
      path: remotePath,
      content: new Blob([buf], { type: 'model/gltf-binary' }),
    },
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Preflight
  if (!HF_TOKEN) {
    throw new Error('HUGGINGFACE_API_KEY not found in .env\n  → Add it to the root .env file');
  }
  if (!THREEDAI_KEY) {
    throw new Error(
      'THREEDAI_API_KEY not found in .env\n' +
      '  → Get a key at https://www.3daistudio.com → Dashboard → API Keys\n' +
      '  → Add THREEDAI_API_KEY=xxx to the root .env file',
    );
  }

  console.log('\nValidating HuggingFace token…');
  const username = await validateHfToken(HF_TOKEN);
  console.log(`  Authenticated as: ${username}`);

  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Local output: ${OUT_DIR}`);
  console.log(`Bucket: https://huggingface.co/buckets/${BUCKET}\n`);

  for (const spec of MODELS) {
    console.log(`▶  ${spec.filename}.glb`);

    // 1. Generate
    console.log('   Submitting to Hunyuan3D 3.5…');
    const taskId = await submitGeneration(spec);
    console.log(`   Task: ${taskId}`);
    process.stdout.write('   Progress: ');
    const assetUrl = await pollUntilDone(taskId);

    // 2. Download GLB
    console.log('   Downloading…');
    const glbRes = await fetch(assetUrl);
    if (!glbRes.ok) throw new Error(`GLB fetch ${glbRes.status}`);
    const buf = Buffer.from(await glbRes.arrayBuffer());
    console.log(`   Size: ${(buf.length / 1024).toFixed(1)} KB`);

    // 3. Save locally
    const localPath = join(OUT_DIR, `${spec.filename}.glb`);
    writeFileSync(localPath, buf);
    console.log(`   Local: ${localPath}`);

    // 4. Upload to HF bucket
    console.log(`   Uploading to bucket…`);
    await uploadToBucket(buf, `${spec.filename}.glb`);
    console.log(`   Bucket: ${bucketUrl(`${spec.filename}.glb`)}`);
    console.log();
  }

  console.log('✓  All models generated and uploaded.');
  console.log('   Restart the dev server to serve the local models.');
  console.log(`   Bucket CDN: https://huggingface.co/buckets/${BUCKET}`);
  process.exit(0);
}

main().catch((err: unknown) => {
  console.error('\n✗  Failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
