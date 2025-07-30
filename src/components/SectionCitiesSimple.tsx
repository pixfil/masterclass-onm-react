'use client'

import { FC } from 'react'
import Link from 'next/link'

interface City {
  city: string
  count: number
}

interface Props {
  cities: City[]
  className?: string
}

const SectionCitiesSimple: FC<Props> = ({ cities, className = '' }) => {
  console.log('SectionCitiesSimple render:', cities)

  if (!cities || cities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">
          Aucune ville disponible pour le moment.
        </p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cities.map((city) => (
          <div 
            key={city.city}
            className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              {city.city}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm">
              {city.count} propriété{city.count > 1 ? 's' : ''} disponible{city.count > 1 ? 's' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SectionCitiesSimple