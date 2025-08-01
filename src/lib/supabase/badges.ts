// Service Supabase pour les Badges & Certifications - Masterclass ONM
import { supabase } from '../supabaseClient'
import type { 
  BadgeType,
  UserBadge,
  BadgeProgress,
  BadgeStats,
  BadgeShareData,
  APIResponse
} from './types/badge-types'

export class BadgesService {
  // =============================================================================
  // GESTION DES TYPES DE BADGES
  // =============================================================================

  /**
   * Récupère tous les types de badges disponibles
   */
  static async getBadgeTypes(category?: BadgeType['category']): Promise<APIResponse<BadgeType[]>> {
    try {
      let query = supabase
        .from('badge_types')
        .select('*')
        .eq('is_active', true)
        .order('level', { ascending: true })

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des types de badges:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Crée un nouveau type de badge (admin)
   */
  static async createBadgeType(badgeData: Omit<BadgeType, 'id' | 'created_at'>): Promise<APIResponse<BadgeType>> {
    try {
      const { data, error } = await supabase
        .from('badge_types')
        .insert([badgeData])
        .select()
        .single()

      if (error) throw error

      return {
        data,
        success: true,
        message: 'Type de badge créé avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de la création du type de badge:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la création'
      }
    }
  }

  // =============================================================================
  // ATTRIBUTION DES BADGES
  // =============================================================================

  /**
   * Attribue un badge à un utilisateur
   */
  static async awardBadge(
    userId: string,
    badgeTypeId: string,
    metadata?: UserBadge['metadata']
  ): Promise<APIResponse<UserBadge>> {
    try {
      // Vérifier si l'utilisateur a déjà ce badge
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type_id', badgeTypeId)
        .single()

      if (existing) {
        return {
          data: null as any,
          success: false,
          message: 'L\'utilisateur possède déjà ce badge'
        }
      }

      // Générer le token de partage
      const shareToken = this.generateShareToken()

      // Créer le badge
      const { data: badge, error } = await supabase
        .from('user_badges')
        .insert([{
          user_id: userId,
          badge_type_id: badgeTypeId,
          share_token: shareToken,
          metadata: metadata || {},
          earned_at: new Date().toISOString()
        }])
        .select(`
          *,
          badge_type:badge_types(*)
        `)
        .single()

      if (error) throw error

      // Générer les URLs d'export et QR code
      const exportUrl = await this.generateBadgeExportUrl(badge.id)
      const qrCodeUrl = await this.generateBadgeQRCode(badge.id, shareToken)

      // Mettre à jour avec les URLs
      await supabase
        .from('user_badges')
        .update({ 
          export_url: exportUrl,
          qr_code_url: qrCodeUrl
        })
        .eq('id', badge.id)

      // Enregistrer l'activité
      await supabase
        .from('user_activity_log')
        .insert([{
          user_id: userId,
          action_type: 'earn_badge',
          action_details: {
            entity_name: badge.badge_type?.name,
            metadata: { badge_id: badge.id }
          },
          entity_type: 'badge',
          entity_id: badge.id
        }])

      return {
        data: badge,
        success: true,
        message: 'Badge attribué avec succès'
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution du badge:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de l\'attribution'
      }
    }
  }

  /**
   * Vérifie et attribue automatiquement les badges éligibles
   */
  static async checkAndAwardBadges(userId: string): Promise<APIResponse<UserBadge[]>> {
    try {
      // Récupérer tous les types de badges actifs
      const { data: badgeTypes } = await this.getBadgeTypes()
      if (!badgeTypes) return { data: [], success: false }

      const awardedBadges: UserBadge[] = []

      for (const badgeType of badgeTypes) {
        // Vérifier si l'utilisateur a déjà ce badge
        const { data: existing } = await supabase
          .from('user_badges')
          .select('id')
          .eq('user_id', userId)
          .eq('badge_type_id', badgeType.id)
          .single()

        if (existing) continue

        // Vérifier les critères
        const isEligible = await this.checkBadgeCriteria(userId, badgeType)
        
        if (isEligible) {
          const { data: newBadge } = await this.awardBadge(userId, badgeType.id)
          if (newBadge) awardedBadges.push(newBadge)
        }
      }

      return {
        data: awardedBadges,
        success: true,
        message: `${awardedBadges.length} badge(s) attribué(s)`
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des badges:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la vérification'
      }
    }
  }

  /**
   * Vérifie si un utilisateur remplit les critères pour un badge
   */
  private static async checkBadgeCriteria(userId: string, badgeType: BadgeType): Promise<boolean> {
    try {
      const criteria = badgeType.criteria

      switch (criteria.type) {
        case 'complete_formation':
          if (criteria.formation_ids) {
            // Vérifier des formations spécifiques
            const { count } = await supabase
              .from('registrations')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('status', 'completed')
              .in('formation_id', criteria.formation_ids)

            return (count || 0) >= (criteria.count || 1)
          } else {
            // Vérifier un nombre de formations
            const { count } = await supabase
              .from('registrations')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('status', 'completed')

            return (count || 0) >= (criteria.count || 1)
          }

        case 'referrals':
          const { count } = await supabase
            .from('referrals')
            .select('*', { count: 'exact', head: true })
            .eq('referrer_id', userId)
            .eq('status', 'converted')

          return (count || 0) >= (criteria.count || 1)

        case 'quiz_score':
          // À implémenter selon votre système de quiz
          return false

        case 'share_case':
          const { count: caseCount } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', userId)
            .eq('type', 'case_study')
            .eq('status', 'published')

          return (caseCount || 0) >= (criteria.count || 1)

        default:
          return false
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des critères:', error)
      return false
    }
  }

  // =============================================================================
  // CONSULTATION DES BADGES
  // =============================================================================

  /**
   * Récupère les badges d'un utilisateur
   */
  static async getUserBadges(userId?: string): Promise<APIResponse<UserBadge[]>> {
    try {
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) throw new Error('Utilisateur non spécifié')

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge_type:badge_types(*)
        `)
        .eq('user_id', currentUserId)
        .order('earned_at', { ascending: false })

      if (error) throw error

      return {
        data: data || [],
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des badges:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors de la récupération'
      }
    }
  }

  /**
   * Récupère la progression vers les badges non obtenus
   */
  static async getBadgeProgress(userId?: string): Promise<APIResponse<BadgeProgress[]>> {
    try {
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) throw new Error('Utilisateur non spécifié')

      // Récupérer les badges déjà obtenus
      const { data: earnedBadges } = await supabase
        .from('user_badges')
        .select('badge_type_id')
        .eq('user_id', currentUserId)

      const earnedBadgeIds = earnedBadges?.map(b => b.badge_type_id) || []

      // Récupérer les badges non obtenus
      let query = supabase
        .from('badge_types')
        .select('*')
        .eq('is_active', true)

      if (earnedBadgeIds.length > 0) {
        query = query.not('id', 'in', `(${earnedBadgeIds.join(',')})`)
      }

      const { data: availableBadges } = await query

      // Calculer la progression pour chaque badge
      const progressList: BadgeProgress[] = []

      for (const badge of availableBadges || []) {
        const progress = await this.calculateBadgeProgress(currentUserId, badge)
        progressList.push(progress)
      }

      // Trier par pourcentage de progression
      progressList.sort((a, b) => b.percentage - a.percentage)

      return {
        data: progressList,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du calcul de la progression:', error)
      return {
        data: [],
        success: false,
        message: 'Erreur lors du calcul'
      }
    }
  }

  /**
   * Calcule la progression vers un badge spécifique
   */
  private static async calculateBadgeProgress(userId: string, badgeType: BadgeType): Promise<BadgeProgress> {
    let currentProgress = 0
    let requiredProgress = 1
    let nextSteps: string[] = []

    const criteria = badgeType.criteria

    switch (criteria.type) {
      case 'complete_formation':
        requiredProgress = criteria.count || 1
        if (criteria.formation_ids) {
          const { count } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed')
            .in('formation_id', criteria.formation_ids)
          currentProgress = count || 0
          nextSteps = ['Complétez les formations requises']
        } else {
          const { count } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'completed')
          currentProgress = count || 0
          nextSteps = [`Complétez ${requiredProgress - currentProgress} formation(s) supplémentaire(s)`]
        }
        break

      case 'referrals':
        requiredProgress = criteria.count || 1
        const { count } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', userId)
          .eq('status', 'converted')
        currentProgress = count || 0
        nextSteps = [`Parrainez ${requiredProgress - currentProgress} praticien(s) supplémentaire(s)`]
        break

      default:
        nextSteps = ['Critères spécifiques à remplir']
    }

    const percentage = requiredProgress > 0 ? (currentProgress / requiredProgress) * 100 : 0

    return {
      user_id: userId,
      badge_type_id: badgeType.id,
      badge_type: badgeType,
      current_progress: currentProgress,
      required_progress: requiredProgress,
      percentage: Math.min(percentage, 100),
      is_completed: currentProgress >= requiredProgress,
      next_steps
    }
  }

  // =============================================================================
  // STATISTIQUES
  // =============================================================================

  /**
   * Récupère les statistiques de badges d'un utilisateur
   */
  static async getUserBadgeStats(userId?: string): Promise<APIResponse<BadgeStats>> {
    try {
      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id
      if (!currentUserId) throw new Error('Utilisateur non spécifié')

      const { data: badges } = await this.getUserBadges(currentUserId)
      const { data: progress } = await this.getBadgeProgress(currentUserId)

      // Calculer les statistiques
      const badgesByCategory: Record<BadgeType['category'], number> = {
        formation: 0,
        community: 0,
        expertise: 0,
        engagement: 0
      }

      const badgesByLevel: Record<number, number> = {}
      let totalPoints = 0

      badges?.forEach(badge => {
        if (badge.badge_type) {
          badgesByCategory[badge.badge_type.category]++
          badgesByLevel[badge.badge_type.level] = (badgesByLevel[badge.badge_type.level] || 0) + 1
          totalPoints += badge.badge_type.points
        }
      })

      const stats: BadgeStats = {
        total_badges_earned: badges?.length || 0,
        total_points: totalPoints,
        badges_by_category: badgesByCategory,
        badges_by_level: badgesByLevel,
        recent_badges: badges?.slice(0, 5) || [],
        next_badges: progress?.filter(p => p.percentage > 0).slice(0, 3) || []
      }

      return {
        data: stats,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors du calcul'
      }
    }
  }

  // =============================================================================
  // PARTAGE ET EXPORT
  // =============================================================================

  /**
   * Génère les données de partage pour un badge
   */
  static async getBadgeShareData(badgeId: string): Promise<APIResponse<BadgeShareData>> {
    try {
      const { data: badge, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge_type:badge_types(*),
          user:profiles(full_name)
        `)
        .eq('id', badgeId)
        .single()

      if (error || !badge) throw new Error('Badge non trouvé')

      const shareData: BadgeShareData = {
        badge_id: badge.id,
        user_name: badge.user?.full_name || 'Praticien ONM',
        badge_name: badge.badge_type?.name || '',
        badge_description: badge.badge_type?.description || '',
        earned_date: new Date(badge.earned_at).toLocaleDateString('fr-FR'),
        verification_url: `${window.location.origin}/verify-badge/${badge.share_token}`,
        qr_code_data: badge.qr_code_url || ''
      }

      return {
        data: shareData,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la génération des données de partage:', error)
      return {
        data: null as any,
        success: false,
        message: 'Erreur lors de la génération'
      }
    }
  }

  /**
   * Vérifie un badge via son token de partage
   */
  static async verifyBadge(shareToken: string): Promise<APIResponse<UserBadge | null>> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge_type:badge_types(*),
          user:profiles(full_name)
        `)
        .eq('share_token', shareToken)
        .single()

      if (error || !data) {
        return {
          data: null,
          success: false,
          message: 'Badge non trouvé ou invalide'
        }
      }

      return {
        data,
        success: true
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du badge:', error)
      return {
        data: null,
        success: false,
        message: 'Erreur lors de la vérification'
      }
    }
  }

  // =============================================================================
  // UTILITAIRES
  // =============================================================================

  /**
   * Génère un token de partage unique
   */
  private static generateShareToken(): string {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 10)
    return `badge_${timestamp}_${randomStr}`
  }

  /**
   * Génère l'URL d'export du badge
   */
  private static async generateBadgeExportUrl(badgeId: string): Promise<string> {
    // À implémenter avec votre service de génération d'images
    return `/api/badges/${badgeId}/export`
  }

  /**
   * Génère le QR code du badge
   */
  private static async generateBadgeQRCode(badgeId: string, shareToken: string): Promise<string> {
    // À implémenter avec votre service de génération de QR codes
    const verificationUrl = `${window.location.origin}/verify-badge/${shareToken}`
    return `/api/qr-code?data=${encodeURIComponent(verificationUrl)}`
  }
}

// Exports pour la compatibilité
export const getBadgeTypes = BadgesService.getBadgeTypes
export const getUserBadges = BadgesService.getUserBadges
export const awardBadge = BadgesService.awardBadge
export const checkAndAwardBadges = BadgesService.checkAndAwardBadges
export const getBadgeProgress = BadgesService.getBadgeProgress
export const getUserBadgeStats = BadgesService.getUserBadgeStats