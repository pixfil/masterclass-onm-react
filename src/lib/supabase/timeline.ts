// Service Supabase pour la Timeline ONM - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  TimelineEvent,
  TimelineFilters,
  TimelineStats,
  APIResponse 
} from './types/timeline-types'

export class TimelineService {
  // =============================================================================
  // LECTURE DE LA TIMELINE
  // =============================================================================

  /**
   * Récupère les événements de la timeline d'un utilisateur
   */
  static async getUserTimeline(userId?: string, filters: TimelineFilters = {}): Promise<APIResponse<TimelineEvent[]>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!effectiveUserId) {
        return { data: [], success: false, message: 'Utilisateur non connecté' }
      }

      let query = supabase
        .from('timeline_events')
        .select(`
          *,
          formation:formations(*),
          certification:certifications(*),
          badge:badges(*)
        `)
        .eq('user_id', effectiveUserId)
        .order('event_date', { ascending: false })

      // Filtres
      if (filters.event_type) {
        query = query.eq('event_type', filters.event_type)
      }
      if (filters.year) {
        const startDate = new Date(filters.year, 0, 1).toISOString()
        const endDate = new Date(filters.year, 11, 31, 23, 59, 59).toISOString()
        query = query.gte('event_date', startDate).lte('event_date', endDate)
      }
      if (filters.month && filters.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1).toISOString()
        const endDate = new Date(filters.year, filters.month, 0, 23, 59, 59).toISOString()
        query = query.gte('event_date', startDate).lte('event_date', endDate)
      }
      if (filters.is_milestone !== undefined) {
        query = query.eq('is_milestone', filters.is_milestone)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la timeline:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Récupère les statistiques de la timeline
   */
  static async getTimelineStats(userId?: string): Promise<APIResponse<TimelineStats>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!effectiveUserId) {
        return { 
          data: null as any, 
          success: false, 
          message: 'Utilisateur non connecté' 
        }
      }

      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('user_id', effectiveUserId)

      if (error) throw error

      const events = data || []
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

      // Calcul des statistiques
      const stats: TimelineStats = {
        total_events: events.length,
        formations_completed: events.filter(e => e.event_type === 'formation_completed').length,
        certifications_earned: events.filter(e => e.event_type === 'certification_earned').length,
        badges_earned: events.filter(e => e.event_type === 'badge_earned').length,
        milestones_reached: events.filter(e => e.is_milestone).length,
        events_last_year: events.filter(e => new Date(e.event_date) >= oneYearAgo).length,
        active_months: new Set(events.map(e => {
          const date = new Date(e.event_date)
          return `${date.getFullYear()}-${date.getMonth()}`
        })).size,
        average_events_per_month: 0
      }

      // Calcul de la moyenne mensuelle
      if (events.length > 0) {
        const firstEvent = new Date(Math.min(...events.map(e => new Date(e.event_date).getTime())))
        const monthsSinceFirst = Math.max(1, 
          (now.getFullYear() - firstEvent.getFullYear()) * 12 + 
          (now.getMonth() - firstEvent.getMonth()) + 1
        )
        stats.average_events_per_month = Math.round((events.length / monthsSinceFirst) * 10) / 10
      }

      return {
        data: stats,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors du calcul'
      }
    }
  }

  /**
   * Récupère les années avec des événements
   */
  static async getAvailableYears(userId?: string): Promise<APIResponse<number[]>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!effectiveUserId) {
        return { data: [], success: false }
      }

      const { data, error } = await supabase
        .from('timeline_events')
        .select('event_date')
        .eq('user_id', effectiveUserId)

      if (error) throw error

      const years = [...new Set(
        data?.map(e => new Date(e.event_date).getFullYear()) || []
      )].sort((a, b) => b - a)

      return {
        data: years,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des années:', error)
      return {
        data: [],
        success: false
      }
    }
  }

  /**
   * Récupère les prochains jalons à atteindre
   */
  static async getUpcomingMilestones(userId?: string): Promise<APIResponse<any[]>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!effectiveUserId) {
        return { data: [], success: false }
      }

      // Récupérer les statistiques actuelles
      const { data: stats } = await this.getTimelineStats(userId)
      if (!stats) return { data: [], success: false }

      const milestones = []

      // Jalons de formations
      const formationMilestones = [3, 5, 10, 20, 50]
      const nextFormationMilestone = formationMilestones.find(m => m > stats.formations_completed)
      if (nextFormationMilestone) {
        milestones.push({
          type: 'formations',
          target: nextFormationMilestone,
          current: stats.formations_completed,
          progress: (stats.formations_completed / nextFormationMilestone) * 100,
          title: `Compléter ${nextFormationMilestone} formations`,
          description: `Vous avez complété ${stats.formations_completed} formations sur ${nextFormationMilestone}`
        })
      }

      // Jalons de badges
      const badgeMilestones = [5, 10, 25, 50, 100]
      const nextBadgeMilestone = badgeMilestones.find(m => m > stats.badges_earned)
      if (nextBadgeMilestone) {
        milestones.push({
          type: 'badges',
          target: nextBadgeMilestone,
          current: stats.badges_earned,
          progress: (stats.badges_earned / nextBadgeMilestone) * 100,
          title: `Obtenir ${nextBadgeMilestone} badges`,
          description: `Vous avez obtenu ${stats.badges_earned} badges sur ${nextBadgeMilestone}`
        })
      }

      // Jalons de certifications
      if (stats.certifications_earned < 1) {
        milestones.push({
          type: 'certifications',
          target: 1,
          current: 0,
          progress: 0,
          title: 'Obtenir votre première certification',
          description: 'Complétez un parcours complet pour obtenir une certification'
        })
      }

      return {
        data: milestones.slice(0, 3), // Top 3 milestones
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des jalons:', error)
      return {
        data: [],
        success: false
      }
    }
  }

  // =============================================================================
  // CRÉATION D'ÉVÉNEMENTS (AUTOMATIQUE VIA TRIGGERS)
  // =============================================================================

  /**
   * Crée manuellement un événement personnalisé
   */
  static async createCustomEvent(eventData: {
    title: string
    description?: string
    event_date?: string
    is_milestone?: boolean
  }): Promise<APIResponse<TimelineEvent>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { 
          data: null as any, 
          success: false, 
          message: 'Utilisateur non connecté' 
        }
      }

      const { data, error } = await supabase
        .from('timeline_events')
        .insert([{
          user_id: user.id,
          event_type: 'custom',
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date || new Date().toISOString(),
          is_milestone: eventData.is_milestone || false
        }])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Événement ajouté à votre timeline'
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création'
      }
    }
  }

  /**
   * Supprime un événement personnalisé
   */
  static async deleteCustomEvent(eventId: string): Promise<APIResponse<boolean>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: false, success: false }
      }

      const { error } = await supabase
        .from('timeline_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id)
        .eq('event_type', 'custom')

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Événement supprimé'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la suppression'
      }
    }
  }
}

// Exports pour la compatibilité
export const getUserTimeline = TimelineService.getUserTimeline
export const getTimelineStats = TimelineService.getTimelineStats
export const getAvailableYears = TimelineService.getAvailableYears
export const getUpcomingMilestones = TimelineService.getUpcomingMilestones
export const createCustomEvent = TimelineService.createCustomEvent