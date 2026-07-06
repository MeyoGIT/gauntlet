import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRAWG } from '../hooks/useRAWG'
import type { Game, RAWGGame } from '../types'

interface Props {
  currentGames: Game[]
  onAdd: (game: Game) => void
}

export default function GameSearch({ currentGames, onAdd }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const { results, loading } = useRAWG(query)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(r: RAWGGame) {
    if (currentGames.length >= 10) return
    if (currentGames.some(g => g.rawg_id === r.id)) return
    onAdd({
      rawg_id: r.id,
      name: r.name,
      cover_url: r.background_image,
      position: currentGames.length,
    })
    setQuery('')
    setOpen(false)
  }

  const filtered = results.filter(r => !currentGames.some(g => g.rawg_id === r.id))

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] focus-within:border-[#f97316] transition-colors">
        <svg className="w-4 h-4 text-[#6b6b6b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={currentGames.length >= 10 ? 'Liste complète (10/10)' : 'Rechercher un jeu…'}
          disabled={currentGames.length >= 10}
          className="flex-1 bg-transparent text-[#e8e8e8] placeholder-[#6b6b6b] text-sm outline-none disabled:opacity-40"
        />
        {loading && (
          <svg className="w-4 h-4 text-[#6b6b6b] animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
      </div>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] shadow-xl overflow-hidden"
          >
            {filtered.map(r => (
              <li key={r.id}>
                <button
                  onClick={() => handleSelect(r)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-[#2a2a2a] transition-colors group"
                >
                  {r.background_image ? (
                    <img src={r.background_image} alt="" className="w-10 h-7 object-cover rounded shrink-0" />
                  ) : (
                    <div className="w-10 h-7 bg-[#2a2a2a] rounded shrink-0 flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#6b6b6b]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM6.343 5.657a1 1 0 10-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-sm text-[#e8e8e8] truncate">{r.name}</span>
                  <svg className="w-4 h-4 text-[#f97316] ml-auto opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
