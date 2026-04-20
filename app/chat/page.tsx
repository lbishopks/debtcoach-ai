import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { ChatInterface } from '@/components/chat/ChatInterface'

export default async function ChatPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, debtsRes, convRes] = await Promise.all([
    supabase.from('users').select('plan, full_name, state').eq('id', user.id).single(),
    supabase.from('debts').select('id, creditor_name, debt_type, current_balance, status').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('conversations').select('id, title, created_at, messages').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(20),
  ])

  return (
    <AppShell>
      <ChatInterface
        userId={user.id}
        plan={profileRes.data?.plan || 'free'}
        profile={profileRes.data}
        debts={debtsRes.data || []}
        conversations={convRes.data || []}
      />
    </AppShell>
  )
}
