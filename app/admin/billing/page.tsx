'use client'
import { useEffect, useState } from 'react'
import { DollarSign, Users, TrendingUp, Loader2, ExternalLink, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface Charge {
  id: string; amount: number; currency: string; status: string
  description: string; email: string; created: string
}
interface BillingData {
  mrr: number; activeSubscriptions: number; revenue30d: number; recentCharges: Charge[]
  stripeConfigured?: boolean
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
  const stripeReady = data.stripeConfigured !== false

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

      {/* Stripe not configured warning */}
      {!stripeReady && (
        <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-amber-400 font-semibold text-sm">Stripe not configured — payments are disabled</h3>
                <p className="text-white/50 text-sm mt-1">
                  Users cannot upgrade to Pro until you add real Stripe keys to Railway. Follow these steps:
                </p>
              </div>
              <ol className="text-white/50 text-sm space-y-2 list-none">
                {[
                  <>Go to <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1">Stripe API Keys <ExternalLink className="w-3 h-3"/></a> → copy your <strong className="text-white/70">Secret key</strong> (starts with <code className="text-teal-400">sk_live_</code> or <code className="text-teal-400">sk_test_</code>)</>,
                  <>Create two products in Stripe: <strong className="text-white/70">Pro Monthly ($9.99/mo)</strong> and <strong className="text-white/70">Pro Yearly ($79/yr)</strong> → copy each Price ID (starts with <code className="text-teal-400">price_</code>)</>,
                  <>Go to <a href="https://railway.com/project/fa241fac-195e-4098-8798-943293e6aa0c/service/d6460444-83fd-4ac0-85b4-63949062f87f/variables" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1">Railway Variables <ExternalLink className="w-3 h-3"/></a> and set:</>,
                ].map((step, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <div className="bg-black/20 rounded-lg p-3 font-mono text-xs text-white/60 space-y-1">
                <div><span className="text-teal-400">STRIPE_SECRET_KEY</span>=sk_live_...</div>
                <div><span className="text-teal-400">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>=pk_live_...</div>
                <div><span className="text-teal-400">STRIPE_PRO_MONTHLY_PRICE_ID</span>=price_...</div>
                <div><span className="text-teal-400">STRIPE_PRO_YEARLY_PRICE_ID</span>=price_...</div>
                <div><span className="text-teal-400">STRIPE_WEBHOOK_SECRET</span>=whsec_...</div>
              </div>
              <p className="text-white/30 text-xs">
                For the webhook secret: go to Stripe → Developers → Webhooks → Add endpoint → URL: <code className="text-white/50">https://thedebtcoachai.com/api/stripe/webhook</code> → select all subscription events → copy the signing secret.
              </p>
            </div>
          </div>
        </div>
      )}

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
