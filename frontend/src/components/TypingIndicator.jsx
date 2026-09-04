export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-2">
      {/* Bot avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold mt-0.5">
        D
      </div>
      <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}
