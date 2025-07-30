import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Récupérer l'utilisateur depuis le cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('supabase-auth-token')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier l'utilisateur
    const { data: { user }, error: userError } = await supabase.auth.getUser(token.value)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 401 }
      )
    }

    // Récupérer l'agent avec son abonnement et ses fonctionnalités
    const { data: agent, error: agentError } = await supabase
      .from('agents_immobiliers')
      .select(`
        id,
        agent_subscriptions!inner (
          status,
          current_period_end,
          cancel_at_period_end,
          subscription_plans (
            name,
            features
          )
        ),
        agent_features (
          analytics_enabled,
          ai_enabled,
          max_properties,
          max_ai_generations,
          custom_domain,
          priority_support
        )
      `)
      .eq('user_id', user.id)
      .eq('agent_subscriptions.status', 'active')
      .gte('agent_subscriptions.current_period_end', new Date().toISOString())
      .single()

    if (agentError) {
      // Pas d'abonnement actif
      return NextResponse.json({
        isActive: false,
        features: {
          analytics: false,
          ai: false,
          maxProperties: 10,
          maxAiGenerations: 0,
          customDomain: false,
          prioritySupport: false
        }
      })
    }

    const subscription = agent.agent_subscriptions[0]
    const features = agent.agent_features?.[0]

    return NextResponse.json({
      isActive: true,
      planName: subscription.subscription_plans.name,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      features: {
        analytics: features?.analytics_enabled || false,
        ai: features?.ai_enabled || false,
        maxProperties: features?.max_properties || 10,
        maxAiGenerations: features?.max_ai_generations || 0,
        customDomain: features?.custom_domain || false,
        prioritySupport: features?.priority_support || false
      }
    })
  } catch (error) {
    console.error('Erreur récupération fonctionnalités:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}