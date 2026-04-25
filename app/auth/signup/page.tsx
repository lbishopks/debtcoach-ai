'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Zap, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
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
          data: { full_name: fullName },
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
          Join thousands of Americans who&apos;ve used DebtCoach AI to negotiate better settlements,
          dispute errors, and understand their consumer rights.
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
              {/* Affirmative consent checkbox — required for arbitration enforceability */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      agreedToTerms
                        ? 'bg-teal-400 border-teal-400'
                        : 'bg-transparent border-white/30 group-hover:border-white/50'
                    }`}
                  >
                    {agreedToTerms && (
                      <svg className="w-3 h-3 text-navy-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-white/50 text-xs leading-relaxed">
                  I have read and agree to the{' '}
                  <Link href="/terms" target="_blank" className="text-teal-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  (including the{' '}
                  <Link href="/terms#arbitration" target="_blank" className="text-teal-400 hover:underline">
                    mandatory arbitration agreement
                  </Link>
                  ) and the{' '}
                  <Link href="/privacy" target="_blank" className="text-teal-400 hover:underline">
                    Privacy Policy
                  </Link>
                  . I understand this service provides educational information only and is not legal advice.
                </span>
              </label>

              <Button type="submit" loading={loading} className="w-full" size="lg" disabled={!agreedToTerms}>
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
