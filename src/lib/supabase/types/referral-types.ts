// Types pour le Système de Parrainage - Masterclass ONM

export interface Referral {
  id: string
  referrer_id: string
  referral_token: string
  referee_email: string
  referee_name?: string
  personal_message?: string
  status: 'pending' | 'clicked' | 'registered' | 'converted' | 'expired'
  clicked_at?: string
  registered_at?: string
  converted_at?: string
  formation_id?: string
  formation?: {
    id: string
    title: string
    slug: string
    price: number
  }
  rewards: {
    badge_earned?: boolean
    discount_amount?: number
    credit_amount?: number
    gift_details?: string
  }
  created_at: string
  expires_at: string
}

export interface ReferralReward {
  id: string
  referrer_id: string
  referral_id: string
  referral?: Referral
  type: 'badge' | 'discount' | 'credit' | 'gift'
  value: {
    badge_id?: string
    discount_percent?: number
    discount_amount?: number
    credit_amount?: number
    gift_name?: string
    gift_description?: string
    [key: string]: any
  }
  status: 'pending' | 'granted' | 'used' | 'expired'
  granted_at?: string
  used_at?: string
  expires_at?: string
  created_at: string
}

export interface ReferralProgram {
  name: string
  description: string
  rules: {
    min_purchase_amount?: number
    eligible_formations?: string[]
    max_referrals_per_user?: number
    reward_after_conversions: number
  }
  rewards: {
    referrer: {
      type: ReferralReward['type']
      value: any
    }
    referee: {
      type: ReferralReward['type']
      value: any
    }
  }
  is_active: boolean
}

export interface ReferralStats {
  total_sent: number
  total_clicked: number
  total_registered: number
  total_converted: number
  conversion_rate: number
  total_rewards_earned: number
  rewards_by_type: Array<{
    type: ReferralReward['type']
    count: number
    total_value: number
  }>
  top_referrers: Array<{
    user_id: string
    user_name: string
    referral_count: number
    conversion_count: number
  }>
}

export interface CreateReferralData {
  referee_email: string
  referee_name?: string
  personal_message?: string
  formation_id?: string
}

export interface ReferralEmailData {
  referrer_name: string
  referee_name?: string
  personal_message?: string
  formation_title?: string
  referral_link: string
  reward_description: string
}