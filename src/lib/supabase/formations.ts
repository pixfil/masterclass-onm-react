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
          instructor:instructors(*),
          sessions:formation_sessions(*)
        `, { count: 'exact' })
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
          sessions:formation_sessions(*),
          program
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
      // Mapper les champs du formulaire vers les champs de la base de données
      const dataToInsert: any = {
        title: formationData.title,
        slug: formationData.slug,
        description: formationData.description,
        short_description: formationData.short_description,
        price: formationData.price,
        duration_days: formationData.duration_days,
        start_date: formationData.start_date,
        end_date: formationData.end_date,
        // Mapper les niveaux anglais vers français pour la base de données
        level: formationData.difficulty_level === 'beginner' ? 'debutant' :
               formationData.difficulty_level === 'intermediate' ? 'intermediaire' :
               formationData.difficulty_level === 'advanced' ? 'avance' :
               formationData.difficulty_level === 'expert' ? 'expert' :
               formationData.difficulty_level,
        instructor_id: formationData.instructor_id,
        featured_image: formationData.featured_image,
        gallery_images: formationData.gallery_images,
        // Mapper le status 'published' vers 'active' pour la base de données
        status: formationData.status === 'published' ? 'active' : 
                formationData.status === 'archived' ? 'inactive' :
                formationData.status,
        capacity: formationData.max_participants,
        max_participants: formationData.max_participants,
        // Prerequisites peut être un string ou un array
        prerequisites: typeof formationData.prerequisites === 'string' 
          ? formationData.prerequisites.split('\n').filter(p => p.trim()) 
          : (formationData.prerequisites || []),
        program: formationData.program,
        // Mapper les autres champs
        video_url: formationData.video_url,
        custom_instructor_name: formationData.custom_instructor_name,
        custom_instructor_bio: formationData.custom_instructor_bio,
        duration_hours: formationData.duration_hours,
        language: formationData.language,
        format: formationData.format,
        city: formationData.city,
        venue: formationData.venue,
        platform_tools: formationData.platform_tools,
        early_bird_price: formationData.early_bird_price,
        early_bird_deadline: formationData.early_bird_deadline,
        group_discount_enabled: formationData.group_discount_enabled,
        group_discount_min: formationData.group_discount_min,
        group_discount_percent: formationData.group_discount_percent,
        seo_title: formationData.seo_title,
        meta_description: formationData.meta_description,
        seo_keywords: formationData.keywords,
        tags: formationData.tags,
        whats_included: formationData.whats_included,
        learning_objectives: formationData.learning_objectives,
        featured: formationData.featured,
        requires_approval: formationData.requires_approval,
        certificate_included: formationData.certificate_included,
        cpd_points: formationData.cpd_points,
        refund_policy: formationData.refund_policy,
        // target_audience doit être un jsonb array, pas un string
        target_audience: formationData.target_audience ? 
          (typeof formationData.target_audience === 'string' ? 
            formationData.target_audience.split('\n').filter(t => t.trim()) : 
            formationData.target_audience) : 
          [],
        testimonials: formationData.testimonials,
        faq: formationData.faq
      }

      // Retirer les valeurs undefined et corriger les arrays vides
      Object.keys(dataToInsert).forEach(key => {
        if (dataToInsert[key] === undefined) {
          delete dataToInsert[key]
        }
        
        // Supprimer les chaînes vides pour les champs date/timestamp
        if ((key === 'early_bird_deadline' || key === 'start_date' || key === 'end_date') && 
            dataToInsert[key] === '') {
          delete dataToInsert[key]
        }
        
        // Supprimer les chaînes vides pour les champs UUID
        if ((key === 'instructor_id') && dataToInsert[key] === '') {
          delete dataToInsert[key]
        }
        
        // Supprimer les chaînes vides pour les champs texte optionnels
        if (['featured_image', 'video_url', 'custom_instructor_name', 'custom_instructor_bio', 
             'city', 'venue', 'platform_tools', 'seo_title', 'meta_description', 
             'refund_policy', 'testimonials', 'faq'].includes(key) && dataToInsert[key] === '') {
          delete dataToInsert[key]
        }
        
        // Corriger les arrays vides ou null
        if (Array.isArray(dataToInsert[key]) && dataToInsert[key].length === 0) {
          dataToInsert[key] = []
        }
        
        // S'assurer que les champs array ne sont jamais null
        if ((key === 'gallery_images' || key === 'seo_keywords' || key === 'tags' || 
             key === 'whats_included' || key === 'learning_objectives' || key === 'prerequisites') && 
            (dataToInsert[key] === null || dataToInsert[key] === undefined)) {
          dataToInsert[key] = []
        }
      })

      console.log('Données finales à insérer:', JSON.stringify(dataToInsert, null, 2))

      const { data, error } = await supabase
        .from('formations')
        .insert([dataToInsert])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Formation créée avec succès'
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de la formation:', error)
      console.error('Message d\'erreur:', error?.message)
      console.error('Détails:', error?.details)
      return {
        data: null as any,
        success: false,
        message: error?.message || 'Erreur lors de la création de la formation'
      }
    }
  }

  /**
   * Met à jour une formation
   */
  static async updateFormation(id: string, formationData: Partial<FormationFormData>): Promise<APIResponse<Formation>> {
    try {
      // Mapper les champs du formulaire vers les champs de la base de données
      const dataToUpdate: any = {
        title: formationData.title,
        slug: formationData.slug,
        description: formationData.description,
        short_description: formationData.short_description,
        price: formationData.price,
        duration_days: formationData.duration_days,
        start_date: formationData.start_date,
        end_date: formationData.end_date,
        // Mapper les niveaux anglais vers français pour la base de données
        level: formationData.difficulty_level === 'beginner' ? 'debutant' :
               formationData.difficulty_level === 'intermediate' ? 'intermediaire' :
               formationData.difficulty_level === 'advanced' ? 'avance' :
               formationData.difficulty_level === 'expert' ? 'expert' :
               formationData.difficulty_level,
        instructor_id: formationData.instructor_id,
        featured_image: formationData.featured_image,
        gallery_images: formationData.gallery_images,
        // Mapper le status 'published' vers 'active' pour la base de données
        status: formationData.status === 'published' ? 'active' : 
                formationData.status === 'archived' ? 'inactive' :
                formationData.status,
        capacity: formationData.max_participants,
        max_participants: formationData.max_participants,
        // Prerequisites peut être un string ou un array
        prerequisites: typeof formationData.prerequisites === 'string' 
          ? formationData.prerequisites.split('\n').filter(p => p.trim()) 
          : (formationData.prerequisites || []),
        program: formationData.program,
        // Mapper les autres champs
        video_url: formationData.video_url,
        custom_instructor_name: formationData.custom_instructor_name,
        custom_instructor_bio: formationData.custom_instructor_bio,
        duration_hours: formationData.duration_hours,
        language: formationData.language,
        format: formationData.format,
        city: formationData.city,
        venue: formationData.venue,
        platform_tools: formationData.platform_tools,
        early_bird_price: formationData.early_bird_price,
        early_bird_deadline: formationData.early_bird_deadline,
        group_discount_enabled: formationData.group_discount_enabled,
        group_discount_min: formationData.group_discount_min,
        group_discount_percent: formationData.group_discount_percent,
        seo_title: formationData.seo_title,
        meta_description: formationData.meta_description,
        seo_keywords: formationData.keywords,
        tags: formationData.tags,
        whats_included: formationData.whats_included,
        learning_objectives: formationData.learning_objectives,
        featured: formationData.featured,
        requires_approval: formationData.requires_approval,
        certificate_included: formationData.certificate_included,
        cpd_points: formationData.cpd_points,
        refund_policy: formationData.refund_policy,
        // target_audience doit être un jsonb array, pas un string
        target_audience: formationData.target_audience ? 
          (typeof formationData.target_audience === 'string' ? 
            formationData.target_audience.split('\n').filter(t => t.trim()) : 
            formationData.target_audience) : 
          [],
        testimonials: formationData.testimonials,
        faq: formationData.faq
      }

      // Retirer les valeurs undefined et corriger les arrays vides
      Object.keys(dataToUpdate).forEach(key => {
        if (dataToUpdate[key] === undefined) {
          delete dataToUpdate[key]
        }
        
        // Supprimer les chaînes vides pour les champs date/timestamp
        if ((key === 'early_bird_deadline' || key === 'start_date' || key === 'end_date') && 
            dataToUpdate[key] === '') {
          delete dataToUpdate[key]
        }
        
        // Supprimer les chaînes vides pour les champs UUID
        if ((key === 'instructor_id') && dataToUpdate[key] === '') {
          delete dataToUpdate[key]
        }
        
        // Supprimer les chaînes vides pour les champs texte optionnels
        if (['featured_image', 'video_url', 'custom_instructor_name', 'custom_instructor_bio', 
             'city', 'venue', 'platform_tools', 'seo_title', 'meta_description', 
             'refund_policy', 'testimonials', 'faq'].includes(key) && dataToUpdate[key] === '') {
          delete dataToUpdate[key]
        }
        
        // Corriger les arrays vides ou null
        if (Array.isArray(dataToUpdate[key]) && dataToUpdate[key].length === 0) {
          dataToUpdate[key] = []
        }
        
        // S'assurer que les champs array ne sont jamais null
        if ((key === 'gallery_images' || key === 'seo_keywords' || key === 'tags' || 
             key === 'whats_included' || key === 'learning_objectives' || key === 'prerequisites') && 
            (dataToUpdate[key] === null || dataToUpdate[key] === undefined)) {
          dataToUpdate[key] = []
        }
      })

      console.log('Mise à jour de la formation avec ID:', id)
      console.log('Données à mettre à jour:', dataToUpdate)

      // D'abord vérifier que la formation existe
      const { data: existingFormation } = await supabase
        .from('formations')
        .select('id')
        .eq('id', id)
        .single()

      if (!existingFormation) {
        throw new Error(`Formation avec ID ${id} non trouvée`)
      }

      const { data, error } = await supabase
        .from('formations')
        .update({
          ...dataToUpdate,
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
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la formation:', error)
      console.error('Message d\'erreur:', error?.message)
      console.error('Détails:', error?.details)
      return {
        data: null as any,
        success: false,
        message: error?.message || 'Erreur lors de la mise à jour'
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

// Exports pour la compatibilité avec l'ancien système
export const getAllFormations = FormationsService.getFormations
export const getFormationById = FormationsService.getFormationById
export const updateFormation = FormationsService.updateFormation
export const createFormation = FormationsService.createFormation
export const getCategories = async () => {
  // Retourne des catégories par défaut pour les formations
  return [
    { id: '1', name: 'Module 1 - Fondamentaux', slug: 'module-1' },
    { id: '2', name: 'Module 2 - Perfectionnement', slug: 'module-2' },
    { id: '3', name: 'Module 3 - Expert', slug: 'module-3' },
    { id: '4', name: 'Webinaires', slug: 'webinaires' },
    { id: '5', name: 'Formations spéciales', slug: 'formations-speciales' }
  ]
}