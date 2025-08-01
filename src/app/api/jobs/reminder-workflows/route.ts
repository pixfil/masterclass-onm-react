// API Route pour exécuter les workflows de rappel - Masterclass ONM
import { NextRequest, NextResponse } from 'next/server'
import { runReminderWorkflows } from '@/lib/workflows/reminder-workflows'
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
    
    // Exécuter les workflows
    console.log(`[${new Date().toISOString()}] Démarrage des workflows de rappel...`)
    
    await runReminderWorkflows()
    
    console.log(`[${new Date().toISOString()}] Workflows de rappel terminés`)
    
    return NextResponse.json({
      success: true,
      message: 'Workflows de rappel exécutés avec succès',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erreur lors de l\'exécution des workflows:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'exécution des workflows',
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
    endpoint: '/api/jobs/reminder-workflows',
    description: 'Endpoint pour exécuter les workflows de rappel automatiques',
    methods: ['POST'],
    authentication: 'Bearer token requis'
  })
}