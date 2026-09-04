import { useEffect } from 'react'
import useChatStore from '../store/chatStore'
import useAuthStore from '../store/authStore'
import { getSessions, deleteSession } from '../api/chat'
import { useNavigate } from 'react-router-dom'

export default function Sidebar({ onNewChat, onSelectSession }) {
  const navigate       = useNavigate()
  const sessions       = useChatStore((s) => s.sessions)
  const setSessions    = useChatStore((s) => s.setSessions)
  const activeId       = useChatStore((s) => s.activeSessionId)
  const removeSession  = useChatStore((s) => s.removeSession)
  const { user, logout } = useAuthStore()

  useEffect(() => {
    getSessions()
      .then(({ data }) => setSessions(data.sessions))
      .catch(() => {})
  }, [])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await deleteSession(id)
      removeSession(id)
    } catch {}
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-sm">D</div>
        <span className="font-semibold text-white">DSABot</span>
      </div>

      {/* New chat */}
      <div className="px-3 pt-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {sessions.length === 0 && (
          <p className="text-gray-600 text-xs text-center pt-4">No conversations yet</p>
        )}
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectSession(s.id)}
            className={`group flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer transition text-sm
              ${activeId === s.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
          >
            <span className="truncate flex-1">{s.title}</span>
            <button
              onClick={(e) => handleDelete(e, s.id)}
              className="opacity-0 group-hover:opacity-100 ml-2 text-gray-500 hover:text-red-400 transition flex-shrink-0"
              aria-label="Delete session"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* User footer */}
      <div className="border-t border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-400 truncate">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-white transition flex-shrink-0 ml-2"
          aria-label="Logout"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
