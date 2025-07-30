import { PropertyWithImages } from '@/lib/supabase/properties'
import { TRealEstateListing } from '@/data/listings'
import { AgentImmobilier } from '@/lib/supabase/types'
import avatars2 from '@/images/avatars/Image-2.png'

// Interface étendue pour inclure l'agent
export interface PropertyWithImagesAndAgent extends PropertyWithImages {
  agent?: AgentImmobilier | null
}

// Adapter pour transformer les données Supabase vers le format du template
export function adaptPropertyToListing(property: PropertyWithImagesAndAgent): TRealEstateListing {
  return {
    id: `property://${property.id}`,
    date: new Date(property.created_at).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    listingCategory: property.property_type === 'appartement' ? 'Appartement' : 
                    property.property_type === 'maison' ? 'Maison' : 
                    property.property_type === 'locaux_commerciaux' ? 'Locaux commerciaux' :
                    property.property_type === 'parking' ? 'Parking' :
                    property.property_type === 'terrain' ? 'Terrain' : 'Autre',
    title: property.title,
    handle: property.slug || property.handle || `property-${property.id}`,
    description: property.description || '',
    featuredImage: property.featured_image || (property.gallery_images && property.gallery_images[0]) || '',
    galleryImgs: property.gallery_images || [property.featured_image].filter(Boolean) || [],
    like: false, // Cette donnée pourra être récupérée depuis les favoris utilisateur
    address: property.address || `${property.city}`,
    reviewStart: property.review_rating || 0,
    reviewCount: property.review_count || 0,
    price: property.transaction_type === 'vente' 
      ? `€${new Intl.NumberFormat('fr-FR').format(property.price)}`
      : `€${property.price}/mois`,
    maxGuests: property.max_guests || 0,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    acreage: property.acreage || 0,
    saleOff: property.sale_off || null,
    isAds: property.is_ads || null,
    map: {
      lat: property.latitude || 48.5734,
      lng: property.longitude || 7.7521
    },
    host: property.agent ? {
      displayName: `${property.agent.prenom} ${property.agent.nom}`,
      avatarUrl: property.agent.photo_agent || avatars2.src,
      handle: property.agent.email?.replace('@', '-').replace('.', '-') || 'agent-immobilier',
      description: property.agent.description_agent || 'Agent immobilier professionnel',
      listingsCount: property.agent.nombre_proprietes_gerees,
      reviewsCount: property.agent.nombre_avis_agent,
      rating: property.agent.note_moyenne,
      responseRate: property.agent.taux_reponse,
      responseTime: property.agent.temps_reponse_moyen || 'dans l\'heure',
      isSuperhost: property.agent.est_super_agent,
      isVerified: property.agent.est_verifie,
      joinedDate: property.agent.date_embauche ? 
        new Date(property.agent.date_embauche).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 
        'Janvier 2010',
      email: property.agent.email || 'contact@initiative-immobilier.fr',
      phone: property.agent.telephone || '+33 3 88 00 00 00',
    } : {
      displayName: 'Initiative Immobilier',
      avatarUrl: avatars2.src,
      handle: 'initiative-immobilier',
      description: 'Agence immobilière spécialisée dans l\'immobilier strasbourgeois depuis plus de 15 ans.',
      listingsCount: 50,
      reviewsCount: 250,
      rating: 4.9,
      responseRate: 98,
      responseTime: 'dans l\'heure',
      isSuperhost: true,
      isVerified: true,
      joinedDate: 'Janvier 2010',
      email: 'contact@initiative-immobilier.fr',
      phone: '+33 3 88 00 00 00',
    }
  }
}

// Adapter pour transformer un tableau de propriétés
export function adaptPropertiesToListings(properties: PropertyWithImages[]): TRealEstateListing[] {
  console.log(`adaptPropertiesToListings: received ${properties?.length || 0} properties`)
  if (!properties || properties.length === 0) {
    console.log('No properties to adapt!')
    return []
  }
  
  const result = properties.map(property => adaptPropertyToListing(property as PropertyWithImagesAndAgent))
  console.log(`adaptPropertiesToListings: returning ${result.length} listings`)
  return result
}