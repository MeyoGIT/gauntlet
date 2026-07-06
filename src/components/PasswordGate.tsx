import { useState } from 'react'
import { motion } from 'framer-motion'

const STORAGE_KEY = 'gauntlet_unlocked'
const PASSWORD = import.meta.env.VITE_APP_PASSWORD as string | undefined

interface Props {
  children: React.ReactNode
}

export default function PasswordGate({ children }: Props) {
  const [unlocked, setUnlocked] = useState(() => {
    if (!PASSWORD) return true
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setUnlocked(true)
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f0f0f]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm px-4"
      >
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 space-y-6">
          <div className="space-y-1 text-center">
            <p className="text-xs text-[#f97316] uppercase tracking-[0.2em] font-medium">Accès restreint</p>
            <h1 className="text-2xl font-bold text-[#e8e8e8] tracking-tight">Gauntlet</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="password"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false) }}
              placeholder="Mot de passe"
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-[#e8e8e8] text-sm placeholder-[#6b6b6b] outline-none focus:border-[#f97316]/60 transition-colors"
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400"
              >
                Mot de passe incorrect.
              </motion.p>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-lg bg-[#f97316] text-white text-sm font-medium hover:bg-[#ea6c10] transition-colors cursor-pointer"
            >
              Entrer
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
