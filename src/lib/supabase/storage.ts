import { supabase } from '../supabaseClient'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export class StorageService {
  
  // Upload d'un fichier image pour les formations
  static async uploadFormationImage(file: File, formationId?: string): Promise<UploadResult> {
    try {
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = formationId 
        ? `formations/${formationId}/${fileName}`
        : `formations/temp/${fileName}`

      const { data, error } = await supabase.storage
        .from('formation-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erreur upload:', error)
        return { url: '', path: '', error: 'Erreur lors de l\'upload du fichier' }
      }

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('formation-images')
        .getPublicUrl(data.path)

      return {
        url: urlData.publicUrl,
        path: data.path
      }

    } catch (error) {
      console.error('Erreur uploadFormationImage:', error)
      return { url: '', path: '', error: 'Erreur lors de l\'upload' }
    }
  }

  // Upload d'un certificat pour les formations
  static async uploadCertificate(file: File, formationId: string): Promise<UploadResult> {
    try {
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `certificates/${formationId}/${fileName}`

      const { data, error } = await supabase.storage
        .from('formation-certificates')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erreur upload certificat:', error)
        return { url: '', path: '', error: 'Erreur lors de l\'upload du certificat' }
      }

      const { data: urlData } = supabase.storage
        .from('formation-certificates')
        .getPublicUrl(data.path)

      return {
        url: urlData.publicUrl,
        path: data.path
      }

    } catch (error) {
      console.error('Erreur uploadCertificate:', error)
      return { url: '', path: '', error: 'Erreur lors de l\'upload' }
    }
  }

  // Supprimer un fichier
  static async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (error) {
        console.error('Erreur suppression fichier:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erreur deleteFile:', error)
      return false
    }
  }

  // Déplacer un fichier temporaire vers le dossier final
  static async moveFromTemp(
    bucket: string,
    tempPath: string,
    finalPath: string
  ): Promise<boolean> {
    try {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(tempPath)

      if (downloadError || !fileData) {
        console.error('Erreur téléchargement fichier temporaire:', downloadError)
        return false
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(finalPath, fileData, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Erreur upload vers destination finale:', uploadError)
        return false
      }

      // Supprimer le fichier temporaire
      await this.deleteFile(bucket, tempPath)

      return true
    } catch (error) {
      console.error('Erreur moveFromTemp:', error)
      return false
    }
  }

  // Lister les fichiers d'un dossier
  static async listFiles(bucket: string, folder: string = ''): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0
        })

      if (error) {
        console.error('Erreur listage fichiers:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erreur listFiles:', error)
      return []
    }
  }
}

// Exports pour la compatibilité
export const uploadFormationImage = StorageService.uploadFormationImage
export const deleteFormationImage = (path: string) => StorageService.deleteFile('formation-images', path)
export const uploadCertificate = StorageService.uploadCertificate