import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'

const STORAGE_KEY = 'gauntlet_admin'
const PASSWORD = import.meta.env.VITE_APP_PASSWORD as string | undefined

interface AdminContextValue {
  isAdmin: boolean
  modalOpen: boolean
  requestAdmin: () => void
  closeModal: () => void
  unlock: (password: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => !PASSWORD || sessionStorage.getItem(STORAGE_KEY) === '1')
  const [modalOpen, setModalOpen] = useState(false)

  const requestAdmin = useCallback(() => setModalOpen(true), [])
  const closeModal = useCallback(() => setModalOpen(false), [])

  const unlock = useCallback((password: string) => {
    if (password === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, '1')
      setIsAdmin(true)
      setModalOpen(false)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setIsAdmin(false)
  }, [])

  return (
    <AdminContext.Provider value={{ isAdmin, modalOpen, requestAdmin, closeModal, unlock, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
