import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      isSuperAdmin: false, 
      debug: 'Utiliser POST avec token',
      message: 'Utilisez la méthode POST avec un token d\'authentification'
    })
  } catch (error) {
    console.error('Erreur vérification rôle:', error)
    return NextResponse.json({ isSuperAdmin: false })
  }
}

export async function POST(request: Request) {
  try {
    const { userEmail } = await request.json()
    
    console.log('Vérification pour email:', userEmail)

    // Liste des super admins (à terme, cela pourrait être dans une table)
    const superAdminEmails = [
      'philippe@initiative-immo.fr',
      'admin@initiative-immo.fr',
      'coual.philippe@gmail.com',
      'philippe@gclicke.com'
    ]

    const isSuperAdmin = superAdminEmails.includes(userEmail || '')

    return NextResponse.json({ 
      isSuperAdmin,
      userEmail,
      testedEmail: userEmail,
      superAdminEmails // Pour debug
    })
  } catch (error) {
    console.error('Erreur vérification rôle:', error)
    return NextResponse.json({ isSuperAdmin: false })
  }
}