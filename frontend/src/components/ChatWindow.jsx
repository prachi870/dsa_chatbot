import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import useChatStore from '../store/chatStore'
import { getTopics } from '../api/chat'

export default function ChatWindow({ onSendTopic }) {
  const messages = useChatStore((s) => s.messages)
  const typing   = useChatStore((s) => s.typing)
  const activeId = useChatStore((s) => s.activeSessionId)
  const bottomRef = useRef(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  if (!activeId && messages.length === 0) {
    return <EmptyState onSendTopic={onSendTopic} />
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-1">
      {messages.map((msg) => (
        <MessageBubble key={msg.id || msg._tempId} message={msg} />
      ))}
      {typing && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  )
}

function EmptyState({ onSendTopic }) {
  const topics = [
    { label: '🔢 Arrays & Hashing',      prompt: 'Explain arrays and hash maps with common patterns.' },
    { label: '🌲 Trees & Graphs',         prompt: 'Explain binary trees, BSTs, and graph traversal.' },
    { label: '⚡ Dynamic Programming',    prompt: 'Explain dynamic programming with the knapsack problem.' },
    { label: '🔍 Binary Search',          prompt: 'Explain binary search and its variations.' },
    { label: '📊 Sorting Algorithms',     prompt: 'Compare all major sorting algorithms with complexities.' },
    { label: '🔗 Linked Lists',           prompt: 'Explain singly and doubly linked lists with examples.' },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-3xl font-bold mb-4">
        D
      </div>
      <h2 className="text-xl font-bold text-white mb-2">DSABot</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-md">
        Your expert companion for Data Structures &amp; Algorithms. Ask me anything about DSA concepts, complexity analysis, or interview prep.
      </p>

      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
        {topics.map((t) => (
          <button
            key={t.label}
            onClick={() => onSendTopic(t.prompt)}
            className="text-left bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-300 transition"
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
