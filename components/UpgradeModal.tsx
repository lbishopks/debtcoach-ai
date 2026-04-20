'use client'
import { useState } from 'react'
import { X, Zap, MessageSquare, FileText, Download, BookOpen, BarChart2, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  /** Which feature was blocked — used to tailor the headline */
  trigger?: 'chat' | 'letter' | 'dispute' | 'script' | 'pdf' | 'debt'
}

const TRIGGER_COPY: Record<string, { headline: string; sub: string }> = {
  chat:    { headline: "You've used all 3 free messages today", sub: "Upgrade to Pro for unlimited AI coaching — available 24/7." },
  letter:  { headline: "Free plan: 1 letter per month", sub: "Upgrade to Pro and generate unlimited dispute letters instantly." },
  dispute: { headline: "Free plan: 1 dispute letter per month", sub: "Pro members send unlimited bureau disputes — all three at once." },
  script:  { headline: "Script personalization is a Pro feature", sub: "Upgrade to get AI-personalized scripts for your exact situation." },
  pdf:     { headline: "PDF downloads are a Pro feature", sub: "Upgrade to download professionally formatted letters as PDFs." },
  debt:    { headline: "Add unlimited debts with Pro", sub: "Track every creditor, see your full picture, and win faster." },
}

const PRO_FEATURES = [
  { icon: MessageSquare, label: 'Unlimited AI Coach messages', color: 'text-teal-400' },
  { icon: FileText,      label: 'Unlimited dispute & debt letters', color: 'text-teal-400' },
  { icon: Download,      label: 'PDF downloads for every letter', color: 'text-teal-400' },
  { icon: BookOpen,      label: 'AI-personalized phone scripts', color: 'text-teal-400' },
  { icon: BarChart2,     label: 'Full debt reduction analytics', color: 'text-teal-400' },
  { icon: Zap,           label: 'Priority Claude AI (faster, smarter)', color: 'text-teal-400' },
]

export function UpgradeModal({ isOpen, onClose, trigger = 'chat' }: Props) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)

  const copy = TRIGGER_COPY[trigger] || TRIGGER_COPY.chat

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceType: billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (res.status === 503) {
        toast.error('Payments not yet live — coming soon! Contact us to upgrade early.')
      } else {
        toast.error(data.error || 'Could not start checkout. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const monthlyPrice = billing === 'yearly' ? '6.58' : '9.99'
  const yearlyTotal = '79'
  const savings = billing === 'yearly' ? 'Save $40.88/yr' : null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0F1C2E] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-teal-400/20 via-navy-50 to-[#0F1C2E] px-6 pt-8 pb-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-400/30">
            <Zap className="w-7 h-7 text-white" />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-teal-400/10 border border-teal-400/20 rounded-full px-3 py-1 mb-3">
            <Star className="w-3 h-3 text-teal-400 fill-teal-400" />
            <span className="text-teal-400 text-xs font-semibold tracking-wide">PRO PLAN</span>
          </div>

          <h2 className="text-white text-xl font-bold mb-2">{copy.headline}</h2>
          <p className="text-white/50 text-sm">{copy.sub}</p>
        </div>

        {/* Feature list */}
        <div className="px-6 py-4">
          <div className="space-y-2.5 mb-5">
            {PRO_FEATURES.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-400/15 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-teal-400" />
                </div>
                <span className="text-white/80 text-sm">{label}</span>
              </div>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="flex items-center gap-2 bg-white/5 rounded-2xl p-1 mb-4">
            <button
              onClick={() => setBilling('monthly')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                billing === 'yearly'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              Yearly
              <span className="text-xs bg-teal-400/20 text-teal-300 px-1.5 py-0.5 rounded-full">-34%</span>
            </button>
          </div>

          {/* Price */}
          <div className="text-center mb-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-white/40 text-lg">$</span>
              <span className="text-white text-4xl font-bold">{monthlyPrice}</span>
              <span className="text-white/40 text-sm">/mo</span>
            </div>
            {savings && (
              <p className="text-teal-400 text-xs font-medium mt-1">
                Billed ${yearlyTotal}/year · {savings}
              </p>
            )}
            {billing === 'monthly' && (
              <p className="text-white/30 text-xs mt-1">Billed monthly · cancel anytime</p>
            )}
          </div>

          <Button
            onClick={handleUpgrade}
            loading={loading}
            className="w-full text-base py-3"
            icon={<Zap className="w-4 h-4" />}
          >
            Upgrade to Pro
          </Button>

          <p className="text-center text-white/25 text-xs mt-3">
            Secure checkout via Stripe · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
