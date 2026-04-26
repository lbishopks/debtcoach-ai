import Link from 'next/link'
import { Zap, MapPin } from 'lucide-react'

export default function NotAvailablePage() {
  return (
    <div className="min-h-screen bg-navy-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-teal-400/10 border border-teal-400/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-8 h-8 text-teal-400" />
        </div>

        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-teal-400 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-navy-200" />
          </div>
          <span className="font-bold text-white">DebtCoach AI</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          Not Available in California
        </h1>
        <p className="text-white/50 text-sm leading-relaxed mb-6">
          DebtCoach AI is not currently available to residents of California.
          We apologize for the inconvenience.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-8 text-left">
          <p className="text-white/40 text-xs leading-relaxed">
            California has specific laws governing services like ours that we are working to comply with.
            We hope to serve California residents in the future.
            In the meantime, free resources are available through{' '}
            <a href="https://www.consumerfinance.gov" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">consumerfinance.gov</a>,{' '}
            <a href="https://lawhelp.org" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">lawhelp.org</a>, and your{' '}
            <a href="https://oag.ca.gov/consumers" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">California Attorney General&apos;s office</a>.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
