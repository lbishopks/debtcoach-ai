'use client'
import { useEffect, useState, useCallback } from 'react'
import { Loader2, FileText, Search, X, Save, Trash2, ChevronLeft, ChevronRight, Pencil, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface LetterRow {
  id: string; user_id: string; letter_type: string
  creditor_name: string; created_at: string; content?: string
  users?: { email: string; full_name: string }
}

const LETTER_TYPES = [
  'dispute','validation','cease_desist','goodwill','pay_for_delete',
  'debt_settlement','hardship','identity_theft','statute_of_limitations',
  'fdcpa_violation','medical_debt','original_creditor_dispute',
  'account_not_mine','payment_plan','delete_after_payment',
]

const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const TYPE_COLORS: Record<string, string> = {
  dispute: 'bg-blue-400/15 text-blue-400',
  validation: 'bg-purple-400/15 text-purple-400',
  cease_desist: 'bg-red-400/15 text-red-400',
  goodwill: 'bg-teal-400/15 text-teal-400',
  pay_for_delete: 'bg-amber-400/15 text-amber-400',
  debt_settlement: 'bg-orange-400/15 text-orange-400',
  hardship: 'bg-sky-400/15 text-sky-400',
  fdcpa_violation: 'bg-rose-400/15 text-rose-400',
}

function LetterModal({ letterId, onClose, onDelete }: {
  letterId: string
  onClose: () => void
  onDelete: (id: string) => void
}) {
  const [letter, setLetter] = useState<LetterRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState('')
  const [creditorName, setCreditorName] = useState('')
  const [letterType, setLetterType] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/letters/${letterId}`)
      .then(r => r.json())
      .then(d => {
        setLetter(d.letter)
        setContent(d.letter?.content || '')
        setCreditorName(d.letter?.creditor_name || '')
        setLetterType(d.letter?.letter_type || '')
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load letter'); setLoading(false) })
  }, [letterId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/letters/${letterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, creditor_name: creditorName, letter_type: letterType }),
      })
      if (!res.ok) throw new Error()
      setLetter(prev => prev ? { ...prev, content, creditor_name: creditorName, letter_type: letterType } : prev)
      setEditing(false)
      toast.success('Letter saved')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/letters/${letterId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Letter deleted')
      onDelete(letterId)
      onClose()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0f1624] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-teal-400/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-teal-400" />
            </div>
            <div className="min-w-0">
              {editing ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    value={creditorName}
                    onChange={e => setCreditorName(e.target.value)}
                    className="bg-white/8 border border-white/15 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-teal-400/50 w-48"
                    placeholder="Creditor name"
                  />
                  <select
                    value={letterType}
                    onChange={e => setLetterType(e.target.value)}
                    className="bg-white/8 border border-white/15 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-teal-400/50"
                  >
                    {LETTER_TYPES.map(t => (
                      <option key={t} value={t}>{typeLabel(t)}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <p className="text-white font-semibold text-sm truncate">
                    {letter?.creditor_name || '—'}
                  </p>
                  <p className="text-white/40 text-xs">{typeLabel(letter?.letter_type || '')} · {letter?.users?.email || letter?.user_id?.slice(0, 8)}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
              <>
                <button
                  onClick={() => { setEditing(false); setContent(letter?.content || ''); setCreditorName(letter?.creditor_name || ''); setLetterType(letter?.letter_type || '') }}
                  className="px-3 py-1.5 rounded-lg bg-white/8 text-white/60 hover:text-white text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-400 text-[#0a0f1a] font-semibold text-xs hover:bg-teal-300 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
              </>
            ) : (
              <>
                {!confirmDelete ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 text-white/60 hover:text-white text-xs transition-all"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs transition-all"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-white/50 text-xs">Delete this letter?</span>
                    <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg bg-white/8 text-white/60 text-xs">Cancel</button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-semibold text-xs hover:bg-red-400 disabled:opacity-50"
                    >
                      {deleting ? '…' : 'Yes, Delete'}
                    </button>
                  </>
                )}
              </>
            )}
            <button onClick={onClose} className="ml-1 text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
            </div>
          ) : editing ? (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-full min-h-[400px] bg-white/4 border border-white/10 rounded-xl p-4 text-white/80 text-sm font-mono leading-relaxed focus:outline-none focus:border-teal-400/40 resize-none"
              placeholder="Letter content..."
            />
          ) : (
            <pre className="whitespace-pre-wrap text-white/75 text-sm font-mono leading-relaxed bg-white/3 rounded-xl p-5 border border-white/8 min-h-[200px]">
              {content || <span className="text-white/20 italic">No content</span>}
            </pre>
          )}
        </div>

        {/* Footer */}
        {letter && !editing && (
          <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between flex-shrink-0">
            <span className="text-white/25 text-xs">
              Created {new Date(letter.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <a
              href={`/admin/users/${letter.user_id}`}
              className="flex items-center gap-1.5 text-teal-400 hover:text-teal-300 text-xs transition-colors"
            >
              View User <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminLetters() {
  const [letters, setLetters] = useState<LetterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const limit = 50

  const fetchLetters = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/admin/letters?${params}`)
      const d = await res.json()
      setLetters(d.letters || [])
      setTotal(d.total || 0)
    } catch { setError('Failed to load letters') }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchLetters() }, [fetchLetters])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {selectedId && (
        <LetterModal
          letterId={selectedId}
          onClose={() => setSelectedId(null)}
          onDelete={id => setLetters(prev => prev.filter(l => l.id !== id))}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Letters</h1>
          <p className="text-white/40 text-sm mt-1">{total.toLocaleString()} letters generated total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by creditor or user email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50"
        />
      </div>

      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400 p-6 text-sm">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Creditor</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Date</th>
                    <th className="text-right px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {letters.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-white/30 text-sm">No letters found</td></tr>
                  )}
                  {letters.map(l => (
                    <tr
                      key={l.id}
                      className="hover:bg-white/2 transition-colors cursor-pointer"
                      onClick={() => setSelectedId(l.id)}
                    >
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[l.letter_type] || 'bg-white/8 text-white/50'}`}>
                          <FileText className="w-3 h-3" />
                          {typeLabel(l.letter_type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70 text-sm truncate max-w-[160px]">
                        {l.creditor_name || '—'}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs truncate max-w-[180px]">
                        {l.users?.email || l.user_id.slice(0, 8) + '…'}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        {new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedId(l.id) }}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/6 text-white/50 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between">
                <span className="text-white/40 text-xs">
                  Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-30 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white/50 text-xs">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-30 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
