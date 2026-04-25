import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { safeError } from '@/lib/validation'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: post, error } = await admin
      .from('forum_posts')
      .select(`
        id, title, content, reply_count, is_pinned, is_locked, created_at, user_id,
        users ( full_name ),
        forum_categories ( id, name, slug, color, icon )
      `)
      .eq('id', params.id)
      .single()

    if (error || !post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    return NextResponse.json({ post })
  } catch (err) {
    return safeError(err, 'forum-post-GET')
  }
}
