import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Essayer de récupérer l'utilisateur actuel
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      // Retourner des données par défaut si pas d'utilisateur
      return NextResponse.json({
        generationsThisMonth: 0,
        tokensThisMonth: 0,
        descriptionsGenerated: 0,
        highlightsGenerated: 0,
        lastGeneration: null
      })
    }

    // Récupérer l'usage IA de l'utilisateur
    const { data, error } = await supabase
      .rpc('get_user_ai_usage', { p_user_id: user.id })
      .single()

    if (error) {
      console.error('Erreur lors de la récupération de l\'usage IA:', error)
      // Retourner des données par défaut en cas d'erreur
      return NextResponse.json({
        generationsThisMonth: 0,
        tokensThisMonth: 0,
        descriptionsGenerated: 0,
        highlightsGenerated: 0,
        lastGeneration: null
      })
    }

    return NextResponse.json({
      generationsThisMonth: data.generations_this_month || 0,
      tokensThisMonth: data.tokens_this_month || 0,
      descriptionsGenerated: data.descriptions_generated || 0,
      highlightsGenerated: data.highlights_generated || 0,
      lastGeneration: data.last_generation
    })

  } catch (error) {
    console.error('Erreur API usage IA:', error)
    return NextResponse.json({
      generationsThisMonth: 0,
      tokensThisMonth: 0,
      descriptionsGenerated: 0,
      highlightsGenerated: 0,
      lastGeneration: null
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Essayer de récupérer l'utilisateur actuel
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { featureType, propertyId, tokensUsed, success, errorMessage, modelUsed, processingTime } = await request.json()

    // Enregistrer l'usage IA
    const { error } = await supabase
      .from('ai_usage')
      .insert({
        user_id: user.id,
        feature_type: featureType,
        property_id: propertyId || null,
        tokens_used: tokensUsed || 0,
        success: success !== false,
        error_message: errorMessage || null,
        model_used: modelUsed || 'unknown',
        processing_time_ms: processingTime || null
      })

    if (error) {
      console.error('Erreur lors de l\'enregistrement de l\'usage IA:', error)
      return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erreur API enregistrement usage IA:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}