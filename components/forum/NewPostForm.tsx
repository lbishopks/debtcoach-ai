'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'

interface Category { id: string; name: string; slug: string }

export function NewPostForm() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/forum/categories')
      .then(r => {
        if (r.status === 401) { router.push('/auth/login'); return null }
        if (r.status === 403) { router.push('/subscribe'); return null }
        return r.json()
      })
      .then(data => {
        if (data) {
          setCategories(data.categories ?? [])
          if (data.categories?.length) setCategoryId(data.categories[0].id)
        }
      })
      .catch(() => setError('Failed to load categories.'))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category_id: categoryId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'PRO_REQUIRED') { router.push('/subscribe'); return }
        setError(data.error || data.message || 'Failed to create post.')
        return
      }
      router.push(`/forum/post/${data.postId}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/forum" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Forum
        </Link>
      </div>
      <h1 className="text-xl font-bold text-white mb-6">Create New Post</h1>

      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-3 text-red-300 text-sm mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-400/50"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
            placeholder="What's your post about?"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-400/50"
            required
          />
          <p className="text-xs text-white/30 mt-1">{title.length}/200</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={10000}
            rows={10}
            placeholder="Share your experience, ask a question, or provide information…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-400/50 resize-none"
            required
          />
          <p className="text-xs text-white/30 mt-1">{content.length}/10,000</p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-xl p-3">
          <p className="text-xs text-white/40 leading-relaxed">
            <span className="font-medium text-white/60">Community guidelines:</span> Share personal experiences only. Do not post legal advice, personal attacks, or private information. Posts are visible to all Pro members.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || title.length < 5 || content.length < 10 || !categoryId}
          className="flex items-center gap-2 bg-teal-400 text-navy-100 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitting ? 'Posting…' : 'Post to Community'}
        </button>
      </form>
    </div>
  )
}
