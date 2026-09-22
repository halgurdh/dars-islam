# Self-hosting darsislam.Games

This is a fully open-source, static frontend (a Vite-built multi-page site: a
wrapper hub + ~40 standalone Phaser/DOM games, each installable as its own
PWA) backed by [Supabase](https://supabase.com) (Postgres + Auth) for
accounts, progress sync, and the student/teacher/parent school system.
Nothing here requires a server you have to run yourself for the app logic —
Supabase is called directly from the browser — but you do need *somewhere*
to serve the built static files.

**Supabase is optional.** Every game is fully playable as a guest with no
account at all — progress (XP, levels, streaks, badges) is saved to
`localStorage` on that device regardless of Supabase. If you don't set
`VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`, the site still builds
and runs fine; you only lose account sign-in, cross-device progress sync,
and the student/teacher/parent school features (sign-in/dashboard links
degrade to a "not configured" state instead of erroring). Skip straight to
[section 3](#3-local-development) if you just want guest-mode games running
quickly, and come back to section 1 later if you decide you want accounts.

## Architecture in one paragraph

`npm run build` compiles the wrapper and every game (each its own Vite
project) into a single `dist/` folder of static files. That folder is the
entire deployable artifact — serve it from anywhere that can serve static
files (GitHub Pages, Docker+nginx, Netlify, a plain VPS, S3, etc.). At
runtime, the pages in `dist/` call your Supabase project directly via
`@supabase/supabase-js` for sign-in, profile/XP sync, and the
school/class/parent features. There is no Node/PHP process to keep running
in production.

## 1. One-time Supabase setup

1. Create a project at [supabase.com](https://supabase.com) (or self-host
   Supabase's own open-source stack via Docker if you'd rather not use
   their managed service — see [supabase/docker](https://github.com/supabase/supabase/tree/master/docker)).
2. Open the SQL Editor and run, **in order**:
   - [`database/supabase/0001_init.sql`](database/supabase/0001_init.sql) —
     every table, RLS policy, and RPC function the core app needs
     (profiles, schools/classes/students, parent links, parental controls,
     etc.).
   - [`database/supabase/0002_features.sql`](database/supabase/0002_features.sql) —
     additive: the lenient per-game report card, class announcements,
     homework due dates, attendance tracking, a private teacher note per
     student, and organization type/welcome message (so "School" can read
     as "Mosque", "Homeschool", etc.). Both files are safe to re-run against
     a fresh project.
3. In **Authentication → Providers**, confirm **Email** (magic link) is
   enabled, and enable **Anonymous sign-ins** (used for the no-email
   student join-a-class flow).
4. In **Authentication → Emails**, configure a real SMTP provider before
   relying on this for anything beyond testing — Supabase's built-in
   sender has strict rate limits.
5. Copy your **Project URL** and **anon/publishable key** from
   **Project Settings → API** — you'll need both next.

## 2. Configuration

```bash
cp example.env .env.local   # for local dev (npm run dev / npm run build)
```

Fill in at minimum:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY_HERE
```

Leave `VITE_BASE_PATH` unset unless you're deploying to a GitHub Pages
*subpath* URL (`username.github.io/repo-name/`) rather than your own
domain — see `example.env` for details.

## 3. Local development

```bash
npm install
npm run dev
```

This starts the wrapper hub plus a dev server per game (see
`scripts/dev.mjs`), all proxied together. Open the URL it prints.

## 4. Docker (recommended for self-hosting)

The included `Dockerfile` builds the static site and serves it with nginx
— nothing else runs inside the container.

**Quickest path (docker compose):**

```bash
cp example.env .env   # note: .env, not .env.local — docker compose reads this one
# fill in VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env
docker compose up --build
```

Open `http://localhost:8080`.

**Manual `docker build`/`run` (e.g. on a server, no compose):**

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY_HERE \
  -t darsislam-games .

docker run -d -p 80:80 --restart unless-stopped darsislam-games
```

Because `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` are baked into
the built JavaScript at **build time** (Vite resolves `import.meta.env`
when it compiles, not when the container starts), changing them means
rebuilding the image — they're `docker build --build-arg`s, not something
you can override with `docker run -e`.

Put the container behind whatever reverse proxy/TLS terminator you
already use (nginx, Caddy, Traefik, your cloud provider's load balancer) —
the image itself just serves plain HTTP on port 80.

## 5. Other deployment options

- **GitHub Pages**: push to `main` and the included
  `.github/workflows/deploy-gh-pages.yml` builds and deploys automatically,
  once you've added `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` as
  repo Actions secrets and set **Settings → Pages → Source** to
  "GitHub Actions". Free, no Docker needed.
- **Any static host** (Netlify, Vercel, S3+CloudFront, a plain VPS with
  nginx you manage yourself): run `npm run build`, upload/serve `dist/`.
  `scripts/deploy-sftp.mjs` is included if you want to push `dist/` over
  SFTP to a server you control (`npm run deploy`, configured via the
  `DEPLOY_*` variables in `example.env`).

## Notes for anyone porting/forking this

- The `api/` (PHP) and `database/schema.sql` (MySQL) files in this repo are
  the **previous** backend, superseded by Supabase — they're kept for
  reference but nothing in the app calls them anymore. You can delete them
  in a fork if you don't need the history.
- Every game and the wrapper share one Supabase project/schema — there's no
  per-game backend, just shared `profiles`/`schools`/`classes`/etc. tables.
- See the root [README.md](README.md) for the AI-generated-project
  disclaimer and general build/test commands.
