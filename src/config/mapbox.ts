// Configuration Mapbox
export const MAPBOX_CONFIG = {
  // Clé API Mapbox
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoicGhpbGdjIiwiYSI6ImNtOWg4aWx1aDAyNG4ybHNjN3Uzbno2N2YifQ.T_bTsIPwfthV57jhfiLt8Q',
  
  // Position par défaut (Strasbourg)
  defaultCenter: {
    lat: 48.5704,
    lng: 7.7462,
  },
  
  // Niveau de zoom par défaut
  defaultZoom: 13,
  
  // Style de carte simple pour diagnostic
  mapStyle: 'mapbox://styles/mapbox/streets-v11',
  
  // Limites de la carte (optionnel)
  maxBounds: undefined,
  
  // Configuration des contrôles
  controls: {
    navigation: true,
    geolocate: true,
    scale: true,
    fullscreen: true,
  },
}

// Types pour les propriétés sur la carte
export interface MapProperty {
  id: string
  title: string
  price: number
  type: string
  transaction_type: 'vente' | 'location'
  coordinates: {
    lat: number
    lng: number
  }
  address: string
  rooms?: number
  surface?: number
  featured_image?: string
  gallery_images?: string[]
  handle?: string
}