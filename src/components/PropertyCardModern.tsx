import { PropertyWithImages } from '@/lib/supabase/properties'
import { PropertyLabels } from './PropertyLabels'
import { EnergyLabels } from './DPELabel'
import { WishlistButton } from './WishlistButton'
import { Badge } from '@/shared/Badge'
import { MapPinIcon, HomeIcon, CameraIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FC } from 'react'
import Image from 'next/image'
import { cleanImageUrl } from '@/utils/imageUtils'

interface PropertyCardModernProps {
  className?: string
  property: PropertyWithImages
  showMap?: boolean
}

const PropertyCardModern: FC<PropertyCardModernProps> = ({ 
  className = '', 
  property,
  showMap = false 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getMainImage = () => {
    if (property.gallery_images && property.gallery_images.length > 0) {
      return cleanImageUrl(property.gallery_images[0])
    }
    if (property.featured_image) {
      return cleanImageUrl(property.featured_image)
    }
    return '/placeholder-property.jpg'
  }

  const getPropertyUrl = () => {
    return `/real-estate-listings/${property.slug || property.id}`
  }

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-white shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-300 dark:bg-neutral-900 dark:border-neutral-700 ${className}`}>
      {/* Image avec overlay label */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={getPropertyUrl()}>
          <Image
            src={getMainImage()}
            alt={property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Labels de la propriété */}
        <div className="absolute top-3 left-3 z-10">
          <PropertyLabels labels={[]} size="sm" />
        </div>

        {/* Coins top-right: Badge galerie et Wishlist */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
          {/* Badge galerie */}
          {property.gallery_images && property.gallery_images.length > 1 && (
            <div className="bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <CameraIcon className="h-3 w-3" />
              {property.gallery_images.length}
            </div>
          )}
          
          {/* Bouton wishlist */}
          <WishlistButton 
            propertyId={property.id}
            size="sm"
          />
        </div>

        {/* Badge prix */}
        <div className="absolute bottom-3 left-3 z-10">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg">
            <div className="text-lg font-bold text-neutral-900">
              {formatPrice(property.price)}
            </div>
            {property.transaction_type === 'location' && (
              <div className="text-xs text-neutral-600">/mois</div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-3">
        {/* Titre et localisation */}
        <div>
          <Link href={getPropertyUrl()}>
            <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-2">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>
              {property.hide_address 
                ? `${property.city} (zone approximative)`
                : `${property.city}${property.postal_code ? ` (${property.postal_code})` : ''}`
              }
            </span>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          {/* Surface */}
          {(() => {
            const isLand = property.property_type === 'terrain'
            const surface = isLand 
              ? (property.surface_terrain || property.surface_totale || property.surface_habitable)
              : (property.surface_habitable || property.surface_totale)
            
            if (surface) {
              return (
                <div className="flex items-center gap-1">
                  <HomeIcon className="h-4 w-4" />
                  <span>{surface} m² {isLand ? 'terrain' : ''}</span>
                </div>
              )
            }
            return null
          })()}
          
          {/* Pièces */}
          {property.rooms && (
            <div>
              <span>{property.rooms} {property.rooms === 1 ? 'pièce' : 'pièces'}</span>
            </div>
          )}
          
          {/* Chambres */}
          {property.bedrooms && (
            <div>
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'chambre' : 'ch.'}</span>
            </div>
          )}
          
          {/* Salles de bain */}
          {property.bathrooms && (
            <div>
              <span>{property.bathrooms} sdb</span>
            </div>
          )}
        </div>

        {/* DPE/GES */}
        {(property.dpe_valeur || property.ges_valeur) && (
          <div className="flex justify-center">
            <EnergyLabels
              dpeValue={property.dpe_valeur}
              gesValue={property.ges_valeur}
              size="sm"
              showValues={false}
            />
          </div>
        )}

        {/* Statut */}
        <div className="flex items-center justify-between">
          <Badge 
            color={property.status === 'disponible' ? 'green' : 
                  property.status === 'sous_offre' ? 'orange' : 'red'}
            name={property.status.replace('_', ' ')}
          />
          
          <div className="text-xs text-neutral-500">
            {property.property_type.replace('_', ' ')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyCardModern