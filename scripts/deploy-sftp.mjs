#!/usr/bin/env node
import SftpClient from 'ssh2-sftp-client';
import { existsSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

// Load .env similar to deploy.mjs (if present)
import { readFileSync } from 'fs';
import { cwd } from 'process';
try {
  const envPath = join(cwd(), '.env');
  if (existsSync(envPath)) {
    const envText = readFileSync(envPath, 'utf8');
    for (const rawLine of envText.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      let key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      // Support lines like 'export KEY=VALUE' (common in some .env files)
      if (key.startsWith('export ')) key = key.replace(/^export\s+/, '');
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Prefer .env values for deploy keys — overwrite if present
      process.env[key] = val;
    }
  }
} catch (e) {
  // ignore
}

// Debug: print resolved DEPLOY_USER source to help with troubleshooting
// Show resolved values useful for debugging (mask password/private key)
const _mask = v => v ? (v.length > 8 ? v.slice(0,4)+'…'+v.slice(-4) : '****') : '(none)';
console.log('CWD:', cwd());
console.log('.env path:', join(cwd(), '.env'), 'exists:', existsSync(join(cwd(), '.env')));
console.log('Resolved deploy user:', process.env.DEPLOY_USER || process.env.USER || process.env.USERNAME || '(none)');
console.log('DEPLOY_HOST:', process.env.DEPLOY_HOST || '(none)');
console.log('DEPLOY_PATH:', process.env.DEPLOY_PATH || '(none)');
console.log('SSH_PORT:', process.env.SSH_PORT || '(none)');
console.log('DEPLOY_PASSWORD set:', !!process.env.DEPLOY_PASSWORD, 'value:', _mask(process.env.DEPLOY_PASSWORD));
console.log('DEPLOY_SSH_KEY set:', !!process.env.DEPLOY_SSH_KEY, 'value:', process.env.DEPLOY_SSH_KEY ? '[present]' : '(none)');

const HOST = process.env.DEPLOY_HOST || 'darsislam';
const USER = process.env.DEPLOY_USER || process.env.USER || process.env.USERNAME || 'www';
const PATH_ON_SERVER = process.env.DEPLOY_PATH || '/var/www/darsislam';
const SSH_PORT = parseInt(process.env.SSH_PORT || '22', 10);
const PASSWORD = process.env.DEPLOY_PASSWORD || undefined;
const PRIVATE_KEY = process.env.DEPLOY_SSH_KEY || undefined; // raw key or path

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  return res.status === 0;
}

console.log('Building project...');
if (!run('node', ['scripts/build.mjs'])) {
  console.error('Build failed — aborting deploy.');
  process.exit(1);
}

const sftp = new SftpClient();

async function ensureDir(remotePath) {
  try {
    const stat = await sftp.stat(remotePath).catch(() => null);
    if (!stat) {
      await sftp.mkdir(remotePath, true);
    }
  } catch (err) {
    // ignore
  }
}

async function uploadDir(localDir, remoteDir) {
  const items = readdirSync(localDir);
  await ensureDir(remoteDir);
  for (const item of items) {
    const localPath = join(localDir, item);
    const remotePath = `${remoteDir.replace(/\/$/, '')}/${item}`;
    const st = statSync(localPath);
    if (st.isDirectory()) {
      await uploadDir(localPath, remotePath);
    } else if (st.isFile()) {
      await sftp.fastPut(localPath, remotePath);
    }
  }
}

(async () => {
  const connectCfg = {
    host: HOST,
    port: SSH_PORT,
    username: USER,
  };
  if (PASSWORD) connectCfg.password = PASSWORD;
  if (PRIVATE_KEY) connectCfg.privateKey = PRIVATE_KEY.startsWith('-----') ? PRIVATE_KEY : undefined;

  try {
    console.log(`Connecting to ${USER}@${HOST}:${SSH_PORT} via SFTP...`);
    await sftp.connect(connectCfg);
    console.log('Connected — uploading `dist/` to', PATH_ON_SERVER);
    await uploadDir('dist', PATH_ON_SERVER);
    console.log('Upload complete.');
    await sftp.end();
    process.exit(0);
  } catch (err) {
    console.error('SFTP deploy failed:', err.message || err);
    try { await sftp.end(); } catch (e) {}
    process.exit(2);
  }
})();
