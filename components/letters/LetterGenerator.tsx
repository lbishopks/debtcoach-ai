'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { UpgradeModal } from '@/components/UpgradeModal'
import { cn, formatDate } from '@/lib/utils'
import {
  FileText, Sparkles, CheckCheck, CheckCircle,
  ChevronRight, Zap, Copy, Download, Printer, Mail,
  ExternalLink, AlertTriangle,
  Scale, Ban, Heart, CreditCard, Shield,
  UserX, Clock, Flag, DollarSign, Trash2, Hospital, Skull
} from 'lucide-react'
import toast from 'react-hot-toast'
import { downloadLetterPDF } from '@/lib/pdf'

const LETTER_CATEGORIES = [
  {
    category: 'Core Rights',
    letters: [
      { value: 'validation', label: 'Debt Validation', icon: Shield, description: 'Demand proof the debt is legitimate (FDCPA § 1692g)', badge: 'Send First' },
      { value: 'dispute', label: 'Debt Dispute', icon: Scale, description: 'Challenge validity or accuracy (FDCPA + FCRA)', badge: null },
      { value: 'cease_desist', label: 'Cease & Desist', icon: Ban, description: 'Stop all collector contact immediately (§ 1692c)', badge: 'Powerful' },
      { value: 'statute_of_limitations', label: 'SOL Defense', icon: Clock, description: 'Invoke time-barred debt defense under state law', badge: null },
      { value: 'fdcpa_violation', label: 'FDCPA Violation Notice', icon: Flag, description: 'Document violations — worth $1,000/violation in court', badge: 'Legal' },
    ]
  },
  {
    category: 'Negotiation',
    letters: [
      { value: 'debt_settlement', label: 'Settlement Offer', icon: DollarSign, description: 'Formal written offer to settle for less than owed', badge: null },
      { value: 'pay_for_delete', label: 'Pay-for-Delete', icon: Trash2, description: 'Pay in exchange for full credit bureau removal', badge: 'High Value' },
      { value: 'payment_plan', label: 'Payment Plan Proposal', icon: CreditCard, description: 'Propose a manageable monthly payment schedule', badge: null },
      { value: 'hardship', label: 'Hardship / Forbearance', icon: Heart, description: 'Request deferment or reduced payments due to hardship', badge: null },
      { value: 'goodwill', label: 'Goodwill Deletion', icon: Heart, description: 'Ask creditor to remove negative mark as goodwill', badge: null },
    ]
  },
  {
    category: 'Credit Repair',
    letters: [
      { value: 'original_creditor_dispute', label: 'Original Creditor Dispute', icon: FileText, description: 'Dispute inaccurate reporting directly with furnisher (FCRA § 1681s-2)', badge: null },
      { value: 'delete_after_payment', label: 'Delete After Payment', icon: CheckCheck, description: 'Request deletion for already-paid or settled accounts', badge: null },
      { value: 'medical_debt', label: 'Medical Debt Dispute', icon: Hospital, description: 'Challenge billing errors + new CFPB 2025 rules', badge: 'New Law' },
    ]
  },
  {
    category: 'Fraud & Identity',
    letters: [
      { value: 'identity_theft', label: 'Identity Theft Dispute', icon: UserX, description: 'Dispute fraudulent accounts (FCRA + FTC provisions)', badge: 'Urgent' },
      { value: 'account_not_mine', label: 'Account Not Mine', icon: Skull, description: 'Dispute accounts opened without your authorization', badge: null },
    ]
  },
]

const ALL_LETTERS = LETTER_CATEGORIES.flatMap(c => c.letters)

const DISPUTE_REASONS = [
  { value: 'not_mine', label: 'This debt is not mine' },
  { value: 'wrong_amount', label: 'The amount is incorrect' },
  { value: 'past_sol', label: 'Debt is past the statute of limitations' },
  { value: 'identity_theft', label: 'Identity theft / fraud' },
  { value: 'already_paid', label: 'This debt has already been paid' },
  { value: 'discharged', label: 'Debt was discharged in bankruptcy' },
  { value: 'not_authorized', label: 'Collector not authorized to collect' },
  { value: 'credit_error', label: 'Incorrect credit bureau reporting' },
  { value: 'insurance_paid', label: 'Insurance should have covered this' },
  { value: 'no_contract', label: 'No signed contract / agreement exists' },
  { value: 'other', label: 'Other reason' },
]

const FDCPA_VIOLATIONS = [
  { value: 'calling_times', label: 'Called before 8am or after 9pm' },
  { value: 'calling_workplace', label: 'Called at work after I said not to' },
  { value: 'harassment', label: 'Harassment or abusive language' },
  { value: 'threats', label: 'Illegal threats (arrest, lawsuit, etc.)' },
  { value: 'false_info', label: 'Gave false information about the debt' },
  { value: 'third_party', label: 'Disclosed debt info to third parties' },
  { value: 'after_cease', label: 'Continued contact after cease & desist' },
  { value: 'no_validation', label: 'Continued collecting after validation request' },
  { value: 'multiple', label: 'Multiple violations occurred' },
]

// ── Quick Templates ─────────────────────────────────────────────────────────
const QUICK_TEMPLATES = [
  {
    id: 'first_notice_response',
    label: 'Respond to First Notice',
    emoji: '📬',
    description: 'Got your first letter from a collector? Start here.',
    letterType: 'validation',
    disputeReason: 'not_mine',
    additionalDetails: 'I received your collection notice and am exercising my right to request validation of this debt before making any payment or acknowledgment.',
  },
  {
    id: 'not_my_debt',
    label: 'Dispute — Not My Debt',
    emoji: '🚫',
    description: 'Account opened fraudulently or belongs to someone else.',
    letterType: 'account_not_mine',
    disputeReason: 'not_mine',
    additionalDetails: 'I have no knowledge of this account and did not authorize its opening. This may be a case of identity theft or a mixed credit file.',
  },
  {
    id: 'stop_all_calls',
    label: 'Stop All Calls & Contact',
    emoji: '📵',
    description: 'Make all contact illegal immediately under FDCPA § 1692c.',
    letterType: 'cease_desist',
    disputeReason: '',
    additionalDetails: 'You are hereby ordered to cease all communication with me regarding this alleged debt via phone, mail, email, or any other method.',
  },
  {
    id: 'debt_too_old',
    label: 'Debt Is Too Old (SOL)',
    emoji: '⏰',
    description: 'Debt past your state\'s statute of limitations.',
    letterType: 'statute_of_limitations',
    disputeReason: 'past_sol',
    additionalDetails: 'This debt appears to be time-barred under applicable state law. Attempting to collect on or sue for a time-barred debt may violate the FDCPA.',
  },
  {
    id: 'settle_for_less',
    label: 'Settle for Less',
    emoji: '🤝',
    description: 'Make a formal written settlement offer.',
    letterType: 'debt_settlement',
    disputeReason: '',
    additionalDetails: 'Due to financial hardship I am unable to pay the full balance but am prepared to offer a lump-sum settlement to resolve this matter.',
  },
  {
    id: 'collector_harassing',
    label: 'Collector Is Harassing Me',
    emoji: '⚖️',
    description: 'Document FDCPA violations worth $1,000 each in court.',
    letterType: 'fdcpa_violation',
    disputeReason: '',
    additionalDetails: 'Your collection practices have violated my rights under the Fair Debt Collection Practices Act. I am documenting these violations and reserving all legal remedies.',
  },
  {
    id: 'medical_bill_dispute',
    label: 'Dispute Medical Bill',
    emoji: '🏥',
    description: 'Challenge billing errors and insurance discrepancies.',
    letterType: 'medical_debt',
    disputeReason: 'wrong_amount',
    additionalDetails: 'I am disputing this medical bill and requesting an itemized statement, proof of insurance processing, and documentation that all No Surprises Act requirements were met.',
  },
  {
    id: 'already_paid',
    label: 'Already Paid — Remove It',
    emoji: '✅',
    description: 'Paid or settled? Get the negative mark deleted.',
    letterType: 'delete_after_payment',
    disputeReason: 'already_paid',
    additionalDetails: 'This account has been fully paid/settled. Continued negative reporting of a resolved account serves no legitimate purpose and I am requesting its deletion.',
  },
]

interface Letter {
  id: string
  letter_type: string
  content: string
  creditor_name: string
  created_at: string
}

interface Props {
  plan: string
  state: string
  debts: Array<{ id: string; creditor_name: string; current_balance: number; status: string }>
  savedLetters: Letter[]
}

// ── Pre-Generation Disclaimer Modal ──────────────────────────────────────────
function DisclaimerModal({ onAccept, onClose }: { onAccept: () => void; onClose: () => void }) {
  const [checked, setChecked] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1624] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Before You Generate</h2>
          </div>
          <p className="text-white/40 text-sm mt-1">Please read and acknowledge the following.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-white/4 border border-white/10 rounded-xl p-4 space-y-2 text-xs text-white/50 leading-relaxed">
            <p><strong className="text-white/70">Not Legal Advice.</strong> These letter templates are for educational and informational purposes only. DebtCoach AI is not a law firm and does not provide legal or financial advice.</p>
            <p><strong className="text-white/70">No Attorney-Client Relationship.</strong> Using this tool does not create an attorney-client relationship. Results are not guaranteed.</p>
            <p><strong className="text-white/70">Use at Your Own Risk.</strong> Review all letters carefully before sending. For legal matters, consult a licensed attorney in your state.</p>
          </div>
          <button onClick={() => setChecked(c => !c)}
            className={`w-full text-left flex gap-3 p-4 rounded-xl border transition-all ${checked ? 'border-teal-400/40 bg-teal-400/8' : 'border-white/10 bg-white/3 hover:border-white/20'}`}>
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${checked ? 'bg-teal-400 border-teal-400' : 'border-white/25 bg-transparent'}`}>
              {checked && <CheckCheck className="w-3 h-3 text-[#0a0f1a]" />}
            </div>
            <p className={`text-sm font-medium transition-colors leading-snug ${checked ? 'text-teal-300' : 'text-white/80'}`}>
              I understand this is not legal or financial advice, these are educational templates only, and I use them at my own risk.
            </p>
          </button>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/6 text-white/60 hover:text-white text-sm font-medium transition-all hover:bg-white/10">Cancel</button>
          <button onClick={onAccept} disabled={!checked}
            className="flex-1 py-3 rounded-xl bg-teal-400 text-[#0a0f1a] font-bold text-sm transition-all hover:bg-teal-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Generate Letter
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Approval Modal ────────────────────────────────────────────────────────────
function ApprovalModal({ onApprove, onClose }: { onApprove: () => void; onClose: () => void }) {
  const [checks, setChecks] = useState({ own: false, reviewed: false, agreed: false })
  const allChecked = checks.own && checks.reviewed && checks.agreed
  const toggle = (k: keyof typeof checks) => setChecks(p => ({ ...p, [k]: !p[k] }))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1624] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-teal-400/15 flex items-center justify-center">
              <FileText className="w-4 h-4 text-teal-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Approve Your Letter</h2>
          </div>
          <p className="text-white/40 text-sm">Please confirm the following before finalizing.</p>
        </div>
        <div className="p-6 space-y-4">
          {[
            { key: 'own' as const, label: 'This is my letter', detail: 'I confirm this letter was created for use in my own personal situation and will be sent under my name.' },
            { key: 'reviewed' as const, label: 'I have reviewed and approve the content', detail: 'I have read this letter in full, made all desired edits, and approve it as ready to send.' },
            { key: 'agreed' as const, label: 'I agree to the terms I previously accepted', detail: 'This includes the Privacy Policy. I understand DebtCoach AI is not a law firm and this letter is not legal advice.' },
          ].map(({ key, label, detail }) => (
            <button key={key} onClick={() => toggle(key)}
              className={`w-full text-left flex gap-3 p-4 rounded-xl border transition-all ${checks[key] ? 'border-teal-400/40 bg-teal-400/8' : 'border-white/10 bg-white/3 hover:border-white/20'}`}>
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${checks[key] ? 'bg-teal-400 border-teal-400' : 'border-white/25 bg-transparent'}`}>
                {checks[key] && <CheckCheck className="w-3 h-3 text-[#0a0f1a]" />}
              </div>
              <div>
                <p className={`text-sm font-medium transition-colors ${checks[key] ? 'text-teal-300' : 'text-white/80'}`}>{label}</p>
                <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{detail}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/6 text-white/60 hover:text-white text-sm font-medium transition-all hover:bg-white/10">Cancel</button>
          <button onClick={onApprove} disabled={!allChecked}
            className="flex-1 py-3 rounded-xl bg-teal-400 text-[#0a0f1a] font-bold text-sm transition-all hover:bg-teal-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" /> Approve & Finalize
          </button>
        </div>
      </div>
    </div>
  )
}

export function LetterGenerator({ plan, state, debts, savedLetters: initialLetters }: Props) {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')
  const [letterType, setLetterType] = useState('validation')
  const [creditorName, setCreditorName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [debtId, setDebtId] = useState('')
  const [disputeReason, setDisputeReason] = useState('not_mine')
  const [fdcpaViolation, setFdcpaViolation] = useState('')
  const [settlementOffer, setSettlementOffer] = useState('')
  const [contactDates, setContactDates] = useState('')
  const [additionalDetails, setAdditionalDetails] = useState('')
  // Letter output state
  const [generatedLetter, setGeneratedLetter] = useState('')
  const [letterId, setLetterId] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [approved, setApproved] = useState(false)
  const [showApproval, setShowApproval] = useState(false)
  const [copied, setCopied] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)
  const [letters, setLetters] = useState<Letter[]>(initialLetters)

  const currentLetterDef = ALL_LETTERS.find(l => l.value === letterType)

  const handleDebtSelect = (id: string) => {
    setDebtId(id)
    if (id) {
      const debt = debts.find(d => d.id === id)
      if (debt) { setCreditorName(debt.creditor_name); setAmount(debt.current_balance.toString()) }
    }
  }

  const needsDisputeReason = ['dispute', 'validation', 'original_creditor_dispute', 'account_not_mine', 'identity_theft'].includes(letterType)
  const needsFdcpa = letterType === 'fdcpa_violation'
  const needsSettlement = ['debt_settlement', 'pay_for_delete'].includes(letterType)
  const needsDates = ['fdcpa_violation', 'cease_desist', 'statute_of_limitations'].includes(letterType)

  const handleGenerateClick = () => {
    if (!creditorName.trim()) { toast.error('Please enter the creditor or collector name'); return }
    if (!disclaimerAccepted) { setShowDisclaimer(true); return }
    handleGenerate()
  }

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true)
    setShowDisclaimer(false)
    handleGenerate()
  }

  const handleGenerate = async () => {
    if (!creditorName.trim()) { toast.error('Please enter the creditor or collector name'); return }
    setLoading(true)
    setGeneratedLetter('')
    setApproved(false)
    setDirty(false)
    setLetterId(null)
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterType, creditorName, accountNumber, debtId: debtId || null, disputeReason, additionalDetails, amount, state, fdcpaViolations: fdcpaViolation, settlementOffer, contactDates }),
      })
      if (res.status === 429) { setShowUpgrade(true); return }
      if (!res.ok) {
        let errMsg = `Generation failed (${res.status})`
        try {
          const errData = await res.json()
          if (errData.message) errMsg = errData.message
          else if (typeof errData.error === 'string') errMsg = errData.error
        } catch {}
        throw new Error(errMsg)
      }
      const data = await res.json()
      if (!data.content) throw new Error('No letter content returned — please try again')
      setGeneratedLetter(data.content)
      setLetterId(data.letterId || null)
      toast.success('Letter generated — review and edit below')
      if (data.letterId) {
        setLetters(prev => [{ id: data.letterId, letter_type: letterType, content: data.content, creditor_name: creditorName, created_at: new Date().toISOString() }, ...prev])
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate letter')
    } finally { setLoading(false) }
  }

  const handleApprove = () => { setApproved(true); setShowApproval(false); toast.success('Letter approved — ready to use!') }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  const handleDownload = async () => {
    try { await downloadLetterPDF(generatedLetter, letterType, creditorName); toast.success('PDF downloaded!') }
    catch { toast.error('Failed to generate PDF') }
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${creditorName || 'Letter'}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Times New Roman',Times,serif;font-size:12pt;color:#000;background:#fff}.page{width:8.5in;min-height:11in;margin:0 auto;padding:1in}pre{white-space:pre-wrap;word-wrap:break-word;font-family:inherit;font-size:12pt;line-height:1.6}@media print{body{margin:0}.page{padding:1in;width:100%}}</style>
</head><body><div class="page"><pre>${generatedLetter.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>
<script>window.onload=function(){window.print()}<\/script></body></html>`)
    win.document.close()
  }

  const handleEmail = async () => {
    setEmailing(true)
    try {
      const res = await fetch('/api/email-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ letterContent: generatedLetter, letterTitle: currentLetterDef?.label || letterType }) })
      if (!res.ok) throw new Error()
      toast.success('Letter emailed to you!')
    } catch { toast.error('Failed to send email') }
    finally { setEmailing(false) }
  }

  // Save edits back to DB
  const handleSaveEdit = async (content: string) => {
    if (!letterId) return
    setGeneratedLetter(content)
    setDirty(true)
    setApproved(false)
    try {
      await fetch(`/api/letters/${letterId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
    } catch { /* silent — not critical */ }
  }

  const applyTemplate = (tpl: typeof QUICK_TEMPLATES[0]) => {
    setLetterType(tpl.letterType)
    if (tpl.disputeReason) setDisputeReason(tpl.disputeReason)
    setAdditionalDetails(tpl.additionalDetails)
    setGeneratedLetter(''); setApproved(false); setLetterId(null)
    toast.success(`Template loaded: ${tpl.label}`)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {showDisclaimer && <DisclaimerModal onAccept={handleDisclaimerAccept} onClose={() => setShowDisclaimer(false)} />}
      {showApproval && <ApprovalModal onApprove={handleApprove} onClose={() => setShowApproval(false)} />}
      <div className="mb-4">
        <h1 className="section-header">Dispute Letter Center</h1>
        <p className="section-subheader">AI-generated letter templates — educational use only, not legal advice</p>
      </div>

      {/* Subtle legal note */}
      <p className="mb-5 text-white/30 text-xs">
        ⚖️ Educational templates only — not legal advice. Review with an attorney before sending.
      </p>

      <div className="flex gap-2 mb-6 border-b border-white/10">
        {(['generate', 'history'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('pb-3 px-1 text-sm font-medium border-b-2 -mb-px capitalize transition-colors',
              activeTab === tab ? 'border-teal-400 text-teal-300' : 'border-transparent text-white/40 hover:text-white/70')}>
            {tab === 'generate' ? '✦ Generate Letter' : `History (${letters.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'generate' && (
        <>
        {/* Quick Templates */}
        <div className="mb-6">
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> Quick Templates — click to pre-fill
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_TEMPLATES.map(tpl => (
              <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                className="text-left p-3 rounded-xl border border-white/10 bg-white/3 hover:border-teal-400/40 hover:bg-teal-400/5 transition-all group">
                <div className="text-lg mb-1">{tpl.emoji}</div>
                <p className="text-white/80 text-xs font-semibold group-hover:text-teal-300 transition-colors leading-tight">{tpl.label}</p>
                <p className="text-white/30 text-[10px] mt-1 leading-tight">{tpl.description}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="grid xl:grid-cols-5 gap-6">
          {/* Letter Type Picker */}
          <div className="xl:col-span-2 space-y-5">
            {LETTER_CATEGORIES.map(cat => (
              <div key={cat.category}>
                <h3 className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2 px-1">{cat.category}</h3>
                <div className="space-y-1.5">
                  {cat.letters.map(letter => {
                    const Icon = letter.icon; const isActive = letterType === letter.value
                    return (
                      <button key={letter.value} onClick={() => { setLetterType(letter.value); setGeneratedLetter('') }}
                        className={cn('w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                          isActive ? 'border-teal-400/50 bg-teal-400/10' : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5')}>
                        <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-teal-400' : 'text-white/30')} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={cn('text-sm font-medium', isActive ? 'text-teal-300' : 'text-white/80')}>{letter.label}</p>
                            {letter.badge && (
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold',
                                letter.badge === 'Urgent' || letter.badge === 'Legal' ? 'bg-red-500/20 text-red-300' :
                                letter.badge === 'High Value' || letter.badge === 'Powerful' ? 'bg-yellow-500/20 text-yellow-300' :
                                letter.badge === 'New Law' ? 'bg-purple-500/20 text-purple-300' :
                                'bg-teal-500/20 text-teal-300')}>{letter.badge}</span>
                            )}
                          </div>
                          <p className="text-white/30 text-xs leading-tight mt-0.5">{letter.description}</p>
                        </div>
                        {isActive && <ChevronRight className="w-4 h-4 text-teal-400 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="xl:col-span-1">
            <div className="card space-y-3 sticky top-6">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" /> Letter Details
              </h3>
              {debts.length > 0 && (
                <Select label="Link to tracked debt" value={debtId} onChange={(e) => handleDebtSelect(e.target.value)}
                  options={[{ value: '', label: 'Manual entry...' }, ...debts.map(d => ({ value: d.id, label: `${d.creditor_name} — $${d.current_balance.toLocaleString()}` }))]} />
              )}
              <Input label="Creditor / Collector *" placeholder="e.g. Midland Credit Mgmt" value={creditorName} onChange={(e) => setCreditorName(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input label="Account #" placeholder="****1234" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                <Input label="Balance ($)" type="number" placeholder="5000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              {needsDisputeReason && <Select label="Dispute Reason" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} options={DISPUTE_REASONS} />}
              {needsFdcpa && <Select label="FDCPA Violation" value={fdcpaViolation} onChange={(e) => setFdcpaViolation(e.target.value)} options={[{ value: '', label: 'Select violation...' }, ...FDCPA_VIOLATIONS]} />}
              {needsSettlement && (
                <div>
                  <Input label={letterType === 'pay_for_delete' ? 'Offer Amount ($)' : 'Settlement Offer ($)'} type="number"
                    placeholder={amount ? String(Math.round(Number(amount) * 0.4)) : '2000'}
                    value={settlementOffer} onChange={(e) => setSettlementOffer(e.target.value)} />
                  {amount && <p className="text-white/30 text-xs mt-1">Range: ${Math.round(Number(amount) * 0.25).toLocaleString()}–${Math.round(Number(amount) * 0.50).toLocaleString()} (25–50%)</p>}
                </div>
              )}
              {needsDates && <Input label="Date(s) of Violation / Contact" placeholder="e.g. Jan 5 2025 at 6:30am" value={contactDates} onChange={(e) => setContactDates(e.target.value)} />}
              <Textarea label="Additional Details" placeholder="Prior correspondence, key dates, specific circumstances..." value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)} rows={3} />
              <Button onClick={handleGenerateClick} loading={loading} className="w-full" icon={<Sparkles className="w-4 h-4" />}>
                Generate {currentLetterDef?.label}
              </Button>
              {plan === 'free' && <p className="text-white/30 text-xs text-center">Free: 1/month · <Link href="/account?tab=billing" className="text-teal-400">Go Pro</Link></p>}
            </div>
          </div>

          {/* Output — inline edit + approve */}
          <div className="xl:col-span-2 flex flex-col gap-3">

            {/* Header row */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">
                {generatedLetter ? (approved ? '✓ Letter Approved' : 'Review & Edit Your Letter') : 'Generated Letter'}
              </h3>
              <div className="flex items-center gap-2">
                {generatedLetter && letterId && (
                  <Link href={`/letters/${letterId}`} className="text-white/30 hover:text-teal-400 text-xs transition-colors flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Full editor
                  </Link>
                )}
                {generatedLetter && !approved && (
                  <button onClick={() => setShowApproval(true)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-400 text-[#0a0f1a] font-bold text-xs hover:bg-teal-300 transition-all">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve & Finalize
                  </button>
                )}
                {approved && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-400/15 border border-teal-400/30 text-teal-400 text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Approved
                  </div>
                )}
              </div>
            </div>

            {/* Status hint */}
            {generatedLetter && !approved && (
              <div className="flex items-center gap-2 bg-white/4 border border-white/10 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                <p className="text-white/40 text-xs">
                  Fill in any <strong className="text-white/55">[BRACKETED]</strong> fields, make any edits, then click <strong className="text-white/55">Approve & Finalize</strong> to unlock copy, download, and print.
                </p>
              </div>
            )}

            {/* Approved action bar */}
            {approved && (
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/8 text-white/70 hover:text-white text-xs font-medium transition-all">
                  {copied ? <CheckCheck className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/8 text-white/70 hover:text-white text-xs font-medium transition-all">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/8 text-white/70 hover:text-white text-xs font-medium transition-all">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button onClick={handleEmail} disabled={emailing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-400/15 text-teal-400 hover:bg-teal-400/25 text-xs font-medium transition-all disabled:opacity-50">
                  <Mail className="w-3.5 h-3.5" /> Email Me
                </button>
              </div>
            )}

            {/* Letter content */}
            {!generatedLetter && !loading && (
              <div className="bg-white/5 border border-white/10 rounded-2xl min-h-[520px] p-5 flex flex-col items-center justify-center text-center">
                <FileText className="w-10 h-10 text-white/15 mb-3" />
                <p className="text-white/30 text-sm font-medium">{currentLetterDef?.label}</p>
                <p className="text-white/20 text-xs mt-1 max-w-48 leading-relaxed">{currentLetterDef?.description}</p>
                <p className="text-white/12 text-xs mt-6 max-w-xs leading-relaxed">Your letter will appear here — edit it, then approve before use.</p>
              </div>
            )}

            {loading && (
              <div className="bg-white/5 border border-white/10 rounded-2xl min-h-[520px] p-5 flex flex-col items-center justify-center">
                <div className="typing-indicator flex gap-2 justify-center mb-3"><span /><span /><span /></div>
                <p className="text-white/40 text-sm">Generating your letter…</p>
              </div>
            )}

            {generatedLetter && (
              <div className="relative">
                <textarea
                  value={generatedLetter}
                  onChange={e => handleSaveEdit(e.target.value)}
                  readOnly={approved}
                  className={cn(
                    'w-full min-h-[560px] rounded-xl p-8 text-sm font-mono leading-relaxed resize-none focus:outline-none shadow-inner',
                    approved
                      ? 'bg-white/5 border border-teal-400/20 text-white/70 cursor-default'
                      : 'bg-white text-gray-900 focus:ring-2 focus:ring-teal-400/50'
                  )}
                  spellCheck
                  placeholder="Letter content will appear here…"
                />
                {generatedLetter.includes('[') && !approved && (
                  <div className="absolute bottom-3 right-3">
                    <div className="bg-amber-500/90 text-[#0a0f1a] text-xs font-bold px-2.5 py-1.5 rounded-lg">
                      Fill in [BRACKETED] fields
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SOL / settlement tips */}
            {generatedLetter && letterType === 'statute_of_limitations' && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-300/80 text-xs"><strong>⚠️ Critical:</strong> Do NOT make any payment or promise to pay — in most states this restarts the SOL clock.</p>
              </div>
            )}
            {generatedLetter && letterType === 'debt_settlement' && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-blue-300/80 text-xs"><strong>💡 Tax note:</strong> Forgiven debt over $600 may generate a 1099-C. Consult a tax advisor if you are insolvent.</p>
              </div>
            )}

            <p className="text-white/20 text-xs">⚖️ Educational template only — not legal advice. Send via USPS Certified Mail with Return Receipt.</p>
          </div>
        </div>
        </>
      )}

      {activeTab === 'history' && (
        <div>
          {letters.length === 0 ? (
            <div className="card text-center py-16">
              <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 mb-2">No letters generated yet</p>
              <Button onClick={() => setActiveTab('generate')} size="sm">Generate Your First Letter</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {letters.map((letter) => {
                const def = ALL_LETTERS.find(l => l.value === letter.letter_type)
                const Icon = def?.icon || FileText
                return (
                  <Link key={letter.id} href={`/letters/${letter.id}`} className="card-hover block group">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-400/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{letter.creditor_name}</p>
                        <p className="text-white/40 text-xs mt-0.5">{def?.label || letter.letter_type.replace(/_/g, ' ')} · {formatDate(letter.created_at)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-teal-400 transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                    <p className="text-white/25 text-xs line-clamp-2">{letter.content.substring(0, 120)}…</p>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} trigger="letter" />
    </div>
  )
}
