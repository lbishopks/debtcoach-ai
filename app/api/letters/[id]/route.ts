import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('letters')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ letter: data })
  } catch (err) {
    return safeError(err, 'letters/[id]/get')
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    // Build allowed update fields
    const update: Record<string, unknown> = {}
    if (typeof body.content === 'string') update.content = body.content
    if (typeof body.sent_at === 'string' || body.sent_at === null) update.sent_at = body.sent_at
    if (typeof body.sent_method === 'string' || body.sent_method === null) update.sent_method = body.sent_method
    if (typeof body.usps_tracking === 'string' || body.usps_tracking === null) update.usps_tracking = body.usps_tracking
    if (typeof body.response_deadline === 'string' || body.response_deadline === null) update.response_deadline = body.response_deadline
    if (typeof body.response_received_at === 'string' || body.response_received_at === null) update.response_received_at = body.response_received_at
    if (typeof body.response_notes === 'string' || body.response_notes === null) update.response_notes = body.response_notes

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const admin = createAdminClient()
    // Verify ownership before updating
    const { data: existing } = await admin
      .from('letters')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { error } = await admin
      .from('letters')
      .update(update)
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return safeError(err, 'letters/[id]/patch')
  }
}
