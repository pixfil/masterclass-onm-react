// Service Supabase pour les sessions de formations - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  FormationSession, 
  SessionFormData, 
  SessionStatus,
  APIResponse,
  PaginatedResponse 
} from './formations-types'

export class SessionsService {
  // =============================================================================
  // LECTURE DES SESSIONS
  // =============================================================================

  /**
   * Récupère les sessions d'une formation
   */
  static async getSessionsByFormation(formationId: string): Promise<APIResponse<FormationSession[]>> {
    try {
      const { data, error } = await supabase
        .from('formation_sessions')
        .select(`
          *,
          formation:formations(*),
          registrations_count:registrations(count)
        `)
        .eq('formation_id', formationId)
        .in('status', ['scheduled', 'confirmed'])
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération des sessions'
      }
    }
  }

  /**
   * Récupère les sessions par ville
   */
  static async getSessionsByCity(city: string, limit = 10): Promise<APIResponse<FormationSession[]>> {
    try {
      const { data, error } = await supabase
        .from('formation_sessions')
        .select(`
          *,
          formation:formations(*)
        `)
        .eq('city', city)
        .in('status', ['scheduled', 'confirmed'])
        .gte('start_date', new Date().toISOString())
        .gt('available_spots', 0)
        .order('start_date', { ascending: true })
        .limit(limit)

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions par ville:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Récupère une session par ID
   */
  static async getSessionById(id: string): Promise<APIResponse<FormationSession | null>> {
    try {
      const { data, error } = await supabase
        .from('formation_sessions')
        .select(`
          *,
          formation:formations(
            *,
            instructor:instructors(*)
          ),
          registrations_count:registrations(count)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error)
      return {
        data: null,
        success: false,
        message: 'Session non trouvée'
      }
    }
  }

  /**
   * Récupère les prochaines sessions disponibles
   */
  static async getUpcomingSessions(limit = 12): Promise<APIResponse<FormationSession[]>> {
    try {
      const { data, error } = await supabase
        .from('formation_sessions')
        .select(`
          *,
          formation:formations(
            title,
            slug,
            featured_image,
            level,
            duration_days,
            instructor:instructors(name, title)
          )
        `)
        .in('status', ['scheduled', 'confirmed'])
        .gte('start_date', new Date().toISOString())
        .gt('available_spots', 0)
        .order('start_date', { ascending: true })
        .limit(limit)

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des prochaines sessions:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Recherche de sessions avec filtres
   */
  static async searchSessions(params: {
    city?: string
    date_from?: string
    date_to?: string
    formation_id?: string
    available_only?: boolean
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<FormationSession>> {
    try {
      const { 
        city, 
        date_from, 
        date_to, 
        formation_id,
        available_only = true,
        page = 1, 
        limit = 12 
      } = params

      let queryBuilder = supabase
        .from('formation_sessions')
        .select(`
          *,
          formation:formations(*)
        `, { count: 'exact' })
        .in('status', ['scheduled', 'confirmed'])

      // Filtres
      if (city) {
        queryBuilder = queryBuilder.eq('city', city)
      }
      if (formation_id) {
        queryBuilder = queryBuilder.eq('formation_id', formation_id)
      }
      if (date_from) {
        queryBuilder = queryBuilder.gte('start_date', date_from)
      }
      if (date_to) {
        queryBuilder = queryBuilder.lte('start_date', date_to)
      }
      if (available_only) {
        queryBuilder = queryBuilder.gt('available_spots', 0)
      }

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data, error, count } = await queryBuilder
        .order('start_date', { ascending: true })
        .range(from, to)

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
      console.error('Erreur lors de la recherche de sessions:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la recherche'
      }
    }
  }

  // =============================================================================
  // CRÉATION ET MODIFICATION (ADMIN)
  // =============================================================================

  /**
   * Crée une nouvelle session
   */
  static async createSession(sessionData: SessionFormData): Promise<APIResponse<FormationSession>> {
    try {
      const sessionToCreate = {
        ...sessionData,
        available_spots: sessionData.total_spots // Initialement toutes les places disponibles
      }

      const { data, error } = await supabase
        .from('formation_sessions')
        .insert([sessionToCreate])
        .select()
        .single()

      if (error) throw error

      // Mettre à jour le compteur de sessions de la formation
      await this.updateFormationSessionCount(sessionData.formation_id)

      return {
        data,
        success: true,
        message: 'Session créée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création de la session'
      }
    }
  }

  /**
   * Met à jour une session
   */
  static async updateSession(id: string, sessionData: Partial<SessionFormData>): Promise<APIResponse<FormationSession>> {
    try {
      const { data, error } = await supabase
        .from('formation_sessions')
        .update({
          ...sessionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Session mise à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Annule une session
   */
  static async cancelSession(id: string, reason?: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('formation_sessions')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      // TODO: Envoyer notifications aux inscrits
      // TODO: Gérer les remboursements automatiques

      return {
        data: true,
        success: true,
        message: 'Session annulée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la session:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de l\'annulation'
      }
    }
  }

  // =============================================================================
  // GESTION DES PLACES
  // =============================================================================

  /**
   * Réserve des places dans une session
   */
  static async reserveSpots(sessionId: string, quantity: number): Promise<APIResponse<boolean>> {
    try {
      // Utilisation d'une transaction pour éviter les surventes
      const { data: session, error: fetchError } = await supabase
        .from('formation_sessions')
        .select('available_spots')
        .eq('id', sessionId)
        .single()

      if (fetchError) throw fetchError

      if (!session || session.available_spots < quantity) {
        return {
          data: false,
          success: false,
          message: 'Places insuffisantes'
        }
      }

      const { error: updateError } = await supabase
        .from('formation_sessions')
        .update({ 
          available_spots: session.available_spots - quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('available_spots', session.available_spots) // Condition pour éviter race condition

      if (updateError) throw updateError

      return {
        data: true,
        success: true,
        message: 'Places réservées avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la réservation de places:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la réservation'
      }
    }
  }

  /**
   * Libère des places dans une session
   */
  static async releaseSpots(sessionId: string, quantity: number): Promise<APIResponse<boolean>> {
    try {
      const { data: session, error: fetchError } = await supabase
        .from('formation_sessions')
        .select('available_spots, total_spots')
        .eq('id', sessionId)
        .single()

      if (fetchError) throw fetchError

      const newAvailableSpots = Math.min(
        session.available_spots + quantity, 
        session.total_spots
      )

      const { error: updateError } = await supabase
        .from('formation_sessions')
        .update({ 
          available_spots: newAvailableSpots,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (updateError) throw updateError

      return {
        data: true,
        success: true,
        message: 'Places libérées avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la libération de places:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la libération'
      }
    }
  }

  // =============================================================================
  // STATISTIQUES
  // =============================================================================

  /**
   * Récupère les statistiques d'une session
   */
  static async getSessionStats(sessionId: string): Promise<APIResponse<any>> {
    try {
      const { data: registrations } = await supabase
        .from('registrations')
        .select(`
          status,
          attendance_status,
          final_score
        `)
        .eq('session_id', sessionId)

      const { data: session } = await supabase
        .from('formation_sessions')
        .select('total_spots, available_spots')
        .eq('id', sessionId)
        .single()

      const stats = {
        total_registrations: registrations?.length || 0,
        confirmed_registrations: registrations?.filter(r => r.status === 'confirmed').length || 0,
        attended: registrations?.filter(r => r.attendance_status === 'present').length || 0,
        attendance_rate: registrations?.length 
          ? (registrations.filter(r => r.attendance_status === 'present').length / registrations.length) * 100 
          : 0,
        average_score: registrations?.filter(r => r.final_score)
          .reduce((acc, r, _, arr) => acc + (r.final_score || 0) / arr.length, 0) || 0,
        occupancy_rate: session 
          ? ((session.total_spots - session.available_spots) / session.total_spots) * 100 
          : 0
      }

      return {
        data: stats,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        data: null,
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      }
    }
  }

  // =============================================================================
  // UTILITAIRES PRIVÉS
  // =============================================================================

  /**
   * Met à jour le compteur de sessions d'une formation
   */
  private static async updateFormationSessionCount(formationId: string): Promise<void> {
    const { data: sessions } = await supabase
      .from('formation_sessions')
      .select('id', { count: 'exact' })
      .eq('formation_id', formationId)

    await supabase
      .from('formations')
      .update({ total_sessions: sessions?.length || 0 })
      .eq('id', formationId)
  }
}