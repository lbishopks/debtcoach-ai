import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sanitize, safeError } from '@/lib/validation'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const categorySlug = searchParams.get('category')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const pageSize = 20
    const offset = (page - 1) * pageSize

    const admin = createAdminClient()

    let query = admin
      .from('forum_posts')
      .select(`
        id, title, content, reply_count, is_pinned, is_locked, created_at, updated_at,
        user_id,
        forum_categories ( id, name, slug, color, icon ),
        users ( full_name )
      `, { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (categorySlug) {
      // join through category slug
      const { data: cat } = await admin
        .from('forum_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    const { data: posts, count, error } = await query
    if (error) throw error

    return NextResponse.json({ posts: posts ?? [], total: count ?? 0, page, pageSize })
  } catch (err) {
    return safeError(err, 'forum-posts-GET')
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 posts per 10 minutes
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 'forum-post', { limit: 5, windowMs: 10 * 60_000 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many posts. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Pro plan required
    const admin = createAdminClient()
    const { data: profile } = await admin.from('users').select('plan').eq('id', user.id).single()
    if (profile?.plan !== 'pro') {
      return NextResponse.json({ error: 'PRO_REQUIRED', message: 'A Pro subscription is required to post in the forum.' }, { status: 403 })
    }

    const body = await req.json()
    const title = sanitize(body.title ?? '', 200)
    const content = sanitize(body.content ?? '', 10000)
    const categoryId = sanitize(body.category_id ?? '', 100)

    if (title.length < 5) return NextResponse.json({ error: 'Title must be at least 5 characters.' }, { status: 400 })
    if (content.length < 10) return NextResponse.json({ error: 'Content must be at least 10 characters.' }, { status: 400 })
    if (!categoryId) return NextResponse.json({ error: 'Category is required.' }, { status: 400 })

    // Verify category exists
    const { data: cat } = await admin.from('forum_categories').select('id').eq('id', categoryId).single()
    if (!cat) return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })

    const { data: post, error } = await admin
      .from('forum_posts')
      .insert({ user_id: user.id, category_id: categoryId, title, content })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ postId: post.id }, { status: 201 })
  } catch (err) {
    return safeError(err, 'forum-posts-POST')
  }
}
