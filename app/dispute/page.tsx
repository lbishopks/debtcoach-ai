import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { BureauDisputeCenter } from '@/components/dispute/BureauDisputeCenter'

export default async function DisputePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [profileRes, debtsRes] = await Promise.all([
    supabase.from('users').select('plan, state').eq('id', user.id).single(),
    supabase.from('debts').select('id, creditor_name, current_balance, debt_type').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const profile = profileRes.data
  const debts = (debtsRes.data || []).map((d: any) => ({ ...d, balance: d.current_balance }))
  const plan = profile?.plan || 'free'
  const state = profile?.state || ''

  return (
    <AppShell>
      <BureauDisputeCenter plan={plan} state={state} debts={debts} />
    </AppShell>
  )
}
