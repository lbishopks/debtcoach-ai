import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/AdminShell'

function isAdmin(email: string | undefined) {
  const raw = process.env.ADMIN_EMAILS || ''
  const adminEmails = raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return email && adminEmails.includes(email.toLowerCase())
}

export const metadata = { title: 'Admin — DebtCoach AI' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/admin')

  if (!isAdmin(user.email)) {
    // Show a diagnostic page instead of silently redirecting
    // This helps identify misconfigured ADMIN_EMAILS env var
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">🔒</span>
          </div>
          <h1 className="text-white font-bold text-xl mb-2">Admin Access Denied</h1>
          <p className="text-white/50 text-sm mb-4">
            Your account is not on the admin list.
          </p>
          <div className="bg-black/30 rounded-xl p-4 text-left mb-4">
            <p className="text-white/30 text-xs mb-1">Signed in as:</p>
            <p className="text-teal-300 text-sm font-mono">{user.email}</p>
            <p className="text-white/30 text-xs mt-3 mb-1">ADMIN_EMAILS configured:</p>
            <p className="text-white/50 text-xs font-mono break-all">
              {process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS : '(not set)'}
            </p>
          </div>
          <p className="text-white/30 text-xs">
            To fix: add your email to the <code className="text-teal-400">ADMIN_EMAILS</code> env var in Railway, then redeploy.
          </p>
        </div>
      </div>
    )
  }

  return <AdminShell userEmail={user.email!}>{children}</AdminShell>
}
