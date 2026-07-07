import { useAdmin } from '../contexts/AdminContext'

export default function AdminButton() {
  const { isAdmin, requestAdmin, logout } = useAdmin()

  return (
    <button
      onClick={isAdmin ? logout : requestAdmin}
      title={isAdmin ? 'Repasser en mode spectateur' : 'Se connecter en admin'}
      className={`fixed top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
        isAdmin
          ? 'bg-[#f97316]/10 border-[#f97316]/40 text-[#f97316] hover:bg-[#f97316]/20'
          : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#6b6b6b] hover:text-[#e8e8e8] hover:border-[#6b6b6b]'
      }`}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d={isAdmin ? 'M8 11V7a4 4 0 017.5-2' : 'M8 11V7a4 4 0 018 0v4'} />
      </svg>
      {isAdmin ? 'Admin' : 'Spectateur'}
    </button>
  )
}
