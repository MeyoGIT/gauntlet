import type { RAWGGame } from '../types'

const API_KEY = import.meta.env.VITE_RAWG_API_KEY
const BASE = 'https://api.rawg.io/api'

if (!API_KEY) {
  throw new Error('Variable d\'environnement manquante : VITE_RAWG_API_KEY')
}

export async function searchGames(query: string, signal?: AbortSignal): Promise<RAWGGame[]> {
  if (!query.trim()) return []
  const res = await fetch(`${BASE}/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page_size=8`, { signal })
  if (!res.ok) throw new Error(`RAWG ${res.status}: ${res.statusText}`)
  const data = await res.json() as { results: RAWGGame[] }
  return data.results
}
