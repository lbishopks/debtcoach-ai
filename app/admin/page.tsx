'use client'
import { useEffect, useState } from 'react'
import { Users, FileText, MessageSquare, TrendingUp, UserPlus, CreditCard, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalUsers: number; proUsers: number; freeUsers: number
  totalLetters: number; totalDebts: number; totalConversations: number
  newUsers7d: number; newUsers30d: number; totalMessages30d: number
  lettersByType: Record<string, number>
  recentUsers: { id: string; email: string; full_name: string; plan: string; state: string; created_at: string }[]
}

function StatCard({ label, value, sub, icon: Icon, color = 'teal' }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color?: string
}) {
  const colors: Record<string, string> = {
    teal: 'bg-teal-400/10 text-teal-400',
    blue: 'bg-blue-400/10 text-blue-400',
    purple: 'bg-purple-400/10 text-purple-400',
    amber: 'bg-amber-400/10 text-amber-400',
    green: 'bg-green-400/10 text-green-400',
  }
  return (
    <div className="bg-white/4 border border-white/8 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-white text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function LetterTypeBadge({ type }: { type: string }) {
  const label = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return <span className="text-[10px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-white/50">{label}</span>
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => { setError('Failed to load stats'); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
    </div>
  )
  if (error) return <div className="text-red-400 p-4">{error}</div>
  if (!stats) return null

  const topLetterTypes = Object.entries(stats.lettersByType)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-white/40 text-sm mt-1">DebtCoach AI — Admin Dashboard</p>
        </div>
        <div className="text-right text-white/30 text-xs">
          Last refreshed: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.totalUsers} sub={`${stats.newUsers7d} this week`} icon={Users} color="teal" />
        <StatCard label="Pro Users" value={stats.proUsers} sub={`${stats.freeUsers} on free`} icon={CreditCard} color="green" />
        <StatCard label="New (30d)" value={stats.newUsers30d} sub="new signups" icon={UserPlus} color="blue" />
        <StatCard label="Letters Generated" value={stats.totalLetters} icon={FileText} color="purple" />
        <StatCard label="Conversations" value={stats.totalConversations} icon={MessageSquare} color="amber" />
        <StatCard label="Debts Tracked" value={stats.totalDebts} icon={TrendingUp} color="teal" />
        <StatCard label="AI Messages (30d)" value={stats.totalMessages30d} icon={MessageSquare} color="blue" />
        <StatCard
          label="Pro Conversion"
          value={stats.totalUsers > 0 ? `${((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}%` : '0%'}
          sub="of total users"
          icon={TrendingUp}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Signups */}
        <div className="lg:col-span-2 bg-white/4 border border-white/8 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Recent Signups</h2>
            <Link href="/admin/users" className="text-teal-400 text-xs hover:text-teal-300 flex items-center gap-1">
              View all <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentUsers.length === 0 && (
              <div className="px-5 py-8 text-center text-white/30 text-sm">No users yet</div>
            )}
            {stats.recentUsers.map(u => (
              <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 text-xs font-bold flex-shrink-0">
                  {(u.full_name || u.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.full_name || '—'}</p>
                  <p className="text-white/40 text-xs truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.state && <span className="text-white/30 text-xs">{u.state}</span>}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    u.plan === 'pro' ? 'bg-teal-400/20 text-teal-400' : 'bg-white/8 text-white/40'
                  }`}>
                    {u.plan.toUpperCase()}
                  </span>
                </div>
                <div className="text-white/25 text-[11px] flex-shrink-0 w-20 text-right">
                  {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Letter types */}
        <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <h2 className="text-white font-semibold text-sm">Top Letter Types</h2>
          </div>
          <div className="p-5 space-y-3">
            {topLetterTypes.length === 0 && (
              <div className="text-center text-white/30 text-sm py-6">No letters yet</div>
            )}
            {topLetterTypes.map(([type, count]) => {
              const pct = stats.totalLetters > 0 ? Math.round((count / stats.totalLetters) * 100) : 0
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <LetterTypeBadge type={type} />
                    <span className="text-white/60 text-xs font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-white/8 rounded-full h-1.5">
                    <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick links */}
          <div className="px-5 pb-5 pt-2 border-t border-white/8 mt-2 space-y-2">
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">Quick Links</p>
            {[
              { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard' },
              { label: 'Stripe Dashboard', href: 'https://dashboard.stripe.com' },
              { label: 'Railway Logs', href: 'https://railway.com' },
            ].map(({ label, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/40 hover:text-teal-400 text-xs transition-colors">
                <ExternalLink className="w-3 h-3" /> {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
