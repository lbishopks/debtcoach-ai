import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

const DEFAULTS: Record<string, unknown> = {
  free_messages_limit: 10,
  free_letters_limit: 3,
  pro_messages_limit: 100,
  pro_letters_limit: -1,
  maintenance_mode: false,
  new_signups_enabled: true,
  ai_chat_enabled: true,
  letter_generation_enabled: true,
  site_name: 'DebtCoach AI',
  support_email: '',
}

function isAdmin(email: string | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return email && adminEmails.includes(email.toLowerCase())
}

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from('platform_settings').select('key, value')

    if (error) {
      return NextResponse.json({ settings: DEFAULTS, tableExists: false })
    }

    const settings: Record<string, unknown> = { ...DEFAULTS }
    for (const row of (data || []) as { key: string; value: unknown }[]) {
      settings[row.key] = row.value
    }

    return NextResponse.json({ settings, tableExists: true })
  } catch (err) {
    return safeError(err, 'admin/settings')
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const body = await req.json()

    const upserts = Object.entries(body).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await admin
      .from('platform_settings')
      .upsert(upserts, { onConflict: 'key' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return safeError(err, 'admin/settings/put')
  }
}
