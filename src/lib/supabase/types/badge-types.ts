// Types pour les Badges & Certifications - Masterclass ONM

export interface BadgeType {
  id: string
  name: string
  slug: string
  description?: string
  icon_url?: string
  criteria: {
    type: 'complete_formation' | 'complete_all_formations' | 'referrals' | 'share_case' | 'quiz_score' | 'custom'
    count?: number
    formation_ids?: string[]
    min_score?: number
    custom_logic?: string
  }
  category: 'formation' | 'community' | 'expertise' | 'engagement'
  level: number // 1-5
  points: number
  is_active: boolean
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_type_id: string
  badge_type?: BadgeType
  earned_at: string
  export_url?: string // URL du badge exportable
  qr_code_url?: string // QR code du badge
  share_token?: string // Token pour partage public
  metadata?: {
    formation_completed?: string
    quiz_score?: number
    referral_count?: number
    achievement_details?: string
  }
}

export interface BadgeProgress {
  user_id: string
  badge_type_id: string
  badge_type?: BadgeType
  current_progress: number
  required_progress: number
  percentage: number
  is_completed: boolean
  estimated_completion?: string
  next_steps?: string[]
}

export interface BadgeStats {
  total_badges_earned: number
  total_points: number
  badges_by_category: Record<BadgeType['category'], number>
  badges_by_level: Record<number, number>
  recent_badges: UserBadge[]
  next_badges: BadgeProgress[]
  ranking?: {
    position: number
    total_users: number
    percentile: number
  }
}

export interface BadgeShareData {
  badge_id: string
  user_name: string
  badge_name: string
  badge_description: string
  earned_date: string
  verification_url: string
  qr_code_data: string
}

// Types pour le Lexique ONM

export interface LexiconEntry {
  id: string
  term: string
  slug: string
  definition: string
  category?: string
  related_terms?: string[]
  related_formations?: string[]
  related_resources?: string[]
  illustrations?: Array<{
    url: string
    caption?: string
    type: 'image' | 'diagram' | 'video'
  }>
  pronunciation?: string
  etymology?: string
  clinical_relevance?: string
  is_featured: boolean
  view_count: number
  created_by?: string
  reviewed_by?: string
  created_at: string
  updated_at: string
}

export interface LexiconFilters {
  category?: string
  starts_with?: string
  related_formation?: string
  is_featured?: boolean
}

export interface LexiconSearchParams {
  query?: string
  filters?: LexiconFilters
  sort_by?: 'term' | 'created_at' | 'view_count'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}