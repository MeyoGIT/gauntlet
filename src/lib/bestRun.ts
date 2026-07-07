import type { GauntletSession, RunHistory } from '../types'

/** Highest number of games beaten across past runs and the run currently in progress. */
export function getBestGamesBeaten(session: GauntletSession, history: RunHistory[]): number {
  const historyBest = history.reduce((max, run) => Math.max(max, run.games_beaten), 0)
  const currentProgress = session.status === 'completed' ? session.games.length : session.current_game_index
  return Math.max(historyBest, currentProgress)
}
