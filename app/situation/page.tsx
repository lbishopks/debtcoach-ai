import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { SituationAnalyzer } from '@/components/situation/SituationAnalyzer'

export default async function SituationPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('plan, state')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan || 'free'
  const state = profile?.state || ''

  return (
    <AppShell>
      <SituationAnalyzer plan={plan} state={state} />
    </AppShell>
  )
}
