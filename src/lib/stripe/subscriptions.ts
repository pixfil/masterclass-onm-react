import { stripe, SUBSCRIPTION_PLANS } from './config'
import { supabase } from '@/lib/supabaseClient'

export interface CreateCheckoutSessionParams {
  agentId: string
  planId: 'basic' | 'pro' | 'premium'
  successUrl: string
  cancelUrl: string
}

// Créer une session de paiement Stripe
export async function createCheckoutSession({
  agentId,
  planId,
  successUrl,
  cancelUrl
}: CreateCheckoutSessionParams) {
  try {
    // Récupérer les infos de l'agent
    const { data: agent, error: agentError } = await supabase
      .from('agents_immobiliers')
      .select('id, email, prenom, nom, stripe_customer_id')
      .eq('id', agentId)
      .single()

    if (agentError || !agent) {
      throw new Error('Agent non trouvé')
    }

    const plan = SUBSCRIPTION_PLANS[planId]
    
    // Créer ou récupérer le customer Stripe
    let customerId = agent.stripe_customer_id
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: agent.email,
        name: `${agent.prenom} ${agent.nom}`,
        metadata: {
          agent_id: agent.id
        }
      })
      
      customerId = customer.id
      
      // Sauvegarder le customer ID
      await supabase
        .from('agents_immobiliers')
        .update({ stripe_customer_id: customerId })
        .eq('id', agentId)
    }

    // Créer la session de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        agent_id: agentId,
        plan_id: planId
      },
      subscription_data: {
        metadata: {
          agent_id: agentId,
          plan_id: planId
        }
      },
      locale: 'fr'
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Erreur création session checkout:', error)
    throw error
  }
}

// Récupérer l'abonnement actuel d'un agent
export async function getAgentSubscription(agentId: string) {
  try {
    const { data, error } = await supabase
      .from('agent_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('agent_id', agentId)
      .eq('status', 'active')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data
  } catch (error) {
    console.error('Erreur récupération abonnement:', error)
    return null
  }
}

// Vérifier si un agent a accès à une fonctionnalité
export async function checkFeatureAccess(agentId: string, feature: 'analytics' | 'ai') {
  try {
    const { data, error } = await supabase
      .from('agent_features')
      .select('analytics_enabled, ai_enabled')
      .eq('agent_id', agentId)
      .single()

    if (error || !data) {
      return false
    }

    return feature === 'analytics' ? data.analytics_enabled : data.ai_enabled
  } catch (error) {
    console.error('Erreur vérification accès:', error)
    return false
  }
}

// Gérer le portail de facturation
export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      locale: 'fr'
    })

    return session.url
  } catch (error) {
    console.error('Erreur création portail facturation:', error)
    throw error
  }
}

// Annuler un abonnement
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    })

    // Mettre à jour dans Supabase
    await supabase
      .from('agent_subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    return subscription
  } catch (error) {
    console.error('Erreur annulation abonnement:', error)
    throw error
  }
}

// Mettre à jour les fonctionnalités d'un agent selon son plan
export async function updateAgentFeatures(agentId: string, planId: string) {
  const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
  
  if (!plan) {
    throw new Error('Plan non trouvé')
  }

  const features = {
    agent_id: agentId,
    analytics_enabled: plan.features.analytics,
    ai_enabled: plan.features.ai,
    max_properties: plan.features.maxProperties,
    max_ai_generations: plan.features.maxAiGenerations || 0,
    custom_domain: plan.features.customDomain || false,
    priority_support: plan.features.prioritySupport || false
  }

  // Upsert les fonctionnalités
  const { error } = await supabase
    .from('agent_features')
    .upsert(features, {
      onConflict: 'agent_id'
    })

  if (error) {
    throw error
  }

  return features
}