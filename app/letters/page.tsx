import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { LetterGenerator } from '@/components/letters/LetterGenerator'

export default async function LettersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, debtsRes, lettersRes] = await Promise.all([
    supabase.from('users').select('plan, state').eq('id', user.id).single(),
    supabase.from('debts').select('id, creditor_name, current_balance, status').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('letters').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <AppShell>
      <LetterGenerator
        plan={profileRes.data?.plan || 'free'}
        state={profileRes.data?.state || ''}
        debts={debtsRes.data || []}
        savedLetters={lettersRes.data || []}
      />
    </AppShell>
  )
}
