// Service d'authentification pour les formations - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { UserProfile, APIResponse } from './formations-types'

export class AuthFormationsService {
  // =============================================================================
  // INSCRIPTION
  // =============================================================================

  /**
   * Inscription d'un nouvel utilisateur
   */
  static async signUp(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    company?: string
    profession?: string
  }): Promise<APIResponse<{ user: any; profile: UserProfile }>> {
    try {
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        return {
          data: null as any,
          success: false,
          message: 'Erreur lors de la création du compte'
        }
      }

      // Créer le profil utilisateur
      const profileData = {
        id: authData.user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        company: userData.company,
        profession: userData.profession,
        language: 'fr',
        newsletter_subscribed: true,
        notifications_enabled: true
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert([profileData])
        .select()
        .single()

      if (profileError) {
        console.error('Erreur création profil:', profileError)
        // Ne pas bloquer l'inscription si le profil échoue
      }

      return {
        data: { user: authData.user, profile: profile || profileData },
        success: true,
        message: 'Inscription réussie ! Vérifiez votre email pour confirmer votre compte.'
      }
    } catch (error: any) {
      console.error('Erreur inscription:', error)
      return {
        data: null as any,
        success: false,
        message: error.message || 'Erreur lors de l\'inscription'
      }
    }
  }

  // =============================================================================
  // CONNEXION
  // =============================================================================

  /**
   * Connexion utilisateur
   */
  static async signIn(email: string, password: string): Promise<APIResponse<{
    user: any
    profile: UserProfile | null
  }>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // Récupérer le profil
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      return {
        data: { user: authData.user, profile },
        success: true,
        message: 'Connexion réussie'
      }
    } catch (error: any) {
      console.error('Erreur connexion:', error)
      return {
        data: null as any,
        success: false,
        message: error.message || 'Email ou mot de passe incorrect'
      }
    }
  }

  // =============================================================================
  // DÉCONNEXION
  // =============================================================================

  /**
   * Déconnexion utilisateur
   */
  static async signOut(): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Déconnexion réussie'
      }
    } catch (error: any) {
      console.error('Erreur déconnexion:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la déconnexion'
      }
    }
  }

  // =============================================================================
  // GESTION DU PROFIL
  // =============================================================================

  /**
   * Récupère le profil de l'utilisateur connecté
   */
  static async getCurrentProfile(): Promise<APIResponse<UserProfile | null>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return {
          data: null,
          success: false,
          message: 'Non connecté'
        }
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      return {
        data: profile,
        success: true
      }
    } catch (error) {
      console.error('Erreur récupération profil:', error)
      return {
        data: null,
        success: false,
        message: 'Erreur lors de la récupération du profil'
      }
    }
  }

  /**
   * Met à jour le profil utilisateur
   */
  static async updateProfile(profileData: Partial<UserProfile>): Promise<APIResponse<UserProfile>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return {
          data: null as any,
          success: false,
          message: 'Non connecté'
        }
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      return {
        data: profile,
        success: true,
        message: 'Profil mis à jour avec succès'
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la mise à jour du profil'
      }
    }
  }

  // =============================================================================
  // MOT DE PASSE
  // =============================================================================

  /**
   * Réinitialisation du mot de passe
   */
  static async resetPassword(email: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Email de réinitialisation envoyé'
      }
    } catch (error: any) {
      console.error('Erreur réinitialisation:', error)
      return {
        data: false,
        success: false,
        message: error.message || 'Erreur lors de l\'envoi de l\'email'
      }
    }
  }

  /**
   * Mise à jour du mot de passe
   */
  static async updatePassword(newPassword: string): Promise<APIResponse<boolean>> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return {
        data: true,
        success: true,
        message: 'Mot de passe mis à jour avec succès'
      }
    } catch (error: any) {
      console.error('Erreur mise à jour mot de passe:', error)
      return {
        data: false,
        success: false,
        message: error.message || 'Erreur lors de la mise à jour'
      }
    }
  }

  // =============================================================================
  // VÉRIFICATIONS
  // =============================================================================

  /**
   * Vérifie si l'utilisateur est connecté
   */
  static async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user
  }

  /**
   * Récupère la session actuelle
   */
  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }

  /**
   * Vérifie si un email existe déjà
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    const { data } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()
    
    return !!data
  }

  // =============================================================================
  // ÉVÉNEMENTS AUTH
  // =============================================================================

  /**
   * Configure un listener pour les changements d'état d'authentification
   */
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}