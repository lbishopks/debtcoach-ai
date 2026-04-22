import Link from 'next/link'
import { Zap, MessageSquare, FileText, BookOpen, Shield, CheckCircle, ArrowRight, Star, TrendingDown } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-200 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-md bg-navy-200/90">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-400 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-navy-200" />
            </div>
            <span className="font-bold text-white">DebtCoach AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-teal-400 text-navy-200 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-teal-300 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 rounded-full px-4 py-2 text-teal-300 text-xs font-medium mb-8">
            <Star className="w-3.5 h-3.5" />
            AI-Powered Debt Negotiation Assistant
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Fight Back Against
            <span className="block bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
              Debt Collectors
            </span>
          </h1>

          <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            DebtCoach AI helps you understand your consumer rights, generates dispute letter templates,
            and guides your journey to becoming debt-free — all in plain English.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-teal-400 text-navy-200 font-bold px-8 py-4 rounded-2xl text-base hover:bg-teal-300 transition-all hover:shadow-lg hover:shadow-teal-400/20 active:scale-95"
            >
              Start Free — No Credit Card
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-base hover:bg-white/15 transition-all border border-white/10"
            >
              Sign In
            </Link>
          </div>

          <p className="text-white/30 text-sm mt-6">Free plan includes 3 AI messages/day · No credit card required</p>

          {/* Legal Disclaimer */}
          <div className="mt-8 max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-left">
            <p className="text-white/40 text-xs leading-relaxed">
              <strong className="text-white/60">⚖️ Legal Disclaimer:</strong> DebtCoach AI is not a law firm and does not provide legal advice. All AI-generated content is for general educational and informational purposes only. Nothing on this platform creates an attorney-client relationship. DebtCoach AI is not available in North Carolina or other states with licensing requirements for debt management services. Always consult a licensed attorney in your state before taking legal action or sending correspondence to creditors or debt collectors.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Win</h2>
            <p className="text-white/50 max-w-xl mx-auto">Built by consumer rights experts. Powered by Claude AI.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: MessageSquare,
                title: 'AI Negotiation Coach',
                desc: 'Get consumer rights information on FDCPA, FCRA, statute of limitations by state, and general guidance on negotiation tactics.',
                color: 'text-teal-400 bg-teal-400/10',
                badge: 'Core Feature',
              },
              {
                icon: FileText,
                title: 'Dispute Letter Generator',
                desc: 'Generate legally-referenced dispute letter templates in seconds. Educational use only — review with an attorney before sending.',
                color: 'text-yellow-400 bg-yellow-400/10',
                badge: null,
              },
              {
                icon: TrendingDown,
                title: 'Debt Tracker Dashboard',
                desc: 'Track multiple debts, negotiation status, and visualize your total debt reduction over time.',
                color: 'text-blue-400 bg-blue-400/10',
                badge: null,
              },
              {
                icon: BookOpen,
                title: 'Phone Script Library',
                desc: 'Ready-to-use scripts for settlement calls, cease & desist, pay-for-delete, and more.',
                color: 'text-purple-400 bg-purple-400/10',
                badge: null,
              },
              {
                icon: Shield,
                title: 'Know Your Rights',
                desc: 'Plain-English breakdowns of FDCPA, FCRA, and statute of limitations for all 50 states.',
                color: 'text-red-400 bg-red-400/10',
                badge: null,
              },
              {
                icon: Zap,
                title: 'AI-Personalized Scripts',
                desc: 'Pro users get scripts personalized with their creditor name, balance, and specific situation.',
                color: 'text-orange-400 bg-orange-400/10',
                badge: 'Pro',
              },
            ].map(feature => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {feature.badge && (
                      <span className="badge bg-teal-400/20 text-teal-300 text-xs">{feature.badge}</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-white/50">Start free. Upgrade when you&apos;re ready.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="text-white font-bold text-xl mb-1">Free</h3>
              <p className="text-white/50 text-sm mb-6">Forever free, no card required</p>
              <p className="text-5xl font-extrabold text-white mb-8">$0</p>
              <ul className="space-y-3 mb-8">
                {['3 AI messages per day', '1 dispute letter per month', 'Basic script library', 'Debt tracker (3 debts)', 'Know Your Rights page'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-white/70 text-sm">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block text-center bg-white/10 text-white font-semibold py-3.5 rounded-2xl hover:bg-white/15 transition-colors border border-white/10">
                Get Started Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-br from-teal-400/20 to-navy-100 border border-teal-400/30 rounded-3xl p-8 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-teal-400 text-navy-200 text-xs font-bold px-4 py-1.5 rounded-full">MOST POPULAR</span>
              </div>
              <h3 className="text-white font-bold text-xl mb-1">Pro</h3>
              <p className="text-white/50 text-sm mb-6">For serious debt reduction</p>
              <div className="mb-8">
                <p className="text-5xl font-extrabold text-white">$9.99<span className="text-white/40 text-lg font-normal">/mo</span></p>
                <p className="text-teal-300 text-sm mt-1">or $79/year (save $41)</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited AI coaching', 'Unlimited dispute letters', 'Full script library + AI personalization', 'PDF downloads', 'Unlimited debt tracking', 'Full AI debt analysis report', 'Priority support'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-white/80 text-sm">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block text-center bg-teal-400 text-navy-200 font-bold py-3.5 rounded-2xl hover:bg-teal-300 transition-colors">
                Start Free · Upgrade Anytime
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-navy-200" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Take Back Control
            <span className="block text-teal-400">of Your Financial Future</span>
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Stop letting debt collectors intimidate you. Know your rights, negotiate smarter, and build your path to financial freedom.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-teal-400 text-navy-200 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-teal-300 transition-all hover:shadow-2xl hover:shadow-teal-400/20 active:scale-95"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/30 text-sm mt-4">No credit card · Takes 2 minutes · Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto mb-6 bg-white/3 border border-white/8 rounded-2xl px-5 py-4">
          <p className="text-white/35 text-xs leading-relaxed text-center">
            <strong className="text-white/50">Legal Disclaimer:</strong> DebtCoach AI is not a law firm, does not provide legal advice, and does not represent or act on behalf of any user. All content is provided for general educational and informational purposes only. Nothing on this platform creates or implies an attorney-client relationship. Letter templates generated by this service should be reviewed by a licensed attorney before use. DebtCoach AI is not available in North Carolina or other jurisdictions where debt management services require licensing. Individual results are not guaranteed. For legal advice, consult a licensed attorney in your state.
          </p>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-400 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-navy-200" />
            </div>
            <span className="text-white/60 text-sm font-medium">DebtCoach AI</span>
          </div>
          <p className="text-white/30 text-xs text-center">
            Not legal advice · Educational purposes only · Not a law firm · No attorney-client relationship
          </p>
          <div className="flex gap-4 text-white/40 text-xs">
            <a href="#" className="hover:text-white/70">Privacy</a>
            <a href="#" className="hover:text-white/70">Terms</a>
            <a href="#" className="hover:text-white/70">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
