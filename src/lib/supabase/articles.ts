// Service Supabase pour les Articles et Cas Cliniques - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  Article,
  ArticleCategory,
  ArticleFilters,
  ArticleSearchParams,
  PaginatedResponse,
  APIResponse 
} from './types/article-types'

export class ArticlesService {
  // =============================================================================
  // LECTURE DES ARTICLES
  // =============================================================================

  /**
   * Récupère les articles avec filtres et pagination
   */
  static async getArticles(params: ArticleSearchParams = {}): Promise<PaginatedResponse<Article>> {
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
        .from('articles')
        .select(`
          *,
          author:profiles(*),
          ceprof_expert:ceprof_experts(*),
          category:article_categories(*)
        `, { count: 'exact' })
        .eq('status', 'published')

      // Recherche textuelle
      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
      }

      // Filtres
      if (filters.category_id) {
        queryBuilder = queryBuilder.eq('category_id', filters.category_id)
      }
      if (filters.type) {
        queryBuilder = queryBuilder.eq('type', filters.type)
      }
      if (filters.author_id) {
        queryBuilder = queryBuilder.eq('author_id', filters.author_id)
      }
      if (filters.ceprof_expert_id) {
        queryBuilder = queryBuilder.eq('ceprof_expert_id', filters.ceprof_expert_id)
      }
      if (filters.tags && filters.tags.length > 0) {
        queryBuilder = queryBuilder.contains('tags', filters.tags)
      }
      if (filters.is_featured !== undefined) {
        queryBuilder = queryBuilder.eq('is_featured', filters.is_featured)
      }
      if (filters.published_from) {
        queryBuilder = queryBuilder.gte('published_at', filters.published_from)
      }
      if (filters.published_to) {
        queryBuilder = queryBuilder.lte('published_at', filters.published_to)
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
      console.error('Erreur lors de la récupération des articles:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Récupère un article par son slug
   */
  static async getArticleBySlug(slug: string): Promise<APIResponse<Article | null>> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(*),
          ceprof_expert:ceprof_experts(*),
          category:article_categories(*)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      if (error) throw error

      // Incrémenter le compteur de vues
      await supabase
        .from('articles')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article:', error)
      return {
        data: null,
        success: false,
        message: 'Article non trouvé'
      }
    }
  }

  /**
   * Récupère les articles en vedette
   */
  static async getFeaturedArticles(limit = 6): Promise<APIResponse<Article[]>> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          author:profiles(*),
          category:article_categories(*)
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
      console.error('Erreur lors de la récupération des articles en vedette:', error)
      return {
        data: [],
        success: false
      }
    }
  }

  /**
   * Récupère les articles similaires
   */
  static async getRelatedArticles(articleId: string, limit = 4): Promise<APIResponse<Article[]>> {
    try {
      // Récupérer l'article actuel
      const { data: currentArticle } = await supabase
        .from('articles')
        .select('category_id, tags')
        .eq('id', articleId)
        .single()

      if (!currentArticle) {
        return { data: [], success: false }
      }

      // Rechercher des articles similaires
      let query = supabase
        .from('articles')
        .select(`
          *,
          author:profiles(*),
          category:article_categories(*)
        `)
        .eq('status', 'published')
        .neq('id', articleId)
        .limit(limit)

      // Priorité : même catégorie
      if (currentArticle.category_id) {
        query = query.eq('category_id', currentArticle.category_id)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des articles similaires:', error)
      return {
        data: [],
        success: false
      }
    }
  }

  // =============================================================================
  // CATÉGORIES
  // =============================================================================

  /**
   * Récupère toutes les catégories d'articles
   */
  static async getCategories(): Promise<APIResponse<ArticleCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('article_categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error)
      return {
        data: [],
        success: false
      }
    }
  }

  // =============================================================================
  // ENGAGEMENT
  // =============================================================================

  /**
   * Ajoute ou retire un like
   */
  static async toggleLike(articleId: string): Promise<APIResponse<boolean>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: false, success: false, message: 'Utilisateur non connecté' }
      }

      // Vérifier si l'utilisateur a déjà liké
      const { data: existing } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Retirer le like
        await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id)

        // Décrémenter le compteur
        await supabase.rpc('decrement_article_likes', { article_id: articleId })
      } else {
        // Ajouter le like
        await supabase
          .from('article_likes')
          .insert([{ article_id: articleId, user_id: user.id }])

        // Incrémenter le compteur
        await supabase.rpc('increment_article_likes', { article_id: articleId })
      }

      return {
        data: !existing,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du toggle like:', error)
      return {
        data: false,
        success: false
      }
    }
  }

  /**
   * Vérifie si l'utilisateur a liké un article
   */
  static async hasLiked(articleId: string): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) return false

      const { data } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_id', user.id)
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }

  /**
   * Ajoute un commentaire
   */
  static async addComment(articleId: string, content: string): Promise<APIResponse<boolean>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: false, success: false, message: 'Utilisateur non connecté' }
      }

      const { error } = await supabase
        .from('article_comments')
        .insert([{
          article_id: articleId,
          user_id: user.id,
          content,
          status: 'pending' // Modération
        }])

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Commentaire ajouté, en attente de modération'
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de l\'ajout'
      }
    }
  }

  // =============================================================================
  // RECHERCHE ET TAGS
  // =============================================================================

  /**
   * Récupère les tags populaires
   */
  static async getPopularTags(limit = 20): Promise<APIResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('tags')
        .eq('status', 'published')

      if (error) throw error

      // Compter les occurrences de chaque tag
      const tagCounts: { [tag: string]: number } = {}
      data?.forEach(article => {
        article.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      // Trier par popularité
      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag]) => tag)

      return {
        data: sortedTags,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des tags:', error)
      return {
        data: [],
        success: false
      }
    }
  }

  // =============================================================================
  // CRÉATION ET MODIFICATION (ADMIN)
  // =============================================================================

  /**
   * Crée un nouvel article
   */
  static async createArticle(articleData: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count'>): Promise<APIResponse<Article>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: null as any, success: false }
      }

      const { data, error } = await supabase
        .from('articles')
        .insert([{
          ...articleData,
          author_id: user.id,
          slug: await this.generateUniqueSlug(articleData.title)
        }])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Article créé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'article:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création'
      }
    }
  }

  /**
   * Met à jour un article
   */
  static async updateArticle(id: string, articleData: Partial<Article>): Promise<APIResponse<Article>> {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update({
          ...articleData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Article mis à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Supprime un article
   */
  static async deleteArticle(id: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Article supprimé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la suppression'
      }
    }
  }

  // =============================================================================
  // UTILITAIRES
  // =============================================================================

  /**
   * Génère un slug unique pour un article
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
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!data) break

      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }
}

// Exports pour la compatibilité
export const getArticles = ArticlesService.getArticles
export const getArticleBySlug = ArticlesService.getArticleBySlug
export const getFeaturedArticles = ArticlesService.getFeaturedArticles
export const getRelatedArticles = ArticlesService.getRelatedArticles
export const getArticleCategories = ArticlesService.getCategories
export const toggleArticleLike = ArticlesService.toggleLike