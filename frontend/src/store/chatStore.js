import { create } from 'zustand'

const useChatStore = create((set, get) => ({
  sessions:        [],
  activeSessionId: null,
  messages:        [],   // messages for active session
  loading:         false,
  typing:          false,

  setSessions: (sessions) => set({ sessions }),

  setActiveSession: (id) => set({ activeSessionId: id, messages: [] }),

  setMessages: (messages) => set({ messages }),

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),

  removeSession: (id) => set((s) => ({
    sessions: s.sessions.filter((s) => s.id !== id),
    activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
    messages: s.activeSessionId === id ? [] : s.messages,
  })),

  setTyping:  (v) => set({ typing: v }),
  setLoading: (v) => set({ loading: v }),
}))

export default useChatStore
