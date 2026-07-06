export interface Game {
  rawg_id: number
  name: string
  cover_url: string | null
  position: number
}

export type SessionStatus = 'setup' | 'active' | 'completed'

export interface GauntletSession {
  id: string
  status: SessionStatus
  games: Game[]
  current_run_number: number
  current_game_index: number
  challenge_started_at: string | null
  current_run_started_at: string | null
  game_tries: number[]
  created_at: string
}

export interface RunHistory {
  id: string
  session_id: string
  run_number: number
  started_at: string
  ended_at: string
  failed_at_game_index: number | null
  games_beaten: number
  duration_seconds: number
}

export interface RAWGGame {
  id: number
  name: string
  background_image: string | null
}
