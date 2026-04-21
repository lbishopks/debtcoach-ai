'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Zap } from 'lucide-react'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-400 rounded-2xl mb-4">
            <Zap className="w-7 h-7 text-navy-200" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/50 mt-1 text-sm">Sign in to your DebtCoach AI account</p>
        </div>

        {/* Form Card */}
        <div className="card space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="flex items-center justify-end">
              <Link href="/auth/forgot-password" className="text-sm text-teal-400 hover:text-teal-300">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

        </div>

        <p className="text-center text-white/50 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-teal-400 hover:text-teal-300 font-medium">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy-200 flex items-center justify-center">
        <div className="text-white/50">Loading…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
