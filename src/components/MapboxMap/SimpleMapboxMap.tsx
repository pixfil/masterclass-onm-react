'use client'

import { MapProperty } from '@/config/mapbox'
import { cleanImageUrl } from '@/utils/imageUtils'
import { calculateOptimalBounds } from '@/utils/mapUtils'
import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'

interface SimpleMapboxMapProps {
  properties: MapProperty[]
  className?: string
  onPropertyClick?: (property: MapProperty) => void
  selectedPropertyId?: string
}

export interface MapMethods {
  openPopupForProperty: (propertyId: string) => void
  closeAllPopups: () => void
}

// Composant interne qui utilise useMap
const SimpleMapboxMapInner = forwardRef<MapMethods, SimpleMapboxMapProps>(({
  properties,
  className = '',
  onPropertyClick,
  selectedPropertyId,
}, ref) => {
  const map = useMap()
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null)
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  const formatPrice = (price: number, transactionType: 'vente' | 'location' = 'vente') => {
    const formattedPrice = price.toLocaleString('fr-FR') + ' €'
    return transactionType === 'location' ? `${formattedPrice}/mois` : formattedPrice
  }

  const PropertyInfoContent = ({ property }: { property: MapProperty }) => {
    const images = property.gallery_images || [property.featured_image].filter(Boolean)
    const firstImages = images.slice(0, 3)
    const remainingCount = Math.max(0, images.length - 3)

    return (
      <div className="max-w-sm">
        {firstImages.length > 0 && (
          <div className={`grid ${firstImages.length === 1 ? 'grid-cols-1' : firstImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1 mb-3 rounded-lg overflow-hidden`}>
            {firstImages.map((img, index) => (
              <div key={index} className={`relative ${index === 0 && firstImages.length === 3 ? 'col-span-2 row-span-2' : 'aspect-square'}`}>
                <img src={cleanImageUrl(img)} alt={property.title} className="w-full h-full object-cover" />
                {index === 2 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">+{remainingCount}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight">{property.title}</h3>
          <p className="text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
            {property.hide_address 
              ? `${property.city} (zone approximative - rayon 1km)`
              : property.address
            }
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-primary-600">
              {formatPrice(property.price, property.transaction_type)}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {property.type}
            </div>
          </div>
          
          {(property.rooms || property.surface) && (
            <div className="flex gap-4 text-sm text-gray-600">
              {property.rooms && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  {property.rooms} {property.rooms > 1 ? 'pièces' : 'pièce'}
                </span>
              )}
              {property.surface && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clipRule="evenodd"></path>
                  </svg>
                  {property.surface}m²
                </span>
              )}
            </div>
          )}
          
          <button 
            className="w-full mt-3 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium" 
            onClick={() => window.location.href = `/real-estate-listings/${property.handle || property.id}`}
          >
            Voir le détail
          </button>
        </div>
      </div>
    )
  }

  // Exposer les méthodes via ref
  useImperativeHandle(ref, () => ({
    openPopupForProperty: (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId)
      if (property && map) {
        setSelectedProperty(property)
        const displayCoords = property.coordinates
        
        // Centrer la carte sur la propriété
        map.panTo({ lat: displayCoords.lat, lng: displayCoords.lng })
        map.setZoom(Math.max(map.getZoom() ?? 13, 16))
      }
    },
    closeAllPopups: () => {
      setSelectedProperty(null)
    }
  }), [properties, map])

  // Gestionnaire de clic sur un marqueur
  const handleMarkerClick = useCallback((property: MapProperty) => {
    setSelectedProperty(property)
    onPropertyClick?.(property)
    
    if (map) {
      map.panTo({ lat: property.coordinates.lat, lng: property.coordinates.lng })
      map.setZoom(Math.max(map.getZoom() ?? 13, 16))
    }
  }, [map, onPropertyClick])

  // Ajuster la vue de la carte quand les propriétés changent
  useEffect(() => {
    if (!map || properties.length === 0) return

    // Filtrer les propriétés avec des coordonnées valides
    const validProperties = properties.filter(property => {
      const coords = property.coordinates
      return coords && 
        typeof coords.lat === 'number' && 
        typeof coords.lng === 'number' &&
        coords.lat >= -90 && coords.lat <= 90 &&
        coords.lng >= -180 && coords.lng <= 180 &&
        coords.lat !== 0 && coords.lng !== 0
    })

    if (validProperties.length === 0) return

    // Calculer les bounds
    const bounds = new window.google.maps.LatLngBounds()
    validProperties.forEach(property => {
      bounds.extend({ lat: property.coordinates.lat, lng: property.coordinates.lng })
    })

    // Ajuster la vue
    map.fitBounds(bounds, { padding: { top: 50, bottom: 50, left: 50, right: 50 } })
    
    // Limiter le zoom maximum
    const listener = map.addListener('idle', () => {
      const currentZoom = map.getZoom()
      if (currentZoom && currentZoom > 15) {
        map.setZoom(15)
      }
      window.google.maps.event.removeListener(listener)
    })
  }, [properties, map])

  // Centrer sur une propriété sélectionnée
  useEffect(() => {
    if (selectedPropertyId && map) {
      const property = properties.find(p => p.id === selectedPropertyId)
      if (property && property.coordinates) {
        map.panTo({ lat: property.coordinates.lat, lng: property.coordinates.lng })
        map.setZoom(16)
      }
    }
  }, [selectedPropertyId, properties, map])

  return (
    <>
      {/* Marqueurs */}
      {properties.map(property => {
        const coords = property.coordinates
        if (!coords || coords.lat < -90 || coords.lat > 90 || coords.lng < -180 || coords.lng > 180) {
          return null
        }

        const isSelected = selectedPropertyId === property.id
        const isHovered = hoveredPropertyId === property.id

        return (
          <AdvancedMarker
            key={property.id}
            position={{ lat: coords.lat, lng: coords.lng }}
            onClick={() => handleMarkerClick(property)}
            onMouseEnter={() => setHoveredPropertyId(property.id)}
            onMouseLeave={() => setHoveredPropertyId(null)}
          >
            <div 
              className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl ${
                isSelected
                  ? 'bg-primary-600 text-white border-2 border-white transform scale-110'
                  : isHovered
                  ? 'bg-primary-50 text-neutral-900 border border-primary-300 transform scale-105'
                  : 'bg-white text-neutral-900 hover:bg-primary-50 border border-neutral-200'
              }`}
              style={{ transformOrigin: 'center center' }}
            >
              {formatPrice(property.price, property.transaction_type)}
            </div>
          </AdvancedMarker>
        )
      })}

      {/* InfoWindow pour la propriété sélectionnée */}
      {selectedProperty && (
        <InfoWindow
          position={{ lat: selectedProperty.coordinates.lat, lng: selectedProperty.coordinates.lng }}
          onCloseClick={() => setSelectedProperty(null)}
          options={{
            pixelOffset: new window.google.maps.Size(0, -40)
          }}
        >
          <PropertyInfoContent property={selectedProperty} />
        </InfoWindow>
      )}
    </>
  )
})

SimpleMapboxMapInner.displayName = 'SimpleMapboxMapInner'

// Composant principal avec APIProvider
const SimpleMapboxMapComponent = forwardRef<MapMethods, SimpleMapboxMapProps>((props, ref) => {
  const defaultCenter = { lat: 46.227638, lng: 2.213749 } // Centre de la France
  const innerRef = useRef<MapMethods>(null)

  // Transmettre les méthodes via ref
  useImperativeHandle(ref, () => ({
    openPopupForProperty: (propertyId: string) => {
      innerRef.current?.openPopupForProperty(propertyId)
    },
    closeAllPopups: () => {
      innerRef.current?.closeAllPopups()
    }
  }), [])

  // Calculer le centre initial basé sur les propriétés
  const getInitialCenter = () => {
    const validProperties = props.properties.filter(p => 
      p.coordinates && 
      p.coordinates.lat >= -90 && p.coordinates.lat <= 90 &&
      p.coordinates.lng >= -180 && p.coordinates.lng <= 180
    )

    if (validProperties.length === 0) return defaultCenter

    // Calculer le centre moyen
    const sumLat = validProperties.reduce((sum, p) => sum + p.coordinates.lat, 0)
    const sumLng = validProperties.reduce((sum, p) => sum + p.coordinates.lng, 0)
    
    return {
      lat: sumLat / validProperties.length,
      lng: sumLng / validProperties.length
    }
  }

  return (
    <div className={`relative h-full w-full ${props.className || ''}`}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || ''}>
        <Map
          defaultCenter={getInitialCenter()}
          defaultZoom={props.properties.length === 1 ? 16 : 13}
          mapId="property-map"
          disableDefaultUI={false}
          gestureHandling="greedy"
          styles={[
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]}
        >
          <SimpleMapboxMapInner ref={innerRef} {...props} />
        </Map>
      </APIProvider>
      
      {/* Légende */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-white p-3 shadow-lg dark:bg-neutral-800">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-primary-600"></div>
              <span className="text-neutral-600 dark:text-neutral-400">Sélectionné</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-white border border-neutral-300"></div>
              <span className="text-neutral-600 dark:text-neutral-400">Disponible</span>
            </div>
          </div>
          {props.properties.some(p => p.hide_address) && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-200 dark:border-neutral-600">
              <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-dashed bg-blue-100/50"></div>
              <span className="text-neutral-600 dark:text-neutral-400">Zone approximative (1km)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

SimpleMapboxMapComponent.displayName = 'SimpleMapboxMap'

export const SimpleMapboxMap = SimpleMapboxMapComponent