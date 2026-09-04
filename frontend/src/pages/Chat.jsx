import { useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'
import InputBox from '../components/InputBox'
import useChatStore from '../store/chatStore'
import { sendMessage, getHistory } from '../api/chat'

export default function Chat() {
  const {
    activeSessionId, setActiveSession,
    addMessage, setMessages,
    addSession, setTyping,
  } = useChatStore()
  const typing    = useChatStore((s) => s.typing)
  const sessions  = useChatStore((s) => s.sessions)

  const handleNewChat = () => {
    setActiveSession(null)
    setMessages([])
  }

  const handleSelectSession = async (id) => {
    setActiveSession(id)
    try {
      const { data } = await getHistory(id)
      setMessages(data.messages)
    } catch {
      setMessages([])
    }
  }

  const handleSend = useCallback(async (text) => {
    const tempUserMsg = {
      _tempId:   Date.now(),
      role:      'user',
      content:   text,
      timestamp: new Date().toISOString(),
    }
    addMessage(tempUserMsg)
    setTyping(true)

    try {
      const { data } = await sendMessage({
        message:   text,
        sessionId: activeSessionId || undefined,
      })

      // If a new session was created, add it to the sidebar
      if (!activeSessionId) {
        setActiveSession(data.sessionId)
        addSession({
          id:    data.sessionId,
          title: text.slice(0, 50),
        })
      }

      const botMsg = {
        _tempId:   Date.now() + 1,
        role:      'bot',
        content:   data.reply,
        timestamp: new Date().toISOString(),
      }
      addMessage(botMsg)
    } catch (err) {
      addMessage({
        _tempId:   Date.now() + 1,
        role:      'bot',
        content:   '⚠️ Something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      })
    } finally {
      setTyping(false)
    }
  }, [activeSessionId, addMessage, setTyping, setActiveSession])

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar onNewChat={handleNewChat} onSelectSession={handleSelectSession} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="px-6 py-3.5 border-b border-gray-800 flex items-center gap-3 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-gray-400">
            {activeSessionId
              ? sessions.find(s => s.id === activeSessionId)?.title || 'Chat'
              : 'New conversation'}
          </span>
        </header>

        {/* Messages */}
        <ChatWindow onSendTopic={handleSend} />

        {/* Input */}
        <InputBox onSend={handleSend} disabled={typing} />
      </main>
    </div>
  )
}
