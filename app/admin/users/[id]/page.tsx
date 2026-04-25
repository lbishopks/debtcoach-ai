'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Loader2, Mail, Calendar, CreditCard, Shield,
  Trash2, RotateCcw, Save, CheckCircle, AlertTriangle, FileText,
  DollarSign, MessageSquare, User, ChevronDown, Activity,
  BookOpen, Search, Users
} from 'lucide-react'
import Link from 'next/link'

interface UserDetail {
  id: string; email: string; full_name: string; plan: string
  state: string; created_at: string; updated_at: string
  stripe_customer_id: string | null; onboarding_completed: boolean | null
}
interface Letter {
  id: string; letter_type: string; creditor_name: string; created_at: string
}
interface Debt {
  id: string; creditor_name: string; balance: number; status: string; created_at: string
}
interface Conversation {
  id: string; title: string; created_at: string; updated_at: string
}
interface ActivityEntry {
  id: string; action: string; metadata: Record<string, unknown>; created_at: string
}

const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

function Badge({ children, color = 'default' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    pro: 'bg-teal-400/15 text-teal-400',
    free: 'bg-white/8 text-white/50',
    active: 'bg-green-400/15 text-green-400',
    default: 'bg-white/8 text-white/50',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors[color] || colors.default}`}>
      {children}
    </span>
  )
}

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium
      ${type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {msg}
    </div>
  )
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserDetail | null>(null)
  const [letters, setLetters] = useState<Letter[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [activeTab, setActiveTab] = useState<'activity' | 'letters' | 'debts' | 'conversations'>('activity')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [resetLink, setResetLink] = useState('')

  // Edit form state
  const [form, setForm] = useState({ full_name: '', email: '', plan: 'free', state: 'active', onboarding_completed: false })

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/users/${userId}`).then(r => r.json()),
      fetch(`/api/admin/activity?userId=${userId}&limit=100`).then(r => r.json()),
    ]).then(([d, a]) => {
        setUser(d.user)
        setLetters(d.letters || [])
        setDebts(d.debts || [])
        setConversations(d.conversations || [])
        setActivity(a.activity || [])
        setForm({
          full_name: d.user?.full_name || '',
          email: d.user?.email || '',
          plan: d.user?.plan || 'free',
          state: d.user?.state || 'active',
          onboarding_completed: d.user?.onboarding_completed || false,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setUser(d.user)
      showToast('User updated successfully', 'success')
    } catch (e: unknown) {
      showToast((e instanceof Error ? e.message : null) || 'Failed to update user', 'error')
    }
    setSaving(false)
  }

  const handleResetPassword = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      setResetLink(d.link || '')
      showToast(`Reset link generated for ${d.email}`, 'success')
    } catch (e: unknown) {
      showToast((e instanceof Error ? e.message : null) || 'Failed to generate reset link', 'error')
    }
  }

  const handleDeleteUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      showToast('User deleted', 'success')
      setTimeout(() => router.push('/admin/users'), 1000)
    } catch {
      showToast('Failed to delete user', 'error')
    }
  }

  const handleDeleteLetter = async (letterId: string) => {
    try {
      const res = await fetch(`/api/admin/letters/${letterId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setLetters(prev => prev.filter(l => l.id !== letterId))
      showToast('Letter deleted', 'success')
    } catch {
      showToast('Failed to delete letter', 'error')
    }
  }

  const handleDeleteDebt = async (debtId: string) => {
    try {
      const res = await fetch(`/api/admin/debts/${debtId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setDebts(prev => prev.filter(d => d.id !== debtId))
      showToast('Debt deleted', 'success')
    } catch {
      showToast('Failed to delete debt', 'error')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
    </div>
  )
  if (!user) return <div className="text-red-400 p-4">User not found</div>

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-white/40 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{user.full_name || user.email}</h1>
          <p className="text-white/40 text-sm mt-0.5">{user.email} · Joined {fmtDate(user.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={user.plan}>{user.plan.toUpperCase()}</Badge>
          <Badge color={user.state}>{user.state}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Edit form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/4 border border-white/8 rounded-xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-400" /> Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider">Full Name</label>
                <input
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider">Email</label>
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-400/50 transition-colors"
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider">Plan</label>
                <div className="relative">
                  <select
                    value={form.plan}
                    onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                    className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-400/50 appearance-none transition-colors"
                  >
                    <option value="free" className="bg-[#0a0f1a]">Free</option>
                    <option value="pro" className="bg-[#0a0f1a]">Pro</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-white/40 text-xs font-medium uppercase tracking-wider">State</label>
                <div className="relative">
                  <select
                    value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    className="w-full bg-white/6 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-400/50 appearance-none transition-colors"
                  >
                    <option value="active" className="bg-[#0a0f1a]">Active</option>
                    <option value="suspended" className="bg-[#0a0f1a]">Suspended</option>
                    <option value="banned" className="bg-[#0a0f1a]">Banned</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <button
                  onClick={() => setForm(f => ({ ...f, onboarding_completed: !f.onboarding_completed }))}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${form.onboarding_completed ? 'bg-teal-400' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${form.onboarding_completed ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-white/60 text-sm">Onboarding completed</span>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-400 hover:bg-teal-300 text-[#0a0f1a] font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/4 border border-white/8 rounded-xl overflow-hidden">
            <div className="flex border-b border-white/8">
              {([
                { key: 'activity', label: 'Activity', count: activity.length, icon: Activity },
                { key: 'letters', label: 'Letters', count: letters.length, icon: FileText },
                { key: 'debts', label: 'Debts', count: debts.length, icon: DollarSign },
                { key: 'conversations', label: 'Conversations', count: conversations.length, icon: MessageSquare },
              ] as const).map(({ key, label, count, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors border-b-2 -mb-px
                    ${activeTab === key ? 'text-teal-400 border-teal-400' : 'text-white/40 hover:text-white border-transparent'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-teal-400/20 text-teal-400' : 'bg-white/8 text-white/30'}`}>{count}</span>
                </button>
              ))}
            </div>

            <div className="divide-y divide-white/5">
              {activeTab === 'activity' && (
                activity.length === 0
                  ? <div className="py-10 text-center text-white/30 text-sm">No activity recorded yet</div>
                  : <div className="space-y-1">
                      {activity.map(entry => {
                        const icons: Record<string, React.ReactNode> = {
                          chat: <MessageSquare className="w-3.5 h-3.5" />,
                          letter_generated: <FileText className="w-3.5 h-3.5" />,
                          guide_personalized: <BookOpen className="w-3.5 h-3.5" />,
                          situation_analyzed: <Search className="w-3.5 h-3.5" />,
                          dispute_generated: <Shield className="w-3.5 h-3.5" />,
                          forum_post_created: <Users className="w-3.5 h-3.5" />,
                          forum_reply_created: <MessageSquare className="w-3.5 h-3.5" />,
                          subscription_started: <CreditCard className="w-3.5 h-3.5" />,
                          subscription_cancelled: <CreditCard className="w-3.5 h-3.5" />,
                        }
                        const colors: Record<string, string> = {
                          chat: 'text-teal-400 bg-teal-400/10',
                          letter_generated: 'text-blue-400 bg-blue-400/10',
                          guide_personalized: 'text-purple-400 bg-purple-400/10',
                          situation_analyzed: 'text-yellow-400 bg-yellow-400/10',
                          dispute_generated: 'text-orange-400 bg-orange-400/10',
                          forum_post_created: 'text-green-400 bg-green-400/10',
                          forum_reply_created: 'text-green-400 bg-green-400/10',
                          subscription_started: 'text-teal-400 bg-teal-400/10',
                          subscription_cancelled: 'text-red-400 bg-red-400/10',
                        }
                        const labels: Record<string, string> = {
                          chat: 'Used Research Assistant',
                          letter_generated: 'Generated a Letter',
                          guide_personalized: 'Personalized a Conversation Guide',
                          situation_analyzed: 'Ran Situation Analyzer',
                          dispute_generated: 'Generated Bureau Dispute',
                          forum_post_created: 'Created Forum Post',
                          forum_reply_created: 'Replied in Forum',
                          subscription_started: 'Started Subscription',
                          subscription_cancelled: 'Cancelled Subscription',
                        }
                        const meta = entry.metadata
                        const detail = meta.letter_type ? typeLabel(String(meta.letter_type)) + (meta.creditor ? ` — ${meta.creditor}` : '')
                          : meta.script_title ? String(meta.script_title)
                          : meta.bureau ? String(meta.bureau)
                          : meta.title ? String(meta.title)
                          : meta.message_count ? `${meta.message_count} messages`
                          : ''
                        return (
                          <div key={entry.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/3 transition-colors">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[entry.action] || 'text-white/40 bg-white/5'}`}>
                              {icons[entry.action] || <Activity className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/80 font-medium">{labels[entry.action] || typeLabel(entry.action)}</p>
                              {detail && <p className="text-xs text-white/35 truncate">{detail}</p>}
                            </div>
                            <span className="text-xs text-white/25 flex-shrink-0">
                              {new Date(entry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
              )}

              {activeTab === 'letters' && (
                letters.length === 0
                  ? <div className="py-10 text-center text-white/30 text-sm">No letters yet</div>
                  : letters.map(l => (
                    <div key={l.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/2">
                      <div>
                        <span className="text-white text-sm font-medium">{typeLabel(l.letter_type)}</span>
                        <span className="text-white/30 text-xs ml-2">{l.creditor_name || '—'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/30 text-xs">{fmtDate(l.created_at)}</span>
                        <button
                          onClick={() => handleDeleteLetter(l.id)}
                          className="text-white/20 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}

              {activeTab === 'debts' && (
                debts.length === 0
                  ? <div className="py-10 text-center text-white/30 text-sm">No debts tracked</div>
                  : debts.map(d => (
                    <div key={d.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/2">
                      <div>
                        <span className="text-white text-sm font-medium">{d.creditor_name}</span>
                        <span className="text-white/40 text-xs ml-2">{d.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-semibold text-sm">${Number(d.balance || 0).toLocaleString()}</span>
                        <button
                          onClick={() => handleDeleteDebt(d.id)}
                          className="text-white/20 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}

              {activeTab === 'conversations' && (
                conversations.length === 0
                  ? <div className="py-10 text-center text-white/30 text-sm">No conversations</div>
                  : conversations.map(c => (
                    <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/2">
                      <span className="text-white/70 text-sm truncate max-w-[280px]">{c.title || 'Untitled'}</span>
                      <span className="text-white/30 text-xs flex-shrink-0 ml-4">{fmtDate(c.updated_at)}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Stats + Actions */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white/4 border border-white/8 rounded-xl p-4 space-y-3">
            <h2 className="text-white font-semibold text-sm">Overview</h2>
            {[
              { label: 'Actions', value: activity.length, icon: Activity },
              { label: 'Letters', value: letters.length, icon: FileText },
              { label: 'Debts', value: debts.length, icon: DollarSign },
              { label: 'Conversations', value: conversations.length, icon: MessageSquare },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-white/50 text-sm flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" /> {label}
                </span>
                <span className="text-white font-bold">{value}</span>
              </div>
            ))}
            {user.stripe_customer_id && (
              <div className="pt-2 border-t border-white/8">
                <a
                  href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" /> View in Stripe
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white/4 border border-white/8 rounded-xl p-4 space-y-2">
            <h2 className="text-white font-semibold text-sm mb-3">Actions</h2>

            <button
              onClick={handleResetPassword}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/8 text-white/70 hover:text-white text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Generate Password Reset Link
            </button>

            <button
              onClick={() => { window.location.href = `mailto:${user.email}` }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/8 text-white/70 hover:text-white text-sm transition-all"
            >
              <Mail className="w-4 h-4" /> Email User
            </button>

            <div className="pt-2 border-t border-white/8">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-400 text-xs text-center">This cannot be undone. Delete permanently?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-2 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/8 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition-colors font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reset link display */}
          {resetLink && (
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4">
              <p className="text-amber-400 text-xs font-medium mb-2 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Password Reset Link
              </p>
              <p className="text-white/50 text-[10px] mb-2">Send this link to the user. Valid for 1 hour.</p>
              <input
                readOnly
                value={resetLink}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white/60 text-[10px] focus:outline-none"
                onFocus={e => e.target.select()}
              />
            </div>
          )}

          {/* Meta */}
          <div className="bg-white/4 border border-white/8 rounded-xl p-4 space-y-2">
            <h2 className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">Meta</h2>
            {[
              { label: 'User ID', value: user.id.slice(0, 16) + '…' },
              { label: 'Created', value: fmtDate(user.created_at) },
              { label: 'Updated', value: fmtDate(user.updated_at || user.created_at) },
              { label: 'Onboarded', value: user.onboarding_completed ? 'Yes' : 'No' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-white/40 text-xs">{label}</span>
                <span className="text-white/60 text-xs font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/admin/users" className="text-white/30 hover:text-white text-xs flex items-center gap-1 justify-center transition-colors">
              <Calendar className="w-3 h-3" /> Back to all users
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
