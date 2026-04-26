'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Zap, CheckCircle, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CO', name: 'Colorado' }, { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'District of Columbia' },
]

// California is intentionally excluded from US_STATES above
const BLOCKED_STATES = ['CA']

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [state, setState] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [geoBlocked, setGeoBlocked] = useState(false)

  // IP-based geo check on mount — secondary layer, fails open
  useEffect(() => {
    fetch('/api/geo')
      .then(r => r.json())
      .then(data => { if (data.blocked) setGeoBlocked(true) })
      .catch(() => {/* fail open */})
  }, [])

  const isCaliforniaSelected = state === 'CA'

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCaliforniaSelected || geoBlocked) return
    if (!state) {
      toast.error('Please select your state of residence')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!agreedToTerms) {
      toast.error('You must agree to the Terms of Service to continue')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, state },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      })
      if (error) throw error
      router.push('/onboarding')
    } catch (err: any) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    'AI-powered debt negotiation coaching',
    'Custom dispute letters in seconds',
    'Educational guides on FDCPA, FCRA & consumer rights',
    'Track your debt reduction journey',
  ]

  // California / geo block screen
  if (geoBlocked || isCaliforniaSelected) {
    return (
      <div className="min-h-screen bg-navy-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-teal-400/10 border border-teal-400/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-8 h-8 text-teal-400" />
          </div>
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-teal-400 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-navy-200" />
            </div>
            <span className="font-bold text-white">DebtCoach AI</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Not Available in California</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            DebtCoach AI is not currently available to California residents. We apologize for the inconvenience.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-6 text-left">
            <p className="text-white/40 text-xs leading-relaxed">
              California has specific laws governing services like ours. Free resources are available through{' '}
              <a href="https://www.consumerfinance.gov" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">consumerfinance.gov</a>,{' '}
              <a href="https://lawhelp.org" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">lawhelp.org</a>, and the{' '}
              <a href="https://oag.ca.gov/consumers" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">California AG&apos;s office</a>.
            </p>
          </div>
          {isCaliforniaSelected && (
            <button onClick={() => setState('')} className="text-teal-400 hover:text-teal-300 text-sm transition-colors">
              ← Select a different state
            </button>
          )}
          {!isCaliforniaSelected && (
            <Link href="/" className="text-white/50 hover:text-white text-sm transition-colors">
              ← Back to home
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-200 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 bg-navy-100 border-r border-white/10 p-12">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-teal-400 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-navy-200" />
          </div>
          <span className="font-bold text-white text-lg">DebtCoach AI</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">
          Take control of your
          <span className="gradient-text block">debt situation today</span>
        </h2>
        <p className="text-white/50 mb-8 leading-relaxed">
          DebtCoach AI helps you understand consumer protection laws, generate dispute letter templates,
          and prepare for conversations with creditors — all for educational purposes.
        </p>
        <ul className="space-y-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-white/70">
              <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-400 rounded-2xl mb-4">
              <Zap className="w-7 h-7 text-navy-200" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-white/50 text-sm mb-6">Step 1 of 3 — create your account, set up your profile, then subscribe.</p>

          <div className="card space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Full name"
                type="text"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                hint="Minimum 8 characters"
                autoComplete="new-password"
              />

              {/* State of residence — required, CA blocked */}
              <div>
                <label className="label">State of residence *</label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  required
                  className="w-full bg-navy-100 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                >
                  <option value="" disabled>Select your state...</option>
                  {US_STATES.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                  {/* CA listed separately so users see why it's unavailable */}
                  <option value="CA" className="text-white/30">California (not available)</option>
                </select>
                <p className="text-white/30 text-xs mt-1">Service is not available in California.</p>
              </div>

              {/* Affirmative consent — required for arbitration enforceability */}
              <div className="flex items-start gap-3">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 flex-shrink-0 accent-teal-400 cursor-pointer"
                />
                <label htmlFor="agree-terms" className="text-white/50 text-xs leading-relaxed cursor-pointer select-none">
                  I have read and agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-teal-400 hover:underline" onClick={e => e.stopPropagation()}>
                    Terms of Service
                  </Link>{' '}
                  (including the{' '}
                  <Link href="/terms#arbitration" target="_blank" className="text-teal-400 hover:underline" onClick={e => e.stopPropagation()}>
                    mandatory arbitration agreement
                  </Link>
                  ) and the{' '}
                  <Link href="/privacy" target="_blank" className="text-teal-400 hover:underline" onClick={e => e.stopPropagation()}>
                    Privacy Policy
                  </Link>
                  . I understand this service provides educational information only and is not legal advice.
                </label>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
                disabled={!agreedToTerms || !state || isCaliforniaSelected}
              >
                Create Account →
              </Button>
            </form>
          </div>

          <p className="text-center text-white/50 text-sm mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-teal-400 hover:text-teal-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
