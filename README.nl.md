# dars-islam

🌐 **Lees dit in:** [English](README.md) · [Nederlands](README.nl.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [العربية](README.ar.md)

### 🎮 [Nu spelen → halgurdh.github.io/dars-islam](https://halgurdh.github.io/dars-islam/)

Een gratis platform met kleine educatieve browsergames (Phaser/DOM), voornamelijk gericht op islamitische studies en Arabisch naast algemene schoolvakken (rekenen, taal, wetenschap, enz.), plus schoolvriendelijke accounts voor leerlingen, leerkrachten en ouders.

💛 **Steun dit project:** [paypal.me/halgurdh](https://paypal.me/halgurdh) — dit platform is bewust gratis en advertentievrij; donaties helpen dat zo te houden.

Op dit moment draait alles volledig op gratis lagen, maar als dit platform groeit, zijn dit de te verwachten kosten:
- **Supabase** — de gratis laag is voldoende voor een kleine tot middelgrote gebruikersgroep; als veel klassen zich tegelijk aanmelden, kan het Pro-abonnement nodig zijn (~$25/maand) voor meer database-opslag, accounts en bandbreedte.
- **E-mailbezorging** — de ingebouwde e-mailverzender van Supabase heeft strikte limieten; echt gebruik vereist een betaalde SMTP-/e-maildienst.
- **Een eigen domein** (optioneel) — ongeveer €10–15/jaar, in plaats van het gratis `github.io`-subdomein.

Niets hiervan is op dit moment nodig — donaties zouden er simpelweg voor zorgen dat dit soepel kan opschalen als het platform aanslaat.

### ⚠️ Disclaimers

- **Dit project is met AI gebouwd.** 100% van de code in deze repository is geschreven met AI-hulp (Claude Code). Het is niet professioneel gecontroleerd — er kunnen bugs in zitten en sommige games of functies werken mogelijk niet correct. Meld gerust iets kapots via een issue of pull request.
- **Islamitische inhoud is niet door een geleerde beoordeeld.** Feiten, vertalingen en Arabische inhoud in de islamitische games zijn tijdens de ontwikkeling gecontroleerd aan de hand van [sunnah.com](https://sunnah.com), [quran.com](https://quran.com) en [islamqa.info](https://islamqa.info), maar **geen gekwalificeerde islamitische geleerde heeft dit project beoordeeld**. Controleer belangrijke zaken zelf voordat je erop vertrouwt voor onderwijs, zeker bij religieuze oordelen of precieze bewoording.
- **Geen vervanging voor echt onderwijs.** Deze games zijn een aanvulling op het reguliere schoolonderwijs en de islamitische opvoeding van een leerling, geen vervanging ervan — gebruik ze *naast*, niet in plaats van, goed klassikaal onderwijs en gekwalificeerd lesgeven.

---

## Voor scholen, leerkrachten, leerlingen & ouders

Iedereen kan elke game als gast spelen, zonder account — voortgang (XP, levels, reeksen, badges) wordt automatisch op dat apparaat opgeslagen.

**Leerlingen** — vraag je leerkracht om een klascode, open dan **Mijn Dashboard** (gelinkt in de site-header) en gebruik het formulier "Klas joinen". Dit synchroniseert je voortgang met het klasoverzicht van je leerkracht en geeft je een **Familiecode** (te zien op je dashboard) om met een ouder te delen.

**Leerkrachten** — open **Docentendashboard** vanuit de site-header, log in met je e-mailadres (je krijgt een magische inloglink gemaild, geen wachtwoord nodig), en maak vervolgens een school en een klas aan. Deel de klascode met je leerlingen. Van daaruit kun je het klasoverzicht/scorebord bekijken en specifieke games aan je klas toewijzen.

**Ouders** — open **Ouderdashboard** vanuit de site-header, log in met je e-mailadres en voer de familiecode in die je kind met je heeft gedeeld. Je ziet dan hun voortgang (level, reeksen, badges) en kunt een dagelijkse schermtijdlimiet instellen en specifieke games blokkeren.

---

## Voor ontwikkelaars (self-hosting / op je eigen server draaien)

**➡️ Zie [SELF_HOSTING.md](SELF_HOSTING.md) voor de volledige handleiding** — Supabase-instellingen (de backend voor accounts/voortgang/scholen), Docker, GitHub Pages en traditionele serverdeployments.

Snelle referentie:

```bash
npm install
cp example.env .env.local   # vul VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in
npm run dev                 # lokale ontwikkeling (wrapper-hub + elke game)
npm run build                # productiebuild → dist/
npm test                     # testsuite draaien
```

`npm run build` bouwt de wrapper-hub en alle games samen tot `dist/` — één
statische map, overal te deployen waar statische bestanden worden geserveerd.
De app praat rechtstreeks vanuit de browser met Supabase; er hoeft geen
serverproces in productie te draaien.

Na het uitvoeren van de SQL-migraties zijn er ook twee Supabase **dashboard**-instellingen nodig (geen SQL) voordat accounts werken:
- **Authentication → Providers**: bevestig dat E-mail (magic link) is ingeschakeld, en schakel **Anonymous sign-ins** in (nodig voor de leerlingflow zonder e-mail).
- **Authentication → Emails**: stel een echte SMTP-provider in voordat je hier voor meer dan testen op vertrouwt — de ingebouwde afzender van Supabase heeft strikte ratelimieten.

**Docker** (snelste manier om self-hosted te draaien — bouwt de site en serveert 'm met nginx, er draait verder niets in de container):

```bash
cp example.env .env   # let op: .env, niet .env.local — docker compose leest dit bestand
# vul VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in in .env
docker compose up --build
# open http://localhost:8080
```

Of zonder compose: `docker build --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... -t darsislam-games .` en dan `docker run -p 8080:80 darsislam-games`. Zie [SELF_HOSTING.md](SELF_HOSTING.md) voor details (deze waarden worden tijdens het bouwen vastgelegd, dus wijzigen betekent de image opnieuw bouwen).

Mappenstructuur:
- `wrapper/` — de publieke hub-site (spelraster, inloggen, dashboards)
- `games/<naam>/` — de broncode + Vite-configuratie van elke game
- `shared/` — code die elke game deelt (Supabase-client, voortgangs-
  tracking, gedeelde UI-kits, i18n)
- `database/supabase/0001_init.sql` — het Postgres-schema/RLS/RPC's om
  tegen je Supabase-project te draaien
- `scripts/` — build- en deployhelpers

De mappen `api/`/`database/schema.sql` zijn een verouderde PHP/MySQL-
backend, vervangen door Supabase — bewaard ter referentie, wordt niet meer
door de app gebruikt.
