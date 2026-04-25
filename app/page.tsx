import Link from 'next/link'
import { Zap, MessageSquare, FileText, BookOpen, Shield, CheckCircle, ArrowRight, Star, TrendingDown, Lock, Phone } from 'lucide-react'
import ProductTour from '@/components/landing/ProductTour'

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'AI Negotiation Coach',
    desc: 'Get unlimited guidance on FDCPA, FCRA, statute of limitations by state, and proven negotiation tactics — available 24/7.',
    color: 'text-teal-400 bg-teal-400/10',
  },
  {
    icon: FileText,
    title: 'Dispute Letter Generator',
    desc: 'Generate professionally-referenced dispute letter templates in seconds — FDCPA, FCRA, debt validation, cease & desist, and 11 more types.',
    color: 'text-yellow-400 bg-yellow-400/10',
  },
  {
    icon: TrendingDown,
    title: 'Debt Tracker Dashboard',
    desc: 'Track every debt, creditor, and negotiation status in one place. Visualize your total balance shrinking over time.',
    color: 'text-blue-400 bg-blue-400/10',
  },
  {
    icon: Phone,
    title: 'Conversation Guides',
    desc: 'General reference guides some consumers use when speaking with creditors and collectors.',
    color: 'text-purple-400 bg-purple-400/10',
  },
  {
    icon: Shield,
    title: 'Know Your Rights',
    desc: 'Plain-English educational breakdowns of FDCPA, FCRA, and statute of limitations for all 50 states — for informational purposes only.',
    color: 'text-red-400 bg-red-400/10',
  },
  {
    icon: BookOpen,
    title: 'PDF & Print Ready',
    desc: 'Download any letter as a PDF and print it — formatted for certified mail and ready to send from your own email or mailbox.',
    color: 'text-orange-400 bg-orange-400/10',
  },
]

const INCLUDED = [
  'Unlimited AI debt coaching conversations',
  'Unlimited dispute letter generation',
  'All 15 letter types (FDCPA, FCRA, SOL, and more)',
  'PDF & print-ready dispute letters',
  'Debt tracking dashboard',
  'Conversation guides & negotiation references',
  'Know Your Rights — all 50 states',
  'Priority support',
]

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
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/20 rounded-full px-4 py-2 text-teal-300 text-xs font-medium mb-8">
            <Star className="w-3.5 h-3.5" />
            AI-Powered Debt Negotiation — $19.95/month, Cancel Anytime
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Fight Back Against
            <span className="block bg-gradient-to-r from-teal-400 to-teal-200 bg-clip-text text-transparent">
              Debt Collectors
            </span>
          </h1>

          <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            DebtCoach AI gives you unlimited AI coaching, professionally-referenced dispute letters, and conversation guides — everything you need to know your rights and negotiate smarter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-teal-400 text-navy-200 font-bold px-8 py-4 rounded-2xl text-base hover:bg-teal-300 transition-all hover:shadow-lg hover:shadow-teal-400/20 active:scale-95"
            >
              Start Now — $19.95/month
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-base hover:bg-white/15 transition-all border border-white/10"
            >
              Sign In
            </Link>
          </div>

          <p className="text-white/30 text-sm mt-6">Full access to every feature · Cancel anytime · Secured by Stripe</p>

          {/* Legal Disclaimer */}
          <div className="mt-8 max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-left">
            <p className="text-white/40 text-xs leading-relaxed">
              <strong className="text-white/60">⚖️ Disclaimer:</strong> DebtCoach AI is not a law firm and does not provide legal or financial advice. All content is for educational purposes only. Use at your own risk. Consult a licensed attorney before taking legal action.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Up and Running in Minutes</h2>
            <p className="text-white/50">No lawyers. No paperwork. Just answers and action.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-teal-400/30 via-teal-400/60 to-teal-400/30" />
            {[
              {
                step: '01',
                title: 'Create Your Account',
                desc: 'Sign up in under 2 minutes. Enter your name, address, and first debt — we use it to pre-fill every letter.',
              },
              {
                step: '02',
                title: 'Subscribe for $19.95/month',
                desc: 'Unlock full access after your profile is set up. No hidden fees, cancel any time.',
              },
              {
                step: '03',
                title: 'Take Action',
                desc: 'Send a dispute letter, reference a conversation guide, or prepare for a settlement discussion. The tools are ready — you decide how to use them.',
              },
            ].map(item => (
              <div key={item.step} className="relative bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-400/15 border border-teal-400/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-400 font-extrabold text-sm">{item.step}</span>
                </div>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Tour */}
      <ProductTour />

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Take Control</h2>
            <p className="text-white/50 max-w-xl mx-auto">Educational tools powered by Claude AI. Every feature included at $19.95/month.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(feature => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing — single plan */}
      <section className="py-20 px-4 bg-white/3">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">One Plan. Everything Included.</h2>
            <p className="text-white/50">No tiers. No limits. No surprises.</p>
          </div>

          <div className="bg-gradient-to-br from-teal-400/15 to-navy-100 border border-teal-400/30 rounded-3xl p-8 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="bg-teal-400 text-navy-200 text-xs font-bold px-4 py-1.5 rounded-full">FULL ACCESS</span>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-white font-bold text-2xl mb-1">DebtCoach AI Pro</h3>
                <p className="text-white/50 text-sm">Complete debt-fighting toolkit</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-extrabold text-white">$19.95</p>
                <p className="text-white/40 text-sm">/month · Cancel anytime</p>
              </div>
            </div>

            <ul className="grid sm:grid-cols-2 gap-3 mb-8">
              {INCLUDED.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-white/80 text-sm">
                  <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link href="/auth/signup" className="block text-center bg-teal-400 text-navy-200 font-bold py-4 rounded-2xl hover:bg-teal-300 transition-colors text-base">
              Get Started — $19.95/month
            </Link>

            <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
              <div className="flex items-center gap-1.5 text-white/30 text-xs">
                <Lock className="w-3 h-3" /> Secured by Stripe
              </div>
              <div className="flex items-center gap-1.5 text-white/30 text-xs">
                <CheckCircle className="w-3 h-3" /> Cancel anytime
              </div>
              <div className="flex items-center gap-1.5 text-white/30 text-xs">
                <Shield className="w-3 h-3" /> No hidden fees
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats — the numbers that matter */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">The Numbers Don&apos;t Lie</h2>
            <p className="text-white/50 max-w-xl mx-auto">Debt collectors count on you not knowing your rights. We change that.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { stat: '$1,000', label: 'Maximum statutory damages per FDCPA violation — learn about your rights as a consumer through our educational resources' },
              { stat: '15+', label: 'Dispute letter types included — debt validation, FCRA errors, cease & desist, pay-for-delete, and more' },
              { stat: '50', label: 'States covered with plain-English statute of limitations breakdowns so you know when debt is time-barred' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-4xl font-extrabold text-teal-400 mb-3">{item.stat}</p>
                <p className="text-white/50 text-sm leading-relaxed">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-white/3">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-navy-200" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Take Back Control
            <span className="block text-teal-400">of Your Financial Future</span>
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Stop letting debt collectors intimidate you. Know your rights, dispute errors, negotiate smarter, and build your path to financial freedom — all for $19.95/month.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-teal-400 text-navy-200 font-bold px-10 py-5 rounded-2xl text-lg hover:bg-teal-300 transition-all hover:shadow-2xl hover:shadow-teal-400/20 active:scale-95"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/30 text-sm mt-4">$19.95/month · Cancel anytime · No hidden fees</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-6xl mx-auto mb-6 bg-white/3 border border-white/8 rounded-2xl px-5 py-4">
          <p className="text-white/35 text-xs leading-relaxed text-center">
            <strong className="text-white/50">Disclaimer:</strong> DebtCoach AI is not a law firm and does not provide legal or financial advice. All content is educational only, results are not guaranteed, and use is at your own risk. Consult a licensed attorney in your state before taking legal action.
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
            <Link href="/privacy" className="hover:text-white/70">Privacy</Link>
            <a href="mailto:support@thedebtcoachai.com" className="hover:text-white/70">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
