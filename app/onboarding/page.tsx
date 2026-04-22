'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { US_STATES, isStateBlocked, CAUTION_STATE_DISCLAIMER } from '@/lib/state-restrictions'
import { Zap, ChevronRight, ChevronLeft, CheckCircle, DollarSign, CreditCard, GraduationCap, HeartPulse, Car, HelpCircle, User, MapPin, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const STEPS = ['Welcome', 'About You', 'Your Address', 'First Debt', 'Strategy']

const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card', icon: CreditCard, description: 'Revolving credit debt' },
  { value: 'medical', label: 'Medical', icon: HeartPulse, description: 'Hospital / medical bills' },
  { value: 'student', label: 'Student Loan', icon: GraduationCap, description: 'Education debt' },
  { value: 'personal_loan', label: 'Personal Loan', icon: DollarSign, description: 'Unsecured personal loans' },
  { value: 'auto', label: 'Auto Loan', icon: Car, description: 'Vehicle financing' },
  { value: 'other', label: 'Other', icon: HelpCircle, description: 'Other debt types' },
]

function getStrategy(type: string, days: number): { title: string; steps: string[]; urgency: string } {
  if (days > 365) return {
    title: 'Statute of Limitations Strategy',
    urgency: 'High Opportunity',
    steps: [
      'Check your state SOL — this debt may already be time-barred',
      'Do NOT make any payment (it could restart the SOL clock)',
      'Send a Debt Validation Letter immediately via certified mail',
      'Dispute the entry on your credit report if it appears',
      'Use our SOL Calculator under Debt Tools to confirm',
    ],
  }
  if (days > 90) return {
    title: 'Settlement Negotiation Strategy',
    urgency: 'Good Settlement Window',
    steps: [
      'You are in a strong position — creditors often accept 30–50% at this stage',
      'Request debt validation first to confirm the amount is accurate',
      'Prepare a lump-sum offer in writing via certified mail',
      'Get any settlement agreement in writing BEFORE sending payment',
      'Use our Settlement Calculator under Debt Tools to set your offer',
    ],
  }
  if (type === 'medical') return {
    title: 'Medical Debt Strategy',
    urgency: 'Multiple Options Available',
    steps: [
      'Request an itemized bill and check for billing errors',
      'Apply for the hospital\'s financial assistance / charity care program',
      'Medical debt under $500 no longer appears on credit reports (CFPB 2025)',
      'Negotiate directly with the hospital billing department for a reduction',
      'Use our Medical Debt Dispute letter if the amount is inaccurate',
    ],
  }
  return {
    title: 'Direct Negotiation Strategy',
    urgency: 'Take Action Now',
    steps: [
      'Request debt validation to confirm what you actually owe',
      'Call the creditor\'s hardship department and explain your situation',
      'Ask for a reduced interest rate, payment plan, or hardship program',
      'Use our AI Coach to practice your negotiation script',
      'Get any agreement in writing before making payments',
    ],
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Step 1: About You
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2: Address
  const [addressLine1, setAddressLine1] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')

  // Step 3: Debt
  const [creditorName, setCreditorName] = useState('')
  const [debtType, setDebtType] = useState('')
  const [originalAmount, setOriginalAmount] = useState('')
  const [currentBalance, setCurrentBalance] = useState('')
  const [daysPastDue, setDaysPastDue] = useState('')

  const strategy = getStrategy(debtType, Number(daysPastDue))

  const canProceed = () => {
    if (step === 1) return fullName.trim().length > 1
    if (step === 2) return addressLine1.trim() && city.trim() && state && zipCode.trim() && !isStateBlocked(state)
    return true
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        phone: phone || null,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state,
        zip_code: zipCode,
        onboarding_completed: true,
      }, { onConflict: 'id' })

      if (creditorName && debtType) {
        await supabase.from('debts').insert({
          user_id: user.id,
          creditor_name: creditorName,
          debt_type: debtType,
          original_amount: Number(originalAmount) || 0,
          current_balance: Number(currentBalance) || Number(originalAmount) || 0,
          status: 'active',
        })
      }

      toast.success('Welcome to DebtCoach AI!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Setup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0',
                  i < step ? 'bg-teal-400 text-navy-200' :
                  i === step ? 'bg-teal-400/20 text-teal-300 border border-teal-400/40' :
                  'bg-white/5 text-white/30 border border-white/10'
                )}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-px mx-1 transition-all', i < step ? 'bg-teal-400' : 'bg-white/10')} />
                )}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs text-center">
            Step {step + 1} of {STEPS.length}: <span className="text-white/70">{STEPS[step]}</span>
          </p>
        </div>

        <div className="card min-h-[460px] flex flex-col">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-teal-400 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-navy-200" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Welcome to DebtCoach AI</h2>
              <p className="text-white/50 leading-relaxed mb-8 max-w-sm text-sm">
                Let&apos;s take 3 minutes to set up your profile. Your information is used to generate
                legally-compliant letters addressed directly from you — ready to mail.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full mb-6 text-left">
                {[
                  { icon: FileText, text: 'Ready-to-mail dispute letters with your real address' },
                  { icon: User, text: 'Know your legal rights under FDCPA & FCRA' },
                  { icon: MapPin, text: 'State-specific laws and SOL calculations' },
                  { icon: CheckCircle, text: 'AI-powered negotiation coaching' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="bg-white/5 rounded-xl p-3">
                    <Icon className="w-4 h-4 text-teal-400 mb-1.5" />
                    <p className="text-white/70 text-xs leading-tight">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: About You */}
          {step === 1 && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">About You</h2>
                <p className="text-white/50 text-sm mb-5">
                  This appears on every letter we generate — use the name you want creditors and bureaus to see.
                </p>
              </div>
              <Input
                label="Full Legal Name *"
                placeholder="e.g. Jane M. Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Phone Number (optional)"
                placeholder="(555) 555-5555"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="bg-teal-400/10 border border-teal-400/20 rounded-xl p-4 mt-2">
                <p className="text-teal-300/80 text-xs leading-relaxed">
                  <strong>Why we need this:</strong> Every dispute letter requires your full legal name as it appears on your credit report and government ID. Incorrect names can cause disputes to be rejected.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Your Mailing Address</h2>
                <p className="text-white/50 text-sm mb-4">
                  Used in the letterhead of every dispute letter and credit bureau dispute you send.
                </p>
              </div>
              <Input
                label="Street Address *"
                placeholder="123 Main Street"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
              <Input
                label="Apt / Suite / Unit (optional)"
                placeholder="Apt 4B"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City *"
                  placeholder="Chicago"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <Input
                  label="ZIP Code *"
                  placeholder="60601"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  maxLength={10}
                />
              </div>
              <Select
                label="State *"
                value={state}
                onChange={(e) => setState(e.target.value)}
                options={[{ value: '', label: 'Select your state...' }, ...US_STATES.map(s => ({ value: s.code, label: s.name }))]}
              />
              {state && isStateBlocked(state) && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm">
                  <p className="text-red-300 font-semibold mb-1">⚠️ Service Not Available in Your State</p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    DebtCoach AI is not currently licensed to operate in <strong className="text-white">{state}</strong> due
                    to state-specific debt management services regulations. We recommend{' '}
                    <a href="https://www.lawhelp.org" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline">lawhelp.org</a>{' '}
                    or{' '}
                    <a href="https://www.nfcc.org" target="_blank" rel="noopener noreferrer" className="text-teal-400 underline">nfcc.org</a>{' '}
                    for free licensed help in your area.
                  </p>
                </div>
              )}
              {state && !isStateBlocked(state) && (
                <div className="bg-white/5 rounded-xl p-3 text-xs text-white/50">
                  📍 <strong className="text-white/70">{state}</strong> — we&apos;ll apply your state&apos;s specific SOL and consumer protection laws.
                </div>
              )}
            </div>
          )}

          {/* Step 3: Debt */}
          {step === 3 && (
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Your First Debt</h2>
                <p className="text-white/50 text-sm mb-4">Start with the one causing the most stress. You can add more from the dashboard.</p>
              </div>
              <Input
                label="Creditor / Collection Agency Name"
                placeholder="e.g. Debt collector or creditor name"
                value={creditorName}
                onChange={(e) => setCreditorName(e.target.value)}
              />
              <div>
                <label className="label">Debt Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {DEBT_TYPES.map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setDebtType(value)}
                      className={cn('p-3 rounded-xl border text-center transition-all text-xs font-medium',
                        debtType === value ? 'border-teal-400/50 bg-teal-400/10 text-teal-300' :
                        'border-white/10 bg-white/5 text-white/50 hover:border-white/20')}>
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Original Amount ($)" type="number" placeholder="5000" value={originalAmount} onChange={(e) => setOriginalAmount(e.target.value)} />
                <Input label="Current Balance ($)" type="number" placeholder="5000" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} />
              </div>
              <Input label="Days Past Due" type="number" placeholder="180" value={daysPastDue} onChange={(e) => setDaysPastDue(e.target.value)} />
              <p className="text-white/30 text-xs">All fields optional — you can fill in details later from the dashboard.</p>
            </div>
          )}

          {/* Step 4: Strategy */}
          {step === 4 && (
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">Your Personalized Strategy</h2>
              <p className="text-white/50 text-sm mb-4">Based on what you&apos;ve told us, here&apos;s where to start:</p>
              <div className="bg-teal-400/10 border border-teal-400/20 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-teal-300 font-semibold text-sm">{strategy.title}</h3>
                  <span className="text-xs bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full">{strategy.urgency}</span>
                </div>
                <ol className="space-y-2">
                  {strategy.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-xs text-white/70">
                      <span className="text-teal-400 font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/60 text-xs leading-relaxed">
                  ✉️ <strong className="text-white/80">Your letters are ready.</strong> Every dispute letter will be pre-addressed from <strong className="text-teal-300">{fullName || 'you'}</strong> at your address — just fill in the creditor details and generate.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(s => s - 1)} icon={<ChevronLeft className="w-4 h-4" />}>Back</Button>
            )}
            <div className="flex-1" />
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} icon={<ChevronRight className="w-4 h-4" />}>
                {step === 0 ? 'Get Started' : 'Continue'}
              </Button>
            ) : (
              <Button onClick={handleComplete} loading={loading}>
                Go to Dashboard →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
