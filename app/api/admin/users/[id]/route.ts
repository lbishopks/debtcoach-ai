import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

function isAdmin(email: string | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return email && adminEmails.includes(email.toLowerCase())
}

// GET - Full user profile + letters + debts + conversations
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const userId = params.id

    const [userRes, lettersRes, debtsRes, convsRes] = await Promise.all([
      admin.from('users').select('*').eq('id', userId).single(),
      admin.from('letters').select('id, letter_type, creditor_name, created_at, content').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
      admin.from('debts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      admin.from('conversations').select('id, title, created_at, updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(30),
    ])

    if (userRes.error) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      user: userRes.data,
      letters: lettersRes.data || [],
      debts: debtsRes.data || [],
      conversations: convsRes.data || [],
    })
  } catch (err) {
    return safeError(err, 'admin/users/[id]')
  }
}

// PATCH - Update user profile fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const userId = params.id
    const body = await req.json()

    // Update auth email if requested
    if (body.email) {
      const { error: authErr } = await admin.auth.admin.updateUserById(userId, { email: body.email })
      if (authErr) throw authErr
    }

    const allowed = ['full_name', 'email', 'plan', 'state', 'onboarding_completed']
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const { data, error } = await admin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error

    return NextResponse.json({ user: data })
  } catch (err) {
    return safeError(err, 'admin/users/[id]/patch')
  }
}

// DELETE - Remove user account entirely
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()
    const userId = params.id

    // Delete from auth (Supabase will cascade if FK set up, otherwise clean up manually)
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) throw error

    // Clean up users table row (in case no cascade)
    await admin.from('users').delete().eq('id', userId)

    return NextResponse.json({ success: true })
  } catch (err) {
    return safeError(err, 'admin/users/[id]/delete')
  }
}
