import { create } from 'zustand'
import { signup } from '../api/auth'

// Generates a unique, throwaway guest identity so we can authenticate
// against the backend silently — no login/signup UI needed.
function guestCredentials() {
  const id = (crypto.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2)
  return {
    name:     'Guest',
    email:    `guest_${id}@dsabot.local`,
    password: `g${id}${id}`, // >= 6 chars, required by backend
  }
}

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user:  JSON.parse(localStorage.getItem('user') || 'null'),
  ready: false, // becomes true once a session (guest or otherwise) is confirmed

  setAuth: (token, user) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user, ready: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null, ready: false })
  },

  // Ensures the app always has a valid session so it can open straight
  // into the chat UI. If a token already exists, it's reused as-is;
  // otherwise a fresh guest account is created behind the scenes.
  ensureSession: async () => {
    if (get().token) {
      set({ ready: true })
      return
    }
    try {
      const { data } = await signup(guestCredentials())
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      set({ token: data.token, user: data.user, ready: true })
    } catch (err) {
      console.error('[auth] guest session bootstrap failed', err)
      set({ ready: true }) // let the UI render regardless; requests will surface the error
    }
  },
}))

export default useAuthStore
