import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')  // filter by specific user
    const limit = Math.min(200, parseInt(searchParams.get('limit') ?? '50'))

    const admin = createAdminClient()
    let query = admin
      .from('activity_log')
      .select('id, user_id, action, metadata, created_at, users ( full_name, email )')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ activity: data ?? [] })
  } catch (err) {
    return safeError(err, 'admin-activity-GET')
  }
}
