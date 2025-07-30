import { supabase } from '@/lib/supabaseClient'
import { Property, PropertyWithImages } from './types'

export interface ListingFilters {
  transaction?: 'vente' | 'location'
  location?: string
  type?: string
  price_min?: number
  price_max?: number
  page?: number
  limit?: number
}

export interface FilterOptions {
  locations: Array<{ value: string; label: string; count: number }>
  types: Array<{ value: string; label: string; count: number }>
  priceRange: { min: number; max: number }
  transactions: Array<{ value: string; label: string; count: number }>
}

export async function getRealEstateListingsFromSupabase(filters: ListingFilters = {}) {
  // Debug : afficher les filtres reçus
  console.log('Filtres reçus dans getRealEstateListingsFromSupabase:', filters)

  let query = supabase
    .from('properties')
    .select(`
      *,
      property_images(
        id,
        image_url,
        image_order,
        is_featured,
        alt_text
      ),
      property_labels(
        id,
        label
      )
    `)
    .eq('published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // Test : d'abord récupérer toutes les propriétés pour voir s'il y en a
  const testQuery = await supabase
    .from('properties')
    .select('count')
    .eq('published', true)
    .is('deleted_at', null)
  
  console.log('Nombre total de propriétés publiées dans la base:', testQuery.data?.[0]?.count || 0)

  // Appliquer les filtres
  if (filters.transaction) {
    console.log('Filtre transaction appliqué:', filters.transaction)
    query = query.eq('transaction_type', filters.transaction)
  }

  if (filters.location) {
    console.log('Filtre location appliqué:', filters.location)
    // Nettoyer la location pour enlever les parenthèses et compteurs
    const cleanLocation = filters.location.split('(')[0].trim()
    query = query.ilike('city', `%${cleanLocation}%`)
  }

  if (filters.type) {
    console.log('Filtre type appliqué:', filters.type)
    query = query.eq('property_type', filters.type)
  }

  if (filters.price_min) {
    console.log('Filtre price_min appliqué:', filters.price_min)
    query = query.gte('price', filters.price_min)
  }

  if (filters.price_max) {
    console.log('Filtre price_max appliqué:', filters.price_max)
    query = query.lte('price', filters.price_max)
  }

  // Pagination
  const page = filters.page || 1
  const limit = filters.limit || 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  query = query.range(from, to)

  const { data, error } = await query

  if (error) {
    console.error('Erreur lors de la récupération des listings:', error)
    throw error
  }

  console.log('Nombre de résultats trouvés:', data?.length || 0)

  // Transformer les données pour le format attendu
  return data.map(property => ({
    id: `real-estate-listing://${property.id}`,
    date: new Date(property.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric', 
      year: 'numeric'
    }),
    listingCategory: property.property_type?.charAt(0).toUpperCase() + property.property_type?.slice(1) || '',
    title: property.title,
    handle: property.slug || property.id,
    description: property.description || '',
    featuredImage: property.featured_image || (property.property_images && property.property_images[0]?.image_url) || '',
    galleryImgs: property.property_images
      ?.sort((a: any, b: any) => a.image_order - b.image_order)
      ?.map((img: any) => img.image_url) || [],
    like: false, // À implémenter plus tard
    address: property.address || property.adresse_complete || '',
    reviewStart: property.review_rating || 0,
    reviewCount: property.review_count || 0,
    price: property.transaction_type === 'location' 
      ? `${property.price}€/mois` 
      : `${new Intl.NumberFormat('fr-FR').format(property.price)}€`,
    maxGuests: property.max_guests || property.nombre_invites_max || 0,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    beds: property.bedrooms || 0, // Approximation
    acreage: property.surface || property.acreage || 0,
    saleOff: property.sale_off || null,
    isAds: property.is_ads || null,
    map: property.latitude && property.longitude ? {
      lat: parseFloat(property.latitude.toString().replace(',', '.')),
      lng: parseFloat(property.longitude.toString().replace(',', '.'))
    } : { lat: 0, lng: 0 },
    // Labels multiples
    property_labels: property.property_labels?.map((label: any) => label.label) || [],
    // Ancien champ pour compatibilité
    property_label: property.property_labels?.[0]?.label || null,
    // Champs additionnels pour la compatibilité
    ...property
  })) as any[]
}

export async function getRealEstateListingFilterOptionsFromSupabase(): Promise<FilterOptions> {
  // Récupérer les options de filtres depuis Supabase
  const [locationsResult, typesResult, transactionsResult, pricesResult] = await Promise.all([
    // Localités
    supabase
      .from('properties')
      .select('city')
      .not('city', 'is', null)
      .eq('published', true)
      .is('deleted_at', null),
    
    // Types de biens
    supabase
      .from('properties')
      .select('property_type')
      .not('property_type', 'is', null)
      .eq('published', true)
      .is('deleted_at', null),
    
    // Types de transaction
    supabase
      .from('properties')
      .select('transaction_type')
      .not('transaction_type', 'is', null)
      .eq('published', true)
      .is('deleted_at', null),
    
    // Prix pour calculer les plages
    supabase
      .from('properties')
      .select('price')
      .not('price', 'is', null)
      .gt('price', 0)
      .eq('published', true)
      .is('deleted_at', null)
  ])

  // Traiter les localités
  const locationCounts: Record<string, number> = {}
  locationsResult.data?.forEach(item => {
    const city = item.city?.trim()
    if (city) {
      locationCounts[city] = (locationCounts[city] || 0) + 1
    }
  })
  
  const locations = Object.entries(locationCounts)
    .map(([value, count]) => ({
      value,
      label: value,
      count
    }))
    .sort((a, b) => b.count - a.count)

  // Traiter les types
  const typeCounts: Record<string, number> = {}
  typesResult.data?.forEach(item => {
    const type = item.property_type?.trim()
    if (type) {
      typeCounts[type] = (typeCounts[type] || 0) + 1
    }
  })
  
  const types = Object.entries(typeCounts)
    .map(([value, count]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      count
    }))
    .sort((a, b) => b.count - a.count)

  // Traiter les transactions
  const transactionCounts: Record<string, number> = {}
  transactionsResult.data?.forEach(item => {
    const transaction = item.transaction_type?.trim()
    if (transaction) {
      transactionCounts[transaction] = (transactionCounts[transaction] || 0) + 1
    }
  })
  
  const transactions = Object.entries(transactionCounts)
    .map(([value, count]) => ({
      value,
      label: value === 'vente' ? 'Achat' : 'Location',
      count
    }))

  // Calculer les prix min/max
  const prices = pricesResult.data?.map(item => item.price) || []
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }

  return {
    locations,
    types,
    transactions,
    priceRange
  }
}

// Adapter function to transform Supabase filter options to ListingFilterTabs format
export function adaptFilterOptionsForListingTabs(filterOptions: FilterOptions): any[] {
  const adapted = []

  // Type de transaction (Achat/Location)
  if (filterOptions.transactions.length > 0) {
    adapted.push({
      name: 'transaction',
      label: 'Type de transaction',
      tabUIType: 'checkbox',
      options: filterOptions.transactions.map(transaction => ({
        name: transaction.label,
        value: transaction.value,
        defaultChecked: false
      }))
    })
  }

  // Localisation
  if (filterOptions.locations.length > 0) {
    adapted.push({
      name: 'location',
      label: 'Localisation',
      tabUIType: 'checkbox',
      options: filterOptions.locations.slice(0, 10).map(location => ({
        name: location.label,
        value: location.value,
        defaultChecked: false
      }))
    })
  }

  // Type de bien
  if (filterOptions.types.length > 0) {
    adapted.push({
      name: 'property-type',
      label: 'Type de bien',
      tabUIType: 'checkbox',
      options: filterOptions.types.map(type => ({
        name: type.label,
        value: type.value,
        defaultChecked: false
      }))
    })
  }

  // Prix
  if (filterOptions.priceRange.min !== Infinity && filterOptions.priceRange.max !== -Infinity) {
    adapted.push({
      name: 'price-range',
      label: 'Prix',
      tabUIType: 'price-range',
      min: filterOptions.priceRange.min,
      max: filterOptions.priceRange.max
    })
  }

  return adapted
}

export async function getRealEstateListingByHandle(handle: string): Promise<PropertyWithImages | null> {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_images(
        id,
        image_url,
        image_order,
        is_featured,
        alt_text
      )
    `)
    .or(`slug.eq.${handle},id.eq.${handle}`)
    .eq('published', true)
    .is('deleted_at', null)
    .single()

  if (error || !data) {
    console.error('Erreur lors de la récupération du listing:', error)
    return null
  }

  return {
    ...data,
    gallery_images: data.property_images
      ?.sort((a: any, b: any) => a.image_order - b.image_order)
      ?.map((img: any) => img.image_url) || [],
  }
}