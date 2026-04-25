'use client'
import { useState } from 'react'
import { Search, AlertTriangle, CheckCircle, Loader2, Shield, Phone, MapPin, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export function CollectorChecker() {
  const [form, setForm] = useState({ collector_name: '', collector_phone: '', collector_address: '' })
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState('')
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.collector_name.trim()) return
    setLoading(true)
    setError('')
    setAnalysis('')
    setSearched(false)

    try {
      const r = await fetch('/api/collectors/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) {
        const data = await r.json().catch(() => ({}))
        throw new Error(data.error || 'Analysis failed')
      }
      const data = await r.json()
      setAnalysis(data.analysis)
      setSearched(true)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze collector. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Collector Identity Checker</h1>
        <p className="text-white/50 text-sm mt-1">
          Research any debt collector before you pay or respond. Find out if they&apos;re legitimate, licensed, and complaint-free.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl px-4 py-3">
        <p className="text-amber-300/80 text-xs leading-relaxed">
          <span className="font-semibold text-amber-300">⚠️ Educational research tool.</span> Results are AI-generated from public sources. Always independently verify any information. This is not legal advice — contact a consumer law attorney if you suspect fraud.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Enter Collector Information</h2>
        <div>
          <label className="label">Company / Collector Name *</label>
          <input
            className="input"
            value={form.collector_name}
            onChange={e => setForm(f => ({ ...f, collector_name: e.target.value }))}
            placeholder="e.g. Midland Credit Management"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Phone Number (optional)</label>
            <input
              className="input"
              value={form.collector_phone}
              onChange={e => setForm(f => ({ ...f, collector_phone: e.target.value }))}
              placeholder="e.g. (800) 555-1234"
            />
          </div>
          <div>
            <label className="label">Address / State (optional)</label>
            <input
              className="input"
              value={form.collector_address}
              onChange={e => setForm(f => ({ ...f, collector_address: e.target.value }))}
              placeholder="e.g. San Diego, CA"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !form.collector_name.trim()}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Researching...</>
          ) : (
            <><Search className="w-4 h-4" /> Check Collector</>
          )}
        </button>
      </form>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 bg-teal-400/10 rounded-full flex items-center justify-center">
            <Search className="w-6 h-6 text-teal-400 animate-pulse" />
          </div>
          <p className="text-white/60 text-sm">Searching CFPB database, licensing records, and complaint history...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Analysis Results */}
      {searched && analysis && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
            <Shield className="w-5 h-5 text-teal-400" />
            <h2 className="text-white font-semibold">Research Results for &quot;{form.collector_name}&quot;</h2>
          </div>
          <div className="prose prose-invert prose-sm max-w-none
            prose-p:my-2 prose-p:leading-relaxed
            prose-headings:text-teal-300 prose-headings:font-semibold prose-headings:my-3
            prose-strong:text-white prose-strong:font-semibold
            prose-ul:my-2 prose-li:my-1
            prose-a:text-teal-400 prose-a:underline hover:prose-a:text-teal-300
          ">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer"
                    className="text-teal-400 underline hover:text-teal-300 transition-colors">
                    {children}
                  </a>
                ),
              }}
            >
              {analysis}
            </ReactMarkdown>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-3">
            <a
              href="https://www.consumerfinance.gov/data-research/consumer-complaints/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-teal-400 hover:text-teal-300 underline"
            >
              Search CFPB Complaint Database →
            </a>
            <a
              href="https://www.ftc.gov/enforcement/consumer-sentinel-network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-teal-400 hover:text-teal-300 underline"
            >
              FTC Consumer Sentinel →
            </a>
          </div>
        </div>
      )}

      {/* Tips */}
      {!searched && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Shield,
              title: 'Verify Before You Pay',
              body: 'Scam collectors demand immediate payment. Legit collectors must send a written validation notice within 5 days.',
            },
            {
              icon: Phone,
              title: 'Never Give Bank Info by Phone',
              body: 'Real collectors accept checks or money orders. Never give your bank account number to an incoming caller.',
            },
            {
              icon: CheckCircle,
              title: 'Request Debt Validation',
              body: 'You have 30 days to dispute any debt in writing. The collector must stop until they validate it.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white/3 border border-white/8 rounded-xl p-4">
              <Icon className="w-5 h-5 text-teal-400 mb-2" />
              <h3 className="text-white font-medium text-sm mb-1">{title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
