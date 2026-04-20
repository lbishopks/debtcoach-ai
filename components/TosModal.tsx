'use client'
import { useState, useRef, useEffect } from 'react'
import { Shield, FileText, CheckCircle, AlertTriangle, ChevronDown, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CURRENT_TOS_VERSION, TOS_CHANGELOG, TOS_EFFECTIVE_DATE } from '@/lib/tos-version'
import { cn } from '@/lib/utils'

// ─── Props ──────────────────────────────────────────────────────────────────
interface TosModalProps {
  /** null  = never accepted (first time)
   *  string = accepted a previous version (update flow) */
  previousVersion: string | null
  onAccepted: () => void
}

// ─── ToS Text ────────────────────────────────────────────────────────────────
function TosText() {
  return (
    <div className="space-y-5 text-white/70 text-sm leading-relaxed">

      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <p className="text-red-300 font-semibold text-xs uppercase tracking-wider mb-1">Critical Notice</p>
        <p className="text-white/80 text-sm">
          <strong>DebtCoach AI is NOT a law firm. This Service does NOT provide legal advice
          and does NOT create an attorney-client relationship.</strong> All content —
          including AI-generated letters, coaching, and tools — is for informational
          and educational purposes only.
        </p>
      </div>

      <section>
        <h3 className="text-white font-semibold mb-2">1. Not a Law Firm — No Legal Advice</h3>
        <p>
          DebtCoach AI is not a law firm and does not employ licensed attorneys in any
          advisory capacity. No attorney-client relationship exists or will be formed
          between you and DebtCoach AI by using this Service. All AI-generated letters
          and coaching are general legal <em>information</em>, not personalized legal advice.
        </p>
        <p className="mt-2">
          Before sending any generated letter or taking legal action, you should consult
          a licensed attorney in your state. Visit <strong>lawhelp.org</strong> to find
          free legal assistance.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">2. Artificial Intelligence Disclosure</h3>
        <p>
          This Service uses <strong>Claude AI (Anthropic PBC)</strong> to generate letters
          and recommendations. AI-Generated Content may contain factual errors,
          hallucinations, or outdated legal citations. Every Generated Letter is labeled
          "AI-Generated" and must not be relied upon as verified legal research.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">3. Disclaimer of Warranties</h3>
        <p>
          THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL
          WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND THE
          ACCURACY OR EFFECTIVENESS OF ANY GENERATED LETTER OR CALCULATOR OUTPUT.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">4. Limitation of Liability</h3>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEBTCOACH AI'S TOTAL LIABILITY SHALL
          NOT EXCEED THE FEES YOU PAID IN THE PRIOR 12 MONTHS (OR $50 IF YOU ARE ON THE
          FREE PLAN). WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
          DAMAGES, INCLUDING DAMAGES FROM RELIANCE ON AI-GENERATED CONTENT OR A DEBT
          COLLECTOR'S RESPONSE TO ANY LETTER WE GENERATE.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">5. Your Responsibilities</h3>
        <p>You are solely responsible for:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Reviewing and verifying all AI-generated content before use</li>
          <li>Confirming the accuracy of any legal citation with official sources</li>
          <li>Consulting a licensed attorney before sending any letter or taking legal action</li>
          <li>The accuracy of information you provide to the Service</li>
          <li>All consequences from your decision to use generated content</li>
        </ul>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">6. Binding Arbitration & Class Action Waiver</h3>
        <p>
          You and DebtCoach AI agree that any dispute shall be resolved by binding
          individual arbitration under AAA Consumer Arbitration Rules, not in court.{' '}
          <strong>You waive the right to participate in any class action lawsuit or
          class arbitration.</strong> You may opt out within 30 days of first use by
          emailing legal@debtcoachai.com with subject "Arbitration Opt-Out."
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">7. Eligibility</h3>
        <p>
          This Service is for users <strong>18 years of age or older</strong>. By
          accepting these terms you represent that you are at least 18 years old.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">8. Governing Law</h3>
        <p>
          These Terms are governed by the laws of the State of Kansas. Disputes not
          subject to arbitration shall be resolved in Sedgwick County, Kansas courts.
        </p>
      </section>

      <p className="text-white/40 text-xs border-t border-white/10 pt-4">
        Full Terms of Service effective {TOS_EFFECTIVE_DATE} · Version {CURRENT_TOS_VERSION}
      </p>
    </div>
  )
}

function PrivacyText() {
  return (
    <div className="space-y-5 text-white/70 text-sm leading-relaxed">

      <section>
        <h3 className="text-white font-semibold mb-2">What We Collect</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4 text-white/50 font-medium">Data</th>
                <th className="text-left py-2 pr-4 text-white/50 font-medium">Why</th>
                <th className="text-left py-2 text-white/50 font-medium">Sold?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                ['Name, address, phone', 'Personalized letter letterhead', 'Never'],
                ['Email', 'Account auth, notifications', 'Never'],
                ['Debt details (amounts, creditors)', 'Generate letters & coaching', 'Never'],
                ['AI conversations', 'Conversation history feature', 'Never'],
                ['Payment info (last 4 digits only)', 'Subscription management via Stripe', 'Never'],
                ['Usage data', 'Product improvement', 'Never'],
              ].map(([data, why, sold]) => (
                <tr key={data}>
                  <td className="py-2 pr-4 text-white/70">{data}</td>
                  <td className="py-2 pr-4 text-white/50">{why}</td>
                  <td className="py-2 text-green-400 font-medium">{sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">AI Processing</h3>
        <p>
          Your prompts and debt context are transmitted to <strong>Anthropic PBC</strong> for
          AI processing. See Anthropic's Privacy Policy at anthropic.com/privacy. We have
          a Data Processing Agreement with Anthropic.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">Financial Information (GLBA & CCPA)</h3>
        <p>
          Debt details are <strong>Nonpublic Personal Information</strong> under the
          Gramm-Leach-Bliley Act and <strong>Sensitive Personal Information</strong> under
          CCPA. We use this information only to provide the Service. We never share it
          with creditors, debt settlement companies, or data brokers.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">Your Rights</h3>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Access & Portability:</strong> Request a copy of your data</li>
          <li><strong>Deletion:</strong> Delete your account and all data from Account Settings</li>
          <li><strong>Correction:</strong> Update profile info at any time</li>
          <li><strong>California (CCPA):</strong> Right to know, delete, correct, and opt-out of sale — contact privacy@debtcoachai.com</li>
          <li><strong>EU (GDPR):</strong> Right to erasure, portability, and to lodge a complaint with your local DPA</li>
        </ul>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">Data Security</h3>
        <p>
          All data is encrypted in transit (TLS) and at rest (AES-256). We maintain
          role-based access controls, conduct annual security assessments, and will notify
          you within 72 hours of any data breach affecting your information.
        </p>
      </section>

      <section>
        <h3 className="text-white font-semibold mb-2">Children's Privacy</h3>
        <p>
          This Service is for users 18+. We do not knowingly collect information from
          children under 13. Contact privacy@debtcoachai.com if you believe a minor
          has used this Service.
        </p>
      </section>

      <p className="text-white/40 text-xs border-t border-white/10 pt-4">
        Full Privacy Policy effective {TOS_EFFECTIVE_DATE} · Version {CURRENT_TOS_VERSION}
      </p>
    </div>
  )
}

// ─── First-Time Modal ─────────────────────────────────────────────────────────
function FirstTimeModal({ onAccepted }: { onAccepted: () => void }) {
  const [activeTab, setActiveTab] = useState<'tos' | 'privacy'>('tos')
  const [tosRead, setTosRead] = useState(false)
  const [privacyRead, setPrivacyRead] = useState(false)
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const bothRead = tosRead && privacyRead
  const canAccept = bothRead && checked

  // Detect when user has scrolled near the bottom of the active tab's content
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (nearBottom) {
      if (activeTab === 'tos') setTosRead(true)
      else setPrivacyRead(true)
    }
  }

  // Reset scroll position when switching tabs
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [activeTab])

  const handleAccept = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: CURRENT_TOS_VERSION }),
      })
      if (!res.ok) throw new Error('Failed to record acceptance')
      onAccepted()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-navy-100 border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-teal-400 rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-navy-200" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Welcome to DebtCoach AI</h2>
              <p className="text-white/40 text-xs">Please read and accept our Terms before continuing</p>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 mt-4 bg-white/5 rounded-xl p-1">
            {([
              { id: 'tos', label: 'Terms of Service', icon: FileText, done: tosRead },
              { id: 'privacy', label: 'Privacy Policy', icon: Shield, done: privacyRead },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-teal-400/20 text-teal-300 border border-teal-400/20'
                    : 'text-white/50 hover:text-white/70'
                )}
              >
                {tab.done
                  ? <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                  : <tab.icon className="w-3.5 h-3.5" />
                }
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-5 min-h-0 scrollbar-thin"
        >
          {activeTab === 'tos' ? <TosText /> : <PrivacyText />}

          {/* Visual cue to keep scrolling if not yet read */}
          {((activeTab === 'tos' && !tosRead) || (activeTab === 'privacy' && !privacyRead)) && (
            <div className="flex items-center justify-center gap-2 py-4 text-white/30 text-xs animate-bounce">
              <ChevronDown className="w-4 h-4" />
              Scroll to read all
            </div>
          )}
        </div>

        {/* Footer — acceptance */}
        <div className="px-6 pb-6 pt-4 border-t border-white/10 flex-shrink-0 space-y-4">

          {/* Switch tab prompt */}
          {tosRead && !privacyRead && activeTab === 'tos' && (
            <button
              onClick={() => setActiveTab('privacy')}
              className="w-full text-center text-teal-400 hover:text-teal-300 text-sm transition-colors"
            >
              Next: Read Privacy Policy →
            </button>
          )}

          {/* Checkbox */}
          <label className={cn(
            'flex items-start gap-3 cursor-pointer group',
            !bothRead && 'opacity-40 cursor-not-allowed pointer-events-none'
          )}>
            <div
              onClick={() => bothRead && setChecked(c => !c)}
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                checked
                  ? 'bg-teal-400 border-teal-400'
                  : 'border-white/30 group-hover:border-teal-400/60'
              )}
            >
              {checked && <CheckCircle className="w-3.5 h-3.5 text-navy-200" />}
            </div>
            <span className="text-white/70 text-sm leading-snug">
              I have read and agree to the{' '}
              <strong className="text-white">Terms of Service</strong> and{' '}
              <strong className="text-white">Privacy Policy</strong>.
              I understand that DebtCoach AI is not a law firm and does not provide legal advice.
              I am 18 years of age or older.
            </span>
          </label>

          {!bothRead && (
            <p className="text-white/30 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Please scroll through both the Terms of Service and Privacy Policy to enable the checkbox.
            </p>
          )}

          <Button
            onClick={handleAccept}
            disabled={!canAccept}
            loading={loading}
            className="w-full"
          >
            Accept & Continue to DebtCoach AI
          </Button>

          <p className="text-white/25 text-xs text-center">
            Your acceptance is timestamped and stored securely. Effective {TOS_EFFECTIVE_DATE}.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Update Modal (returning users, new ToS version) ─────────────────────────
function UpdateModal({ onAccepted }: { onAccepted: () => void }) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: CURRENT_TOS_VERSION }),
      })
      if (!res.ok) throw new Error('Failed to record acceptance')
      onAccepted()
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-navy-100 border border-white/10 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-400/20 border border-teal-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-white font-bold leading-tight">Terms Updated</h2>
              <p className="text-white/40 text-xs">Effective {TOS_EFFECTIVE_DATE}</p>
            </div>
          </div>
        </div>

        {/* What changed */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-white/70 text-sm">We've updated our Terms of Service and Privacy Policy. Here's what changed:</p>
          <ul className="space-y-2">
            {TOS_CHANGELOG.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="text-teal-400 font-bold flex-shrink-0 mt-0.5">·</span>
                {item}
              </li>
            ))}
          </ul>

          {/* Expandable full text */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-teal-400 hover:text-teal-300 text-xs flex items-center gap-1 transition-colors mt-1"
          >
            {expanded ? 'Hide full terms' : 'Read full terms'}
            <ChevronDown className={cn('w-3 h-3 transition-transform', expanded && 'rotate-180')} />
          </button>

          {expanded && (
            <div className="max-h-64 overflow-y-auto bg-white/5 rounded-xl p-4 scrollbar-thin">
              <TosText />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          <Button onClick={handleAccept} loading={loading} className="w-full">
            Accept Updated Terms
          </Button>
          <p className="text-white/30 text-xs text-center">
            To opt out of arbitration, email legal@debtcoachai.com within 30 days.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function TosModal({ previousVersion, onAccepted }: TosModalProps) {
  const isFirstTime = previousVersion === null
  const isUpdate = previousVersion !== null && previousVersion !== CURRENT_TOS_VERSION

  if (!isFirstTime && !isUpdate) return null

  return isFirstTime
    ? <FirstTimeModal onAccepted={onAccepted} />
    : <UpdateModal onAccepted={onAccepted} />
}
