'use client'

import { FC } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ButtonPrimary from '@/shared/ButtonPrimary'

interface City {
  city: string
  count: number
}

interface Props {
  cities: City[]
  className?: string
}

// Fonction pour générer automatiquement des images de villes françaises
const getCityImage = (cityName: string): string => {
  // Mapping manuel pour les villes principales d'Alsace
  const cityImages: Record<string, string> = {
    'Strasbourg': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c4e?w=500&h=300&fit=crop&crop=center',
    'Mulhouse': 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=500&h=300&fit=crop&crop=center',
    'Colmar': 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c4e?w=500&h=300&fit=crop&crop=center',
    'Haguenau': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop&crop=center',
    'Schiltigheim': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop&crop=center',
    'Illkirch-Graffenstaden': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop&crop=center',
    'Souffelweyersheim': 'https://images.unsplash.com/photo-1517982255-7d8b8d4c8e3e?w=500&h=300&fit=crop&crop=center',
    'Gambsheim': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop&crop=center',
    'Reichshoffen': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop&crop=center',
    'Wissembourg': 'https://images.unsplash.com/photo-1517982255-7d8b8d4c8e3e?w=500&h=300&fit=crop&crop=center'
  }

  // Si on a une image spécifique pour cette ville
  if (cityImages[cityName]) {
    return cityImages[cityName]
  }

  // Sinon, image générique d'architecture française
  const genericImages = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1517982255-7d8b8d4c8e3e?w=500&h=300&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop&crop=center'
  ]

  // Utiliser un hash simple du nom de ville pour choisir une image cohérente
  const hash = cityName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return genericImages[Math.abs(hash) % genericImages.length]
}

const CityCard: FC<{ city: City }> = ({ city }) => {
  const imageUrl = getCityImage(city.city)
  const citySlug = city.city.toLowerCase().replace(/[^a-z0-9]/g, '-')

  return (
    <Link 
      href={`/real-estate-categories/${citySlug}`}
      className="group block relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={imageUrl}
          alt={`Immobilier à ${city.city}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Contenu */}
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <div className="text-white">
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary-300 transition-colors">
              {city.city}
            </h3>
            <p className="text-white/90 text-sm">
              {city.count} propriété{city.count > 1 ? 's' : ''} disponible{city.count > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Badge avec nombre */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-sm font-semibold text-neutral-800">
            {city.count}
          </span>
        </div>
      </div>
    </Link>
  )
}

const SectionCitiesSlider: FC<Props> = ({ cities, className = '' }) => {
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
      {/* Grille responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cities.map((city) => (
          <CityCard key={city.city} city={city} />
        ))}
      </div>

      {/* Bouton voir plus */}
      <div className="flex justify-center mt-12">
        <ButtonPrimary href="/real-estate-categories/all">
          Voir toutes nos villes
        </ButtonPrimary>
      </div>
    </div>
  )
}

export default SectionCitiesSlider