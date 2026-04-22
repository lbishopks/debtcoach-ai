import { Zap, Wrench } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-teal-400/15 border border-teal-400/30 rounded-2xl flex items-center justify-center">
            <Zap className="w-8 h-8 text-teal-400" />
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-amber-400/10 border border-amber-400/20 rounded-full flex items-center justify-center">
            <Wrench className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">Under Maintenance</h1>
          <p className="text-white/50 text-lg leading-relaxed">
            DebtCoach AI is currently undergoing scheduled maintenance.
            We&apos;ll be back online shortly.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* Footer note */}
        <p className="text-white/30 text-sm">
          Thank you for your patience. If you have an urgent question, please check back soon.
        </p>
      </div>
    </div>
  )
}
