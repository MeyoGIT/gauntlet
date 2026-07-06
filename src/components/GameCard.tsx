import { motion } from 'framer-motion'
import type { Game } from '../types'

type GameStatus = 'pending' | 'current' | 'beaten'

interface Props {
  game: Game
  index: number
  status: GameStatus
  tries: number
}

export default function GameCard({ game, index, status, tries }: Props) {
  return (
    <motion.div
      layout
      layoutId={`game-${game.rawg_id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, delay: index * 0.03 }}
      className="relative rounded-xl overflow-hidden h-full"
      style={{
        border: status === 'current' ? '1.5px solid #f97316' : '1.5px solid #2a2a2a',
      }}
    >
      {/* Cover image */}
      {game.cover_url ? (
        <img
          src={game.cover_url}
          alt={game.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#1a1a1a]" />
      )}

      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

      {/* Beaten green overlay */}
      {status === 'beaten' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-emerald-500/15"
        />
      )}

      {/* Pending dimmed */}
      {status === 'pending' && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      {/* Top row */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-2.5">
        <span
          className="text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-md"
          style={{
            background: 'rgba(0,0,0,0.5)',
            color: status === 'current' ? '#f97316' : status === 'beaten' ? '#22c55e' : '#9ca3af',
          }}
        >
          {index + 1}
        </span>

        {status === 'beaten' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
            className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}

        {status === 'current' && (
          <div className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse mt-1" />
        )}

        {tries > 0 && status === 'current' && (
          <span className="text-xs text-white/50 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(0,0,0,0.5)' }}>
            {tries}×
          </span>
        )}
      </div>

      {/* Bottom name */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p
          className="text-xs font-medium leading-tight line-clamp-2"
          style={{
            color: status === 'beaten' ? '#86efac' : status === 'current' ? '#fff' : '#9ca3af',
          }}
        >
          {game.name}
        </p>
      </div>
    </motion.div>
  )
}
