// Types pour le Parcours & Gamification - Masterclass ONM

export type JourneyStepType = 
  | 'inscription'
  | 'preparation'
  | 'formation'
  | 'evaluation'
  | 'certification'
  | 'specialization'
  | 'expertise'

export interface UserJourneyStep {
  id: string
  user_id: string
  step_type: JourneyStepType
  step_name: string
  step_order: number
  status: 'locked' | 'current' | 'completed'
  started_at?: string
  completed_at?: string
  progress_percentage: number
  requirements_met?: {
    formations_completed?: string[]
    quizzes_passed?: string[]
    badges_earned?: string[]
    score_achieved?: number
    time_spent?: number
  }
  unlocked_content?: Array<{
    type: 'resource' | 'formation' | 'badge' | 'feature'
    id: string
    name: string
  }>
  created_at: string
  updated_at: string
}

export interface JourneyMilestone {
  id: string
  name: string
  description: string
  icon_url?: string
  step_type: JourneyStepType
  requirements: {
    min_formations?: number
    specific_formations?: string[]
    min_score?: number
    min_badges?: number
    custom?: string
  }
  rewards: {
    badge_id?: string
    certificate?: boolean
    unlock_features?: string[]
    discount_percent?: number
  }
  order_index: number
  is_active: boolean
}

export interface UserProgress {
  user_id: string
  current_step: JourneyStepType
  overall_progress: number
  formations_completed: number
  total_formations: number
  badges_earned: number
  certificates_earned: number
  points_earned: number
  rank?: {
    current: string
    next: string
    progress_to_next: number
  }
  achievements: Array<{
    type: string
    name: string
    earned_at: string
  }>
  next_objectives: Array<{
    type: string
    description: string
    progress: number
    target: number
  }>
}

// Types pour les Tags Dynamiques

export type TagType = 
  | 'behavior'
  | 'progression'
  | 'engagement'
  | 'expertise'
  | 'referral'
  | 'satisfaction'
  | 'custom'

export interface UserTag {
  id: string
  user_id: string
  tag_type: TagType
  tag_name: string
  tag_value?: string
  auto_generated: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface TagRule {
  id: string
  name: string
  description: string
  tag_type: TagType
  tag_name: string
  conditions: {
    event_type?: string
    event_count?: number
    time_period?: string
    custom_logic?: string
  }
  is_active: boolean
  priority: number
}

// Types pour les Notifications Enrichies

export interface UserNotification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  action_url?: string
  action_label?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  category?: string
  metadata?: {
    entity_type?: string
    entity_id?: string
    entity_name?: string
    image_url?: string
    custom_data?: Record<string, any>
  }
  is_read: boolean
  read_at?: string
  is_archived: boolean
  archived_at?: string
  expires_at?: string
  created_at: string
}

export interface NotificationTemplate {
  id: string
  name: string
  type: string
  category?: string
  title_template: string
  message_template: string
  variables: string[]
  priority: UserNotification['priority']
  action_config?: {
    url_template?: string
    label?: string
  }
  is_active: boolean
}

export interface NotificationPreferences {
  user_id: string
  email_enabled: boolean
  push_enabled: boolean
  sms_enabled: boolean
  categories: Record<string, {
    email: boolean
    push: boolean
    sms: boolean
  }>
  quiet_hours?: {
    enabled: boolean
    start_time: string // HH:MM
    end_time: string // HH:MM
    timezone: string
  }
  frequency?: 'immediate' | 'hourly' | 'daily' | 'weekly'
}