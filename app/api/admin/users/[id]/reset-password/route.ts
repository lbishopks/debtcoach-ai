import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

function isAdmin(email: string | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return email && adminEmails.includes(email.toLowerCase())
}

export async function POST(
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

    const { data: userData } = await admin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    if (!userData?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email: userData.email,
    })
    if (error) throw error

    return NextResponse.json({
      link: data.properties?.action_link,
      email: userData.email,
    })
  } catch (err) {
    return safeError(err, 'admin/users/[id]/reset-password')
  }
}
