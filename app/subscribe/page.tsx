'use client'
import { useEffect, useState, useCallback, Suspense } from 'react'
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

function SubscribeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isProcessing = searchParams.get('processing') === 'true'

  const [loading, setLoading] = useState(false)
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

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const appUrl = window.location.origin
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceType: 'monthly',
          successUrl: `${appUrl}/subscribe?processing=true`,
          cancelUrl: `${appUrl}/subscribe`,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not start checkout')
      window.location.href = data.url
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
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

        {/* Plan card — single monthly plan */}
        <div className="bg-teal-400/8 border border-teal-400/30 rounded-2xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-teal-300 text-sm font-semibold mb-1">DebtCoach AI Pro</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$9.95</span>
                <span className="text-white/40 text-sm">/month</span>
              </div>
              <p className="text-white/30 text-xs mt-1">Billed monthly. Cancel anytime.</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-teal-400/15 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <button
            onClick={() => handleSubscribe()}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal-400 text-[#0a0f1a] font-bold text-sm hover:bg-teal-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Redirecting to checkout…' : 'Start Now — $9.95/month'}
          </button>
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

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
      </div>
    }>
      <SubscribeContent />
    </Suspense>
  )
}
