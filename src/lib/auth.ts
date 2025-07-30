import { supabase } from './supabaseClient'

export interface AuthUser {
  id: string
  email: string
  role?: string
}

// Connexion
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// Déconnexion
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Obtenir l'utilisateur actuel
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email!,
    role: user.user_metadata?.role || 'user'
  }
}

// Vérifier si l'utilisateur est admin
export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return user?.role === 'admin' || user?.email === 'philippe@gclicke.com'
}

// Hook pour écouter les changements d'authentification
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        role: session.user.user_metadata?.role || 'user'
      }
      callback(user)
    } else {
      callback(null)
    }
  })
}