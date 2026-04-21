import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

interface LetterTypeRow {
  letter_type: string
}

interface UsageRow {
  messages_count: number | null
  letters_count: number | null
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

    // Parallel queries for speed
    const [
      usersRes,
      proUsersRes,
      lettersRes,
      debtsRes,
      convsRes,
      newUsers7dRes,
      newUsers30dRes,
      letterTypesRes,
      recentUsersRes,
      usageRes,
    ] = await Promise.all([
      admin.from('users').select('id', { count: 'exact', head: true }),
      admin.from('users').select('id', { count: 'exact', head: true }).eq('plan', 'pro'),
      admin.from('letters').select('id', { count: 'exact', head: true }),
      admin.from('debts').select('id', { count: 'exact', head: true }),
      admin.from('conversations').select('id', { count: 'exact', head: true }),
      admin.from('users').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      admin.from('users').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      admin.from('letters').select('letter_type'),
      admin.from('users').select('id, email, full_name, plan, state, created_at')
        .order('created_at', { ascending: false }).limit(10),
      admin.from('usage_tracking').select('messages_count, letters_count')
        .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
    ])

    // Letter type breakdown
    const lettersByType: Record<string, number> = {}
    for (const row of ((letterTypesRes.data || []) as LetterTypeRow[])) {
      lettersByType[row.letter_type] = (lettersByType[row.letter_type] || 0) + 1
    }

    // Usage totals
    const totalMessages = ((usageRes.data || []) as UsageRow[]).reduce(
      (s: number, r: UsageRow) => s + (r.messages_count || 0), 0
    )

    return NextResponse.json({
      totalUsers: usersRes.count || 0,
      proUsers: proUsersRes.count || 0,
      freeUsers: (usersRes.count || 0) - (proUsersRes.count || 0),
      totalLetters: lettersRes.count || 0,
      totalDebts: debtsRes.count || 0,
      totalConversations: convsRes.count || 0,
      newUsers7d: newUsers7dRes.count || 0,
      newUsers30d: newUsers30dRes.count || 0,
      lettersByType,
      totalMessages30d: totalMessages,
      recentUsers: recentUsersRes.data || [],
    })
  } catch (err) {
    return safeError(err, 'admin/stats')
  }
}
