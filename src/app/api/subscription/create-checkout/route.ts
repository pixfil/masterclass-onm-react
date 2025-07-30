import { NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe/subscriptions'
import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { planId } = await request.json()
    
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

    // Récupérer l'agent associé à l'utilisateur
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

    // Créer la session de checkout
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const { sessionId, url } = await createCheckoutSession({
      agentId: agent.id,
      planId,
      successUrl: `${baseUrl}/admin/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/admin/subscription`
    })

    return NextResponse.json({ sessionId, url })
  } catch (error) {
    console.error('Erreur création checkout:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}