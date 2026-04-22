import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

function isAdmin(email: string | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return email && adminEmails.includes(email.toLowerCase())
}

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
    const { data, error } = await admin
      .from('letters')
      .select('*, users(email, full_name)')
      .eq('id', params.id)
      .single()
    if (error) throw error
    return NextResponse.json({ letter: data })
  } catch (err) {
    return safeError(err, 'admin/letters/[id]/get')
  }
}

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
    const { content, creditor_name, letter_type } = await req.json()
    const admin = createAdminClient()
    const updates: Record<string, string> = {}
    if (content !== undefined) updates.content = content
    if (creditor_name !== undefined) updates.creditor_name = creditor_name
    if (letter_type !== undefined) updates.letter_type = letter_type
    const { error } = await admin.from('letters').update(updates).eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return safeError(err, 'admin/letters/[id]/patch')
  }
}

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
    const { error } = await admin.from('letters').delete().eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return safeError(err, 'admin/letters/[id]/delete')
  }
}
