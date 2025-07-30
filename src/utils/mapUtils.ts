import { PropertyWithImages } from '@/lib/supabase/properties'

// Fonction pour obtenir les coordonnées d'affichage (réelles ou approximatives)
export const getDisplayCoordinates = (property: PropertyWithImages) => {
  const lat = property.latitude
  const lng = property.longitude

  if (!lat || !lng) return null

  // Si l'adresse doit être cachée, ajouter un décalage aléatoire dans un rayon de 1km
  if (property.hide_address) {
    // Générer un décalage aléatoire mais constant pour cette propriété (basé sur l'ID)
    const seed = property.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const random1 = Math.sin(seed) * 10000
    const random2 = Math.cos(seed) * 10000
    
    // Convertir 1km en degrés (approximatif)
    const kmToDegrees = 1 / 111.32 // 1 degré ≈ 111.32 km
    const maxOffset = kmToDegrees // 1km de rayon maximum
    
    // Décalage aléatoire dans un cercle de 1km
    const angle = random1 * 2 * Math.PI
    const distance = Math.abs(random2) * maxOffset
    
    const offsetLat = distance * Math.cos(angle)
    const offsetLng = distance * Math.sin(angle) / Math.cos(lat * Math.PI / 180)
    
    return {
      lat: lat + offsetLat,
      lng: lng + offsetLng,
      isApproximate: true
    }
  }

  return {
    lat,
    lng,
    isApproximate: false
  }
}

// Fonction pour créer un cercle de rayon autour d'une position
export const createRadiusCircle = (center: { lat: number, lng: number }, radiusKm: number = 1) => {
  const points = []
  const numPoints = 64
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI
    const lat = center.lat + (radiusKm / 111.32) * Math.cos(angle)
    const lng = center.lng + (radiusKm / 111.32) * Math.sin(angle) / Math.cos(center.lat * Math.PI / 180)
    points.push([lng, lat])
  }
  
  // Fermer le polygone
  points.push(points[0])
  
  return points
}

// Fonction pour adapter le zoom en fonction du nombre de propriétés et de leur répartition
export const calculateOptimalBounds = (properties: PropertyWithImages[]) => {
  if (properties.length === 0) return null

  // Si une seule propriété, centrer sur la ville
  if (properties.length === 1) {
    const property = properties[0]
    const coords = getDisplayCoordinates(property)
    
    if (!coords) return null

    return {
      center: [coords.lng, coords.lat],
      zoom: property.hide_address ? 12 : 15, // Zoom moins précis si adresse cachée
      type: 'single' as const
    }
  }

  // Si toutes les propriétés sont dans la même ville, optimiser pour la ville
  const cities = [...new Set(properties.map(p => p.city))]
  if (cities.length === 1) {
    const validProperties = properties
      .map(p => ({ property: p, coords: getDisplayCoordinates(p) }))
      .filter(item => item.coords !== null)

    if (validProperties.length === 0) return null

    // Calculer le centre de la ville
    const centerLat = validProperties.reduce((sum, item) => sum + item.coords!.lat, 0) / validProperties.length
    const centerLng = validProperties.reduce((sum, item) => sum + item.coords!.lng, 0) / validProperties.length

    return {
      center: [centerLng, centerLat],
      zoom: 13, // Zoom ville
      type: 'city' as const
    }
  }

  // Plusieurs villes : calculer les bounds normalement
  const validCoords = properties
    .map(p => getDisplayCoordinates(p))
    .filter(coords => coords !== null)

  if (validCoords.length === 0) return null

  const lngs = validCoords.map(c => c!.lng)
  const lats = validCoords.map(c => c!.lat)

  return {
    bounds: [
      [Math.min(...lngs), Math.min(...lats)], // SW
      [Math.max(...lngs), Math.max(...lats)]  // NE
    ],
    type: 'bounds' as const
  }
}

// Fonction pour générer des couleurs de marqueurs en fonction du type
export const getMarkerColor = (property: PropertyWithImages, isSelected: boolean = false) => {
  if (isSelected) return '#FF6B35' // Orange pour sélectionné
  
  if (property.status === 'vendu' || property.status === 'loue') return '#6B7280' // Gris pour vendu/loué
  if (property.status === 'sous_offre') return '#F59E0B' // Orange pour sous offre
  if (property.transaction_type === 'location') return '#3B82F6' // Bleu pour location
  
  return '#10B981' // Vert pour vente disponible
}