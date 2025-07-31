'use client'

import { MAPBOX_CONFIG } from '@/config/mapbox'
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'
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

const OrthodontistMapComponent = forwardRef<MapMethods, OrthodontistMapProps>(({
  orthodontists,
  className = '',
  selectedOrthodontistId,
  onOrthodontistClick,
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const popups = useRef<mapboxgl.Popup[]>([])
  const orthodontistPopups = useRef<Map<string, mapboxgl.Popup>>(new Map())

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      if (i < Math.floor(rating)) {
        return `<svg class="h-4 w-4 text-yellow-400 fill-current inline" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
      } else {
        return `<svg class="h-4 w-4 text-gray-300 inline" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`
      }
    }).join('')
  }

  const createOrthodontistPopupContent = (orthodontist: OrthodontistMapData) => {
    return `
      <div class="max-w-sm p-4">
        <div class="space-y-3">
          <!-- Header avec nom et badge -->
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold text-lg leading-tight">${orthodontist.name}</h3>
              <div class="flex items-center mt-1">
                <div class="px-2 py-1 bg-orange-100 rounded-full">
                  <span class="text-xs font-medium text-orange-800">
                    Certifié ONM depuis ${orthodontist.certificationYear}
                  </span>
                </div>
              </div>
            </div>
            <div class="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
            </div>
          </div>

          <!-- Note -->
          ${orthodontist.rating ? `
            <div class="flex items-center space-x-2">
              <div class="flex">
                ${renderStars(orthodontist.rating)}
              </div>
              <span class="text-sm text-gray-600">${orthodontist.rating.toFixed(1)}/5</span>
            </div>
          ` : ''}

          <!-- Contact info -->
          <div class="space-y-2 text-sm">
            <div class="flex items-start gap-2">
              <svg class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <p class="font-medium text-gray-700">${orthodontist.address || ''}</p>
                <p class="text-gray-500">${orthodontist.city} ${orthodontist.postalCode || ''}</p>
              </div>
            </div>
            
            ${orthodontist.phone ? `
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
                </svg>
                <a href="tel:${orthodontist.phone}" class="text-gray-700 hover:text-primary-600">
                  ${orthodontist.phone}
                </a>
              </div>
            ` : ''}
            
            ${orthodontist.email ? `
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                </svg>
                <a href="mailto:${orthodontist.email}" class="text-gray-700 hover:text-primary-600 truncate">
                  ${orthodontist.email}
                </a>
              </div>
            ` : ''}
          </div>

          <!-- Spécialités -->
          ${orthodontist.specialties.length > 0 ? `
            <div>
              <p class="text-xs text-gray-500 mb-1">Spécialités :</p>
              <div class="flex flex-wrap gap-1">
                ${orthodontist.specialties.map(specialty => 
                  `<span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">${specialty}</span>`
                ).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Formations -->
          ${orthodontist.formationsCompleted.length > 0 ? `
            <div class="pt-2 border-t border-gray-200">
              <p class="text-xs text-gray-500 mb-1">Formations complétées :</p>
              <div class="flex flex-wrap gap-1">
                ${orthodontist.formationsCompleted.map(formation => 
                  `<span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">${formation}</span>`
                ).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  // Exposer les méthodes via ref
  useImperativeHandle(ref, () => ({
    openPopupForOrthodontist: (orthodontistId: string) => {
      const orthodontist = orthodontists.find(o => o.id === orthodontistId)
      if (orthodontist && map.current) {
        const displayCoords = orthodontist.coordinates

        // Validation des coordonnées
        if (displayCoords.lat < -90 || displayCoords.lat > 90 || 
            displayCoords.lng < -180 || displayCoords.lng > 180) {
          console.error('Coordonnées invalides:', displayCoords)
          return
        }

        // Fermer tous les autres popups
        popups.current.forEach(p => p.remove())
        
        // Créer un nouveau popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: '350px',
          className: 'orthodontist-popup'
        })
        
        popup
          .setLngLat([displayCoords.lng, displayCoords.lat])
          .setHTML(createOrthodontistPopupContent(orthodontist))
          .addTo(map.current)

        // Centrer sur l'orthodontiste
        map.current.flyTo({
          center: [displayCoords.lng, displayCoords.lat],
          zoom: Math.max(map.current.getZoom(), 16),
          pitch: 45,
          bearing: 0,
          duration: 1000,
        })
      }
    },
    closeAllPopups: () => {
      if (map.current) {
        const existingPopups = document.querySelectorAll('.mapboxgl-popup')
        existingPopups.forEach(popup => popup.remove())
        popups.current.forEach(popup => popup.remove())
      }
    }
  }), [orthodontists])

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const token = MAPBOX_CONFIG.accessToken
    if (!token) {
      console.error('Token Mapbox manquant')
      return
    }
    mapboxgl.accessToken = token

    try {
      // Centre par défaut sur la France
      const defaultCenter = { lng: 2.2137, lat: 46.2276 }
      const defaultZoom = 5

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.mapStyle,
        center: [defaultCenter.lng, defaultCenter.lat],
        zoom: defaultZoom,
        attributionControl: false,
        maxZoom: 20,
        minZoom: 1,
      })

      map.current.on('load', () => {
        if (!map.current) return

        // Ajouter les contrôles
        if (MAPBOX_CONFIG.controls.navigation) {
          map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
        }
        if (MAPBOX_CONFIG.controls.geolocate) {
          map.current.addControl(new mapboxgl.GeolocateControl(), 'top-right')
        }
        if (MAPBOX_CONFIG.controls.scale) {
          map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right')
        }
        if (MAPBOX_CONFIG.controls.fullscreen) {
          map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')
        }

        // Essayer d'ajouter la 3D
        setTimeout(() => {
          if (!map.current) return
          
          try {
            if (map.current.getStyle() && map.current.isStyleLoaded()) {
              // Terrain 3D
              map.current.addSource('mapbox-dem', {
                type: 'raster-dem',
                url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                tileSize: 512,
                maxzoom: 14
              })
              
              map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 })
              
              // Bâtiments 3D
              map.current.addLayer({
                id: '3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 15,
                paint: {
                  'fill-extrusion-color': '#aaa',
                  'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15, 0,
                    15.05, ['get', 'height']
                  ],
                  'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15, 0,
                    15.05, ['get', 'min_height']
                  ],
                  'fill-extrusion-opacity': 0.6
                }
              })
            }
          } catch (error) {
            console.warn('Impossible d\'ajouter la 3D:', error)
          }
        }, 1000)
      })

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error)
      return
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Gérer les marqueurs
  useEffect(() => {
    if (!map.current) return

    // Supprimer les anciens marqueurs
    markers.current.forEach(marker => marker.remove())
    markers.current = []
    popups.current.forEach(popup => popup.remove())
    popups.current = []
    orthodontistPopups.current.clear()

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

    if (validOrthodontists.length === 0) return

    // Ajouter les nouveaux marqueurs
    validOrthodontists.forEach(orthodontist => {
      const displayCoords = orthodontist.coordinates

      // Créer l'élément du marqueur
      const el = document.createElement('div')
      el.className = 'orthodontist-marker'
      el.innerHTML = `
        <div class="relative">
          <div class="cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-3 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-110 ${
            selectedOrthodontistId === orthodontist.id ? 'ring-2 ring-white scale-110' : ''
          }">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rotate-45"></div>
        </div>
      `

      // Créer le popup
      const popup = new mapboxgl.Popup({
        offset: 35,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '350px',
        className: 'orthodontist-popup'
      })

      orthodontistPopups.current.set(orthodontist.id, popup)

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        
        // Fermer tous les autres popups
        popups.current.forEach(p => p.remove())
        
        // Afficher le popup
        popup
          .setLngLat([displayCoords.lng, displayCoords.lat])
          .setHTML(createOrthodontistPopupContent(orthodontist))
          .addTo(map.current!)
        
        // Centrer la carte
        map.current!.flyTo({
          center: [displayCoords.lng, displayCoords.lat],
          zoom: Math.max(map.current!.getZoom(), 16),
          pitch: 45,
          bearing: 0,
          duration: 1000,
        })

        onOrthodontistClick?.(orthodontist)
      })

      const marker = new mapboxgl.Marker(el)
        .setLngLat([displayCoords.lng, displayCoords.lat])
        .addTo(map.current!)

      markers.current.push(marker)
      popups.current.push(popup)
    })

    // Fermer les popups au clic sur la carte
    map.current.on('click', () => {
      popups.current.forEach(popup => popup.remove())
    })

    // Ajuster la vue pour voir tous les marqueurs
    if (validOrthodontists.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      validOrthodontists.forEach(orthodontist => {
        bounds.extend([orthodontist.coordinates.lng, orthodontist.coordinates.lat])
      })
      
      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 10,
      })
    }
  }, [orthodontists, selectedOrthodontistId, onOrthodontistClick])

  // Centrer sur un orthodontiste sélectionné
  useEffect(() => {
    if (selectedOrthodontistId && map.current) {
      const orthodontist = orthodontists.find(o => o.id === selectedOrthodontistId)
      if (orthodontist) {
        const displayCoords = orthodontist.coordinates
        if (displayCoords && 
            displayCoords.lat >= -90 && displayCoords.lat <= 90 &&
            displayCoords.lng >= -180 && displayCoords.lng <= 180) {
          map.current.flyTo({
            center: [displayCoords.lng, displayCoords.lat],
            zoom: 16,
            pitch: 50,
            bearing: 0,
            duration: 1500,
          })
        }
      }
    }
  }, [selectedOrthodontistId, orthodontists])

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />
      
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