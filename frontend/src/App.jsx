import { Routes, Route, Navigate } from 'react-router-dom'
import Login  from './pages/Login'
import Signup from './pages/Signup'
import Chat   from './pages/Chat'
import useAuthStore from './store/authStore'

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/chat" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="/login"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/chat"   element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="*"       element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}
