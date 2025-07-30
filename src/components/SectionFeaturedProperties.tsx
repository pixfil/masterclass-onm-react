'use client'

import PropertyCardH from '@/components/PropertyCardH'
import { TRealEstateListing } from '@/data/listings'
import ButtonPrimary from '@/shared/ButtonPrimary'
import T from '@/utils/getT'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { FC } from 'react'

interface Props {
  listing: TRealEstateListing[]
  className?: string
}

const SectionFeaturedProperties: FC<Props> = ({
  listing,
  className,
}) => {
  return (
    <div className={clsx('relative', className)}>
      <div className={'mt-8 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-1 xl:grid-cols-2'}>
        {listing.map((listingItem) => {
          return <PropertyCardH key={listingItem.id} className="h-full" data={listingItem} />
        })}
      </div>
      {listing.length === 0 && (
        <div className="mt-8 text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">
            Aucune propriété en vedette pour le moment
          </p>
        </div>
      )}
      <div className="mt-16 flex items-center justify-center">
        <ButtonPrimary href={'/real-estate-categories/all'}>
          {T['common']['Show me more']}
          <ArrowRightIcon className="h-5 w-5 rtl:rotate-180" />
        </ButtonPrimary>
      </div>
    </div>
  )
}

export default SectionFeaturedProperties