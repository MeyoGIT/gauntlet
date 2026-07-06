import { motion } from 'framer-motion'
import { formatDuration } from '../hooks/useTimer'

interface Props {
  totalTries: number
  elapsed: number
  onReset: () => void
}

const particles = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 600,
  drift: (Math.random() - 0.5) * 120,
  delay: Math.random() * 0.6,
  size: Math.random() > 0.5 ? 6 : 4,
  color: Math.random() > 0.4 ? '#f97316' : '#e8e8e8',
}))

export default function VictoryScreen({ totalTries, elapsed, onReset }: Props) {
  return (
    <div className="h-full flex items-center justify-center relative overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{ width: p.size, height: p.size, background: p.color, bottom: '40%', left: '50%' }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x + p.drift, y: -(280 + Math.random() * 160), opacity: 0, scale: 0.4 }}
          transition={{ duration: 1.4 + Math.random() * 0.6, delay: p.delay, ease: [0.2, 0.8, 0.4, 1] }}
        />
      ))}

      <div className="text-center space-y-8 relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.15 }}
          className="flex justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-4xl">
            🏆
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="space-y-1.5"
        >
          <p className="text-xs text-[#f97316] uppercase tracking-[0.2em] font-medium">Challenge terminé</p>
          <p className="text-4xl font-bold text-[#e8e8e8] tracking-tight">Victoire.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex items-center justify-center gap-10"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-[#f97316] tabular-nums">{totalTries}</p>
            <p className="text-xs text-[#6b6b6b] mt-1 uppercase tracking-wider">essai{totalTries !== 1 ? 's' : ''}</p>
          </div>
          <div className="w-px h-10 bg-[#2a2a2a]" />
          <div className="text-center">
            <p className="text-3xl font-bold text-[#e8e8e8] tabular-nums">{formatDuration(elapsed)}</p>
            <p className="text-xs text-[#6b6b6b] mt-1 uppercase tracking-wider">temps total</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          <motion.button
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-2.5 rounded-lg border border-[#2a2a2a] text-sm text-[#6b6b6b] hover:text-[#e8e8e8] hover:border-[#6b6b6b] transition-colors"
          >
            Nouvelle session
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
