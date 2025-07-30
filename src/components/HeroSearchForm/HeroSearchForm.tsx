import { ListingType } from '@/type'
import { RealEstate02Icon } from '@hugeicons/core-free-icons'
import { IconSvgElement } from '@hugeicons/react'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { Fragment } from 'react'
import { RealEstateHeroSearchForm } from './RealEstateHeroSearchForm'

export const formTabs: {
  name: ListingType
  icon: IconSvgElement
  href: string
  formComponent: React.ComponentType<{ formStyle: 'default' | 'small' }>
}[] = [
  { name: 'RealEstates', icon: RealEstate02Icon, href: '/real-estate-categories-map/all', formComponent: RealEstateHeroSearchForm },
]

const HeroSearchForm = ({ className, initTab = 'RealEstates' }: { className?: string; initTab: ListingType }) => {
  return (
    <div className={clsx('hero-search-form', className)}>
      <Headless.TabGroup defaultIndex={formTabs.findIndex((tab) => tab.name === initTab)}>
        <Headless.TabList className="hidden"></Headless.TabList>
      </Headless.TabGroup>
      {formTabs.map((tab) =>
        tab.name === initTab ? (
          <Fragment key={tab.name}>
            <tab.formComponent formStyle={'default'} />
          </Fragment>
        ) : null
      )}
    </div>
  )
}

export default HeroSearchForm
