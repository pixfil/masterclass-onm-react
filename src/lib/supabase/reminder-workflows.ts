// Service de workflows de rappels automatiques - Masterclass ONM
import { supabase } from '../supabaseClient'
import { EmailTemplatesService } from './email-templates'
import { sendReferralReminder } from './referral-emails'

export interface ReminderWorkflow {
  id: string
  type: 'formation_reminder' | 'incomplete_profile' | 'inactive_user' | 'referral_pending' | 'certification_expiry' | 'session_reminder'
  name: string
  description: string
  trigger_conditions: Record<string, any>
  actions: ReminderAction[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ReminderAction {
  type: 'email' | 'notification' | 'badge' | 'task'
  delay_minutes: number
  template_id?: string
  data?: Record<string, any>
}

export interface ScheduledReminder {
  id: string
  workflow_id: string
  user_id: string
  scheduled_for: string
  status: 'pending' | 'sent' | 'cancelled' | 'failed'
  attempts: number
  last_attempt_at?: string
  metadata?: Record<string, any>
}

export class ReminderWorkflowsService {
  // =============================================================================
  // WORKFLOWS PRÉDÉFINIS
  // =============================================================================

  static readonly PREDEFINED_WORKFLOWS: Partial<ReminderWorkflow>[] = [
    {
      type: 'formation_reminder',
      name: 'Rappel de formation à venir',
      description: 'Envoie des rappels avant le début d\'une formation',
      trigger_conditions: {
        event: 'formation_enrollment',
        status: 'confirmed'
      },
      actions: [
        {
          type: 'email',
          delay_minutes: -1440, // 24h avant
          data: { template_type: 'formation_reminder_24h' }
        },
        {
          type: 'email',
          delay_minutes: -60, // 1h avant
          data: { template_type: 'formation_reminder_1h' }
        }
      ],
      is_active: true
    },
    {
      type: 'incomplete_profile',
      name: 'Profil incomplet',
      description: 'Encourage les utilisateurs à compléter leur profil',
      trigger_conditions: {
        event: 'user_registration',
        profile_completeness: '<50'
      },
      actions: [
        {
          type: 'email',
          delay_minutes: 1440, // 24h après inscription
          data: { template_type: 'complete_profile_reminder' }
        },
        {
          type: 'email',
          delay_minutes: 10080, // 7 jours après
          data: { template_type: 'complete_profile_followup' }
        }
      ],
      is_active: true
    },
    {
      type: 'inactive_user',
      name: 'Réengagement utilisateur inactif',
      description: 'Relance les utilisateurs inactifs',
      trigger_conditions: {
        event: 'user_inactivity',
        days_inactive: 30
      },
      actions: [
        {
          type: 'email',
          delay_minutes: 0,
          data: { template_type: 'reengagement_30days' }
        },
        {
          type: 'email',
          delay_minutes: 20160, // 14 jours après le premier
          data: { template_type: 'reengagement_offer' }
        }
      ],
      is_active: true
    },
    {
      type: 'referral_pending',
      name: 'Rappel invitation parrainage',
      description: 'Rappelle aux filleuls d\'accepter leur invitation',
      trigger_conditions: {
        event: 'referral_created',
        status: 'pending'
      },
      actions: [
        {
          type: 'email',
          delay_minutes: 4320, // 3 jours après
          data: { template_type: 'referral_reminder' }
        },
        {
          type: 'email',
          delay_minutes: 14400, // 10 jours après
          data: { template_type: 'referral_last_chance' }
        }
      ],
      is_active: true
    },
    {
      type: 'certification_expiry',
      name: 'Expiration de certification',
      description: 'Alerte avant l\'expiration d\'une certification',
      trigger_conditions: {
        event: 'certification_expiry',
        days_before: 30
      },
      actions: [
        {
          type: 'email',
          delay_minutes: 0,
          data: { template_type: 'certification_expiry_30days' }
        },
        {
          type: 'notification',
          delay_minutes: 0,
          data: { title: 'Certification bientôt expirée' }
        }
      ],
      is_active: true
    },
    {
      type: 'session_reminder',
      name: 'Rappel de session en direct',
      description: 'Rappelle les sessions live aux inscrits',
      trigger_conditions: {
        event: 'session_scheduled',
        type: 'live'
      },
      actions: [
        {
          type: 'email',
          delay_minutes: -120, // 2h avant
          data: { template_type: 'session_reminder' }
        },
        {
          type: 'notification',
          delay_minutes: -30, // 30min avant
          data: { title: 'Session live dans 30 minutes' }
        }
      ],
      is_active: true
    }
  ]

  // =============================================================================
  // GESTION DES WORKFLOWS
  // =============================================================================

  /**
   * Initialise les workflows prédéfinis
   */
  static async initializeWorkflows(): Promise<void> {
    try {
      for (const workflow of this.PREDEFINED_WORKFLOWS) {
        const existing = await supabase
          .from('reminder_workflows')
          .select('id')
          .eq('type', workflow.type!)
          .single()

        if (!existing.data) {
          await supabase
            .from('reminder_workflows')
            .insert(workflow)
        }
      }
      console.log('✅ Workflows de rappel initialisés')
    } catch (error) {
      console.error('❌ Erreur initialisation workflows:', error)
    }
  }

  /**
   * Récupère tous les workflows actifs
   */
  static async getActiveWorkflows(): Promise<ReminderWorkflow[]> {
    try {
      const { data, error } = await supabase
        .from('reminder_workflows')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur récupération workflows:', error)
      return []
    }
  }

  // =============================================================================
  // PLANIFICATION DES RAPPELS
  // =============================================================================

  /**
   * Planifie des rappels basés sur un événement
   */
  static async scheduleReminders(event: {
    type: string
    user_id: string
    data: Record<string, any>
  }): Promise<void> {
    try {
      // Récupérer les workflows correspondants à l'événement
      const workflows = await this.getActiveWorkflows()
      const matchingWorkflows = workflows.filter(w => 
        w.trigger_conditions.event === event.type
      )

      for (const workflow of matchingWorkflows) {
        // Vérifier si les conditions sont remplies
        if (this.checkTriggerConditions(workflow.trigger_conditions, event.data)) {
          await this.createScheduledReminders(workflow, event.user_id, event.data)
        }
      }
    } catch (error) {
      console.error('Erreur planification rappels:', error)
    }
  }

  /**
   * Vérifie si les conditions de déclenchement sont remplies
   */
  private static checkTriggerConditions(
    conditions: Record<string, any>,
    eventData: Record<string, any>
  ): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'event') continue

      if (typeof value === 'string' && value.startsWith('<')) {
        const threshold = parseInt(value.substring(1))
        if (eventData[key] >= threshold) return false
      } else if (typeof value === 'string' && value.startsWith('>')) {
        const threshold = parseInt(value.substring(1))
        if (eventData[key] <= threshold) return false
      } else if (eventData[key] !== value) {
        return false
      }
    }
    return true
  }

  /**
   * Crée les rappels planifiés pour un workflow
   */
  private static async createScheduledReminders(
    workflow: ReminderWorkflow,
    userId: string,
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      const baseTime = eventData.scheduled_at 
        ? new Date(eventData.scheduled_at) 
        : new Date()

      for (const action of workflow.actions) {
        const scheduledTime = new Date(baseTime.getTime() + action.delay_minutes * 60000)
        
        // Ne pas planifier dans le passé
        if (scheduledTime < new Date()) continue

        await supabase
          .from('scheduled_reminders')
          .insert({
            workflow_id: workflow.id,
            user_id: userId,
            action_type: action.type,
            scheduled_for: scheduledTime.toISOString(),
            status: 'pending',
            metadata: {
              ...eventData,
              action_data: action.data
            }
          })
      }
    } catch (error) {
      console.error('Erreur création rappels planifiés:', error)
    }
  }

  // =============================================================================
  // EXÉCUTION DES RAPPELS
  // =============================================================================

  /**
   * Traite les rappels en attente
   */
  static async processReminders(): Promise<void> {
    try {
      // Récupérer les rappels à envoyer
      const { data: reminders } = await supabase
        .from('scheduled_reminders')
        .select(`
          *,
          workflow:reminder_workflows(*)
        `)
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .limit(50)

      if (!reminders || reminders.length === 0) return

      console.log(`🔔 Traitement de ${reminders.length} rappels`)

      for (const reminder of reminders) {
        await this.executeReminder(reminder)
      }
    } catch (error) {
      console.error('Erreur traitement rappels:', error)
    }
  }

  /**
   * Exécute un rappel spécifique
   */
  private static async executeReminder(reminder: ScheduledReminder & { workflow: ReminderWorkflow }): Promise<void> {
    try {
      const action = reminder.workflow.actions.find(a => 
        a.type === reminder.metadata?.action_data?.type
      )

      if (!action) {
        throw new Error('Action non trouvée')
      }

      switch (action.type) {
        case 'email':
          await this.sendEmailReminder(reminder, action)
          break
        case 'notification':
          await this.sendNotificationReminder(reminder, action)
          break
        case 'badge':
          await this.grantBadgeReminder(reminder, action)
          break
        case 'task':
          await this.createTaskReminder(reminder, action)
          break
      }

      // Marquer comme envoyé
      await supabase
        .from('scheduled_reminders')
        .update({
          status: 'sent',
          last_attempt_at: new Date().toISOString(),
          attempts: (reminder.attempts || 0) + 1
        })
        .eq('id', reminder.id)

    } catch (error) {
      console.error(`Erreur exécution rappel ${reminder.id}:`, error)
      
      // Marquer comme échoué après 3 tentatives
      if ((reminder.attempts || 0) >= 3) {
        await supabase
          .from('scheduled_reminders')
          .update({
            status: 'failed',
            last_attempt_at: new Date().toISOString(),
            attempts: (reminder.attempts || 0) + 1
          })
          .eq('id', reminder.id)
      } else {
        // Réessayer plus tard
        await supabase
          .from('scheduled_reminders')
          .update({
            last_attempt_at: new Date().toISOString(),
            attempts: (reminder.attempts || 0) + 1
          })
          .eq('id', reminder.id)
      }
    }
  }

  /**
   * Envoie un rappel par email
   */
  private static async sendEmailReminder(
    reminder: ScheduledReminder,
    action: ReminderAction
  ): Promise<void> {
    try {
      // Récupérer les informations utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', reminder.user_id)
        .single()

      if (!profile) throw new Error('Profil utilisateur non trouvé')

      const templateType = action.data?.template_type

      // Cas spécial pour les rappels de parrainage
      if (templateType === 'referral_reminder' && reminder.metadata?.referral_id) {
        const { data: referral } = await supabase
          .from('referrals')
          .select('*')
          .eq('id', reminder.metadata.referral_id)
          .single()

        if (referral) {
          const daysRemaining = Math.ceil(
            (new Date(referral.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )

          await sendReferralReminder(
            profile,
            referral.referee_email,
            referral.referee_name || 'Cher(e) collègue',
            `${process.env.NEXT_PUBLIC_SITE_URL}/referral/${referral.referral_token}`,
            daysRemaining
          )
        }
      } else {
        // Autres types d'emails
        await EmailTemplatesService.sendAutomaticEmail(
          templateType,
          profile.email,
          {
            user: profile,
            ...reminder.metadata
          }
        )
      }
    } catch (error) {
      console.error('Erreur envoi email rappel:', error)
      throw error
    }
  }

  /**
   * Envoie une notification in-app
   */
  private static async sendNotificationReminder(
    reminder: ScheduledReminder,
    action: ReminderAction
  ): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: reminder.user_id,
          title: action.data?.title || 'Rappel',
          message: action.data?.message || '',
          type: 'reminder',
          metadata: reminder.metadata,
          is_read: false
        })
    } catch (error) {
      console.error('Erreur envoi notification:', error)
      throw error
    }
  }

  /**
   * Attribue un badge automatiquement
   */
  private static async grantBadgeReminder(
    reminder: ScheduledReminder,
    action: ReminderAction
  ): Promise<void> {
    try {
      if (!action.data?.badge_id) return

      await supabase
        .from('user_badges')
        .insert({
          user_id: reminder.user_id,
          badge_id: action.data.badge_id,
          earned_at: new Date().toISOString(),
          progress: 100
        })
    } catch (error) {
      console.error('Erreur attribution badge:', error)
      throw error
    }
  }

  /**
   * Crée une tâche pour l'utilisateur
   */
  private static async createTaskReminder(
    reminder: ScheduledReminder,
    action: ReminderAction
  ): Promise<void> {
    try {
      await supabase
        .from('user_tasks')
        .insert({
          user_id: reminder.user_id,
          title: action.data?.title || 'Tâche à faire',
          description: action.data?.description || '',
          due_date: action.data?.due_date,
          priority: action.data?.priority || 'medium',
          status: 'pending'
        })
    } catch (error) {
      console.error('Erreur création tâche:', error)
      throw error
    }
  }

  // =============================================================================
  // GESTION DES RAPPELS
  // =============================================================================

  /**
   * Annule les rappels pour un utilisateur
   */
  static async cancelUserReminders(
    userId: string,
    workflowType?: string
  ): Promise<void> {
    try {
      let query = supabase
        .from('scheduled_reminders')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'pending')

      if (workflowType) {
        const { data: workflow } = await supabase
          .from('reminder_workflows')
          .select('id')
          .eq('type', workflowType)
          .single()

        if (workflow) {
          query = query.eq('workflow_id', workflow.id)
        }
      }

      await query
    } catch (error) {
      console.error('Erreur annulation rappels:', error)
    }
  }

  /**
   * Récupère les rappels d'un utilisateur
   */
  static async getUserReminders(
    userId: string,
    status?: 'pending' | 'sent' | 'cancelled' | 'failed'
  ): Promise<ScheduledReminder[]> {
    try {
      let query = supabase
        .from('scheduled_reminders')
        .select(`
          *,
          workflow:reminder_workflows(*)
        `)
        .eq('user_id', userId)
        .order('scheduled_for', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur récupération rappels utilisateur:', error)
      return []
    }
  }

  // =============================================================================
  // VÉRIFICATIONS PÉRIODIQUES
  // =============================================================================

  /**
   * Vérifie les utilisateurs inactifs
   */
  static async checkInactiveUsers(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Récupérer les utilisateurs sans activité récente
      const { data: inactiveUsers } = await supabase
        .from('profiles')
        .select('id, email, last_activity_at')
        .lt('last_activity_at', thirtyDaysAgo.toISOString())
        .limit(100)

      if (!inactiveUsers || inactiveUsers.length === 0) return

      for (const user of inactiveUsers) {
        await this.scheduleReminders({
          type: 'user_inactivity',
          user_id: user.id,
          data: {
            days_inactive: 30,
            last_activity: user.last_activity_at
          }
        })
      }
    } catch (error) {
      console.error('Erreur vérification utilisateurs inactifs:', error)
    }
  }

  /**
   * Vérifie les certifications qui expirent
   */
  static async checkExpiringCertifications(): Promise<void> {
    try {
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const { data: expiringCerts } = await supabase
        .from('user_certifications')
        .select('*')
        .eq('status', 'active')
        .lte('expires_at', thirtyDaysFromNow.toISOString())
        .gte('expires_at', new Date().toISOString())

      if (!expiringCerts || expiringCerts.length === 0) return

      for (const cert of expiringCerts) {
        await this.scheduleReminders({
          type: 'certification_expiry',
          user_id: cert.user_id,
          data: {
            certification_id: cert.id,
            certification_name: cert.certification_name,
            expires_at: cert.expires_at
          }
        })
      }
    } catch (error) {
      console.error('Erreur vérification certifications:', error)
    }
  }
}

// Exports pour utilisation directe
export const initializeWorkflows = ReminderWorkflowsService.initializeWorkflows.bind(ReminderWorkflowsService)
export const scheduleReminders = ReminderWorkflowsService.scheduleReminders.bind(ReminderWorkflowsService)
export const processReminders = ReminderWorkflowsService.processReminders.bind(ReminderWorkflowsService)
export const cancelUserReminders = ReminderWorkflowsService.cancelUserReminders.bind(ReminderWorkflowsService)
export const getUserReminders = ReminderWorkflowsService.getUserReminders.bind(ReminderWorkflowsService)