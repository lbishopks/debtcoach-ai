import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sanitize, safeError } from '@/lib/validation'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: replies, error } = await admin
      .from('forum_replies')
      .select('id, content, is_solution, created_at, user_id, users ( full_name )')
      .eq('post_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ replies: replies ?? [] })
  } catch (err) {
    return safeError(err, 'forum-replies-GET')
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ip = getClientIp(req)
    const rl = rateLimit(ip, 'forum-reply', { limit: 10, windowMs: 5 * 60_000 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many replies. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: profile } = await admin.from('users').select('plan').eq('id', user.id).single()
    if (profile?.plan !== 'pro') {
      return NextResponse.json({ error: 'PRO_REQUIRED', message: 'A Pro subscription is required to reply in the forum.' }, { status: 403 })
    }

    // Verify post exists and is not locked
    const { data: post } = await admin.from('forum_posts').select('id, is_locked').eq('id', params.id).single()
    if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    if (post.is_locked) return NextResponse.json({ error: 'This post is locked.' }, { status: 403 })

    const body = await req.json()
    const content = sanitize(body.content ?? '', 5000)
    if (content.length < 2) return NextResponse.json({ error: 'Reply is too short.' }, { status: 400 })

    const { data: reply, error } = await admin
      .from('forum_replies')
      .insert({ post_id: params.id, user_id: user.id, content })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ replyId: reply.id }, { status: 201 })
  } catch (err) {
    return safeError(err, 'forum-replies-POST')
  }
}
