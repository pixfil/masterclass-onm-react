// Service Supabase pour les Podcasts & Interviews - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  PodcastEpisode,
  PodcastFilters,
  PodcastSearchParams,
  PodcastFormData,
  PodcastEngagement,
  PodcastStats,
  PaginatedResponse,
  APIResponse 
} from './types/podcast-types'

export class PodcastsService {
  // =============================================================================
  // LECTURE DES PODCASTS
  // =============================================================================

  /**
   * Récupère les épisodes avec filtres et pagination
   */
  static async getEpisodes(params: PodcastSearchParams = {}): Promise<PaginatedResponse<PodcastEpisode>> {
    try {
      const { 
        query = '', 
        filters = {}, 
        sort_by = 'published_at', 
        sort_order = 'desc',
        page = 1, 
        limit = 12 
      } = params

      let queryBuilder = supabase
        .from('podcast_episodes')
        .select(`
          *,
          ceprof_expert:ceprof_experts(id, name, title, photo_url)
        `, { count: 'exact' })
        .eq('status', 'published')

      // Recherche textuelle
      if (query) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,guest_name.ilike.%${query}%`
        )
      }

      // Filtres
      if (filters.type) {
        queryBuilder = queryBuilder.eq('type', filters.type)
      }
      if (filters.season) {
        queryBuilder = queryBuilder.eq('season', filters.season)
      }
      if (filters.ceprof_expert_id) {
        queryBuilder = queryBuilder.eq('ceprof_expert_id', filters.ceprof_expert_id)
      }
      if (filters.is_featured !== undefined) {
        queryBuilder = queryBuilder.eq('is_featured', filters.is_featured)
      }
      if (filters.tags && filters.tags.length > 0) {
        queryBuilder = queryBuilder.overlaps('tags', filters.tags)
      }
      if (filters.topics && filters.topics.length > 0) {
        queryBuilder = queryBuilder.overlaps('topics', filters.topics)
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
      console.error('Erreur lors de la récupération des épisodes:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération des épisodes'
      }
    }
  }

  /**
   * Récupère un épisode par son slug
   */
  static async getEpisodeBySlug(slug: string): Promise<APIResponse<PodcastEpisode | null>> {
    try {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select(`
          *,
          ceprof_expert:ceprof_experts(*)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) throw error

      // Incrémenter le compteur de vues
      await supabase
        .from('podcast_episodes')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'épisode:', error)
      return {
        data: null,
        success: false,
        message: 'Épisode non trouvé'
      }
    }
  }

  /**
   * Récupère les épisodes populaires/en vedette
   */
  static async getFeaturedEpisodes(limit = 6): Promise<APIResponse<PodcastEpisode[]>> {
    try {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select(`
          *,
          ceprof_expert:ceprof_experts(id, name, title, photo_url)
        `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des épisodes en vedette:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Récupère les derniers épisodes
   */
  static async getLatestEpisodes(limit = 10): Promise<APIResponse<PodcastEpisode[]>> {
    try {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select(`
          *,
          ceprof_expert:ceprof_experts(id, name, title, photo_url)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des derniers épisodes:', error)
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
   * Crée un nouvel épisode
   */
  static async createEpisode(episodeData: PodcastFormData): Promise<APIResponse<PodcastEpisode>> {
    try {
      const slug = episodeData.slug || await this.generateUniqueSlug(episodeData.title)

      const { data, error } = await supabase
        .from('podcast_episodes')
        .insert([{
          ...episodeData,
          slug,
          tags: episodeData.tags || [],
          topics: episodeData.topics || [],
          created_at: new Date().toISOString()
        }])
        .select(`
          *,
          ceprof_expert:ceprof_experts(*)
        `)
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Épisode créé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'épisode:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création de l\'épisode'
      }
    }
  }

  /**
   * Met à jour un épisode
   */
  static async updateEpisode(id: string, episodeData: Partial<PodcastFormData>): Promise<APIResponse<PodcastEpisode>> {
    try {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .update({
          ...episodeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          ceprof_expert:ceprof_experts(*)
        `)
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Épisode mis à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'épisode:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Archive un épisode
   */
  static async archiveEpisode(id: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('podcast_episodes')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Épisode archivé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de l\'archivage de l\'épisode:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de l\'archivage'
      }
    }
  }

  // =============================================================================
  // ENGAGEMENT UTILISATEUR
  // =============================================================================

  /**
   * Enregistre l'engagement d'un utilisateur avec un épisode
   */
  static async updateEngagement(
    episodeId: string, 
    engagement: Partial<PodcastEngagement>
  ): Promise<APIResponse<PodcastEngagement>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Utilisateur non authentifié')

      // Vérifier si un engagement existe déjà
      const { data: existing } = await supabase
        .from('podcast_engagement')
        .select('*')
        .eq('episode_id', episodeId)
        .eq('user_id', user.id)
        .single()

      let result
      if (existing) {
        // Mettre à jour l'engagement existant
        const { data, error } = await supabase
          .from('podcast_engagement')
          .update({
            ...engagement,
            updated_at: new Date().toISOString()
          })
          .eq('episode_id', episodeId)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Créer un nouvel engagement
        const { data, error } = await supabase
          .from('podcast_engagement')
          .insert([{
            episode_id: episodeId,
            user_id: user.id,
            ...engagement,
            created_at: new Date().toISOString()
          }])
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Mettre à jour les compteurs si nécessaire
      if (engagement.has_liked !== undefined) {
        await this.updateLikeCount(episodeId, engagement.has_liked)
      }
      if (engagement.has_shared !== undefined) {
        await this.updateShareCount(episodeId, engagement.has_shared)
      }

      return {
        data: result,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'engagement:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Met à jour le compteur de likes
   */
  private static async updateLikeCount(episodeId: string, isLiked: boolean): Promise<void> {
    const increment = isLiked ? 1 : -1
    await supabase.rpc('increment_podcast_likes', { 
      episode_id: episodeId, 
      increment_value: increment 
    })
  }

  /**
   * Met à jour le compteur de partages
   */
  private static async updateShareCount(episodeId: string, isShared: boolean): Promise<void> {
    if (isShared) {
      await supabase.rpc('increment_podcast_shares', { 
        episode_id: episodeId, 
        increment_value: 1 
      })
    }
  }

  // =============================================================================
  // STATISTIQUES
  // =============================================================================

  /**
   * Récupère les statistiques globales des podcasts
   */
  static async getPodcastStats(): Promise<APIResponse<PodcastStats>> {
    try {
      const { data: episodes, error: episodesError } = await supabase
        .from('podcast_episodes')
        .select('type, duration, view_count, like_count, share_count, topics, status')
        .eq('status', 'published')

      if (episodesError) throw episodesError

      // Calculer les statistiques
      const stats: PodcastStats = {
        total_episodes: episodes?.length || 0,
        total_duration: episodes?.reduce((acc, ep) => acc + (ep.duration || 0), 0) || 0,
        total_views: episodes?.reduce((acc, ep) => acc + (ep.view_count || 0), 0) || 0,
        total_likes: episodes?.reduce((acc, ep) => acc + (ep.like_count || 0), 0) || 0,
        total_shares: episodes?.reduce((acc, ep) => acc + (ep.share_count || 0), 0) || 0,
        average_completion_rate: 0, // À calculer avec les données d'engagement
        popular_topics: [],
        engagement_by_type: {
          podcast: 0,
          interview: 0,
          webinar: 0
        },
        top_episodes: []
      }

      // Engagement par type
      episodes?.forEach(ep => {
        if (ep.type && stats.engagement_by_type[ep.type] !== undefined) {
          stats.engagement_by_type[ep.type] += ep.view_count || 0
        }
      })

      // Topics populaires
      const topicCounts: Record<string, number> = {}
      episodes?.forEach(ep => {
        ep.topics?.forEach(topic => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1
        })
      })
      stats.popular_topics = Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count }))

      // Top épisodes
      const topEpisodes = episodes
        ?.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 10)
        .map(ep => ({
          id: ep.id,
          title: ep.title,
          view_count: ep.view_count || 0,
          like_count: ep.like_count || 0
        }))

      stats.top_episodes = topEpisodes || []

      return {
        data: stats,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      }
    }
  }

  // =============================================================================
  // UTILITAIRES
  // =============================================================================

  /**
   * Génère un slug unique pour un épisode
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
        .from('podcast_episodes')
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
   * Récupère les saisons disponibles
   */
  static async getSeasons(): Promise<APIResponse<number[]>> {
    try {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select('season')
        .eq('status', 'published')
        .order('season', { ascending: false })

      if (error) throw error

      const uniqueSeasons = [...new Set(data?.map(ep => ep.season).filter(Boolean))]
      
      return {
        data: uniqueSeasons as number[],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des saisons:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération des saisons'
      }
    }
  }

  /**
   * Récupère tous les topics utilisés
   */
  static async getAllTopics(): Promise<APIResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select('topics')
        .eq('status', 'published')

      if (error) throw error

      const allTopics = new Set<string>()
      data?.forEach(ep => {
        ep.topics?.forEach(topic => allTopics.add(topic))
      })

      return {
        data: Array.from(allTopics).sort(),
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des topics:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération des topics'
      }
    }
  }
}

// Exports pour la compatibilité
export const getPodcastEpisodes = PodcastsService.getEpisodes
export const getPodcastBySlug = PodcastsService.getEpisodeBySlug
export const createPodcastEpisode = PodcastsService.createEpisode
export const updatePodcastEpisode = PodcastsService.updateEpisode
export const getFeaturedPodcasts = PodcastsService.getFeaturedEpisodes
export const getLatestPodcasts = PodcastsService.getLatestEpisodes