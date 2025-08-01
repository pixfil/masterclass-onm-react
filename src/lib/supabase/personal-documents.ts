// Service Supabase pour l'Espace Documentaire Personnel - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  PersonalDocument,
  DocumentFolder,
  DocumentSearchParams,
  DocumentStats,
  PaginatedResponse,
  APIResponse 
} from './types/personal-document-types'

export class PersonalDocumentsService {
  // =============================================================================
  // GESTION DES DOCUMENTS
  // =============================================================================

  /**
   * Récupère les documents personnels de l'utilisateur
   */
  static async getDocuments(params: DocumentSearchParams = {}): Promise<PaginatedResponse<PersonalDocument>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return {
          data: [],
          pagination: { page: 1, limit: 20, total: 0, total_pages: 0 },
          success: false,
          message: 'Utilisateur non connecté'
        }
      }

      const { 
        query = '', 
        folder_id,
        file_type,
        tags,
        shared_with_me,
        sort_by = 'created_at', 
        sort_order = 'desc',
        page = 1, 
        limit = 20 
      } = params

      let queryBuilder = supabase
        .from('personal_documents')
        .select('*, folder:document_folders(*), uploaded_by:profiles(*)', { count: 'exact' })

      // Filtrer par propriétaire ou documents partagés
      if (shared_with_me) {
        queryBuilder = queryBuilder.contains('shared_with', [user.id])
      } else {
        queryBuilder = queryBuilder.eq('user_id', user.id)
      }

      // Recherche textuelle
      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      }

      // Filtres
      if (folder_id) {
        queryBuilder = queryBuilder.eq('folder_id', folder_id)
      }
      if (file_type) {
        queryBuilder = queryBuilder.eq('file_type', file_type)
      }
      if (tags && tags.length > 0) {
        queryBuilder = queryBuilder.contains('tags', tags)
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
      console.error('Erreur lors de la récupération des documents:', error)
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Upload un nouveau document
   */
  static async uploadDocument(file: File, metadata: {
    folder_id?: string
    description?: string
    tags?: string[]
    is_private?: boolean
  }): Promise<APIResponse<PersonalDocument>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { 
          data: null as any, 
          success: false, 
          message: 'Utilisateur non connecté' 
        }
      }

      // Vérifier l'espace de stockage
      const { data: stats } = await this.getStorageStats()
      if (stats && stats.storage_used + file.size > stats.storage_limit) {
        return {
          data: null as any,
          success: false,
          message: 'Limite de stockage atteinte'
        }
      }

      // Upload du fichier vers Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('personal-documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Obtenir l'URL publique du fichier
      const { data: { publicUrl } } = supabase.storage
        .from('personal-documents')
        .getPublicUrl(fileName)

      // Créer l'entrée en base de données
      const { data, error } = await supabase
        .from('personal_documents')
        .insert([{
          user_id: user.id,
          name: file.name,
          file_url: publicUrl,
          file_path: fileName,
          file_type: fileExt || 'unknown',
          file_size: file.size,
          mime_type: file.type,
          folder_id: metadata.folder_id,
          description: metadata.description,
          tags: metadata.tags,
          is_private: metadata.is_private ?? true,
          uploaded_at: new Date().toISOString()
        }])
        .select('*, folder:document_folders(*)')
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Document uploadé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de l\'upload'
      }
    }
  }

  /**
   * Met à jour les métadonnées d'un document
   */
  static async updateDocument(id: string, updates: Partial<PersonalDocument>): Promise<APIResponse<PersonalDocument>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { 
          data: null as any, 
          success: false 
        }
      }

      const { data, error } = await supabase
        .from('personal_documents')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*, folder:document_folders(*)')
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Document mis à jour'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour'
      }
    }
  }

  /**
   * Supprime un document
   */
  static async deleteDocument(id: string): Promise<APIResponse<boolean>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: false, success: false }
      }

      // Récupérer le document pour obtenir le file_path
      const { data: doc } = await supabase
        .from('personal_documents')
        .select('file_path')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!doc) {
        return { data: false, success: false, message: 'Document non trouvé' }
      }

      // Supprimer le fichier du storage
      if (doc.file_path) {
        await supabase.storage
          .from('personal-documents')
          .remove([doc.file_path])
      }

      // Supprimer l'entrée de la base de données
      const { error } = await supabase
        .from('personal_documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Document supprimé'
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

  // =============================================================================
  // GESTION DES DOSSIERS
  // =============================================================================

  /**
   * Récupère les dossiers de l'utilisateur
   */
  static async getFolders(): Promise<APIResponse<DocumentFolder[]>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: [], success: false }
      }

      const { data, error } = await supabase
        .from('document_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des dossiers:', error)
      return {
        data: [],
        success: false
      }
    }
  }

  /**
   * Crée un nouveau dossier
   */
  static async createFolder(folderData: {
    name: string
    description?: string
    color?: string
    icon?: string
  }): Promise<APIResponse<DocumentFolder>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { 
          data: null as any, 
          success: false 
        }
      }

      const { data, error } = await supabase
        .from('document_folders')
        .insert([{
          ...folderData,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Dossier créé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création'
      }
    }
  }

  /**
   * Met à jour un dossier
   */
  static async updateFolder(id: string, updates: Partial<DocumentFolder>): Promise<APIResponse<DocumentFolder>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { 
          data: null as any, 
          success: false 
        }
      }

      const { data, error } = await supabase
        .from('document_folders')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Dossier mis à jour'
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      return {
        data: null as any,
        success: false
      }
    }
  }

  /**
   * Supprime un dossier (déplace les documents vers la racine)
   */
  static async deleteFolder(id: string): Promise<APIResponse<boolean>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: false, success: false }
      }

      // Déplacer tous les documents du dossier vers la racine
      await supabase
        .from('personal_documents')
        .update({ folder_id: null })
        .eq('folder_id', id)
        .eq('user_id', user.id)

      // Supprimer le dossier
      const { error } = await supabase
        .from('document_folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Dossier supprimé'
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      return {
        data: false,
        success: false
      }
    }
  }

  // =============================================================================
  // PARTAGE ET PERMISSIONS
  // =============================================================================

  /**
   * Partage un document avec d'autres utilisateurs
   */
  static async shareDocument(documentId: string, userEmails: string[]): Promise<APIResponse<boolean>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: false, success: false }
      }

      // Récupérer les IDs des utilisateurs à partir des emails
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .in('email', userEmails)

      if (!users || users.length === 0) {
        return {
          data: false,
          success: false,
          message: 'Utilisateurs non trouvés'
        }
      }

      const userIds = users.map(u => u.id)

      // Mettre à jour le document avec les nouveaux partages
      const { error } = await supabase
        .from('personal_documents')
        .update({ 
          shared_with: userIds,
          is_private: false 
        })
        .eq('id', documentId)
        .eq('user_id', user.id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Document partagé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors du partage'
      }
    }
  }

  /**
   * Retire le partage d'un document
   */
  static async unshareDocument(documentId: string): Promise<APIResponse<boolean>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: false, success: false }
      }

      const { error } = await supabase
        .from('personal_documents')
        .update({ 
          shared_with: [],
          is_private: true 
        })
        .eq('id', documentId)
        .eq('user_id', user.id)

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Partage retiré'
      }
    } catch (error) {
      console.error('Erreur lors du retrait du partage:', error)
      return {
        data: false,
        success: false
      }
    }
  }

  // =============================================================================
  // STATISTIQUES
  // =============================================================================

  /**
   * Récupère les statistiques de stockage
   */
  static async getStorageStats(): Promise<APIResponse<DocumentStats>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { 
          data: null as any, 
          success: false 
        }
      }

      const { data, error } = await supabase
        .from('personal_documents')
        .select('file_size, file_type')
        .eq('user_id', user.id)

      if (error) throw error

      const stats: DocumentStats = {
        total_documents: data?.length || 0,
        total_folders: 0,
        storage_used: data?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0,
        storage_limit: 5 * 1024 * 1024 * 1024, // 5GB
        documents_by_type: {},
        recent_documents: 0,
        shared_documents: 0
      }

      // Compter les documents par type
      data?.forEach(doc => {
        if (doc.file_type) {
          stats.documents_by_type[doc.file_type] = 
            (stats.documents_by_type[doc.file_type] || 0) + 1
        }
      })

      // Compter les dossiers
      const { count: folderCount } = await supabase
        .from('document_folders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      stats.total_folders = folderCount || 0

      // Compter les documents récents (derniers 7 jours)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: recentCount } = await supabase
        .from('personal_documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString())

      stats.recent_documents = recentCount || 0

      // Compter les documents partagés
      const { count: sharedCount } = await supabase
        .from('personal_documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_private', false)

      stats.shared_documents = sharedCount || 0

      return {
        data: stats,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      return {
        data: null as any,
        success: false
      }
    }
  }

  /**
   * Recherche de documents avancée
   */
  static async searchDocuments(searchQuery: string): Promise<APIResponse<PersonalDocument[]>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) {
        return { data: [], success: false }
      }

      const { data, error } = await supabase
        .from('personal_documents')
        .select('*, folder:document_folders(*)')
        .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      return {
        data: [],
        success: false
      }
    }
  }
}

// Exports pour la compatibilité
export const getPersonalDocuments = PersonalDocumentsService.getDocuments
export const uploadDocument = PersonalDocumentsService.uploadDocument
export const deleteDocument = PersonalDocumentsService.deleteDocument
export const getDocumentFolders = PersonalDocumentsService.getFolders
export const createDocumentFolder = PersonalDocumentsService.createFolder
export const getStorageStats = PersonalDocumentsService.getStorageStats