'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Calculator, AlertTriangle, CheckCircle, Clock, ArrowRight, Shield, Info } from 'lucide-react'
import {
  US_STATES,
  DEBT_CATEGORY_LABELS,
  calculateSOLStatus,
  type DebtCategory,
  type SOLStatus,
} from '@/lib/sol-data'

const DEBT_CATEGORIES = Object.entries(DEBT_CATEGORY_LABELS) as [DebtCategory, string][]

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function ResultBanner({ status }: { status: SOLStatus }) {
  if (status.warningLevel === 'expired') {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-400/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-red-400 font-bold text-xl mb-1">This Debt May Be Time-Barred</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              Based on your state and debt type, the statute of limitations has likely expired.
              The collector has been past the SOL for approximately{' '}
              <strong className="text-white">
                {Math.abs(status.yearsElapsed - status.yearsTotal).toFixed(1)} years
              </strong>. They may no longer be able to sue you to collect this debt.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status.warningLevel === 'warning') {
    return (
      <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-yellow-400 font-bold text-xl mb-1">SOL Expiring Soon — Caution</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              This debt is still within the statute of limitations, but it expires in approximately{' '}
              <strong className="text-white">
                {status.monthsRemaining} month{status.monthsRemaining !== 1 ? 's' : ''}
              </strong>. Do not make any payment or acknowledge the debt in writing without consulting an attorney — it may restart the clock.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-teal-400/30 bg-teal-400/10 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-teal-400/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-teal-400" />
        </div>
        <div>
          <h3 className="text-teal-400 font-bold text-xl mb-1">Debt Is Within the SOL Window</h3>
          <p className="text-white/70 text-sm leading-relaxed">
            Approximately{' '}
            <strong className="text-white">
              {status.yearsRemaining} year{status.yearsRemaining !== 1 ? 's' : ''} (
              {status.monthsRemaining} months)
            </strong>{' '}
            remain before this debt becomes time-barred. The collector can likely still sue
            during this period.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SOLCalculatorPage() {
  const [stateCode, setStateCode] = useState('')
  const [category, setCategory] = useState<DebtCategory | ''>('')
  const [lastActivityDate, setLastActivityDate] = useState('')
  const [result, setResult] = useState<SOLStatus | null>(null)
  const [selectedStateName, setSelectedStateName] = useState('')
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function handleCalculate() {
    if (!stateCode || !category || !lastActivityDate) return
    const status = calculateSOLStatus(stateCode, category, lastActivityDate)
    setResult(status)
    setSelectedStateName(US_STATES.find(s => s.code === stateCode)?.name ?? stateCode)
    setSelectedCategoryLabel(DEBT_CATEGORY_LABELS[category as DebtCategory] ?? category)
    // Scroll to results
    setTimeout(() => {
      document.getElementById('sol-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const isFormValid = stateCode && category && lastActivityDate

  return (
    <div className="min-h-screen bg-navy-200 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-md bg-navy-200/90">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-400 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-navy-200" />
            </div>
            <span className="font-bold text-white">DebtCoach AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-teal-400 text-navy-200 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-teal-300 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 rounded-full px-4 py-2 text-teal-300 text-xs font-medium mb-6">
            <Calculator className="w-3.5 h-3.5" />
            Free Tool — No Account Required
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Statute of Limitations Calculator
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            Find out if a debt collector has waited too long to sue you. Enter your state,
            debt type, and date of last payment to see if the clock has run out.
          </p>
        </div>
      </section>

      {/* Calculator Card */}
      <section className="pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-navy-100 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-teal-400/15 border border-teal-400/30 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-white font-bold text-xl">SOL Calculator</h2>
            </div>

            <div className="space-y-5">
              {/* State */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Your State
                </label>
                <select
                  value={stateCode}
                  onChange={e => setStateCode(e.target.value)}
                  className="w-full bg-navy-200 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/30 transition-colors appearance-none"
                >
                  <option value="">Select your state…</option>
                  {US_STATES.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Debt Type */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Type of Debt
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as DebtCategory)}
                  className="w-full bg-navy-200 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/30 transition-colors appearance-none"
                >
                  <option value="">Select debt type…</option>
                  {DEBT_CATEGORIES.map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Date of Last Payment or Account Activity
                </label>
                <input
                  type="date"
                  value={lastActivityDate}
                  max={today}
                  onChange={e => setLastActivityDate(e.target.value)}
                  className="w-full bg-navy-200 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal-400/60 focus:ring-1 focus:ring-teal-400/30 transition-colors"
                />
                <p className="text-white/40 text-xs mt-1.5">
                  Use the date of your last payment, charge, or written acknowledgment of the debt.
                </p>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!isFormValid}
                className="w-full bg-teal-400 text-navy-200 font-bold py-4 rounded-2xl text-sm hover:bg-teal-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Calculate My SOL Status
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      {result && (
        <section id="sol-results" className="pb-12 px-4 animate-fade-in">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Status Banner */}
            <ResultBanner status={result} />

            {/* Detail Card */}
            <div className="bg-navy-100 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-bold text-base">Calculation Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'State', value: selectedStateName },
                  { label: 'Debt Type', value: selectedCategoryLabel },
                  {
                    label: 'SOL Period',
                    value: `${result.yearsTotal} year${result.yearsTotal !== 1 ? 's' : ''}`,
                  },
                  { label: 'SOL Expiry Date', value: formatDate(result.expiryDate) },
                  {
                    label: 'Years Elapsed',
                    value: `${result.yearsElapsed} yr${result.yearsElapsed !== 1 ? 's' : ''}`,
                  },
                  {
                    label: result.isTimedOut ? 'Expired' : 'Time Remaining',
                    value: result.isTimedOut
                      ? 'Expired'
                      : `${result.monthsRemaining} month${result.monthsRemaining !== 1 ? 's' : ''}`,
                  },
                ].map(item => (
                  <div key={item.label} className="bg-navy-200/60 rounded-xl p-3">
                    <p className="text-white/40 text-xs mb-0.5">{item.label}</p>
                    <p className="text-white font-semibold text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What This Means */}
            <div className="bg-navy-100 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-teal-400" />
                <h3 className="text-white font-bold text-base">What This Means</h3>
              </div>
              <div className="space-y-3 text-white/60 text-sm leading-relaxed">
                {result.warningLevel === 'expired' ? (
                  <>
                    <p>
                      <strong className="text-white">The SOL appears to have expired.</strong> This means the collector likely cannot win a lawsuit against you in court to collect this debt — it is "time-barred."
                    </p>
                    <p>
                      You still legally owe the debt, and collectors may still contact you. However, you have a defense if they sue. You can raise the SOL as an affirmative defense in court.
                    </p>
                    <p>
                      <strong className="text-teal-300">Critical warning:</strong> If you make any payment, agree in writing that you owe the debt, or in some states even verbally acknowledge it, you may reset the clock and revive the SOL. Do not make any payment without consulting an attorney.
                    </p>
                  </>
                ) : result.warningLevel === 'warning' ? (
                  <>
                    <p>
                      <strong className="text-white">The SOL has not yet expired</strong>, but it is expiring soon. The collector still has a limited window to file a lawsuit.
                    </p>
                    <p>
                      As you approach the expiration, collectors may become more aggressive — they know their window is closing. Do not make any payment or written acknowledgment without legal advice.
                    </p>
                    <p>
                      Consider consulting a consumer rights attorney now to understand your options before the SOL expires.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong className="text-white">The SOL has not yet expired.</strong> The collector is still within their legal window to file a lawsuit to collect this debt.
                    </p>
                    <p>
                      This does not mean you have to pay — you may still have other defenses, such as errors in the amount owed, violations of the FDCPA, or issues with debt ownership.
                    </p>
                    <p>
                      Track this debt carefully and consult a consumer rights attorney if you are sued.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-teal-400/15 to-navy-100 border border-teal-400/30 rounded-2xl p-6 text-center">
              <Shield className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">
                Generate a SOL Defense Letter
              </h3>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                DebtCoach AI can generate a professionally-referenced statute of limitations
                defense letter to send to collectors or use in court.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 bg-teal-400 text-navy-200 font-bold px-6 py-3 rounded-xl text-sm hover:bg-teal-300 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Education Section */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Understanding the Statute of Limitations</h2>
            <p className="text-white/50 text-sm">What every debtor should know</p>
          </div>

          {[
            {
              title: 'What Is the Statute of Limitations on Debt?',
              body: `The statute of limitations (SOL) is the deadline by which a creditor or debt collector must file a lawsuit to collect a debt. Once this period expires, the debt is considered "time-barred" and the collector generally cannot win a lawsuit against you — even if you legally owe the money.`,
            },
            {
              title: 'When Does the Clock Start?',
              body: `The SOL clock typically starts from the date of your last payment, last charge, or last written acknowledgment of the debt. The exact trigger date can vary by state and debt type, which is why it's important to know your state's specific rules.`,
            },
            {
              title: 'What Happens When the SOL Expires?',
              body: `After the SOL expires, you can raise it as an "affirmative defense" if a collector sues you. The court should dismiss the case. However, the debt may still appear on your credit report for up to 7 years from the date of first delinquency (a separate clock from the SOL). You still legally owe the debt — the SOL only affects the collector's ability to sue.`,
            },
            {
              title: `Warning: Payments Can Restart the Clock`,
              body: `This is critical. In most states, making a payment — even a small one — on a time-barred debt can restart the SOL clock, giving the collector a fresh window to sue. Verbally acknowledging the debt or making a written promise to pay can also restart the clock in some states. Never make a payment on old debt without consulting an attorney first.`,
            },
            {
              title: 'What About Zombie Debt?',
              body: `"Zombie debt" is old, time-barred debt that debt buyers purchase for pennies on the dollar and then try to collect. They may contact you years after the SOL has expired, hoping you will make a payment (which restarts the clock) or that you will not raise the SOL as a defense. If you receive calls about very old debt, this calculator can help you determine whether the SOL has passed.`,
            },
          ].map(item => (
            <div key={item.title} className="bg-navy-100 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <p className="text-white/40 text-xs leading-relaxed">
              <strong className="text-white/60">Legal Disclaimer:</strong> This calculator provides
              general educational information based on publicly available state law data. SOL rules
              are complex and fact-specific — the applicable SOL may depend on where the creditor
              is located, where the contract was signed, choice-of-law clauses in credit agreements,
              and other factors not captured here. This tool is for informational purposes only and
              does not constitute legal advice. Consult a licensed attorney in your state for advice
              on your specific situation before taking any action.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-400 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-navy-200" />
            </div>
            <span className="text-white/60 text-sm font-medium">DebtCoach AI</span>
          </Link>
          <p className="text-white/30 text-xs text-center">
            Not legal advice · Educational purposes only · Not a law firm
          </p>
          <div className="flex gap-4 text-white/40 text-xs">
            <Link href="/privacy" className="hover:text-white/70">Privacy</Link>
            <a href="mailto:support@thedebtcoachai.com" className="hover:text-white/70">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
