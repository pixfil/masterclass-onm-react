'use client'

import { MAPBOX_CONFIG, MapProperty } from '@/config/mapbox'
import { PropertyCard } from '@/components/PropertyCard'
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'react'
import { Map, Marker, Popup, NavigationControl, GeolocateControl, ScaleControl, FullscreenControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

// Définir le token Mapbox
if (MAPBOX_CONFIG.accessToken && MAPBOX_CONFIG.accessToken !== 'YOUR_MAPBOX_TOKEN_HERE') {
  mapboxgl.accessToken = MAPBOX_CONFIG.accessToken
}

interface MapboxMapProps {
  properties: MapProperty[]
  className?: string
  onPropertyClick?: (property: MapProperty) => void
  selectedPropertyId?: string
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  properties,
  className = '',
  onPropertyClick,
  selectedPropertyId,
}) => {
  const [viewState, setViewState] = useState({
    longitude: MAPBOX_CONFIG.defaultCenter.lng,
    latitude: MAPBOX_CONFIG.defaultCenter.lat,
    zoom: MAPBOX_CONFIG.defaultZoom,
  })
  
  const [popupInfo, setPopupInfo] = useState<MapProperty | null>(null)
  const mapRef = useRef<any>(null)

  // Centrer la carte sur une propriété sélectionnée
  useEffect(() => {
    if (selectedPropertyId && mapRef.current) {
      const property = properties.find(p => p.id === selectedPropertyId)
      if (property) {
        mapRef.current.flyTo({
          center: [property.coordinates.lng, property.coordinates.lat],
          zoom: 15,
          duration: 1500,
        })
      }
    }
  }, [selectedPropertyId, properties])

  // Ajuster la vue pour montrer toutes les propriétés
  const fitBounds = () => {
    if (properties.length === 0 || !mapRef.current) return

    const bounds = new mapboxgl.LngLatBounds()
    properties.forEach(property => {
      bounds.extend([property.coordinates.lng, property.coordinates.lat])
    })

    mapRef.current.fitBounds(bounds, {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
      maxZoom: 15,
    })
  }

  useEffect(() => {
    if (properties.length > 0) {
      fitBounds()
    }
  }, [properties])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{width: '100%', height: '100%'}}
        mapStyle={MAPBOX_CONFIG.mapStyle}
        mapboxAccessToken={MAPBOX_CONFIG.accessToken}
        maxBounds={MAPBOX_CONFIG.maxBounds}
      >
        {/* Contrôles de la carte */}
        {MAPBOX_CONFIG.controls.navigation && (
          <NavigationControl position="top-right" />
        )}
        {MAPBOX_CONFIG.controls.geolocate && (
          <GeolocateControl position="top-right" />
        )}
        {MAPBOX_CONFIG.controls.scale && (
          <ScaleControl position="bottom-right" />
        )}
        {MAPBOX_CONFIG.controls.fullscreen && (
          <FullscreenControl position="top-right" />
        )}

        {/* Marqueurs des propriétés */}
        {properties.map(property => (
          <Marker
            key={property.id}
            longitude={property.coordinates.lng}
            latitude={property.coordinates.lat}
            onClick={e => {
              e.originalEvent.stopPropagation()
              setPopupInfo(property)
              onPropertyClick?.(property)
            }}
          >
            <div
              className={`
                cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg transition-all
                ${selectedPropertyId === property.id
                  ? 'bg-primary-600 text-white scale-110'
                  : 'bg-white text-neutral-900 hover:scale-105'
                }
              `}
            >
              {formatPrice(property.price)}
            </div>
          </Marker>
        ))}

        {/* Popup avec les détails de la propriété */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.coordinates.lng}
            latitude={popupInfo.coordinates.lat}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            className="mapbox-popup"
            maxWidth="320px"
          >
            <div className="p-2">
              <PropertyCard 
                property={{
                  id: popupInfo.id,
                  title: popupInfo.title,
                  price: popupInfo.price,
                  address: popupInfo.address,
                  type: popupInfo.type,
                  transaction_type: popupInfo.transaction_type,
                  rooms: popupInfo.rooms,
                  surface: popupInfo.surface,
                  featured_image: popupInfo.featured_image,
                }}
                compact
              />
            </div>
          </Popup>
        )}
      </Map>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-white p-3 shadow-lg dark:bg-neutral-800">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-primary-600"></div>
            <span className="text-neutral-600 dark:text-neutral-400">Sélectionné</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-white border border-neutral-300"></div>
            <span className="text-neutral-600 dark:text-neutral-400">Disponible</span>
          </div>
        </div>
      </div>
    </div>
  )
}