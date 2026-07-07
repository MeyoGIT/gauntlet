import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdmin } from '../contexts/AdminContext'

export default function AdminModal() {
  const { modalOpen, closeModal, unlock } = useAdmin()
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = unlock(input)
    setInput('')
    setError(!ok)
  }

  function handleClose() {
    closeModal()
    setInput('')
    setError(false)
  }

  return (
    <AnimatePresence>
      {modalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 max-w-sm w-full space-y-5"
          >
            <div className="space-y-1">
              <p className="text-xs text-[#f97316] uppercase tracking-[0.2em] font-medium">Accès admin</p>
              <p className="text-sm text-[#6b6b6b]">Entre le mot de passe pour activer les modifications.</p>
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
              <div className="flex gap-2 pt-1">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 py-2.5 rounded-lg bg-[#f97316] text-white text-sm font-medium hover:bg-[#ea6c10] transition-colors cursor-pointer"
                >
                  Déverrouiller
                </motion.button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-lg border border-[#2a2a2a] text-[#e8e8e8] text-sm hover:bg-[#2a2a2a] transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
