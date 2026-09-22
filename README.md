# dars-islam

🌐 **Read this in:** [English](README.md) · [Nederlands](README.nl.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [العربية](README.ar.md)

A free platform of small educational browser games (Phaser/DOM, installable as PWAs), mostly focused on Islamic studies and Arabic alongside general school subjects (math, language arts, science, etc.), plus school-friendly accounts for students, teachers, and parents.

### ⚠️ Disclaimers

- **AI-built project.** 100% of the code in this repository was written with AI assistance (Claude Code). It has not been professionally audited — it may contain bugs, and some games or features may not work correctly. Please report anything broken via an issue or pull request.
- **Islamic content has not been scholar-reviewed.** Facts, translations, and Arabic content in the Islamic-studies games were checked against [sunnah.com](https://sunnah.com), [quran.com](https://quran.com), and [islamqa.info](https://islamqa.info) during development, but **no qualified Islamic scholar has reviewed this project**. Verify anything important independently before relying on it for teaching, especially religious rulings or precise wording.
- **Not a replacement for real education.** These games are a supplement to a student's regular schooling and Islamic education, not a substitute for it — use them *in addition to*, not instead of, proper classroom instruction and qualified teaching.

---

## For schools, teachers, students & parents

Everyone can play every game as a guest with no account — progress (XP, levels, streaks, badges) is saved on that device automatically.

**Students** — to join a class, ask your teacher for a class code, then open **My Dashboard** (linked from the site header) and use the "Join a Class" form. This syncs your progress to your teacher's roster and gives you a **Family Code** (shown on your dashboard) to share with a parent.

**Teachers** — open **Teacher Dashboard** from the site header, sign in with your email (a magic sign-in link is emailed to you, no password), then create a school and a class. Share the class's join code with your students. From there you can view your class roster/leaderboard and assign specific games to your class.

**Parents** — open **Parent Dashboard** from the site header, sign in with your email, and enter the Family Code your child shared with you. You'll see their progress (level, streaks, badges) and can set a daily screen-time limit and block specific games.

---

## For developers (self-hosting / running on your own server)

**➡️ See [SELF_HOSTING.md](SELF_HOSTING.md) for the full guide** — Supabase setup (the backend for accounts/progress/schools), Docker, GitHub Pages, and traditional server deploys.

Quick reference:

```bash
npm install
cp example.env .env.local   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev                 # local development (wrapper hub + every game)
npm run build                # production build → dist/
npm test                     # run the test suite
```

`npm run build` assembles the wrapper hub and all games into `dist/` — a
single static folder, deployable anywhere that serves static files. The
app talks to Supabase directly from the browser; there's no server process
to run in production.

**Docker** (fastest way to self-host — builds the site and serves it with nginx, nothing else runs in the container):

```bash
cp example.env .env   # note: .env, not .env.local — docker compose reads this one
# fill in VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env
docker compose up --build
# open http://localhost:8080
```

Or without compose: `docker build --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... -t darsislam-games .` then `docker run -p 8080:80 darsislam-games`. See [SELF_HOSTING.md](SELF_HOSTING.md) for details (these values are baked in at build time, so changing them means rebuilding the image).

Repo layout:
- `wrapper/` — the public hub site (game grid, sign-in, dashboards)
- `games/<name>/` — each game's own source + Vite config
- `shared/` — code shared across every game (Supabase client, progress
  tracking, shared UI kits, i18n)
- `database/supabase/0001_init.sql` — the Postgres schema/RLS/RPCs to run
  against your Supabase project
- `scripts/` — build and deploy helpers

The `api/`/`database/schema.sql` folders are a legacy PHP/MySQL backend,
superseded by Supabase — kept for reference, not used by the app anymore.
