// Service de tags dynamiques pour les profils - Masterclass ONM
import { supabase } from '../supabaseClient'
import { BadgesService } from './badges'
import { TimelineService } from './timeline'

export interface ProfileTag {
  id: string
  name: string
  type: 'expertise' | 'achievement' | 'activity' | 'preference' | 'custom'
  color: string
  icon?: string
  description?: string
  auto_assigned: boolean
  conditions?: Record<string, any>
  priority: number
}

export interface UserProfileTag {
  user_id: string
  tag_id: string
  tag: ProfileTag
  assigned_at: string
  expires_at?: string
  metadata?: Record<string, any>
}

export class ProfileTagsService {
  // Cache pour les tags utilisateur
  private static userTagsCache: Map<string, { data: UserProfileTag[], timestamp: number }> = new Map()
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  
  // =============================================================================
  // GESTION DES TAGS
  // =============================================================================
  
  /**
   * Récupérer tous les tags disponibles
   */
  static async getAllTags(): Promise<ProfileTag[]> {
    const { data, error } = await supabase
      .from('profile_tags')
      .select('*')
      .order('priority', { ascending: false })
    
    if (error) {
      console.error('Erreur récupération tags:', error)
      return []
    }
    
    return data || []
  }
  
  /**
   * Récupérer les tags d'un utilisateur avec mise en cache
   */
  static async getUserTagsFromCache(userId: string): Promise<UserProfileTag[]> {
    const cached = this.userTagsCache.get(userId)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    
    const tags = await this.getUserTags(userId)
    this.userTagsCache.set(userId, { data: tags, timestamp: Date.now() })
    
    return tags
  }
  
  /**
   * Récupérer les tags d'un utilisateur
   */
  static async getUserTags(userId: string): Promise<UserProfileTag[]> {
    const { data, error } = await supabase
      .from('user_profile_tags')
      .select(`
        *,
        tag:profile_tags(*)
      `)
      .eq('user_id', userId)
      .order('assigned_at', { ascending: false })
    
    if (error) {
      console.error('Erreur récupération tags utilisateur:', error)
      return []
    }
    
    return data || []
  }
  
  /**
   * Invalider le cache des tags d'un utilisateur
   */
  static invalidateUserTagsCache(userId: string) {
    this.userTagsCache.delete(userId)
  }
  
  /**
   * Assigner un tag à un utilisateur
   */
  static async assignTag(userId: string, tagId: string, metadata?: Record<string, any>) {
    const { error } = await supabase
      .from('user_profile_tags')
      .upsert({
        user_id: userId,
        tag_id: tagId,
        assigned_at: new Date().toISOString(),
        metadata
      })
    
    if (error) {
      console.error('Erreur assignation tag:', error)
      throw error
    }
    
    // Invalider le cache
    this.invalidateUserTagsCache(userId)
  }
  
  /**
   * Retirer un tag d'un utilisateur
   */
  static async removeTag(userId: string, tagId: string) {
    const { error } = await supabase
      .from('user_profile_tags')
      .delete()
      .eq('user_id', userId)
      .eq('tag_id', tagId)
    
    if (error) {
      console.error('Erreur suppression tag:', error)
      throw error
    }
    
    // Invalider le cache
    this.invalidateUserTagsCache(userId)
  }
  
  // =============================================================================
  // TAGS AUTOMATIQUES
  // =============================================================================
  
  /**
   * Mettre à jour automatiquement les tags d'un utilisateur
   */
  static async updateUserTags(userId: string) {
    try {
      console.log(`Mise à jour des tags pour l'utilisateur ${userId}`)
      
      // Récupérer les données nécessaires
      const [userProfile, badges, timelineStats, formations, activities] = await Promise.all([
        this.getUserProfile(userId),
        BadgesService.getUserBadges(userId),
        TimelineService.getTimelineStats(userId),
        this.getUserFormations(userId),
        this.getUserRecentActivities(userId)
      ])
      
      if (!userProfile) return
      
      // Tags basés sur l'expertise
      await this.updateExpertiseTags(userId, formations, timelineStats)
      
      // Tags basés sur les achievements
      await this.updateAchievementTags(userId, badges.data || [], timelineStats.data)
      
      // Tags basés sur l'activité
      await this.updateActivityTags(userId, activities, timelineStats.data)
      
      // Tags basés sur les préférences
      await this.updatePreferenceTags(userId, userProfile)
      
      console.log(`Tags mis à jour pour l'utilisateur ${userId}`)
      
    } catch (error) {
      console.error('Erreur mise à jour tags:', error)
    }
  }
  
  /**
   * Mettre à jour les tags d'expertise
   */
  private static async updateExpertiseTags(userId: string, formations: any[], stats: any) {
    const expertiseTags = []
    
    // Tag "Expert ONM" si plus de 5 formations complétées
    if (stats?.formations_completed >= 5) {
      expertiseTags.push('expert-onm')
    }
    
    // Tag "Spécialiste" pour chaque catégorie avec 3+ formations
    const categoryCounts: Record<string, number> = {}
    formations.forEach(f => {
      if (f.status === 'completed' && f.formation?.category) {
        categoryCounts[f.formation.category] = (categoryCounts[f.formation.category] || 0) + 1
      }
    })
    
    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count >= 3) {
        expertiseTags.push(`specialist-${category.toLowerCase()}`)
      }
    })
    
    // Tag "Certifié" si au moins une certification
    if (stats?.certifications_earned > 0) {
      expertiseTags.push('certified-practitioner')
    }
    
    // Assigner les tags
    for (const tagName of expertiseTags) {
      const tag = await this.getTagByName(tagName)
      if (tag) {
        await this.assignTag(userId, tag.id, {
          formations_count: stats?.formations_completed,
          certifications: stats?.certifications_earned
        })
      }
    }
  }
  
  /**
   * Mettre à jour les tags d'achievement
   */
  private static async updateAchievementTags(userId: string, badges: any[], stats: any) {
    const achievementTags = []
    
    // Tag basé sur le nombre de badges
    if (badges.length >= 10) {
      achievementTags.push('badge-collector')
    }
    if (badges.length >= 25) {
      achievementTags.push('badge-master')
    }
    
    // Tag "Early Adopter" si inscrit depuis plus de 6 mois
    if (stats?.active_months >= 6) {
      achievementTags.push('early-adopter')
    }
    
    // Tag "Contributeur" si a partagé des ressources ou écrit des articles
    const hasContributed = await this.checkUserContributions(userId)
    if (hasContributed) {
      achievementTags.push('community-contributor')
    }
    
    // Tag "Ambassadeur" si a parrainé 5+ personnes
    const referralCount = await this.getUserReferralCount(userId)
    if (referralCount >= 5) {
      achievementTags.push('ambassador')
    }
    
    // Assigner les tags
    for (const tagName of achievementTags) {
      const tag = await this.getTagByName(tagName)
      if (tag) {
        await this.assignTag(userId, tag.id, {
          badges_count: badges.length,
          months_active: stats?.active_months
        })
      }
    }
  }
  
  /**
   * Mettre à jour les tags d'activité
   */
  private static async updateActivityTags(userId: string, activities: any[], stats: any) {
    const activityTags = []
    
    // Tag "Membre actif" si connecté dans les 7 derniers jours
    const lastActivity = activities[0]?.created_at
    if (lastActivity && new Date(lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      activityTags.push('active-member')
    }
    
    // Tag "Power User" si plus de 50 actions ce mois
    const monthlyActions = activities.filter(a => 
      new Date(a.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length
    if (monthlyActions >= 50) {
      activityTags.push('power-user')
    }
    
    // Tag "Networker" si participe aux événements
    const eventParticipations = await this.getUserEventParticipations(userId)
    if (eventParticipations >= 5) {
      activityTags.push('networker')
    }
    
    // Assigner les tags
    for (const tagName of activityTags) {
      const tag = await this.getTagByName(tagName)
      if (tag) {
        await this.assignTag(userId, tag.id, {
          last_activity: lastActivity,
          monthly_actions: monthlyActions
        })
      }
    }
  }
  
  /**
   * Mettre à jour les tags de préférence
   */
  private static async updatePreferenceTags(userId: string, profile: any) {
    const preferenceTags = []
    
    // Tags basés sur les intérêts déclarés
    if (profile.interests) {
      profile.interests.forEach((interest: string) => {
        preferenceTags.push(`interest-${interest.toLowerCase()}`)
      })
    }
    
    // Tag basé sur la localisation
    if (profile.city) {
      preferenceTags.push(`location-${profile.city.toLowerCase()}`)
    }
    
    // Tag basé sur l'expérience
    if (profile.years_experience) {
      if (profile.years_experience < 2) {
        preferenceTags.push('beginner')
      } else if (profile.years_experience < 5) {
        preferenceTags.push('intermediate')
      } else {
        preferenceTags.push('experienced')
      }
    }
    
    // Assigner les tags
    for (const tagName of preferenceTags) {
      const tag = await this.getTagByName(tagName)
      if (tag) {
        await this.assignTag(userId, tag.id, {
          profile_data: {
            interests: profile.interests,
            city: profile.city,
            experience: profile.years_experience
          }
        })
      }
    }
  }
  
  // =============================================================================
  // HELPERS
  // =============================================================================
  
  private static async getUserProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    return data
  }
  
  private static async getUserFormations(userId: string) {
    const { data } = await supabase
      .from('formation_enrollments')
      .select(`
        *,
        formation:formations(*)
      `)
      .eq('user_id', userId)
    
    return data || []
  }
  
  private static async getUserRecentActivities(userId: string) {
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)
    
    return data || []
  }
  
  private static async checkUserContributions(userId: string) {
    const { count: articlesCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
    
    const { count: resourcesCount } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true })
      .eq('uploaded_by', userId)
    
    return (articlesCount || 0) + (resourcesCount || 0) > 0
  }
  
  private static async getUserReferralCount(userId: string) {
    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)
      .eq('status', 'completed')
    
    return count || 0
  }
  
  private static async getUserEventParticipations(userId: string) {
    const { count } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('attended', true)
    
    return count || 0
  }
  
  private static async getTagByName(name: string) {
    const { data } = await supabase
      .from('profile_tags')
      .select('*')
      .eq('name', name)
      .single()
    
    return data
  }
  
  // =============================================================================
  // TAGS PRÉDÉFINIS
  // =============================================================================
  
  /**
   * Initialiser les tags prédéfinis
   */
  static async initializePredefinedTags() {
    const predefinedTags: Omit<ProfileTag, 'id'>[] = [
      // Tags d'expertise
      {
        name: 'expert-onm',
        type: 'expertise',
        color: '#6366f1',
        icon: '🎓',
        description: 'Expert en orthodontie neuro-musculaire',
        auto_assigned: true,
        conditions: { formations_completed: 5 },
        priority: 10
      },
      {
        name: 'certified-practitioner',
        type: 'expertise',
        color: '#10b981',
        icon: '✅',
        description: 'Praticien certifié',
        auto_assigned: true,
        conditions: { certifications: 1 },
        priority: 9
      },
      
      // Tags d'achievement
      {
        name: 'badge-collector',
        type: 'achievement',
        color: '#f59e0b',
        icon: '🏆',
        description: 'Collectionneur de badges',
        auto_assigned: true,
        conditions: { badges_count: 10 },
        priority: 7
      },
      {
        name: 'ambassador',
        type: 'achievement',
        color: '#8b5cf6',
        icon: '👥',
        description: 'Ambassadeur de la communauté',
        auto_assigned: true,
        conditions: { referrals: 5 },
        priority: 8
      },
      
      // Tags d'activité
      {
        name: 'active-member',
        type: 'activity',
        color: '#3b82f6',
        icon: '⚡',
        description: 'Membre actif',
        auto_assigned: true,
        conditions: { last_activity_days: 7 },
        priority: 5
      },
      {
        name: 'power-user',
        type: 'activity',
        color: '#ef4444',
        icon: '🚀',
        description: 'Utilisateur intensif',
        auto_assigned: true,
        conditions: { monthly_actions: 50 },
        priority: 6
      },
      
      // Tags de préférence
      {
        name: 'beginner',
        type: 'preference',
        color: '#22c55e',
        icon: '🌱',
        description: 'Débutant',
        auto_assigned: true,
        conditions: { years_experience_max: 2 },
        priority: 3
      },
      {
        name: 'experienced',
        type: 'preference',
        color: '#a855f7',
        icon: '💎',
        description: 'Expérimenté',
        auto_assigned: true,
        conditions: { years_experience_min: 5 },
        priority: 4
      }
    ]
    
    for (const tag of predefinedTags) {
      const existing = await this.getTagByName(tag.name)
      if (!existing) {
        await supabase.from('profile_tags').insert(tag)
        console.log(`Tag créé: ${tag.name}`)
      }
    }
  }
  
  /**
   * Mettre à jour les tags pour tous les utilisateurs
   * À exécuter périodiquement via un cron job
   */
  static async updateAllUsersTags() {
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
    
    if (!users) return
    
    console.log(`Mise à jour des tags pour ${users.length} utilisateurs...`)
    
    // Traiter par batch pour éviter la surcharge
    const batchSize = 10
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      await Promise.all(
        batch.map(user => this.updateUserTags(user.id))
      )
      
      // Pause entre les batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('Mise à jour des tags terminée')
  }
}