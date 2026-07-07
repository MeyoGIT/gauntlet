import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useTimer, formatDuration } from '../hooks/useTimer'
import { useActionFeedback } from '../hooks/useActionFeedback'
import { getBestGamesBeaten } from '../lib/bestRun'
import { FeedbackContent } from '../components/ActionFeedback'
import type { GauntletSession, RunHistory } from '../types'

export default function OBS() {
  const [session, setSession] = useState<GauntletSession | null>(null)
  const [history, setHistory] = useState<RunHistory[]>([])
  const { feedback, triggerFeedback } = useActionFeedback()
  const sessionRef = useRef<GauntletSession | null>(null)

  useEffect(() => { sessionRef.current = session }, [session])

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
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const { data } = await supabase
        .from('gauntlet_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cancelled || !data) return
      const s = data as GauntletSession
      setSession(s)

      const { data: historyData } = await supabase
        .from('run_history')
        .select('*')
        .eq('session_id', s.id)
      if (!cancelled && historyData) setHistory(historyData as RunHistory[])

      channel = supabase
        .channel('gauntlet-obs')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'gauntlet_sessions',
          filter: `id=eq.${s.id}`,
        }, (payload) => {
          const updated = payload.new as GauntletSession
          const prev = sessionRef.current

          // A failed run is the only action that bumps current_run_started_at
          // while also increasing current_run_number (a manual tries
          // adjustment only touches the latter); a rising game index means
          // the current game was beaten.
          if (prev) {
            if (
              updated.current_run_started_at !== prev.current_run_started_at &&
              updated.current_run_number > prev.current_run_number
            ) {
              triggerFeedback('fail')
            } else if (updated.current_game_index > prev.current_game_index) {
              triggerFeedback('success')
            }
          }

          setSession(updated)

          // run_history isn't on the realtime publication, so re-fetch it
          // here to keep the history list and "Meilleure run" stat in sync.
          supabase
            .from('run_history')
            .select('*')
            .eq('session_id', updated.id)
            .then(({ data }) => setHistory((data as RunHistory[] | null) ?? []))
        })
        .subscribe()
    }

    init()

    return () => {
      cancelled = true
      channel?.unsubscribe()
    }
  }, [])

  const elapsed = useTimer(session?.challenge_started_at ?? null)

  if (!session || session.status === 'setup') return null

  const currentGame = session.games[session.current_game_index]
  const isCompleted = session.status === 'completed'
  const bestGamesBeaten = getBestGamesBeaten(session, history)
  const isFeedback = feedback !== null

  return (
    <div style={{ background: 'transparent' }} className="p-3 inline-block">
      <AnimatePresence mode="wait">
        <motion.div
          key={feedback ? `feedback-${feedback.id}` : isCompleted ? 'completed' : session.current_game_index}
          initial={isFeedback ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={
            isFeedback
              ? { opacity: 1 }
              : { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
          }
          exit={{ opacity: 0, transition: { duration: 0 } }}
          className="inline-flex items-center justify-center gap-5 rounded-2xl px-5 py-4"
          style={{ width: 520, backgroundColor: feedback ? '#000' : 'rgba(10, 10, 10, 0.92)' }}
        >
          {feedback ? (
            <FeedbackContent type={feedback.type} compact />
          ) : isCompleted ? (
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

                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/50 font-medium tabular-nums">
                    {session.current_game_index + 1}/{session.games.length}
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-sm text-white/50 font-medium tabular-nums">
                    Record {bestGamesBeaten}/{session.games.length}
                  </span>
                </div>

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
