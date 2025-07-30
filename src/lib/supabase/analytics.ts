import { supabase } from '@/lib/supabaseClient'

export interface PropertyViewCount {
  property_id: string
  total_views: number
  unique_views: number
  last_viewed?: string
}

// Récupérer les statistiques de vues pour toutes les propriétés
export async function getPropertyViewCounts(): Promise<PropertyViewCount[]> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('property_id, created_at, session_id')
      .eq('event_type', 'property_view')
      .not('property_id', 'is', null)
      .limit(1000)

    if (error) {
      // Si erreur (table n'existe pas), retourner tableau vide
      console.log('Table analytics_events non disponible')
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Calculer les statistiques par propriété
    const viewStats: { [key: string]: PropertyViewCount } = {}

    data.forEach((event) => {
      const propertyId = event.property_id
      
      if (!viewStats[propertyId]) {
        viewStats[propertyId] = {
          property_id: propertyId,
          total_views: 0,
          unique_views: 0,
          last_viewed: event.created_at
        }
      }

      viewStats[propertyId].total_views++
      
      if (event.created_at > (viewStats[propertyId].last_viewed || '')) {
        viewStats[propertyId].last_viewed = event.created_at
      }
    })

    // Calculer les vues uniques
    for (const propertyId in viewStats) {
      const uniqueSessions = new Set(
        data
          .filter(event => event.property_id === propertyId)
          .map(event => event.session_id)
      )
      viewStats[propertyId].unique_views = uniqueSessions.size
    }

    return Object.values(viewStats)
  } catch (error) {
    console.error('Erreur analytics:', error)
    return []
  }
}

// Générer des données simulées pour les vues
function generateMockViewCounts(): PropertyViewCount[] {
  // Données simulées pour démonstration
  const mockData: PropertyViewCount[] = []
  
  // Générer des vues aléatoires pour chaque propriété
  // Ceci sera remplacé par de vraies données une fois les tables créées
  const propertyIds = [
    // Vous pouvez ajouter des IDs de propriétés réels ici si nécessaire
  ]

  propertyIds.forEach(propertyId => {
    mockData.push({
      property_id: propertyId,
      total_views: Math.floor(Math.random() * 500) + 50, // Entre 50 et 550 vues
      unique_views: Math.floor(Math.random() * 200) + 20, // Entre 20 et 220 vues uniques
      last_viewed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Dans les 30 derniers jours
    })
  })

  return mockData
}

// Récupérer les statistiques pour une propriété spécifique
export async function getPropertyViewCount(propertyId: string): Promise<PropertyViewCount | null> {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('created_at, session_id')
      .eq('event_type', 'property_view')
      .eq('property_id', propertyId)

    if (error) {
      console.error('Erreur lors de la récupération des vues:', error)
      return null
    }

    const uniqueSessions = new Set(data.map(event => event.session_id))
    const lastViewed = data.length > 0 ? 
      Math.max(...data.map(event => new Date(event.created_at).getTime())) : null

    return {
      property_id: propertyId,
      total_views: data.length,
      unique_views: uniqueSessions.size,
      last_viewed: lastViewed ? new Date(lastViewed).toISOString() : undefined
    }
  } catch (error) {
    console.error('Erreur inattendue:', error)
    return null
  }
}

// Enregistrer une vue de propriété
export async function trackPropertyView(
  propertyId: string,
  sessionId: string,
  metadata: {
    userId?: string
    ipAddress?: string
    userAgent?: string
    referer?: string
    pageUrl?: string
  } = {}
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'property_view',
        property_id: propertyId,
        session_id: sessionId,
        user_id: metadata.userId || null,
        ip_address: metadata.ipAddress || null,
        user_agent: metadata.userAgent || null,
        referer: metadata.referer || null,
        metadata: metadata.pageUrl ? { page_url: metadata.pageUrl } : {},
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Erreur lors de l\'enregistrement de la vue:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erreur inattendue lors du tracking:', error)
    return false
  }
}

// Enregistrer un événement de contact
export async function trackContactEvent(
  propertyId: string,
  sessionId: string,
  contactType: 'contact_form' | 'phone_click' | 'email_click' | 'estimation_request',
  metadata: {
    userId?: string
    formData?: any
    sourceUrl?: string
  } = {}
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: contactType,
        property_id: propertyId,
        session_id: sessionId,
        user_id: metadata.userId || null,
        page_url: metadata.sourceUrl || null,
        metadata: metadata.formData || {},
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Erreur lors de l\'enregistrement du contact:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erreur inattendue lors du tracking contact:', error)
    return false
  }
}