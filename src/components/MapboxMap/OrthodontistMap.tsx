'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Map, AdvancedMarker, InfoWindow, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  AcademicCapIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export interface OrthodontistMapData {
  id: string
  name: string
  city: string
  address?: string
  postalCode?: string
  phone?: string
  email?: string
  coordinates: {
    lat: number
    lng: number
  }
  rating?: number
  certificationYear: number
  specialties: string[]
  formationsCompleted: string[]
}

interface OrthodontistMapProps {
  orthodontists: OrthodontistMapData[]
  className?: string
  selectedOrthodontistId?: string
  onOrthodontistClick?: (orthodontist: OrthodontistMapData) => void
}

export interface MapMethods {
  openPopupForOrthodontist: (orthodontistId: string) => void
  closeAllPopups: () => void
}

const MarkerContent = ({ orthodontist, isSelected }: { orthodontist: OrthodontistMapData, isSelected: boolean }) => (
  <div className="relative cursor-pointer">
    <div className={`bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-3 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-110 ${
      isSelected ? 'ring-2 ring-white scale-110' : ''
    }`}>
      <AcademicCapIcon className="w-6 h-6 text-white" />
    </div>
    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rotate-45"></div>
  </div>
)

const PopupContent = ({ orthodontist }: { orthodontist: OrthodontistMapData }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      if (i < Math.floor(rating)) {
        return <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
      } else {
        return <StarIcon key={i} className="h-4 w-4 text-gray-300" />
      }
    })
  }

  return (
    <div className="max-w-sm p-4">
      <div className="space-y-3">
        {/* Header avec nom et badge */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg leading-tight">{orthodontist.name}</h3>
            <div className="flex items-center mt-1">
              <div className="px-2 py-1 bg-orange-100 rounded-full">
                <span className="text-xs font-medium text-orange-800">
                  Certifié ONM depuis {orthodontist.certificationYear}
                </span>
              </div>
            </div>
          </div>
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
            <AcademicCapIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Note */}
        {orthodontist.rating && (
          <div className="flex items-center space-x-2">
            <div className="flex">
              {renderStars(orthodontist.rating)}
            </div>
            <span className="text-sm text-gray-600">{orthodontist.rating.toFixed(1)}/5</span>
          </div>
        )}

        {/* Contact info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-700">{orthodontist.address || ''}</p>
              <p className="text-gray-500">{orthodontist.city} {orthodontist.postalCode || ''}</p>
            </div>
          </div>
          
          {orthodontist.phone && (
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${orthodontist.phone}`} className="text-gray-700 hover:text-primary-600">
                {orthodontist.phone}
              </a>
            </div>
          )}
          
          {orthodontist.email && (
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${orthodontist.email}`} className="text-gray-700 hover:text-primary-600 truncate">
                {orthodontist.email}
              </a>
            </div>
          )}
        </div>

        {/* Spécialités */}
        {orthodontist.specialties.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Spécialités :</p>
            <div className="flex flex-wrap gap-1">
              {orthodontist.specialties.map((specialty, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Formations */}
        {orthodontist.formationsCompleted.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Formations complétées :</p>
            <div className="flex flex-wrap gap-1">
              {orthodontist.formationsCompleted.map((formation, index) => (
                <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                  {formation}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const OrthodontistMapComponent = forwardRef<MapMethods, OrthodontistMapProps>(({
  orthodontists,
  className = '',
  selectedOrthodontistId,
  onOrthodontistClick,
}, ref) => {
  const [selectedOrthodontist, setSelectedOrthodontist] = useState<OrthodontistMapData | null>(null)
  const map = useMap()

  // Filtrer les orthodontistes avec coordonnées valides
  const validOrthodontists = orthodontists.filter(orthodontist => {
    const coords = orthodontist.coordinates
    return coords && 
      typeof coords.lat === 'number' && 
      typeof coords.lng === 'number' &&
      coords.lat >= -90 && coords.lat <= 90 &&
      coords.lng >= -180 && coords.lng <= 180 &&
      coords.lat !== 0 && coords.lng !== 0
  })

  // Calculer le centre
  const center = validOrthodontists.length > 0 
    ? {
        lat: validOrthodontists.reduce((sum, o) => sum + o.coordinates.lat, 0) / validOrthodontists.length,
        lng: validOrthodontists.reduce((sum, o) => sum + o.coordinates.lng, 0) / validOrthodontists.length
      }
    : { lat: 46.2276, lng: 2.2137 } // Centre de la France par défaut

  // Exposer les méthodes via ref
  useImperativeHandle(ref, () => ({
    openPopupForOrthodontist: (orthodontistId: string) => {
      const orthodontist = orthodontists.find(o => o.id === orthodontistId)
      if (orthodontist && map) {
        setSelectedOrthodontist(orthodontist)
        map.panTo({ lat: orthodontist.coordinates.lat, lng: orthodontist.coordinates.lng })
        map.setZoom(16)
      }
    },
    closeAllPopups: () => {
      setSelectedOrthodontist(null)
    }
  }), [orthodontists, map])

  // Gérer la sélection d'un orthodontiste
  const handleMarkerClick = (orthodontist: OrthodontistMapData) => {
    setSelectedOrthodontist(orthodontist)
    onOrthodontistClick?.(orthodontist)
    if (map) {
      map.panTo({ lat: orthodontist.coordinates.lat, lng: orthodontist.coordinates.lng })
      map.setZoom(16)
    }
  }

  // Ajuster la vue quand les orthodontistes changent
  useEffect(() => {
    if (map && validOrthodontists.length > 0) {
      // Créer les limites manuellement
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180
      validOrthodontists.forEach(o => {
        minLat = Math.min(minLat, o.coordinates.lat)
        maxLat = Math.max(maxLat, o.coordinates.lat)
        minLng = Math.min(minLng, o.coordinates.lng)
        maxLng = Math.max(maxLng, o.coordinates.lng)
      })
      
      if (window.google && window.google.maps) {
        const bounds = new window.google.maps.LatLngBounds(
          { lat: minLat, lng: minLng },
          { lat: maxLat, lng: maxLng }
        )
        map.fitBounds(bounds, { padding: 50 })
      }
    }
  }, [map, validOrthodontists.length])

  // Centrer sur un orthodontiste sélectionné
  useEffect(() => {
    if (selectedOrthodontistId && map) {
      const orthodontist = orthodontists.find(o => o.id === selectedOrthodontistId)
      if (orthodontist) {
        setSelectedOrthodontist(orthodontist)
        map.panTo({ lat: orthodontist.coordinates.lat, lng: orthodontist.coordinates.lng })
        map.setZoom(16)
      }
    }
  }, [selectedOrthodontistId, orthodontists, map])

  return (
    <div className={`relative h-full w-full ${className}`}>
      <Map
        defaultCenter={center}
        defaultZoom={6}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="orthodontist-map"
        className="h-full w-full"
      >
        {validOrthodontists.map((orthodontist) => (
          <AdvancedMarker
            key={orthodontist.id}
            position={{ lat: orthodontist.coordinates.lat, lng: orthodontist.coordinates.lng }}
            onClick={() => handleMarkerClick(orthodontist)}
          >
            <MarkerContent 
              orthodontist={orthodontist} 
              isSelected={selectedOrthodontist?.id === orthodontist.id}
            />
          </AdvancedMarker>
        ))}

        {selectedOrthodontist && (
          <InfoWindow
            position={{ lat: selectedOrthodontist.coordinates.lat, lng: selectedOrthodontist.coordinates.lng }}
            onCloseClick={() => setSelectedOrthodontist(null)}
            pixelOffset={[0, -40]}
          >
            <PopupContent orthodontist={selectedOrthodontist} />
          </InfoWindow>
        )}
      </Map>
      
      {/* Légende */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-white p-3 shadow-lg dark:bg-neutral-800">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-2">
              <AcademicCapIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-neutral-600 dark:text-neutral-400">Orthodontiste certifié ONM</span>
          </div>
        </div>
      </div>
    </div>
  )
})

OrthodontistMapComponent.displayName = 'OrthodontistMap'

export const OrthodontistMap = OrthodontistMapComponent