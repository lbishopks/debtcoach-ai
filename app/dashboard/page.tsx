import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { DebtDashboard } from '@/components/debt/DebtDashboard'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [profileRes, debtsRes, conversationsRes, lettersRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('debts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('conversations').select('id, title, created_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
    supabase.from('letters').select('id, letter_type, creditor_name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
  ])

  const profile = profileRes.data
  const debts = debtsRes.data || []
  const conversations = conversationsRes.data || []
  const letters = lettersRes.data || []

  if (profile && !profile.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <AppShell>
      <DebtDashboard
        profile={profile}
        debts={debts}
        conversations={conversations}
        letters={letters}
        userId={user.id}
      />
    </AppShell>
  )
}
