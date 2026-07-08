import type { Game, GauntletSession, RunHistory, GameAttempt } from '../types'
import { getBestGamesBeaten } from './bestRun'

export interface GameStats {
  game: Game
  attempts: number
  wins: number
  losses: number
  winRate: number | null
  totalDuration: number
  avgDuration: number | null
  fastestClear: number | null
  slowestAttempt: number | null
}

export interface GlobalStats {
  totalRuns: number
  totalLosses: number
  totalGameAttempts: number
  totalWins: number
  globalWinRate: number | null
  totalPlayTime: number
  bestRun: number
  worstRun: number | null
  avgGamesPerRun: number | null
  longestRunDuration: number | null
  shortestRunDuration: number | null
  avgRunDuration: number | null
}

export interface Superlative {
  game: Game
  value: number
}

export interface Superlatives {
  mostTime: Superlative | null
  mostAttempts: Superlative | null
  mostLosses: Superlative | null
  bestWinRate: Superlative | null
  worstWinRate: Superlative | null
  fastestClear: Superlative | null
  slowestAttempt: Superlative | null
  flawless: Game[]
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function computeGameStats(games: Game[], attempts: GameAttempt[]): GameStats[] {
  return games.map((game, i) => {
    const relevant = attempts.filter(a => a.game_index === i)
    const wins = relevant.filter(a => a.result === 'beaten')
    const losses = relevant.filter(a => a.result === 'failed')
    const totalDuration = relevant.reduce((sum, a) => sum + a.duration_seconds, 0)

    return {
      game,
      attempts: relevant.length,
      wins: wins.length,
      losses: losses.length,
      winRate: relevant.length > 0 ? wins.length / relevant.length : null,
      totalDuration,
      avgDuration: relevant.length > 0 ? totalDuration / relevant.length : null,
      fastestClear: wins.length > 0 ? Math.min(...wins.map(a => a.duration_seconds)) : null,
      slowestAttempt: relevant.length > 0 ? Math.max(...relevant.map(a => a.duration_seconds)) : null,
    }
  })
}

export function computeGlobalStats(
  session: GauntletSession,
  history: RunHistory[],
  attempts: GameAttempt[],
): GlobalStats {
  const wins = attempts.filter(a => a.result === 'beaten')
  const gamesBeatenPerRun = history.map(r => r.games_beaten)
  const durations = history.map(r => r.duration_seconds)

  return {
    totalRuns: session.current_run_number,
    totalLosses: history.length,
    totalGameAttempts: attempts.length,
    totalWins: wins.length,
    globalWinRate: attempts.length > 0 ? wins.length / attempts.length : null,
    totalPlayTime: attempts.reduce((sum, a) => sum + a.duration_seconds, 0),
    bestRun: getBestGamesBeaten(session, history),
    worstRun: gamesBeatenPerRun.length > 0 ? Math.min(...gamesBeatenPerRun) : null,
    avgGamesPerRun: avg(gamesBeatenPerRun),
    longestRunDuration: durations.length > 0 ? Math.max(...durations) : null,
    shortestRunDuration: durations.length > 0 ? Math.min(...durations) : null,
    avgRunDuration: avg(durations),
  }
}

export function computeSuperlatives(gameStats: GameStats[]): Superlatives {
  const withAttempts = gameStats.filter(g => g.attempts > 0)
  const withWins = gameStats.filter(g => g.fastestClear !== null)
  const withLosses = gameStats.filter(g => g.losses > 0)

  const pickMax = (list: GameStats[], key: (g: GameStats) => number): Superlative | null => {
    if (list.length === 0) return null
    const best = list.reduce((a, b) => (key(b) > key(a) ? b : a))
    return { game: best.game, value: key(best) }
  }

  const pickMin = (list: GameStats[], key: (g: GameStats) => number): Superlative | null => {
    if (list.length === 0) return null
    const best = list.reduce((a, b) => (key(b) < key(a) ? b : a))
    return { game: best.game, value: key(best) }
  }

  // Nemesis: worst win rate, tie-broken toward the game that fought back the most.
  const nemesis = withLosses.length > 0
    ? withLosses.reduce((a, b) => {
        const rateA = a.winRate ?? 0
        const rateB = b.winRate ?? 0
        if (rateB !== rateA) return rateB < rateA ? b : a
        return b.attempts > a.attempts ? b : a
      })
    : null

  const mastered = withAttempts.length > 0
    ? withAttempts.reduce((a, b) => {
        const rateA = a.winRate ?? 0
        const rateB = b.winRate ?? 0
        if (rateB !== rateA) return rateB > rateA ? b : a
        return b.attempts > a.attempts ? b : a
      })
    : null

  return {
    mostTime: pickMax(withAttempts, g => g.totalDuration),
    mostAttempts: pickMax(withAttempts, g => g.attempts),
    mostLosses: pickMax(withLosses, g => g.losses),
    bestWinRate: mastered ? { game: mastered.game, value: mastered.winRate ?? 0 } : null,
    worstWinRate: nemesis ? { game: nemesis.game, value: nemesis.winRate ?? 0 } : null,
    fastestClear: pickMin(withWins, g => g.fastestClear as number),
    slowestAttempt: pickMax(withAttempts, g => g.slowestAttempt as number),
    flawless: withAttempts.filter(g => g.losses === 0 && g.wins === 1).map(g => g.game),
  }
}
