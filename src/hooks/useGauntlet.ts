import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { GauntletSession, RunHistory, GameAttempt, Game } from '../types'

export function useGauntlet() {
  const [session, setSession] = useState<GauntletSession | null>(null)
  const [history, setHistory] = useState<RunHistory[]>([])
  const [gameAttempts, setGameAttempts] = useState<GameAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const loadHistory = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from('run_history')
      .select('*')
      .eq('session_id', sessionId)
      .order('run_number', { ascending: true })
    if (data) setHistory(data as RunHistory[])
  }, [])

  const loadGameAttempts = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from('game_attempts')
      .select('*')
      .eq('session_id', sessionId)
      .order('started_at', { ascending: true })
    if (data) setGameAttempts(data as GameAttempt[])
  }, [])

  const subscribe = useCallback((sessionId: string) => {
    channelRef.current?.unsubscribe()
    channelRef.current = supabase
      .channel('gauntlet')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'gauntlet_sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        setSession(payload.new as GauntletSession)
      })
      .subscribe()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('gauntlet_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cancelled) return

      if (err) {
        setError('Erreur de connexion à Supabase')
        setLoading(false)
        return
      }

      if (data) {
        setSession(data as GauntletSession)
        subscribe(data.id)
        await loadHistory(data.id)
        await loadGameAttempts(data.id)
      }

      setLoading(false)
    }

    init()
    return () => {
      cancelled = true
      channelRef.current?.unsubscribe()
    }
  }, [loadHistory, loadGameAttempts, subscribe])

  const createSession = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('gauntlet_sessions')
      .insert({
        status: 'setup',
        games: [],
        current_run_number: 1,
        current_game_index: 0,
        game_tries: Array(10).fill(0),
      })
      .select()
      .single()

    if (err || !data) { setError('Impossible de créer la session'); return }

    const s = data as GauntletSession
    setSession(s)
    subscribe(s.id)
  }, [subscribe])

  const updateSession = useCallback(async (patch: Partial<GauntletSession>) => {
    if (!session) return
    const { data } = await supabase
      .from('gauntlet_sessions')
      .update(patch)
      .eq('id', session.id)
      .select()
      .single()
    if (data) setSession(data as GauntletSession)
  }, [session])

  const updateGames = useCallback((games: Game[]) =>
    updateSession({ games }), [updateSession])

  const startChallenge = useCallback(async () => {
    if (!session) return
    const now = new Date().toISOString()
    await updateSession({
      status: 'active',
      challenge_started_at: now,
      current_run_started_at: now,
      current_game_started_at: now,
      current_run_number: 1,
      current_game_index: 0,
      game_tries: Array(session.games.length).fill(0),
    })
  }, [session, updateSession])

  const nextGame = useCallback(async () => {
    if (!session) return
    const now = new Date().toISOString()
    const gameStart = session.current_game_started_at ?? session.current_run_started_at ?? session.challenge_started_at ?? now
    const game = session.games[session.current_game_index]
    const newIndex = session.current_game_index + 1
    const newTries = [...session.game_tries]
    newTries[session.current_game_index] = (newTries[session.current_game_index] ?? 0) + 1

    if (game) {
      await supabase.from('game_attempts').insert({
        session_id: session.id,
        run_number: session.current_run_number,
        game_index: session.current_game_index,
        rawg_id: game.rawg_id,
        game_name: game.name,
        result: 'beaten',
        started_at: gameStart,
        ended_at: now,
        duration_seconds: Math.floor((new Date(now).getTime() - new Date(gameStart).getTime()) / 1000),
      })
    }

    await updateSession({
      current_game_index: newIndex,
      current_game_started_at: now,
      game_tries: newTries,
      ...(newIndex >= session.games.length ? { status: 'completed' } : {}),
    })

    await loadGameAttempts(session.id)
  }, [session, updateSession, loadGameAttempts])

  const failRun = useCallback(async () => {
    if (!session) return
    const now = new Date().toISOString()
    const runStart = session.current_run_started_at ?? session.challenge_started_at ?? now
    const gameStart = session.current_game_started_at ?? runStart
    const duration = Math.floor((new Date(now).getTime() - new Date(runStart).getTime()) / 1000)
    const game = session.games[session.current_game_index]

    await supabase.from('run_history').insert({
      session_id: session.id,
      run_number: session.current_run_number,
      started_at: runStart,
      ended_at: now,
      failed_at_game_index: session.current_game_index,
      games_beaten: session.current_game_index,
      duration_seconds: duration,
    })

    if (game) {
      await supabase.from('game_attempts').insert({
        session_id: session.id,
        run_number: session.current_run_number,
        game_index: session.current_game_index,
        rawg_id: game.rawg_id,
        game_name: game.name,
        result: 'failed',
        started_at: gameStart,
        ended_at: now,
        duration_seconds: Math.floor((new Date(now).getTime() - new Date(gameStart).getTime()) / 1000),
      })
    }

    await updateSession({
      current_run_number: session.current_run_number + 1,
      current_game_index: 0,
      current_run_started_at: now,
      current_game_started_at: now,
    })

    await loadHistory(session.id)
    await loadGameAttempts(session.id)
  }, [session, updateSession, loadHistory, loadGameAttempts])

  const adjustTries = useCallback(async (delta: number) => {
    if (!session) return
    await updateSession({ current_run_number: Math.max(1, session.current_run_number + delta) })
  }, [session, updateSession])

  const resetChallenge = useCallback(async () => {
    if (!session) return
    await supabase.from('run_history').delete().eq('session_id', session.id)
    await supabase.from('game_attempts').delete().eq('session_id', session.id)
    await updateSession({
      status: 'setup',
      current_run_number: 1,
      current_game_index: 0,
      challenge_started_at: null,
      current_run_started_at: null,
      current_game_started_at: null,
      game_tries: Array(10).fill(0),
    })
    setHistory([])
    setGameAttempts([])
  }, [session, updateSession])

  return { session, history, gameAttempts, loading, error, createSession, updateGames, startChallenge, nextGame, failRun, adjustTries, resetChallenge }
}
