'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, CheckCircle, Copy, Download,
  Printer, Mail, Loader2, FileText, CheckCheck, AlertTriangle,
  Package, Calendar, MessageSquare, Send
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Letter {
  id: string
  letter_type: string
  creditor_name: string
  content: string
  created_at: string
  sent_at?: string | null
  sent_method?: string | null
  usps_tracking?: string | null
  response_deadline?: string | null
  response_received_at?: string | null
  response_notes?: string | null
}

const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

// ── Approval Modal ──────────────────────────────────────────────────────────
function ApprovalModal({
  onApprove,
  onClose,
}: {
  onApprove: () => void
  onClose: () => void
}) {
  const [checks, setChecks] = useState({ own: false, reviewed: false, agreed: false })
  const allChecked = checks.own && checks.reviewed && checks.agreed
  const toggle = (k: keyof typeof checks) => setChecks(p => ({ ...p, [k]: !p[k] }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0f1624] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-teal-400/15 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-teal-400" />
            </div>
            <h2 className="text-white font-bold text-lg">Approve Your Letter</h2>
          </div>
          <p className="text-white/40 text-sm">Please confirm the following before finalizing.</p>
        </div>

        {/* Checkboxes */}
        <div className="p-6 space-y-4">
          {[
            {
              key: 'own' as const,
              label: 'This is my letter',
              detail: 'I confirm this letter was created for use in my own personal situation and will be sent under my name.',
            },
            {
              key: 'reviewed' as const,
              label: 'I have reviewed and approve the content',
              detail: 'I have read this letter in full, made all desired edits, and approve it as ready to send.',
            },
            {
              key: 'agreed' as const,
              label: 'I agree to the terms I previously accepted',
              detail: 'This includes the Privacy Policy. I understand DebtCoach AI is not a law firm and this letter is not legal advice.',
            },
          ].map(({ key, label, detail }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`w-full text-left flex gap-3 p-4 rounded-xl border transition-all ${
                checks[key]
                  ? 'border-teal-400/40 bg-teal-400/8'
                  : 'border-white/10 bg-white/3 hover:border-white/20'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${
                checks[key] ? 'bg-teal-400 border-teal-400' : 'border-white/25 bg-transparent'
              }`}>
                {checks[key] && <CheckCheck className="w-3 h-3 text-[#0a0f1a]" />}
              </div>
              <div>
                <p className={`text-sm font-medium transition-colors ${checks[key] ? 'text-teal-300' : 'text-white/80'}`}>
                  {label}
                </p>
                <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{detail}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/6 text-white/60 hover:text-white text-sm font-medium transition-all hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            disabled={!allChecked}
            className="flex-1 py-3 rounded-xl bg-teal-400 text-[#0a0f1a] font-bold text-sm transition-all hover:bg-teal-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Approve & Finalize
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function LetterEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [letter, setLetter] = useState<Letter | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [approved, setApproved] = useState(false)
  const [showApproval, setShowApproval] = useState(false)
  const [copied, setCopied] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [tracking, setTracking] = useState({
    sent_at: '', sent_method: '', usps_tracking: '',
    response_deadline: '', response_received_at: '', response_notes: '',
  })
  const [savingTracking, setSavingTracking] = useState(false)
  const [showTracking, setShowTracking] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch(`/api/letters/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.letter) {
          setLetter(d.letter)
          setContent(d.letter.content)
          setTracking({
            sent_at: d.letter.sent_at ? d.letter.sent_at.split('T')[0] : '',
            sent_method: d.letter.sent_method || '',
            usps_tracking: d.letter.usps_tracking || '',
            response_deadline: d.letter.response_deadline || '',
            response_received_at: d.letter.response_received_at ? d.letter.response_received_at.split('T')[0] : '',
            response_notes: d.letter.response_notes || '',
          })
          if (d.letter.sent_at) setShowTracking(true)
        } else {
          toast.error('Letter not found')
          router.push('/letters')
        }
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load letter'); setLoading(false) })
  }, [id, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/letters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error()
      setDirty(false)
      setApproved(false) // reset approval if they edit after approving
      toast.success('Changes saved')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleApprove = () => {
    setApproved(true)
    setShowApproval(false)
    toast.success('Letter approved — ready to use!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  const handleDownload = async () => {
    try {
      const { downloadLetterPDF } = await import('@/lib/pdf')
      await downloadLetterPDF(content, letter?.letter_type || '', letter?.creditor_name || '')
      toast.success('PDF downloaded!')
    } catch { toast.error('Failed to generate PDF') }
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${letter?.creditor_name || 'Letter'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; background: #fff; }
    .page { width: 8.5in; min-height: 11in; margin: 0 auto; padding: 1in; }
    pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; font-size: 12pt; line-height: 1.6; }
    @media print {
      body { margin: 0; }
      .page { padding: 1in; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="page"><pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`)
    win.document.close()
  }

  const handleSaveTracking = async () => {
    setSavingTracking(true)
    try {
      const payload: Record<string, string | null> = {
        sent_at: tracking.sent_at ? new Date(tracking.sent_at).toISOString() : null,
        sent_method: tracking.sent_method || null,
        usps_tracking: tracking.usps_tracking || null,
        response_deadline: tracking.response_deadline || null,
        response_received_at: tracking.response_received_at ? new Date(tracking.response_received_at).toISOString() : null,
        response_notes: tracking.response_notes || null,
      }
      const res = await fetch(`/api/letters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success('Tracking saved')
    } catch { toast.error('Failed to save tracking') }
    finally { setSavingTracking(false) }
  }

  const handleEmail = async () => {
    setEmailing(true)
    try {
      const res = await fetch('/api/email-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letterContent: content,
          letterTitle: letter ? typeLabel(letter.letter_type) : 'Letter',
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Letter emailed to you!')
    } catch { toast.error('Failed to send email') }
    finally { setEmailing(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
      {showApproval && (
        <ApprovalModal onApprove={handleApprove} onClose={() => setShowApproval(false)} />
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[#0a0f1a]/95 backdrop-blur border-b border-white/8 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/letters" className="text-white/40 hover:text-white transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {letter ? typeLabel(letter.letter_type) : '—'}
              </p>
              <p className="text-white/40 text-xs truncate">{letter?.creditor_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 text-white/70 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            )}
            {!approved ? (
              <button
                onClick={() => {
                  if (dirty) {
                    toast.error('Save your changes first before approving')
                    return
                  }
                  setShowApproval(true)
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-400 text-[#0a0f1a] font-bold text-xs hover:bg-teal-300 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve & Finalize
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-400/15 border border-teal-400/30 text-teal-400 text-xs font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                Approved
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-4">

        {/* Status banner */}
        {!approved ? (
          <div className="bg-white/4 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-white/30 flex-shrink-0" />
            <p className="text-white/40 text-xs">
              Personalize this letter — fill in any <strong className="text-white/55">[BRACKETED]</strong> fields, then click <strong className="text-white/55">Approve &amp; Finalize</strong> to unlock copy, download, and print.
            </p>
          </div>
        ) : (
          <div className="bg-teal-400/10 border border-teal-400/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
              <div>
                <p className="text-teal-300 text-sm font-semibold">Letter approved — ready to use</p>
                <p className="text-teal-200/50 text-xs">Send via Certified Mail with Return Receipt. Keep a copy and your tracking number.</p>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/8 text-white/70 hover:text-white text-xs font-medium transition-all"
              >
                {copied ? <CheckCheck className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/8 text-white/70 hover:text-white text-xs font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/8 text-white/70 hover:text-white text-xs font-medium transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={handleEmail}
                disabled={emailing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-400/15 text-teal-400 hover:bg-teal-400/25 text-xs font-medium transition-all disabled:opacity-50"
              >
                {emailing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                Email Me
              </button>
            </div>
          </div>
        )}

        {/* Tracking Panel — shown after approval */}
        {approved && (
          <div className="bg-white/4 border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowTracking(t => !t)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-white/40" />
                <span className="text-white/70 text-sm font-medium">Delivery Tracking</span>
                {tracking.sent_at && (
                  <span className="text-xs bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full">
                    Sent {new Date(tracking.sent_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <span className="text-white/30 text-xs">{showTracking ? '▲ Hide' : '▼ Show'}</span>
            </button>
            {showTracking && (
              <div className="border-t border-white/8 px-4 py-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="label text-xs">Date Sent</label>
                    <input type="date" className="input text-sm" value={tracking.sent_at}
                      onChange={e => setTracking(t => ({ ...t, sent_at: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label text-xs">Send Method</label>
                    <select className="input text-sm" value={tracking.sent_method}
                      onChange={e => setTracking(t => ({ ...t, sent_method: e.target.value }))}>
                      <option value="">Select...</option>
                      <option value="certified_mail">Certified Mail w/ Return Receipt</option>
                      <option value="regular_mail">Regular Mail</option>
                      <option value="email">Email</option>
                      <option value="fax">Fax</option>
                      <option value="hand_delivered">Hand Delivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Response Deadline</label>
                    <input type="date" className="input text-sm" value={tracking.response_deadline}
                      onChange={e => setTracking(t => ({ ...t, response_deadline: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">USPS Tracking Number</label>
                    <input className="input text-sm font-mono" value={tracking.usps_tracking}
                      onChange={e => setTracking(t => ({ ...t, usps_tracking: e.target.value }))}
                      placeholder="9400111899223397218495" />
                  </div>
                  <div>
                    <label className="label text-xs">Response Received Date</label>
                    <input type="date" className="input text-sm" value={tracking.response_received_at}
                      onChange={e => setTracking(t => ({ ...t, response_received_at: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Response Notes</label>
                  <textarea className="input text-sm resize-none min-h-[70px]" value={tracking.response_notes}
                    onChange={e => setTracking(t => ({ ...t, response_notes: e.target.value }))}
                    placeholder="Note any response you received, what it said, next steps..." />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={handleSaveTracking} disabled={savingTracking}
                    className="flex items-center gap-1.5 bg-teal-400 hover:bg-teal-300 text-[#0a0f1a] font-semibold px-4 py-2 rounded-lg text-xs transition-all disabled:opacity-50">
                    {savingTracking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Tracking
                  </button>
                  {tracking.usps_tracking && (
                    <a
                      href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking.usps_tracking}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs text-teal-400 hover:text-teal-300 underline"
                    >
                      Track on USPS.com →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Letter editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Letter Content</p>
            <p className="text-white/25 text-xs">
              {approved ? 'Edit will require re-approval' : 'Click anywhere to edit'}
            </p>
          </div>
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => { setContent(e.target.value); setDirty(true); if (approved) setApproved(false) }}
              className="w-full min-h-[600px] h-full bg-white rounded-xl p-8 text-gray-900 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-teal-400/50 shadow-inner"
              placeholder="Letter content will appear here..."
              spellCheck
            />
            {/* Bracket highlighter hint */}
            {content.includes('[') && !approved && (
              <div className="absolute bottom-3 right-3">
                <div className="bg-amber-500/90 text-[#0a0f1a] text-xs font-bold px-2.5 py-1.5 rounded-lg">
                  Fill in [BRACKETED] fields
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legal note */}
        <p className="text-white/20 text-xs text-center pb-2">
          ⚖️ Educational template only — not legal advice. Send via USPS Certified Mail with Return Receipt (Form 3811).
        </p>
      </main>
    </div>
  )
}
