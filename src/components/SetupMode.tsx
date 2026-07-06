import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion'
import GameSearch from './GameSearch'
import type { Game } from '../types'

interface Props {
  games: Game[]
  onGamesChange: (games: Game[]) => void
  onStart: () => void
}

function DragHandle({ controls }: { controls: ReturnType<typeof useDragControls> }) {
  return (
    <div
      onPointerDown={e => controls.start(e)}
      className="cursor-grab active:cursor-grabbing p-1 text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors touch-none"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <circle cx="4" cy="3" r="1.2" />
        <circle cx="10" cy="3" r="1.2" />
        <circle cx="4" cy="7" r="1.2" />
        <circle cx="10" cy="7" r="1.2" />
        <circle cx="4" cy="11" r="1.2" />
        <circle cx="10" cy="11" r="1.2" />
      </svg>
    </div>
  )
}

function GameItem({ game, index, onRemove }: { game: Game; index: number; onRemove: () => void }) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      key={game.rawg_id}
      value={game}
      dragListener={false}
      dragControls={controls}
      as="li"
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] select-none"
      whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 10 }}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <DragHandle controls={controls} />
      <span className="text-xs font-medium text-[#6b6b6b] w-5 text-center">{index + 1}</span>
      {game.cover_url ? (
        <img src={game.cover_url} alt={game.name} className="w-9 h-6 object-cover rounded shrink-0" />
      ) : (
        <div className="w-9 h-6 bg-[#2a2a2a] rounded shrink-0" />
      )}
      <span className="flex-1 text-sm text-[#e8e8e8] truncate">{game.name}</span>
      <button
        onClick={onRemove}
        className="text-[#6b6b6b] hover:text-[#e8e8e8] transition-colors p-1"
        aria-label="Supprimer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </Reorder.Item>
  )
}

export default function SetupMode({ games, onGamesChange, onStart }: Props) {
  function removeGame(rawgId: number) {
    const updated = games
      .filter(g => g.rawg_id !== rawgId)
      .map((g, i) => ({ ...g, position: i }))
    onGamesChange(updated)
  }

  function reorder(newOrder: Game[]) {
    onGamesChange(newOrder.map((g, i) => ({ ...g, position: i })))
  }

  const ready = games.length === 10

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#e8e8e8] tracking-tight">Gauntlet Challenge</h1>
        <p className="text-sm text-[#6b6b6b] mt-1">Sélectionne 10 jeux à battre d'affilée.</p>
      </div>

      <div className="space-y-3">
        <GameSearch
          currentGames={games}
          onAdd={g => onGamesChange([...games, { ...g, position: games.length }])}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6b6b6b]">{games.length}/10 jeux</span>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 w-5 rounded-full transition-colors duration-300 ${i < games.length ? 'bg-[#f97316]' : 'bg-[#2a2a2a]'}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {games.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Reorder.Group
                axis="y"
                values={games}
                onReorder={reorder}
                as="ul"
                className="space-y-1.5"
              >
                {games.map((g, i) => (
                  <GameItem
                    key={g.rawg_id}
                    game={g}
                    index={i}
                    onRemove={() => removeGame(g.rawg_id)}
                  />
                ))}
              </Reorder.Group>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={onStart}
        disabled={!ready}
        whileHover={ready ? { scale: 1.01 } : {}}
        whileTap={ready ? { scale: 0.98 } : {}}
        className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
          ready
            ? 'bg-[#f97316] text-white hover:bg-[#ea6c10]'
            : 'bg-[#1a1a1a] text-[#6b6b6b] border border-[#2a2a2a] cursor-not-allowed'
        }`}
      >
        {ready ? 'Lancer le challenge →' : `Encore ${10 - games.length} jeu${10 - games.length > 1 ? 'x' : ''} à ajouter`}
      </motion.button>
    </div>
  )
}
