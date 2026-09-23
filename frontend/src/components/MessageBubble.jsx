import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 px-4 py-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
        ${isUser ? 'bg-gray-600' : 'bg-brand-600'}`}>
        {isUser ? 'U' : 'D'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-brand-600 text-white rounded-tr-sm'
          : 'bg-gray-800 text-gray-100 rounded-tl-sm'
        }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <CodeBlock language={match[1]}>{children}</CodeBlock>
                ) : (
                  <code className="bg-gray-700 rounded px-1.5 py-0.5 font-mono text-xs text-brand-300" {...props}>
                    {children}
                  </code>
                )
              },
              // Tables
              table: ({ children }) => (
                <div className="overflow-x-auto my-3">
                  <table className="min-w-full border border-gray-700 text-xs">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-gray-700 bg-gray-700 px-3 py-2 text-left font-semibold">{children}</th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-700 px-3 py-2">{children}</td>
              ),
              // Headings
              h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mt-3 mb-1.5">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
              // Lists
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 ml-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 ml-2">{children}</ol>,
              // Blockquote
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-brand-500 pl-3 text-gray-400 italic my-2">{children}</blockquote>
              ),
              // Strong/em
              strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}

        <span className="block text-right text-[10px] mt-1 opacity-50">
          {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
