'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { UpgradeModal } from '@/components/UpgradeModal'
import { SCRIPT_TEMPLATES, SCRIPT_CATEGORIES, ScriptTemplate } from '@/lib/scripts-data'
import { cn } from '@/lib/utils'
import { Search, Phone, Mail, FileText, Sparkles, Copy, CheckCheck, Lock, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const CHANNEL_ICONS = { phone: Phone, email: Mail, letter: FileText }
const CHANNEL_COLORS = {
  phone: 'text-blue-400 bg-blue-400/10',
  email: 'text-yellow-400 bg-yellow-400/10',
  letter: 'text-purple-400 bg-purple-400/10',
}

interface Props {
  plan: string
  profile: { full_name?: string; state?: string } | null
  debts: Array<{ id: string; creditor_name: string; current_balance: number; debt_type: string }>
}

export function ScriptLibrary({ plan, profile, debts }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selectedScript, setSelectedScript] = useState<ScriptTemplate | null>(null)
  const [personalizing, setPersonalizing] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [personalizedScript, setPersonalizedScript] = useState('')
  const [selectedDebt, setSelectedDebt] = useState('')
  const [copied, setCopied] = useState(false)

  const filtered = SCRIPT_TEMPLATES.filter(s => {
    const matchesSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || s.category === category
    return matchesSearch && matchesCategory
  })

  const openScript = (script: ScriptTemplate) => {
    setSelectedScript(script)
    setPersonalizedScript('')
    setSelectedDebt('')
  }

  const personalizeScript = async () => {
    if (plan === 'free') {
      setShowUpgrade(true)
      return
    }
    if (!selectedScript) return
    setPersonalizing(true)
    try {
      const debt = debts.find(d => d.id === selectedDebt)
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptTemplate: selectedScript.script,
          scriptTitle: selectedScript.title,
          debtInfo: debt ? {
            creditorName: debt.creditor_name,
            balance: debt.current_balance,
            debtType: debt.debt_type,
          } : null,
          userInfo: {
            name: profile?.full_name || '[YOUR NAME]',
            state: profile?.state || '',
          },
        }),
      })
      if (!res.ok) throw new Error('Personalization failed')
      const data = await res.json()
      setPersonalizedScript(data.script)
      toast.success('Guide personalized!')
    } catch (err) {
      toast.error('Failed to personalize script')
    } finally {
      setPersonalizing(false)
    }
  }

  const copyScript = () => {
    const text = personalizedScript || selectedScript?.script || ''
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="section-header">Conversation Guides</h1>
        <p className="section-subheader">General reference guides some consumers use when speaking with creditors and collectors</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-3 mb-6">
        <p className="text-yellow-300/80 text-xs leading-relaxed">
          <span className="font-semibold text-yellow-300">⚠️ Educational reference only.</span> These are general conversation guides based on publicly available consumer protection information — not scripts prepared by an attorney and not legal advice. What you say during a call and whether any approach is appropriate for your situation is your decision. Consult a licensed consumer rights attorney before invoking legal rights or taking formal action.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="input pl-9"
            placeholder="Search guides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SCRIPT_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-medium transition-all',
                category === cat.value
                  ? 'bg-teal-400/20 text-teal-300 border border-teal-400/30'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Script Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((script) => {
          const Icon = CHANNEL_ICONS[script.channel]
          return (
            <button
              key={script.id}
              onClick={() => openScript(script)}
              className="card-hover text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', CHANNEL_COLORS[script.channel])}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={cn(
                  'badge text-xs capitalize',
                  script.category === 'negotiation' ? 'bg-blue-500/20 text-blue-300' :
                  script.category === 'validation' ? 'bg-yellow-500/20 text-yellow-300' :
                  script.category === 'rights' ? 'bg-red-500/20 text-red-300' :
                  'bg-purple-500/20 text-purple-300'
                )}>
                  {script.category.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-2 leading-snug">{script.title}</h3>
              <p className="text-white/40 text-xs mb-3 leading-relaxed">{script.description}</p>
              <div className="flex flex-wrap gap-1">
                {script.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-white/5 text-white/30 px-2 py-0.5 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card text-center py-12">
          <Search className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No guides match your search</p>
        </div>
      )}

      {/* Script Detail Modal */}
      <Modal
        isOpen={!!selectedScript}
        onClose={() => setSelectedScript(null)}
        title={selectedScript?.title}
        size="xl"
      >
        {selectedScript && (
          <div className="space-y-4">
            {/* Tips */}
            <div className="bg-teal-400/10 border border-teal-400/20 rounded-xl p-4">
              <h4 className="text-teal-300 text-sm font-semibold mb-2">💡 Pro Tips</h4>
              <ul className="space-y-1">
                {selectedScript.tips.map((tip, i) => (
                  <li key={i} className="text-white/60 text-xs flex gap-2">
                    <span className="text-teal-400 flex-shrink-0">•</span>{tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Personalize with debt context */}
            {debts.length > 0 && (
              <div className="flex items-center gap-3">
                <select
                  className="input flex-1 py-2 text-sm"
                  value={selectedDebt}
                  onChange={(e) => setSelectedDebt(e.target.value)}
                >
                  <option value="">Select a debt to personalize...</option>
                  {debts.map(d => (
                    <option key={d.id} value={d.id}>{d.creditor_name} — ${d.current_balance.toLocaleString()}</option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={personalizeScript}
                  loading={personalizing}
                  icon={plan === 'free' ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                >
                  {plan === 'free' ? 'Upgrade to Personalize' : 'AI Personalize'}
                </Button>
              </div>
            )}

            {plan === 'free' && (
              <p className="text-white/30 text-xs">
                <button onClick={() => setShowUpgrade(true)} className="text-teal-400 hover:underline">Upgrade to Pro</button>{' '}
                to have AI personalize guides with your specific debt details, creditor name, and situation context.
              </p>
            )}

            {/* Script Text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white/70 text-xs font-medium">
                  {personalizedScript ? '✨ AI-Personalized Guide' : 'Reference Guide'}
                </h4>
                <Button size="sm" variant="secondary" onClick={copyScript} icon={copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="bg-navy-200 border border-white/10 rounded-xl p-4 max-h-80 overflow-auto scrollbar-thin">
                <pre className="text-white/75 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                  {personalizedScript || selectedScript.script}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className={cn('badge', CHANNEL_COLORS[selectedScript.channel])}>
                  {selectedScript.channel === 'phone' ? '📞 Phone Call' : selectedScript.channel === 'email' ? '📧 Email' : '📄 Letter'}
                </span>
              </div>
              <Link href="/chat">
                <Button size="sm" variant="secondary" icon={<ChevronRight className="w-4 h-4" />}>
                  Ask Research Assistant
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} trigger="script" />
    </div>
  )
}
