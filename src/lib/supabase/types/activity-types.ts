// Types pour le Journal d'Activité - Masterclass ONM

export type UserActionType = 
  | 'login'
  | 'logout'
  | 'view_formation'
  | 'download_resource'
  | 'complete_quiz'
  | 'send_referral'
  | 'update_profile'
  | 'view_certificate'
  | 'watch_video'
  | 'read_article'
  | 'listen_podcast'
  | 'submit_case'
  | 'earn_badge'

export interface UserActivityLog {
  id: string
  user_id: string
  action_type: UserActionType
  action_details: {
    entity_name?: string
    entity_url?: string
    duration?: number
    progress?: number
    result?: string
    metadata?: Record<string, any>
  }
  entity_type?: string
  entity_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface AdminActivityLog {
  id: string
  admin_id: string
  action_type: string
  action_details: {
    action_name: string
    action_description?: string
    before_state?: any
    after_state?: any
    reason?: string
  }
  affected_user_id?: string
  affected_entity_type?: string
  affected_entity_id?: string
  ip_address?: string
  created_at: string
}

export interface ActivitySummary {
  user_id: string
  period: 'day' | 'week' | 'month' | 'year'
  start_date: string
  end_date: string
  total_actions: number
  actions_by_type: Record<UserActionType, number>
  most_active_day: string
  most_active_hour: number
  formations_viewed: number
  resources_downloaded: number
  videos_watched: number
  podcasts_listened: number
  badges_earned: number
  referrals_sent: number
  learning_time_minutes: number
}

export interface UserDocument {
  id: string
  user_id: string
  formation_id?: string
  formation?: {
    id: string
    title: string
    slug: string
  }
  resource_id?: string
  resource?: {
    id: string
    title: string
    type: string
  }
  title: string
  type?: string
  file_url?: string
  is_read: boolean
  read_at?: string
  is_downloaded: boolean
  downloaded_at?: string
  unlock_condition?: {
    type: 'quiz_score' | 'completion' | 'date' | 'manual'
    value?: any
    description?: string
  }
  is_unlocked: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface UserDocumentFilters {
  formation_id?: string
  resource_id?: string
  is_read?: boolean
  is_downloaded?: boolean
  is_unlocked?: boolean
  type?: string
}

export interface ActivityFilters {
  user_id?: string
  action_type?: UserActionType
  entity_type?: string
  entity_id?: string
  date_from?: string
  date_to?: string
}

export interface ActivitySearchParams {
  filters?: ActivityFilters
  sort_by?: 'created_at'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}