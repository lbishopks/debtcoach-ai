import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { AccountSettings } from '@/components/AccountSettings'
import { getPlanLimits } from '@/lib/platform-settings'

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, subRes, lettersRes, convRes, freeLimits, proLimits] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    getPlanLimits('free'),
    getPlanLimits('pro'),
  ])

  return (
    <AppShell>
      <AccountSettings
        profile={profileRes.data}
        subscription={subRes.data}
        letterCount={lettersRes.count || 0}
        conversationCount={convRes.count || 0}
        userId={user.id}
        freeLimits={freeLimits}
        proLimits={proLimits}
      />
    </AppShell>
  )
}
