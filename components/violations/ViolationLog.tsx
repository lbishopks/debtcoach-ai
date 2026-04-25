'use client'
import { useState, useEffect } from 'react'
import { AlertTriangle, Plus, Trash2, ChevronDown, ChevronUp, FileText, Phone, Calendar, Tag, CheckCircle, Loader2, X } from 'lucide-react'

interface Violation {
  id: string
  collector_name: string
  collector_phone?: string
  violation_type: string
  violation_date: string
  description: string
  evidence_notes?: string
  status: 'documented' | 'reported' | 'legal_action' | 'resolved'
  created_at: string
}

const VIOLATION_TYPES = [
  'Calling before 8am or after 9pm',
  'Calling at work after being told not to',
  'Using abusive, obscene, or threatening language',
  'Misrepresenting the debt amount',
  'Claiming to be an attorney without being one',
  'Threatening arrest or criminal action',
  'Contacting third parties without permission',
  'Failing to send validation notice within 5 days',
  'Continuing collection after debt disputed',
  'Reporting false information to credit bureau',
  'Charging unauthorized fees or interest',
  'Refusing to identify themselves as a collector',
  'Other FDCPA violation',
]

const STATUS_CONFIG = {
  documented: { label: 'Documented', color: 'bg-blue-400/20 text-blue-300' },
  reported: { label: 'Reported to CFPB', color: 'bg-amber-400/20 text-amber-300' },
  legal_action: { label: 'Legal Action Taken', color: 'bg-purple-400/20 text-purple-300' },
  resolved: { label: 'Resolved', color: 'bg-green-400/20 text-green-300' },
}

const EMPTY_FORM = {
  collector_name: '',
  collector_phone: '',
  violation_type: '',
  violation_date: new Date().toISOString().split('T')[0],
  description: '',
  evidence_notes: '',
  status: 'documented' as const,
}

export function ViolationLog() {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => { fetchViolations() }, [])

  async function fetchViolations() {
    setLoading(true)
    try {
      const r = await fetch('/api/violations')
      if (!r.ok) throw new Error('Failed to load')
      const data = await r.json()
      setViolations(data.violations)
    } catch {
      setError('Failed to load violations')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const r = await fetch('/api/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) throw new Error('Failed to save')
      const data = await r.json()
      setViolations(prev => [data.violation, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch {
      setError('Failed to save violation. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(id: string, status: Violation['status']) {
    try {
      const r = await fetch(`/api/violations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!r.ok) throw new Error()
      setViolations(prev => prev.map(v => v.id === id ? { ...v, status } : v))
    } catch {
      setError('Failed to update status')
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const r = await fetch(`/api/violations/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error()
      setViolations(prev => prev.filter(v => v.id !== id))
      if (expandedId === id) setExpandedId(null)
    } catch {
      setError('Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const totalViolations = violations.length
  const cfpbReported = violations.filter(v => v.status === 'reported' || v.status === 'legal_action').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">FDCPA Violation Log</h1>
          <p className="text-white/50 text-sm mt-1">Track illegal debt collector behavior. Each violation is worth $100–$1,000 in damages.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-teal-400 hover:bg-teal-300 text-[#0F1C2E] font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Log Violation
        </button>
      </div>

      {/* Legal disclaimer */}
      <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl px-4 py-3">
        <p className="text-amber-300/80 text-xs leading-relaxed">
          <span className="font-semibold text-amber-300">⚠️ Educational tool only.</span> This log helps you document collector behavior for reference. It is not legal advice. Consult a consumer law attorney before taking legal action — many work on contingency for FDCPA cases.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{totalViolations}</p>
          <p className="text-white/50 text-xs mt-1">Violations Logged</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-300">{cfpbReported}</p>
          <p className="text-white/50 text-xs mt-1">Reported / Action</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-300">
            ${(totalViolations * 1000).toLocaleString()}
          </p>
          <p className="text-white/50 text-xs mt-1">Max Potential Damages</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Add Violation Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-teal-400/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-lg">Log New Violation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Collector / Company Name *</label>
              <input
                className="input"
                value={form.collector_name}
                onChange={e => setForm(f => ({ ...f, collector_name: e.target.value }))}
                placeholder="e.g. ABC Collections LLC"
                required
              />
            </div>
            <div>
              <label className="label">Collector Phone (optional)</label>
              <input
                className="input"
                value={form.collector_phone}
                onChange={e => setForm(f => ({ ...f, collector_phone: e.target.value }))}
                placeholder="e.g. (555) 123-4567"
              />
            </div>
            <div>
              <label className="label">Violation Type *</label>
              <select
                className="input"
                value={form.violation_type}
                onChange={e => setForm(f => ({ ...f, violation_type: e.target.value }))}
                required
              >
                <option value="">Select violation type...</option>
                {VIOLATION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Date of Violation *</label>
              <input
                type="date"
                className="input"
                value={form.violation_date}
                onChange={e => setForm(f => ({ ...f, violation_date: e.target.value }))}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">What happened? *</label>
            <textarea
              className="input min-h-[100px] resize-y"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe exactly what the collector said or did. Be as specific as possible — time of call, exact words used, what they threatened, etc."
              required
            />
          </div>
          <div>
            <label className="label">Evidence Notes (optional)</label>
            <textarea
              className="input min-h-[80px] resize-y"
              value={form.evidence_notes}
              onChange={e => setForm(f => ({ ...f, evidence_notes: e.target.value }))}
              placeholder="List any evidence you have: call recording, voicemail, letter, witness names, screenshots..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Log Violation'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Violations List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
        </div>
      ) : violations.length === 0 ? (
        <div className="text-center py-16 bg-white/3 border border-white/8 rounded-2xl">
          <AlertTriangle className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No violations logged yet.</p>
          <p className="text-white/25 text-xs mt-1">Keep a record every time a collector breaks the rules.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 btn-primary text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log First Violation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {violations.map(v => {
            const isExpanded = expandedId === v.id
            const sc = STATUS_CONFIG[v.status]
            return (
              <div key={v.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                >
                  <div className="w-9 h-9 bg-red-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-sm truncate">{v.collector_name}</span>
                      <span className={`badge text-xs px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                    </div>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{v.violation_type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white/50 text-xs">{new Date(v.violation_date).toLocaleDateString()}</p>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white/30 ml-auto mt-1" /> : <ChevronDown className="w-4 h-4 text-white/30 ml-auto mt-1" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/8 pt-4 space-y-4">
                    {v.collector_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-white/60">{v.collector_phone}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">What happened</p>
                      <p className="text-white/80 text-sm leading-relaxed">{v.description}</p>
                    </div>
                    {v.evidence_notes && (
                      <div>
                        <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">Evidence</p>
                        <p className="text-white/60 text-sm leading-relaxed">{v.evidence_notes}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Update Status</p>
                        <select
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-teal-400/50"
                          value={v.status}
                          onChange={e => handleStatusChange(v.id, e.target.value as Violation['status'])}
                        >
                          <option value="documented">Documented</option>
                          <option value="reported">Reported to CFPB</option>
                          <option value="legal_action">Legal Action Taken</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <a
                          href="https://www.consumerfinance.gov/complaint/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-teal-400 hover:text-teal-300 underline"
                        >
                          File CFPB Complaint →
                        </a>
                        <button
                          onClick={() => handleDelete(v.id)}
                          disabled={deletingId === v.id}
                          className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                        >
                          {deletingId === v.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
