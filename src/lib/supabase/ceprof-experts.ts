// Service Supabase pour les experts CEPROF - Masterclass ONM
import { supabase } from '../supabaseClient'

export interface CEPROFExpert {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  bio?: string
  profile_photo?: string
  specialties: string[]
  years_experience: number
  credentials: string[]
  practice_location?: string
  website?: string
  linkedin?: string
  is_active: boolean
  is_instructor: boolean
  is_verified: boolean
  joined_date: string
  created_at: string
  updated_at: string
}

export interface CEPROFExpertStats {
  total_experts: number
  active_experts: number
  verified_experts: number
  instructors: number
  total_formations_taught: number
  average_experience: number
}

export interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface ExpertSearchParams {
  query?: string
  specialty?: string
  is_active?: boolean
  is_instructor?: boolean
  is_verified?: boolean
  page?: number
  limit?: number
  sort_by?: 'created_at' | 'last_name' | 'years_experience'
  sort_order?: 'asc' | 'desc'
}

export class CEPROFExpertsService {
  // =============================================================================
  // LECTURE DES EXPERTS
  // =============================================================================

  /**
   * Récupère tous les experts CEPROF avec pagination et filtres
   */
  static async getExperts(params: ExpertSearchParams = {}): Promise<PaginatedResponse<CEPROFExpert>> {
    try {
      const { 
        query = '', 
        specialty,
        is_active,
        is_instructor,
        is_verified,
        page = 1, 
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params

      let queryBuilder = supabase
        .from('ceprof_experts')
        .select('*', { count: 'exact' })

      // Filtres de recherche
      if (query) {
        queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      }

      if (specialty) {
        queryBuilder = queryBuilder.contains('specialties', [specialty])
      }

      if (is_active !== undefined) {
        queryBuilder = queryBuilder.eq('is_active', is_active)
      }

      if (is_instructor !== undefined) {
        queryBuilder = queryBuilder.eq('is_instructor', is_instructor)
      }

      if (is_verified !== undefined) {
        queryBuilder = queryBuilder.eq('is_verified', is_verified)
      }

      // Tri
      queryBuilder = queryBuilder.order(sort_by, { ascending: sort_order === 'asc' })

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
      console.error('Erreur lors de la récupération des experts:', error)
      return {
        data: [],
        pagination: { page: 1, limit: params.limit || 20, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération des experts'
      }
    }
  }

  /**
   * Récupère un expert par ID
   */
  static async getExpertById(id: string): Promise<APIResponse<CEPROFExpert | null>> {
    try {
      const { data, error } = await supabase
        .from('ceprof_experts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'expert:', error)
      return {
        data: null,
        success: false,
        message: 'Expert non trouvé'
      }
    }
  }

  /**
   * Récupère les statistiques des experts
   */
  static async getExpertsStats(): Promise<APIResponse<CEPROFExpertStats>> {
    try {
      const { data: experts, error } = await supabase
        .from('ceprof_experts')
        .select('is_active, is_verified, is_instructor, years_experience')

      if (error) throw error

      const stats: CEPROFExpertStats = {
        total_experts: experts?.length || 0,
        active_experts: experts?.filter(e => e.is_active).length || 0,
        verified_experts: experts?.filter(e => e.is_verified).length || 0,
        instructors: experts?.filter(e => e.is_instructor).length || 0,
        total_formations_taught: 0, // TODO: Calculate from formations table
        average_experience: experts?.length ? 
          (experts.reduce((sum, expert) => sum + expert.years_experience, 0) / experts.length) : 0
      }

      return {
        data: stats,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        data: {
          total_experts: 0,
          active_experts: 0,
          verified_experts: 0,
          instructors: 0,
          total_formations_taught: 0,
          average_experience: 0
        },
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      }
    }
  }

  // =============================================================================
  // GESTION DES EXPERTS
  // =============================================================================

  /**
   * Crée un nouvel expert CEPROF
   */
  static async createExpert(expertData: Omit<CEPROFExpert, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<CEPROFExpert>> {
    try {
      const { data, error } = await supabase
        .from('ceprof_experts')
        .insert({
          ...expertData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Expert créé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'expert:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création'
      }
    }
  }

  /**
   * Met à jour un expert CEPROF
   */
  static async updateExpert(
    id: string, 
    expertData: Partial<Omit<CEPROFExpert, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<APIResponse<CEPROFExpert>> {
    try {
      const { data, error } = await supabase
        .from('ceprof_experts')
        .update({
          ...expertData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Expert mis à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'expert:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Supprime un expert CEPROF
   */
  static async deleteExpert(id: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('ceprof_experts')
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Expert supprimé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'expert:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la suppression'
      }
    }
  }

  /**
   * Exporte les experts au format CSV
   */
  static async exportExperts(params: ExpertSearchParams = {}): Promise<string> {
    try {
      const result = await this.getExperts({ ...params, limit: 10000 })
      
      if (!result.success || !result.data.length) {
        return ''
      }

      const headers = [
        'Prénom',
        'Nom',
        'Email',
        'Téléphone',
        'Spécialités',
        'Années d\'expérience',
        'Diplômes',
        'Localisation',
        'Instructeur',
        'Vérifié',
        'Actif',
        'Date d\'inscription'
      ]

      const csvContent = [
        headers.join(','),
        ...result.data.map(expert => [
          expert.first_name,
          expert.last_name,
          expert.email,
          expert.phone || '',
          expert.specialties.join(' | '),
          expert.years_experience.toString(),
          expert.credentials.join(' | '),
          expert.practice_location || '',
          expert.is_instructor ? 'Oui' : 'Non',
          expert.is_verified ? 'Oui' : 'Non',
          expert.is_active ? 'Oui' : 'Non',
          new Date(expert.joined_date).toLocaleDateString('fr-FR')
        ].map(field => `"${field}"`).join(','))
      ].join('\n')

      return csvContent
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      return ''
    }
  }
}