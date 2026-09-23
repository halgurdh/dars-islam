# dars-islam — Free Islamic Education Games for Kids

🌐 **Read this in:** [English](README.md) · [Nederlands](README.nl.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [العربية](README.ar.md)

### 🎮 [Play now → halgurdh.github.io/dars-islam](https://halgurdh.github.io/dars-islam/)

![Games](https://img.shields.io/badge/games-40%2B-blue) ![Languages](https://img.shields.io/badge/UI%20languages-6-green) ![Built with](https://img.shields.io/badge/built%20with-Phaser%20%2B%20TypeScript-orange) ![PWA](https://img.shields.io/badge/installable-PWA-purple) ![Ad-free](https://img.shields.io/badge/ads-none-brightgreen)

**dars-islam is a free, open-source Islamic education platform** — 40+ small educational browser games ([Phaser](https://phaser.io)/TypeScript, installable as [Progressive Web Apps](https://web.dev/progressive-web-apps/)) for kids learning **Islamic studies, Quran, Arabic alphabet, Islamic history, duas, and the 99 names of Allah**, alongside core school subjects — **math, geography, science, language arts, world history, and language learning (Dutch, German, Spanish, French, Arabic)**. Built for **Islamic education at home, in a madrasa, weekend Islamic school, or a general K-12 classroom**, with school-friendly accounts for students, teachers, and parents. Ad-free, no tracking, available in 6 UI languages: English, Dutch, German, Spanish, French, and Arabic.

💛 **Support this project:** [paypal.me/halgurdh](https://paypal.me/halgurdh) — this is free and ad-free by choice; donations help keep it that way.

### 📚 Subjects & games

- **Islamic Education** — Asma ul-Husna (99 Names of Allah), Fiqh Essentials, Salah Builder, Duas Builder, Pillars of Islam, Seerah Timeline (Prophet's biography), Juz' Amma Match (Quran memorization), Huruf (Arabic alphabet) Builder, Islamic Months Builder, Prophets Builder
- **Arabic & Language Learning** — Arabic Grammar, Letter Trace, Word Explorer, Phrase Explorer (everyday phrases in Dutch/German/Spanish/French/Arabic)
- **Math** — Number Basics, Algebra, Geometry, Trigonometry, Pre-Calculus, Statistics & Probability, Times Table Dojo, Mental Math Sprint, Pattern Play
- **General & Science** — Geography, World History, Civics & Community, Earth & Space Science, Health & the Body, Digital Literacy, World Cultures, Language Arts

Every game supports multiple modes where applicable (Match, Quiz, Sequence, True/False, Fill-in-the-Blank, Listen & Identify, Flashcard Review), so the same content can be practiced several ways — useful for Islamic education specifically, where recall (memorizing duas, the 99 names, Quran order) matters as much as comprehension.

Everything today runs entirely on free tiers, but if this grows, the likely costs would be:
- **Supabase** — the free tier covers a small/medium userbase; a lot of classes signing up at once could need the Pro plan (~$25/month) for more database storage, auth users, and bandwidth.
- **Email delivery** — Supabase's built-in sign-in email sender has strict rate limits; real usage needs a paid SMTP/email provider.
- **A custom domain** (optional) — roughly €10–15/year, instead of the free `github.io` subdomain.

Nothing above is needed right now — donations would just go toward scaling this smoothly if it ever takes off.

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

After running the SQL migrations, two Supabase **dashboard** settings (not SQL) are also required before accounts work:
- **Authentication → Providers**: confirm Email (magic link) is enabled, and enable **Anonymous sign-ins** (required for the no-email student join flow).
- **Authentication → Emails**: set up a real SMTP provider before relying on this beyond testing — Supabase's built-in sender has strict rate limits.

**Docker** (fastest way to self-host — builds the site and serves it with nginx, nothing else runs in the container):

```bash
cp example.env .env   # note: .env, not .env.local — docker compose reads this one
# fill in VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env
docker compose up --build
# open http://localhost:8080
```

Or without compose: `docker build --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... -t dars-islam-games .` then `docker run -p 8080:80 dars-islam-games`. See [SELF_HOSTING.md](SELF_HOSTING.md) for details (these values are baked in at build time, so changing them means rebuilding the image).

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
