import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { safeError } from '@/lib/validation'

function isAdmin(email: string | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  return email && adminEmails.includes(email.toLowerCase())
}

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch from Stripe in parallel
    const [subsRes, chargesRes, balTxnsRes] = await Promise.all([
      stripe.subscriptions.list({ status: 'active', limit: 100, expand: ['data.items.data.price'] }),
      stripe.charges.list({ limit: 20 }),
      stripe.balanceTransactions.list({ limit: 100, type: 'charge',
        created: { gte: Math.floor((Date.now() - 30 * 86400000) / 1000) } }),
    ])

    // MRR: sum up monthly-equivalent amounts from active subscriptions
    let mrr = 0
    for (const sub of subsRes.data) {
      for (const item of sub.items.data) {
        const price = item.price
        if (!price.unit_amount) continue
        const amount = price.unit_amount / 100
        if (price.recurring?.interval === 'month') mrr += amount * (item.quantity || 1)
        else if (price.recurring?.interval === 'year') mrr += (amount / 12) * (item.quantity || 1)
      }
    }

    // Revenue last 30 days
    const revenue30d = (balTxnsRes.data || []).reduce((s, t) => s + (t.net / 100), 0)

    // Recent charges formatted
    const recentCharges = (chargesRes.data || []).map(c => ({
      id: c.id,
      amount: c.amount / 100,
      currency: c.currency,
      status: c.status,
      description: c.description || 'Subscription',
      email: (c as any).billing_details?.email || '',
      created: new Date(c.created * 1000).toISOString(),
    }))

    return NextResponse.json({
      mrr: Math.round(mrr * 100) / 100,
      activeSubscriptions: subsRes.data.length,
      revenue30d: Math.round(revenue30d * 100) / 100,
      recentCharges,
    })
  } catch (err) {
    return safeError(err, 'admin/billing')
  }
}
