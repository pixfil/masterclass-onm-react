/**
 * Utilitaires SEO pour l'optimisation des URLs et métadonnées
 */

/**
 * Génère un slug SEO-optimisé pour une propriété
 */
export function generatePropertySlug(property: {
  property_type: string
  city: string
  surface?: number
  rooms?: number
  price: number
}): string {
  // Nettoyer et formater les éléments du slug
  const propertyType = property.property_type.toLowerCase()
    .replace('_', '-')
    .replace(/[^a-z0-9-]/g, '')
  
  const city = property.city.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  // Construire le slug avec informations clés
  let slug = `${propertyType}-${city}`
  
  // Ajouter la surface si disponible
  if (property.surface && property.surface > 0) {
    slug += `-${property.surface}m2`
  }
  
  // Ajouter le nombre de pièces si disponible
  if (property.rooms && property.rooms > 0) {
    slug += `-${property.rooms}pieces`
  }
  
  // Ajouter une indication de prix pour l'unicité
  const priceRange = Math.floor(property.price / 50000) * 50000
  slug += `-${priceRange}`
  
  return slug
}

/**
 * Génère un titre SEO optimisé
 */
export function generateSEOTitle(
  propertyType: string,
  city: string,
  price: number,
  transactionType: string = 'vente'
): string {
  const propertyTypeMap: Record<string, string> = {
    'appartement': 'Appartement',
    'maison': 'Maison',
    'terrain': 'Terrain',
    'local_commercial': 'Local commercial',
    'parking': 'Parking',
    'autre': 'Bien immobilier'
  }
  
  const transaction = transactionType === 'location' ? 'Location' : 'Vente'
  const type = propertyTypeMap[propertyType] || 'Bien immobilier'
  
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(price)
  
  return `${transaction} ${type} ${city} - ${formattedPrice}`
}

/**
 * Génère une description SEO optimisée
 */
export function generateSEODescription(property: {
  property_type: string
  city: string
  surface?: number
  rooms?: number
  bedrooms?: number
  bathrooms?: number
  description?: string
  transaction_type?: string
  address?: string
}): string {
  const transactionType = property.transaction_type === 'location' ? 'Location' : 'Vente'
  const propertyTypeMap: Record<string, string> = {
    'appartement': 'appartement',
    'maison': 'maison',
    'terrain': 'terrain',
    'local_commercial': 'local commercial',
    'parking': 'parking',
    'autre': 'bien immobilier'
  }
  
  const type = propertyTypeMap[property.property_type] || 'bien immobilier'
  
  // Caractéristiques principales
  const features = []
  if (property.surface) features.push(`${property.surface} m²`)
  if (property.rooms) features.push(`${property.rooms} pièces`)
  if (property.bedrooms) features.push(`${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}`)
  if (property.bathrooms) features.push(`${property.bathrooms} salle${property.bathrooms > 1 ? 's' : ''} de bain`)
  
  const featuresText = features.length > 0 ? features.join(', ') + '. ' : ''
  const locationText = property.address ? `${property.address}, ${property.city}` : property.city
  
  // Description de base
  let description = `${transactionType} ${type} à ${property.city}. ${featuresText}`
  
  // Ajouter extrait de la description si disponible
  if (property.description) {
    const excerpt = property.description.substring(0, 80).trim()
    description += excerpt + '...'
  } else {
    description += `Découvrez ce ${type} d'exception situé ${locationText}.`
  }
  
  description += ' Initiative Immobilier vous accompagne.'
  
  // Limiter à 160 caractères pour SEO
  return description.length > 160 ? description.substring(0, 157) + '...' : description
}

/**
 * Génère des mots-clés SEO
 */
export function generateSEOKeywords(property: {
  property_type: string
  city: string
  surface?: number
  rooms?: number
  transaction_type?: string
}): string[] {
  const transactionType = property.transaction_type === 'location' ? 'location' : 'vente'
  const propertyType = property.property_type.replace('_', ' ')
  
  const keywords = [
    transactionType,
    propertyType,
    property.city.toLowerCase(),
    'immobilier',
    'initiative immobilier',
    'agent immobilier',
    `${transactionType} ${propertyType}`,
    `${propertyType} ${property.city.toLowerCase()}`
  ]
  
  if (property.surface) {
    keywords.push(`${property.surface}m2`, `${property.surface} metres carres`)
  }
  
  if (property.rooms) {
    keywords.push(`${property.rooms} pieces`)
  }
  
  // Mots-clés géographiques
  keywords.push(`immobilier ${property.city.toLowerCase()}`)
  
  return keywords.filter((keyword, index, self) => self.indexOf(keyword) === index)
}

/**
 * Valide et nettoie un slug
 */
export function cleanSlug(slug: string): string {
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}