import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

function isAdmin(email: string | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return email && adminEmails.includes(email.toLowerCase())
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'))
    const from = (page - 1) * limit

    const { data: letters, count, error } = await admin
      .from('letters')
      .select('id, user_id, letter_type, creditor_name, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (error) throw error

    // Enrich with user emails
    const userIds = Array.from(new Set((letters || []).map(l => l.user_id)))
    let userMap: Record<string, { email: string; full_name: string }> = {}
    if (userIds.length) {
      const { data: users } = await admin.from('users').select('id, email, full_name').in('id', userIds)
      for (const u of (users || [])) userMap[u.id] = { email: u.email, full_name: u.full_name }
    }

    const enriched = (letters || []).map(l => ({ ...l, users: userMap[l.user_id] }))

    return NextResponse.json({ letters: enriched, total: count || 0, page, limit })
  } catch (err) {
    return safeError(err, 'admin/letters')
  }
}
