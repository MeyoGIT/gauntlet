# Gauntlet Challenge

Tracker de duo gaming challenge : 10 jeux à battre d'affilée sans perdre. Partagé en temps réel via Supabase. Inclut un overlay OBS pour le stream.

## Stack

- React + Vite + TypeScript
- Framer Motion — animations, drag & drop (setup)
- Tailwind CSS v4
- Supabase — base de données + Realtime (sync entre les deux joueurs)
- RAWG API — recherche de jeux (nom + cover)

## Lancer

```bash
npm install
npm run dev
```

## Variables d'environnement

Créer `.env` à partir de `.env.example` :

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_RAWG_API_KEY=
VITE_APP_PASSWORD=      # optionnel — si vide, tout le monde est admin
```

## Supabase

Exécuter `supabase_schema.sql` dans l'éditeur SQL du projet Supabase, puis activer le Realtime sur la table `gauntlet_sessions` uniquement (Database → Replication). `run_history` n'a pas besoin d'être publiée : `/obs` la refetch manuellement plutôt que de s'y abonner (voir Realtime ci-dessous).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Interface principale — accessible à tous en lecture seule ; le mode admin (modifications) se déverrouille via le bouton en haut à droite |
| `/obs` | Overlay OBS, fond transparent, ajouter comme Browser Source (pas de mot de passe) |

## Architecture

**Session unique** — une seule ligne dans `gauntlet_sessions`. Pas d'auth, pas de session ID dans l'URL. Les deux joueurs partagent la même URL.

**États de la session** : `setup` → `active` → `completed`

**Mode admin / spectateur** — `AdminProvider` (`src/contexts/AdminContext.tsx`) expose `isAdmin`, persisté en `sessionStorage`. Si `VITE_APP_PASSWORD` est vide, tout le monde est admin. `AdminOnly` (`src/components/AdminOnly.tsx`) ne rend ses enfants que pour les admins — les contrôles de modification sont absents du DOM pour les spectateurs, pas juste désactivés. `AdminButton` (coin haut-droit, sur toutes les pages) ouvre `AdminModal` pour se connecter/déconnecter.

**Realtime** : subscription Supabase sur `postgres_changes` UPDATE de `gauntlet_sessions`, gérée via `channelRef` dans `useGauntlet` pour éviter les leaks. `run_history` n'étant pas sur la publication Realtime, `/obs` la refetch manuellement à chaque UPDATE de session au lieu de s'y abonner directement.

**Feedback visuel ("Jeu battu !" / "Perdu !")** — `useActionFeedback` (`src/hooks/useActionFeedback.ts`) pilote un état `{ type, id }` affiché ~1s via `ActionFeedback`. Sur le site, déclenché directement au clic (`ChallengeMode`). Sur `/obs`, déduit en comparant la session avant/après dans le handler Realtime : une run échouée est la seule action qui change `current_run_started_at` en augmentant `current_run_number` (un ajustement manuel des essais ne touche que le second) ; un `current_game_index` qui augmente signale un jeu battu.

**Meilleure run** — `getBestGamesBeaten` (`src/lib/bestRun.ts`) prend le max entre l'historique des runs et la progression de la run en cours.

**Points de progression (overlay OBS)** — un point par jeu, coloré par priorité : vert si battu dans la run en cours, blanc pour le jeu en cours, jaune pour le jeu correspondant à la meilleure run (`bestGamesBeaten - 1`) tant qu'il n'a pas été rattrapé, gris sinon. Sur le site (`GameCard`), les jeux battus restent en vert (`emerald`), indépendant de la palette de l'overlay.

**Statistiques** — bouton "Stats" dans `ChallengeMode` ouvrant `StatsModal`, alimenté par la table `game_attempts` (une ligne par tentative sur un jeu, battue ou ratée, avec durée exacte). `useGauntlet` pose un timestamp `current_game_started_at` sur la session à chaque transition de jeu (début de run, jeu battu, échec) et l'utilise comme point de départ pour calculer la durée de la tentative en cours avant d'insérer la ligne dans `game_attempts`. `src/lib/stats.ts` dérive les stats par jeu (essais, victoires/défaites, ratio, temps total, clear le plus rapide) et les records globaux (jeu le plus chronophage, bête noire, etc.) à partir de `game_attempts` + `run_history`. Les sessions créées avant l'ajout de cette table n'ont pas d'historique par jeu tant que la migration SQL n'a pas été rejouée dans Supabase.

## Déploiement Railway

Build command : `npm run build`  
Start command : `npx serve dist`  
Variables d'env à configurer dans le dashboard Railway.
