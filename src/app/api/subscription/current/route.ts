import { NextResponse } from 'next/server'
import { getAgentSubscription } from '@/lib/stripe/subscriptions'
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

    // Récupérer l'agent
    const { data: agent, error: agentError } = await supabase
      .from('agents_immobiliers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (agentError || !agent) {
      return NextResponse.json(
        { error: 'Agent non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer l'abonnement actuel
    const subscription = await getAgentSubscription(agent.id)

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Erreur récupération abonnement:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}