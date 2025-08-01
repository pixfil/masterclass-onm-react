// Service de workflows automatisés pour les rappels - Masterclass ONM
import { supabase } from '../supabaseClient'
import { EmailTemplatesService } from '../supabase/email-templates'
import { ReferralEmails } from '../email/referral-templates'

export interface ReminderWorkflow {
  id: string
  type: 'formation_reminder' | 'referral_reminder' | 'payment_reminder' | 'certificate_reminder'
  trigger_type: 'before_date' | 'after_date' | 'recurring'
  trigger_days: number // Nombre de jours avant/après l'événement
  is_active: boolean
  created_at: string
  updated_at: string
}

export class ReminderWorkflowsService {
  
  // =============================================================================
  // RAPPELS DE FORMATION
  // =============================================================================
  
  /**
   * Vérifier et envoyer les rappels de formation
   */
  static async processFormationReminders() {
    try {
      // Rappels 7 jours avant la formation
      const { data: upcomingSessions } = await supabase
        .from('formation_sessions')
        .select(`
          *,
          formation:formations(*),
          enrollments:formation_enrollments(
            *,
            user:profiles(*)
          )
        `)
        .eq('status', 'confirmed')
        .gte('start_date', new Date().toISOString())
        .lte('start_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      
      if (upcomingSessions) {
        for (const session of upcomingSessions) {
          const daysUntilStart = Math.ceil(
            (new Date(session.start_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          )
          
          // Envoyer un rappel à chaque participant
          for (const enrollment of session.enrollments || []) {
            if (enrollment.status === 'confirmed' && enrollment.user) {
              await this.sendFormationReminder({
                user: enrollment.user,
                formation: session.formation,
                session,
                daysUntilStart
              })
            }
          }
        }
      }
      
      // Rappels 1 jour avant la formation
      const { data: tomorrowSessions } = await supabase
        .from('formation_sessions')
        .select(`
          *,
          formation:formations(*),
          enrollments:formation_enrollments(
            *,
            user:profiles(*)
          )
        `)
        .eq('status', 'confirmed')
        .gte('start_date', new Date().toISOString())
        .lte('start_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      
      if (tomorrowSessions) {
        for (const session of tomorrowSessions) {
          for (const enrollment of session.enrollments || []) {
            if (enrollment.status === 'confirmed' && enrollment.user) {
              await this.sendLastMinuteFormationReminder({
                user: enrollment.user,
                formation: session.formation,
                session
              })
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement des rappels de formation:', error)
    }
  }
  
  /**
   * Envoyer un rappel de formation (7 jours avant)
   */
  private static async sendFormationReminder(data: {
    user: any
    formation: any
    session: any
    daysUntilStart: number
  }) {
    await EmailTemplatesService.sendAutomaticEmail(
      'formation_reminder_7days',
      data.user.email,
      {
        user: data.user,
        formation: data.formation,
        session: data.session,
        days_until_start: data.daysUntilStart,
        start_date: new Date(data.session.start_date).toLocaleDateString('fr-FR'),
        dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/mon-compte/formations`
      }
    )
  }
  
  /**
   * Envoyer un rappel de dernière minute (1 jour avant)
   */
  private static async sendLastMinuteFormationReminder(data: {
    user: any
    formation: any
    session: any
  }) {
    await EmailTemplatesService.sendAutomaticEmail(
      'formation_reminder_1day',
      data.user.email,
      {
        user: data.user,
        formation: data.formation,
        session: data.session,
        start_time: new Date(data.session.start_date).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        meeting_link: data.session.meeting_link || '#',
        materials_link: `${process.env.NEXT_PUBLIC_SITE_URL}/formations/${data.formation.slug}/ressources`
      }
    )
  }
  
  // =============================================================================
  // RAPPELS DE PARRAINAGE
  // =============================================================================
  
  /**
   * Vérifier et envoyer les rappels de parrainage
   */
  static async processReferralReminders() {
    try {
      // Récupérer les parrainages en attente depuis plus de 14 jours
      const { data: pendingReferrals } = await supabase
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrals_referrer_id_fkey(*)
        `)
        .eq('status', 'pending')
        .lte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .gte('created_at', new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString())
      
      if (pendingReferrals) {
        for (const referral of pendingReferrals) {
          const daysRemaining = 30 - Math.ceil(
            (Date.now() - new Date(referral.created_at).getTime()) / (24 * 60 * 60 * 1000)
          )
          
          if (daysRemaining > 0 && referral.referrer) {
            await ReferralEmails.sendReminder({
              referrer: referral.referrer,
              referral_name: referral.referral_name,
              referral_email: referral.referral_email,
              days_remaining: daysRemaining,
              referral_id: referral.id
            })
            
            // Marquer le rappel comme envoyé
            await supabase
              .from('referrals')
              .update({ reminder_sent: true })
              .eq('id', referral.id)
          }
        }
      }
      
      // Expirer les parrainages de plus de 30 jours
      await supabase
        .from('referrals')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      
    } catch (error) {
      console.error('Erreur lors du traitement des rappels de parrainage:', error)
    }
  }
  
  // =============================================================================
  // RAPPELS DE PAIEMENT
  // =============================================================================
  
  /**
   * Vérifier et envoyer les rappels de paiement
   */
  static async processPaymentReminders() {
    try {
      // Rappels pour les paiements en attente
      const { data: pendingPayments } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(*),
          order_items(
            *,
            formation:formations(*)
          )
        `)
        .eq('payment_status', 'pending')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
      
      if (pendingPayments) {
        for (const order of pendingPayments) {
          if (order.user && !order.payment_reminder_sent) {
            await this.sendPaymentReminder({
              user: order.user,
              order,
              formations: order.order_items?.map((item: any) => item.formation) || []
            })
            
            // Marquer le rappel comme envoyé
            await supabase
              .from('orders')
              .update({ payment_reminder_sent: true })
              .eq('id', order.id)
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement des rappels de paiement:', error)
    }
  }
  
  /**
   * Envoyer un rappel de paiement
   */
  private static async sendPaymentReminder(data: {
    user: any
    order: any
    formations: any[]
  }) {
    await EmailTemplatesService.sendAutomaticEmail(
      'payment_reminder',
      data.user.email,
      {
        user: data.user,
        order: data.order,
        formations: data.formations,
        payment_link: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout?order=${data.order.id}`,
        expiration_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')
      }
    )
  }
  
  // =============================================================================
  // RAPPELS DE CERTIFICAT
  // =============================================================================
  
  /**
   * Vérifier et envoyer les rappels pour compléter les évaluations
   */
  static async processCertificateReminders() {
    try {
      // Formations terminées sans évaluation complétée
      const { data: completedFormations } = await supabase
        .from('formation_enrollments')
        .select(`
          *,
          user:profiles(*),
          formation:formations(*),
          session:formation_sessions(*)
        `)
        .eq('status', 'completed')
        .is('evaluation_completed', false)
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .lte('completed_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
      
      if (completedFormations) {
        for (const enrollment of completedFormations) {
          if (enrollment.user && enrollment.formation && !enrollment.evaluation_reminder_sent) {
            await this.sendEvaluationReminder({
              user: enrollment.user,
              formation: enrollment.formation,
              enrollment
            })
            
            // Marquer le rappel comme envoyé
            await supabase
              .from('formation_enrollments')
              .update({ evaluation_reminder_sent: true })
              .eq('id', enrollment.id)
          }
        }
      }
      
    } catch (error) {
      console.error('Erreur lors du traitement des rappels de certificat:', error)
    }
  }
  
  /**
   * Envoyer un rappel pour compléter l'évaluation
   */
  private static async sendEvaluationReminder(data: {
    user: any
    formation: any
    enrollment: any
  }) {
    await EmailTemplatesService.sendAutomaticEmail(
      'evaluation_reminder',
      data.user.email,
      {
        user: data.user,
        formation: data.formation,
        evaluation_link: `${process.env.NEXT_PUBLIC_SITE_URL}/evaluation/${data.enrollment.id}`,
        days_remaining: 27 // 30 jours - 3 jours écoulés
      }
    )
  }
  
  // =============================================================================
  // CRON JOB PRINCIPAL
  // =============================================================================
  
  /**
   * Exécuter tous les workflows de rappel
   * À appeler via un cron job toutes les heures
   */
  static async runAllWorkflows() {
    console.log('Démarrage des workflows de rappel...')
    
    try {
      // Exécuter tous les workflows en parallèle
      await Promise.all([
        this.processFormationReminders(),
        this.processReferralReminders(),
        this.processPaymentReminders(),
        this.processCertificateReminders()
      ])
      
      console.log('Workflows de rappel terminés avec succès')
      
      // Logger l'exécution
      await supabase
        .from('workflow_logs')
        .insert({
          type: 'reminder_workflows',
          status: 'success',
          executed_at: new Date().toISOString()
        })
      
    } catch (error) {
      console.error('Erreur lors de l\'exécution des workflows:', error)
      
      // Logger l'erreur
      await supabase
        .from('workflow_logs')
        .insert({
          type: 'reminder_workflows',
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Erreur inconnue',
          executed_at: new Date().toISOString()
        })
    }
  }
  
  // =============================================================================
  // CONFIGURATION DES WORKFLOWS
  // =============================================================================
  
  /**
   * Activer ou désactiver un workflow
   */
  static async toggleWorkflow(workflowType: string, isActive: boolean) {
    const { error } = await supabase
      .from('reminder_workflows')
      .update({ is_active: isActive })
      .eq('type', workflowType)
    
    if (error) {
      console.error('Erreur lors de la mise à jour du workflow:', error)
      throw error
    }
  }
  
  /**
   * Obtenir la configuration des workflows
   */
  static async getWorkflowsConfig(): Promise<ReminderWorkflow[]> {
    const { data, error } = await supabase
      .from('reminder_workflows')
      .select('*')
      .order('type')
    
    if (error) {
      console.error('Erreur lors de la récupération des workflows:', error)
      return []
    }
    
    return data || []
  }
}

// Export pour utilisation dans une API route ou un cron job
export const runReminderWorkflows = ReminderWorkflowsService.runAllWorkflows.bind(ReminderWorkflowsService)