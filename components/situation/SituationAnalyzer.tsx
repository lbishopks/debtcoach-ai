'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import {
  CheckCircle2, ChevronRight, ChevronLeft, Loader2,
  MessageSquare, FileText, Brain, DollarSign, MapPin, AlertCircle
} from 'lucide-react'

interface SituationFormData {
  // Step 1
  totalDebt: string
  debtTypes: string[]
  oldestDebtAge: string
  // Step 2
  monthlyIncome: string
  monthlyExpenses: string
  employmentStatus: string
  hasAssets: boolean
  // Step 3
  state: string
  creditScore: string
  primaryGoal: string
  additionalContext: string
}

const DEBT_TYPE_OPTIONS = [
  'Credit Card',
  'Medical',
  'Student Loan',
  'Personal Loan',
  'Auto',
  'Other',
]

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
]

const STEPS = [
  { number: 1, label: 'Debt Overview', icon: DollarSign },
  { number: 2, label: 'Income & Expenses', icon: Brain },
  { number: 3, label: 'Your Situation', icon: MapPin },
]

function AnalysisRenderer({ markdown }: { markdown: string }) {
  const sections = markdown.split(/(?=###\s)/g).filter(Boolean)

  if (sections.length <= 1) {
    return (
      <div className="card p-6">
        <p className="text-white/80 whitespace-pre-wrap leading-relaxed text-sm">{markdown}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const lines = section.split('\n')
        const titleLine = lines[0]
        const title = titleLine.replace(/^###\s*/, '').trim()
        const body = lines.slice(1).join('\n').trim()

        // Parse bullet points
        const bodyLines = body.split('\n')
        const rendered: React.ReactNode[] = []
        let currentList: string[] = []

        bodyLines.forEach((line, j) => {
          const trimmed = line.trim()
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            currentList.push(trimmed.slice(2))
          } else {
            if (currentList.length > 0) {
              rendered.push(
                <ul key={`list-${j}`} className="space-y-1.5 my-2">
                  {currentList.map((item, k) => (
                    <li key={k} className="flex items-start gap-2 text-sm text-white/75">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )
              currentList = []
            }
            if (trimmed) {
              rendered.push(
                <p key={`p-${j}`} className="text-sm text-white/75 leading-relaxed">{trimmed}</p>
              )
            }
          }
        })
        if (currentList.length > 0) {
          rendered.push(
            <ul key="list-final" className="space-y-1.5 my-2">
              {currentList.map((item, k) => (
                <li key={k} className="flex items-start gap-2 text-sm text-white/75">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
        }

        return (
          <div key={i} className="card p-5">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-400 rounded-full inline-block" />
              {title}
            </h3>
            <div className="space-y-2">{rendered}</div>
          </div>
        )
      })}
    </div>
  )
}

interface SituationAnalyzerProps {
  plan?: string
  state?: string
}

export function SituationAnalyzer({ plan = 'free', state: defaultState = '' }: SituationAnalyzerProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [dots, setDots] = useState('.')

  const [form, setForm] = useState<SituationFormData>({
    totalDebt: '',
    debtTypes: [],
    oldestDebtAge: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    employmentStatus: '',
    hasAssets: false,
    state: defaultState,
    creditScore: '',
    primaryGoal: '',
    additionalContext: '',
  })

  const updateField = (field: keyof SituationFormData, value: string | boolean | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleDebtType = (type: string) => {
    setForm(prev => ({
      ...prev,
      debtTypes: prev.debtTypes.includes(type)
        ? prev.debtTypes.filter(t => t !== type)
        : [...prev.debtTypes, type],
    }))
  }

  const canAdvance = () => {
    if (step === 1) return form.totalDebt && form.debtTypes.length > 0 && form.oldestDebtAge
    if (step === 2) return form.monthlyIncome && form.monthlyExpenses && form.employmentStatus
    if (step === 3) return form.state && form.creditScore && form.primaryGoal
    return false
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    // Animate dots
    let dotCount = 1
    const interval = setInterval(() => {
      dotCount = (dotCount % 3) + 1
      setDots('.'.repeat(dotCount))
    }, 500)

    try {
      const res = await fetch('/api/situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data.analysis || data.result || JSON.stringify(data))
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-header flex items-center gap-3">
          <Brain className="w-7 h-7 text-teal-400" />
          Situation Analyzer
        </h1>
        <p className="section-subheader mt-1">
          Answer a few questions and get a personalized debt strategy based on your specific circumstances.
        </p>
      </div>

      {!result && (
        <>
          {/* Step Progress */}
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isComplete = step > s.number
              const isCurrent = step === s.number
              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-semibold text-sm',
                      isComplete ? 'bg-teal-400 text-navy-200' :
                      isCurrent ? 'bg-teal-400/20 border-2 border-teal-400 text-teal-400' :
                      'bg-white/5 border border-white/20 text-white/30'
                    )}>
                      {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={cn(
                      'text-xs mt-1.5 font-medium whitespace-nowrap',
                      isCurrent ? 'text-teal-400' : isComplete ? 'text-white/60' : 'text-white/30'
                    )}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      'h-0.5 flex-none w-12 md:w-20 mx-1 rounded transition-all duration-300',
                      step > s.number ? 'bg-teal-400' : 'bg-white/10'
                    )} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="card p-6 space-y-6">
              <h2 className="text-white font-semibold text-lg">Step 1: Debt Overview</h2>

              <Input
                label="Total Debt Amount"
                type="number"
                placeholder="25000"
                value={form.totalDebt}
                onChange={e => updateField('totalDebt', e.target.value)}
                hint="Include all debts: credit cards, medical bills, personal loans, etc."
              />

              <div>
                <label className="label">Types of Debt <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {DEBT_TYPE_OPTIONS.map(type => {
                    const checked = form.debtTypes.includes(type)
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleDebtType(type)}
                        className={cn(
                          'px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150 border',
                          checked
                            ? 'bg-teal-400/15 border-teal-400/40 text-teal-300'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            'w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center',
                            checked ? 'bg-teal-400 border-teal-400' : 'border-white/30'
                          )}>
                            {checked && <CheckCircle2 className="w-3 h-3 text-navy-200" />}
                          </div>
                          {type}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Select
                label="Age of Oldest Debt"
                value={form.oldestDebtAge}
                onChange={e => updateField('oldestDebtAge', e.target.value)}
                options={[
                  { value: '', label: 'Select age of oldest debt...' },
                  { value: 'under_1', label: 'Under 1 year' },
                  { value: '1_3', label: '1–3 years' },
                  { value: '3_6', label: '3–6 years' },
                  { value: '6_plus', label: '6+ years' },
                ]}
              />
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="card p-6 space-y-6">
              <h2 className="text-white font-semibold text-lg">Step 2: Income &amp; Expenses</h2>

              <Input
                label="Monthly Gross Income"
                type="number"
                placeholder="4500"
                value={form.monthlyIncome}
                onChange={e => updateField('monthlyIncome', e.target.value)}
                hint="Before taxes. Include all sources: wages, benefits, etc."
              />

              <Input
                label="Monthly Debt Payments"
                type="number"
                placeholder="800"
                value={form.monthlyExpenses}
                onChange={e => updateField('monthlyExpenses', e.target.value)}
                hint="Total minimum payments across all debts each month."
              />

              <Select
                label="Employment Status"
                value={form.employmentStatus}
                onChange={e => updateField('employmentStatus', e.target.value)}
                options={[
                  { value: '', label: 'Select employment status...' },
                  { value: 'employed_full', label: 'Employed Full-time' },
                  { value: 'employed_part', label: 'Employed Part-time' },
                  { value: 'self_employed', label: 'Self-Employed' },
                  { value: 'unemployed', label: 'Unemployed' },
                  { value: 'retired', label: 'Retired' },
                  { value: 'disabled', label: 'Disabled' },
                ]}
              />

              <div>
                <label className="label">Assets</label>
                <button
                  type="button"
                  onClick={() => updateField('hasAssets', !form.hasAssets)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-150 text-sm font-medium',
                    form.hasAssets
                      ? 'bg-teal-400/15 border-teal-400/40 text-teal-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                  )}
                >
                  <span>Do you own a home or retirement accounts?</span>
                  <div className={cn(
                    'w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0',
                    form.hasAssets ? 'bg-teal-400' : 'bg-white/20'
                  )}>
                    <div className={cn(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200',
                      form.hasAssets ? 'left-6' : 'left-1'
                    )} />
                  </div>
                </button>
                <p className="text-white/40 text-xs mt-1.5">
                  This affects which debt relief options are available to you.
                </p>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="card p-6 space-y-6">
              <h2 className="text-white font-semibold text-lg">Step 3: Your Situation</h2>

              <Select
                label="Your State"
                value={form.state}
                onChange={e => updateField('state', e.target.value)}
                options={[
                  { value: '', label: 'Select your state...' },
                  ...US_STATES.map(s => ({ value: s, label: s })),
                ]}
              />

              <Select
                label="Credit Score Range"
                value={form.creditScore}
                onChange={e => updateField('creditScore', e.target.value)}
                options={[
                  { value: '', label: 'Select credit score range...' },
                  { value: 'below_580', label: 'Below 580 (Poor)' },
                  { value: '580_669', label: '580–669 (Fair)' },
                  { value: '670_739', label: '670–739 (Good)' },
                  { value: '740_plus', label: '740+ (Excellent)' },
                  { value: 'unknown', label: "Unknown / Haven't checked" },
                ]}
              />

              <Select
                label="Primary Goal"
                value={form.primaryGoal}
                onChange={e => updateField('primaryGoal', e.target.value)}
                options={[
                  { value: '', label: 'Select your primary goal...' },
                  { value: 'stop_harassment', label: 'Stop collector harassment' },
                  { value: 'settle_debts', label: 'Settle debts for less' },
                  { value: 'remove_items', label: 'Remove items from credit report' },
                  { value: 'avoid_bankruptcy', label: 'Avoid bankruptcy' },
                  { value: 'payment_plan', label: 'Create a payment plan' },
                  { value: 'all', label: 'All of the above' },
                ]}
              />

              <Textarea
                label="Describe Your Situation"
                placeholder="Describe your situation in your own words... What happened? Are collectors calling? Have you been sued? Any recent life changes?"
                value={form.additionalContext}
                onChange={e => updateField('additionalContext', e.target.value)}
                rows={5}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <Button
                variant="secondary"
                icon={<ChevronLeft className="w-4 h-4" />}
                onClick={() => setStep(s => s - 1)}
              >
                Back
              </Button>
            ) : <div />}

            {step < 3 ? (
              <Button
                disabled={!canAdvance()}
                icon={<ChevronRight className="w-4 h-4" />}
                onClick={() => setStep(s => s + 1)}
              >
                Next Step
              </Button>
            ) : (
              <Button
                disabled={!canAdvance() || loading}
                loading={loading}
                onClick={handleSubmit}
              >
                {loading ? `Analyzing your situation${dots}` : 'Analyze My Situation'}
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </>
      )}

      {/* Loading State */}
      {loading && !result && (
        <div className="mt-8 card p-8 text-center">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Analyzing your situation{dots}</p>
          <p className="text-white/40 text-sm mt-1">Reviewing your debt profile, rights, and options...</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-xl">Your Personalized Analysis</h2>
              <p className="text-white/50 text-sm mt-0.5">Based on your specific situation and state laws</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setResult(null); setStep(1) }}
            >
              Start Over
            </Button>
          </div>

          <AnalysisRenderer markdown={result} />

          <div className="card p-5 bg-teal-400/5 border-teal-400/20">
            <h3 className="text-white font-semibold mb-3">Recommended Next Steps</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/letters" className="flex-1">
                <Button className="w-full" icon={<FileText className="w-4 h-4" />}>
                  Generate Dispute Letters
                </Button>
              </Link>
              <Link href="/chat" className="flex-1">
                <Button variant="secondary" className="w-full" icon={<MessageSquare className="w-4 h-4" />}>
                  Start AI Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
