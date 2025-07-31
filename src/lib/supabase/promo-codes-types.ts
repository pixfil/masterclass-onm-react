export interface PromoCode {
  id: string
  code: string
  name: string
  description?: string
  
  // Type de remise
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping'
  discount_value: number
  
  // Conditions d'application
  minimum_order_amount?: number
  maximum_discount_amount?: number
  
  // Restrictions produits
  applicable_formations?: string[] // IDs des formations
  excluded_formations?: string[] // IDs des formations exclues
  applicable_categories?: string[] // IDs des catégories
  excluded_categories?: string[] // IDs des catégories exclues
  
  // Restrictions utilisateurs
  applicable_users?: string[] // IDs utilisateurs spécifiques
  excluded_users?: string[] // IDs utilisateurs exclus
  user_role_restrictions?: ('all' | 'new_customers' | 'returning_customers' | 'vip')[]
  
  // Limites d'utilisation
  usage_limit?: number // Limite globale
  usage_limit_per_user?: number // Limite par utilisateur
  current_usage: number // Utilisation actuelle
  
  // Conditions temporelles
  valid_from: string
  valid_until?: string
  
  // Conditions spéciales
  first_order_only: boolean // Seulement première commande
  auto_apply: boolean // Application automatique
  stackable: boolean // Cumulable avec d'autres codes
  
  // Conditions géographiques
  applicable_countries?: string[] // Codes pays ISO
  excluded_countries?: string[] // Codes pays exclus
  
  // Statut et méta
  status: 'active' | 'inactive' | 'expired' | 'draft'
  created_at: string
  updated_at: string
  created_by: string
  
  // Analytics
  analytics?: {
    total_usage: number
    total_discount_given: number
    conversion_rate: number
    avg_order_value: number
  }
}

export interface PromoCodeUsage {
  id: string
  promo_code_id: string
  user_id: string
  order_id: string
  discount_applied: number
  used_at: string
}

export interface PromoCodeValidation {
  valid: boolean
  error?: string
  discount_amount?: number
  final_total?: number
  applied_code?: PromoCode
}

export interface CreatePromoCodeData {
  code: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping'
  discount_value: number
  minimum_order_amount?: number
  maximum_discount_amount?: number
  applicable_formations?: string[]
  excluded_formations?: string[]
  applicable_categories?: string[]
  excluded_categories?: string[]
  applicable_users?: string[]
  excluded_users?: string[]
  user_role_restrictions?: ('all' | 'new_customers' | 'returning_customers' | 'vip')[]
  usage_limit?: number
  usage_limit_per_user?: number
  valid_from: string
  valid_until?: string
  first_order_only: boolean
  auto_apply: boolean
  stackable: boolean
  applicable_countries?: string[]
  excluded_countries?: string[]
  status: 'active' | 'inactive' | 'expired' | 'draft'
}

export interface PromoCodeFilters {
  status?: 'active' | 'inactive' | 'expired' | 'draft'
  discount_type?: 'percentage' | 'fixed_amount' | 'free_shipping'
  search?: string
  valid_only?: boolean
  limit?: number
  offset?: number
}