'use client'

import PropertyCardH from '@/components/PropertyCardH'
import { TRealEstateCategory } from '@/data/categories'
import { getRealEstateListingFilterOptions, TRealEstateListing } from '@/data/listings'
import { Divider } from '@/shared/divider'
import Pagination from '@/shared/Pagination'
import convertNumbThousand from '@/utils/convertNumbThousand'
import clsx from 'clsx'
import { FC, useState, useRef } from 'react'
import { SimpleMapboxMap, MapMethods } from '@/components/MapboxMap/SimpleMapboxMap'
import { MapProperty } from '@/config/mapbox'

interface Props {
  className?: string
  listings: TRealEstateListing[]
  category: TRealEstateCategory
  searchParams?: { [key: string]: string | string[] | undefined }
}

const SectionGridHasMap: FC<Props> = ({ className, listings, category, searchParams }) => {
  const [currentHoverID, setCurrentHoverID] = useState<string>('')
  const mapRef = useRef<MapMethods | null>(null)

  const handlePropertyHover = (propertyId: string) => {
    setCurrentHoverID(propertyId)
    // Déclencher l'ouverture du popup avec un délai minimal pour éviter les conflits
    setTimeout(() => {
      if (mapRef.current && mapRef.current.openPopupForProperty) {
        mapRef.current.openPopupForProperty(propertyId)
      }
    }, 50)
  }

  const handlePropertyLeave = () => {
    // Attendre un peu avant de fermer pour laisser le temps à l'utilisateur de passer sur la carte
    setTimeout(() => {
      setCurrentHoverID('')
      if (mapRef.current && mapRef.current.closeAllPopups) {
        mapRef.current.closeAllPopups()
      }
    }, 300)
  }

  return (
    <div className={clsx('relative flex min-h-screen gap-6', className)}>
      <div className="flex w-1/2 flex-col gap-y-8 pt-8 pb-20">
        <h1 id="heading" className="text-lg font-semibold sm:text-xl">
          {category.handle === 'all' 
            ? `Découvrez plus de ${convertNumbThousand(category.count)} biens immobiliers`
            : `${convertNumbThousand(category.count)} ${category.name}`
          }
        </h1>
        <Divider />
        <div className="grid grid-cols-1 gap-8">
          {listings.map((listing) => (
            <div
              id={listing.id}
              key={listing.id}
              onMouseEnter={() => handlePropertyHover(listing.id)}
              onMouseLeave={() => handlePropertyLeave()}
            >
              <PropertyCardH data={listing} />
            </div>
          ))}
        </div>
        {listings.length > 0 && (
          <div className="mt-16 flex items-center justify-center">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              {listings.length} résultat{listings.length > 1 ? 's' : ''} affiché{listings.length > 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      <div className="sticky top-0 h-screen w-1/2">
        <SimpleMapboxMap
          ref={mapRef}
          properties={listings.map(listing => {
            // Debug: vérifier les coordonnées
            console.log('Listing coordinates:', listing.title, listing.map)
            
            // Assurer que price est une string et extraire le nombre
            const priceStr = typeof listing.price === 'string' ? listing.price : String(listing.price)
            const priceNum = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0
            const isLocation = priceStr.includes('/mois')
            
            // Vérifier que nous avons des coordonnées valides
            const hasValidCoords = listing.map && 
              typeof listing.map.lat === 'number' && 
              typeof listing.map.lng === 'number' &&
              listing.map.lat !== 0 && 
              listing.map.lng !== 0
            
            if (!hasValidCoords) {
              console.warn('Propriété sans coordonnées valides:', listing.title, listing.map)
            }
            
            return {
              id: listing.id,
              title: listing.title,
              price: priceNum,
              type: listing.listingCategory,
              transaction_type: isLocation ? 'location' as const : 'vente' as const,
              coordinates: {
                lat: listing.map?.lat || 0,
                lng: listing.map?.lng || 0,
              },
              address: listing.address,
              rooms: listing.bedrooms,
              surface: listing.acreage,
              featured_image: listing.featuredImage,
              gallery_images: listing.galleryImgs,
              handle: listing.handle,
              // Les coordonnées sont déjà dans map: { lat, lng }
            }
          }).filter(property => 
            // Filtrer les propriétés qui ont des coordonnées valides
            property.coordinates.lat !== 0 && property.coordinates.lng !== 0
          )}
          selectedPropertyId={currentHoverID}
          onPropertyClick={(property) => {
            const element = document.getElementById(property.id)
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        />
      </div>
    </div>
  )
}

export default SectionGridHasMap
