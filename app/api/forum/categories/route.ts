import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: categories, error } = await admin
      .from('forum_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ categories: categories ?? [] })
  } catch (err) {
    return safeError(err, 'forum-categories')
  }
}
