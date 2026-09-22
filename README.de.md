# dars-islam

🌐 **Lies dies auf:** [English](README.md) · [Nederlands](README.nl.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [العربية](README.ar.md)

Eine kostenlose Plattform mit kleinen pädagogischen Browserspielen (Phaser/DOM, als PWAs installierbar), die sich vor allem auf islamische Studien und Arabisch konzentriert, daneben aber auch allgemeine Schulfächer (Mathe, Sprache, Naturwissenschaften usw.) abdeckt, plus schulfreundliche Konten für Schüler, Lehrer und Eltern.

💛 **Dieses Projekt unterstützen:** [paypal.me/halgurdh](https://paypal.me/halgurdh) — diese Plattform ist bewusst kostenlos und werbearm; Spenden helfen, das so zu halten.

### ⚠️ Haftungsausschlüsse

- **Mit KI erstelltes Projekt.** 100 % des Codes in diesem Repository wurde mit KI-Unterstützung (Claude Code) geschrieben. Es wurde nicht professionell geprüft — es kann Fehler enthalten, und manche Spiele oder Funktionen funktionieren möglicherweise nicht korrekt. Bitte melde alles Defekte über ein Issue oder einen Pull Request.
- **Islamische Inhalte wurden nicht von einem Gelehrten geprüft.** Fakten, Übersetzungen und arabische Inhalte in den islamischen Lernspielen wurden während der Entwicklung mit [sunnah.com](https://sunnah.com), [quran.com](https://quran.com) und [islamqa.info](https://islamqa.info) abgeglichen, aber **kein qualifizierter islamischer Gelehrter hat dieses Projekt geprüft**. Überprüfe wichtige Inhalte selbst, bevor du dich beim Unterrichten darauf verlässt — besonders bei religiösen Urteilen oder genauem Wortlaut.
- **Kein Ersatz für echten Unterricht.** Diese Spiele sind eine Ergänzung zur regulären Schulbildung und islamischen Erziehung eines Kindes, kein Ersatz dafür — nutze sie *zusätzlich zu*, nicht anstelle von, richtigem Unterricht und qualifizierter Lehre.

---

## Für Schulen, Lehrer, Schüler & Eltern

Jeder kann jedes Spiel als Gast ohne Konto spielen — der Fortschritt (XP, Level, Serien, Abzeichen) wird automatisch auf diesem Gerät gespeichert.

**Schüler** — um einer Klasse beizutreten, bitte deinen Lehrer um einen Klassencode, öffne dann **Mein Dashboard** (verlinkt in der Kopfzeile der Seite) und nutze das Formular „Klasse beitreten“. Das synchronisiert deinen Fortschritt mit der Liste deines Lehrers und gibt dir einen **Familiencode** (auf deinem Dashboard sichtbar), den du mit einem Elternteil teilen kannst.

**Lehrer** — öffne das **Lehrer-Dashboard** über die Kopfzeile der Seite, melde dich mit deiner E-Mail-Adresse an (du bekommst einen Magic-Link per E-Mail, kein Passwort nötig) und erstelle dann eine Schule und eine Klasse. Teile den Klassencode mit deinen Schülern. Von dort aus kannst du die Klassenliste/Bestenliste einsehen und deiner Klasse bestimmte Spiele zuweisen.

**Eltern** — öffne das **Eltern-Dashboard** über die Kopfzeile der Seite, melde dich mit deiner E-Mail-Adresse an und gib den Familiencode ein, den dein Kind mit dir geteilt hat. Du siehst dann seinen Fortschritt (Level, Serien, Abzeichen) und kannst ein tägliches Bildschirmzeitlimit festlegen sowie bestimmte Spiele sperren.

---

## Für Entwickler (Self-Hosting / auf eigenem Server betreiben)

**➡️ Die vollständige Anleitung steht in [SELF_HOSTING.md](SELF_HOSTING.md)** — Supabase-Einrichtung (das Backend für Konten/Fortschritt/Schulen), Docker, GitHub Pages und klassische Server-Deployments.

Kurzreferenz:

```bash
npm install
cp example.env .env.local   # VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY eintragen
npm run dev                 # lokale Entwicklung (Wrapper-Hub + jedes Spiel)
npm run build                # Produktions-Build → dist/
npm test                     # Testsuite ausführen
```

`npm run build` fasst den Wrapper-Hub und alle Spiele zu `dist/` zusammen — ein
einzelner statischer Ordner, überall einsetzbar, wo statische Dateien
ausgeliefert werden. Die App spricht direkt aus dem Browser mit Supabase;
in der Produktion muss kein Serverprozess laufen.

**Docker** (schnellster Weg zum Self-Hosting — baut die Seite und serviert sie mit nginx, im Container läuft sonst nichts):

```bash
cp example.env .env   # Hinweis: .env, nicht .env.local — docker compose liest diese Datei
# VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in .env eintragen
docker compose up --build
# http://localhost:8080 öffnen
```

Oder ohne Compose: `docker build --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... -t darsislam-games .` und dann `docker run -p 8080:80 darsislam-games`. Details siehe [SELF_HOSTING.md](SELF_HOSTING.md) (diese Werte werden beim Build fest eingebettet — Ändern bedeutet, das Image neu zu bauen).

Repo-Struktur:
- `wrapper/` — die öffentliche Hub-Seite (Spielraster, Anmeldung, Dashboards)
- `games/<name>/` — Quellcode + Vite-Konfiguration jedes Spiels
- `shared/` — Code, den sich jedes Spiel teilt (Supabase-Client,
  Fortschritts-Tracking, gemeinsame UI-Kits, i18n)
- `database/supabase/0001_init.sql` — das Postgres-Schema/RLS/RPCs, die
  gegen dein Supabase-Projekt ausgeführt werden
- `scripts/` — Build- und Deploy-Hilfsskripte

Die Ordner `api/`/`database/schema.sql` sind ein veraltetes PHP/MySQL-
Backend, ersetzt durch Supabase — als Referenz aufbewahrt, wird von der
App nicht mehr verwendet.
