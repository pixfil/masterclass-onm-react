// Service Supabase pour le Système de Parrainage - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  Referral,
  ReferralReward,
  ReferralStats,
  CreateReferralData,
  ReferralEmailData,
  APIResponse,
  PaginatedResponse
} from './types/referral-types'

export class ReferralsService {
  // =============================================================================
  // CRÉATION ET GESTION DES PARRAINAGES
  // =============================================================================

  /**
   * Génère un token de parrainage unique
   */
  private static generateReferralToken(): string {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `ref_${timestamp}_${randomStr}`.toUpperCase()
  }

  /**
   * Crée un nouveau parrainage
   */
  static async createReferral(data: CreateReferralData): Promise<APIResponse<Referral>> {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('Utilisateur non authentifié')

      const referralToken = this.generateReferralToken()

      const { data: referral, error } = await supabase
        .from('referrals')
        .insert([{
          referrer_id: user.id,
          referral_token: referralToken,
          referee_email: data.referee_email,
          referee_name: data.referee_name,
          personal_message: data.personal_message,
          formation_id: data.formation_id,
          status: 'pending'
        }])
        .select(`
          *,
          formation:formations(id, title, slug, price)
        `)
        .single()

      if (error) throw error

      // Envoyer l'email d'invitation (à implémenter avec votre service d'email)
      await this.sendReferralEmail(referral)

      return {
        data: referral,
        success: true,
        message: 'Invitation envoyée avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création du parrainage:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de l\'envoi de l\'invitation'
      }
    }
  }

  /**
   * Enregistre un clic sur un lien de parrainage
   */
  static async trackReferralClick(token: string): Promise<APIResponse<Referral | null>> {
    try {
      const { data: referral, error: fetchError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referral_token', token)
        .eq('status', 'pending')
        .single()

      if (fetchError || !referral) {
        return {
          data: null,
          success: false,
          message: 'Lien de parrainage invalide ou expiré'
        }
      }

      // Vérifier si le lien n'a pas expiré
      if (new Date(referral.expires_at) < new Date()) {
        await supabase
          .from('referrals')
          .update({ status: 'expired' })
          .eq('id', referral.id)

        return {
          data: null,
          success: false,
          message: 'Ce lien de parrainage a expiré'
        }
      }

      // Mettre à jour le statut
      const { data: updatedReferral, error: updateError } = await supabase
        .from('referrals')
        .update({ 
          status: 'clicked',
          clicked_at: new Date().toISOString()
        })
        .eq('id', referral.id)
        .select(`
          *,
          formation:formations(id, title, slug, price)
        `)
        .single()

      if (updateError) throw updateError

      return {
        data: updatedReferral,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du tracking du clic:', error)
      return {
        data: null,
        success: false,
        message: 'Erreur lors du traitement'
      }
    }
  }

  /**
   * Marque un parrainage comme converti après achat
   */
  static async convertReferral(refereeUserId: string, orderId: string): Promise<APIResponse<boolean>> {
    try {
      // Trouver le parrainage correspondant
      const { data: referral, error: fetchError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referee_email', refereeUserId) // À adapter selon votre logique
        .in('status', ['clicked', 'registered'])
        .single()

      if (fetchError || !referral) {
        return {
          data: false,
          success: false,
          message: 'Aucun parrainage trouvé'
        }
      }

      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('referrals')
        .update({ 
          status: 'converted',
          converted_at: new Date().toISOString()
        })
        .eq('id', referral.id)

      if (updateError) throw updateError

      // Attribuer les récompenses
      await this.grantReferralRewards(referral.id)

      return {
        data: true,
        success: true,
        message: 'Parrainage converti avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la conversion du parrainage:', error)
      return {
        data: false,
        success: false,
        message: 'Erreur lors de la conversion'
      }
    }
  }

  // =============================================================================
  // RÉCOMPENSES
  // =============================================================================

  /**
   * Attribue les récompenses pour un parrainage réussi
   */
  static async grantReferralRewards(referralId: string): Promise<APIResponse<ReferralReward[]>> {
    try {
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('id', referralId)
        .single()

      if (!referral) throw new Error('Parrainage non trouvé')

      const rewards: any[] = []

      // Récompense pour le parrain - Badge
      rewards.push({
        referrer_id: referral.referrer_id,
        referral_id: referralId,
        type: 'badge',
        value: { badge_id: 'referral-success', badge_name: 'Ambassadeur ONM' },
        status: 'granted',
        granted_at: new Date().toISOString()
      })

      // Récompense pour le parrain - Réduction
      rewards.push({
        referrer_id: referral.referrer_id,
        referral_id: referralId,
        type: 'discount',
        value: { discount_percent: 10, applicable_formations: 'all' },
        status: 'granted',
        granted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 jours
      })

      const { data: createdRewards, error } = await supabase
        .from('referral_rewards')
        .insert(rewards)
        .select()

      if (error) throw error

      // Mettre à jour le champ rewards du referral
      await supabase
        .from('referrals')
        .update({ 
          rewards: {
            badge_earned: true,
            discount_amount: 10
          }
        })
        .eq('id', referralId)

      // Envoyer les notifications de succès
      await this.sendSuccessNotifications(referral)

      return {
        data: createdRewards,
        success: true,
        message: 'Récompenses attribuées avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution des récompenses:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de l\'attribution des récompenses'
      }
    }
  }

  /**
   * Récupère les récompenses d'un utilisateur
   */
  static async getUserRewards(userId?: string): Promise<APIResponse<ReferralReward[]>> {
    try {
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) throw new Error('Utilisateur non spécifié')

      const { data, error } = await supabase
        .from('referral_rewards')
        .select(`
          *,
          referral:referrals(*)
        `)
        .eq('referrer_id', currentUserId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des récompenses:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération des récompenses'
      }
    }
  }

  // =============================================================================
  // CONSULTATION DES PARRAINAGES
  // =============================================================================

  /**
   * Récupère les parrainages d'un utilisateur
   */
  static async getUserReferrals(params: {
    userId?: string
    status?: Referral['status']
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<Referral>> {
    try {
      const { 
        userId = (await supabase.auth.getUser()).data.user?.id,
        status,
        page = 1,
        limit = 10
      } = params

      if (!userId) throw new Error('Utilisateur non spécifié')

      let query = supabase
        .from('referrals')
        .select(`
          *,
          formation:formations(id, title, slug, price)
        `, { count: 'exact' })
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data, error, count } = await query.range(from, to)

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
      console.error('Erreur lors de la récupération des parrainages:', error)
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
        success: false,
        message: 'Erreur lors de la récupération des parrainages'
      }
    }
  }

  // =============================================================================
  // STATISTIQUES
  // =============================================================================

  /**
   * Récupère les statistiques de parrainage d'un utilisateur
   */
  static async getUserReferralStats(userId?: string): Promise<APIResponse<ReferralStats>> {
    try {
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) throw new Error('Utilisateur non spécifié')

      const { data: referrals } = await supabase
        .from('referrals')
        .select('status')
        .eq('referrer_id', currentUserId)

      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('type, value, status')
        .eq('referrer_id', currentUserId)

      const stats: ReferralStats = {
        total_sent: referrals?.length || 0,
        total_clicked: referrals?.filter(r => ['clicked', 'registered', 'converted'].includes(r.status)).length || 0,
        total_registered: referrals?.filter(r => ['registered', 'converted'].includes(r.status)).length || 0,
        total_converted: referrals?.filter(r => r.status === 'converted').length || 0,
        conversion_rate: referrals?.length ? 
          (referrals.filter(r => r.status === 'converted').length / referrals.length) * 100 : 0,
        total_rewards_earned: rewards?.filter(r => r.status === 'granted').length || 0,
        rewards_by_type: [],
        top_referrers: []
      }

      // Calculer les récompenses par type
      const rewardsByType = rewards?.reduce((acc, reward) => {
        if (!acc[reward.type]) {
          acc[reward.type] = { count: 0, total_value: 0 }
        }
        acc[reward.type].count++
        if (reward.value.discount_amount) {
          acc[reward.type].total_value += reward.value.discount_amount
        }
        return acc
      }, {} as Record<string, { count: number, total_value: number }>) || {}

      stats.rewards_by_type = Object.entries(rewardsByType).map(([type, data]) => ({
        type: type as ReferralReward['type'],
        count: data.count,
        total_value: data.total_value
      }))

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

  /**
   * Récupère les statistiques globales de parrainage (admin)
   */
  static async getGlobalReferralStats(): Promise<APIResponse<ReferralStats>> {
    try {
      const { data: referrals } = await supabase
        .from('referrals')
        .select('status, referrer_id')

      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('type, value, status, referrer_id')

      // Calculer les top parrains
      const referrerCounts = referrals?.reduce((acc, ref) => {
        acc[ref.referrer_id] = (acc[ref.referrer_id] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const topReferrerIds = Object.entries(referrerCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id]) => id)

      // Récupérer les infos des top parrains
      const { data: topReferrerProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', topReferrerIds)

      const stats: ReferralStats = {
        total_sent: referrals?.length || 0,
        total_clicked: referrals?.filter(r => ['clicked', 'registered', 'converted'].includes(r.status)).length || 0,
        total_registered: referrals?.filter(r => ['registered', 'converted'].includes(r.status)).length || 0,
        total_converted: referrals?.filter(r => r.status === 'converted').length || 0,
        conversion_rate: referrals?.length ? 
          (referrals.filter(r => r.status === 'converted').length / referrals.length) * 100 : 0,
        total_rewards_earned: rewards?.filter(r => r.status === 'granted').length || 0,
        rewards_by_type: [],
        top_referrers: topReferrerProfiles?.map(profile => ({
          user_id: profile.id,
          user_name: profile.full_name || 'Utilisateur',
          referral_count: referrerCounts[profile.id] || 0,
          conversion_count: referrals?.filter(r => 
            r.referrer_id === profile.id && r.status === 'converted'
          ).length || 0
        })) || []
      }

      return {
        data: stats,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error)
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
   * Envoie les notifications de parrainage réussi
   */
  private static async sendSuccessNotifications(referral: any): Promise<void> {
    try {
      // Récupérer les profils du parrain et du filleul
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', referral.referrer_id)
        .single()

      const { data: refereeProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('email', referral.referee_email)
        .single()

      if (!referrerProfile || !refereeProfile) {
        throw new Error('Profils non trouvés')
      }

      // Récupérer les statistiques du parrain
      const stats = await this.getUserReferralStats(referral.referrer_id)
      
      // Importer les services d'emails
      const { sendSuccessNotification, sendRefereeWelcome } = await import('./referral-emails')

      // Préparer les statistiques pour l'email
      const emailStats = {
        total_points: 500, // À récupérer depuis le système de points
        total_referrals: stats.data?.total_converted || 1,
        pending_referrals: stats.data?.total_sent || 0,
        total_rewards: (stats.data?.total_converted || 1) * 50, // 50€ par parrainage
        milestone_reached: (stats.data?.total_converted || 0) % 3 === 0,
        milestone_message: 'Vous avez atteint le badge Ambassadeur Bronze!'
      }

      // Envoyer la notification au parrain
      await sendSuccessNotification(
        referrerProfile,
        refereeProfile,
        emailStats
      )

      // Envoyer l'email de bienvenue au filleul avec code promo
      const discountCode = `ONM${referral.referral_token.slice(-6)}`
      await sendRefereeWelcome(
        refereeProfile,
        referrerProfile,
        discountCode
      )

      console.log('Notifications de succès envoyées')
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications de succès:', error)
    }
  }

  /**
   * Envoie l'email d'invitation de parrainage
   */
  private static async sendReferralEmail(referral: Referral): Promise<void> {
    try {
      // Récupérer les informations du parrain
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', referral.referrer_id)
        .single()

      if (!referrerProfile) {
        throw new Error('Profil du parrain non trouvé')
      }

      // Importer le service d'emails de parrainage
      const { sendReferralInvitation, sendReferralConfirmation } = await import('./referral-emails')

      // Construire le lien d'invitation
      const invitationLink = `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/referral/${referral.referral_token}`

      // Envoyer l'email d'invitation au filleul
      await sendReferralInvitation(
        referrerProfile,
        referral.referee_email,
        referral.referee_name || 'Cher(e) collègue',
        invitationLink,
        referral.personal_message
      )

      // Envoyer la confirmation au parrain
      await sendReferralConfirmation(
        referrerProfile,
        referral.referee_email,
        referral.referral_token
      )

      console.log('Emails de parrainage envoyés avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'envoi des emails de parrainage:', error)
      // Ne pas faire échouer la création du parrainage si l'email échoue
    }
  }

  /**
   * Vérifie et nettoie les parrainages expirés
   */
  static async cleanupExpiredReferrals(): Promise<void> {
    try {
      await supabase
        .from('referrals')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString())
    } catch (error) {
      console.error('Erreur lors du nettoyage des parrainages expirés:', error)
    }
  }
}

// Exports pour la compatibilité
export const createReferral = ReferralsService.createReferral
export const getUserReferrals = ReferralsService.getUserReferrals
export const getUserReferralStats = ReferralsService.getUserReferralStats
export const trackReferralClick = ReferralsService.trackReferralClick
export const convertReferral = ReferralsService.convertReferral