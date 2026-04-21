'use client'
import { useEffect, useState } from 'react'
import { Loader2, FileText } from 'lucide-react'

interface LetterRow {
  id: string; user_id: string; letter_type: string
  creditor_name: string; created_at: string
  users?: { email: string; full_name: string }
}

const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

const TYPE_COLORS: Record<string, string> = {
  dispute: 'bg-blue-400/15 text-blue-400',
  validation: 'bg-purple-400/15 text-purple-400',
  cease_desist: 'bg-red-400/15 text-red-400',
  goodwill: 'bg-teal-400/15 text-teal-400',
  pay_for_delete: 'bg-amber-400/15 text-amber-400',
}

export default function AdminLetters() {
  const [letters, setLetters] = useState<LetterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 50

  useEffect(() => {
    fetch(`/api/admin/letters?page=${page}&limit=${limit}`)
      .then(r => r.json())
      .then(d => { setLetters(d.letters || []); setTotal(d.total || 0); setLoading(false) })
      .catch(() => { setError('Failed to load letters'); setLoading(false) })
  }, [page])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
    </div>
  )
  if (error) return <div className="text-red-400 p-4">{error}</div>

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Letters</h1>
        <p className="text-white/40 text-sm mt-1">{total.toLocaleString()} letters generated total</p>
      </div>

      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Creditor</th>
                <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">User</th>
                <th className="text-right px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {letters.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-white/30 text-sm">No letters yet</td></tr>
              )}
              {letters.map(l => (
                <tr key={l.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[l.letter_type] || 'bg-white/8 text-white/50'}`}>
                      <FileText className="w-3 h-3" />
                      {typeLabel(l.letter_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/70 text-sm truncate max-w-[160px]">
                    {l.creditor_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs truncate max-w-[200px]">
                    {l.users?.email || l.user_id.slice(0, 8) + '…'}
                  </td>
                  <td className="px-5 py-3 text-right text-white/40 text-xs">
                    {new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-30 text-xs transition-all">
                ← Prev
              </button>
              <span className="text-white/50 text-xs">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-30 text-xs transition-all">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
