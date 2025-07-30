// Version temporaire utilisant la table instructors existante
// À remplacer par ceprof-experts.ts une fois la vraie table créée

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
  // Version temporaire utilisant la table instructors
  static async getExperts(params: ExpertSearchParams = {}): Promise<PaginatedResponse<CEPROFExpert>> {
    try {
      const { 
        query = '', 
        page = 1, 
        limit = 20,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params

      // Utilise temporairement la table instructors
      let queryBuilder = supabase
        .from('instructors')
        .select('*', { count: 'exact' })

      // Filtres de recherche basiques
      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      }

      // Tri
      const sortField = sort_by === 'last_name' ? 'name' : 'created_at'
      queryBuilder = queryBuilder.order(sortField, { ascending: sort_order === 'asc' })

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data, error, count } = await queryBuilder.range(from, to)

      if (error) throw error

      // Transformation des données instructors vers format CEPROFExpert
      const transformedData: CEPROFExpert[] = (data || []).map(instructor => ({
        id: instructor.id,
        first_name: instructor.name?.split(' ')[0] || '',
        last_name: instructor.name?.split(' ').slice(1).join(' ') || '',
        email: instructor.email || '',
        phone: '',
        bio: instructor.bio || '',
        profile_photo: instructor.photo || '',
        specialties: instructor.specialties || [],
        years_experience: instructor.experience_years || 0,
        credentials: [],
        practice_location: '',
        website: instructor.website || '',
        linkedin: '',
        is_active: true,
        is_instructor: true,
        is_verified: true,
        joined_date: instructor.created_at || new Date().toISOString(),
        created_at: instructor.created_at || new Date().toISOString(),
        updated_at: instructor.updated_at || new Date().toISOString()
      }))

      return {
        data: transformedData,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit)
        },
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des experts (temp):', error)
      return {
        data: [],
        pagination: { page: 1, limit: params.limit || 20, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération des experts'
      }
    }
  }

  static async getExpertById(id: string): Promise<APIResponse<CEPROFExpert | null>> {
    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (!data) {
        return {
          data: null,
          success: false,
          message: 'Expert non trouvé'
        }
      }

      // Transformation des données
      const expert: CEPROFExpert = {
        id: data.id,
        first_name: data.name?.split(' ')[0] || '',
        last_name: data.name?.split(' ').slice(1).join(' ') || '',
        email: data.email || '',
        phone: '',
        bio: data.bio || '',
        profile_photo: data.photo || '',
        specialties: data.specialties || [],
        years_experience: data.experience_years || 0,
        credentials: [],
        practice_location: '',
        website: data.website || '',
        linkedin: '',
        is_active: true,
        is_instructor: true,
        is_verified: true,
        joined_date: data.created_at || new Date().toISOString(),
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      }

      return {
        data: expert,
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

  static async getExpertsStats(): Promise<APIResponse<CEPROFExpertStats>> {
    try {
      const { data: instructors, error } = await supabase
        .from('instructors')
        .select('*')

      if (error) throw error

      const stats: CEPROFExpertStats = {
        total_experts: instructors?.length || 0,
        active_experts: instructors?.length || 0,
        verified_experts: instructors?.length || 0,
        instructors: instructors?.length || 0,
        total_formations_taught: 0,
        average_experience: instructors?.length ? 
          (instructors.reduce((sum, instructor) => sum + (instructor.experience_years || 0), 0) / instructors.length) : 0
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

  // Méthodes CRUD simplifiées pour la version temporaire
  static async createExpert(expertData: any): Promise<APIResponse<CEPROFExpert>> {
    try {
      const instructorData = {
        name: `${expertData.first_name} ${expertData.last_name}`,
        email: expertData.email,
        bio: expertData.bio,
        photo: expertData.profile_photo,
        specialties: expertData.specialties,
        experience_years: expertData.years_experience,
        website: expertData.website,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('instructors')
        .insert(instructorData)
        .select()
        .single()

      if (error) throw error

      // Transform back to CEPROFExpert format
      const expert: CEPROFExpert = {
        id: data.id,
        first_name: expertData.first_name,
        last_name: expertData.last_name,
        email: data.email,
        phone: expertData.phone || '',
        bio: data.bio || '',
        profile_photo: data.photo || '',
        specialties: data.specialties || [],
        years_experience: data.experience_years || 0,
        credentials: expertData.credentials || [],
        practice_location: expertData.practice_location || '',
        website: data.website || '',
        linkedin: expertData.linkedin || '',
        is_active: expertData.is_active,
        is_instructor: expertData.is_instructor,
        is_verified: expertData.is_verified,
        joined_date: expertData.joined_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      }

      return {
        data: expert,
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

  static async updateExpert(id: string, expertData: any): Promise<APIResponse<CEPROFExpert>> {
    try {
      const instructorData = {
        name: `${expertData.first_name} ${expertData.last_name}`,
        email: expertData.email,
        bio: expertData.bio,
        photo: expertData.profile_photo,
        specialties: expertData.specialties,
        experience_years: expertData.years_experience,
        website: expertData.website,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('instructors')
        .update(instructorData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Transform back to CEPROFExpert format
      const expert: CEPROFExpert = {
        id: data.id,
        first_name: expertData.first_name,
        last_name: expertData.last_name,
        email: data.email,
        phone: expertData.phone || '',
        bio: data.bio || '',
        profile_photo: data.photo || '',
        specialties: data.specialties || [],
        years_experience: data.experience_years || 0,
        credentials: expertData.credentials || [],
        practice_location: expertData.practice_location || '',
        website: data.website || '',
        linkedin: expertData.linkedin || '',
        is_active: expertData.is_active,
        is_instructor: expertData.is_instructor,
        is_verified: expertData.is_verified,
        joined_date: expertData.joined_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      }

      return {
        data: expert,
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

  static async deleteExpert(id: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('instructors')
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
        'Spécialités',
        'Années d\'expérience',
        'Site web'
      ]

      const csvContent = [
        headers.join(','),
        ...result.data.map(expert => [
          expert.first_name,
          expert.last_name,
          expert.email,
          expert.specialties.join(' | '),
          expert.years_experience.toString(),
          expert.website || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n')

      return csvContent
    } catch (error) {
      console.error('Erreur lors de l\'export:', error)
      return ''
    }
  }
}