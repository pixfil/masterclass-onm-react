'use client'

import PropertyCardH from '@/components/PropertyCardH'
import { TRealEstateListing } from '@/data/listings'
import ButtonPrimary from '@/shared/ButtonPrimary'
import T from '@/utils/getT'
import { ArrowRightIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { FC, useState, useMemo } from 'react'
import SectionTabHeader from './SectionTabHeader'

interface Props {
  listing: TRealEstateListing[]
  heading?: string
  subHeading?: string
  tabs?: string[]
  className?: string
}

const SectionGridFeatureProperty: FC<Props> = ({
  listing,
  heading = 'Découvrez votre bien idéal',
  subHeading = 'Explorez les meilleures propriétés de votre région.',
  tabs = ['Strasbourg', 'Colmar', 'Mulhouse', 'Haguenau'],
  className,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0] || 'Tous')

  // Filtrer les annonces selon la ville sélectionnée
  const filteredListings = useMemo(() => {
    // Vérifier que listing est défini et est un tableau
    if (!listing || !Array.isArray(listing)) {
      return []
    }
    
    if (activeTab === 'Tous' || !activeTab) {
      return listing
    }
    
    return listing.filter(item => {
      if (!item) return false
      
      // Vérifier dans l'adresse ET dans le titre
      const addressMatch = item.address?.toLowerCase().includes(activeTab.toLowerCase())
      const titleMatch = item.title?.toLowerCase().includes(activeTab.toLowerCase())
      return addressMatch || titleMatch
    })
  }, [listing, activeTab])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className={clsx('relative', className)}>
      <SectionTabHeader
        tabActive={activeTab}
        subHeading={subHeading}
        tabs={tabs}
        heading={heading}
        onChangeTab={handleTabChange}
        rightButtonHref="/real-estate-categories/all"
      />
      <div className={'mt-8 grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-1 xl:grid-cols-2'}>
        {filteredListings.map((listing) => {
          return <PropertyCardH key={listing.id} className="h-full" data={listing} />
        })}
      </div>
      {filteredListings.length === 0 && (
        <div className="mt-8 text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">
            Aucune propriété trouvée pour {activeTab}
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

export default SectionGridFeatureProperty
