import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api/auth'
import useAuthStore from '../store/authStore'

export default function Signup() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)
  const [form, setForm]   = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await signup(form)
      setAuth(data.token, data.user)
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4">
            <span className="text-2xl font-bold">D</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-gray-400 mt-1 text-sm">Start learning DSA with AI</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 space-y-4 border border-gray-800">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
