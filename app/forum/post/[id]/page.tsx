'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MessageSquare, Send, Loader2,
  Lock, Pin, CheckCircle2, Clock, User
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'

interface Post {
  id: string
  title: string
  content: string
  reply_count: number
  is_pinned: boolean
  is_locked: boolean
  created_at: string
  user_id: string | null
  users: { full_name: string } | null
  forum_categories: { id: string; name: string; slug: string; color: string; icon: string } | null
}

interface Reply {
  id: string
  content: string
  is_solution: boolean
  created_at: string
  user_id: string | null
  users: { full_name: string } | null
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loadingPost, setLoadingPost] = useState(true)
  const [loadingReplies, setLoadingReplies] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/forum/posts/${postId}`)
      if (res.status === 401) { router.push('/auth/login'); return }
      if (res.status === 403) { router.push('/subscribe'); return }
      if (!res.ok) { setError('Post not found.'); return }
      const data = await res.json()
      setPost(data.post)
    } catch {
      setError('Failed to load post.')
    } finally {
      setLoadingPost(false)
    }
  }

  const fetchReplies = async () => {
    try {
      const res = await fetch(`/api/forum/posts/${postId}/replies`)
      if (!res.ok) return
      const data = await res.json()
      setReplies(data.replies ?? [])
    } catch {
      // silently fail for replies
    } finally {
      setLoadingReplies(false)
    }
  }

  useEffect(() => {
    fetchPost()
    fetchReplies()
  }, [postId])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    setReplyError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`/api/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'PRO_REQUIRED') { router.push('/subscribe'); return }
        setReplyError(data.error || data.message || 'Failed to post reply.')
        return
      }
      setReplyContent('')
      await fetchReplies()
      // Update reply count locally
      setPost(p => p ? { ...p, reply_count: p.reply_count + 1 } : p)
    } catch {
      setReplyError('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingPost) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
        </div>
      </AppShell>
    )
  }

  if (error || !post) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-300 text-sm">
            {error ?? 'Post not found.'}
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <div className="mb-5">
          <Link
            href={post.forum_categories ? `/forum/${post.forum_categories.slug}` : '/forum'}
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {post.forum_categories?.name ?? 'Forum'}
          </Link>
        </div>

        {/* Post */}
        <article className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {post.is_pinned && (
                  <span className="flex items-center gap-1 text-xs bg-teal-400/15 text-teal-300 px-2 py-0.5 rounded-full">
                    <Pin className="w-2.5 h-2.5" />
                    Pinned
                  </span>
                )}
                {post.is_locked && (
                  <span className="flex items-center gap-1 text-xs bg-white/10 text-white/40 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" />
                    Locked
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-white leading-snug">{post.title}</h1>
            </div>
            <div className="flex items-center gap-1 text-sm text-white/40 flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
              <span>{post.reply_count}</span>
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-white/75 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="mt-5 pt-4 border-t border-white/8 flex items-center gap-3 text-xs text-white/40">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <User className="w-3 h-3 text-white/40" />
              </div>
              <span>{post.users?.full_name ?? 'Community Member'}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(post.created_at)}
            </div>
          </div>
        </article>

        {/* Replies */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {loadingReplies && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
            </div>
          )}

          {!loadingReplies && replies.length === 0 && !post.is_locked && (
            <div className="text-center py-8">
              <p className="text-white/30 text-sm">No replies yet. Be the first to respond.</p>
            </div>
          )}

          <div className="space-y-3">
            {replies.map((reply, i) => (
              <div
                key={reply.id}
                className={`bg-white/[0.03] border rounded-xl p-5 ${
                  reply.is_solution
                    ? 'border-teal-400/30 bg-teal-400/5'
                    : 'border-white/8'
                }`}
              >
                {reply.is_solution && (
                  <div className="flex items-center gap-1.5 text-xs text-teal-300 mb-3">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marked as solution
                  </div>
                )}
                <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">
                  {reply.content}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-white/35">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center">
                      <User className="w-2.5 h-2.5 text-white/30" />
                    </div>
                    <span>{reply.users?.full_name ?? 'Community Member'}</span>
                  </div>
                  <span>·</span>
                  <span>{timeAgo(reply.created_at)}</span>
                  <span className="ml-auto text-white/20">#{i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Form */}
        {post.is_locked ? (
          <div className="bg-white/3 border border-white/8 rounded-xl px-5 py-4 text-center">
            <Lock className="w-5 h-5 text-white/30 mx-auto mb-2" />
            <p className="text-white/40 text-sm">This post is locked. No new replies are allowed.</p>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-4">Add a Reply</h3>

            {replyError && (
              <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-red-300 text-sm mb-3">
                {replyError}
              </div>
            )}

            <form onSubmit={handleReply} className="space-y-3">
              <textarea
                ref={replyRef}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                maxLength={5000}
                rows={5}
                placeholder="Share your experience or response…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-400/50 focus:bg-white/8 resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/30">{replyContent.length}/5,000</p>
                <button
                  type="submit"
                  disabled={submitting || replyContent.trim().length < 2}
                  className="flex items-center gap-2 bg-teal-400 text-navy-100 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {submitting ? 'Posting…' : 'Post Reply'}
                </button>
              </div>
            </form>

            <p className="mt-3 text-xs text-white/25 leading-relaxed">
              Replies are personal experiences only — not legal advice. Be respectful and constructive.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
