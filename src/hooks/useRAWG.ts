import { useState, useEffect, useRef } from 'react'
import { searchGames } from '../lib/rawg'
import type { RAWGGame } from '../types'

export function useRAWG(query: string) {
  const [results, setResults] = useState<RAWGGame[]>([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setLoading(true)
      try {
        const data = await searchGames(query, abortRef.current.signal)
        setResults(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('Erreur recherche RAWG:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [query])

  return { results, loading }
}
