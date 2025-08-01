// Service Supabase pour le Centre de Ressources - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  Resource, 
  ResourceCategory,
  ResourceDownload,
  ResourceFormData, 
  ResourceFilters, 
  ResourceSearchParams,
  ResourceStats,
  PaginatedResponse,
  APIResponse 
} from './types/resources-types'

export class ResourcesService {
  // =============================================================================
  // CATÉGORIES
  // =============================================================================

  /**
   * Récupère toutes les catégories de ressources
   */
  static async getCategories(): Promise<APIResponse<ResourceCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('resource_categories')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération des catégories'
      }
    }
  }

  /**
   * Crée une nouvelle catégorie
   */
  static async createCategory(name: string, slug: string, description?: string, icon?: string): Promise<APIResponse<ResourceCategory>> {
    try {
      const { data, error } = await supabase
        .from('resource_categories')
        .insert([{ name, slug, description, icon }])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Catégorie créée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création de la catégorie'
      }
    }
  }

  // =============================================================================
  // RESSOURCES
  // =============================================================================

  /**
   * Récupère les ressources avec filtres et pagination
   */
  static async getResources(params: ResourceSearchParams = {}): Promise<PaginatedResponse<Resource>> {
    try {
      const { 
        query = '', 
        filters = {}, 
        sort_by = 'created_at', 
        sort_order = 'desc',
        page = 1, 
        limit = 12 
      } = params

      let queryBuilder = supabase
        .from('resources')
        .select(`
          *,
          category:resource_categories(*)
        `, { count: 'exact' })

      // Recherche textuelle
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      }

      // Filtres
      if (filters.category_id) {
        queryBuilder = queryBuilder.eq('category_id', filters.category_id)
      }
      if (filters.type) {
        queryBuilder = queryBuilder.eq('type', filters.type)
      }
      if (filters.access_level) {
        queryBuilder = queryBuilder.eq('access_level', filters.access_level)
      }
      if (filters.formation_id) {
        queryBuilder = queryBuilder.contains('formation_ids', [filters.formation_id])
      }
      if (filters.is_featured !== undefined) {
        queryBuilder = queryBuilder.eq('is_featured', filters.is_featured)
      }
      if (filters.tags && filters.tags.length > 0) {
        queryBuilder = queryBuilder.overlaps('tags', filters.tags)
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
      console.error('Erreur lors de la récupération des ressources:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération des ressources'
      }
    }
  }

  /**
   * Récupère une ressource par son ID
   */
  static async getResourceById(id: string): Promise<APIResponse<Resource | null>> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          category:resource_categories(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Incrémenter le compteur de vues
      await supabase
        .from('resources')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', id)

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la ressource:', error)
      return {
        data: null,
        success: false,
        message: 'Ressource non trouvée'
      }
    }
  }

  /**
   * Crée une nouvelle ressource
   */
  static async createResource(resourceData: ResourceFormData): Promise<APIResponse<Resource>> {
    try {
      const slug = resourceData.slug || await this.generateUniqueSlug(resourceData.title)

      const { data, error } = await supabase
        .from('resources')
        .insert([{
          ...resourceData,
          slug,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select(`
          *,
          category:resource_categories(*)
        `)
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Ressource créée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de la ressource:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création de la ressource'
      }
    }
  }

  /**
   * Met à jour une ressource
   */
  static async updateResource(id: string, resourceData: Partial<ResourceFormData>): Promise<APIResponse<Resource>> {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update({
          ...resourceData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          category:resource_categories(*)
        `)
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Ressource mise à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la ressource:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Supprime une ressource
   */
  static async deleteResource(id: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Ressource supprimée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la ressource:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la suppression'
      }
    }
  }

  // =============================================================================
  // TÉLÉCHARGEMENTS
  // =============================================================================

  /**
   * Enregistre un téléchargement de ressource
   */
  static async recordDownload(resourceId: string): Promise<APIResponse<ResourceDownload>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Utilisateur non authentifié')

      // Enregistrer le téléchargement
      const { data: download, error: downloadError } = await supabase
        .from('resource_downloads')
        .insert([{
          resource_id: resourceId,
          user_id: user.id,
          ip_address: null, // À implémenter côté serveur
          user_agent: navigator.userAgent
        }])
        .select()
        .single()

      if (downloadError) throw downloadError

      // Incrémenter le compteur
      await supabase
        .from('resources')
        .update({ 
          download_count: supabase.raw('download_count + 1') 
        })
        .eq('id', resourceId)

      return {
        data: download,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du téléchargement:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de l\'enregistrement du téléchargement'
      }
    }
  }

  /**
   * Récupère l'historique des téléchargements d'un utilisateur
   */
  static async getUserDownloads(userId?: string): Promise<APIResponse<ResourceDownload[]>> {
    try {
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) throw new Error('Utilisateur non spécifié')

      const { data, error } = await supabase
        .from('resource_downloads')
        .select(`
          *,
          resource:resources(*)
        `)
        .eq('user_id', currentUserId)
        .order('downloaded_at', { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des téléchargements:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération des téléchargements'
      }
    }
  }

  // =============================================================================
  // STATISTIQUES
  // =============================================================================

  /**
   * Récupère les statistiques d'une ressource
   */
  static async getResourceStats(resourceId: string): Promise<APIResponse<ResourceStats>> {
    try {
      // Récupérer les téléchargements
      const { data: downloads, error: downloadsError } = await supabase
        .from('resource_downloads')
        .select('user_id, downloaded_at')
        .eq('resource_id', resourceId)

      if (downloadsError) throw downloadsError

      // Calculer les statistiques
      const uniqueDownloaders = new Set(downloads?.map(d => d.user_id) || [])
      
      // Téléchargements par jour (30 derniers jours)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const downloadsByDay = downloads?.reduce((acc, download) => {
        const date = new Date(download.downloaded_at).toISOString().split('T')[0]
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      // Récupérer les informations sur les formations liées
      const { data: resource } = await supabase
        .from('resources')
        .select('formation_ids, tags')
        .eq('id', resourceId)
        .single()

      const stats: ResourceStats = {
        total_downloads: downloads?.length || 0,
        unique_downloaders: uniqueDownloaders.size,
        downloads_by_day: Object.entries(downloadsByDay).map(([date, count]) => ({
          date,
          count
        })).sort((a, b) => a.date.localeCompare(b.date)),
        downloads_by_formation: [], // À implémenter si nécessaire
        popular_tags: resource?.tags?.map(tag => ({
          tag,
          count: 1 // À améliorer avec une vraie logique de comptage
        })) || []
      }

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
   * Génère un slug unique pour une ressource
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
        .from('resources')
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
   * Vérifie les permissions d'accès à une ressource
   */
  static async checkResourceAccess(resourceId: string, userId?: string): Promise<boolean> {
    try {
      const { data: resource } = await supabase
        .from('resources')
        .select('access_level')
        .eq('id', resourceId)
        .single()

      if (!resource) return false

      // Ressource publique
      if (resource.access_level === 'public') return true

      // Vérifier l'authentification
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) return false

      // Ressource pour utilisateurs authentifiés
      if (resource.access_level === 'authenticated') return true

      // Vérifier les niveaux d'accès supérieurs
      if (resource.access_level === 'certified' || resource.access_level === 'premium') {
        const { data: client } = await supabase
          .from('clients')
          .select('id, user_tags')
          .eq('user_id', currentUserId)
          .single()

        // Logique à adapter selon votre système de certification/premium
        return !!client
      }

      return false
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error)
      return false
    }
  }
}

// Exports pour la compatibilité
export const getResources = ResourcesService.getResources
export const getResourceById = ResourcesService.getResourceById
export const createResource = ResourcesService.createResource
export const updateResource = ResourcesService.updateResource
export const deleteResource = ResourcesService.deleteResource
export const recordResourceDownload = ResourcesService.recordDownload
export const getResourceCategories = ResourcesService.getCategories