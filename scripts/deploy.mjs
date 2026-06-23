#!/usr/bin/env node
import { spawnSync } from 'child_process';

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  return res.status === 0;
}

function available(cmd) {
  const check = spawnSync(cmd, ['--version'], { stdio: 'ignore', shell: false });
  return check.status === 0;
}

const HOST = process.env.DEPLOY_HOST || 'minitoon.games';
const USER = process.env.DEPLOY_USER || process.env.USER || process.env.USERNAME || 'www';
const PATH_ON_SERVER = process.env.DEPLOY_PATH || '/var/www/minitoon.games';
const SSH_PORT = process.env.SSH_PORT || '22';
const DRY = process.argv.includes('--dry') || process.env.DRY_RUN === '1';

console.log(`Building project (using scripts/build.mjs)...`);
if (!run('node', ['scripts/build.mjs'])) {
  console.error('Build failed — aborting deploy.');
  process.exit(1);
}

console.log(`Deploying to ${USER}@${HOST}:${PATH_ON_SERVER}` + (DRY ? ' (dry-run)' : ''));

if (available('rsync')) {
  const rsyncArgs = ['-az', '--delete', '-e', `ssh -p ${SSH_PORT}`];
  if (DRY) rsyncArgs.push('--dry-run');
  rsyncArgs.push('dist/');
  rsyncArgs.push(`${USER}@${HOST}:${PATH_ON_SERVER}`);
  if (!run('rsync', rsyncArgs)) process.exit(2);
  process.exit(0);
}

// Fallback to scp if rsync isn't available
if (available('scp')) {
  // Note: scp may not create the destination directory on the remote host.
  const scpArgs = ['-r', '-P', SSH_PORT, 'dist/*', `${USER}@${HOST}:${PATH_ON_SERVER}`];
  if (!run('scp', scpArgs)) process.exit(3);
  process.exit(0);
}

console.error('Neither `rsync` nor `scp` is available on this machine. Install one of them or deploy manually.');
process.exit(4);
