import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    // Guard: real Stripe keys required
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey || stripeKey === 'sk_test_placeholder') {
      return NextResponse.json({
        error: 'Payment processing is not yet configured. Please contact support to complete your upgrade.',
      }, { status: 503 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { priceType, successUrl, cancelUrl } = await req.json()
    // priceType: 'monthly' | 'yearly' | 'report'

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('users')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await adminClient
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const priceIds: Record<string, string> = {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
      report: process.env.STRIPE_REPORT_PRICE_ID!,
    }

    const priceId = priceIds[priceType]
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid price type' }, { status: 400 })
    }

    const isSubscription = priceType !== 'report'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${appUrl}/account?tab=billing&success=true`,
      cancel_url: cancelUrl || `${appUrl}/account?tab=billing`,
      metadata: { user_id: user.id, price_type: priceType },
      allow_promotion_codes: true,
      ...(isSubscription && {
        subscription_data: {
          metadata: { user_id: user.id },
        },
      }),
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
