import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { KnowYourRights } from '@/components/KnowYourRights'

export default async function RightsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('users').select('state').eq('id', user.id).single()

  return (
    <AppShell>
      <KnowYourRights userState={profile?.state || ''} />
    </AppShell>
  )
}
