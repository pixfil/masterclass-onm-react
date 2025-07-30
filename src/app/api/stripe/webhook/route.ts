import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { supabase } from '@/lib/supabaseClient'
import { updateAgentFeatures } from '@/lib/stripe/subscriptions'
import Stripe from 'stripe'

// Désactiver le body parsing pour les webhooks Stripe
export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      // Abonnement créé avec succès
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const agentId = session.metadata?.agent_id
          const planId = session.metadata?.plan_id
          
          if (!agentId || !planId) {
            throw new Error('Metadata manquantes')
          }

          // Récupérer l'abonnement
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // Récupérer le plan
          const { data: plan } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('stripe_price_id', subscription.items.data[0].price.id)
            .single()

          // Créer l'abonnement dans Supabase
          await supabase.from('agent_subscriptions').insert({
            agent_id: agentId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            plan_id: plan.id,
            status: 'active',
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })

          // Mettre à jour les fonctionnalités
          await updateAgentFeatures(agentId, planId)
        }
        break
      }

      // Paiement réussi
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )

          // Mettre à jour la période d'abonnement
          await supabase
            .from('agent_subscriptions')
            .update({
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

          // Enregistrer la facture
          await supabase.from('subscription_invoices').insert({
            subscription_id: subscription.metadata.agent_id,
            stripe_invoice_id: invoice.id,
            amount_paid: (invoice.amount_paid / 100),
            amount_due: (invoice.amount_due / 100),
            status: 'paid',
            invoice_pdf: invoice.invoice_pdf,
            hosted_invoice_url: invoice.hosted_invoice_url,
            paid_at: new Date().toISOString()
          })
        }
        break
      }

      // Paiement échoué
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          await supabase
            .from('agent_subscriptions')
            .update({
              status: 'past_due'
            })
            .eq('stripe_subscription_id', invoice.subscription)

          // Enregistrer l'événement
          await supabase.from('payment_events').insert({
            subscription_id: invoice.subscription,
            stripe_event_id: event.id,
            event_type: 'payment_failed',
            amount: (invoice.amount_due / 100),
            failure_reason: 'Paiement échoué'
          })
        }
        break
      }

      // Abonnement annulé
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        await supabase
          .from('agent_subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)

        // Désactiver les fonctionnalités
        const agentId = subscription.metadata.agent_id
        if (agentId) {
          await supabase
            .from('agent_features')
            .update({
              analytics_enabled: false,
              ai_enabled: false
            })
            .eq('agent_id', agentId)
        }
        break
      }

      // Abonnement mis à jour
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        await supabase
          .from('agent_subscriptions')
          .update({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    )
  }
}