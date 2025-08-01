// Types pour les Podcasts & Interviews - Masterclass ONM

export interface PodcastEpisode {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  episode_number?: number
  season?: number
  type: 'podcast' | 'interview' | 'webinar'
  guest_name?: string
  guest_title?: string
  guest_bio?: string
  guest_photo_url?: string
  audio_url?: string
  video_url?: string
  embed_code?: string // Pour YouTube, Spotify, etc.
  duration?: number // En secondes
  transcript?: string
  tags: string[]
  topics: string[]
  ceprof_expert_id?: string
  ceprof_expert?: {
    id: string
    name: string
    title: string
    photo_url: string
  }
  thumbnail_url?: string
  is_featured: boolean
  published_at?: string
  view_count: number
  like_count: number
  share_count: number
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
}

export interface PodcastFilters {
  type?: PodcastEpisode['type']
  season?: number
  ceprof_expert_id?: string
  tags?: string[]
  topics?: string[]
  status?: PodcastEpisode['status']
  is_featured?: boolean
}

export interface PodcastSearchParams {
  query?: string
  filters?: PodcastFilters
  sort_by?: 'published_at' | 'episode_number' | 'view_count' | 'like_count'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface PodcastFormData {
  title: string
  slug?: string
  description?: string
  short_description?: string
  episode_number?: number
  season?: number
  type: PodcastEpisode['type']
  guest_name?: string
  guest_title?: string
  guest_bio?: string
  guest_photo_url?: string
  audio_url?: string
  video_url?: string
  embed_code?: string
  duration?: number
  transcript?: string
  tags?: string[]
  topics?: string[]
  ceprof_expert_id?: string
  thumbnail_url?: string
  is_featured?: boolean
  published_at?: string
  status?: PodcastEpisode['status']
}

export interface PodcastEngagement {
  episode_id: string
  user_id: string
  has_liked: boolean
  has_shared: boolean
  listen_progress?: number // Pourcentage écouté
  last_position?: number // Position en secondes
  completed: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface PodcastStats {
  total_episodes: number
  total_duration: number
  total_views: number
  total_likes: number
  total_shares: number
  average_completion_rate: number
  popular_topics: Array<{
    topic: string
    count: number
  }>
  engagement_by_type: {
    podcast: number
    interview: number
    webinar: number
  }
  top_episodes: Array<{
    id: string
    title: string
    view_count: number
    like_count: number
  }>
}