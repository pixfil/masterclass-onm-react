// Service Supabase pour les formations - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  Formation, 
  FormationFormData, 
  FormationFilters, 
  FormationSearchParams,
  PaginatedResponse,
  APIResponse 
} from './formations-types'

export class FormationsService {
  // =============================================================================
  // LECTURE DES FORMATIONS
  // =============================================================================

  /**
   * Récupère toutes les formations actives avec pagination
   */
  static async getFormations(params: FormationSearchParams = {}): Promise<PaginatedResponse<Formation>> {
    try {
      const { 
        query = '', 
        filters = {}, 
        sort_by = 'created_at', 
        page = 1, 
        limit = 12 
      } = params

      let queryBuilder = supabase
        .from('formations')
        .select(`
          *,
          instructor:instructors(*)
        `)
        .eq('status', 'active')

      // Recherche textuelle
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      }

      // Filtres
      if (filters.level) {
        queryBuilder = queryBuilder.eq('level', filters.level)
      }
      if (filters.instructor_id) {
        queryBuilder = queryBuilder.eq('instructor_id', filters.instructor_id)
      }
      if (filters.min_price) {
        queryBuilder = queryBuilder.gte('price', filters.min_price)
      }
      if (filters.max_price) {
        queryBuilder = queryBuilder.lte('price', filters.max_price)
      }

      // Tri
      switch (sort_by) {
        case 'price_asc':
          queryBuilder = queryBuilder.order('price', { ascending: true })
          break
        case 'price_desc':
          queryBuilder = queryBuilder.order('price', { ascending: false })
          break
        case 'rating_desc':
          queryBuilder = queryBuilder.order('average_rating', { ascending: false })
          break
        case 'popularity_desc':
          queryBuilder = queryBuilder.order('total_registrations', { ascending: false })
          break
        default:
          queryBuilder = queryBuilder.order('created_at', { ascending: false })
      }

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data, error, count } = await queryBuilder.range(from, to)

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
      console.error('Erreur lors de la récupération des formations:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération des formations'
      }
    }
  }

  /**
   * Récupère une formation par son slug
   */
  static async getFormationBySlug(slug: string): Promise<APIResponse<Formation | null>> {
    try {
      const { data, error } = await supabase
        .from('formations')
        .select(`
          *,
          instructor:instructors(*),
          sessions:formation_sessions(
            *,
            registrations_count:registrations(count)
          )
        `)
        .eq('slug', slug)
        .eq('status', 'active')
        .single()

      if (error) throw error

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la formation:', error)
      return {
        data: null,
        success: false,
        message: 'Formation non trouvée'
      }
    }
  }

  /**
   * Récupère une formation par ID (admin)
   */
  static async getFormationById(id: string): Promise<APIResponse<Formation | null>> {
    try {
      const { data, error } = await supabase
        .from('formations')
        .select(`
          *,
          instructor:instructors(*),
          sessions:formation_sessions(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la formation:', error)
      return {
        data: null,
        success: false,
        message: 'Formation non trouvée'
      }
    }
  }

  /**
   * Récupère les formations populaires/recommandées
   */
  static async getFeaturedFormations(limit = 6): Promise<APIResponse<Formation[]>> {
    try {
      const { data, error } = await supabase
        .from('formations')
        .select(`
          *,
          instructor:instructors(*)
        `)
        .eq('status', 'active')
        .order('average_rating', { ascending: false })
        .order('total_registrations', { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des formations populaires:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  // =============================================================================
  // CRÉATION ET MODIFICATION (ADMIN)
  // =============================================================================

  /**
   * Crée une nouvelle formation
   */
  static async createFormation(formationData: FormationFormData): Promise<APIResponse<Formation>> {
    try {
      const { data, error } = await supabase
        .from('formations')
        .insert([formationData])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Formation créée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création de la formation'
      }
    }
  }

  /**
   * Met à jour une formation
   */
  static async updateFormation(id: string, formationData: Partial<FormationFormData>): Promise<APIResponse<Formation>> {
    try {
      const { data, error } = await supabase
        .from('formations')
        .update({
          ...formationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Formation mise à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la formation:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Supprime une formation (soft delete)
   */
  static async deleteFormation(id: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('formations')
        .update({ status: 'archived' })
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Formation archivée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la suppression'
      }
    }
  }

  // =============================================================================
  // STATISTIQUES ET ANALYTICS
  // =============================================================================

  /**
   * Récupère les statistiques d'une formation
   */
  static async getFormationStats(formationId: string): Promise<APIResponse<any>> {
    try {
      const { data: sessions } = await supabase
        .from('formation_sessions')
        .select(`
          id,
          start_date,
          city,
          total_spots,
          available_spots,
          registrations:registrations(count)
        `)
        .eq('formation_id', formationId)

      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('formation_id', formationId)

      const { data: orders } = await supabase
        .from('order_items')
        .select(`
          total_price,
          order:orders(status, created_at)
        `)
        .eq('session_id', formationId)

      const stats = {
        total_sessions: sessions?.length || 0,
        total_registrations: sessions?.reduce((acc, session) => acc + (session.registrations?.[0]?.count || 0), 0) || 0,
        average_rating: reviews?.length ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0,
        total_revenue: orders?.reduce((acc, item) => acc + item.total_price, 0) || 0,
        sessions: sessions || []
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
  // UTILITAIRES
  // =============================================================================

  /**
   * Génère un slug unique pour une formation
   */
  static async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1

    while (true) {
      const { data } = await supabase
        .from('formations')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!data) break

      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  /**
   * Vérifie si un slug est disponible
   */
  static async isSlugAvailable(slug: string, currentId?: string): Promise<boolean> {
    let query = supabase
      .from('formations')
      .select('id')
      .eq('slug', slug)

    if (currentId) {
      query = query.neq('id', currentId)
    }

    const { data } = await query.single()
    return !data
  }
}