# minitoon.games — Monorepo

This repository is the monorepo for Minitoon Arcade: a small multi-app
platform that hosts web PWAs (games) plus a wrapper hub. Each game is
contained in `games/<game-name>/` and may have its own README and
build instructions.

This README covers project-level workflows: how to develop, build and
deploy the assembled `dist/` site which serves all games under
`/games/<name>/`.

Quick links
- **Project root:** this README
- **Games:** [games](games) (each game is a subfolder; see the game's README)
- **Wrapper (hub):** [wrapper](wrapper)

Requirements
- Node 18+ (recommended)
- Git, SSH access to deploy target (for automated deploy)

Development
1. Install dependencies:

```bash
npm install
```

2. Run the development environment (multi-app dev server):

```bash
npm run dev
# opens the wrapper; games are served under /games/<name>/ dev ports
```

Build (production)

```bash
npm run build
```

This builds the wrapper and each game, then assembles `dist/`:
- `dist/index.html` — wrapper hub
- `dist/games/<game>/` — each game's production build, manifest and service worker

Environment

- Repo-wide Vite variables belong in the repo-root `.env.local`.
- `games/board-rush` now reads env from the repo root during build.
- For the shared multiplayer room service, set `VITE_MULTIPLAYER_URL` in the repo root for production builds.

Multiplayer

- `Board Rush` now targets a central WebSocket room service instead of browser-to-browser WebRTC.
- Run the local service with `node scripts/multiplayer-server.mjs`, or just use `npm run dev` which now starts it automatically on `ws://localhost:8787`.
- The room server uses per-game room namespaces so it can host many simultaneous rooms across multiple games.

Preview the production build locally:

```bash
npm run preview
# or: npx serve dist -p 5174
```

Deploy

Use the included deploy helper (node + PowerShell versions are provided):

```bash
# configure environment variables or rely on defaults
export DEPLOY_HOST=minitoon.games
export DEPLOY_USER=youruser
export DEPLOY_PATH=/var/www/minitoon.games
export SSH_PORT=22

npm run deploy
```

The script builds the project and syncs `dist/` to the remote host using
`rsync` if available, falling back to `scp`.

SFTP option (password or key)

If your host prefers SFTP, you can use the included SFTP deploy script which
uploads `dist/` over SFTP. It supports password or private-key auth via
environment variables or a `.env` file.

Create a `.env` with:

```
DEPLOY_HOST=minitoon.games
DEPLOY_USER=youruser
DEPLOY_PATH=/var/www/minitoon.games
SSH_PORT=22
# Either:
DEPLOY_PASSWORD=your-password
# or (preferred):
DEPLOY_SSH_KEY="-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"
```

Run:

```bash
npm run deploy:sftp
```

The script builds the project then uploads the `dist/` directory via SFTP.

SSH key (recommended)

The deploy helper works best with SSH key authentication — it's more secure
and allows non-interactive CI deploys. Steps:

Local setup:


# then run deploy (values can live in .env or env vars)
npm run deploy
```

CI (GitHub Actions) — use a secret:

1. Add your private key as repository secret `DEPLOY_SSH_KEY`.
2. Use an ssh-agent action in the workflow and run the deploy script:

```yaml
- uses: webfactory/ssh-agent@v0.5.3
  with:
    ssh-private-key: ${{ secrets.DEPLOY_SSH_KEY }}
- run: |
    npm ci
    DEPLOY_USER=${{ secrets.DEPLOY_USER }} DEPLOY_HOST=${{ secrets.DEPLOY_HOST }} DEPLOY_PATH=${{ secrets.DEPLOY_PATH }} npm run deploy
```

If your host only supports password-based SFTP, consider using an SFTP action
like `appleboy/sftp-action` with a stored secret, but SSH keys are strongly
preferred.

Files of interest
- `scripts/build.mjs` — builds wrapper + games and assembles `dist/`
- `scripts/deploy.mjs` / `scripts/deploy.ps1` — deploy helpers
- `wrapper/` — the public hub site that links games
- `games/<name>/` — game source + Vite config

Notes
- Each game is responsible for its own manifest and service worker; the
  build process assembles them under `dist/games/<name>/` so each game
  can operate as a scoped PWA.
- If you maintain separate per-game READMEs, put them in the game's
  folder. For board-rush-specific docs see [games/board-rush README].

Want me to add a short developer troubleshooting section (common
errors, how to inspect the PWA manifest, service worker issues)?

Electron build (Windows .exe)

This repository includes helper scripts and a CI workflow to produce a
Windows executable using Electron + electron-builder.

Local (Windows) build steps:

```powershell
# 1) Install packaging deps (one-time)
npm install --save-dev electron electron-builder

# 2) Build web assets and run Electron locally
npm run electron:dev

# 3) Produce a portable installer / exe
npm run electron:build
```

CI build

A GitHub Actions workflow (`.github/workflows/electron-build-windows.yml`) will run on pushes to `main` and produce a `dist/` artifact with Windows build outputs.

# Adsense link
```
const PROVIDER: Provider = 'adsense';        // line 1
const ADSENSE_PUB  = 'ca-pub-XXXXXXXX';      // line 2
const ADSENSE_SLOT = 'XXXXXXXXXX';           // line 3

```
# STRIPE

```
Create a product + €20/month recurring price → copy prod_XXXX as STRIPE_PRODUCT_ID
Add webhook → point to https://minitoon.games/api/stripe/webhook.php
Listen for: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
Copy the webhook signing secret → set as STRIPE_WEBHOOK_SECRET in api/_config.php
```
