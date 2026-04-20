import { createClient } from '@/lib/supabase/server'
import { Sidebar } from './Sidebar'
import { TosGuard } from './TosGuard'
import { StateBlocked } from '@/components/StateBlocked'
import { isStateBlocked, isStateCaution, CAUTION_STATE_DISCLAIMER, US_STATES } from '@/lib/state-restrictions'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let plan = 'free'
  let tosVersion: string | null = null
  let userState: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('plan, tos_accepted_version, state')
      .eq('id', user.id)
      .single()
    plan = profile?.plan || 'free'
    tosVersion = profile?.tos_accepted_version ?? null
    userState = profile?.state ?? null
  }

  // Hard block for restricted states — shown even after prior onboarding
  if (userState && isStateBlocked(userState)) {
    const stateInfo = US_STATES.find(s => s.code === userState)
    return <StateBlocked stateCode={userState} stateName={stateInfo?.name} />
  }

  const isCaution = userState ? isStateCaution(userState) : false

  return (
    <div className="min-h-screen bg-navy-200 flex">
      <Sidebar plan={plan} />
      <main className="flex-1 md:ml-60 pt-14 md:pt-0 min-h-screen">
        {isCaution && (
          <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 flex items-start gap-2">
            <span className="text-yellow-400 text-xs mt-0.5 flex-shrink-0">⚠️</span>
            <p className="text-yellow-300/80 text-xs leading-relaxed">{CAUTION_STATE_DISCLAIMER}</p>
          </div>
        )}
        <TosGuard tosVersion={tosVersion}>
          {children}
        </TosGuard>
      </main>
    </div>
  )
}
