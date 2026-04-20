import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { CURRENT_TOS_VERSION } from '@/lib/tos-version'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { version } = await req.json()

    // Only accept the current version — never allow accepting an old or future version
    if (version !== CURRENT_TOS_VERSION) {
      return NextResponse.json({ error: 'Invalid ToS version' }, { status: 400 })
    }

    // Capture IP for legal evidentiary purposes (stored alongside timestamp + version)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const adminClient = createAdminClient()
    const { error } = await adminClient
      .from('users')
      .update({
        tos_accepted_version: version,
        tos_accepted_at: new Date().toISOString(),
        tos_ip_address: ip,
      })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({ ok: true, version, acceptedAt: new Date().toISOString() })
  } catch (err: any) {
    console.error('ToS acceptance error:', err)
    return NextResponse.json({ error: err.message || 'Failed to record acceptance' }, { status: 500 })
  }
}
