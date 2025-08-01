// Types pour le Centre de Ressources - Masterclass ONM

export interface ResourceCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  title: string
  slug: string
  description?: string
  category_id?: string
  category?: ResourceCategory
  type: 'pdf' | 'video' | 'guide' | 'protocol' | 'bibliography' | 'schema' | 'thesis'
  file_url?: string
  thumbnail_url?: string
  tags: string[]
  access_level: 'public' | 'authenticated' | 'certified' | 'premium'
  formation_ids: string[]
  download_count: number
  view_count: number
  is_featured: boolean
  metadata: {
    author?: string
    publication_date?: string
    file_size?: number
    duration?: number // Pour les vidéos
    pages?: number // Pour les PDFs
    [key: string]: any
  }
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ResourceDownload {
  id: string
  resource_id: string
  resource?: Resource
  user_id: string
  downloaded_at: string
  ip_address?: string
  user_agent?: string
}

export interface ResourceFilters {
  category_id?: string
  type?: Resource['type']
  access_level?: Resource['access_level']
  formation_id?: string
  is_featured?: boolean
  tags?: string[]
}

export interface ResourceSearchParams {
  query?: string
  filters?: ResourceFilters
  sort_by?: 'created_at' | 'title' | 'download_count' | 'view_count'
  sort_order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ResourceFormData {
  title: string
  slug?: string
  description?: string
  category_id?: string
  type: Resource['type']
  file_url?: string
  thumbnail_url?: string
  tags?: string[]
  access_level?: Resource['access_level']
  formation_ids?: string[]
  is_featured?: boolean
  metadata?: Resource['metadata']
}

export interface ResourceStats {
  total_downloads: number
  unique_downloaders: number
  downloads_by_day: Array<{
    date: string
    count: number
  }>
  downloads_by_formation: Array<{
    formation_id: string
    formation_title: string
    count: number
  }>
  popular_tags: Array<{
    tag: string
    count: number
  }>
}