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
  const [loading, setLoading] = useState(false)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
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
          emailRedirectTo: `${window.location.origin}/subscribe`,
        },
      })
      if (error) throw error
      router.push('/subscribe')
    } catch (err: any) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    'AI-powered debt negotiation coaching',
    'Custom dispute letters in seconds',
    'Know your legal rights (FDCPA, FCRA)',
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
          <p className="text-white/50 text-sm mb-6">Step 1 of 2 — set up your account, then choose a plan.</p>

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
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Create Account →
              </Button>
            </form>

          </div>

          <p className="text-center text-white/40 text-xs mt-4">
            By signing up, you agree to our{' '}
            <Link href="/privacy" className="text-teal-400 hover:underline">Privacy Policy</Link>.
          </p>

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
