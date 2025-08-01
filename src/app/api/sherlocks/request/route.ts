import { NextRequest, NextResponse } from 'next/server'
import { SherlocksService } from '@/lib/supabase/sherlocks'
import { createClient } from '@supabase/supabase-js'

// Cette route génère la requête de paiement Sherlock's
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId, amount, customerData } = body

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Récupérer les paramètres Sherlock's actifs
    const settings = await SherlocksService.getActiveSettings()
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Configuration Sherlock\'s non trouvée' },
        { status: 500 }
      )
    }

    // Générer les paramètres de la requête
    const params = SherlocksService.generateRequestParams(
      Math.round(amount * 100), // Convertir en centimes
      orderId,
      settings,
      customerData
    )

    // Créer le formulaire HTML pour rediriger vers Sherlock's
    // Note: En production, ceci devrait appeler le binaire request
    const formFields = Object.entries(params)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('\n')

    const sherlocksUrl = settings.environment === 'PRODUCTION'
      ? 'https://scelliuspaiement.lcl.fr/cgis-payment/prod/callpayment'
      : 'https://scelliuspaiement.lcl.fr/cgis-payment/test/callpayment'

    const htmlForm = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirection vers LCL Sherlock's...</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
          }
          .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 3px solid white;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          h1 {
            margin: 0 0 0.5rem;
            font-size: 1.5rem;
          }
          p {
            margin: 0;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h1>Redirection vers LCL Sherlock's</h1>
          <p>Vous allez être redirigé vers la page de paiement sécurisée...</p>
        </div>
        <form id="sherlocksForm" method="POST" action="${sherlocksUrl}">
          ${formFields}
        </form>
        <script>
          setTimeout(function() {
            document.getElementById('sherlocksForm').submit();
          }, 1000);
        </script>
      </body>
      </html>
    `

    return new Response(htmlForm, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Erreur création requête Sherlock\'s:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}