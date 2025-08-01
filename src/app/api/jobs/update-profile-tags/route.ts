// API Route pour mettre à jour les tags de profil - Masterclass ONM
import { NextRequest, NextResponse } from 'next/server'
import { ProfileTagsService } from '@/lib/supabase/profile-tags'
import { headers } from 'next/headers'

// Configuration du secret pour sécuriser l'endpoint
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (authorization !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }
    
    // Initialiser les tags prédéfinis si nécessaire
    await ProfileTagsService.initializePredefinedTags()
    
    // Mettre à jour les tags pour tous les utilisateurs
    console.log(`[${new Date().toISOString()}] Démarrage de la mise à jour des tags de profil...`)
    
    await ProfileTagsService.updateAllUsersTags()
    
    console.log(`[${new Date().toISOString()}] Mise à jour des tags terminée`)
    
    return NextResponse.json({
      success: true,
      message: 'Tags de profil mis à jour avec succès',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des tags:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour des tags',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// GET pour vérifier le statut de l'endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/jobs/update-profile-tags',
    description: 'Endpoint pour mettre à jour les tags de profil dynamiques',
    methods: ['POST'],
    authentication: 'Bearer token requis'
  })
}