import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useTimer, formatDuration } from '../hooks/useTimer'
import type { GauntletSession } from '../types'

export default function OBS() {
  const [session, setSession] = useState<GauntletSession | null>(null)

  // Override global body background so OBS Browser Source transparency works
  useEffect(() => {
    document.documentElement.style.backgroundColor = 'transparent'
    document.body.style.backgroundColor = 'transparent'
    return () => {
      document.documentElement.style.backgroundColor = ''
      document.body.style.backgroundColor = ''
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    supabase
      .from('gauntlet_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setSession(data as GauntletSession)
      })

    const channel = supabase
      .channel('gauntlet-obs')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'gauntlet_sessions',
      }, (payload) => {
        setSession(payload.new as GauntletSession)
      })
      .subscribe()

    return () => {
      cancelled = true
      channel.unsubscribe()
    }
  }, [])

  const elapsed = useTimer(session?.challenge_started_at ?? null)

  if (!session || session.status === 'setup') return null

  const currentGame = session.games[session.current_game_index]
  const isCompleted = session.status === 'completed'

  return (
    <div style={{ background: 'transparent' }} className="p-3 inline-block">
      <AnimatePresence mode="wait">
        <motion.div
          key={isCompleted ? 'completed' : session.current_game_index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="inline-flex items-center gap-5 rounded-2xl px-5 py-4"
          style={{ width: 520, backgroundColor: 'rgba(10, 10, 10, 0.92)' }}
        >
          {isCompleted ? (
            <div className="flex items-center gap-5 w-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="rounded-xl flex items-center justify-center text-4xl shrink-0"
                style={{ width: 72, height: 72, background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}
              >
                🏆
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-[20px] font-bold leading-tight"
                  style={{ color: '#f97316' }}
                >
                  Victoire !
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2 mt-1.5"
                >
                  <span className="text-sm text-white/50 tabular-nums">
                    {session.current_run_number - 1} essai{session.current_run_number - 1 !== 1 ? 's' : ''}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-sm text-white/50 tabular-nums">{formatDuration(elapsed)}</span>
                </motion.div>
              </div>
            </div>
          ) : currentGame ? (
            <>
              {currentGame.cover_url ? (
                <img
                  src={currentGame.cover_url}
                  alt={currentGame.name}
                  className="rounded-lg object-cover shrink-0"
                  style={{ width: 120, height: 84 }}
                />
              ) : (
                <div className="rounded-lg bg-white/10 shrink-0" style={{ width: 120, height: 84 }} />
              )}

              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[20px] font-bold text-white leading-snug line-clamp-1 flex-1 min-w-0">
                    {currentGame.name}
                  </p>
                  <div className="flex items-center gap-1 text-white/50 shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-sm tabular-nums font-medium">{formatDuration(elapsed)}</span>
                  </div>
                </div>

                <span className="text-sm text-white/50 font-medium tabular-nums">
                  {session.current_game_index + 1}/{session.games.length}
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {session.games.map((_, i) => (
                      <div
                        key={i}
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: 8, height: 8,
                          background:
                            i < session.current_game_index ? '#f97316' :
                            i === session.current_game_index ? '#ffffff' :
                            'rgba(255,255,255,0.18)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-white/50 ml-auto shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm tabular-nums font-medium">Run n°{session.current_run_number}</span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
