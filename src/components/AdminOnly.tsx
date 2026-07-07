import type { ReactNode } from 'react'
import { useAdmin } from '../contexts/AdminContext'

/** Renders children only for admins — fully hidden (not just disabled) for spectators. */
export default function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdmin()
  if (!isAdmin) return null
  return <>{children}</>
}
