import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        if (!userId) break

        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          await adminClient.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: session.customer as string,
            plan: 'pro',
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, { onConflict: 'stripe_subscription_id' })

          await adminClient.from('users').update({ plan: 'pro' }).eq('id', userId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) {
          // Try to find user by customer ID
          const { data: profile } = await adminClient
            .from('users')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .maybeSingle()

          if (profile) {
            await adminClient.from('subscriptions').update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            }).eq('stripe_subscription_id', subscription.id)

            const isActive = subscription.status === 'active' || subscription.status === 'trialing'
            await adminClient.from('users').update({ plan: isActive ? 'pro' : 'free' }).eq('id', profile.id)
          }
          break
        }

        await adminClient.from('subscriptions').update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }).eq('stripe_subscription_id', subscription.id)

        const isActive = subscription.status === 'active' || subscription.status === 'trialing'
        await adminClient.from('users').update({ plan: isActive ? 'pro' : 'free' }).eq('id', userId)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await adminClient.from('subscriptions').update({
          status: 'canceled',
        }).eq('stripe_subscription_id', subscription.id)

        // Downgrade user
        const { data: sub } = await adminClient
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle()

        if (sub?.user_id) {
          await adminClient.from('users').update({ plan: 'free' }).eq('id', sub.user_id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        await adminClient.from('subscriptions').update({
          status: 'past_due',
        }).eq('stripe_subscription_id', subscriptionId)
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
