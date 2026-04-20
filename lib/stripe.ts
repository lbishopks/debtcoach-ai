import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY

if (!stripeKey || stripeKey === 'sk_test_placeholder') {
  console.warn(
    '[DebtCoach] Stripe is not configured. ' +
    'Add real keys to .env.local:\n' +
    '  STRIPE_SECRET_KEY=sk_test_...\n' +
    '  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...\n' +
    '  STRIPE_WEBHOOK_SECRET=whsec_...\n' +
    '  STRIPE_PRO_MONTHLY_PRICE_ID=price_...\n' +
    '  STRIPE_PRO_YEARLY_PRICE_ID=price_...\n' +
    'Get these from https://dashboard.stripe.com/apikeys'
  )
}

export const stripe = new Stripe(stripeKey || 'sk_test_placeholder', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '3 AI messages per day',
      '1 dispute letter per month',
      'Basic script library',
      'Debt tracker (3 debts)',
    ],
    limits: {
      messagesPerDay: 3,
      lettersPerMonth: 1,
      debts: 3,
    },
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 9.99,
    yearlyPrice: 79,
    features: [
      'Unlimited AI chat',
      'Unlimited dispute letters',
      'Full script library with AI personalization',
      'PDF downloads',
      'Unlimited debt tracking',
      'Priority support',
      'Full debt analysis reports',
    ],
    limits: {
      messagesPerDay: Infinity,
      lettersPerMonth: Infinity,
      debts: Infinity,
    },
  },
}
