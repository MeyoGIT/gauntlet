import { formatDuration } from '../hooks/useTimer'
import type { RunHistory as RunHistoryType, GauntletSession } from '../types'

interface Props {
  history: RunHistoryType[]
  session: GauntletSession
}

export default function RunHistory({ history, session }: Props) {
  if (history.length === 0) return null

  return (
    <div className="divide-y divide-[#2a2a2a]">
      {history.map(run => {
        const failedGame = run.failed_at_game_index !== null
          ? session.games[run.failed_at_game_index]?.name ?? `Jeu ${run.failed_at_game_index + 1}`
          : null

        return (
          <div key={run.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#6b6b6b] w-16 shrink-0">Run #{run.run_number}</span>
              <div>
                <div className="text-sm text-[#e8e8e8]">
                  {failedGame
                    ? <span>Échec sur <span className="text-[#f97316]">{failedGame}</span></span>
                    : <span className="text-emerald-400 font-medium">Victoire !</span>
                  }
                </div>
                <div className="text-xs text-[#6b6b6b] mt-0.5">
                  {run.games_beaten} jeu{run.games_beaten !== 1 ? 'x' : ''} battu{run.games_beaten !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm text-[#6b6b6b] tabular-nums">{formatDuration(run.duration_seconds)}</div>
              <div className="text-xs text-[#6b6b6b] mt-0.5">
                {new Date(run.started_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
