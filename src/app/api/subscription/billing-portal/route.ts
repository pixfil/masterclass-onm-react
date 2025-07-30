import { NextResponse } from 'next/server'
import { createBillingPortalSession } from '@/lib/stripe/subscriptions'
import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function POST() {
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

    // Récupérer l'agent avec son customer ID Stripe
    const { data: agent, error: agentError } = await supabase
      .from('agents_immobiliers')
      .select('id, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (agentError || !agent || !agent.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 404 }
      )
    }

    // Créer la session du portail de facturation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const url = await createBillingPortalSession(
      agent.stripe_customer_id,
      `${baseUrl}/admin/subscription`
    )

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Erreur portail facturation:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}