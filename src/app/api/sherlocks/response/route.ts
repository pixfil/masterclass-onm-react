import { NextRequest, NextResponse } from 'next/server'
import { SherlocksService } from '@/lib/supabase/sherlocks'
import { supabase } from '@/lib/supabaseClient'

// Cette route reçoit la réponse automatique de Sherlock's
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const data = formData.get('DATA') as string

    if (!data) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Parser la réponse Sherlock's
    const response = SherlocksService.parseResponse(data)
    console.log('Réponse Sherlock\'s reçue:', response)

    // Vérifier le statut du paiement
    const isSuccess = SherlocksService.isPaymentSuccessful(response.response_code)
    const orderId = response.order_id

    if (!orderId) {
      console.error('Order ID manquant dans la réponse')
      return NextResponse.json({ status: 'error' }, { status: 400 })
    }

    // Mettre à jour la commande dans la base de données
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: isSuccess ? 'paid' : 'failed',
        status: isSuccess ? 'confirmed' : 'cancelled',
        payment_date: isSuccess ? new Date().toISOString() : null,
        payment_details: {
          transaction_id: response.transaction_id,
          authorization_id: response.authorisation_id,
          payment_certificate: response.payment_certificate,
          response_code: response.response_code,
          response_message: SherlocksService.getResponseMessage(response.response_code),
          card_number: response.card_number,
          payment_means: response.payment_means,
          payment_date: response.payment_date,
          payment_time: response.payment_time
        }
      })
      .eq('order_number', orderId)
      .select()
      .single()

    if (orderError) {
      console.error('Erreur mise à jour commande:', orderError)
      return NextResponse.json({ status: 'error' }, { status: 500 })
    }

    if (isSuccess && order) {
      // Créer les inscriptions pour chaque item de la commande
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id)

      if (orderItems) {
        for (const item of orderItems) {
          await supabase
            .from('registrations')
            .insert({
              user_id: order.user_id,
              order_id: order.id,
              session_id: item.session_id,
              status: 'confirmed',
              payment_status: 'paid'
            })
        }
      }

      // Envoyer un email de confirmation
      // TODO: Implémenter l'envoi d'email
    }

    // Réponse pour Sherlock's (important pour confirmer la réception)
    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Erreur traitement réponse Sherlock\'s:', error)
    return new Response('ERROR', { status: 500 })
  }
}