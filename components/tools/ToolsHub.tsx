'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { cn } from '@/lib/utils'
import {
  Calculator, Clock, TrendingDown, BarChart3, ArrowUpDown,
  Plus, Trash2, AlertTriangle, CheckCircle2, Info, XCircle
} from 'lucide-react'

// ─────────────────────────────────────────────
// SOL DATA
// ─────────────────────────────────────────────
const SOL_CREDIT_CARD: Record<string, number> = {
  AL:6,AK:3,AZ:6,AR:5,CA:4,CO:6,CT:6,DE:3,FL:5,GA:6,HI:6,ID:5,IL:5,IN:6,IA:5,
  KS:5,KY:5,LA:3,ME:6,MD:3,MA:6,MI:6,MN:6,MS:3,MO:5,MT:5,NE:5,NV:6,NH:3,NJ:6,
  NM:6,NY:6,NC:3,ND:6,OH:6,OK:5,OR:6,PA:4,RI:10,SC:3,SD:6,TN:6,TX:4,UT:6,VT:6,
  VA:5,WA:6,WV:10,WI:6,WY:8,
}

const US_STATES_ABBR: { value: string; label: string }[] = [
  { value: '', label: 'Select state...' },
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
]

function getSOL(state: string, debtType: string): number | null {
  if (!state || !debtType) return null
  if (debtType === 'student_federal') return null // no SOL
  if (debtType === 'medical') return 3
  if (debtType === 'credit_card') return SOL_CREDIT_CARD[state] ?? 6
  // personal_loan, auto, other => use credit card SOL as proxy
  return SOL_CREDIT_CARD[state] ?? 6
}

// ─────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────
const TOOLS = [
  { id: 'sol', label: 'SOL Calculator', icon: Clock },
  { id: 'settlement', label: 'Settlement Calculator', icon: TrendingDown },
  { id: 'dti', label: 'DTI Calculator', icon: BarChart3 },
  { id: 'payoff', label: 'Payoff Planner', icon: ArrowUpDown },
]

// ─────────────────────────────────────────────
// SOL CALCULATOR
// ─────────────────────────────────────────────
function SOLCalculator() {
  const [state, setState] = useState('')
  const [debtType, setDebtType] = useState('')
  const [lastPaymentDate, setLastPaymentDate] = useState('')
  const [lastActivityDate, setLastActivityDate] = useState('')

  const sol = getSOL(state, debtType)

  const getExpiryDate = (dateStr: string, years: number): Date | null => {
    if (!dateStr) return null
    const d = new Date(dateStr)
    d.setFullYear(d.getFullYear() + years)
    return d
  }

  const today = new Date()
  const referenceDate = lastPaymentDate || lastActivityDate
  const expiryDate = sol && referenceDate ? getExpiryDate(referenceDate, sol) : null

  let status: 'expired' | 'expiring_soon' | 'active' | null = null
  if (expiryDate) {
    const msRemaining = expiryDate.getTime() - today.getTime()
    const daysRemaining = msRemaining / (1000 * 60 * 60 * 24)
    if (msRemaining <= 0) status = 'expired'
    else if (daysRemaining <= 180) status = 'expiring_soon'
    else status = 'active'
  }

  const statusConfig = {
    expired: {
      color: 'bg-green-500/15 border-green-500/30 text-green-300',
      icon: CheckCircle2,
      iconColor: 'text-green-400',
      label: 'Time-Barred (SOL Expired)',
      desc: 'The statute of limitations has passed. Collectors generally cannot sue you to collect this debt. However, the debt may still appear on your credit report.',
    },
    expiring_soon: {
      color: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
      icon: AlertTriangle,
      iconColor: 'text-yellow-400',
      label: 'SOL Expiring Soon',
      desc: 'The statute of limitations will expire within 6 months. Be cautious about making payments or acknowledging this debt in writing.',
    },
    active: {
      color: 'bg-red-500/15 border-red-500/30 text-red-300',
      icon: XCircle,
      iconColor: 'text-red-400',
      label: 'Still Within SOL',
      desc: 'Collectors can still sue you to collect this debt. Consider your options carefully before ignoring collection attempts.',
    },
  }

  const currentConfig = status ? statusConfig[status] : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Your State"
          value={state}
          onChange={e => setState(e.target.value)}
          options={US_STATES_ABBR}
        />
        <Select
          label="Debt Type"
          value={debtType}
          onChange={e => setDebtType(e.target.value)}
          options={[
            { value: '', label: 'Select debt type...' },
            { value: 'credit_card', label: 'Credit Card' },
            { value: 'medical', label: 'Medical' },
            { value: 'student_federal', label: 'Student Loan (Federal)' },
            { value: 'student_private', label: 'Student Loan (Private)' },
            { value: 'personal_loan', label: 'Personal Loan' },
            { value: 'auto', label: 'Auto Loan' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <Input
          label="Date of Last Payment"
          type="date"
          value={lastPaymentDate}
          onChange={e => setLastPaymentDate(e.target.value)}
          hint="Most important date for SOL calculation"
        />
        <Input
          label="Date of Last Activity"
          type="date"
          value={lastActivityDate}
          onChange={e => setLastActivityDate(e.target.value)}
          hint="Used if last payment date is unknown"
        />
      </div>

      {state && debtType && (
        <div className="card p-5 space-y-4">
          {debtType === 'student_federal' ? (
            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-blue-300 text-sm">
                <strong>Federal student loans have no statute of limitations.</strong> The government can collect indefinitely via wage garnishment, tax refund seizure, and Social Security offset without filing a lawsuit.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Statute of Limitations</span>
                <span className="text-white font-bold text-2xl">{sol} years</span>
              </div>
              {expiryDate && currentConfig && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">SOL Expiration Date</span>
                    <span className="text-white font-semibold">
                      {expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', currentConfig.color)}>
                    <currentConfig.icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', currentConfig.iconColor)} />
                    <div>
                      <p className="font-semibold text-sm">{currentConfig.label}</p>
                      <p className="text-sm opacity-80 mt-0.5">{currentConfig.desc}</p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-yellow-300 text-sm">
          <strong>Important:</strong> Making any payment or acknowledging the debt in writing can restart the SOL in most states — even a payment of $1. Never admit the debt is valid without consulting an attorney first.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SETTLEMENT CALCULATOR
// ─────────────────────────────────────────────
function SettlementCalculator() {
  const [currentBalance, setCurrentBalance] = useState('')
  const [originalBalance, setOriginalBalance] = useState('')
  const [monthsDelinquent, setMonthsDelinquent] = useState(6)
  const [debtType, setDebtType] = useState('')
  const [hasIncome, setHasIncome] = useState(true)
  const [collectorType, setCollectorType] = useState('')

  const calc = () => {
    const balance = parseFloat(currentBalance) || 0
    if (!balance || !collectorType) return null

    // Base range by collector type
    let baseMin = 0.40
    let baseMax = 0.60
    if (collectorType === 'debt_buyer') { baseMin = 0.15; baseMax = 0.25 }
    else if (collectorType === 'collection_agency') { baseMin = 0.30; baseMax = 0.45 }
    else if (collectorType === 'law_firm') { baseMin = 0.35; baseMax = 0.55 }

    // Adjust for delinquency (older = lower settlement)
    const ageAdj = Math.min(monthsDelinquent / 36, 0.15)
    baseMin = Math.max(0.10, baseMin - ageAdj)
    baseMax = Math.max(0.15, baseMax - ageAdj * 0.7)

    // Adjust for no income
    if (!hasIncome) { baseMin = Math.max(0.08, baseMin - 0.08); baseMax = Math.max(0.12, baseMax - 0.05) }

    const openingOffer = Math.round(baseMin * 100)
    const walkAway = Math.round(baseMax * 100)
    const expectedMin = Math.round(balance * baseMin)
    const expectedMax = Math.round(balance * baseMax)
    const savings = Math.round(balance - (expectedMin + expectedMax) / 2)

    const strategies: string[] = []
    if (!hasIncome) strategies.push('Your lack of income is a powerful negotiating position — creditors prefer something over nothing.')
    if (monthsDelinquent >= 12) strategies.push("Debt is significantly aged. Collectors paid pennies for it — they'll take a low offer.")
    if (collectorType === 'debt_buyer') strategies.push('Debt buyers purchased your account for 3–7 cents on the dollar. Lowball aggressively.')
    if (collectorType === 'original_creditor') strategies.push('Original creditors are harder — try hardship programs or negotiate just before charge-off (~180 days).')
    strategies.push('Always get any settlement agreement in writing BEFORE making payment.')
    strategies.push('Request that settled debt be reported as "Paid in Full" rather than "Settled for less than full amount."')

    return { openingOffer, walkAway, expectedMin, expectedMax, savings, strategies }
  }

  const result = calc()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Current Balance"
          type="number"
          placeholder="5000"
          value={currentBalance}
          onChange={e => setCurrentBalance(e.target.value)}
        />
        <Input
          label="Original Balance"
          type="number"
          placeholder="4200"
          value={originalBalance}
          onChange={e => setOriginalBalance(e.target.value)}
          hint="Before fees and interest"
        />
        <Select
          label="Debt Type"
          value={debtType}
          onChange={e => setDebtType(e.target.value)}
          options={[
            { value: '', label: 'Select debt type...' },
            { value: 'credit_card', label: 'Credit Card' },
            { value: 'medical', label: 'Medical' },
            { value: 'personal_loan', label: 'Personal Loan' },
            { value: 'auto', label: 'Auto Loan' },
            { value: 'other', label: 'Other' },
          ]}
        />
        <Select
          label="Who Owns the Debt Now?"
          value={collectorType}
          onChange={e => setCollectorType(e.target.value)}
          options={[
            { value: '', label: 'Select collector type...' },
            { value: 'original_creditor', label: 'Original Creditor' },
            { value: 'collection_agency', label: 'Collection Agency' },
            { value: 'debt_buyer', label: 'Debt Buyer' },
            { value: 'law_firm', label: 'Law Firm / Attorney' },
          ]}
        />
      </div>

      <div>
        <label className="label">
          Months Delinquent: <span className="text-teal-400 font-bold">{monthsDelinquent >= 36 ? '36+' : monthsDelinquent}</span>
        </label>
        <input
          type="range"
          min={0}
          max={36}
          value={monthsDelinquent}
          onChange={e => setMonthsDelinquent(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-teal-400 mt-2"
        />
        <div className="flex justify-between text-white/30 text-xs mt-1">
          <span>0 months</span>
          <span>18 months</span>
          <span>36+ months</span>
        </div>
      </div>

      <div>
        <label className="label">Employment / Income</label>
        <button
          type="button"
          onClick={() => setHasIncome(!hasIncome)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-medium',
            hasIncome ? 'bg-white/5 border-white/10 text-white/60' : 'bg-teal-400/15 border-teal-400/40 text-teal-300'
          )}
        >
          <span>{hasIncome ? 'I have income / employment' : 'I have no income (stronger position)'}</span>
          <div className={cn('w-11 h-6 rounded-full relative flex-shrink-0 transition-all', hasIncome ? 'bg-teal-400' : 'bg-white/20')}>
            <div className={cn('absolute top-1 w-4 h-4 bg-white rounded-full transition-all', hasIncome ? 'left-6' : 'left-1')} />
          </div>
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-teal-400">{result.openingOffer}%</div>
              <div className="text-white/50 text-xs mt-1">Opening Offer</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-white">{result.walkAway}%</div>
              <div className="text-white/50 text-xs mt-1">Walk-Away Point</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-xl font-bold text-white">
                ${result.expectedMin.toLocaleString()}–${result.expectedMax.toLocaleString()}
              </div>
              <div className="text-white/50 text-xs mt-1">Expected Range</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-green-400">${result.savings.toLocaleString()}</div>
              <div className="text-white/50 text-xs mt-1">Est. Savings</div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-white font-semibold mb-3">Strategy Notes</h3>
            <ul className="space-y-2">
              {result.strategies.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// DTI CALCULATOR
// ─────────────────────────────────────────────
interface DTIPayment { id: string; name: string; amount: string }

function DTICalculator() {
  const [grossIncome, setGrossIncome] = useState('')
  const [payments, setPayments] = useState<DTIPayment[]>([
    { id: '1', name: 'Mortgage / Rent', amount: '' },
    { id: '2', name: 'Car Payment', amount: '' },
  ])

  const addPayment = () => {
    setPayments(prev => [...prev, { id: Date.now().toString(), name: '', amount: '' }])
  }

  const removePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id))
  }

  const updatePayment = (id: string, field: 'name' | 'amount', value: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const income = parseFloat(grossIncome) || 0
  const totalDebt = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
  const dti = income > 0 ? (totalDebt / income) * 100 : 0

  const getRating = (d: number) => {
    if (d < 20) return { label: 'Excellent', color: 'text-green-400', bar: 'bg-green-400', bg: 'bg-green-500/10 border-green-500/20', pct: d }
    if (d < 35) return { label: 'Good', color: 'text-yellow-400', bar: 'bg-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', pct: d }
    if (d < 50) return { label: 'Warning', color: 'text-orange-400', bar: 'bg-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', pct: d }
    return { label: 'Critical', color: 'text-red-400', bar: 'bg-red-400', bg: 'bg-red-500/10 border-red-500/20', pct: d }
  }

  const rating = income > 0 ? getRating(dti) : null

  const getRecs = (d: number) => {
    if (d < 20) return ['You\'re in excellent shape. Lenders will view you very favorably.', 'Continue making on-time payments to maintain your strong position.']
    if (d < 35) return ['Your DTI is manageable. Most lenders will approve you for new credit.', 'Consider paying down high-interest debt to improve your ratio further.']
    if (d < 50) return ['Your debt load is getting heavy. New credit may be difficult to obtain.', 'Focus on paying down balances before taking on any new debt.', 'Consider contacting creditors about hardship programs or lower rates.']
    return ['Critical DTI — you\'re spending more than half your income on debt.', 'Bankruptcy or debt consolidation may be worth exploring.', 'Stop accumulating new debt immediately.', 'Contact a nonprofit credit counseling agency (NFCC member) for free help.']
  }

  return (
    <div className="space-y-6">
      <Input
        label="Monthly Gross Income"
        type="number"
        placeholder="5000"
        value={grossIncome}
        onChange={e => setGrossIncome(e.target.value)}
        hint="Before taxes, all income sources combined"
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label mb-0">Monthly Debt Payments</label>
          <Button variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={addPayment}>
            Add Payment
          </Button>
        </div>
        <div className="space-y-2">
          {payments.map(p => (
            <div key={p.id} className="flex gap-2 items-center">
              <input
                className="input flex-1 text-sm py-2"
                placeholder="Payment name (e.g. Credit Card)"
                value={p.name}
                onChange={e => updatePayment(p.id, 'name', e.target.value)}
              />
              <input
                className="input w-32 text-sm py-2"
                type="number"
                placeholder="$0"
                value={p.amount}
                onChange={e => updatePayment(p.id, 'amount', e.target.value)}
              />
              <button
                onClick={() => removePayment(p.id)}
                className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {income > 0 && (
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Total Monthly Debt</span>
              <span className="text-white font-bold">${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Gross Monthly Income</span>
              <span className="text-white font-bold">${income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">Debt-to-Income Ratio</span>
                {rating && <span className={cn('font-bold text-2xl', rating.color)}>{dti.toFixed(1)}%</span>}
              </div>
              {/* Bar */}
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', rating?.bar ?? 'bg-teal-400')}
                  style={{ width: `${Math.min(dti, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-white/30 text-xs mt-1">
                <span>0%</span><span>20%</span><span>35%</span><span>50%</span><span>100%</span>
              </div>
            </div>
            {rating && (
              <div className={cn('rounded-xl border px-4 py-3', rating.bg)}>
                <p className={cn('font-semibold text-sm', rating.color)}>{rating.label} DTI</p>
                <p className="text-white/60 text-xs mt-0.5">
                  {dti < 20 && 'Lenders see you as a low-risk borrower with plenty of capacity.'}
                  {dti >= 20 && dti < 35 && 'Most lenders will approve you. Conventional mortgage limit is typically 36%.'}
                  {dti >= 35 && dti < 50 && 'Many lenders will deny credit. FHA loans allow up to 50% but with stricter requirements.'}
                  {dti >= 50 && 'Most lenders will not approve new credit. Debt relief options should be considered.'}
                </p>
              </div>
            )}
          </div>

          {rating && (
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {getRecs(dti).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// PAYOFF PLANNER
// ─────────────────────────────────────────────
interface PayoffDebt {
  id: string
  name: string
  balance: string
  rate: string
  minPayment: string
}

interface PayoffResult {
  name: string
  balance: number
  months: number
  interest: number
  order: number
}

function calcPayoff(debts: PayoffDebt[], extra: number, method: 'avalanche' | 'snowball'): PayoffResult[] {
  const active = debts
    .map(d => ({
      id: d.id,
      name: d.name || 'Unnamed',
      balance: parseFloat(d.balance) || 0,
      rate: parseFloat(d.rate) / 100 / 12,
      minPayment: parseFloat(d.minPayment) || 0,
    }))
    .filter(d => d.balance > 0 && d.minPayment > 0)

  if (active.length === 0) return []

  // Sort: avalanche = highest rate first, snowball = lowest balance first
  const sorted = [...active].sort((a, b) =>
    method === 'avalanche' ? b.rate - a.rate : a.balance - b.balance
  )

  const state = sorted.map(d => ({ ...d, paid: 0, totalInterest: 0, paidOffMonth: 0 }))
  let month = 0
  const MAX_MONTHS = 600

  while (state.some(d => d.paid < d.balance) && month < MAX_MONTHS) {
    month++
    let availableExtra = extra

    // Pay minimums + accrue interest
    for (const d of state) {
      if (d.paid >= d.balance) continue
      const remaining = d.balance - d.paid
      const interest = remaining * d.rate
      d.totalInterest += interest
      const payment = Math.min(d.minPayment, remaining + interest)
      d.paid += payment - interest
      d.paid = Math.min(d.paid, d.balance)
    }

    // Apply extra to first unpaid debt
    for (const d of state) {
      if (d.paid >= d.balance || availableExtra <= 0) continue
      const remaining = d.balance - d.paid
      const extra2 = Math.min(availableExtra, remaining)
      d.paid += extra2
      availableExtra -= extra2
    }

    // Mark paid off
    for (const d of state) {
      if (d.paidOffMonth === 0 && d.paid >= d.balance) {
        d.paidOffMonth = month
      }
    }
  }

  return sorted.map((d, i) => ({
    name: d.name,
    balance: d.balance,
    months: state[i].paidOffMonth || MAX_MONTHS,
    interest: Math.round(state[i].totalInterest),
    order: i + 1,
  }))
}

function PayoffPlanner() {
  const [debts, setDebts] = useState<PayoffDebt[]>([
    { id: '1', name: '', balance: '', rate: '', minPayment: '' },
    { id: '2', name: '', balance: '', rate: '', minPayment: '' },
  ])
  const [extraPayment, setExtraPayment] = useState('')

  const addDebt = () => {
    setDebts(prev => [...prev, { id: Date.now().toString(), name: '', balance: '', rate: '', minPayment: '' }])
  }

  const removeDebt = (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id))
  }

  const updateDebt = (id: string, field: keyof PayoffDebt, value: string) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  const extra = parseFloat(extraPayment) || 0
  const hasData = debts.some(d => d.balance && d.rate && d.minPayment)

  const avalanche = hasData ? calcPayoff(debts, extra, 'avalanche') : []
  const snowball = hasData ? calcPayoff(debts, extra, 'snowball') : []

  const avTotalInterest = avalanche.reduce((s, d) => s + d.interest, 0)
  const snTotalInterest = snowball.reduce((s, d) => s + d.interest, 0)
  const avMaxMonths = avalanche.length ? Math.max(...avalanche.map(d => d.months)) : 0
  const snMaxMonths = snowball.length ? Math.max(...snowball.map(d => d.months)) : 0
  const savings = snTotalInterest - avTotalInterest

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="label mb-0">Your Debts</label>
          <Button variant="secondary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={addDebt}>
            Add Debt
          </Button>
        </div>
        <div className="space-y-2">
          <div className="hidden sm:grid grid-cols-12 gap-2 px-1">
            <span className="col-span-3 text-xs text-white/40">Name</span>
            <span className="col-span-3 text-xs text-white/40">Balance ($)</span>
            <span className="col-span-3 text-xs text-white/40">Rate (%)</span>
            <span className="col-span-2 text-xs text-white/40">Min. Pmt</span>
          </div>
          {debts.map(d => (
            <div key={d.id} className="grid grid-cols-12 gap-2 items-center">
              <input className="input col-span-3 text-sm py-2" placeholder="Name" value={d.name} onChange={e => updateDebt(d.id, 'name', e.target.value)} />
              <input className="input col-span-3 text-sm py-2" type="number" placeholder="Balance" value={d.balance} onChange={e => updateDebt(d.id, 'balance', e.target.value)} />
              <input className="input col-span-3 text-sm py-2" type="number" placeholder="APR %" value={d.rate} onChange={e => updateDebt(d.id, 'rate', e.target.value)} step="0.1" />
              <input className="input col-span-2 text-sm py-2" type="number" placeholder="Min" value={d.minPayment} onChange={e => updateDebt(d.id, 'minPayment', e.target.value)} />
              <button onClick={() => removeDebt(d.id)} className="col-span-1 flex justify-center text-white/30 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Input
        label="Extra Monthly Payment"
        type="number"
        placeholder="0"
        value={extraPayment}
        onChange={e => setExtraPayment(e.target.value)}
        hint="Amount above minimums you can put toward debt payoff"
      />

      {hasData && avalanche.length > 0 && (
        <div className="space-y-4">
          {savings > 0 && (
            <div className="card p-4 bg-teal-400/5 border-teal-400/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Avalanche saves you <span className="text-teal-400">${savings.toLocaleString()}</span> in interest</p>
                <p className="text-white/50 text-sm">and pays off {snMaxMonths - avMaxMonths} months faster than Snowball</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Avalanche */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-teal-400" />
                <h3 className="text-white font-semibold">Debt Avalanche</h3>
                <span className="badge text-xs ml-auto">Saves Most Money</span>
              </div>
              <p className="text-white/40 text-xs mb-4">Pay highest interest rate first</p>
              <div className="space-y-2 mb-4">
                {avalanche.map((d, i) => (
                  <div key={d.name + i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-400/20 text-teal-300 text-xs flex items-center justify-center font-bold flex-shrink-0">{d.order}</span>
                      <span className="text-white/70 truncate max-w-[120px]">{d.name}</span>
                    </div>
                    <span className="text-white/50 text-xs">{d.months} mo.</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total interest</span>
                  <span className="text-white font-semibold">${avTotalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Payoff time</span>
                  <span className="text-white font-semibold">{avMaxMonths} months ({(avMaxMonths / 12).toFixed(1)} yrs)</span>
                </div>
              </div>
            </div>

            {/* Snowball */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpDown className="w-4 h-4 text-blue-400" />
                <h3 className="text-white font-semibold">Debt Snowball</h3>
                <span className="bg-blue-400/20 text-blue-300 text-xs px-2 py-0.5 rounded-full ml-auto">Best Motivation</span>
              </div>
              <p className="text-white/40 text-xs mb-4">Pay lowest balance first</p>
              <div className="space-y-2 mb-4">
                {snowball.map((d, i) => (
                  <div key={d.name + i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-300 text-xs flex items-center justify-center font-bold flex-shrink-0">{d.order}</span>
                      <span className="text-white/70 truncate max-w-[120px]">{d.name}</span>
                    </div>
                    <span className="text-white/50 text-xs">{d.months} mo.</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total interest</span>
                  <span className="text-white font-semibold">${snTotalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Payoff time</span>
                  <span className="text-white font-semibold">{snMaxMonths} months ({(snMaxMonths / 12).toFixed(1)} yrs)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// TOOLS HUB
// ─────────────────────────────────────────────
export function ToolsHub() {
  const [activeTab, setActiveTab] = useState('sol')

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="section-header flex items-center gap-3">
          <Calculator className="w-7 h-7 text-teal-400" />
          Debt Tools
        </h1>
        <p className="section-subheader mt-1">
          Free calculators to understand your debt situation, SOL status, and the best payoff strategy.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-8 overflow-x-auto">
        {TOOLS.map(tool => {
          const Icon = tool.icon
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={cn(
                'flex items-center gap-2 flex-1 min-w-max py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                activeTab === tool.id
                  ? 'bg-teal-400/20 text-teal-300 border border-teal-400/20'
                  : 'text-white/50 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4" />
              {tool.label}
            </button>
          )
        })}
      </div>

      {/* Tool Content */}
      <div className="card p-6">
        {activeTab === 'sol' && <SOLCalculator />}
        {activeTab === 'settlement' && <SettlementCalculator />}
        {activeTab === 'dti' && <DTICalculator />}
        {activeTab === 'payoff' && <PayoffPlanner />}
      </div>
    </div>
  )
}
