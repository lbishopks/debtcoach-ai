'use client'
import { useState } from 'react'
import { Search, Shield, FileSearch, AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

// Statute of Limitations by state (years for credit cards/written contracts)
const SOL_BY_STATE: Record<string, { written: number; oral: number; openEnded: number }> = {
  'Alabama': { written: 6, oral: 6, openEnded: 6 },
  'Alaska': { written: 3, oral: 3, openEnded: 3 },
  'Arizona': { written: 6, oral: 3, openEnded: 6 },
  'Arkansas': { written: 5, oral: 3, openEnded: 5 },
  'California': { written: 4, oral: 2, openEnded: 4 },
  'Colorado': { written: 6, oral: 6, openEnded: 6 },
  'Connecticut': { written: 6, oral: 3, openEnded: 6 },
  'Delaware': { written: 3, oral: 3, openEnded: 4 },
  'Florida': { written: 5, oral: 4, openEnded: 4 },
  'Georgia': { written: 6, oral: 4, openEnded: 6 },
  'Hawaii': { written: 6, oral: 6, openEnded: 6 },
  'Idaho': { written: 5, oral: 4, openEnded: 5 },
  'Illinois': { written: 5, oral: 5, openEnded: 5 },
  'Indiana': { written: 6, oral: 6, openEnded: 6 },
  'Iowa': { written: 5, oral: 5, openEnded: 5 },
  'Kansas': { written: 5, oral: 3, openEnded: 3 },
  'Kentucky': { written: 10, oral: 5, openEnded: 5 },
  'Louisiana': { written: 3, oral: 3, openEnded: 3 },
  'Maine': { written: 6, oral: 6, openEnded: 6 },
  'Maryland': { written: 3, oral: 3, openEnded: 3 },
  'Massachusetts': { written: 6, oral: 6, openEnded: 6 },
  'Michigan': { written: 6, oral: 6, openEnded: 6 },
  'Minnesota': { written: 6, oral: 6, openEnded: 6 },
  'Mississippi': { written: 3, oral: 3, openEnded: 3 },
  'Missouri': { written: 5, oral: 5, openEnded: 5 },
  'Montana': { written: 5, oral: 5, openEnded: 5 },
  'Nebraska': { written: 5, oral: 4, openEnded: 5 },
  'Nevada': { written: 6, oral: 4, openEnded: 4 },
  'New Hampshire': { written: 3, oral: 3, openEnded: 3 },
  'New Jersey': { written: 6, oral: 6, openEnded: 6 },
  'New Mexico': { written: 6, oral: 4, openEnded: 6 },
  'New York': { written: 3, oral: 3, openEnded: 3 },
  'North Carolina': { written: 3, oral: 3, openEnded: 3 },
  'North Dakota': { written: 6, oral: 6, openEnded: 6 },
  'Ohio': { written: 6, oral: 6, openEnded: 6 },
  'Oklahoma': { written: 5, oral: 3, openEnded: 5 },
  'Oregon': { written: 6, oral: 6, openEnded: 6 },
  'Pennsylvania': { written: 4, oral: 4, openEnded: 4 },
  'Rhode Island': { written: 10, oral: 10, openEnded: 4 },
  'South Carolina': { written: 3, oral: 3, openEnded: 3 },
  'South Dakota': { written: 6, oral: 6, openEnded: 6 },
  'Tennessee': { written: 6, oral: 6, openEnded: 6 },
  'Texas': { written: 4, oral: 4, openEnded: 4 },
  'Utah': { written: 6, oral: 4, openEnded: 6 },
  'Vermont': { written: 6, oral: 6, openEnded: 6 },
  'Virginia': { written: 5, oral: 3, openEnded: 3 },
  'Washington': { written: 6, oral: 3, openEnded: 3 },
  'West Virginia': { written: 10, oral: 5, openEnded: 10 },
  'Wisconsin': { written: 6, oral: 6, openEnded: 6 },
  'Wyoming': { written: 8, oral: 8, openEnded: 8 },
}

const FDCPA_RIGHTS = [
  {
    category: 'When Collectors CAN Contact You',
    color: 'text-green-400 bg-green-400/10',
    items: [
      'Between 8 AM and 9 PM in your local time zone',
      'At your home phone number',
      'At your workplace (unless you tell them to stop)',
      'By mail, email, or text (with limitations)',
    ],
  },
  {
    category: 'When Collectors CANNOT Contact You',
    color: 'text-red-400 bg-red-400/10',
    items: [
      'Before 8 AM or after 9 PM',
      'At work if you say your employer disapproves',
      'If you have an attorney (must contact attorney instead)',
      'After you send a written cease and desist',
      'Using abusive, threatening, or obscene language',
      'Making false statements or misrepresentations',
    ],
  },
  {
    category: 'They CANNOT',
    color: 'text-orange-400 bg-orange-400/10',
    items: [
      'Threaten violence or harm',
      'Use profane language',
      'Publish your name on a "bad debtor" list',
      'Threaten to garnish wages without a court order',
      'Claim to be attorneys or government officials if they\'re not',
      'Tell others about your debt (except your spouse or attorney)',
      'Collect more than you owe (interest/fees must be authorized)',
      'Deposit a post-dated check before the date on the check',
    ],
  },
]

const FCRA_RIGHTS = [
  'Access your free credit report from each bureau annually at AnnualCreditReport.com',
  'Dispute inaccurate or incomplete information on your credit report',
  'Require consumer reporting agencies to correct or delete inaccurate information within 30 days',
  'Know if information in your file has been used against you',
  'Seek damages from violators (you can sue in federal or state court)',
  'Negative information (except bankruptcy) must be removed after 7 years',
  'Chapter 7 bankruptcy stays on your report for 10 years',
  'Creditors who provide false information to credit bureaus can be sued',
]

interface AccordionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors"
      >
        <span className="text-white font-semibold text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-white/10 pt-4">{children}</div>}
    </div>
  )
}

export function KnowYourRights({ userState }: { userState: string }) {
  const [search, setSearch] = useState('')
  const [stateSearch, setStateSearch] = useState(userState)

  const solStates = Object.entries(SOL_BY_STATE).filter(([state]) =>
    !search || state.toLowerCase().includes(search.toLowerCase())
  )

  const userSOL = userState ? SOL_BY_STATE[userState] : null

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="section-header">Know Your Rights</h1>
        <p className="section-subheader">Plain-English breakdown of your consumer debt rights under federal and state law</p>
      </div>

      {/* Your State Spotlight */}
      {userState && userSOL && (
        <div className="card border-teal-400/20 bg-teal-400/5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-teal-400" />
            <h2 className="text-teal-300 font-semibold">Your State: {userState}</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{userSOL.openEnded}yr</p>
              <p className="text-white/50 text-xs mt-1">Credit Card SOL</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{userSOL.written}yr</p>
              <p className="text-white/50 text-xs mt-1">Written Contract SOL</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{userSOL.oral}yr</p>
              <p className="text-white/50 text-xs mt-1">Oral Contract SOL</p>
            </div>
          </div>
          <p className="text-white/40 text-xs mt-3">
            ⚠️ Making a payment or acknowledging the debt may restart the SOL clock.
            Consult an attorney if you&apos;re unsure.
          </p>
        </div>
      )}

      {/* FDCPA Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-white font-bold">FDCPA — Fair Debt Collection Practices Act</h2>
        </div>
        <p className="text-white/50 text-sm mb-4">
          Enacted in 1977, the FDCPA regulates how third-party debt collectors (not original creditors)
          can contact and treat consumers. Violations can result in $1,000 per violation in damages.
        </p>

        <div className="space-y-3">
          {FDCPA_RIGHTS.map((section) => (
            <Accordion key={section.category} title={section.category} defaultOpen={section.category.includes('CANNOT')}>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-white/70 text-sm">
                    <span className={cn('w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-xs', section.color)}>
                      {section.category.includes('CAN Contact') ? '✓' : '✗'}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Accordion>
          ))}
        </div>
      </div>

      {/* FCRA Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <FileSearch className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-white font-bold">FCRA — Fair Credit Reporting Act</h2>
        </div>
        <p className="text-white/50 text-sm mb-4">
          The FCRA promotes accuracy and privacy of information in the files of consumer reporting agencies.
          It gives you powerful rights to dispute and correct your credit report.
        </p>

        <div className="card">
          <ul className="space-y-3">
            {FCRA_RIGHTS.map((right) => (
              <li key={right} className="flex items-start gap-3 text-white/70 text-sm">
                <span className="w-5 h-5 bg-purple-500/20 text-purple-300 rounded flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">✓</span>
                {right}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Debt Validation Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </div>
          <h2 className="text-white font-bold">Debt Validation — Your 30-Day Window</h2>
        </div>

        <div className="card space-y-4">
          <p className="text-white/70 text-sm leading-relaxed">
            Within <strong className="text-white">5 days of first contact</strong>, a debt collector must send you a written
            notice with the amount owed and creditor name. You then have <strong className="text-white">30 days</strong> to
            request validation of the debt.
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <h4 className="text-yellow-300 font-semibold text-sm mb-2">What to Request in Validation:</h4>
            <ul className="space-y-1 text-white/60 text-sm">
              {[
                'The full amount of the debt, including all fees',
                'The name and address of the original creditor',
                'Proof that the collector has the right to collect the debt',
                'A copy of the original signed agreement',
                'Payment history showing how the amount was calculated',
              ].map(item => (
                <li key={item} className="flex gap-2"><span className="text-yellow-400">→</span>{item}</li>
              ))}
            </ul>
          </div>
          <p className="text-white/50 text-xs">
            ⚡ While validation is pending, the collector must cease all collection activities.
            If they can&apos;t validate, they must stop collecting.
          </p>
        </div>
      </div>

      {/* SOL by State Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Statute of Limitations by State</h2>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              className="input pl-8 py-1.5 text-xs"
              placeholder="Filter states..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <p className="text-white/40 text-xs mb-4">
          After the SOL expires, the debt becomes &quot;time-barred&quot; — collectors cannot legally sue you to collect it.
          However, you may still owe the debt morally and it may still appear on your credit report.
        </p>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="pb-3 text-white/50 text-xs font-medium pr-4">State</th>
                <th className="pb-3 text-white/50 text-xs font-medium pr-4">Credit Card</th>
                <th className="pb-3 text-white/50 text-xs font-medium pr-4">Written Contract</th>
                <th className="pb-3 text-white/50 text-xs font-medium">Oral Agreement</th>
              </tr>
            </thead>
            <tbody>
              {solStates.map(([state, sol]) => (
                <tr
                  key={state}
                  className={cn(
                    'border-b border-white/5 hover:bg-white/3',
                    state === userState && 'bg-teal-400/5'
                  )}
                >
                  <td className="py-2.5 pr-4">
                    <span className={cn('text-sm', state === userState ? 'text-teal-300 font-semibold' : 'text-white/70')}>
                      {state === userState ? '★ ' : ''}{state}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={cn(
                      'badge',
                      sol.openEnded <= 3 ? 'bg-green-500/20 text-green-300' :
                      sol.openEnded <= 5 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    )}>
                      {sol.openEnded} years
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-white/60 text-sm">{sol.written} years</td>
                  <td className="py-2.5 text-white/60 text-sm">{sol.oral} years</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-white/30 text-xs mt-3">
          * SOL periods vary by debt type and state. Consult a consumer law attorney for advice specific to your situation.
        </p>
      </div>

      {/* Resources */}
      <div>
        <h2 className="text-white font-bold mb-4">Official Resources</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { name: 'CFPB Complaint Portal', url: 'https://www.consumerfinance.gov/complaint/', desc: 'File complaints against debt collectors' },
            { name: 'FTC Complaint Portal', url: 'https://reportfraud.ftc.gov/', desc: 'Report fraud and deceptive practices' },
            { name: 'AnnualCreditReport.com', url: 'https://www.annualcreditreport.com/', desc: 'Free credit reports from all 3 bureaus' },
            { name: 'NCLC — National Consumer Law Center', url: 'https://www.nclc.org/', desc: 'Free consumer law resources and guides' },
          ].map(r => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-hover flex items-center gap-3"
            >
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{r.name}</p>
                <p className="text-white/40 text-xs">{r.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
