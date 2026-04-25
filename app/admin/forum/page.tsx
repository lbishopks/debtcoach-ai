'use client'
import { useEffect, useState } from 'react'
import { Pin, Lock, Trash2, Unlock, PinOff, Loader2, AlertTriangle, Search, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface Post {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_locked: boolean
  reply_count: number
  created_at: string
  user_id: string
  users: { full_name: string; email?: string } | null
  forum_categories: { name: string; slug: string } | null
}

export default function AdminForumPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actioningId, setActioningId] = useState<string | null>(null)

  useEffect(() => { fetchPosts() }, [])

  async function fetchPosts() {
    setLoading(true)
    try {
      const r = await fetch('/api/forum/posts?pageSize=100')
      const data = await r.json()
      setPosts(data.posts ?? [])
    } catch {
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  async function patchPost(id: string, update: { is_pinned?: boolean; is_locked?: boolean }) {
    setActioningId(id)
    try {
      const r = await fetch(`/api/admin/forum/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      })
      if (!r.ok) throw new Error('Failed')
      setPosts(prev => prev.map(p => p.id === id ? { ...p, ...update } : p))
      toast.success('Post updated')
    } catch {
      toast.error('Action failed')
    } finally {
      setActioningId(null)
    }
  }

  async function deletePost(id: string, title: string) {
    if (!confirm(`Delete post "${title}"? This cannot be undone.`)) return
    setActioningId(id)
    try {
      const r = await fetch(`/api/admin/forum/posts/${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error('Failed')
      setPosts(prev => prev.filter(p => p.id !== id))
      toast.success('Post deleted')
    } catch {
      toast.error('Delete failed')
    } finally {
      setActioningId(null)
    }
  }

  const filtered = posts.filter(p =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.users?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Forum Moderation</h1>
          <p className="text-white/50 text-sm mt-1">{posts.length} posts total</p>
        </div>
        <button onClick={fetchPosts} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search by title or author name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-400/50"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">No posts found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(post => (
            <div key={post.id}
              className={`bg-white/5 border rounded-xl p-4 flex items-start gap-4 ${
                post.is_pinned ? 'border-teal-400/30 bg-teal-400/5' : 'border-white/10'
              } ${post.is_locked ? 'opacity-70' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {post.is_pinned && (
                    <span className="text-[10px] font-bold text-teal-300 bg-teal-400/15 px-2 py-0.5 rounded-full">PINNED</span>
                  )}
                  {post.is_locked && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full">LOCKED</span>
                  )}
                  {post.forum_categories && (
                    <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                      {post.forum_categories.name}
                    </span>
                  )}
                </div>
                <p className="text-white font-medium text-sm truncate">{post.title}</p>
                <p className="text-white/30 text-xs mt-0.5">
                  by {post.users?.full_name ?? 'Unknown'} · {post.reply_count} replies · {new Date(post.created_at).toLocaleDateString()}
                </p>
                <p className="text-white/40 text-xs mt-1 line-clamp-1">{post.content}</p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {actioningId === post.id ? (
                  <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                ) : (
                  <>
                    <button
                      onClick={() => patchPost(post.id, { is_pinned: !post.is_pinned })}
                      title={post.is_pinned ? 'Unpin' : 'Pin'}
                      className={`p-1.5 rounded-lg transition-colors ${post.is_pinned ? 'text-teal-400 bg-teal-400/15 hover:bg-teal-400/25' : 'text-white/30 hover:text-teal-400 hover:bg-teal-400/10'}`}
                    >
                      {post.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => patchPost(post.id, { is_locked: !post.is_locked })}
                      title={post.is_locked ? 'Unlock' : 'Lock'}
                      className={`p-1.5 rounded-lg transition-colors ${post.is_locked ? 'text-amber-400 bg-amber-400/15 hover:bg-amber-400/25' : 'text-white/30 hover:text-amber-400 hover:bg-amber-400/10'}`}
                    >
                      {post.is_locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => deletePost(post.id, post.title)}
                      title="Delete post"
                      className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-amber-400/8 border border-amber-400/20 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300/80 text-xs leading-relaxed">
            <strong className="text-amber-300">Moderation note:</strong> User real names are shown here for admin purposes only. Forum posts display as &quot;Community Member&quot; to the public to protect user privacy.
          </p>
        </div>
      </div>
    </div>
  )
}
