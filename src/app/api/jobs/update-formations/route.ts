import { NextRequest, NextResponse } from 'next/server'
import { runFormationStatusUpdateJob } from '@/lib/jobs/update-formation-statuses'

// Protection par clé API simple
const JOB_API_KEY = process.env.JOB_API_KEY || 'default-job-key-change-me'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    const apiKey = authHeader?.replace('Bearer ', '')
    
    if (apiKey !== JOB_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Exécuter le job
    const result = await runFormationStatusUpdateJob()
    
    if (result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erreur API job formations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Pour tester manuellement
export async function GET(request: NextRequest) {
  // En développement seulement
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Method not allowed in production' },
      { status: 405 }
    )
  }
  
  try {
    const result = await runFormationStatusUpdateJob()
    
    return NextResponse.json(
      { 
        message: 'Job de mise à jour des formations',
        result,
        info: {
          description: 'Ce job met à jour les statuts des commandes et prépare les emails automatiques',
          frequency: 'Devrait être exécuté quotidiennement',
          actions: [
            'Met à jour les commandes terminées',
            'Identifie les emails de rappel à envoyer',
            'Prépare les emails de satisfaction',
            'Prépare les emails d\'évaluation'
          ]
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erreur GET job formations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}