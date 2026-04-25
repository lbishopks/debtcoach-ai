'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Plus, MessageSquare, ChevronLeft, ChevronRight,
  Lock, Pin, Clock, Loader2
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
  users: { full_name: string } | null
  forum_categories: { name: string; slug: string; color: string } | null
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
  return new Date(dateStr).toLocaleDateString()
}

const SLUG_LABELS: Record<string, string> = {
  wins: 'Share Your Win',
  collectors: 'Collector Complaints',
  'credit-reports': 'Credit Report Issues',
  rights: 'Know Your Rights',
  'state-specific': 'State-Specific',
  general: 'General Discussion',
}

export default function CategoryPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/forum/posts?category=${slug}&page=${page}`)
      .then(r => {
        if (r.status === 401) { router.push('/auth/login'); return null }
        if (r.status === 403) { router.push('/subscribe'); return null }
        return r.json()
      })
      .then(data => {
        if (data) {
          setPosts(data.posts ?? [])
          setTotal(data.total ?? 0)
        }
      })
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false))
  }, [slug, page, router])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const categoryName = SLUG_LABELS[slug] ?? slug

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/forum" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" />
              All Categories
            </Link>
            <h1 className="text-xl font-bold text-white">{categoryName}</h1>
            <p className="text-white/40 text-sm">{total} post{total !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href={`/forum/new?category=${slug}`}
            className="flex items-center gap-2 bg-teal-400 text-navy-100 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>

        {/* Posts */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-300 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No posts yet. Be the first!</p>
            <Link href="/forum/new" className="mt-4 inline-block text-teal-400 hover:text-teal-300 text-sm">
              Create a post →
            </Link>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className="space-y-2">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/forum/post/${post.id}`}
                className="block bg-white/[0.03] border border-white/8 rounded-xl px-5 py-4 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                      <h2 className="font-medium text-white group-hover:text-teal-300 transition-colors truncate">
                        {post.title}
                      </h2>
                    </div>
                    <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-xs text-white/40 mb-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.reply_count}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/30">
                      <Clock className="w-3 h-3" />
                      {timeAgo(post.created_at)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-white/30">
                  by {post.users?.full_name ?? 'Community Member'}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-white/40">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
