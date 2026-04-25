'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, RotateCcw, Play, ChevronRight, Loader2, Volume2, VolumeX, Mic, Square } from 'lucide-react'

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
    starter: "Hello, this is Mark calling from ABC Collections LLC. I'm calling about a seriously delinquent account with Chase Bank. You have a balance of $2,340 that is 8 months past due. We need to resolve this today or I'll have to note the account as refusing to pay, which could affect your credit score further. How would you like to handle this?",
  },
  {
    id: 'debt-validation',
    title: 'Request Debt Validation',
    description: 'Practice demanding written validation of a debt you\'re not sure you owe.',
    icon: '📄',
    difficulty: 'Intermediate',
    difficultyColor: 'text-amber-400 bg-amber-400/10',
    starter: "Good afternoon, I'm calling from Premier Recovery Services about a $890 medical bill from 2022. This account has been in collections for several months. Can you verify your address so I can notate this account?",
  },
  {
    id: 'settlement-negotiation',
    title: 'Negotiate a Settlement',
    description: 'Practice negotiating a debt down to 40-50 cents on the dollar with a supervisor.',
    icon: '🤝',
    difficulty: 'Intermediate',
    difficultyColor: 'text-amber-400 bg-amber-400/10',
    starter: "Hi, this is David, I'm the account supervisor here at Advantage Collections. I understand you wanted to speak with someone about resolving your $5,200 balance. I do have some flexibility — we could potentially offer you a settlement, but the best we've been authorized is 85% of the balance, which would be $4,420. How does that sound?",
  },
  {
    id: 'harassment',
    title: 'Handle Collector Harassment',
    description: 'Practice staying calm and assertive with aggressive collector tactics in this educational exercise.',
    icon: '🛡️',
    difficulty: 'Advanced',
    difficultyColor: 'text-red-400 bg-red-400/10',
    starter: "Good morning! This is Tony from National Recovery calling. Look, I'm going to be real with you — this debt needs to be resolved TODAY. If we don't get a payment from you this morning, I'm going to have to send this to our legal department and they will be sending someone to your address. This is serious. What's your debit card number so we can get this sorted out?",
  },
]

// ── TTS ──────────────────────────────────────────────────────────────────────

function stripCoach(text: string): string {
  const idx = text.indexOf('[Coach:]')
  return (idx !== -1 ? text.slice(0, idx) : text).trim()
}

// Browser TTS fallback — picks the best available voice
function browserSpeak(text: string, onEnd?: () => void) {
  const synth = window.speechSynthesis
  synth.cancel()
  const utt = new SpeechSynthesisUtterance(text)

  const voices = synth.getVoices()
  // Preference order — macOS Premium/Enhanced, then Google, then any US English
  const prefs = [
    'Evan (Premium)', 'Aaron (Premium)', 'Nicky (Premium)', 'Rocko (Premium)',
    'Reed (Premium)', 'Eddy (Premium)',
    'Evan', 'Aaron', 'Nicky',
    'Google US English', 'Alex',
    'Daniel', 'Arthur',
  ]
  let chosen: SpeechSynthesisVoice | null = null
  for (const name of prefs) {
    const v = voices.find(v => v.name === name)
    if (v) { chosen = v; break }
  }
  // Final fallback: any en-US male-ish voice
  if (!chosen) chosen = voices.find(v => v.lang === 'en-US') || voices[0] || null
  if (chosen) utt.voice = chosen

  utt.rate = 0.95
  utt.pitch = 0.80
  utt.volume = 1.0
  if (onEnd) utt.onend = onEnd
  synth.speak(utt)
}

function stopBrowserSpeak() {
  if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CoachNote({ text }: { text: string }) {
  const idx = text.indexOf('[Coach:]')
  if (idx === -1) return null
  const note = text.slice(idx + 8).trim()
  if (!note) return null
  return (
    <div className="mt-2 bg-teal-400/8 border border-teal-400/20 rounded-lg px-3 py-2">
      <p className="text-teal-300 text-xs font-medium mb-0.5">💡 Coach Feedback</p>
      <p className="text-teal-300/80 text-xs leading-relaxed">{note}</p>
    </div>
  )
}

function MessageBubble({
  message,
  onReplay,
  voiceOn,
}: {
  message: Message
  onReplay: (text: string) => void
  voiceOn: boolean
}) {
  const isUser = message.role === 'user'
  const collectorText = stripCoach(message.content)

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${isUser ? 'bg-teal-400/20 text-teal-300' : 'bg-red-500/20 text-red-400'}`}>
        {isUser ? 'You' : '☎'}
      </div>
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
          ? 'bg-teal-400/15 text-white rounded-tr-sm'
          : 'bg-white/8 text-white/90 rounded-tl-sm'}`}>
          {isUser ? message.content : collectorText}
        </div>
        {!isUser && voiceOn && collectorText && (
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

// ── Main ──────────────────────────────────────────────────────────────────────

type MicState = 'idle' | 'listening' | 'error'

export function PracticeSimulator() {
  const [scenario, setScenario] = useState<typeof SCENARIOS[0] | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [voiceOn, setVoiceOn] = useState(true)
  const [speaking, setSpeaking] = useState(false)
  const [micState, setMicState] = useState<MicState>('idle')
  const [micError, setMicError] = useState('')
  const [interim, setInterim] = useState('')
  const [micSupported, setMicSupported] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setMicSupported(!!SR && !!navigator.mediaDevices)

    // Prime voices list
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
    return () => {
      stopAll()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function stopAll() {
    stopBrowserSpeak()
    audioRef.current?.pause()
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null }
    setSpeaking(false)
    setMicState('idle')
    setInterim('')
  }

  // Speak collector text — tries ElevenLabs, falls back to browser
  const speakText = useCallback(async (text: string) => {
    if (!voiceOn || !text) return
    stopBrowserSpeak()
    audioRef.current?.pause()
    setSpeaking(true)

    try {
      const resp = await fetch('/api/practice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (resp.ok && resp.headers.get('Content-Type')?.includes('audio')) {
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url) }
        audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url) }
        await audio.play()
        return
      }
    } catch { /* fall through to browser TTS */ }

    // Browser TTS fallback
    browserSpeak(text, () => setSpeaking(false))
  }, [voiceOn])

  function startScenario(s: typeof SCENARIOS[0]) {
    stopAll()
    setScenario(s)
    setMessages([{ role: 'assistant', content: s.starter }])
    setInput('')
    setError('')
    setMicError('')
    // Small delay so page renders before speaking
    setTimeout(() => speakText(s.starter), 300)
  }

  function reset() {
    stopAll()
    setScenario(null)
    setMessages([])
    setInput('')
    setError('')
    setMicError('')
    setInterim('')
  }

  // ── Mic ────────────────────────────────────────────────────────────────────

  async function startListening() {
    setMicError('')

    // First get explicit mic permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err: any) {
      setMicError('Microphone access denied. Allow mic in your browser settings.')
      setMicState('error')
      return
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setMicError('Speech recognition not supported. Use Chrome or Edge.')
      setMicState('error')
      return
    }

    // Pause collector while user speaks
    stopBrowserSpeak()
    audioRef.current?.pause()
    setSpeaking(false)

    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1
    recognitionRef.current = rec

    rec.onstart = () => { setMicState('listening'); setInterim('') }

    rec.onresult = (e: any) => {
      let fin = '', int = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) fin += t + ' '
        else int += t
      }
      if (fin) setInput(prev => (prev + ' ' + fin).trim())
      setInterim(int)
    }

    rec.onerror = (e: any) => {
      const msgs: Record<string, string> = {
        'not-allowed': 'Microphone access denied.',
        'no-speech': 'No speech detected — try again.',
        'audio-capture': 'Microphone not found.',
        'network': 'Network error — check your connection.',
      }
      setMicError(msgs[e.error] || `Error: ${e.error}`)
      setMicState('error')
      recognitionRef.current = null
    }

    rec.onend = () => {
      setMicState('idle')
      setInterim('')
      recognitionRef.current = null
      inputRef.current?.focus()
    }

    try {
      rec.start()
    } catch (err: any) {
      setMicError('Could not start microphone: ' + err.message)
      setMicState('error')
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setMicState('idle')
    setInterim('')
    inputRef.current?.focus()
  }

  // ── Send ───────────────────────────────────────────────────────────────────

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || !scenario || loading) return

    stopAll()
    const userMsg: Message = { role: 'user', content: text }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput('')
    setInterim('')
    setLoading(true)
    setError('')

    try {
      const r = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, scenario: scenario.id }),
      })
      if (!r.ok) throw new Error('Request failed')

      const reader = r.body?.getReader()
      if (!reader) throw new Error('No stream')

      let full = ''
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += new TextDecoder().decode(value)
        setMessages(prev => {
          const u = [...prev]
          u[u.length - 1] = { role: 'assistant', content: full }
          return u
        })
      }

      // Speak after full response
      const spoken = stripCoach(full)
      if (spoken) speakText(spoken)
    } catch {
      setError('Failed to get response. Please try again.')
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  // ── Scenario picker ────────────────────────────────────────────────────────

  if (!scenario) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Negotiation Practice Simulator</h1>
          <p className="text-white/50 text-sm mt-1">
            AI role-play with voice. The collector speaks to you — respond by mic or keyboard.
          </p>
        </div>
        <div className="bg-amber-400/8 border border-amber-400/25 rounded-xl px-4 py-3">
          <p className="text-amber-300/90 text-xs leading-relaxed">
            <span className="font-semibold text-amber-300">⚖️ Educational exercise only:</span> This simulator is a communication skills practice tool — not legal advice. Scenarios are fictional. Coaching feedback is general educational information, not guidance on any real dispute. What you say to an actual debt collector in your real situation should be based on advice from a licensed attorney.
          </p>
        </div>
        <div className="bg-teal-400/5 border border-teal-400/20 rounded-xl px-4 py-3">
          <p className="text-teal-300/80 text-xs leading-relaxed">
            <span className="font-semibold text-teal-300">🎙️ How it works:</span> Pick a scenario, the collector will speak. Hit the mic button, say your response, then hit the mic again to stop and send. You&apos;ll get coaching after every exchange.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => startScenario(s)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/30 rounded-2xl p-5 text-left transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.difficultyColor}`}>{s.difficulty}</span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-teal-300 transition-colors">{s.title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{s.description}</p>
              <div className="mt-3 flex items-center text-teal-400 text-xs font-medium gap-1">
                <Play className="w-3 h-3" /> Start scenario <ChevronRight className="w-3 h-3 ml-auto" />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Chat ───────────────────────────────────────────────────────────────────

  const isListening = micState === 'listening'
  const displayInput = isListening ? (input + (interim ? ' ' + interim : '')).trim() : input

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4 flex-shrink-0">
        <div className="w-9 h-9 bg-red-500/15 rounded-xl flex items-center justify-center text-lg">
          {scenario.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-sm">{scenario.title}</h2>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">Practice Mode</span>
            {speaking && <span className="text-[10px] text-teal-300 animate-pulse flex items-center gap-1"><Volume2 className="w-3 h-3" />speaking</span>}
            {isListening && <span className="text-[10px] text-red-400 animate-pulse flex items-center gap-1"><Mic className="w-3 h-3" />listening</span>}
          </div>
        </div>
        <button onClick={() => { setVoiceOn(v => { if (v) stopAll(); return !v }) }}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${voiceOn ? 'bg-teal-400/15 text-teal-300 hover:bg-teal-400/25' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
          {voiceOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          {voiceOn ? 'Voice On' : 'Voice Off'}
        </button>
        <button onClick={reset}
          className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all">
          <RotateCcw className="w-3 h-3" /> New
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin pr-2">
        <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-center">
          <p className="text-white/40 text-xs">
            {micSupported ? 'Tap the mic to speak, tap again to stop & send.' : 'Type your response below.'}
          </p>
        </div>
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} voiceOn={voiceOn}
            onReplay={text => speakText(text)} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-sm">☎</div>
            <div className="bg-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="typing-indicator flex gap-1"><span /><span /><span /></div>
            </div>
          </div>
        )}
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-white/10 mt-4 flex-shrink-0 space-y-2">
        {/* Mic error */}
        {micState === 'error' && micError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <p className="text-red-300 text-xs flex-1">{micError}</p>
            <button onClick={() => { setMicState('idle'); setMicError('') }} className="text-red-400/60 hover:text-red-400 text-xs">✕</button>
          </div>
        )}
        {/* Interim preview */}
        {isListening && (
          <div className="flex items-center gap-2 px-1">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0" />
            <p className="text-white/50 text-xs italic truncate">
              {displayInput || 'Listening — speak now...'}
            </p>
          </div>
        )}
        <form onSubmit={handleSend} className="flex gap-2">
          {/* Mic button */}
          {micSupported && (
            <button type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              title={isListening ? 'Stop & send' : 'Tap to speak'}
              className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all flex-shrink-0 disabled:opacity-40 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-400 text-white ring-2 ring-red-400/40'
                  : 'bg-white/8 hover:bg-white/15 text-white/60 hover:text-white'
              }`}>
              {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
          {/* Stop speaking */}
          {speaking && !isListening && (
            <button type="button" onClick={() => { stopBrowserSpeak(); audioRef.current?.pause(); setSpeaking(false) }}
              title="Stop speaking"
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition-all flex-shrink-0">
              <VolumeX className="w-4 h-4" />
            </button>
          )}
          <input ref={inputRef}
            className="input flex-1"
            value={displayInput}
            onChange={e => { if (!isListening) setInput(e.target.value) }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any) } }}
            placeholder={isListening ? 'Listening...' : 'Type or use mic...'}
            disabled={loading}
            readOnly={isListening}
          />
          <button type="submit"
            disabled={loading || !displayInput.trim()}
            className="bg-teal-400 hover:bg-teal-300 disabled:opacity-40 text-[#0F1C2E] rounded-xl px-4 transition-all flex items-center justify-center flex-shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
