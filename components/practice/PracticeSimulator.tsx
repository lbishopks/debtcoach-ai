'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, RotateCcw, Play, ChevronRight, Loader2, Volume2, VolumeX, Mic, MicOff, Square } from 'lucide-react'

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
    starter: 'Hello, this is Mark calling from ABC Collections LLC. Am I speaking with you? I\'m calling about a seriously delinquent account with Chase Bank. You have a balance of $2,340 that is 8 months past due. We need to resolve this today or I\'ll have to note the account as refusing to pay, which could affect your credit score further. How would you like to handle this?',
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
    starter: 'Good morning! This is Tony from National Recovery calling. Look, I\'m going to be real with you — this debt needs to be resolved TODAY. If we don\'t get a payment from you this morning, I\'m going to have to send this to our legal department and they will be sending someone to your address. This is serious. What\'s your debit card number so we can get this sorted out?',
  },
]

// ── Voice helpers ─────────────────────────────────────────────────────────────

function getCollectorVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  // Prefer a US English male voice
  const preferred = ['Google US English', 'Alex', 'Daniel', 'Aaron', 'Arthur', 'Rishi']
  for (const name of preferred) {
    const v = voices.find(v => v.name === name)
    if (v) return v
  }
  // Fall back to any en-US voice
  return voices.find(v => v.lang.startsWith('en')) || voices[0] || null
}

function speakCollector(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  const voice = getCollectorVoice()
  if (voice) utt.voice = voice
  utt.rate = 1.0
  utt.pitch = 0.85
  utt.volume = 1
  if (onEnd) utt.onend = onEnd
  window.speechSynthesis.speak(utt)
}

function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

// Strip [Coach:] section from spoken text
function toSpokenText(content: string): string {
  const idx = content.indexOf('[Coach:]')
  return (idx !== -1 ? content.slice(0, idx) : content).trim()
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

function MessageBubble({
  message,
  onReplay,
  voiceEnabled,
}: {
  message: Message
  onReplay: (text: string) => void
  voiceEnabled: boolean
}) {
  const isUser = message.role === 'user'
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
        {/* Replay button for collector messages */}
        {!isUser && voiceEnabled && collectorText && (
          <button
            onClick={() => onReplay(collectorText)}
            className="mt-1 flex items-center gap-1 text-[10px] text-white/30 hover:text-teal-400 transition-colors"
          >
            <Volume2 className="w-3 h-3" /> replay
          </button>
        )}
        {!isUser && <CoachNote text={message.content} />}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function PracticeSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [micAvailable, setMicAvailable] = useState(false)
  const [interimText, setInterimText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setMicAvailable(!!SpeechRecognition)

    // Pre-load voices
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }

    return () => {
      stopSpeaking()
      if (recognitionRef.current) recognitionRef.current.abort()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const speakMessage = useCallback((text: string) => {
    if (!voiceEnabled) return
    setIsSpeaking(true)
    speakCollector(text, () => setIsSpeaking(false))
  }, [voiceEnabled])

  function startScenario(scenario: typeof SCENARIOS[0]) {
    stopSpeaking()
    setSelectedScenario(scenario)
    const starterMsg: Message = { role: 'assistant', content: scenario.starter }
    setMessages([starterMsg])
    setInput('')
    setError('')
    setIsSpeaking(false)
    // Speak opener after a short delay
    setTimeout(() => speakCollector(scenario.starter, () => setIsSpeaking(false)), 400)
    if (voiceEnabled) setIsSpeaking(true)
  }

  function reset() {
    stopSpeaking()
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null }
    setSelectedScenario(null)
    setMessages([])
    setInput('')
    setError('')
    setIsSpeaking(false)
    setIsListening(false)
    setInterimText('')
  }

  function toggleVoice() {
    if (voiceEnabled) stopSpeaking()
    setVoiceEnabled(v => !v)
  }

  // Microphone / speech recognition
  function startListening() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    // Stop collector speaking before listening
    stopSpeaking()
    setIsSpeaking(false)

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition

    recognition.onstart = () => {
      setIsListening(true)
      setInterimText('')
    }

    recognition.onresult = (e: any) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      if (final) setInput(prev => (prev + ' ' + final).trim())
      setInterimText(interim)
    }

    recognition.onerror = () => {
      setIsListening(false)
      setInterimText('')
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText('')
      inputRef.current?.focus()
    }

    recognition.start()
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setInterimText('')
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || !selectedScenario || loading) return

    stopSpeaking()
    stopListening()

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setInterimText('')
    setLoading(true)
    setError('')

    try {
      const r = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, scenario: selectedScenario.id }),
      })
      if (!r.ok) throw new Error('Request failed')

      const reader = r.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let fullText = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += new TextDecoder().decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: fullText }
          return updated
        })
      }

      // Speak collector text after streaming is complete
      if (voiceEnabled && fullText) {
        const spoken = toSpokenText(fullText)
        if (spoken) {
          setIsSpeaking(true)
          speakCollector(spoken, () => setIsSpeaking(false))
        }
      }
    } catch {
      setError('Failed to get response. Please try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  // ── Scenario selection screen ──────────────────────────────────────────────
  if (!selectedScenario) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Negotiation Practice Simulator</h1>
          <p className="text-white/50 text-sm mt-1">
            Practice real debt collection scenarios with AI role-play. Voice-enabled — speak your responses or type them.
          </p>
        </div>

        <div className="bg-teal-400/5 border border-teal-400/20 rounded-xl px-4 py-3">
          <p className="text-teal-300/80 text-xs leading-relaxed">
            <span className="font-semibold text-teal-300">🎙️ Voice mode:</span> The AI collector will speak to you. Hit the mic button to speak your response, or type it. After each exchange you&apos;ll get coaching feedback on what to improve.
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

  // ── Chat interface ─────────────────────────────────────────────────────────
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
            {isSpeaking && (
              <span className="flex items-center gap-1 text-[10px] text-teal-300 animate-pulse">
                <Volume2 className="w-3 h-3" /> speaking...
              </span>
            )}
          </div>
        </div>
        {/* Voice toggle */}
        <button
          onClick={toggleVoice}
          title={voiceEnabled ? 'Mute collector voice' : 'Enable collector voice'}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
            voiceEnabled
              ? 'bg-teal-400/15 text-teal-300 hover:bg-teal-400/25'
              : 'bg-white/5 text-white/40 hover:bg-white/10'
          }`}
        >
          {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          {voiceEnabled ? 'Voice On' : 'Voice Off'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg"
        >
          <RotateCcw className="w-3 h-3" /> New
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin pr-2">
        <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-center">
          <p className="text-white/40 text-xs">
            {micAvailable
              ? 'Speak or type your response. The collector will speak back.'
              : 'Type your response. The collector will speak back.'}
          </p>
        </div>
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            message={m}
            voiceEnabled={voiceEnabled}
            onReplay={text => {
              setIsSpeaking(true)
              speakCollector(text, () => setIsSpeaking(false))
            }}
          />
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
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="pt-4 border-t border-white/10 mt-4 flex-shrink-0 space-y-2">
        {/* Interim speech text preview */}
        {isListening && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-white/50 text-xs italic">
              {interimText || 'Listening...'}
            </span>
          </div>
        )}
        <div className="flex gap-2">
          {/* Mic button */}
          {micAvailable && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              title={isListening ? 'Stop listening' : 'Speak your response'}
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all flex-shrink-0 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse'
                  : 'bg-white/8 hover:bg-white/15 text-white/60 hover:text-white'
              } disabled:opacity-40`}
            >
              {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          {/* Stop speaking button */}
          {isSpeaking && (
            <button
              type="button"
              onClick={() => { stopSpeaking(); setIsSpeaking(false) }}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all flex-shrink-0"
              title="Stop speaking"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
          <input
            ref={inputRef}
            className="input flex-1"
            value={input + (isListening && interimText ? ' ' + interimText : '')}
            onChange={e => {
              // Only update if not listening (prevent override)
              if (!isListening) setInput(e.target.value)
            }}
            placeholder={isListening ? 'Listening...' : 'Type or use mic to respond...'}
            disabled={loading || isListening}
            readOnly={isListening}
          />
          <button
            type="submit"
            disabled={loading || (!input.trim() && !interimText)}
            className="bg-teal-400 hover:bg-teal-300 disabled:opacity-40 text-[#0F1C2E] rounded-xl px-4 transition-all flex items-center justify-center flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  )
}
