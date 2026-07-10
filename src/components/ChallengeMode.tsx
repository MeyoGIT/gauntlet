import { useState } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import GameCard from './GameCard'
import RunHistory from './RunHistory'
import VictoryScreen from './VictoryScreen'
import AdminOnly from './AdminOnly'
import ActionFeedback from './ActionFeedback'
import StatsModal from './StatsModal'
import { useTimer, formatDuration } from '../hooks/useTimer'
import { useActionFeedback } from '../hooks/useActionFeedback'
import { getBestGamesBeaten } from '../lib/bestRun'
import type { GauntletSession, RunHistory as RunHistoryType, GameAttempt } from '../types'

interface Props {
  session: GauntletSession
  history: RunHistoryType[]
  gameAttempts: GameAttempt[]
  onNextGame: () => void
  onFailRun: () => void
  onAdjustTries: (delta: number) => void
  onReset: () => void
  onTogglePause: () => void
}

export default function ChallengeMode({ session, history, gameAttempts, onNextGame, onFailRun, onAdjustTries, onReset, onTogglePause }: Props) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [obsCopied, setObsCopied] = useState(false)
  const { feedback, triggerFeedback } = useActionFeedback()
  const gridControls = useAnimationControls()

  function copyObsLink() {
    navigator.clipboard.writeText(`${window.location.origin}/obs`)
    setObsCopied(true)
    window.setTimeout(() => setObsCopied(false), 1800)
  }

  function handleFailRun() {
    triggerFeedback('fail')
    gridControls.start({
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      transition: { duration: 0.45, ease: 'easeInOut' },
    })
    onFailRun()
  }

  function handleNextGame() {
    triggerFeedback('success')
    onNextGame()
  }

  const isPaused = !!session.paused_at
  const totalElapsed = useTimer(session.challenge_started_at, session.paused_at)
  const isCompleted = session.status === 'completed'
  const currentGame = session.games[session.current_game_index]
  const totalTries = session.current_run_number - 1
  const bestGamesBeaten = getBestGamesBeaten(session, history)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0f0f0f]">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-center border-b border-[#2a2a2a] shrink-0 px-8 py-4">
        <div className="w-full max-w-7xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-[#e8e8e8] tracking-tight">Gauntlet</h1>
          <span className="text-sm text-[#6b6b6b]">Run #{session.current_run_number}</span>
          {isPaused && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded-full"
            >
              <PauseIcon className="w-3 h-3" />
              En pause
            </motion.span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          <Stat label="Essais" value={totalTries.toString()} />
          <div className="w-px h-5 bg-[#2a2a2a]" />
          <Stat label="Meilleure run" value={`${bestGamesBeaten}/${session.games.length}`} />
          <div className="w-px h-5 bg-[#2a2a2a]" />
          <Stat label="Jeu" value={`${Math.min(session.current_game_index + 1, 10)}/10`} />
          <div className="w-px h-5 bg-[#2a2a2a]" />
          <Stat label="Temps" value={formatDuration(totalElapsed)} mono />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(true)}
            className="flex items-center gap-1.5 text-xs text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors px-2.5 py-1.5 rounded-md border border-transparent hover:border-[#2a2a2a]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h3.75v6.75H3v-6.75zm7.125-4.5h3.75v11.25h-3.75V9zm7.125-5.25H21v16.5h-3.75V3.75z" />
            </svg>
            Stats
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="text-xs text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors px-2.5 py-1.5 rounded-md border border-transparent hover:border-[#2a2a2a]"
          >
            Historique
          </button>
          <AdminOnly>
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors px-2.5 py-1.5 rounded-md border border-transparent hover:border-[#2a2a2a]"
            >
              Réinitialiser
            </button>
          </AdminOnly>
          <AdminOnly>
            <button
              onClick={copyObsLink}
              title="Copier le lien de l'overlay OBS"
              className={`flex items-center gap-1.5 text-xs transition-colors px-2.5 py-1.5 rounded-md border ${
                obsCopied
                  ? 'text-emerald-400 border-emerald-400/40'
                  : 'text-[#f97316] hover:text-[#ea6c10] border-[#f97316]/30 hover:border-[#f97316]/60'
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {obsCopied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Lien copié
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    OBS
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </AdminOnly>
        </div>
        </div>
      </header>

      {/* ── GAME GRID ── */}
      <main className="flex-1 overflow-hidden flex items-center justify-center py-5 px-8">
        {isCompleted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-7xl h-full"
          >
            <VictoryScreen
              totalTries={totalTries}
              elapsed={totalElapsed}
              onReset={onReset}
            />
          </motion.div>
        ) : (
          <div className="relative w-full max-w-7xl" style={{ height: 'min(calc(100vh - 120px), 660px)' }}>
            <motion.div
              animate={gridControls}
              className="grid grid-cols-5 grid-rows-2 gap-3 w-full h-full"
            >
              {session.games.map((game, i) => {
                const status =
                  i < session.current_game_index ? 'beaten' :
                  i === session.current_game_index ? 'current' :
                  'pending'
                return (
                  <GameCard
                    key={game.rawg_id}
                    game={game}
                    index={i}
                    status={status}
                    tries={session.game_tries[i] ?? 0}
                  />
                )
              })}
            </motion.div>

            <AnimatePresence>
              {isPaused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center gap-3 bg-black/70 rounded-xl backdrop-blur-sm pointer-events-none"
                >
                  <PauseIcon className="w-8 h-8 text-yellow-400" />
                  <span className="text-2xl font-bold tracking-tight text-[#e8e8e8]">En pause</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <ActionFeedback feedback={feedback} />

      <StatsModal
        open={showStats}
        onClose={() => setShowStats(false)}
        session={session}
        history={history}
        gameAttempts={gameAttempts}
      />

      {/* ── FOOTER CONTROLS (admin only) ── */}
      {!isCompleted && (
        <AdminOnly>
          <footer className="flex items-center justify-center border-t border-[#2a2a2a] shrink-0 px-8 py-4">
          <div className="w-full max-w-7xl flex items-center justify-between">
            {/* Current game name */}
            <div className="flex items-center gap-2 min-w-0 w-52">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] shrink-0 animate-pulse" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={session.current_game_index}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-[#e8e8e8] font-medium truncate"
                >
                  {currentGame?.name}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Try counter */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onAdjustTries(-1)}
                className="w-7 h-7 rounded-md border border-[#2a2a2a] text-[#6b6b6b] hover:text-[#e8e8e8] hover:border-[#6b6b6b] transition-colors flex items-center justify-center text-base font-light"
              >
                −
              </button>
              <div className="relative w-12 h-8 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={totalTries}
                    initial={{ y: 16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -16, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute text-2xl font-bold text-[#e8e8e8] tabular-nums"
                  >
                    {totalTries}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button
                onClick={() => onAdjustTries(1)}
                className="w-7 h-7 rounded-md border border-[#2a2a2a] text-[#6b6b6b] hover:text-[#e8e8e8] hover:border-[#6b6b6b] transition-colors flex items-center justify-center text-base font-light"
              >
                +
              </button>
              <span className="text-xs text-[#6b6b6b]">essais</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={onTogglePause}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isPaused
                    ? 'border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10'
                    : 'border-[#2a2a2a] text-[#6b6b6b] hover:text-[#e8e8e8] hover:border-[#6b6b6b]'
                }`}
              >
                {isPaused ? <PlayIcon className="w-3.5 h-3.5" /> : <PauseIcon className="w-3.5 h-3.5" />}
                {isPaused ? 'Reprendre' : 'Pause'}
              </motion.button>

              <div className="w-px h-6 bg-[#2a2a2a]" />

              <motion.button
                onClick={handleFailRun}
                disabled={isPaused}
                whileHover={isPaused ? {} : { scale: 1.01 }}
                whileTap={isPaused ? {} : { scale: 0.97 }}
                className="px-4 py-2 rounded-lg border border-[#2a2a2a] text-[#e8e8e8] text-sm font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                On a perdu
              </motion.button>
              <motion.button
                onClick={handleNextGame}
                disabled={isPaused}
                whileHover={isPaused ? {} : { scale: 1.01 }}
                whileTap={isPaused ? {} : { scale: 0.97 }}
                className="px-5 py-2 rounded-lg bg-[#f97316] text-white text-sm font-medium hover:bg-[#ea6c10] transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                Jeu suivant ✓
              </motion.button>
            </div>
          </div>
          </footer>
        </AdminOnly>
      )}

      {/* ── HISTORY MODAL ──�� */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-lg w-full max-h-[70vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#e8e8e8]">Historique des runs</p>
                <button onClick={() => setShowHistory(false)} className="text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <RunHistory history={history} session={session} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── RESET CONFIRM ── */}
      <AnimatePresence>
        {confirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmReset(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-sm w-full space-y-4"
            >
              <p className="text-sm font-semibold text-[#e8e8e8]">Réinitialiser le challenge ?</p>
              <p className="text-sm text-[#6b6b6b]">Tous les essais et l'historique seront effacés. La liste de jeux est conservée.</p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { onReset(); setConfirmReset(false) }}
                  className="flex-1 py-2 rounded-lg bg-[#f97316] text-white text-sm font-medium hover:bg-[#ea6c10] transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 py-2 rounded-lg border border-[#2a2a2a] text-[#e8e8e8] text-sm hover:bg-[#2a2a2a] transition-colors"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 4.5v15l13-7.5-13-7.5z" />
    </svg>
  )
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#6b6b6b]">{label}</span>
      <span className={`text-sm font-semibold text-[#e8e8e8] ${mono ? 'tabular-nums' : ''}`}>{value}</span>
    </div>
  )
}
