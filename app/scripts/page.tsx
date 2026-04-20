import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { ScriptLibrary } from '@/components/scripts/ScriptLibrary'

export default async function ScriptsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, debtsRes] = await Promise.all([
    supabase.from('users').select('plan, full_name, state').eq('id', user.id).single(),
    supabase.from('debts').select('id, creditor_name, current_balance, debt_type').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <AppShell>
      <ScriptLibrary
        plan={profileRes.data?.plan || 'free'}
        profile={profileRes.data}
        debts={debtsRes.data || []}
      />
    </AppShell>
  )
}
