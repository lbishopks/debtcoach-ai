import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

interface UserRow {
  id: string
  email: string
  full_name: string
  plan: string
  state: string
  created_at: string
  stripe_customer_id: string | null
  onboarding_completed: boolean | null
}

interface CountRow {
  user_id: string
}

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
    const search = searchParams.get('search') || ''
    const plan = searchParams.get('plan') || ''
    const from = (page - 1) * limit

    let query = admin
      .from('users')
      .select('id, email, full_name, plan, state, created_at, stripe_customer_id, onboarding_completed', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    if (plan) query = query.eq('plan', plan)

    const { data: usersRaw, count, error } = await query
    if (error) throw error

    const users = (usersRaw || []) as UserRow[]

    // For each user, get letter/debt counts in parallel (batch of IDs)
    const ids = users.map((u: UserRow) => u.id)
    const [lettersRes, debtsRes] = await Promise.all([
      ids.length ? admin.from('letters').select('user_id').in('user_id', ids) : Promise.resolve({ data: [] as CountRow[] }),
      ids.length ? admin.from('debts').select('user_id').in('user_id', ids) : Promise.resolve({ data: [] as CountRow[] }),
    ])

    const letterCounts: Record<string, number> = {}
    const debtCounts: Record<string, number> = {}
    for (const l of ((lettersRes.data || []) as CountRow[])) letterCounts[l.user_id] = (letterCounts[l.user_id] || 0) + 1
    for (const d of ((debtsRes.data || []) as CountRow[])) debtCounts[d.user_id] = (debtCounts[d.user_id] || 0) + 1

    const enriched = users.map((u: UserRow) => ({
      ...u,
      letters_count: letterCounts[u.id] || 0,
      debts_count: debtCounts[u.id] || 0,
    }))

    return NextResponse.json({ users: enriched, total: count || 0, page, limit })
  } catch (err) {
    return safeError(err, 'admin/users')
  }
}

// Update user plan
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { userId, plan } = await req.json()
    if (!userId || !['free', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { error } = await admin.from('users').update({ plan, updated_at: new Date().toISOString() }).eq('id', userId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return safeError(err, 'admin/users/patch')
  }
}
