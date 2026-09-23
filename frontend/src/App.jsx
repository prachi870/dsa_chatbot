import { useEffect } from 'react'
import Chat from './pages/Chat'
import useAuthStore from './store/authStore'

export default function App() {
  const ready         = useAuthStore((s) => s.ready)
  const ensureSession = useAuthStore((s) => s.ensureSession)

  // No login/signup screens — silently establish a session and go
  // straight into the chat UI.
  useEffect(() => {
    ensureSession()
  }, [ensureSession])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-brand-500 rounded-full animate-spin" />
      </div>
    )
  }

  return <Chat />
}
