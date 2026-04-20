'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, getDebtStatusColor, getDebtStatusLabel, getDebtTypeLabel } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { DebtForm } from './DebtForm'
import { UpgradeModal } from '@/components/UpgradeModal'
import { GoogleAd } from '@/components/GoogleAd'
import {
  TrendingDown, MessageSquare, FileText, Plus, ArrowRight,
  CreditCard, AlertCircle, CheckCircle2, ChevronRight, Target,
  BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Debt, User } from '@/types'

interface Props {
  profile: User | null
  debts: Debt[]
  conversations: Array<{ id: string; title?: string; created_at: string }>
  letters: Array<{ id: string; letter_type: string; creditor_name: string; created_at: string }>
  userId: string
}

export function DebtDashboard({ profile, debts, conversations, letters, userId }: Props) {
  const [showAddDebt, setShowAddDebt] = useState(false)
  const [localDebts, setLocalDebts] = useState(debts)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const isFree = profile?.plan === 'free'

  const totalOriginal = localDebts.reduce((sum, d) => sum + d.original_amount, 0)
  const totalBalance = localDebts.reduce((sum, d) => sum + d.current_balance, 0)
  const totalReduced = totalOriginal - totalBalance
  const reductionPct = totalOriginal > 0 ? Math.round((totalReduced / totalOriginal) * 100) : 0
  const activeDebts = localDebts.filter(d => !['paid', 'closed'].includes(d.status))
  const settledDebts = localDebts.filter(d => d.status === 'settled' || d.status === 'paid')

  const handleDebtAdded = (newDebt: Debt) => {
    setLocalDebts(prev => [newDebt, ...prev])
    setShowAddDebt(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">Here&apos;s your debt reduction overview</p>
        </div>
        <Button onClick={() => setShowAddDebt(true)} icon={<Plus className="w-4 h-4" />}>
          Add Debt
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-white/50 text-xs">Total Owed</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalBalance)}</p>
          <p className="text-white/30 text-xs mt-1">{localDebts.length} debt{localDebts.length !== 1 ? 's' : ''} tracked</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-teal-400/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-white/50 text-xs">Total Reduced</span>
          </div>
          <p className="text-2xl font-bold text-teal-400">{formatCurrency(totalReduced)}</p>
          <p className="text-white/30 text-xs mt-1">{reductionPct}% of original debt</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="text-white/50 text-xs">Active Debts</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeDebts.length}</p>
          <p className="text-white/30 text-xs mt-1">In negotiation</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-white/50 text-xs">Resolved</span>
          </div>
          <p className="text-2xl font-bold text-white">{settledDebts.length}</p>
          <p className="text-white/30 text-xs mt-1">Settled or paid</p>
        </div>
      </div>

      {/* Progress Bar */}
      {totalOriginal > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Debt Reduction Progress</h3>
            <span className="text-teal-400 text-sm font-bold">{reductionPct}% reduced</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-300 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(reductionPct, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/30">
            <span>Started: {formatCurrency(totalOriginal)}</span>
            <span>Remaining: {formatCurrency(totalBalance)}</span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Debts List - takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Your Debts</h2>
            <button onClick={() => setShowAddDebt(true)} className="text-teal-400 hover:text-teal-300 text-xs flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {localDebts.length === 0 ? (
            <div className="card text-center py-12">
              <CreditCard className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 mb-4">No debts tracked yet</p>
              <Button onClick={() => setShowAddDebt(true)} size="sm" icon={<Plus className="w-4 h-4" />}>
                Add Your First Debt
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {localDebts.map((debt) => (
                <DebtCard key={debt.id} debt={debt} onUpdate={(updated) => {
                  setLocalDebts(prev => prev.map(d => d.id === updated.id ? updated : d))
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-white font-semibold text-sm mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/chat" className="flex items-center gap-3 p-3 rounded-xl bg-teal-400/10 border border-teal-400/20 hover:bg-teal-400/15 transition-all group">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <div className="flex-1">
                  <p className="text-white text-xs font-medium">AI Coach Chat</p>
                  <p className="text-white/40 text-xs">Get negotiation advice</p>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/letters" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 transition-all group">
                <FileText className="w-4 h-4 text-white/50" />
                <div className="flex-1">
                  <p className="text-white text-xs font-medium">Dispute Letter</p>
                  <p className="text-white/40 text-xs">Generate in seconds</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/scripts" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 border border-white/10 transition-all group">
                <BookOpen className="w-4 h-4 text-white/50" />
                <div className="flex-1">
                  <p className="text-white text-xs font-medium">Script Library</p>
                  <p className="text-white/40 text-xs">Phone & email scripts</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          {(conversations.length > 0 || letters.length > 0) && (
            <div className="card">
              <h3 className="text-white font-semibold text-sm mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {conversations.slice(0, 3).map((conv) => (
                  <Link key={conv.id} href={`/chat?id=${conv.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs truncate">{conv.title || 'AI Chat Session'}</p>
                      <p className="text-white/30 text-xs">{formatDate(conv.created_at)}</p>
                    </div>
                  </Link>
                ))}
                {letters.slice(0, 2).map((letter) => (
                  <Link key={letter.id} href="/letters" className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all">
                    <FileText className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-xs truncate">{letter.creditor_name} — {letter.letter_type.replace(/_/g, ' ')}</p>
                      <p className="text-white/30 text-xs">{formatDate(letter.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Upgrade Banner for Free */}
          {isFree && (
            <div className="bg-gradient-to-br from-teal-400/20 to-navy-50 border border-teal-400/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full font-semibold">PRO</span>
                <h3 className="text-white font-semibold text-sm">Unlock Everything</h3>
              </div>
              <ul className="text-white/50 text-xs mb-3 space-y-1">
                <li>✓ Unlimited AI coaching messages</li>
                <li>✓ Unlimited dispute & debt letters</li>
                <li>✓ PDF downloads + personalized scripts</li>
              </ul>
              <Button size="sm" className="w-full" onClick={() => setShowUpgrade(true)}>
                Upgrade to Pro — from $6.58/mo
              </Button>
            </div>
          )}

          {/* Google Ad — free users only */}
          {isFree && (
            <GoogleAd
              slot="XXXXXXXXXX"
              format="rectangle"
              className="rounded-xl overflow-hidden"
            />
          )}
        </div>
      </div>

      {/* Add Debt Modal */}
      <Modal isOpen={showAddDebt} onClose={() => setShowAddDebt(false)} title="Add New Debt" size="lg">
        <DebtForm userId={userId} onSuccess={handleDebtAdded} onCancel={() => setShowAddDebt(false)} />
      </Modal>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} trigger="debt" />
    </div>
  )
}

function DebtCard({ debt, onUpdate }: { debt: Debt; onUpdate: (d: Debt) => void }) {
  const [showEdit, setShowEdit] = useState(false)
  const reductionPct = debt.original_amount > 0
    ? Math.round(((debt.original_amount - debt.current_balance) / debt.original_amount) * 100)
    : 0

  return (
    <>
      <div className="card-hover" onClick={() => setShowEdit(true)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold text-sm truncate">{debt.creditor_name}</h3>
              <span className={cn('badge text-xs', getDebtStatusColor(debt.status))}>
                {getDebtStatusLabel(debt.status)}
              </span>
            </div>
            <p className="text-white/40 text-xs mb-3">{getDebtTypeLabel(debt.debt_type)} · {debt.days_past_due} days past due</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-white/40 text-xs">Balance</p>
                <p className="text-white font-semibold text-sm">{formatCurrency(debt.current_balance)}</p>
              </div>
              <div>
                <p className="text-white/40 text-xs">Original</p>
                <p className="text-white/60 text-sm">{formatCurrency(debt.original_amount)}</p>
              </div>
              {reductionPct > 0 && (
                <div>
                  <p className="text-white/40 text-xs">Saved</p>
                  <p className="text-teal-400 text-sm font-semibold">{reductionPct}%</p>
                </div>
              )}
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 mt-1 flex-shrink-0" />
        </div>
        {debt.notes && (
          <p className="text-white/30 text-xs mt-3 pt-3 border-t border-white/10 truncate">{debt.notes}</p>
        )}
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Debt" size="lg">
        <DebtForm
          userId={debt.user_id}
          debt={debt}
          onSuccess={(updated) => { onUpdate(updated); setShowEdit(false) }}
          onCancel={() => setShowEdit(false)}
        />
      </Modal>
    </>
  )
}
