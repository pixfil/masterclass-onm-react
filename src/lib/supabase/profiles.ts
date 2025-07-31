import { supabase } from '@/lib/supabaseClient'

export interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface UserProfileUpdate {
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
}

// Récupérer le profil de l'utilisateur connecté
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // Si la table n'existe pas ou autre erreur, retourner un profil par défaut
      console.warn('User profile table not available, using default profile')
      
      // Retourner un profil par défaut basé sur les métadonnées de l'utilisateur
      return {
        id: user.id,
        first_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Admin',
        last_name: user.user_metadata?.last_name || '',
        phone: user.user_metadata?.phone || '',
        avatar_url: user.user_metadata?.avatar_url || '',
        bio: '',
        location: '',
        website: '',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    return data
  } catch (error) {
    console.warn('Profile service not available, using fallback')
    
    // Retourner un profil minimal en cas d'erreur
    return {
      id: 'default-user',
      first_name: 'Admin',
      last_name: '',
      phone: '',
      avatar_url: '',
      bio: '',
      location: '',
      website: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

// Mettre à jour le profil de l'utilisateur connecté
export async function updateUserProfile(updates: UserProfileUpdate): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.warn('Unable to update user profile - table may not exist')
      
      // Retourner le profil mis à jour localement
      const currentProfile = await getCurrentUserProfile()
      if (currentProfile) {
        return {
          ...currentProfile,
          ...updates,
          updated_at: new Date().toISOString()
        }
      }
      return null
    }

    return data
  } catch (error) {
    console.warn('Profile update service not available')
    return null
  }
}

// Uploader une photo de profil
export async function uploadAvatar(file: File): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('No authenticated user')
      return null
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large (max 5MB)')
      return null
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      console.error('File must be an image')
      return null
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}.${fileExt}`
    const filePath = fileName

    console.log('Uploading to path:', filePath)

    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error details:', uploadError)
      return null
    }

    console.log('Upload successful:', data)

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    console.log('Public URL:', publicUrlData.publicUrl)
    return publicUrlData.publicUrl

  } catch (error) {
    console.error('Unexpected error during upload:', error)
    return null
  }
}

// Supprimer l'avatar
export async function deleteAvatar(avatarUrl: string): Promise<boolean> {
  if (!avatarUrl) return true

  try {
    const path = avatarUrl.split('/avatars/')[1]
    if (!path) return true

    const { error } = await supabase.storage
      .from('avatars')
      .remove([`avatars/${path}`])

    if (error) {
      console.error('Error deleting avatar:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error parsing avatar URL:', error)
    return false
  }
}