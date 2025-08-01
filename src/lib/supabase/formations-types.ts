// Types TypeScript pour l'e-commerce de formations Masterclass ONM

export type ExperienceLevel = 'debutant' | 'intermediaire' | 'avance' | 'expert'
export type FormationStatus = 'draft' | 'active' | 'inactive' | 'archived'
export type SessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial'
export type RegistrationStatus = 'confirmed' | 'attended' | 'absent' | 'cancelled'
export type AttendanceStatus = 'present' | 'absent' | 'partial'
export type QuestionnaireType = 'pre_formation' | 'post_formation' | 'satisfaction'
export type PaymentMethodStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
export type CouponType = 'percentage' | 'fixed_amount'

// =============================================================================
// PROFILS UTILISATEURS
// =============================================================================

export interface Address {
  street: string
  city: string
  postal_code: string
  country: string
  additional_info?: string
  latitude?: number
  longitude?: number
}

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  profession?: string
  experience_level?: ExperienceLevel
  billing_address?: Address
  shipping_address?: Address
  certificates: string[]
  loyalty_points: number
  total_formations_completed: number
  language: string
  newsletter_subscribed: boolean
  notifications_enabled: boolean
  created_at: string
  updated_at: string
}

// =============================================================================
// FORMATEURS
// =============================================================================

export interface Instructor {
  id: string
  name: string
  title?: string
  bio?: string
  specialties: string[]
  photo_url?: string
  linkedin_url?: string
  website_url?: string
  rating: number
  formations_count: number
  total_students: number
  featured: boolean
  active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// =============================================================================
// CEPROF - CERCLE DE SPÉCIALISTES
// =============================================================================

export interface CEPROFMember {
  id: string
  name: string
  title?: string
  profession?: string
  speciality?: string
  bio?: string
  photo_url?: string
  linkedin_url?: string
  website_url?: string
  city?: string
  country?: string
  contributions: string[]
  testimonials?: Record<string, any>
  featured: boolean
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

// =============================================================================
// FORMATIONS
// =============================================================================

export interface Formation {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  duration_days: number
  price: number
  capacity: number
  level?: ExperienceLevel
  module_number?: number
  start_date?: string // Nouvelle propriété
  end_date?: string // Nouvelle propriété
  prerequisites: string[]
  learning_objectives: string[]
  program_details: string[]
  instructor_id?: string
  instructor?: Instructor | string // Peut être un objet ou string
  featured_image?: string
  gallery_images: string[]
  hero_image?: string // Image principale pour la page de détail
  thumbnail_image?: string // Image miniature pour les listes
  video_preview_url?: string // URL de la vidéo de présentation
  brochure_url?: string // URL de la brochure PDF
  seo_title?: string
  seo_description?: string
  seo_keywords: string[]
  status: FormationStatus
  total_sessions: number
  total_registrations: number
  average_rating: number
  created_at: string
  updated_at: string
  // Propriétés additionnelles pour la compatibilité
  duration?: number // en heures
  max_participants?: number
  early_bird_price?: number
  early_bird_deadline?: string
  is_published?: boolean
  image_url?: string
  sessions?: FormationSession[]
  program?: any // Programme détaillé avec objectifs, curriculum, etc.
  // Nouveaux champs pour les informations pratiques
  venue_name?: string
  venue_address?: string
  venue_details?: string
  start_time?: string
  end_time?: string
  schedule_details?: string
  included_services?: string[]
}

// =============================================================================
// SESSIONS DE FORMATIONS
// =============================================================================

export interface FormationSession {
  id: string
  formation_id: string
  formation?: Formation
  start_date: string
  end_date: string
  city: string
  venue_name?: string
  venue_address?: Address
  available_spots: number
  total_spots: number
  price_override?: number
  status: SessionStatus
  practical_info?: string
  materials_included: string[]
  created_at: string
  updated_at: string
}

// =============================================================================
// PANIER
// =============================================================================

export interface Cart {
  id: string
  user_id?: string
  session_id?: string
  expires_at: string
  created_at: string
  updated_at: string
  items?: CartItem[]
}

export interface CartItem {
  id: string
  cart_id: string
  session_id: string
  session?: FormationSession
  quantity: number
  price_at_time: number
  added_at: string
}

// =============================================================================
// COMMANDES
// =============================================================================

export interface Order {
  id: string
  user_id: string
  user?: UserProfile
  order_number: string
  subtotal_amount: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  status: OrderStatus
  payment_status: PaymentStatus
  billing_address: Address
  shipping_address?: Address
  notes?: string
  coupon_code?: string
  payment_date?: string
  shipped_date?: string
  completed_date?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  session_id: string
  session?: FormationSession
  formation_title: string
  formation_dates: string
  quantity: number
  unit_price: number
  total_price: number
}

// =============================================================================
// INSCRIPTIONS
// =============================================================================

export interface Registration {
  id: string
  user_id: string
  user?: UserProfile
  order_id: string
  order?: Order
  session_id: string
  session?: FormationSession
  status: RegistrationStatus
  attendance_status?: AttendanceStatus
  attendance_percentage?: number
  certificate_issued: boolean
  certificate_url?: string
  certificate_date?: string
  instructor_notes?: string
  final_score?: number
  created_at: string
  updated_at: string
}

// =============================================================================
// QUESTIONNAIRES
// =============================================================================

export interface QuestionnaireQuestion {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating'
  question: string
  options?: string[]
  required: boolean
  description?: string
}

export interface Questionnaire {
  id: string
  formation_id?: string
  formation?: Formation
  type: QuestionnaireType
  title: string
  description?: string
  questions: QuestionnaireQuestion[]
  is_required: boolean
  active: boolean
  created_at: string
}

export interface QuestionnaireResponse {
  id: string
  user_id: string
  user?: UserProfile
  registration_id?: string
  registration?: Registration
  questionnaire_id: string
  questionnaire?: Questionnaire
  responses: Record<string, any>
  score?: number
  submitted_at: string
}

// =============================================================================
// PAIEMENTS
// =============================================================================

export interface Payment {
  id: string
  order_id: string
  order?: Order
  amount: number
  currency: string
  lcl_transaction_id?: string
  lcl_payment_id?: string
  lcl_response?: Record<string, any>
  status: PaymentMethodStatus
  payment_method?: string
  three_d_secure_status?: string
  processed_at?: string
  failed_at?: string
  refunded_at?: string
  failure_reason?: string
  failure_code?: string
  created_at: string
  updated_at: string
}

// =============================================================================
// AVIS & ÉVALUATIONS
// =============================================================================

export interface Review {
  id: string
  user_id: string
  user?: UserProfile
  formation_id: string
  formation?: Formation
  registration_id?: string
  registration?: Registration
  rating: number
  comment?: string
  content_rating?: number
  instructor_rating?: number
  organization_rating?: number
  venue_rating?: number
  verified_purchase: boolean
  moderated: boolean
  approved: boolean
  helpful_count: number
  unhelpful_count: number
  created_at: string
  updated_at: string
}

// =============================================================================
// COUPONS & PROMOTIONS
// =============================================================================

export interface Coupon {
  id: string
  code: string
  name?: string
  description?: string
  type: CouponType
  value: number
  min_amount?: number
  max_discount?: number
  max_uses?: number
  used_count: number
  max_uses_per_user: number
  applicable_formations?: string[]
  applicable_categories?: string[]
  first_time_only: boolean
  starts_at: string
  expires_at?: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface CouponUse {
  id: string
  coupon_id: string
  coupon?: Coupon
  user_id: string
  user?: UserProfile
  order_id: string
  order?: Order
  discount_amount: number
  used_at: string
}

// =============================================================================
// TYPES D'AIDE POUR FILTRES & RECHERCHE
// =============================================================================

export interface FormationFilters {
  city?: string
  level?: ExperienceLevel
  instructor_id?: string
  min_price?: number
  max_price?: number
  start_date_from?: string
  start_date_to?: string
  available_spots_min?: number
  status?: SessionStatus[]
}

export interface FormationSearchParams {
  query?: string
  filters?: FormationFilters
  sort_by?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc' | 'rating_desc' | 'popularity_desc'
  page?: number
  limit?: number
}

// =============================================================================
// TYPES POUR L'ADMIN
// =============================================================================

export interface AdminStats {
  total_formations: number
  total_sessions: number
  total_registrations: number
  total_revenue: number
  pending_orders: number
  active_users: number
  average_rating: number
  completion_rate: number
}

export interface SessionAnalytics {
  session_id: string
  formation_title: string
  city: string
  date: string
  registrations_count: number
  attendance_rate: number
  satisfaction_average: number
  revenue: number
}

// =============================================================================
// TYPES POUR LES FORMULAIRES
// =============================================================================

export interface FormationFormData {
  title: string
  slug: string
  description?: string
  short_description?: string
  duration_days: number
  price: number
  capacity: number
  level?: ExperienceLevel
  module_number?: number
  prerequisites: string[]
  learning_objectives: string[]
  program_details: string[]
  instructor_id?: string
  featured_image?: string
  gallery_images: string[]
  hero_image?: string
  thumbnail_image?: string
  video_preview_url?: string
  brochure_url?: string
  seo_title?: string
  seo_description?: string
  seo_keywords: string[]
  status: FormationStatus
}

export interface SessionFormData {
  formation_id: string
  start_date: string
  end_date: string
  city: string
  venue_name?: string
  venue_address?: Address
  total_spots: number
  price_override?: number
  practical_info?: string
  materials_included: string[]
}

export interface OrderFormData {
  billing_address: Address
  shipping_address?: Address
  notes?: string
  coupon_code?: string
}

// =============================================================================
// TYPES POUR API RESPONSES
// =============================================================================

export interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

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

// =============================================================================
// TYPES UTILITAIRES
// =============================================================================

export type DatabaseTables = {
  user_profiles: UserProfile
  instructors: Instructor
  ceprof_members: CEPROFMember
  formations: Formation
  formation_sessions: FormationSession
  carts: Cart
  cart_items: CartItem
  orders: Order
  order_items: OrderItem
  registrations: Registration
  questionnaires: Questionnaire
  questionnaire_responses: QuestionnaireResponse
  payments: Payment
  reviews: Review
  coupons: Coupon
  coupon_uses: CouponUse
}

export type TableName = keyof DatabaseTables