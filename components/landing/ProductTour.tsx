'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, FileText, BarChart2, Phone, ChevronRight, ChevronLeft, Play, Pause } from 'lucide-react'

// ─── Mock screen components ───────────────────────────────────────────────────

function ChatScreen() {
  return (
    <div className="flex flex-col h-full bg-navy-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold">AI Debt Coach</p>
          <p className="text-white/40 text-xs">Consumer rights education • Not legal advice</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-teal-400 text-xs font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* User message */}
        <div className="flex justify-end">
          <div className="max-w-[75%] bg-teal-400 text-navy-200 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-medium">
            A debt collector called me at 10:15pm last night. Can they legally do that?
          </div>
        </div>

        {/* AI response */}
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-teal-400/20 flex-shrink-0 flex items-center justify-center mt-0.5">
            <span className="text-teal-400 text-xs font-bold">DC</span>
          </div>
          <div className="max-w-[80%] bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-white/90 text-sm leading-relaxed">
              Under the <span className="text-teal-300 font-semibold">FDCPA § 1692c</span>, debt collectors are generally prohibited from contacting consumers before <strong className="text-white">8am or after 9pm</strong> local time.
            </p>
            <p className="text-white/70 text-sm leading-relaxed mt-2">
              A call at 10:15pm would fall outside the hours generally permitted under federal law. Whether this specific call constitutes a violation is something a licensed attorney can assess.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs bg-white/10 text-white/60 rounded-full px-2.5 py-1">📋 Generate FDCPA violation notice</span>
              <span className="text-xs bg-white/10 text-white/60 rounded-full px-2.5 py-1">⚖️ Find a consumer attorney</span>
            </div>
          </div>
        </div>

        {/* User follow-up */}
        <div className="flex justify-end">
          <div className="max-w-[75%] bg-teal-400 text-navy-200 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm font-medium">
            What about calling my workplace?
          </div>
        </div>

        {/* AI follow-up */}
        <div className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-teal-400/20 flex-shrink-0 flex items-center justify-center mt-0.5">
            <span className="text-teal-400 text-xs font-bold">DC</span>
          </div>
          <div className="max-w-[80%] bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-white/90 text-sm leading-relaxed">
              Under <span className="text-teal-300 font-semibold">§ 1692c(a)(3)</span>, collectors are generally prohibited from contacting you at work <strong className="text-white">if they know your employer prohibits such calls</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 bg-white/8 border border-white/15 rounded-xl px-3 py-2">
          <span className="text-white/30 text-sm flex-1">Ask about your consumer rights...</span>
          <div className="w-7 h-7 rounded-lg bg-teal-400 flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-navy-200" />
          </div>
        </div>
        <p className="text-white/25 text-[10px] text-center mt-1.5">Educational information only · Not legal advice</p>
      </div>
    </div>
  )
}

function LetterScreen() {
  return (
    <div className="flex h-full bg-navy-200">
      {/* Left: form */}
      <div className="w-[42%] border-r border-white/10 p-4 flex flex-col gap-3 overflow-hidden">
        <p className="text-white font-semibold text-sm">Generate Letter</p>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Letter Type</label>
          <div className="bg-white/8 border border-teal-400/40 rounded-lg px-3 py-2 text-sm text-white flex items-center justify-between">
            Cease & Desist
            <ChevronRight className="w-3.5 h-3.5 text-white/40 rotate-90" />
          </div>
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Creditor Name</label>
          <div className="bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80">
            Portfolio Recovery Associates
          </div>
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Account Number</label>
          <div className="bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80">
            ****-****-****-4821
          </div>
        </div>

        <div>
          <label className="text-white/50 text-xs mb-1 block">Amount in Question</label>
          <div className="bg-white/8 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80">
            $3,200
          </div>
        </div>

        <div className="mt-auto">
          <div className="w-full bg-teal-400 text-navy-200 font-bold text-sm py-2.5 rounded-xl text-center">
            Generate Letter
          </div>
          <p className="text-white/25 text-[10px] text-center mt-1.5">Review with an attorney before sending</p>
        </div>
      </div>

      {/* Right: letter preview */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Preview</p>
          <div className="flex gap-1.5">
            <span className="text-xs bg-white/10 text-white/60 rounded px-2 py-0.5">PDF</span>
            <span className="text-xs bg-white/10 text-white/60 rounded px-2 py-0.5">Copy</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/8 rounded-xl p-3.5 h-[calc(100%-2rem)] overflow-hidden font-mono text-[10px] leading-relaxed text-white/70">
          <p className="text-white/40 italic mb-2 not-italic font-sans text-[9px]">NOTICE: Educational template — review with a licensed attorney before sending.</p>
          <p className="text-white/90 mb-1">Jane Smith</p>
          <p>123 Main St, Springfield, IL 62701</p>
          <p className="mb-3">555-867-5309</p>
          <p className="mb-3">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p className="text-white/90 mb-1">Portfolio Recovery Associates</p>
          <p className="mb-3">[COLLECTOR ADDRESS]</p>
          <p className="text-white/90 font-bold mb-2">Re: CEASE COMMUNICATION — Account #****4821</p>
          <p className="mb-2">Pursuant to 15 U.S.C. § 1692c(c), I hereby demand that you immediately cease all further communication with me regarding the above-referenced debt.</p>
          <p className="text-white/60 mb-2">Under the FDCPA, after receipt of this written request, you are generally prohibited from further communicating with me except as permitted by law (§ 1692c(c)(1)-(3)).</p>
          <p className="text-white/40 italic">...letter continues</p>
        </div>
      </div>
    </div>
  )
}

function DebtTrackerScreen() {
  const debts = [
    { creditor: 'Chase Bank', type: 'Credit Card', balance: '$8,400', status: 'In Dispute', statusColor: 'text-yellow-300 bg-yellow-500/20' },
    { creditor: "St. Mary's Hospital", type: 'Medical', balance: '$2,100', status: 'Active', statusColor: 'text-blue-300 bg-blue-500/20' },
    { creditor: 'LVNV Funding LLC', type: 'Collections', balance: '$1,850', status: 'Active', statusColor: 'text-blue-300 bg-blue-500/20' },
    { creditor: 'Navient', type: 'Student Loan', balance: '$24,000', status: 'Active', statusColor: 'text-blue-300 bg-blue-500/20' },
  ]

  return (
    <div className="flex flex-col h-full bg-navy-200 p-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Owed', value: '$36,350', color: 'text-white' },
          { label: 'In Dispute', value: '$8,400', color: 'text-yellow-300' },
          { label: 'Debts Tracked', value: '4', color: 'text-teal-300' },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-white/40 text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-2 pb-1.5">
          {['Creditor', 'Type', 'Balance', 'Status'].map(h => (
            <p key={h} className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">{h}</p>
          ))}
        </div>
        <div className="space-y-1.5">
          {debts.map((d, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 items-center bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 hover:border-white/15 transition-all">
              <p className="text-white text-xs font-medium truncate">{d.creditor}</p>
              <p className="text-white/50 text-xs">{d.type}</p>
              <p className="text-white text-xs font-semibold">{d.balance}</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full w-fit ${d.statusColor}`}>{d.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        <div className="flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 rounded-full px-3 py-1.5 text-teal-300 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          Balances update automatically as you take action
        </div>
      </div>
    </div>
  )
}

function ScriptsScreen() {
  return (
    <div className="flex flex-col h-full bg-navy-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-semibold text-sm">Call Conversation Guides</p>
        <span className="text-xs text-white/40 bg-white/8 rounded-full px-2.5 py-1">8 scripts</span>
      </div>

      {/* Featured script */}
      <div className="bg-white/5 border border-teal-400/30 rounded-2xl p-4 flex-1 overflow-hidden">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white font-semibold text-sm">Settlement Negotiation Call</p>
            <div className="flex gap-1.5 mt-1">
              <span className="text-[10px] bg-teal-400/15 text-teal-300 rounded-full px-2 py-0.5">Settlement</span>
              <span className="text-[10px] bg-white/10 text-white/50 rounded-full px-2 py-0.5">Pay-for-Delete</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl bg-teal-400/15 border border-teal-400/30 flex items-center justify-center">
            <Phone className="w-3.5 h-3.5 text-teal-400" />
          </div>
        </div>

        <div className="space-y-2 text-xs overflow-hidden">
          <div className="bg-navy-200/60 rounded-lg p-2.5">
            <p className="text-white/40 text-[9px] mb-1 uppercase tracking-wide font-semibold">⚠️ Educational reference only — not legal advice</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-white/50 text-[9px] mb-1 uppercase tracking-wide">You say:</p>
            <p className="text-white/80">"Hello, my name is <span className="text-teal-300">[YOUR NAME]</span>. I'm calling about account number <span className="text-teal-300">[ACCOUNT #]</span>. I'd like to discuss a settlement option..."</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-white/50 text-[9px] mb-1 uppercase tracking-wide">If they ask for full amount:</p>
            <p className="text-white/80">"I understand the full balance is <span className="text-teal-300">[$8,400]</span>. Based on my current financial situation, I'm able to offer a lump-sum settlement of <span className="text-teal-300">[$2,940]</span> — approximately 35%..."</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5">
            <p className="text-white/50 text-[9px] mb-1 uppercase tracking-wide">Key reminder:</p>
            <p className="text-white/70">Request any agreement in writing before making payment. Document: date, time, rep name, and what was agreed.</p>
          </div>
        </div>
      </div>

      {/* Other scripts mini list */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {['Debt Validation', 'Cease & Desist', 'Pay-for-Delete'].map(s => (
          <div key={s} className="bg-white/5 border border-white/8 rounded-xl p-2 text-center">
            <p className="text-white/60 text-[10px] font-medium">{s}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Tour steps config ────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'chat',
    icon: MessageSquare,
    tab: 'AI Coach',
    headline: 'Ask anything about your consumer rights',
    sub: 'Get instant answers about FDCPA, FCRA, statute of limitations, and what collectors can and cannot do — available 24/7.',
    Screen: ChatScreen,
  },
  {
    id: 'letters',
    icon: FileText,
    tab: 'Letter Generator',
    headline: '15 dispute letter types, generated in seconds',
    sub: 'Cease & desist, debt validation, FDCPA violation notices, pay-for-delete, and more — with precise statute citations, pre-filled with your details.',
    Screen: LetterScreen,
  },
  {
    id: 'tracker',
    icon: BarChart2,
    tab: 'Debt Tracker',
    headline: 'Track every debt and negotiation in one place',
    sub: 'See all your creditors, balances, and statuses at a glance. Update status as you dispute and settle — watch the total drop.',
    Screen: DebtTrackerScreen,
  },
  {
    id: 'scripts',
    icon: Phone,
    tab: 'Conversation Guides',
    headline: 'Ready-to-use scripts for every call scenario',
    sub: 'Personalized phone scripts for settlement offers, pay-for-delete negotiations, debt validation, and cease & desist — tailored to your specific debt.',
    Screen: ScriptsScreen,
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductTour() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)

  const next = useCallback(() => setActive(i => (i + 1) % STEPS.length), [])
  const prev = useCallback(() => setActive(i => (i - 1 + STEPS.length) % STEPS.length), [])

  useEffect(() => {
    if (!playing) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [playing, next])

  const step = STEPS[active]
  const ActiveScreen = step.Screen

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 rounded-full px-4 py-2 text-teal-300 text-xs font-medium mb-6">
            <Play className="w-3 h-3" />
            Interactive Product Tour
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">See DebtCoach AI in Action</h2>
          <p className="text-white/50 max-w-xl mx-auto">Click through each feature or let it play automatically — every tool is included in your $19.95/month subscription.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: step selector + description */}
          <div className="lg:w-80 flex-shrink-0 space-y-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = i === active
              return (
                <button
                  key={s.id}
                  onClick={() => { setActive(i); setPlaying(false) }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-400/10 border-teal-400/40 shadow-lg shadow-teal-400/5'
                      : 'bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-teal-400 ' : 'bg-white/8'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-navy-200' : 'text-white/50'}`} />
                    </div>
                    <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-white/50'}`}>{s.tab}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-teal-400 ml-auto" />}
                  </div>
                  {isActive && (
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">{s.headline}</p>
                      <p className="text-white/50 text-xs leading-relaxed">{s.sub}</p>
                    </div>
                  )}
                </button>
              )
            })}

            {/* Playback controls */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={prev}
                className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white/60" />
              </button>
              <button
                onClick={() => setPlaying(p => !p)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/8 border border-white/10 rounded-xl hover:bg-white/15 transition-colors text-white/60 text-xs font-medium"
              >
                {playing ? <><Pause className="w-3 h-3" /> Auto-playing</> : <><Play className="w-3 h-3" /> Auto-play</>}
              </button>
              <button
                onClick={next}
                className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pt-1">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActive(i); setPlaying(false) }}
                  className={`rounded-full transition-all duration-300 ${
                    i === active ? 'w-6 h-2 bg-teal-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right: browser mockup */}
          <div className="flex-1 min-w-0">
            {/* Browser chrome */}
            <div className="bg-white/8 border border-white/12 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              {/* Title bar */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/8">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 mx-2 bg-white/8 rounded-lg px-3 py-1 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-400/60 flex-shrink-0" />
                  <span className="text-white/40 text-xs font-mono">app.thedebtcoachai.com/{step.id === 'tracker' ? 'dashboard' : step.id}</span>
                </div>
                {/* Tab indicator */}
                <div className="hidden sm:flex items-center gap-1.5 bg-teal-400/10 border border-teal-400/20 rounded-full px-2.5 py-1">
                  <step.icon className="w-3 h-3 text-teal-400" />
                  <span className="text-teal-300 text-xs font-medium">{step.tab}</span>
                </div>
              </div>

              {/* App content */}
              <div className="h-[420px] md:h-[480px] overflow-hidden">
                <ActiveScreen />
              </div>
            </div>

            {/* Progress bar */}
            {playing && (
              <div className="mt-3 h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  key={active}
                  className="h-full bg-teal-400 rounded-full"
                  style={{ animation: 'progressBar 5s linear forwards' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to { width: 100% }
        }
      `}</style>
    </section>
  )
}
