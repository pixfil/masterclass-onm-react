// Index des types pour toutes les nouvelles fonctionnalités - Masterclass ONM

// Export de tous les types
export * from './resources-types'
export * from './referral-types'
export * from './podcast-types'
export * from './activity-types'
export * from './badge-types'
export * from './article-types'
export * from './journey-types'

// Types communs et utilitaires
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
  success: boolean
  message?: string
}

export interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: any
}

export interface BatchOperationResult {
  successful: number
  failed: number
  errors: Array<{
    id: string
    error: string
  }>
}

export interface ImportExportData {
  format: 'json' | 'csv' | 'xlsx'
  data: any
  metadata?: {
    exported_at: string
    exported_by: string
    version: string
    filters_applied?: any
  }
}

export interface DashboardStats {
  resources: {
    total: number
    by_type: Record<string, number>
    downloads_today: number
    popular_this_week: Array<{id: string, title: string, downloads: number}>
  }
  referrals: {
    total_sent: number
    conversion_rate: number
    active_campaigns: number
    top_referrers: Array<{user_id: string, count: number}>
  }
  podcasts: {
    total_episodes: number
    total_duration_hours: number
    average_completion_rate: number
    trending_episodes: Array<{id: string, title: string, views: number}>
  }
  badges: {
    total_earned: number
    unique_earners: number
    most_earned: Array<{badge_id: string, name: string, count: number}>
    recent_achievements: Array<{user_id: string, badge_id: string, earned_at: string}>
  }
  activity: {
    active_users_today: number
    active_users_week: number
    most_common_actions: Array<{action: string, count: number}>
    peak_hours: Array<{hour: number, activity_count: number}>
  }
  content: {
    total_articles: number
    total_lexicon_entries: number
    content_engagement_rate: number
    popular_topics: Array<{topic: string, count: number}>
  }
}

// Types pour les permissions et accès
export interface AccessControl {
  resource_type: string
  resource_id?: string
  user_id?: string
  role?: string
  permissions: {
    read: boolean
    write: boolean
    delete: boolean
    share: boolean
    download?: boolean
  }
  conditions?: {
    time_based?: {
      start_date?: string
      end_date?: string
    }
    formation_based?: {
      required_formations: string[]
    }
    badge_based?: {
      required_badges: string[]
    }
  }
}

// Types pour la recherche globale
export interface GlobalSearchResult {
  type: 'formation' | 'resource' | 'article' | 'podcast' | 'lexicon' | 'expert'
  id: string
  title: string
  description?: string
  url: string
  thumbnail?: string
  relevance_score: number
  highlights?: Array<{
    field: string
    snippet: string
  }>
}

export interface GlobalSearchParams {
  query: string
  types?: GlobalSearchResult['type'][]
  filters?: {
    date_from?: string
    date_to?: string
    tags?: string[]
    access_level?: string[]
  }
  limit?: number
  offset?: number
}