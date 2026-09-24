import { useState } from 'react'
import { Button } from './ui'

export function Chat({ messages, onSend, selfRole = 'applicant', otherName = 'Operator', quickReplies = [] }) {
  const [text, setText] = useState('')

  function send() {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-line flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold flex items-center justify-center">
          {otherName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{otherName}</p>
          <p className="text-xs text-success flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m) => (
          <ChatBubble key={m.id} msg={m} selfRole={selfRole} />
        ))}
      </div>

      {quickReplies.length > 0 && (
        <div className="px-5 pb-2 flex flex-wrap gap-2">
          {quickReplies.map((q) => (
            <button
              key={q}
              onClick={() => onSend(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-line text-ink-soft hover:border-brand-300 hover:text-brand-600 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-line flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message"
          className="flex-1 rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <Button size="md" onClick={send}>Send</Button>
      </div>
    </div>
  )
}

function ChatBubble({ msg, selfRole }) {
  if (msg.from === 'system') {
    const tone = msg.tone === 'amber' ? 'bg-warning-bg text-warning' : msg.tone === 'blue' ? 'bg-brand-50 text-brand-600' : 'bg-surface text-ink-soft'
    return (
      <div className="flex justify-center">
        <span className={`text-xs px-3 py-1.5 rounded-full ${tone}`}>{msg.text}</span>
      </div>
    )
  }
  const isSelf = msg.from === selfRole
  return (
    <div className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${
        isSelf ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-surface text-ink rounded-bl-sm'
      } ${msg.sensitive ? 'ring-1 ring-warning/40' : ''}`}>
        {msg.sensitive && (
          <span className="block text-[10px] uppercase tracking-wide mb-1 opacity-80">Sensitive \u00b7 not stored</span>
        )}
        <p>{msg.text}</p>
        <span className={`block text-[10px] mt-1 ${isSelf ? 'text-white/70' : 'text-ink-faint'}`}>{msg.time}</span>
      </div>
    </div>
  )
}
