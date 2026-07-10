-- Gauntlet Challenge — Supabase Schema
-- Colle ce SQL dans l'éditeur SQL de ton projet Supabase (https://supabase.com/dashboard)

-- Table principale : état de la session en cours
CREATE TABLE IF NOT EXISTS gauntlet_sessions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status                TEXT NOT NULL DEFAULT 'setup',  -- 'setup' | 'active' | 'completed'
  games                 JSONB NOT NULL DEFAULT '[]',    -- [{rawg_id, name, cover_url, position}]
  current_run_number    INTEGER NOT NULL DEFAULT 1,
  current_game_index    INTEGER NOT NULL DEFAULT 0,
  challenge_started_at  TIMESTAMPTZ,
  current_run_started_at TIMESTAMPTZ,
  game_tries            JSONB NOT NULL DEFAULT '[0,0,0,0,0,0,0,0,0,0]',
  current_game_started_at TIMESTAMPTZ,
  paused_at             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migration : si la table existe déjà sans cette colonne (session créée avant
-- l'ajout des statistiques par jeu), l'ajouter sans casser les données existantes.
ALTER TABLE gauntlet_sessions ADD COLUMN IF NOT EXISTS current_game_started_at TIMESTAMPTZ;

-- Migration : pause du chrono. NULL = pas en pause ; sinon horodatage du début de la pause.
ALTER TABLE gauntlet_sessions ADD COLUMN IF NOT EXISTS paused_at TIMESTAMPTZ;

-- Table historique : un enregistrement par run terminé (victoire ou échec)
CREATE TABLE IF NOT EXISTS run_history (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES gauntlet_sessions(id) ON DELETE CASCADE,
  run_number            INTEGER NOT NULL,
  started_at            TIMESTAMPTZ NOT NULL,
  ended_at              TIMESTAMPTZ NOT NULL,
  failed_at_game_index  INTEGER,  -- NULL si victoire
  games_beaten          INTEGER NOT NULL DEFAULT 0,
  duration_seconds      INTEGER NOT NULL DEFAULT 0
);

-- Table détaillée : une ligne par tentative sur un jeu (battu ou raté), utilisée
-- pour calculer les statistiques par jeu (temps passé, nombre d'essais, ratio de victoire...)
CREATE TABLE IF NOT EXISTS game_attempts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES gauntlet_sessions(id) ON DELETE CASCADE,
  run_number            INTEGER NOT NULL,
  game_index            INTEGER NOT NULL,
  rawg_id               BIGINT NOT NULL,
  game_name             TEXT NOT NULL,
  result                TEXT NOT NULL,  -- 'beaten' | 'failed'
  started_at            TIMESTAMPTZ NOT NULL,
  ended_at              TIMESTAMPTZ NOT NULL,
  duration_seconds      INTEGER NOT NULL DEFAULT 0
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS run_history_session_id_idx ON run_history(session_id);
CREATE INDEX IF NOT EXISTS game_attempts_session_id_idx ON game_attempts(session_id);

-- Politique RLS (Row Level Security) — accès public en lecture/écriture
-- (adapte selon tes besoins de sécurité)
ALTER TABLE gauntlet_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE run_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read gauntlet_sessions"
  ON gauntlet_sessions FOR SELECT USING (true);

CREATE POLICY "Public insert gauntlet_sessions"
  ON gauntlet_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update gauntlet_sessions"
  ON gauntlet_sessions FOR UPDATE USING (true);

CREATE POLICY "Public read run_history"
  ON run_history FOR SELECT USING (true);

CREATE POLICY "Public insert run_history"
  ON run_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete run_history"
  ON run_history FOR DELETE USING (true);

CREATE POLICY "Public read game_attempts"
  ON game_attempts FOR SELECT USING (true);

CREATE POLICY "Public insert game_attempts"
  ON game_attempts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public delete game_attempts"
  ON game_attempts FOR DELETE USING (true);

-- Activer le Realtime sur gauntlet_sessions
-- (à faire aussi dans le dashboard Supabase : Database > Replication > gauntlet_sessions)
ALTER PUBLICATION supabase_realtime ADD TABLE gauntlet_sessions;
