import { supabase } from '@/lib/supabaseClient'
import { Property, PropertyInsert, PropertyUpdate, PropertyImage, AgentImmobilier } from './types'

// Type étendu avec images pour le front-end
export interface PropertyWithImages extends Property {
  property_images?: PropertyImage[]
  gallery_images?: string[]
}

// Type étendu avec images et agent
export interface PropertyWithImagesAndAgent extends PropertyWithImages {
  agent?: AgentImmobilier | null
  property_amenities?: Array<{
    id: string
    amenity_type: string
    amenity_name: string
    amenity_value: string | null
  }>
  property_labels?: Array<{
    label: string
  }>
}

// Récupérer toutes les propriétés (pour admin sans filtre published)
export async function getAllProperties(filters?: {
  property_type?: string
  transaction_type?: string
  city?: string
  min_price?: number
  max_price?: number
  limit?: number
  offset?: number
  include_deleted?: boolean
}) {
  let query = supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  // Par défaut, exclure les propriétés supprimées
  if (!filters?.include_deleted) {
    query = query.is('deleted_at', null)
  }

  if (filters?.property_type) {
    query = query.eq('property_type', filters.property_type)
  }
  if (filters?.transaction_type) {
    query = query.eq('transaction_type', filters.transaction_type)
  }
  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }
  if (filters?.min_price) {
    query = query.gte('price', filters.min_price)
  }
  if (filters?.max_price) {
    query = query.lte('price', filters.max_price)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  return data as Property[]
}

// Récupérer toutes les propriétés publiées avec images
export async function getProperties(filters?: {
  property_type?: string
  transaction_type?: string
  city?: string
  min_price?: number
  max_price?: number
  limit?: number
  offset?: number
}): Promise<PropertyWithImages[]> {
  let query = supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        image_order,
        alt_text,
        is_featured
      ),
      property_amenities (
        id,
        amenity_type,
        amenity_name,
        amenity_value
      )
    `)
    .eq('published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filters?.property_type) {
    query = query.eq('property_type', filters.property_type)
  }
  if (filters?.transaction_type) {
    query = query.eq('transaction_type', filters.transaction_type)
  }
  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`)
  }
  if (filters?.min_price) {
    query = query.gte('price', filters.min_price)
  }
  if (filters?.max_price) {
    query = query.lte('price', filters.max_price)
  }
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  // Transformer les données pour inclure gallery_images
  return data.map(property => ({
    ...property,
    property_images: property.property_images?.sort((a, b) => a.image_order - b.image_order) || [],
    gallery_images: property.property_images?.sort((a, b) => a.image_order - b.image_order).map(img => img.image_url) || []
  })) as PropertyWithImages[]
}

// Récupérer une propriété par son ID avec images
export async function getPropertyById(id: string): Promise<PropertyWithImages | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        image_order,
        alt_text,
        is_featured
      )
    `)
    .eq('id', id)
    .eq('published', true)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching property:', error)
    return null
  }

  // Incrémenter le compteur de vues
  await supabase
    .from('properties')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', id)

  // Transformer les données
  return {
    ...data,
    property_images: data.property_images?.sort((a, b) => a.image_order - b.image_order) || [],
    gallery_images: data.property_images?.sort((a, b) => a.image_order - b.image_order).map(img => img.image_url) || []
  } as PropertyWithImages
}

// Récupérer une propriété par son slug avec images et agent
export async function getPropertyBySlug(slug: string): Promise<PropertyWithImagesAndAgent | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        image_order,
        alt_text,
        is_featured
      ),
      property_amenities (
        id,
        amenity_type,
        amenity_name,
        amenity_value
      ),
      property_labels!property_labels_property_id_fkey (
        label
      ),
      agent:agents_immobiliers (
        id,
        prenom,
        nom,
        email,
        telephone,
        photo_agent,
        description_agent,
        specialites,
        est_super_agent,
        est_verifie,
        note_moyenne,
        nombre_avis_agent,
        nombre_proprietes_gerees,
        taux_reponse,
        temps_reponse_moyen,
        date_embauche,
        annees_experience
      )
    `)
    .eq('slug', slug)
    .eq('published', true)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching property by slug:', error)
    return null
  }

  // Incrémenter le compteur de vues
  await supabase
    .from('properties')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', data.id)

  // Transformer les données
  return {
    ...data,
    property_images: data.property_images?.sort((a, b) => a.image_order - b.image_order) || [],
    gallery_images: data.property_images?.sort((a, b) => a.image_order - b.image_order).map(img => img.image_url) || [],
    agent: data.agent || null
  } as PropertyWithImagesAndAgent
}

// Récupérer une propriété par son ID (pour admin et rétrocompatibilité)
export async function getPropertyByIdAdmin(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching property by ID:', error)
    return null
  }

  return data as Property
}

// Récupérer les propriétés en vedette avec images
export async function getFeaturedProperties(limit: number = 6): Promise<PropertyWithImages[]> {
  // D'abord essayer de récupérer les propriétés marquées en vedette
  let { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        image_order,
        alt_text,
        is_featured
      )
    `)
    .eq('is_featured', true)
    .eq('published', true)
    .eq('status', 'disponible')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching featured properties:', error)
    return []
  }

  // Si on n'a pas assez de propriétés en vedette, compléter avec les propriétés récentes
  if (data.length < limit) {
    const { data: recentData, error: recentError } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          image_url,
          image_order,
          alt_text,
          is_featured
        )
      `)
      .eq('published', true)
      .eq('status', 'disponible')
      .is('deleted_at', null)
      .not('id', 'in', `(${data.map(p => p.id).join(',') || 'null'})`)
      .order('views_count', { ascending: false })
      .limit(limit - data.length)

    if (!recentError && recentData) {
      data = [...data, ...recentData]
    }
  }

  // Transformer les données
  const result = data.map(property => ({
    ...property,
    property_images: property.property_images?.sort((a, b) => a.image_order - b.image_order) || [],
    gallery_images: property.property_images?.sort((a, b) => a.image_order - b.image_order).map(img => img.image_url) || []
  })) as PropertyWithImages[]
  
  console.log(`getFeaturedProperties: returning ${result.length} properties`)
  result.forEach(p => console.log(`- ${p.title} (${p.gallery_images?.length || 0} images)`))
  
  return result
}

// Récupérer toutes les propriétés publiées avec images pour la section par ville
export async function getPublishedPropertiesWithImages(limit: number = 20): Promise<PropertyWithImages[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images (
        id,
        image_url,
        image_order,
        alt_text,
        is_featured
      )
    `)
    .eq('published', true)
    .eq('status', 'disponible')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching published properties:', error)
    return []
  }

  // Transformer les données
  const result = data.map(property => ({
    ...property,
    property_images: property.property_images?.sort((a, b) => a.image_order - b.image_order) || [],
    gallery_images: property.property_images?.sort((a, b) => a.image_order - b.image_order).map(img => img.image_url) || []
  })) as PropertyWithImages[]
  
  console.log(`getPublishedPropertiesWithImages: returning ${result.length} properties`)
  
  return result
}

// Récupérer les propriétés similaires
export async function getSimilarProperties(property: Property, limit: number = 4) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('published', true)
    .eq('property_type', property.property_type)
    .eq('transaction_type', property.transaction_type)
    .neq('id', property.id)
    .is('deleted_at', null)
    .gte('price', property.price * 0.8)
    .lte('price', property.price * 1.2)
    .limit(limit)

  if (error) {
    console.error('Error fetching similar properties:', error)
    return []
  }

  return data as Property[]
}

// Récupérer les statistiques
export async function getPropertyStatistics() {
  try {
    // Récupérer toutes les propriétés publiées
    const { data: properties, error } = await supabase
      .from('properties')
      .select('transaction_type, status, published')

    if (error) {
      console.error('Error fetching properties for stats:', error)
      return null
    }

    // Calculer les statistiques
    const publishedProperties = properties.filter(p => p.published)
    
    const stats = {
      total_properties: publishedProperties.length,
      for_sale: publishedProperties.filter(p => p.transaction_type === 'vente').length,
      for_rent: publishedProperties.filter(p => p.transaction_type === 'location').length,
      available: publishedProperties.filter(p => p.status === 'disponible').length
    }

    return stats
  } catch (error) {
    console.error('Error calculating statistics:', error)
    return null
  }
}

// Recherche de propriétés avec coordonnées géographiques
export async function searchPropertiesInArea(
  lat: number,
  lng: number,
  radiusKm: number = 10,
  filters?: {
    property_type?: string
    transaction_type?: string
    min_price?: number
    max_price?: number
  }
) {
  // Calcul approximatif des limites de la zone de recherche
  const latDelta = radiusKm / 111 // 1 degré de latitude ≈ 111 km
  const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180))

  let query = supabase
    .from('properties')
    .select('*')
    .eq('published', true)
    .gte('latitude', lat - latDelta)
    .lte('latitude', lat + latDelta)
    .gte('longitude', lng - lngDelta)
    .lte('longitude', lng + lngDelta)

  if (filters?.property_type) {
    query = query.eq('property_type', filters.property_type)
  }
  if (filters?.transaction_type) {
    query = query.eq('transaction_type', filters.transaction_type)
  }
  if (filters?.min_price) {
    query = query.gte('price', filters.min_price)
  }
  if (filters?.max_price) {
    query = query.lte('price', filters.max_price)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error searching properties:', error)
    return []
  }

  return data as Property[]
}

// Vérifier les permissions utilisateur
export async function checkUserPermissions() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('Utilisateur non connecté:', error)
    return { canCreate: false, user: null }
  }

  console.log('Utilisateur connecté:', {
    id: user.id,
    email: user.email,
    role: user.role,
    user_metadata: user.user_metadata,
    app_metadata: user.app_metadata
  })

  return { canCreate: true, user }
}

// Créer une propriété
export async function createProperty(property: PropertyInsert) {
  const { data, error } = await supabase
    .from('properties')
    .insert(property)
    .select()
    .single()

  if (error) {
    console.error('Error creating property:', error)
    
    // Erreur spécifique pour RLS
    if (error.message.includes('row-level security policy')) {
      throw new Error('Erreur de permissions: Les politiques de sécurité empêchent la création de propriétés. Vérifiez que vous êtes connecté en tant qu\'administrateur.')
    }
    
    throw error
  }

  return data as Property
}

// Mettre à jour une propriété
export async function updateProperty(id: string, updates: PropertyUpdate) {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating property:', error)
    throw error
  }

  return data as Property
}

// Soft delete - Mettre en corbeille
export async function softDeleteProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error soft deleting property:', error)
    throw error
  }

  return data as Property
}

// Restaurer une propriété de la corbeille
export async function restoreProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .update({ deleted_at: null })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error restoring property:', error)
    throw error
  }

  return data as Property
}

// Supprimer définitivement
export async function permanentDeleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error permanently deleting property:', error)
    throw error
  }
}

// Supprimer définitivement plusieurs propriétés en bulk
export async function bulkPermanentDeleteProperties(ids: string[]) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('Error bulk permanently deleting properties:', error)
    throw error
  }
}

// Restaurer plusieurs propriétés en bulk
export async function bulkRestoreProperties(ids: string[]) {
  const { error } = await supabase
    .from('properties')
    .update({ deleted_at: null })
    .in('id', ids)
    .not('deleted_at', 'is', null)

  if (error) {
    console.error('Error bulk restoring properties:', error)
    throw error
  }
}

// Récupérer les propriétés supprimées (corbeille)
export async function getDeletedProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  if (error) {
    console.error('Error fetching deleted properties:', error)
    return []
  }

  return data as Property[]
}

// Supprimer une propriété
export async function deleteProperty(id: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting property:', error)
    throw error
  }

  return true
}

// Récupérer les villes avec le plus de propriétés
export async function getTopCitiesByPropertyCount(limit: number = 4) {
  const { data, error } = await supabase
    .from('properties')
    .select('city')
    .eq('published', true)
    .is('deleted_at', null)
    .not('city', 'is', null)

  if (error) {
    console.error('Error fetching cities:', error)
    return []
  }

  // Compter les occurrences de chaque ville
  const cityCounts = data.reduce((acc, { city }) => {
    acc[city] = (acc[city] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Trier par nombre de propriétés et prendre les top villes
  return Object.entries(cityCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([city, count]) => ({ city, count }))
}