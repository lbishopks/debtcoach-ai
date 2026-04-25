import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'
import { z } from 'zod'

const patchSchema = z.object({
  status: z.enum(['documented', 'reported', 'legal_action', 'resolved']).optional(),
  evidence_notes: z.string().max(5000).optional().nullable(),
}).partial()

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('fdcpa_violations')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ violation: data })
  } catch (err) {
    return safeError(err, 'violations-PATCH')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { error } = await admin
      .from('fdcpa_violations')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return safeError(err, 'violations-DELETE')
  }
}
