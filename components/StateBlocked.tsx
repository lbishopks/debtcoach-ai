import Link from 'next/link'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { RESTRICTION_NOTES } from '@/lib/state-restrictions'

interface Props {
  stateCode: string
  stateName?: string
}

/**
 * Full-page block shown when a user's state is in the BLOCKED list.
 * Shown at onboarding and on any protected page if the state was set post-signup.
 */
export function StateBlocked({ stateCode, stateName }: Props) {
  const note = RESTRICTION_NOTES[stateCode.toUpperCase()]

  return (
    <div className="min-h-screen bg-navy-200 flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h1 className="text-white text-2xl font-bold mb-3">
          Service Not Available in {stateName || stateCode}
        </h1>

        <p className="text-white/60 text-sm leading-relaxed mb-6">
          DebtCoach AI is not currently available to residents of{' '}
          <strong className="text-white">{stateName || stateCode}</strong> due to
          state-specific licensing requirements for debt management services.
        </p>

        {note && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Legal Basis</p>
            <p className="text-white/60 text-xs">{note}</p>
          </div>
        )}

        <div className="space-y-3 mb-8">
          <p className="text-white/50 text-sm font-medium">Free help is available in your state:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://www.lawhelp.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white text-sm transition-all"
            >
              <span>LawHelp.org</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.nfcc.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white text-sm transition-all"
            >
              <span>NFCC — Free Counseling</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.consumerfinance.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white text-sm transition-all"
            >
              <span>CFPB Consumer Tools</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.annualcreditreport.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white text-sm transition-all"
            >
              <span>Free Credit Report</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <Link
          href="/auth/login"
          className="text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}
