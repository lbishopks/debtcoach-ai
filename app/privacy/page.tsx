import Link from 'next/link'
import { Zap } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — DebtCoach AI',
}

export default function PrivacyPage() {
  const updated = 'April 21, 2025'

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-400 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#0a0f1a]" />
            </div>
            <span className="font-bold text-white">DebtCoach AI</span>
          </Link>
          <Link href="/auth/login" className="text-sm text-white/50 hover:text-white transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-3">Privacy Policy</h1>
          <p className="text-white/40 text-sm">Last updated: {updated}</p>
        </div>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">1. Who We Are</h2>
            <p>
              DebtCoach AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website and application at{' '}
              <span className="text-teal-400">thedebtcoachai.com</span>. We provide an AI-powered platform to help
              consumers understand their rights and navigate debt-related issues. We are not a law firm and do not
              provide legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">2. Information We Collect</h2>
            <h3 className="text-white/80 font-medium mb-2">Information you provide directly:</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Name and email address (when you create an account)</li>
              <li>Mailing address, phone number (optional, used only for letter generation)</li>
              <li>Debt information you enter (creditor names, balances, account numbers)</li>
              <li>Messages and conversations with our AI coach</li>
              <li>Payment information (processed by Stripe — we do not store card details)</li>
            </ul>
            <h3 className="text-white/80 font-medium mb-2">Information collected automatically:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Usage data (pages visited, features used, session duration)</li>
              <li>Device and browser type</li>
              <li>IP address</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide, operate, and improve the DebtCoach AI platform</li>
              <li>To generate dispute letters and AI coaching responses tailored to your situation</li>
              <li>To process payments and manage your subscription</li>
              <li>To send transactional emails (account confirmation, password reset)</li>
              <li>To respond to support requests</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
            <p className="mt-3">
              We do not sell your personal information to third parties. We do not use your debt or financial
              information for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">4. AI Conversations</h2>
            <p>
              Your conversations with the DebtCoach AI assistant are stored in our database to provide conversation
              history and improve your experience. These conversations are processed by Anthropic&apos;s Claude AI.
              By using the chat feature, you agree that your messages may be processed by Anthropic in accordance
              with their{' '}
              <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                Privacy Policy
              </a>.
              We do not use your personal conversations to train AI models without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">5. Data Sharing</h2>
            <p className="mb-3">We share data only with trusted service providers necessary to operate the platform:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/80">Supabase</strong> — database and authentication</li>
              <li><strong className="text-white/80">Anthropic</strong> — AI language model processing</li>
              <li><strong className="text-white/80">Stripe</strong> — payment processing</li>
              <li><strong className="text-white/80">Resend</strong> — transactional email delivery</li>
            </ul>
            <p className="mt-3">
              We may disclose information if required by law, court order, or to protect the rights and safety
              of our users or the public.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">6. Data Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS), secure
              authentication, and row-level security in our database. However, no method of transmission over
              the internet is 100% secure. We encourage you not to share sensitive information such as Social
              Security numbers through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">7. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. If you delete your account,
              we will delete your personal information within 30 days, except where we are required to retain
              it by law. AI-generated letters and conversation history are deleted along with your account.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">8. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li>Object to or restrict processing of your data</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at the email below. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">9. Cookies</h2>
            <p>
              We use essential cookies only — necessary for authentication and keeping you logged in. We do not
              use advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">10. Children&apos;s Privacy</h2>
            <p>
              DebtCoach AI is not directed to individuals under 18 years of age. We do not knowingly collect
              personal information from children. If you believe a child has provided us with personal information,
              please contact us and we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              by posting the new policy on this page and updating the &quot;Last updated&quot; date. Continued use
              of the platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-lg mb-3">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or how we handle your data, please contact us at:
            </p>
            <div className="mt-3 bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-white font-medium">DebtCoach AI</p>
              <p className="text-teal-400 mt-1">support@thedebtcoachai.com</p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 mt-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-400 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#0a0f1a]" />
            </div>
            <span className="text-white/60 text-sm font-medium">DebtCoach AI</span>
          </Link>
          <p className="text-white/30 text-xs">Not legal advice · Educational purposes only</p>
          <Link href="/auth/signup" className="text-teal-400 hover:text-teal-300 text-sm transition-colors">
            Create Account
          </Link>
        </div>
      </footer>
    </div>
  )
}
