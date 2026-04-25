'use client'
import { useState, useRef, useEffect } from 'react'
import { Send, RotateCcw, Play, Phone, MessageSquare, ChevronRight, Loader2, Volume2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SCENARIOS = [
  {
    id: 'initial-contact',
    title: 'Initial Collector Call',
    description: 'Practice your first response when a collector calls about a $2,340 credit card debt.',
    icon: '📞',
    difficulty: 'Beginner',
    difficultyColor: 'text-green-400 bg-green-400/10',
    starter: 'Hello, this is Mark calling from ABC Collections LLC. Am I speaking with [your name]? I\'m calling about a seriously delinquent account with Chase Bank. You have a balance of $2,340 that is 8 months past due. We need to resolve this today or I\'ll have to note the account as refusing to pay, which could affect your credit score further. How would you like to handle this?',
  },
  {
    id: 'debt-validation',
    title: 'Request Debt Validation',
    description: 'Practice demanding written validation of a debt you\'re not sure you owe.',
    icon: '📄',
    difficulty: 'Intermediate',
    difficultyColor: 'text-amber-400 bg-amber-400/10',
    starter: 'Good afternoon, I\'m calling from Premier Recovery Services about a $890 medical bill from 2022. This account has been in collections for several months. Can you verify your address so I can notate this account?',
  },
  {
    id: 'settlement-negotiation',
    title: 'Negotiate a Settlement',
    description: 'Practice negotiating a debt down to 40-50 cents on the dollar with a supervisor.',
    icon: '🤝',
    difficulty: 'Intermediate',
    difficultyColor: 'text-amber-400 bg-amber-400/10',
    starter: 'Hi, this is David, I\'m the account supervisor here at Advantage Collections. I understand you wanted to speak with someone about resolving your $5,200 balance. I do have some flexibility — we could potentially offer you a settlement, but I have to be honest, the best we\'ve been authorized is 85% of the balance, which would be $4,420. How does that sound?',
  },
  {
    id: 'harassment',
    title: 'Handle Collector Harassment',
    description: 'Practice standing up to aggressive, borderline-illegal collector tactics.',
    icon: '🛡️',
    difficulty: 'Advanced',
    difficultyColor: 'text-red-400 bg-red-400/10',
    starter: '[7:45 AM] Good morning! This is Tony from National Recovery calling. Look, I\'m going to be real with you — this debt needs to be resolved TODAY. If we don\'t get a payment from you this morning, I\'m going to have to send this to our legal department and they will be sending someone to your address. This is serious. What\'s your debit card number so we can get this sorted out?',
  },
]

function CoachNote({ text }: { text: string }) {
  const idx = text.indexOf('[Coach:]')
  if (idx === -1) return null
  const coachText = text.slice(idx + 8).trim()
  if (!coachText) return null
  return (
    <div className="mt-2 bg-teal-400/8 border border-teal-400/20 rounded-lg px-3 py-2">
      <p className="text-teal-300 text-xs font-medium mb-0.5">💡 Coach Feedback</p>
      <p className="text-teal-300/80 text-xs leading-relaxed">{coachText}</p>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  // Split off coach note from collector text
  const coachIdx = message.content.indexOf('[Coach:]')
  const collectorText = (coachIdx !== -1 ? message.content.slice(0, coachIdx) : message.content).trim()

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${isUser ? 'bg-teal-400/20 text-teal-300' : 'bg-red-500/20 text-red-400'}`}>
        {isUser ? 'You' : '☎'}
      </div>
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
          ? 'bg-teal-400/15 text-white rounded-tr-sm'
          : 'bg-white/8 text-white/90 rounded-tl-sm'}`}>
          {isUser ? message.content : collectorText}
        </div>
        {!isUser && <CoachNote text={message.content} />}
      </div>
    </div>
  )
}

export function PracticeSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function startScenario(scenario: typeof SCENARIOS[0]) {
    setSelectedScenario(scenario)
    setMessages([{ role: 'assistant', content: scenario.starter }])
    setInput('')
    setError('')
  }

  function reset() {
    setSelectedScenario(null)
    setMessages([])
    setInput('')
    setError('')
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || !selectedScenario || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const r = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          scenario: selectedScenario.id,
        }),
      })

      if (!r.ok) throw new Error('Request failed')

      const reader = r.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let text = ''
      const assistantMsg: Message = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMsg])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += new TextDecoder().decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: text }
          return updated
        })
      }
    } catch {
      setError('Failed to get response. Please try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  // Scenario selection screen
  if (!selectedScenario) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Negotiation Practice Simulator</h1>
          <p className="text-white/50 text-sm mt-1">
            Practice real debt collection scenarios with AI role-play. Get coached after every response.
          </p>
        </div>

        <div className="bg-teal-400/5 border border-teal-400/20 rounded-xl px-4 py-3">
          <p className="text-teal-300/80 text-xs leading-relaxed">
            <span className="font-semibold text-teal-300">💡 How it works:</span> The AI plays a debt collector, you respond as the consumer. After each exchange, you&apos;ll get coaching feedback on what you did well and how to improve. Practice until you feel confident.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => startScenario(s)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/30 rounded-2xl p-5 text-left transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.difficultyColor}`}>
                  {s.difficulty}
                </span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-teal-300 transition-colors">{s.title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{s.description}</p>
              <div className="mt-3 flex items-center text-teal-400 text-xs font-medium gap-1">
                <Play className="w-3 h-3" /> Start scenario
                <ChevronRight className="w-3 h-3 ml-auto" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Chat interface
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4 flex-shrink-0">
        <div className="w-9 h-9 bg-red-500/15 rounded-xl flex items-center justify-center text-lg">
          {selectedScenario.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-sm">{selectedScenario.title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">Practice Mode</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${selectedScenario.difficultyColor}`}>
              {selectedScenario.difficulty}
            </span>
          </div>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
        >
          <RotateCcw className="w-3 h-3" /> New Scenario
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin pr-2">
        <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-center">
          <p className="text-white/40 text-xs">Respond as you would in a real conversation. The collector AI will reply and coach you.</p>
        </div>
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-sm">☎</div>
            <div className="bg-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="typing-indicator flex gap-1">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <p className="text-red-400 text-xs text-center">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-3 pt-4 border-t border-white/10 mt-4 flex-shrink-0">
        <input
          className="input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type what you would say to the collector..."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-teal-400 hover:bg-teal-300 disabled:opacity-40 text-[#0F1C2E] rounded-xl px-4 transition-all flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}
