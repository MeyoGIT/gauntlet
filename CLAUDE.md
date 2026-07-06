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
VITE_APP_PASSWORD=      # optionnel — si vide, pas de mot de passe
```

## Supabase

Exécuter `supabase_schema.sql` dans l'éditeur SQL du projet Supabase, puis activer le Realtime sur la table `gauntlet_sessions` (Database → Replication).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Interface principale — protégée par mot de passe si `VITE_APP_PASSWORD` est défini |
| `/obs` | Overlay OBS, fond transparent, ajouter comme Browser Source (pas de mot de passe) |

## Architecture

**Session unique** — une seule ligne dans `gauntlet_sessions`. Pas d'auth, pas de session ID dans l'URL. Les deux joueurs partagent la même URL.

**États de la session** : `setup` → `active` → `completed`

**Realtime** : subscription Supabase sur `postgres_changes` UPDATE, gérée via `channelRef` dans `useGauntlet` pour éviter les leaks.

## Déploiement Railway

Build command : `npm run build`  
Start command : `npx serve dist --single --listen $PORT`  
Variables d'env à configurer dans le dashboard Railway.
