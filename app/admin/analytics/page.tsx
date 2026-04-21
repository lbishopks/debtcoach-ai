'use client'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Stats {
  totalUsers: number; proUsers: number; freeUsers: number
  totalLetters: number; totalDebts: number; totalConversations: number
  newUsers7d: number; newUsers30d: number; totalMessages30d: number
  lettersByType: Record<string, number>
}

const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
    </div>
  )
  if (!stats) return null

  const maxLetterCount = Math.max(...Object.values(stats.lettersByType), 1)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Usage patterns and growth metrics</p>
      </div>

      {/* Growth */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'New Users (7d)', value: stats.newUsers7d, total: stats.totalUsers },
          { label: 'New Users (30d)', value: stats.newUsers30d, total: stats.totalUsers },
          { label: 'Pro Users', value: stats.proUsers, total: stats.totalUsers },
          { label: 'AI Messages (30d)', value: stats.totalMessages30d, total: null },
        ].map(({ label, value, total }) => (
          <div key={label} className="bg-white/4 border border-white/8 rounded-xl p-5">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className="text-white text-2xl font-bold">{value.toLocaleString()}</p>
            {total !== null && (
              <p className="text-white/30 text-xs mt-1">
                {total > 0 ? `${((value / total) * 100).toFixed(1)}%` : '0%'} of total
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Platform usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement metrics */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-5">Platform Engagement</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, max: stats.totalUsers, color: 'bg-teal-400' },
              { label: 'Letters Generated', value: stats.totalLetters, max: Math.max(stats.totalUsers, 1), color: 'bg-blue-400' },
              { label: 'Debts Tracked', value: stats.totalDebts, max: Math.max(stats.totalUsers * 3, 1), color: 'bg-purple-400' },
              { label: 'Conversations', value: stats.totalConversations, max: Math.max(stats.totalUsers * 5, 1), color: 'bg-amber-400' },
            ].map(({ label, value, max, color }) => {
              const pct = Math.min(100, Math.round((value / max) * 100))
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{label}</span>
                    <span className="text-white font-semibold text-sm">{value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/8 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Averages */}
          <div className="mt-6 pt-4 border-t border-white/8 grid grid-cols-2 gap-4">
            {[
              { label: 'Letters / User', value: stats.totalUsers > 0 ? (stats.totalLetters / stats.totalUsers).toFixed(1) : '0' },
              { label: 'Debts / User', value: stats.totalUsers > 0 ? (stats.totalDebts / stats.totalUsers).toFixed(1) : '0' },
              { label: 'Convos / User', value: stats.totalUsers > 0 ? (stats.totalConversations / stats.totalUsers).toFixed(1) : '0' },
              { label: 'Pro Rate', value: stats.totalUsers > 0 ? `${((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}%` : '0%' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/3 rounded-lg p-3">
                <div className="text-white/40 text-[11px] mb-0.5">{label}</div>
                <div className="text-white font-bold text-lg">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Letter type distribution */}
        <div className="bg-white/4 border border-white/8 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-5">Letter Type Distribution</h2>
          {Object.keys(stats.lettersByType).length === 0 ? (
            <div className="flex items-center justify-center h-40 text-white/30 text-sm">No letters yet</div>
          ) : (
            <div className="space-y-3">
              {Object.entries(stats.lettersByType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const pct = Math.round((count / maxLetterCount) * 100)
                  const totalPct = stats.totalLetters > 0 ? Math.round((count / stats.totalLetters) * 100) : 0
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">{typeLabel(type)}</span>
                        <span className="text-white/50">{count} <span className="text-white/25">({totalPct}%)</span></span>
                      </div>
                      <div className="w-full bg-white/8 rounded-full h-1.5">
                        <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
