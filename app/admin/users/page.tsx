'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle, Star } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string; email: string; full_name: string; plan: string
  state: string; created_at: string; stripe_customer_id: string | null
  onboarding_completed: boolean; letters_count: number; debts_count: number
}

const PlanBadge = ({ plan }: { plan: string }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
    plan === 'pro' ? 'bg-teal-400/20 text-teal-400 border border-teal-400/30'
                   : 'bg-white/8 text-white/40 border border-white/10'
  }`}>
    {plan === 'pro' && <Star className="w-2.5 h-2.5" />}
    {plan.toUpperCase()}
  </span>
)

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const limit = 50

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      if (planFilter) params.set('plan', planFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users || [])
      setTotal(data.total || 0)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [page, search, planFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const togglePlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'pro' ? 'free' : 'pro'
    setUpdatingId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: newPlan }),
      })
      if (!res.ok) throw new Error()
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u))
      toast.success(`User moved to ${newPlan}`)
    } catch { toast.error('Failed to update user') }
    finally { setUpdatingId(null) }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-white/40 text-sm mt-1">{total.toLocaleString()} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search by email or name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-teal-400/50"
          />
        </div>
        <div className="flex gap-2">
          {['', 'free', 'pro'].map(p => (
            <button
              key={p}
              onClick={() => { setPlanFilter(p); setPage(1) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                planFilter === p
                  ? 'bg-teal-400 text-navy-200'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {p === '' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Plan</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">State</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Letters</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Debts</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Onboarded</th>
                    <th className="text-left px-4 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Joined</th>
                    <th className="text-right px-5 py-3 text-white/40 text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-12 text-white/30 text-sm">No users found</td></tr>
                  )}
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 text-xs font-bold flex-shrink-0">
                            {(u.full_name || u.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate max-w-[180px]">{u.full_name || '—'}</p>
                            <p className="text-white/40 text-xs truncate max-w-[180px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><PlanBadge plan={u.plan} /></td>
                      <td className="px-4 py-3 text-white/60 text-sm">{u.state || '—'}</td>
                      <td className="px-4 py-3 text-white/60 text-sm">{u.letters_count}</td>
                      <td className="px-4 py-3 text-white/60 text-sm">{u.debts_count}</td>
                      <td className="px-4 py-3">
                        {u.onboarding_completed
                          ? <CheckCircle className="w-4 h-4 text-teal-400" />
                          : <XCircle className="w-4 h-4 text-white/20" />}
                      </td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => togglePlan(u.id, u.plan)}
                          disabled={updatingId === u.id}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                            u.plan === 'pro'
                              ? 'bg-white/8 text-white/50 hover:bg-white/12 hover:text-white'
                              : 'bg-teal-400/15 text-teal-400 hover:bg-teal-400/25'
                          } disabled:opacity-40`}
                        >
                          {updatingId === u.id
                            ? '…'
                            : u.plan === 'pro' ? 'Downgrade' : 'Upgrade to Pro'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between">
                <span className="text-white/40 text-xs">
                  Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white/60 text-sm">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-30 transition-all"
                  >
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
