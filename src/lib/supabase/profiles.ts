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
    console.error('Error fetching user profile:', error)
    
    // Si le profil n'existe pas, créons-le
    if (error.code === 'PGRST116') {
      const newProfile = {
        id: user.id,
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(newProfile)
        .select()
        .single()

      if (createError) {
        console.error('Error creating user profile:', createError)
        return null
      }

      return createdProfile
    }
    
    return null
  }

  return data
}

// Mettre à jour le profil de l'utilisateur connecté
export async function updateUserProfile(updates: UserProfileUpdate): Promise<UserProfile | null> {
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
    console.error('Error updating user profile:', error)
    return null
  }

  return data
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