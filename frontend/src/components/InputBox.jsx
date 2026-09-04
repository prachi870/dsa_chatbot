import { useState, useRef, useEffect } from 'react'

export default function InputBox({ onSend, disabled }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [text])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  return (
    <div className="px-4 py-4 border-t border-gray-800 bg-gray-950">
      <div className="max-w-3xl mx-auto flex items-end gap-3 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-3 focus-within:border-brand-500 transition">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask a DSA question… (Shift+Enter for new line)"
          className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm leading-relaxed disabled:opacity-50"
          style={{ maxHeight: '160px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
          aria-label="Send message"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      <p className="text-center text-xs text-gray-600 mt-2">
        DSABot only answers Data Structures &amp; Algorithms questions
      </p>
    </div>
  )
}
