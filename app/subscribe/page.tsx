'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Zap, CheckCircle, Loader2, Shield, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const FEATURES = [
  'Unlimited AI debt coaching conversations',
  'Unlimited dispute letter generation',
  'All 15 letter types (FDCPA, FCRA, SOL, and more)',
  'PDF, print & email delivery',
  'Debt tracking dashboard',
  'Call scripts & negotiation guides',
  'Priority support',
]

export default function SubscribePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isProcessing = searchParams.get('processing') === 'true'

  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const [checking, setChecking] = useState(true)
  const [processingDots, setProcessingDots] = useState('.')

  // Check if the user already has an active plan
  const checkPlan = useCallback(async (): Promise<boolean> => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth/signup'); return false }

    const { data: profile } = await supabase
      .from('users')
      .select('plan, onboarding_completed')
      .eq('id', user.id)
      .single()

    if (profile?.plan === 'pro') {
      router.replace(profile.onboarding_completed ? '/dashboard' : '/onboarding')
      return true
    }
    return false
  }, [router])

  useEffect(() => {
    checkPlan().then(isPro => {
      if (!isPro) setChecking(false)
    })
  }, [checkPlan])

  // If returning from Stripe (?processing=true), poll until webhook fires
  useEffect(() => {
    if (!isProcessing) return
    let attempts = 0
    const maxAttempts = 30 // 60 seconds max polling

    const poll = async () => {
      attempts++
      const alreadyPro = await checkPlan()
      if (!alreadyPro && attempts < maxAttempts) {
        setTimeout(poll, 2000)
      } else if (!alreadyPro) {
        // Timeout — show the pricing page so they can try again
        setChecking(false)
        toast.error('Payment confirmation is taking longer than expected. If you were charged, contact support.')
      }
    }

    poll()

    // Animate dots
    const dotsInterval = setInterval(() => {
      setProcessingDots(d => d.length >= 3 ? '.' : d + '.')
    }, 500)

    return () => clearInterval(dotsInterval)
  }, [isProcessing, checkPlan])

  const handleSubscribe = async (priceType: 'monthly' | 'yearly') => {
    setLoading(priceType)
    try {
      const appUrl = window.location.origin
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceType,
          successUrl: `${appUrl}/subscribe?processing=true`,
          cancelUrl: `${appUrl}/subscribe`,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout')
      window.location.href = data.url
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  // Processing / loading state
  if (checking || isProcessing) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-teal-400/15 flex items-center justify-center mb-5">
          <Loader2 className="w-7 h-7 text-teal-400 animate-spin" />
        </div>
        {isProcessing ? (
          <>
            <h2 className="text-white font-bold text-xl mb-2">Confirming your payment{processingDots}</h2>
            <p className="text-white/40 text-sm max-w-xs">
              Hang tight while we activate your account. This usually takes just a moment.
            </p>
          </>
        ) : (
          <p className="text-white/40 text-sm">Loading…</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 bg-teal-400 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#0a0f1a]" />
        </div>
        <span className="font-bold text-white text-lg">DebtCoach AI</span>
      </div>

      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Activate Your Account</h1>
          <p className="text-white/50">Full access to every tool. Cancel any time.</p>
        </div>

        {/* Feature list */}
        <div className="bg-white/4 border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">What&apos;s included</p>
          <ul className="space-y-2.5">
            {FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Plan cards */}
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {/* Monthly */}
          <div className="bg-white/4 border border-white/12 rounded-2xl p-5 flex flex-col">
            <p className="text-white/60 text-sm font-medium mb-1">Monthly</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">$29</span>
              <span className="text-white/40 text-sm">/month</span>
            </div>
            <p className="text-white/30 text-xs mb-5">Billed monthly. Cancel anytime.</p>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={!!loading}
              className="mt-auto w-full py-3 rounded-xl border border-white/20 bg-white/6 text-white font-semibold text-sm hover:bg-white/12 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === 'monthly' && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading === 'monthly' ? 'Redirecting…' : 'Choose Monthly'}
            </button>
          </div>

          {/* Annual */}
          <div className="bg-teal-400/8 border border-teal-400/30 rounded-2xl p-5 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-teal-400 text-[#0a0f1a] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Best Value
              </span>
            </div>
            <p className="text-teal-300 text-sm font-medium mb-1">Annual</p>
            <div className="flex items-baseline gap-1 mb-0.5">
              <span className="text-3xl font-bold text-white">$199</span>
              <span className="text-white/40 text-sm">/year</span>
            </div>
            <p className="text-teal-400/70 text-xs mb-4">~$16.58/mo — save $149 vs. monthly</p>
            <p className="text-white/30 text-xs mb-5">Billed once per year.</p>
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={!!loading}
              className="mt-auto w-full py-3 rounded-xl bg-teal-400 text-[#0a0f1a] font-bold text-sm hover:bg-teal-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === 'yearly' && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading === 'yearly' ? 'Redirecting…' : 'Choose Annual'}
            </button>
          </div>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-5 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <Lock className="w-3 h-3" /> Secured by Stripe
          </div>
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <Shield className="w-3 h-3" /> Cancel any time
          </div>
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <CheckCircle className="w-3 h-3" /> No hidden fees
          </div>
        </div>

        <p className="text-white/20 text-xs text-center">
          By subscribing you agree to our{' '}
          <Link href="/privacy" className="text-white/40 hover:text-white transition-colors">Privacy Policy</Link>.
          {' '}DebtCoach AI is not a law firm and does not provide legal advice.
        </p>
      </div>
    </div>
  )
}
