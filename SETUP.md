# DebtCoach AI — Setup & Deployment Guide

## Tech Stack
- **Frontend/Backend**: Next.js 14 (App Router)
- **Database + Auth**: Supabase (PostgreSQL + Auth)
- **AI**: Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Payments**: Stripe (subscriptions + one-time)
- **Hosting**: Vercel
- **Styling**: Tailwind CSS + Plus Jakarta Sans

---

## Step 1: Prerequisites

```bash
# Install Node.js 18+
node --version

# Clone / place the project
cd debtcoach-ai
npm install
```

---

## Step 2: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, paste and run the entire contents of `supabase/migrations/001_initial_schema.sql`
3. In **Authentication → Providers**, enable:
   - Email (default)
   - Google OAuth (optional — add your Google Client ID & Secret)
4. In **Authentication → URL Configuration**, add:
   - Site URL: `https://your-app.vercel.app` (or `http://localhost:3000` for dev)
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`
5. Get your keys from **Project Settings → API**:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Anthropic API

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Set as `ANTHROPIC_API_KEY`

---

## Step 4: Stripe Setup

1. Go to [stripe.com](https://stripe.com) and create an account
2. Create **3 products** in the Dashboard:
   - **Pro Monthly** → $9.99/month recurring → copy Price ID → `STRIPE_PRO_MONTHLY_PRICE_ID`
   - **Pro Annual** → $79/year recurring → copy Price ID → `STRIPE_PRO_YEARLY_PRICE_ID`
   - **Full AI Report** → $4.99 one-time → copy Price ID → `STRIPE_REPORT_PRICE_ID`
3. Get your API keys:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
4. Set up **Webhooks**:
   - Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Webhook signing secret → `STRIPE_WEBHOOK_SECRET`

For local webhook testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Step 5: Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

ANTHROPIC_API_KEY=sk-ant-api03-...

STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_REPORT_PRICE_ID=price_...

NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Step 6: Local Development

```bash
npm run dev
# Opens at http://localhost:3000
```

---

## Step 7: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables (or via Vercel dashboard)
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... add all env vars
```

Or via the Vercel Dashboard:
1. Import your GitHub repository
2. Add all environment variables in Project Settings → Environment Variables
3. Deploy!

---

## Project Structure

```
debtcoach-ai/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   └── callback/route.ts       # OAuth callback
│   ├── onboarding/page.tsx         # Onboarding wizard
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── chat/page.tsx               # AI chat interface
│   ├── letters/page.tsx            # Dispute letter generator
│   ├── scripts/page.tsx            # Script library
│   ├── rights/page.tsx             # Know Your Rights
│   ├── account/page.tsx            # Account settings
│   └── api/
│       ├── chat/route.ts           # Claude AI streaming endpoint
│       ├── letters/route.ts        # Letter generation endpoint
│       ├── scripts/route.ts        # Script personalization endpoint
│       └── stripe/
│           ├── checkout/route.ts   # Stripe checkout
│           ├── portal/route.ts     # Stripe billing portal
│           └── webhook/route.ts    # Stripe webhook handler
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # App sidebar navigation
│   │   └── AppShell.tsx            # Protected layout wrapper
│   ├── chat/
│   │   └── ChatInterface.tsx       # Full chat UI
│   ├── debt/
│   │   ├── DebtDashboard.tsx       # Dashboard with stats
│   │   └── DebtForm.tsx            # Add/edit debt form
│   ├── letters/
│   │   └── LetterGenerator.tsx     # Letter generator UI
│   ├── scripts/
│   │   └── ScriptLibrary.tsx       # Script library UI
│   ├── ui/
│   │   ├── Button.tsx              # Button component
│   │   ├── Input.tsx               # Input/Select/Textarea
│   │   └── Modal.tsx               # Modal component
│   ├── AccountSettings.tsx         # Account page
│   └── KnowYourRights.tsx          # Rights page
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server Supabase client
│   │   └── middleware.ts           # Auth middleware
│   ├── anthropic.ts                # Claude API client + prompts
│   ├── stripe.ts                   # Stripe client + plan config
│   ├── scripts-data.ts             # Script library data
│   └── utils.ts                    # Utility functions
├── types/
│   └── index.ts                    # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full DB schema
├── middleware.ts                   # Next.js middleware (auth)
├── .env.example                    # Environment variable template
└── package.json
```

---

## Features Checklist

- [x] Landing page with pricing
- [x] Email + Google OAuth signup/login
- [x] 4-step onboarding wizard with personalized strategy
- [x] Debt tracker dashboard with CRUD, stats, progress bar
- [x] AI chat interface (streaming) with Claude claude-sonnet-4-20250514
- [x] Conversation history per user
- [x] Free tier enforcement (3 messages/day, 1 letter/month)
- [x] Dispute letter generator (5 types)
- [x] Script library (6 scripts, filterable)
- [x] AI script personalization (Pro only)
- [x] Know Your Rights (FDCPA, FCRA, SOL by state for all 50 states)
- [x] Stripe subscriptions (monthly/annual)
- [x] One-time purchase (AI debt report)
- [x] Stripe webhook handler
- [x] Billing portal
- [x] Account/profile settings
- [x] Password change
- [x] PDF download (Pro, using jsPDF)
- [x] Mobile-first responsive design
- [x] Row-level security (RLS) on all tables

---

## Optional Enhancements (v2)

- [ ] Twilio SMS reminders ("Call your creditor today")
- [ ] Full AI debt analysis PDF report generation
- [ ] Credit report dispute tracking
- [ ] Email notifications for letter send reminders
- [ ] Attorney referral network integration
- [ ] Multi-language support
