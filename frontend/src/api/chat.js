import api from './client'

export const sendMessage  = (data)      => api.post('/chat', data)
export const getSessions  = ()          => api.get('/chat/sessions')
export const getHistory   = (sessionId) => api.get(`/chat/history/${sessionId}`)
export const deleteSession= (sessionId) => api.delete(`/chat/${sessionId}`)
export const getTopics    = ()          => api.get('/chat/topics')
