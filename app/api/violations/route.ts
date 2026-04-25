import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'
import { z } from 'zod'

const violationSchema = z.object({
  collector_name: z.string().min(1).max(200),
  collector_phone: z.string().max(50).optional().nullable(),
  violation_type: z.string().min(1).max(200),
  violation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  description: z.string().min(1).max(5000),
  evidence_notes: z.string().max(5000).optional().nullable(),
  status: z.enum(['documented', 'reported', 'legal_action', 'resolved']).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('fdcpa_violations')
      .select('*')
      .eq('user_id', user.id)
      .order('violation_date', { ascending: false })

    if (error) throw error
    return NextResponse.json({ violations: data ?? [] })
  } catch (err) {
    return safeError(err, 'violations-GET')
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const parsed = violationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('fdcpa_violations')
      .insert({ ...parsed.data, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ violation: data }, { status: 201 })
  } catch (err) {
    return safeError(err, 'violations-POST')
  }
}
