'use client'

import { MAPBOX_CONFIG } from '@/config/mapbox'
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '@/shared/Button'
import { EyeIcon, MapIcon, Squares2X2Icon } from '@heroicons/react/24/outline'

interface PropertyDetailMapProps {
  latitude: number
  longitude: number
  address: string
  title: string
  className?: string
}

interface MapLayer {
  id: string
  name: string
  enabled: boolean
  type: 'poi' | 'transit' | 'park' | 'water' | 'building'
}

export const PropertyDetailMap: React.FC<PropertyDetailMapProps> = ({
  latitude,
  longitude,
  address,
  title,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const [is3DMode, setIs3DMode] = useState(false)
  const [showLayers, setShowLayers] = useState(false)
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: 'poi-schools', name: 'Écoles', enabled: true, type: 'poi' },
    { id: 'poi-medical', name: 'Services médicaux', enabled: true, type: 'poi' },
    { id: 'poi-shopping', name: 'Commerces', enabled: false, type: 'poi' },
    { id: 'transit-bus', name: 'Transports en commun', enabled: true, type: 'transit' },
    { id: 'parks', name: 'Espaces verts', enabled: true, type: 'park' },
    { id: 'water', name: 'Points d\'eau', enabled: false, type: 'water' },
  ])

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.mapStyle,
      center: [longitude, latitude],
      zoom: 14,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    })

    // Ajouter le marqueur de la propriété
    const customMarker = document.createElement('div')
    customMarker.className = 'custom-property-marker'
    customMarker.innerHTML = `
      <div class="relative">
        <div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-red-500"></div>
      </div>
    `

    marker.current = new mapboxgl.Marker(customMarker)
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${title}</h3>
            <p class="text-xs text-gray-600 mt-1">${address}</p>
          </div>
        `)
      )
      .addTo(map.current)

    // Ajouter les contrôles
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [latitude, longitude, address, title])

  // Gérer le mode 3D
  const toggle3DMode = () => {
    if (!map.current) return

    if (is3DMode) {
      // Retour au mode 2D
      map.current.easeTo({
        pitch: 0,
        bearing: 0,
        zoom: 14,
        duration: 1000,
      })
    } else {
      // Passage au mode 3D
      map.current.easeTo({
        pitch: 60,
        bearing: -30,
        zoom: 16,
        duration: 1000,
      })
    }
    setIs3DMode(!is3DMode)
  }

  // Gérer l'affichage des couches
  const toggleLayer = (layerId: string) => {
    setMapLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, enabled: !layer.enabled } : layer
    ))

    if (!map.current) return

    const layer = mapLayers.find(l => l.id === layerId)
    if (!layer) return

    // Ici vous pouvez ajouter la logique pour activer/désactiver les couches Mapbox
    // selon le type de couche (POI, transit, etc.)
    
    // Exemple pour les POI (Points of Interest)
    if (layer.type === 'poi') {
      const visibility = layer.enabled ? 'none' : 'visible'
      try {
        if (map.current.getLayer(`poi-${layer.id}`)) {
          map.current.setLayoutProperty(`poi-${layer.id}`, 'visibility', visibility)
        }
      } catch (error) {
        // Layer might not exist, that's ok
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Contrôles personnalisés */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {/* Bouton 3D */}
        <Button
          onClick={toggle3DMode}
          className={`p-2 shadow-lg transition-colors ${
            is3DMode 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
          title={is3DMode ? 'Vue 2D' : 'Vue 3D'}
        >
          <EyeIcon className="h-4 w-4" />
        </Button>

        {/* Bouton couches */}
        <Button
          onClick={() => setShowLayers(!showLayers)}
          className={`p-2 shadow-lg transition-colors ${
            showLayers 
              ? 'bg-primary-600 text-white' 
              : 'bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
          title="Couches d'information"
        >
          <Squares2X2Icon className="h-4 w-4" />
        </Button>
      </div>

      {/* Panel des couches */}
      {showLayers && (
        <div className="absolute top-4 left-20 z-10 bg-white rounded-lg shadow-lg p-4 w-64 max-h-80 overflow-y-auto dark:bg-neutral-800">
          <h3 className="font-semibold text-sm mb-3 text-neutral-900 dark:text-white">
            Couches d'information
          </h3>
          <div className="space-y-2">
            {mapLayers.map((layer) => (
              <label key={layer.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={layer.enabled}
                  onChange={() => toggleLayer(layer.id)}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {layer.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Conteneur de la carte */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}