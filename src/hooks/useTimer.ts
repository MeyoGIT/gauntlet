import { useState, useEffect, useRef } from 'react'

/** When pausedAt is set, elapsed freezes at (pausedAt - startedAt) instead of ticking against Date.now(). */
export function useTimer(startedAt: string | null, pausedAt: string | null = null) {
  const [elapsed, setElapsed] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0)
      return
    }

    const start = new Date(startedAt).getTime()

    if (pausedAt) {
      setElapsed(Math.floor((new Date(pausedAt).getTime() - start) / 1000))
      return
    }

    const tick = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [startedAt, pausedAt])

  return elapsed
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  if (m > 0) return `${m}m ${s.toString().padStart(2, '0')}s`
  return `${s}s`
}
