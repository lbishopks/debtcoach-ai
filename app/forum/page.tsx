'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Trophy, AlertTriangle, FileText, Shield,
  MapPin, MessageSquare, Users, Plus, TrendingUp,
  Loader2
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  'alert-triangle': AlertTriangle,
  'file-text': FileText,
  shield: Shield,
  'map-pin': MapPin,
  'message-square': MessageSquare,
}

const COLOR_MAP: Record<string, string> = {
  teal:   'bg-teal-400/15 text-teal-300 border-teal-400/20',
  red:    'bg-red-400/15 text-red-300 border-red-400/20',
  yellow: 'bg-yellow-400/15 text-yellow-300 border-yellow-400/20',
  blue:   'bg-blue-400/15 text-blue-300 border-blue-400/20',
  purple: 'bg-purple-400/15 text-purple-300 border-purple-400/20',
  gray:   'bg-white/5 text-white/60 border-white/10',
}

const DOT_MAP: Record<string, string> = {
  teal:   'bg-teal-400',
  red:    'bg-red-400',
  yellow: 'bg-yellow-400',
  blue:   'bg-blue-400',
  purple: 'bg-purple-400',
  gray:   'bg-white/40',
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  icon: string
  post_count: number
}

export default function ForumPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/forum/categories')
      .then(r => {
        if (r.status === 401) { router.push('/auth/login'); return null }
        if (r.status === 403) { router.push('/subscribe'); return null }
        return r.json()
      })
      .then(data => {
        if (data) setCategories(data.categories ?? [])
      })
      .catch(() => setError('Failed to load forum categories.'))
      .finally(() => setLoading(false))
  }, [router])

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-400/15 border border-teal-400/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-teal-300" />
              </div>
              <h1 className="text-2xl font-bold text-white">Community Forum</h1>
            </div>
            <p className="text-white/50 text-sm max-w-lg">
              Peer-to-peer experiences shared by members. Not legal advice — just real stories from real people.
            </p>
          </div>
          <Link
            href="/forum/new"
            className="flex items-center gap-2 bg-teal-400 text-navy-100 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-400/5 border border-yellow-400/15 rounded-xl px-4 py-3 mb-8">
          <p className="text-yellow-300/80 text-xs leading-relaxed">
            <span className="font-semibold text-yellow-300">Community disclaimer:</span> Posts in this forum are personal experiences and opinions shared by members. Nothing here constitutes legal advice. Consult a licensed attorney for advice specific to your situation.
          </p>
        </div>

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

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => {
              const Icon = ICON_MAP[cat.icon] ?? MessageSquare
              const colorClass = COLOR_MAP[cat.color] ?? COLOR_MAP.gray
              const dotClass = DOT_MAP[cat.color] ?? DOT_MAP.gray
              return (
                <Link
                  key={cat.id}
                  href={`/forum/${cat.slug}`}
                  className="group bg-white/[0.03] border border-white/8 rounded-2xl p-5 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h2 className="font-semibold text-white group-hover:text-teal-300 transition-colors">
                          {cat.name}
                        </h2>
                        <span className="flex items-center gap-1.5 text-xs text-white/40 flex-shrink-0">
                          <TrendingUp className="w-3 h-3" />
                          {cat.post_count} post{cat.post_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                    <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                      Browse posts →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
