import { supabase } from '../supabaseClient'

export interface FormationDashboardStats {
  // Statistiques générales
  total_formations: number
  active_formations: number
  draft_formations: number
  featured_formations: number
  
  // Statistiques des sessions
  total_sessions: number
  upcoming_sessions: number
  ongoing_sessions: number
  completed_sessions: number
  
  // Statistiques d'inscription
  total_registrations: number
  registrations_this_month: number
  registrations_growth: number
  pending_registrations: number
  
  // Revenus
  total_revenue: number
  revenue_this_month: number
  revenue_growth: number
  average_order_value: number
  
  // Satisfaction
  average_rating: number
  total_reviews: number
  satisfaction_rate: number
  completion_rate: number
  
  // Performance
  conversion_rate: number
  popular_formations: FormationPopularity[]
  recent_activity: DashboardActivity[]
}

export interface FormationPopularity {
  formation_id: string
  formation_title: string
  formation_slug: string
  total_registrations: number
  revenue: number
  average_rating: number
  completion_rate: number
}

export interface DashboardActivity {
  id: string
  type: 'registration' | 'completion' | 'review' | 'refund'
  description: string
  formation_title?: string
  user_name?: string
  amount?: number
  rating?: number
  created_at: string
}

export interface MonthlyStats {
  month: string
  registrations: number
  revenue: number
  new_formations: number
  avg_satisfaction: number
}

export class FormationDashboardService {
  
  // Récupérer toutes les statistiques du dashboard
  static async getDashboardStats(): Promise<FormationDashboardStats> {
    try {
      const [
        formationStats,
        sessionStats,
        registrationStats,
        revenueStats,
        satisfactionStats,
        performanceStats
      ] = await Promise.all([
        this.getFormationStats(),
        this.getSessionStats(),
        this.getRegistrationStats(),
        this.getRevenueStats(),
        this.getSatisfactionStats(),
        this.getPerformanceStats()
      ])

      return {
        ...formationStats,
        ...sessionStats,
        ...registrationStats,
        ...revenueStats,
        ...satisfactionStats,
        ...performanceStats
      }
    } catch (error) {
      console.error('Erreur récupération stats dashboard:', error)
      throw new Error('Erreur lors de la récupération des statistiques')
    }
  }

  // Statistiques des formations
  private static async getFormationStats() {
    const { data: formations, error } = await supabase
      .from('formations')
      .select('status, featured')

    if (error) throw error

    return {
      total_formations: formations?.length || 0,
      active_formations: formations?.filter(f => f.status === 'published').length || 0,
      draft_formations: formations?.filter(f => f.status === 'draft').length || 0,
      featured_formations: formations?.filter(f => f.featured).length || 0
    }
  }

  // Statistiques des sessions
  private static async getSessionStats() {
    const { data: sessions, error } = await supabase
      .from('formation_sessions')
      .select('start_date, end_date, status')

    if (error) throw error

    const now = new Date()
    
    return {
      total_sessions: sessions?.length || 0,
      upcoming_sessions: sessions?.filter(s => new Date(s.start_date) > now).length || 0,
      ongoing_sessions: sessions?.filter(s => 
        new Date(s.start_date) <= now && new Date(s.end_date) >= now
      ).length || 0,
      completed_sessions: sessions?.filter(s => new Date(s.end_date) < now).length || 0
    }
  }

  // Statistiques d'inscription
  private static async getRegistrationStats() {
    const { data: registrations, error } = await supabase
      .from('orders')
      .select('created_at, status')
      .eq('status', 'completed')

    if (error) throw error

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const thisMonth = registrations?.filter(r => 
      new Date(r.created_at) >= startOfMonth
    ).length || 0

    const lastMonth = registrations?.filter(r => 
      new Date(r.created_at) >= startOfLastMonth && 
      new Date(r.created_at) <= endOfLastMonth
    ).length || 0

    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    // Commandes en attente
    const { data: pending, error: pendingError } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'pending')

    return {
      total_registrations: registrations?.length || 0,
      registrations_this_month: thisMonth,
      registrations_growth: Math.round(growth * 100) / 100,
      pending_registrations: pending?.length || 0
    }
  }

  // Statistiques de revenus
  private static async getRevenueStats() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('status', 'completed')

    if (error) throw error

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    
    const thisMonthOrders = orders?.filter(o => new Date(o.created_at) >= startOfMonth) || []
    const revenueThisMonth = thisMonthOrders.reduce((sum, order) => sum + order.total_amount, 0)
    
    const lastMonthOrders = orders?.filter(o => 
      new Date(o.created_at) >= startOfLastMonth && 
      new Date(o.created_at) <= endOfLastMonth
    ) || []
    const revenueLastMonth = lastMonthOrders.reduce((sum, order) => sum + order.total_amount, 0)

    const revenueGrowth = revenueLastMonth > 0 ? 
      ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0

    const averageOrderValue = orders?.length ? totalRevenue / orders.length : 0

    return {
      total_revenue: totalRevenue,
      revenue_this_month: revenueThisMonth,
      revenue_growth: Math.round(revenueGrowth * 100) / 100,
      average_order_value: Math.round(averageOrderValue * 100) / 100
    }
  }

  // Statistiques de satisfaction
  private static async getSatisfactionStats() {
    // Note: Ces tables devront être créées
    const { data: reviews, error } = await supabase
      .from('formation_reviews')
      .select('rating, completion_status')

    if (error) {
      // Si les tables n'existent pas encore, retourner des valeurs par défaut
      return {
        average_rating: 0,
        total_reviews: 0,
        satisfaction_rate: 0,
        completion_rate: 0
      }
    }

    const totalReviews = reviews?.length || 0
    const averageRating = totalReviews > 0 ? 
      reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0
    
    const satisfiedReviews = reviews?.filter(r => r.rating >= 4).length || 0
    const satisfactionRate = totalReviews > 0 ? (satisfiedReviews / totalReviews) * 100 : 0
    
    const completedFormations = reviews?.filter(r => r.completion_status === 'completed').length || 0
    const completionRate = totalReviews > 0 ? (completedFormations / totalReviews) * 100 : 0

    return {
      average_rating: Math.round(averageRating * 100) / 100,
      total_reviews: totalReviews,
      satisfaction_rate: Math.round(satisfactionRate * 100) / 100,
      completion_rate: Math.round(completionRate * 100) / 100
    }
  }

  // Statistiques de performance
  private static async getPerformanceStats() {
    const [popularFormations, recentActivity] = await Promise.all([
      this.getPopularFormations(),
      this.getRecentActivity()
    ])

    // Calcul du taux de conversion (simplifié)
    const { data: visitors } = await supabase
      .from('page_views')
      .select('id')
      .like('page_path', '%/formations%')
    
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'completed')

    const conversionRate = visitors?.length && orders?.length ? 
      (orders.length / visitors.length) * 100 : 0

    return {
      conversion_rate: Math.round(conversionRate * 100) / 100,
      popular_formations: popularFormations,
      recent_activity: recentActivity
    }
  }

  // Formations populaires
  private static async getPopularFormations(): Promise<FormationPopularity[]> {
    const { data, error } = await supabase
      .from('formations')
      .select(`
        id,
        title,
        slug,
        order_items!inner(
          quantity,
          price_at_time,
          order:orders!inner(status)
        )
      `)
      .eq('order_items.order.status', 'completed')
      .limit(5)

    if (error) return []

    return data?.map(formation => {
      const registrations = formation.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
      const revenue = formation.order_items?.reduce((sum, item) => 
        sum + (item.quantity * item.price_at_time), 0) || 0

      return {
        formation_id: formation.id,
        formation_title: formation.title,
        formation_slug: formation.slug,
        total_registrations: registrations,
        revenue: revenue,
        average_rating: 0, // À calculer avec les reviews
        completion_rate: 0 // À calculer avec les reviews
      }
    }).sort((a, b) => b.total_registrations - a.total_registrations) || []
  }

  // Activité récente
  private static async getRecentActivity(): Promise<DashboardActivity[]> {
    const activities: DashboardActivity[] = []

    // Inscriptions récentes
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        user:profiles(first_name, last_name),
        order_items(
          formation_session:formation_sessions(
            formation:formations(title)
          )
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)

    recentOrders?.forEach(order => {
      const userName = order.user ? 
        `${order.user.first_name} ${order.user.last_name}` : 'Utilisateur'
      const formationTitle = order.order_items?.[0]?.formation_session?.formation?.title

      activities.push({
        id: order.id,
        type: 'registration',
        description: `${userName} s'est inscrit`,
        formation_title: formationTitle,
        user_name: userName,
        amount: order.total_amount,
        created_at: order.created_at
      })
    })

    return activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 10)
  }

  // Statistiques mensuelles pour les graphiques
  static async getMonthlyStats(months: number = 12): Promise<MonthlyStats[]> {
    const stats: MonthlyStats[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthKey = monthStart.toISOString().substring(0, 7) // YYYY-MM

      // Inscriptions du mois
      const { data: monthOrders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

      // Nouvelles formations du mois
      const { data: monthFormations } = await supabase
        .from('formations')
        .select('id')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())

      stats.push({
        month: monthKey,
        registrations: monthOrders?.length || 0,
        revenue: monthOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
        new_formations: monthFormations?.length || 0,
        avg_satisfaction: 0 // À calculer avec les reviews
      })
    }

    return stats
  }

  // Récupérer les prochaines sessions de formations
  static async getUpcomingSessions(limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('formation_sessions')
        .select(`
          id,
          start_date,
          end_date,
          location,
          max_participants,
          current_participants,
          formation:formations(
            id,
            title,
            slug,
            price
          )
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('Erreur récupération sessions à venir:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erreur getUpcomingSessions:', error)
      return []
    }
  }

  // Statistiques par formateur
  static async getInstructorStats() {
    const { data, error } = await supabase
      .from('ceprof_experts')
      .select(`
        id,
        name,
        formations:formations(
          id,
          order_items(
            quantity,
            order:orders(status)
          )
        )
      `)

    if (error) return []

    return data?.map(instructor => {
      const totalRegistrations = instructor.formations?.reduce((sum, formation) => {
        return sum + (formation.order_items?.reduce((itemSum, item) => {
          return item.order?.status === 'completed' ? itemSum + item.quantity : itemSum
        }, 0) || 0)
      }, 0) || 0

      return {
        instructor_id: instructor.id,
        instructor_name: instructor.name,
        total_formations: instructor.formations?.length || 0,
        total_registrations: totalRegistrations,
        average_rating: 0 // À calculer avec les reviews
      }
    }).sort((a, b) => b.total_registrations - a.total_registrations) || []
  }
}