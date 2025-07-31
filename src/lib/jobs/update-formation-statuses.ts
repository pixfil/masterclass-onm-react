// Job pour mettre à jour automatiquement les statuts des formations et commandes
import { supabase } from '@/lib/supabaseClient'
import { updateOrderStatusesBasedOnDates } from '@/lib/supabase/client-formations'
import { canSendEmail, getFormationStatus } from '@/lib/utils/formation-status'

/**
 * Met à jour les statuts des commandes et prépare les emails automatiques
 * Cette fonction devrait être appelée régulièrement (par exemple via un cron job)
 */
export async function updateFormationStatuses() {
  console.log('🔄 Début de la mise à jour des statuts de formation...')
  
  try {
    // 1. Mettre à jour les statuts des commandes basés sur les dates
    await updateOrderStatusesBasedOnDates()
    console.log('✅ Statuts des commandes mis à jour')
    
    // 2. Identifier les clients éligibles pour les emails automatiques
    const emailQueue = await identifyEmailRecipients()
    console.log(`📧 ${emailQueue.length} emails à envoyer`)
    
    // 3. Marquer les emails dans une table de queue pour traitement
    if (emailQueue.length > 0) {
      await queueEmails(emailQueue)
    }
    
    console.log('✅ Mise à jour terminée avec succès')
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des statuts:', error)
    throw error
  }
}

/**
 * Identifie les clients qui doivent recevoir des emails automatiques
 */
async function identifyEmailRecipients() {
  const emailQueue: any[] = []
  
  try {
    // Récupérer toutes les commandes avec leurs sessions
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:user_profiles(*),
        items:order_items(
          *,
          session:formation_sessions(
            *,
            formation:formations(*)
          )
        )
      `)
      .in('status', ['confirmed', 'completed'])
      .eq('payment_status', 'paid')
    
    if (error) throw error
    if (!orders) return emailQueue
    
    // Pour chaque commande, vérifier les conditions d'envoi d'email
    for (const order of orders) {
      if (!order.items || !order.user) continue
      
      for (const item of order.items) {
        if (!item.session) continue
        
        const sessionDate = item.session.start_date
        const { status, daysUntil } = getFormationStatus(sessionDate)
        
        // Email de rappel 7 jours avant la formation
        if (canSendEmail(sessionDate, 'before', 7) && daysUntil === 7) {
          emailQueue.push({
            user: order.user,
            type: 'reminder_7_days',
            formation: item.session.formation,
            session: item.session,
            order_id: order.id
          })
        }
        
        // Email de rappel 1 jour avant la formation
        if (canSendEmail(sessionDate, 'before', 1) && daysUntil === 1) {
          emailQueue.push({
            user: order.user,
            type: 'reminder_1_day',
            formation: item.session.formation,
            session: item.session,
            order_id: order.id
          })
        }
        
        // Email de satisfaction 1 jour après la formation
        if (canSendEmail(sessionDate, 'after', 1) && daysUntil === -1) {
          emailQueue.push({
            user: order.user,
            type: 'satisfaction_survey',
            formation: item.session.formation,
            session: item.session,
            order_id: order.id
          })
        }
        
        // Email d'évaluation 3 jours après la formation
        if (canSendEmail(sessionDate, 'after', 3) && daysUntil === -3) {
          emailQueue.push({
            user: order.user,
            type: 'evaluation_quiz',
            formation: item.session.formation,
            session: item.session,
            order_id: order.id
          })
        }
      }
    }
    
    return emailQueue
  } catch (error) {
    console.error('Erreur lors de l\'identification des destinataires:', error)
    return emailQueue
  }
}

/**
 * Ajoute les emails dans une table de queue pour traitement ultérieur
 */
async function queueEmails(emailQueue: any[]) {
  try {
    // Créer les entrées dans la table email_queue
    const emailQueueEntries = emailQueue.map(email => ({
      user_id: email.user.id,
      email_type: email.type,
      email_to: email.user.email,
      template_data: {
        user_name: `${email.user.first_name} ${email.user.last_name}`,
        formation_title: email.formation?.title,
        session_date: email.session?.start_date,
        session_city: email.session?.city,
        session_venue: email.session?.venue_name,
        order_id: email.order_id
      },
      status: 'pending',
      scheduled_for: new Date().toISOString()
    }))
    
    const { error } = await supabase
      .from('email_queue')
      .insert(emailQueueEntries)
    
    if (error) throw error
    
    console.log(`✅ ${emailQueueEntries.length} emails ajoutés à la queue`)
  } catch (error) {
    console.error('Erreur lors de la mise en queue des emails:', error)
    throw error
  }
}

/**
 * Fonction utilitaire pour exécuter le job manuellement
 */
export async function runFormationStatusUpdateJob() {
  console.log('🚀 Exécution manuelle du job de mise à jour des statuts...')
  
  try {
    await updateFormationStatuses()
    return { success: true, message: 'Job exécuté avec succès' }
  } catch (error) {
    console.error('Erreur lors de l\'exécution du job:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}