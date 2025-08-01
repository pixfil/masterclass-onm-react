// Service Supabase pour le Lexique ONM - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  LexiconEntry,
  LexiconFilters,
  LexiconSearchParams,
  PaginatedResponse,
  APIResponse 
} from './types/badge-types'

export class LexiconService {
  // =============================================================================
  // LECTURE DES ENTRÉES
  // =============================================================================

  /**
   * Récupère les entrées du lexique avec filtres et pagination
   */
  static async getEntries(params: LexiconSearchParams = {}): Promise<PaginatedResponse<LexiconEntry>> {
    try {
      const { 
        query = '', 
        filters = {}, 
        sort_by = 'term', 
        sort_order = 'asc',
        page = 1, 
        limit = 20 
      } = params

      let queryBuilder = supabase
        .from('lexicon_entries')
        .select('*', { count: 'exact' })

      // Recherche textuelle
      if (query) {
        queryBuilder = queryBuilder.or(`term.ilike.%${query}%,definition.ilike.%${query}%`)
      }

      // Filtres
      if (filters.category) {
        queryBuilder = queryBuilder.eq('category', filters.category)
      }
      if (filters.starts_with) {
        queryBuilder = queryBuilder.ilike('term', `${filters.starts_with}%`)
      }
      if (filters.related_formation) {
        queryBuilder = queryBuilder.contains('related_formations', [filters.related_formation])
      }
      if (filters.is_featured !== undefined) {
        queryBuilder = queryBuilder.eq('is_featured', filters.is_featured)
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
      console.error('Erreur lors de la récupération des entrées:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Récupère une entrée par son slug
   */
  static async getEntryBySlug(slug: string): Promise<APIResponse<LexiconEntry | null>> {
    try {
      const { data, error } = await supabase
        .from('lexicon_entries')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error

      // Incrémenter le compteur de vues
      await supabase
        .from('lexicon_entries')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'entrée:', error)
      return {
        data: null,
        success: false,
        message: 'Entrée non trouvée'
      }
    }
  }

  /**
   * Récupère les entrées en vedette
   */
  static async getFeaturedEntries(limit = 10): Promise<APIResponse<LexiconEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('lexicon_entries')
        .select('*')
        .eq('is_featured', true)
        .order('term', { ascending: true })
        .limit(limit)

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des entrées en vedette:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Récupère les catégories disponibles
   */
  static async getCategories(): Promise<APIResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('lexicon_entries')
        .select('category')
        .not('category', 'is', null)

      if (error) throw error

      const uniqueCategories = [...new Set(data?.map(entry => entry.category).filter(Boolean))]
      
      return {
        data: uniqueCategories as string[],
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
   * Récupère l'alphabet des entrées
   */
  static async getAlphabet(): Promise<APIResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('lexicon_entries')
        .select('term')
        .order('term', { ascending: true })

      if (error) throw error

      const firstLetters = new Set(
        data?.map(entry => entry.term.charAt(0).toUpperCase()).filter(Boolean)
      )
      
      return {
        data: Array.from(firstLetters).sort(),
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'alphabet:', error)
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
   * Crée une nouvelle entrée
   */
  static async createEntry(entryData: Omit<LexiconEntry, 'id' | 'created_at' | 'updated_at' | 'view_count'>): Promise<APIResponse<LexiconEntry>> {
    try {
      const slug = await this.generateUniqueSlug(entryData.term)

      const { data, error } = await supabase
        .from('lexicon_entries')
        .insert([{
          ...entryData,
          slug,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Entrée créée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'entrée:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création'
      }
    }
  }

  /**
   * Met à jour une entrée
   */
  static async updateEntry(id: string, entryData: Partial<LexiconEntry>): Promise<APIResponse<LexiconEntry>> {
    try {
      const { data, error } = await supabase
        .from('lexicon_entries')
        .update({
          ...entryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Entrée mise à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entrée:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Supprime une entrée
   */
  static async deleteEntry(id: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('lexicon_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Entrée supprimée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entrée:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la suppression'
      }
    }
  }

  // =============================================================================
  // RECHERCHE ET SUGGESTIONS
  // =============================================================================

  /**
   * Recherche des entrées connexes
   */
  static async getRelatedEntries(entryId: string, limit = 5): Promise<APIResponse<LexiconEntry[]>> {
    try {
      // Récupérer l'entrée courante
      const { data: currentEntry } = await supabase
        .from('lexicon_entries')
        .select('related_terms, category')
        .eq('id', entryId)
        .single()

      if (!currentEntry) {
        return { data: [], success: false }
      }

      // Rechercher par termes reliés ou catégorie
      let query = supabase
        .from('lexicon_entries')
        .select('*')
        .neq('id', entryId)
        .limit(limit)

      if (currentEntry.related_terms && currentEntry.related_terms.length > 0) {
        query = query.or(
          currentEntry.related_terms
            .map(term => `term.ilike.%${term}%`)
            .join(',')
        )
      } else if (currentEntry.category) {
        query = query.eq('category', currentEntry.category)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des entrées connexes:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Suggestions de recherche
   */
  static async getSuggestions(query: string, limit = 5): Promise<APIResponse<string[]>> {
    try {
      const { data, error } = await supabase
        .from('lexicon_entries')
        .select('term')
        .ilike('term', `${query}%`)
        .order('view_count', { ascending: false })
        .limit(limit)

      if (error) throw error

      return {
        data: data?.map(entry => entry.term) || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  // =============================================================================
  // UTILITAIRES
  // =============================================================================

  /**
   * Génère un slug unique pour une entrée
   */
  static async generateUniqueSlug(term: string): Promise<string> {
    const baseSlug = term
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
        .from('lexicon_entries')
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
export const getLexiconEntries = LexiconService.getEntries
export const getLexiconEntryBySlug = LexiconService.getEntryBySlug
export const getFeaturedLexiconEntries = LexiconService.getFeaturedEntries
export const getLexiconCategories = LexiconService.getCategories
export const getLexiconAlphabet = LexiconService.getAlphabet