'use client'

import { MAPBOX_CONFIG, MapProperty } from '@/config/mapbox'
import { PropertyCard } from '@/components/PropertyCard'
import { cleanImageUrl } from '@/utils/imageUtils'
import { calculateOptimalBounds, getDisplayCoordinates, getMarkerColor, createRadiusCircle } from '@/utils/mapUtils'
import mapboxgl from 'mapbox-gl'
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import 'mapbox-gl/dist/mapbox-gl.css'

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

const SimpleMapboxMapComponent = forwardRef<MapMethods, SimpleMapboxMapProps>(({
  properties,
  className = '',
  onPropertyClick,
  selectedPropertyId,
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const popups = useRef<mapboxgl.Popup[]>([])
  const propertyPopups = useRef<Map<string, mapboxgl.Popup>>(new Map())
  const [mapLoaded, setMapLoaded] = useState(false)

  const formatPrice = (price: number, transactionType: 'vente' | 'location' = 'vente') => {
    // Formater avec espaces pour les milliers et le symbole €
    const formattedPrice = price.toLocaleString('fr-FR') + ' €'
    
    return transactionType === 'location' ? `${formattedPrice}/mois` : formattedPrice
  }

  const createPropertyPopupContent = (property: MapProperty) => {
    const images = property.gallery_images || [property.featured_image].filter(Boolean)
    const firstImages = images.slice(0, 3)
    const remainingCount = Math.max(0, images.length - 3)

    return `
      <div class="max-w-sm">
        <!-- Galerie d'images -->
        ${firstImages.length > 0 ? `
          <div class="grid ${firstImages.length === 1 ? 'grid-cols-1' : firstImages.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1 mb-3 rounded-lg overflow-hidden">
            ${firstImages.map((img, index) => `
              <div class="relative ${index === 0 && firstImages.length === 3 ? 'col-span-2 row-span-2' : 'aspect-square'}">
                <img src="${cleanImageUrl(img)}" alt="${property.title}" class="w-full h-full object-cover" />
                ${index === 2 && remainingCount > 0 ? `
                  <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span class="text-white font-semibold">+${remainingCount}</span>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- Informations du bien -->
        <div class="space-y-2">
          <h3 class="font-semibold text-lg leading-tight">${property.title}</h3>
          <p class="text-sm text-gray-600 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
            </svg>
            ${property.hide_address 
              ? `${property.city} (zone approximative - rayon 1km)`
              : property.address
            }
          </p>
          
          <div class="flex items-center justify-between">
            <div class="text-xl font-bold text-primary-600">
              ${formatPrice(property.price, property.transaction_type)}
            </div>
            <div class="text-sm text-gray-500 capitalize">
              ${property.type}
            </div>
          </div>
          
          ${property.rooms || property.surface ? `
            <div class="flex gap-4 text-sm text-gray-600">
              ${property.rooms ? `
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  ${property.rooms} ${property.rooms > 1 ? 'pièces' : 'pièce'}
                </span>
              ` : ''}
              ${property.surface ? `
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15.586 13H14a1 1 0 01-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  ${property.surface}m²
                </span>
              ` : ''}
            </div>
          ` : ''}
          
          <button class="w-full mt-3 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium" onclick="window.location.href='/real-estate-listings/${property.handle || property.id}'">
            Voir le détail
          </button>
        </div>
      </div>
    `
  }

  // Exposer les méthodes via ref
  useImperativeHandle(ref, () => ({
    openPopupForProperty: (propertyId: string) => {
      console.log('🔍 Recherche propriété pour hover. ID cherché:', propertyId)
      console.log('🗺️ IDs disponibles sur la carte:', properties.map(p => ({id: p.id, title: p.title})))
      
      const property = properties.find(p => p.id === propertyId)
      console.log('📍 Propriété trouvée:', property ? `${property.title} (${property.coordinates.lat}, ${property.coordinates.lng})` : 'AUCUNE')
      
      if (property && map.current) {
        const displayCoords = property.coordinates
        console.log('🎯 Coordonnées d\'affichage:', displayCoords)

        // Validation des coordonnées avant le popup
        if (displayCoords.lat < -90 || displayCoords.lat > 90 || 
            displayCoords.lng < -180 || displayCoords.lng > 180) {
          console.error('❌ Coordonnées invalides détectées:', displayCoords)
          return
        }

        // Fermer tous les autres popups d'abord
        popups.current.forEach(p => p.remove())
        
        // Créer un nouveau popup pour cette propriété
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: '350px',
          className: 'property-popup'
        })
        
        // Ouvrir le popup pour cette propriété
        popup
          .setLngLat([displayCoords.lng, displayCoords.lat])
          .setHTML(createPropertyPopupContent(property))
          .addTo(map.current)

        // Voler vers la propriété avec validation
        map.current.flyTo({
          center: [displayCoords.lng, displayCoords.lat],
          zoom: Math.max(map.current.getZoom(), 16),
          pitch: 45,
          bearing: 0,
          duration: 1000,
        })
      } else {
        console.error('❌ Propriété non trouvée pour l\'ID:', propertyId)
      }
    },
    closeAllPopups: () => {
      if (map.current) {
        // Fermer tous les popups Mapbox
        const existingPopups = document.querySelectorAll('.mapboxgl-popup')
        existingPopups.forEach(popup => popup.remove())
        
        // Aussi nettoyer notre liste
        popups.current.forEach(popup => popup.remove())
      }
    }
  }), [properties])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    console.log('🗺️ Initialisation de la carte Mapbox...')
    console.log('Container disponible:', !!mapContainer.current)
    
    // Configurer le token Mapbox
    const token = MAPBOX_CONFIG.accessToken
    if (!token) {
      console.error('Token Mapbox manquant')
      return
    }
    mapboxgl.accessToken = token
    console.log('Token Mapbox configuré:', token.substring(0, 20) + '...')

    try {
      // Initialiser la carte
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.mapStyle,
        center: [MAPBOX_CONFIG.defaultCenter.lng, MAPBOX_CONFIG.defaultCenter.lat],
        zoom: MAPBOX_CONFIG.defaultZoom,
        attributionControl: false,
        maxZoom: 20,
        minZoom: 1,
      })

      // Gestion des erreurs de carte
      map.current.on('error', (e) => {
        console.error('Erreur Mapbox:', e)
      })

      console.log('Carte Mapbox initialisée')
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error)
      return
    }

    // Attendre que la carte soit chargée avant d'ajouter les fonctionnalités
    map.current.on('load', () => {
      if (!map.current) return
      console.log('Carte Mapbox chargée avec succès')

      // Ajouter la 3D de manière plus sûre
      setTimeout(() => {
        if (!map.current) return
        
        try {
          console.log('Tentative d\'ajout des fonctionnalités 3D...')
          
          // Vérifier si le style supporte les fonctionnalités 3D
          if (map.current.getStyle() && map.current.isStyleLoaded()) {
            // Ajouter le terrain 3D Mapbox (seulement si le style le supporte)
            map.current.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512,
              maxzoom: 14
            })
            
            // Activer le terrain 3D
            map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 })
            
            // Ajouter les bâtiments 3D
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

            console.log('Fonctionnalités 3D ajoutées avec succès')
          }
        } catch (error) {
          console.warn('Impossible d\'ajouter la 3D, utilisation de la carte 2D:', error)
        }
      }, 1000) // Délai pour s'assurer que le style est complètement chargé

      // Ajouter la source pour les cercles de rayon
      map.current.addSource('radius-circles', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })

      // Ajouter la couche pour les cercles de rayon
      map.current.addLayer({
        id: 'radius-circles-fill',
        type: 'fill',
        source: 'radius-circles',
        paint: {
          'fill-color': '#3B82F6',
          'fill-opacity': 0.1
        }
      })

      map.current.addLayer({
        id: 'radius-circles-line',
        type: 'line',
        source: 'radius-circles',
        paint: {
          'line-color': '#3B82F6',
          'line-width': 2,
          'line-opacity': 0.6,
          'line-dasharray': [3, 3]
        }
      })

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
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Gérer les marqueurs des propriétés
  useEffect(() => {
    if (!map.current) return

    // Supprimer les anciens marqueurs et popups
    markers.current.forEach(marker => marker.remove())
    markers.current = []
    popups.current.forEach(popup => popup.remove())
    popups.current = []
    propertyPopups.current.clear()

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

    console.log(`📍 Propriétés totales: ${properties.length}, Propriétés avec coordonnées valides: ${validProperties.length}`)
    
    if (validProperties.length === 0) {
      console.warn('⚠️ Aucune propriété avec coordonnées valides à afficher')
      return
    }

    // Ajouter les nouveaux marqueurs
    validProperties.forEach(property => {
      // Utiliser directement les coordonnées de la propriété
      const displayCoords = property.coordinates

      // Validation supplémentaire des coordonnées d'affichage
      if (displayCoords.lat < -90 || displayCoords.lat > 90 || 
          displayCoords.lng < -180 || displayCoords.lng > 180) {
        console.warn('Coordonnées d\'affichage invalides pour:', property.title, displayCoords)
        return
      }

      const el = document.createElement('div')
      el.className = `cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl ${
        selectedPropertyId === property.id
          ? 'bg-primary-600 text-white border-2 border-white transform scale-110'
          : 'bg-white text-neutral-900 hover:bg-primary-50 border border-neutral-200'
      }`
      el.style.transformOrigin = 'center center'
      el.innerHTML = formatPrice(property.price, property.transaction_type)


      // Créer le popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '350px',
        className: 'property-popup'
      })

      // Stocker le popup pour cette propriété
      propertyPopups.current.set(property.id, popup)

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        
        // Fermer tous les autres popups
        popups.current.forEach(p => p.remove())
        
        // Afficher le popup pour cette propriété
        popup
          .setLngLat([displayCoords.lng, displayCoords.lat])
          .setHTML(createPropertyPopupContent(property))
          .addTo(map.current!)
        
        // Centrer la carte sur la propriété avec vue 3D
        const targetZoom = Math.max(map.current!.getZoom(), 16)
        map.current!.flyTo({
          center: [displayCoords.lng, displayCoords.lat],
          zoom: targetZoom,
          pitch: targetZoom >= 15 ? 45 : 0, // Angle 3D pour voir les bâtiments
          bearing: 0,
          duration: 1000,
        })

        // Appeler également la fonction onPropertyClick si elle existe
        onPropertyClick?.(property)
      })

      const marker = new mapboxgl.Marker(el)
        .setLngLat([displayCoords.lng, displayCoords.lat])
        .addTo(map.current!)

      markers.current.push(marker)
      popups.current.push(popup)
    })

    // Mettre à jour les cercles de rayon pour les adresses cachées
    const updateRadiusCircles = () => {
      if (!map.current) return
      
      const hiddenProperties = properties.filter(p => p.hide_address)
      const circles = hiddenProperties.map(property => {
        if (!property.latitude || !property.longitude) return null
        
        const realCoords = { lat: property.latitude, lng: property.longitude }
        const circlePoints = createRadiusCircle(realCoords, 1) // 1km de rayon
        
        return {
          type: 'Feature' as const,
          properties: {
            propertyId: property.id
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [circlePoints]
          }
        }
      }).filter(Boolean)

      if (map.current.getSource('radius-circles')) {
        const source = map.current.getSource('radius-circles') as mapboxgl.GeoJSONSource
        source.setData({
          type: 'FeatureCollection',
          features: circles
        })
      }
    }

    updateRadiusCircles()

    // Fermer les popups quand on clique sur la carte
    map.current.on('click', () => {
      popups.current.forEach(popup => popup.remove())
    })

    // Calculer la vue optimale en fonction des propriétés valides
    if (validProperties.length > 0) {
      const optimalView = calculateOptimalBounds(validProperties)
      
      if (optimalView) {
        if (optimalView.type === 'bounds') {
          // Plusieurs villes : utiliser les bounds
          map.current.fitBounds(optimalView.bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 15,
          })
        } else {
          // Une seule propriété ou une seule ville : centrer avec angle 3D
          map.current.flyTo({
            center: optimalView.center,
            zoom: optimalView.zoom,
            pitch: optimalView.zoom >= 15 ? 45 : 0, // Angle 3D si zoom élevé
            bearing: 0,
            duration: 1500,
          })
        }
      }
    } else {
      console.warn('Aucune propriété avec coordonnées valides trouvée')
    }
  }, [properties, selectedPropertyId, onPropertyClick])

  // Centrer sur une propriété sélectionnée avec vue 3D
  useEffect(() => {
    if (selectedPropertyId && map.current) {
      const property = properties.find(p => p.id === selectedPropertyId)
      if (property) {
        const displayCoords = property.coordinates
        if (displayCoords && 
            displayCoords.lat >= -90 && displayCoords.lat <= 90 &&
            displayCoords.lng >= -180 && displayCoords.lng <= 180) {
          const targetZoom = 16
          map.current.flyTo({
            center: [displayCoords.lng, displayCoords.lat],
            zoom: targetZoom,
            pitch: targetZoom >= 15 ? 50 : 0, // Angle plus prononcé pour la sélection
            bearing: 0,
            duration: 1500,
          })
        } else {
          console.warn('Coordonnées invalides pour la propriété sélectionnée:', property.title, displayCoords)
        }
      }
    }
  }, [selectedPropertyId, properties])

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={mapContainer} className="h-full w-full" />
      
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
          {properties.some(p => p.hide_address) && (
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