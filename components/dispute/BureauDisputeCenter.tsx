'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { UpgradeModal } from '@/components/UpgradeModal'
import { cn } from '@/lib/utils'
import {
  Building2, Copy, Download, CheckCircle2, AlertCircle, ExternalLink,
  Clock, Mail, Shield, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'

interface Debt {
  id: string
  creditor_name?: string
  balance?: number
  debt_type?: string
}

interface BureauDisputeCenterProps {
  plan?: string
  state?: string
  debts?: Debt[]
}

const BUREAUS = [
  {
    id: 'equifax',
    name: 'Equifax',
    color: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    accent: 'text-red-400',
    abbr: 'EQ',
    abbrevColor: 'bg-red-500/20 text-red-300',
    address: 'Equifax Information Services LLC\nP.O. Box 7404256\nAtlanta, GA 30374-0256',
    portal: 'https://dispute.equifax.com',
    portalLabel: 'dispute.equifax.com',
  },
  {
    id: 'experian',
    name: 'Experian',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
    abbr: 'EX',
    abbrevColor: 'bg-blue-500/20 text-blue-300',
    address: 'Experian\nP.O. Box 4500\nAllen, TX 75013',
    portal: 'https://www.experian.com/disputes/main.html',
    portalLabel: 'experian.com/disputes',
  },
  {
    id: 'transunion',
    name: 'TransUnion',
    color: 'from-indigo-500/20 to-indigo-600/10',
    border: 'border-indigo-500/30',
    accent: 'text-indigo-400',
    abbr: 'TU',
    abbrevColor: 'bg-indigo-500/20 text-indigo-300',
    address: 'TransUnion LLC\nConsumer Dispute Center\nP.O. Box 2000\nChester, PA 19016',
    portal: 'https://dispute.transunion.com',
    portalLabel: 'dispute.transunion.com',
  },
  {
    id: 'all',
    name: 'All Three Bureaus',
    color: 'from-teal-500/20 to-teal-600/10',
    border: 'border-teal-500/30',
    accent: 'text-teal-400',
    abbr: 'ALL',
    abbrevColor: 'bg-teal-500/20 text-teal-300',
    address: 'Send to all three bureaus simultaneously',
    portal: 'https://www.annualcreditreport.com',
    portalLabel: 'annualcreditreport.com',
  },
]

const DISPUTE_TYPES = [
  { id: 'not_mine', label: 'Account Not Mine' },
  { id: 'incorrect_balance', label: 'Incorrect Balance' },
  { id: 'incorrect_status', label: 'Incorrect Status' },
  { id: 'late_payment_error', label: 'Late Payment Error' },
  { id: 'identity_theft', label: 'Identity Theft' },
  { id: 'paid_not_updated', label: 'Account Paid Not Updated' },
  { id: 'duplicate', label: 'Duplicate Account' },
  { id: 'unauthorized_inquiry', label: 'Unauthorized Inquiry' },
  { id: 'outdated_7yr', label: 'Outdated Info 7+ Years' },
  { id: 'wrong_personal', label: 'Wrong Personal Info' },
]

const SUPPORTING_DOCS = [
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'payment_receipts', label: 'Payment Receipts' },
  { value: 'identity_theft_report', label: 'Identity Theft Report' },
  { value: 'court_documents', label: 'Court Documents' },
  { value: 'credit_report_copy', label: 'Credit Report Copy' },
  { value: 'none', label: 'None' },
]

interface GeneratedLetters {
  equifax?: string
  experian?: string
  transunion?: string
}

export function BureauDisputeCenter({ plan = 'free', state = '', debts = [] }: BureauDisputeCenterProps) {
  const [selectedBureau, setSelectedBureau] = useState<string>('')
  const [selectedDisputeType, setSelectedDisputeType] = useState<string>('')
  const [form, setForm] = useState({
    creditorName: '',
    accountNumber: '',
    reportedBalance: '',
    correctInfo: '',
    dateOfError: '',
    supportingDocs: 'none',
    additionalDetails: '',
  })
  const [loading, setLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [error, setError] = useState('')
  const [letters, setLetters] = useState<GeneratedLetters | null>(null)
  const [activeTab, setActiveTab] = useState<'equifax' | 'experian' | 'transunion'>('equifax')
  const [copiedTab, setCopiedTab] = useState<string>('')
  const [showAddresses, setShowAddresses] = useState(true)

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const canSubmit = selectedBureau && selectedDisputeType &&
    form.creditorName && form.accountNumber && form.correctInfo

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setLetters(null)
    try {
      const res = await fetch('/api/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bureau: selectedBureau,
          disputeType: selectedDisputeType,
          ...form,
        }),
      })
      if (res.status === 429) { setShowUpgrade(true); return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Letter generation failed')

      // Normalize response — API may return letters keyed by bureau or a single letter
      if (data.letters) {
        setLetters(data.letters)
      } else if (data.letter) {
        if (selectedBureau === 'all') {
          setLetters({ equifax: data.letter, experian: data.letter, transunion: data.letter })
        } else {
          setLetters({ [selectedBureau]: data.letter } as GeneratedLetters)
        }
      } else {
        // Fallback: try to parse any string fields
        setLetters(data)
      }
      setActiveTab('equifax')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedTab(key)
    setTimeout(() => setCopiedTab(''), 2000)
  }

  const handleDownload = (bureau: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dispute-letter-${bureau}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const letterTabs = letters
    ? (Object.entries(letters) as [keyof GeneratedLetters, string][]).filter(([, v]) => v)
    : []

  const bureauByKey = (key: string) => BUREAUS.find(b => b.id === key)

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="section-header flex items-center gap-3">
          <Building2 className="w-7 h-7 text-teal-400" />
          Bureau Dispute Center
        </h1>
        <p className="section-subheader mt-1">
          AI-generated dispute letter templates — educational use only, not legal advice.
        </p>
      </div>

      {/* UPL Disclaimer */}
      <div className="mb-6 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 flex items-start gap-2.5">
        <span className="text-amber-400 text-base flex-shrink-0 mt-0.5">⚖️</span>
        <p className="text-amber-200/75 text-xs leading-relaxed">
          <strong className="text-amber-300">Not Legal Advice:</strong> DebtCoach AI is not a law firm and these are not legal services. Generated dispute letters are educational templates only and do not create an attorney-client relationship. Review all letters with a licensed attorney before sending to credit bureaus.
        </p>
      </div>

      {!letters && (
        <div className="space-y-8">
          {/* Bureau Selector */}
          <div>
            <h2 className="text-white font-semibold mb-3">Select Bureau(s)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BUREAUS.map(bureau => (
                <button
                  key={bureau.id}
                  type="button"
                  onClick={() => setSelectedBureau(bureau.id)}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all duration-150 flex flex-col gap-2',
                    `bg-gradient-to-br ${bureau.color}`,
                    selectedBureau === bureau.id
                      ? `${bureau.border} ring-2 ring-teal-400/40`
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm', bureau.abbrevColor)}>
                    {bureau.abbr}
                  </div>
                  <div>
                    <p className={cn('font-semibold text-sm', selectedBureau === bureau.id ? bureau.accent : 'text-white')}>
                      {bureau.name}
                    </p>
                    {bureau.id !== 'all' && (
                      <p className="text-white/40 text-xs mt-0.5 leading-tight line-clamp-2">
                        {bureau.address.split('\n').slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Dispute Type Selector */}
          <div>
            <h2 className="text-white font-semibold mb-3">Dispute Type</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {DISPUTE_TYPES.map(dt => (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => setSelectedDisputeType(dt.id)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl text-sm font-medium text-left border transition-all duration-150',
                    selectedDisputeType === dt.id
                      ? 'bg-teal-400/15 border-teal-400/40 text-teal-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="card p-6 space-y-5">
            <h2 className="text-white font-semibold">Account &amp; Error Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Creditor / Account Name"
                placeholder="e.g. Chase Bank, Discover Card"
                value={form.creditorName}
                onChange={e => updateField('creditorName', e.target.value)}
              />
              <Input
                label="Account Number (as shown on report)"
                placeholder="e.g. ****1234 or full number"
                value={form.accountNumber}
                onChange={e => updateField('accountNumber', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Reported Balance"
                type="number"
                placeholder="0.00"
                value={form.reportedBalance}
                onChange={e => updateField('reportedBalance', e.target.value)}
              />
              <Input
                label="Date of Error"
                type="date"
                value={form.dateOfError}
                onChange={e => updateField('dateOfError', e.target.value)}
              />
            </div>

            <Textarea
              label="What It Should Say (Correct Information)"
              placeholder="Describe what the correct information is. E.g., 'This account was paid in full on MM/DD/YYYY. The balance should be $0.'"
              value={form.correctInfo}
              onChange={e => updateField('correctInfo', e.target.value)}
              rows={3}
            />

            <Select
              label="Supporting Documents Available"
              value={form.supportingDocs}
              onChange={e => updateField('supportingDocs', e.target.value)}
              options={SUPPORTING_DOCS}
            />

            <Textarea
              label="Additional Details (Optional)"
              placeholder="Any other context the bureau should know..."
              value={form.additionalDetails}
              onChange={e => updateField('additionalDetails', e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              disabled={!canSubmit || loading}
              loading={loading}
              onClick={handleSubmit}
              icon={<Shield className="w-4 h-4" />}
            >
              {loading ? 'Generating Letters...' : 'Generate Dispute Letter(s)'}
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {letters && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-xl">Your Dispute Letters</h2>
              <p className="text-white/50 text-sm mt-0.5">Review, copy, or download each letter below</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setLetters(null)}>
              Generate New Letter
            </Button>
          </div>

          {/* Tabs */}
          {letterTabs.length > 1 && (
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
              {letterTabs.map(([key]) => {
                const b = bureauByKey(key)
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                      activeTab === key
                        ? 'bg-teal-400/20 text-teal-300 border border-teal-400/20'
                        : 'text-white/50 hover:text-white'
                    )}
                  >
                    {b?.name || key}
                  </button>
                )
              })}
            </div>
          )}

          {letterTabs.map(([key, text]) => (
            <div key={key} className={cn(letterTabs.length > 1 && key !== activeTab ? 'hidden' : '')}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm font-medium">
                  {bureauByKey(key)?.name || key} Dispute Letter
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={copiedTab === key ? <CheckCircle2 className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                    onClick={() => handleCopy(key, text)}
                  >
                    {copiedTab === key ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => handleDownload(key, text)}
                  >
                    Download
                  </Button>
                </div>
              </div>
              <pre className="bg-white/5 border border-white/10 rounded-xl p-5 text-white/80 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                {text}
              </pre>
            </div>
          ))}

          {/* Important Info */}
          <div className="card p-5 space-y-4">
            <button
              type="button"
              onClick={() => setShowAddresses(!showAddresses)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                Bureau Mailing Addresses &amp; Portals
              </h3>
              {showAddresses ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
            </button>

            {showAddresses && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {BUREAUS.filter(b => b.id !== 'all').map(b => (
                  <div key={b.id} className={cn('p-4 rounded-xl bg-gradient-to-br border', b.color, b.border)}>
                    <div className={cn('font-semibold text-sm mb-2', b.accent)}>{b.name}</div>
                    <p className="text-white/60 text-xs whitespace-pre-line leading-relaxed mb-3">{b.address}</p>
                    <a
                      href={b.portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      Online portal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mt-2">
              <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 text-sm font-semibold">30-Day Investigation Window</p>
                <p className="text-white/60 text-xs mt-0.5">
                  Credit bureaus are required by the FCRA to investigate disputes within 30 days (45 days if you submit additional information). Send letters via certified mail with return receipt requested to create a paper trail.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} trigger="dispute" />
    </div>
  )
}
