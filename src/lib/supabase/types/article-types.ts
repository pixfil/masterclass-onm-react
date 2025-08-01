// Types pour les Articles & Cas Cliniques - Masterclass ONM

export interface Article {
  id: string
  title: string
  slug: string
  subtitle?: string
  content: string
  excerpt?: string
  type: 'article' | 'case_study' | 'research' | 'guide'
  author_id?: string
  author?: {
    id: string
    name: string
    title: string
    photo_url?: string
  }
  co_authors?: Array<{
    name: string
    title?: string
    institution?: string
  }>
  category?: string
  tags: string[]
  featured_image_url?: string
  gallery_images?: Array<{
    url: string
    caption?: string
    order: number
  }>
  attachments?: Array<{
    name: string
    url: string
    type: string
    size: number
  }>
  related_formations?: string[]
  related_resources?: string[]
  is_featured: boolean
  is_public: boolean
  published_at?: string
  view_count: number
  like_count: number
  share_count: number
  reading_time?: number // En minutes
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  status: 'draft' | 'review' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface ArticleFilters {
  type?: Article['type']
  author_id?: string
  category?: string
  tags?: string[]
  status?: Article['status']
  is_featured?: boolean
  is_public?: boolean
  published_after?: string
  published_before?: string
}

export interface ArticleSearchParams {
  query?: string
  filters?: ArticleFilters
  sort_by?: 'published_at' | 'view_count' | 'like_count' | 'reading_time'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ArticleFormData {
  title: string
  slug?: string
  subtitle?: string
  content: string
  excerpt?: string
  type: Article['type']
  author_id?: string
  co_authors?: Article['co_authors']
  category?: string
  tags?: string[]
  featured_image_url?: string
  gallery_images?: Article['gallery_images']
  attachments?: Article['attachments']
  related_formations?: string[]
  related_resources?: string[]
  is_featured?: boolean
  is_public?: boolean
  published_at?: string
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  status?: Article['status']
}

export interface CaseStudyData extends ArticleFormData {
  patient_info?: {
    age?: number
    gender?: string
    chief_complaint?: string
    medical_history?: string[]
  }
  diagnosis?: {
    initial?: string
    differential?: string[]
    final?: string
    imaging?: Array<{
      type: string
      url: string
      caption: string
    }>
  }
  treatment?: {
    plan?: string
    duration?: string
    techniques?: string[]
    materials?: string[]
    challenges?: string[]
  }
  results?: {
    outcome?: string
    follow_up?: string
    patient_satisfaction?: string
    images?: Array<{
      type: 'before' | 'during' | 'after'
      url: string
      caption: string
    }>
  }
  key_takeaways?: string[]
  references?: Array<{
    authors: string
    title: string
    journal?: string
    year?: number
    doi?: string
  }>
}

export interface ArticleEngagement {
  article_id: string
  user_id: string
  has_liked: boolean
  has_shared: boolean
  reading_progress?: number
  time_spent_seconds?: number
  highlights?: Array<{
    text: string
    position: number
    note?: string
  }>
  bookmarked: boolean
  created_at: string
  updated_at: string
}