'use client'
import { useEffect, useState } from 'react'
import { DollarSign, Users, TrendingUp, Loader2, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Charge {
  id: string; amount: number; currency: string; status: string
  description: string; email: string; created: string
}
interface BillingData {
  mrr: number; activeSubscriptions: number; revenue30d: number; recentCharges: Charge[]
}

function StatCard({ label, value, sub, icon: Icon, color = 'teal' }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color?: string
}) {
  const colors: Record<string, string> = {
    teal: 'bg-teal-400/10 text-teal-400',
    green: 'bg-green-400/10 text-green-400',
    blue: 'bg-blue-400/10 text-blue-400',
  }
  return (
    <div className="bg-white/4 border border-white/8 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
          {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'succeeded') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-400">
      <CheckCircle className="w-3 h-3" /> Paid
    </span>
  )
  if (status === 'failed') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-400">
      <XCircle className="w-3 h-3" /> Failed
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400">
      <Clock className="w-3 h-3" /> {status}
    </span>
  )
}

export default function AdminBilling() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/billing')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load billing data'); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
    </div>
  )
  if (error) return <div className="text-red-400 p-4">{error}</div>
  if (!data) return null

  const arr = data.mrr > 0 ? Math.round(data.mrr * 12 * 100) / 100 : 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-white/40 text-sm mt-1">Revenue & subscription overview</p>
        </div>
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          Open Stripe <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="MRR"
          value={`$${data.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="monthly recurring"
          icon={DollarSign}
          color="teal"
        />
        <StatCard
          label="ARR"
          value={`$${arr.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="annualized"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Active Subs"
          value={data.activeSubscriptions.toString()}
          sub="paying customers"
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Revenue (30d)"
          value={`$${data.revenue30d.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="last 30 days (net)"
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Pro plan breakdown */}
      <div className="bg-white/4 border border-white/8 rounded-xl p-5">
        <h2 className="text-white font-semibold text-sm mb-4">Plan Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Pro Monthly', price: '$9.99/mo', note: 'per subscriber' },
            { label: 'Pro Yearly', price: '$79/yr', note: '≈ $6.58/mo' },
            { label: 'Full Report', price: 'One-time', note: 'per report' },
          ].map(({ label, price, note }) => (
            <div key={label} className="bg-white/3 rounded-lg p-4 border border-white/8">
              <div className="text-white/40 text-xs mb-1">{label}</div>
              <div className="text-white font-bold text-lg">{price}</div>
              <div className="text-white/30 text-xs mt-0.5">{note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent charges */}
      <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Recent Charges</h2>
          <span className="text-white/30 text-xs">{data.recentCharges.length} transactions</span>
        </div>
        {data.recentCharges.length === 0 ? (
          <div className="px-5 py-12 text-center text-white/30 text-sm">No charges yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Customer</th>
                  <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Description</th>
                  <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recentCharges.map(c => (
                  <tr key={c.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 text-white/40 text-xs">
                      {new Date(c.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm truncate max-w-[180px]">
                      {c.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs truncate max-w-[200px]">
                      {c.description || 'Subscription payment'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-white font-semibold text-sm">
                        ${c.amount.toFixed(2)}
                      </span>
                      <span className="text-white/30 text-xs ml-1">{c.currency.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
