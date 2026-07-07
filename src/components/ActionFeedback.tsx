import { motion, AnimatePresence } from 'framer-motion'

export type FeedbackType = 'success' | 'fail'

interface Props {
  feedback: { type: FeedbackType; id: number } | null
}

const THEME: Record<FeedbackType, { text: string; label: string; path: string }> = {
  success: {
    text: 'text-emerald-400',
    label: 'Jeu battu !',
    path: 'M5 13l4 4L19 7',
  },
  fail: {
    text: 'text-red-500',
    label: 'Perdu !',
    path: 'M6 18L18 6M6 6l12 12',
  },
}

/** Icon + label pop, shared by the full-screen flash and any contained variant (e.g. the OBS overlay). */
export function FeedbackContent({ type, compact = false }: { type: FeedbackType; compact?: boolean }) {
  const theme = THEME[type]

  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className={`flex flex-col items-center ${compact ? 'gap-2' : 'gap-3'} ${theme.text}`}
    >
      <svg className={compact ? 'w-8 h-8' : 'w-12 h-12'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d={theme.path} />
      </svg>
      <span className={`font-black tracking-tight ${compact ? 'text-3xl' : 'text-6xl'}`}>{theme.label}</span>
    </motion.div>
  )
}

function Flash({ type }: { type: FeedbackType }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 flex items-center justify-center bg-black"
    >
      <FeedbackContent type={type} />
    </motion.div>
  )
}

export default function ActionFeedback({ feedback }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence>
        {feedback && <Flash key={feedback.id} type={feedback.type} />}
      </AnimatePresence>
    </div>
  )
}
