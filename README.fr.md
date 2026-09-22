# dars-islam

🌐 **Lire ceci en :** [English](README.md) · [Nederlands](README.nl.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Français](README.fr.md) · [العربية](README.ar.md)

### 🎮 [Jouer maintenant → halgurdh.github.io/dars-islam](https://halgurdh.github.io/dars-islam/)

Une plateforme gratuite de petits jeux éducatifs dans le navigateur (Phaser/DOM), centrée principalement sur les études islamiques et l'arabe, en plus des matières scolaires générales (maths, langue, sciences, etc.), avec des comptes adaptés à l'école pour élèves, enseignants et parents.

💛 **Soutenir ce projet :** [paypal.me/halgurdh](https://paypal.me/halgurdh) — cette plateforme est volontairement gratuite et sans publicité ; les dons aident à le rester.

Aujourd'hui, tout fonctionne entièrement sur des offres gratuites, mais si le projet grandit, voici les coûts probables :
- **Supabase** — l'offre gratuite couvre une base d'utilisateurs petite à moyenne ; si beaucoup de classes s'inscrivent en même temps, le plan Pro pourrait devenir nécessaire (~25 $/mois) pour plus de stockage de base de données, de comptes et de bande passante.
- **Envoi d'e-mails** — l'expéditeur d'e-mails intégré de Supabase a des limites strictes ; un usage réel nécessite un fournisseur SMTP/e-mail payant.
- **Un nom de domaine propre** (optionnel) — environ 10–15 €/an, au lieu du sous-domaine gratuit `github.io`.

Rien de tout cela n'est nécessaire pour l'instant — les dons serviraient simplement à faire grandir le projet sans accroc s'il venait à décoller.

### ⚠️ Avertissements

- **Projet construit avec l'IA.** 100 % du code de ce dépôt a été écrit avec l'aide de l'IA (Claude Code). Il n'a pas été audité professionnellement — il peut contenir des bugs, et certains jeux ou fonctionnalités peuvent ne pas fonctionner correctement. Merci de signaler tout problème via une issue ou une pull request.
- **Le contenu islamique n'a pas été relu par un savant.** Les faits, traductions et contenus en arabe des jeux d'études islamiques ont été vérifiés à l'aide de [sunnah.com](https://sunnah.com), [quran.com](https://quran.com) et [islamqa.info](https://islamqa.info) pendant le développement, mais **aucun savant musulman qualifié n'a relu ce projet**. Vérifiez indépendamment tout élément important avant de vous y fier pour l'enseignement, en particulier pour les avis religieux ou la formulation exacte.
- **Ne remplace pas une véritable éducation.** Ces jeux sont un complément à la scolarité habituelle et à l'éducation islamique d'un élève, pas un substitut — utilisez-les *en plus de*, et non à la place d'un enseignement en classe approprié et d'une pédagogie qualifiée.

---

## Pour les écoles, enseignants, élèves & parents

Tout le monde peut jouer à chaque jeu en tant qu'invité, sans compte — la progression (XP, niveaux, séries, badges) est enregistrée automatiquement sur cet appareil.

**Élèves** — pour rejoindre une classe, demandez à votre enseignant un code de classe, puis ouvrez **Mon tableau de bord** (lien dans l'en-tête du site) et utilisez le formulaire « Rejoindre une classe ». Cela synchronise votre progression avec la liste de votre enseignant et vous donne un **Code familial** (affiché sur votre tableau de bord) à partager avec un parent.

**Enseignants** — ouvrez le **Tableau de bord enseignant** depuis l'en-tête du site, connectez-vous avec votre e-mail (un lien magique de connexion vous est envoyé par e-mail, sans mot de passe), puis créez une école et une classe. Partagez le code de la classe avec vos élèves. Depuis là, vous pouvez consulter la liste/le classement de la classe et assigner des jeux spécifiques à votre classe.

**Parents** — ouvrez le **Tableau de bord parent** depuis l'en-tête du site, connectez-vous avec votre e-mail, et saisissez le Code familial que votre enfant vous a communiqué. Vous verrez alors sa progression (niveau, séries, badges) et pourrez fixer une limite quotidienne de temps d'écran et bloquer certains jeux.

---

## Pour les développeurs (auto-hébergement / exécution sur votre propre serveur)

**➡️ Voir [SELF_HOSTING.md](SELF_HOSTING.md) pour le guide complet** — configuration de Supabase (le backend pour comptes/progression/écoles), Docker, GitHub Pages et déploiements sur serveur traditionnel.

Référence rapide :

```bash
npm install
cp example.env .env.local   # renseignez VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev                 # développement local (hub wrapper + chaque jeu)
npm run build                # build de production → dist/
npm test                     # exécuter la suite de tests
```

`npm run build` rassemble le hub wrapper et tous les jeux dans `dist/` — un
seul dossier statique, déployable partout où des fichiers statiques peuvent
être servis. L'application communique directement avec Supabase depuis le
navigateur ; aucun processus serveur à faire tourner en production.

Après avoir exécuté les migrations SQL, deux réglages du **tableau de bord** Supabase (pas du SQL) sont aussi nécessaires pour que les comptes fonctionnent :
- **Authentication → Providers** : confirme que l'e-mail (lien magique) est activé, et active **Anonymous sign-ins** (nécessaire pour le parcours d'inscription des élèves sans e-mail).
- **Authentication → Emails** : configure un vrai fournisseur SMTP avant de t'y fier au-delà de tests — l'expéditeur intégré de Supabase a des limites de débit strictes.

**Docker** (le moyen le plus rapide de s'auto-héberger — construit le site et le sert avec nginx, rien d'autre ne tourne dans le conteneur) :

```bash
cp example.env .env   # remarque : .env, pas .env.local — docker compose lit ce fichier
# renseignez VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY dans .env
docker compose up --build
# ouvrez http://localhost:8080
```

Ou sans compose : `docker build --build-arg VITE_SUPABASE_URL=... --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=... -t darsislam-games .` puis `docker run -p 8080:80 darsislam-games`. Voir [SELF_HOSTING.md](SELF_HOSTING.md) pour les détails (ces valeurs sont intégrées au moment du build, donc les modifier implique de reconstruire l'image).

Structure du dépôt :
- `wrapper/` — le site hub public (grille de jeux, connexion, tableaux de bord)
- `games/<nom>/` — le code source et la configuration Vite de chaque jeu
- `shared/` — code partagé par tous les jeux (client Supabase, suivi de
  progression, kits d'UI partagés, i18n)
- `database/supabase/0001_init.sql` — le schéma Postgres/RLS/RPC à exécuter
  sur votre projet Supabase
- `scripts/` — scripts d'aide au build et au déploiement

Les dossiers `api/`/`database/schema.sql` sont un ancien backend
PHP/MySQL, remplacé par Supabase — conservés à titre de référence, mais
plus utilisés par l'application.
