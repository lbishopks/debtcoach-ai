import { Resend } from 'resend'

// Lazy — only instantiated at call time, never at build/import time
function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = 'DebtCoach AI <noreply@thedebtcoachai.com>'
const SUPPORT = 'support@thedebtcoachai.com'
const BASE_URL = 'https://thedebtcoachai.com'

// Shared layout wrapper
function layout(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { margin:0; padding:0; background:#0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#e2e8f0; }
    .wrap { max-width:560px; margin:40px auto; background:#111827; border:1px solid rgba(255,255,255,0.08); border-radius:16px; overflow:hidden; }
    .header { background:#0a0f1a; padding:28px 36px; border-bottom:1px solid rgba(255,255,255,0.06); }
    .logo { display:flex; align-items:center; gap:10px; }
    .logo-icon { width:32px; height:32px; background:#2dd4bf; border-radius:8px; display:inline-block; text-align:center; line-height:32px; font-size:16px; }
    .logo-text { font-weight:700; font-size:15px; color:#fff; }
    .body { padding:32px 36px; }
    h1 { margin:0 0 12px; font-size:22px; font-weight:700; color:#fff; line-height:1.3; }
    p { margin:0 0 16px; font-size:15px; line-height:1.6; color:rgba(255,255,255,0.65); }
    .btn { display:inline-block; background:#2dd4bf; color:#0a0f1a !important; font-weight:700; font-size:15px; padding:13px 28px; border-radius:12px; text-decoration:none; margin:8px 0 24px; }
    .card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:20px 24px; margin:20px 0; }
    .card p { margin:6px 0; font-size:14px; }
    ul { margin:0 0 16px; padding-left:20px; }
    li { font-size:14px; color:rgba(255,255,255,0.65); margin-bottom:6px; line-height:1.5; }
    .footer { padding:20px 36px; background:#0a0f1a; border-top:1px solid rgba(255,255,255,0.06); }
    .footer p { margin:0; font-size:12px; color:rgba(255,255,255,0.25); line-height:1.6; }
    .footer a { color:rgba(255,255,255,0.4); }
    .divider { height:1px; background:rgba(255,255,255,0.06); margin:24px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">DebtCoach AI</span>
      </div>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>DebtCoach AI &bull; <a href="${BASE_URL}">${BASE_URL}</a><br>
      Not legal advice. Educational purposes only. Not a law firm.<br>
      Questions? <a href="mailto:${SUPPORT}">${SUPPORT}</a></p>
    </div>
  </div>
</body>
</html>`
}

// ─── Welcome / subscription activated ───────────────────────────────────────
export async function sendWelcomeEmail(to: string, name?: string) {
  const firstName = name?.split(' ')[0] || 'there'
  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Welcome to DebtCoach AI — You\'re all set ⚡',
    html: layout(`
      <h1>Welcome, ${firstName}!</h1>
      <p>Your DebtCoach AI Pro subscription is now active. Here's what you have full access to:</p>
      <ul>
        <li><strong>AI Negotiation Coach</strong> — 24/7 guidance on FDCPA, FCRA, and negotiation tactics</li>
        <li><strong>Dispute Letter Generator</strong> — 15 professionally-referenced letter types</li>
        <li><strong>Call Script Library</strong> — Ready-to-use scripts for every scenario</li>
        <li><strong>Debt Tracker Dashboard</strong> — Track every debt and creditor in one place</li>
        <li><strong>Know Your Rights</strong> — Plain-English SOL breakdowns for all 50 states</li>
      </ul>
      <a href="${BASE_URL}/dashboard" class="btn">Go to Your Dashboard →</a>
      <div class="divider"></div>
      <p style="font-size:13px;">Your subscription renews monthly. You can cancel any time from your <a href="${BASE_URL}/account" style="color:#2dd4bf;">Account Settings</a>. No fees, no surprises.</p>
    `),
  })
}

// ─── Subscription cancelled ──────────────────────────────────────────────────
export async function sendCancellationEmail(to: string, name?: string, periodEnd?: string) {
  const firstName = name?.split(' ')[0] || 'there'
  const endDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'the end of your billing period'

  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Your DebtCoach AI subscription has been cancelled',
    html: layout(`
      <h1>Subscription Cancelled</h1>
      <p>Hi ${firstName}, your DebtCoach AI Pro subscription has been cancelled.</p>
      <div class="card">
        <p><strong style="color:#fff;">Access ends:</strong> ${endDate}</p>
        <p style="margin:0;">You'll retain full access until then — no features are removed early.</p>
      </div>
      <p>Changed your mind? You can reactivate any time and all your data (debts, letters, conversations) will still be there.</p>
      <a href="${BASE_URL}/subscribe" class="btn">Reactivate →</a>
      <div class="divider"></div>
      <p style="font-size:13px;">We'd love to know why you cancelled — reply to this email and let us know. Your feedback helps us improve.</p>
    `),
  })
}

// ─── Payment failed ──────────────────────────────────────────────────────────
export async function sendPaymentFailedEmail(to: string, name?: string) {
  const firstName = name?.split(' ')[0] || 'there'
  return getResend().emails.send({
    from: FROM,
    to,
    subject: 'Action required: Payment failed for DebtCoach AI',
    html: layout(`
      <h1>Payment Failed</h1>
      <p>Hi ${firstName}, we weren't able to process your monthly payment for DebtCoach AI Pro.</p>
      <p>To keep your account active and avoid losing access, please update your payment method:</p>
      <a href="${BASE_URL}/account?tab=billing" class="btn">Update Payment Method →</a>
      <div class="card">
        <p style="font-size:13px;"><strong style="color:#fff;">What happens next:</strong> We'll retry your payment automatically. If payment continues to fail, your account will be downgraded and you'll lose access to Pro features.</p>
      </div>
      <p style="font-size:13px;">If you believe this is an error or need help, reply to this email or contact <a href="mailto:${SUPPORT}" style="color:#2dd4bf;">${SUPPORT}</a>.</p>
    `),
  })
}

// ─── Letter emailed to user ──────────────────────────────────────────────────
export async function sendLetterEmail(to: string, letterTitle: string, letterContent: string) {
  return getResend().emails.send({
    from: 'DebtCoach AI <letters@thedebtcoachai.com>',
    to,
    subject: `Your Letter: ${letterTitle}`,
    html: layout(`
      <h1>Your Letter is Ready</h1>
      <p>Here's your dispute letter, ready to print and send via <strong>Certified Mail with Return Receipt</strong>. Keep your mailing receipt as proof of delivery.</p>
      <div class="card">
        <p style="font-weight:700; color:#fff; margin-bottom:12px;">${letterTitle}</p>
        <pre style="white-space:pre-wrap; font-family:'Courier New',monospace; font-size:12px; color:rgba(255,255,255,0.7); line-height:1.6; margin:0;">${letterContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </div>
      <a href="${BASE_URL}/letters" class="btn">View All Your Letters →</a>
    `),
  })
}
