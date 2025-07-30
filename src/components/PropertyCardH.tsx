import BtnLikeIcon from '@/components/BtnLikeIcon'
import GallerySlider from '@/components/GallerySlider'
import SaleOffBadge from '@/components/SaleOffBadge'
import StartRating from '@/components/StartRating'
import { PropertyLabels } from '@/components/PropertyLabels'
import { TRealEstateListing } from '@/data/listings'
import { Badge } from '@/shared/Badge'
import { UserIcon, HomeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FC } from 'react'
import { Bathtub01Icon, BedSingle01Icon, CropIcon, Share07Icon } from './Icons'

interface PropertyCardHProps {
  className?: string
  data: TRealEstateListing
}

const PropertyCardH: FC<PropertyCardHProps> = ({ className = '', data }) => {
  const {
    galleryImgs,
    title,
    handle: listingHandle,
    like,
    saleOff,
    isAds,
    price,
    reviewStart,
    reviewCount,
    acreage,
    bathrooms,
    bedrooms,
    address,
    date,
    listingCategory,
    maxGuests,
  } = data

  const listingHref = `/real-estate-listings/${listingHandle}`

  const renderSliderGallery = () => {
    return (
      <div className="w-full shrink-0 p-3 sm:w-64">
        <GallerySlider
          ratioClass="aspect-w-1 aspect-h-1"
          galleryImgs={galleryImgs}
          className="h-full w-full overflow-hidden rounded-2xl"
          href={listingHref}
        />

        {saleOff && <SaleOffBadge className="absolute start-5 top-5 bg-orange-500!" />}
      </div>
    )
  }

  const renderTienIch = () => {
    // Détermine quel terme utiliser pour la superficie
    const getSurfaceLabel = () => {
      if (data.property_type === 'terrain') {
        return 'terrain'
      }
      return 'superficie'
    }

    // Obtient la valeur de superficie appropriée
    const getSurfaceValue = () => {
      if (data.property_type === 'terrain') {
        return data.surface_terrain || data.surface_totale || data.acreage
      }
      return data.surface_habitable || data.surface || data.acreage
    }

    const surfaceValue = getSurfaceValue()
    const surfaceLabel = getSurfaceLabel()

    return (
      <div className="inline-grid grid-cols-3 gap-2">
        {bedrooms > 0 && (
          <div className="flex items-center gap-x-2">
            <span className="hidden sm:inline-block">
              <BedSingle01Icon className="h-4 w-4" />
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {bedrooms} {bedrooms === 1 ? 'chambre' : 'chambres'}
            </span>
          </div>
        )}

        {bathrooms > 0 && (
          <div className="flex items-center gap-x-2">
            <span className="hidden sm:inline-block">
              <Bathtub01Icon className="h-4 w-4" />
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {bathrooms} sdb
            </span>
          </div>
        )}

        {surfaceValue > 0 && (
          <div className="flex items-center gap-x-2">
            <span className="hidden sm:inline-block">
              <CropIcon className="h-4 w-4" />
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {surfaceValue} m² {surfaceLabel}
            </span>
          </div>
        )}

        {(data.rooms > 0 && bedrooms === 0 && bathrooms === 0) && (
          <div className="flex items-center gap-x-2">
            <span className="hidden sm:inline-block">
              <HomeIcon className="h-4 w-4" />
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {data.rooms} {data.rooms === 1 ? 'pièce' : 'pièces'}
            </span>
          </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    return (
      <div className="flex grow flex-col items-start p-3 sm:pe-6">
        <div className="w-full space-y-4">
          {data.property_labels && data.property_labels.length > 0 && (
            <PropertyLabels labels={data.property_labels} size="sm" maxDisplay={2} />
          )}
          <div className="flex items-center gap-x-2">
            {isAds && <Badge color="green">Ads</Badge>}
            <h2 className="text-lg font-medium capitalize">
              <span className="line-clamp-2">{title}</span>
            </h2>
          </div>
          {renderTienIch()}
          <div className="w-14 border-b border-neutral-200/80 dark:border-neutral-700"></div>
          <div className="flex w-full items-end justify-between">
            <StartRating reviewCount={reviewCount} point={reviewStart} />
            <span className="flex items-center justify-center rounded-lg border-2 border-secondary-500 px-2.5 py-1.5 text-sm leading-none font-medium text-secondary-500">
              {typeof price === 'string' && price.includes('€') ? price : 
                typeof price === 'string' && price.includes('/mois') ? price :
                typeof price === 'string' ? price.replace('$', '').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €' :
                String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €'
              }
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white nc-PropertyCardH dark:border-neutral-700 dark:bg-neutral-900 ${className}`}
    >
      <Link href={listingHref} className="absolute inset-0"></Link>
      <div className="flex h-full w-full flex-col sm:flex-row sm:items-center">
        {renderSliderGallery()}
        {renderContent()}
      </div>
      <BtnLikeIcon
        colorClass="bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200/70 text-neutral-600 dark:text-neutral-400"
        isLiked={like}
        className="absolute end-5 top-5 sm:end-3 sm:top-3"
      />
    </div>
  )
}

export default PropertyCardH
