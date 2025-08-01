// Service Supabase pour le Journal d'Activité - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  UserActivityLog,
  AdminActivityLog,
  ActivitySummary,
  UserDocument,
  UserActionType,
  ActivityFilters,
  ActivitySearchParams,
  PaginatedResponse,
  APIResponse 
} from './types/activity-types'

export class ActivityLogsService {
  // =============================================================================
  // JOURNALISATION DES ACTIVITÉS UTILISATEUR
  // =============================================================================

  /**
   * Enregistre une activité utilisateur
   */
  static async logUserActivity(
    actionType: UserActionType,
    actionDetails?: UserActivityLog['action_details'],
    entityType?: string,
    entityId?: string
  ): Promise<APIResponse<UserActivityLog>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Utilisateur non authentifié')

      const { data, error } = await supabase
        .from('user_activity_log')
        .insert([{
          user_id: user.id,
          action_type: actionType,
          action_details: actionDetails || {},
          entity_type: entityType,
          entity_id: entityId,
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de l\'enregistrement'
      }
    }
  }

  /**
   * Récupère l'historique d'activité d'un utilisateur
   */
  static async getUserActivityHistory(
    params: ActivitySearchParams = {}
  ): Promise<PaginatedResponse<UserActivityLog>> {
    try {
      const { 
        filters = {}, 
        sort_order = 'desc',
        page = 1, 
        limit = 50 
      } = params

      const userId = filters.user_id || (await supabase.auth.getUser()).data.user?.id
      if (!userId) throw new Error('Utilisateur non spécifié')

      let query = supabase
        .from('user_activity_log')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: sort_order === 'asc' })

      // Filtres
      if (filters.action_type) {
        query = query.eq('action_type', filters.action_type)
      }
      if (filters.entity_type) {
        query = query.eq('entity_type', filters.entity_type)
      }
      if (filters.entity_id) {
        query = query.eq('entity_id', filters.entity_id)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        },
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Génère un résumé d'activité pour une période
   */
  static async getActivitySummary(
    userId?: string,
    period: ActivitySummary['period'] = 'week'
  ): Promise<APIResponse<ActivitySummary>> {
    try {
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) throw new Error('Utilisateur non spécifié')

      // Calculer les dates de début et fin
      const endDate = new Date()
      const startDate = new Date()
      
      switch (period) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1)
          break
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1)
          break
      }

      const { data: activities } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', currentUserId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      // Calculer les statistiques
      const actionsByType: Record<UserActionType, number> = {} as any
      const dailyActivity: Record<string, number> = {}
      const hourlyActivity: Record<number, number> = {}

      activities?.forEach(activity => {
        // Actions par type
        actionsByType[activity.action_type] = (actionsByType[activity.action_type] || 0) + 1

        // Activité par jour
        const day = new Date(activity.created_at).toISOString().split('T')[0]
        dailyActivity[day] = (dailyActivity[day] || 0) + 1

        // Activité par heure
        const hour = new Date(activity.created_at).getHours()
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1
      })

      // Trouver le jour et l'heure les plus actifs
      const mostActiveDay = Object.entries(dailyActivity)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || ''
      
      const mostActiveHour = Object.entries(hourlyActivity)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '0'

      const summary: ActivitySummary = {
        user_id: currentUserId,
        period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_actions: activities?.length || 0,
        actions_by_type: actionsByType,
        most_active_day: mostActiveDay,
        most_active_hour: parseInt(mostActiveHour),
        formations_viewed: activities?.filter(a => a.action_type === 'view_formation').length || 0,
        resources_downloaded: activities?.filter(a => a.action_type === 'download_resource').length || 0,
        videos_watched: activities?.filter(a => a.action_type === 'watch_video').length || 0,
        podcasts_listened: activities?.filter(a => a.action_type === 'listen_podcast').length || 0,
        badges_earned: activities?.filter(a => a.action_type === 'earn_badge').length || 0,
        referrals_sent: activities?.filter(a => a.action_type === 'send_referral').length || 0,
        learning_time_minutes: activities?.reduce((acc, a) => {
          return acc + (a.action_details?.duration || 0)
        }, 0) || 0
      }

      return {
        data: summary,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du calcul du résumé:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors du calcul du résumé'
      }
    }
  }

  // =============================================================================
  // JOURNALISATION DES ACTIVITÉS ADMIN
  // =============================================================================

  /**
   * Enregistre une activité admin
   */
  static async logAdminActivity(
    actionType: string,
    actionDetails: AdminActivityLog['action_details'],
    affectedUserId?: string,
    affectedEntityType?: string,
    affectedEntityId?: string
  ): Promise<APIResponse<AdminActivityLog>> {
    try {
      const admin = (await supabase.auth.getUser()).data.user
      if (!admin) throw new Error('Admin non authentifié')

      const { data, error } = await supabase
        .from('admin_activity_log')
        .insert([{
          admin_id: admin.id,
          action_type: actionType,
          action_details: actionDetails,
          affected_user_id: affectedUserId,
          affected_entity_type: affectedEntityType,
          affected_entity_id: affectedEntityId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité admin:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de l\'enregistrement'
      }
    }
  }

  /**
   * Récupère l'historique des activités admin
   */
  static async getAdminActivityHistory(
    filters?: {
      admin_id?: string
      action_type?: string
      affected_user_id?: string
      date_from?: string
      date_to?: string
    },
    page = 1,
    limit = 50
  ): Promise<PaginatedResponse<AdminActivityLog>> {
    try {
      let query = supabase
        .from('admin_activity_log')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      // Filtres
      if (filters?.admin_id) {
        query = query.eq('admin_id', filters.admin_id)
      }
      if (filters?.action_type) {
        query = query.eq('action_type', filters.action_type)
      }
      if (filters?.affected_user_id) {
        query = query.eq('affected_user_id', filters.affected_user_id)
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        },
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique admin:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  // =============================================================================
  // DOCUMENTS PERSONNELS
  // =============================================================================

  /**
   * Récupère les documents personnels d'un utilisateur
   */
  static async getUserDocuments(
    filters?: {
      formation_id?: string
      resource_id?: string
      is_read?: boolean
      is_downloaded?: boolean
      is_unlocked?: boolean
    }
  ): Promise<APIResponse<UserDocument[]>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Utilisateur non authentifié')

      let query = supabase
        .from('user_documents')
        .select(`
          *,
          formation:formations(id, title, slug),
          resource:resources(id, title, type)
        `)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      // Filtres
      if (filters?.formation_id) {
        query = query.eq('formation_id', filters.formation_id)
      }
      if (filters?.resource_id) {
        query = query.eq('resource_id', filters.resource_id)
      }
      if (filters?.is_read !== undefined) {
        query = query.eq('is_read', filters.is_read)
      }
      if (filters?.is_downloaded !== undefined) {
        query = query.eq('is_downloaded', filters.is_downloaded)
      }
      if (filters?.is_unlocked !== undefined) {
        query = query.eq('is_unlocked', filters.is_unlocked)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération des documents'
      }
    }
  }

  /**
   * Marque un document comme lu
   */
  static async markDocumentAsRead(documentId: string): Promise<APIResponse<boolean>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Utilisateur non authentifié')

      const { error } = await supabase
        .from('user_documents')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .eq('user_id', user.id)

      if (error) throw error

      // Enregistrer l'activité
      await this.logUserActivity('view_certificate', {
        entity_name: 'Document',
        entity_url: `/documents/${documentId}`
      }, 'document', documentId)

      return {
        data: true,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du marquage du document:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors du marquage'
      }
    }
  }

  /**
   * Marque un document comme téléchargé
   */
  static async markDocumentAsDownloaded(documentId: string): Promise<APIResponse<boolean>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Utilisateur non authentifié')

      const { error } = await supabase
        .from('user_documents')
        .update({ 
          is_downloaded: true,
          downloaded_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .eq('user_id', user.id)

      if (error) throw error

      return {
        data: true,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du marquage du téléchargement:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors du marquage'
      }
    }
  }

  // =============================================================================
  // UTILITAIRES
  // =============================================================================

  /**
   * Nettoie les anciennes entrées du journal (plus de 90 jours)
   */
  static async cleanupOldLogs(): Promise<void> {
    try {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      await supabase
        .from('user_activity_log')
        .delete()
        .lt('created_at', ninetyDaysAgo.toISOString())
    } catch (error) {
      console.error('Erreur lors du nettoyage des logs:', error)
    }
  }
}

// Exports pour la compatibilité
export const logUserActivity = ActivityLogsService.logUserActivity
export const getUserActivityHistory = ActivityLogsService.getUserActivityHistory
export const getActivitySummary = ActivityLogsService.getActivitySummary
export const logAdminActivity = ActivityLogsService.logAdminActivity
export const getUserDocuments = ActivityLogsService.getUserDocuments