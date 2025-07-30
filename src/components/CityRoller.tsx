'use client'

import { useEffect, useState } from 'react'

interface CityRollerProps {
  cities: string[]
}

export const CityRoller = ({ cities }: CityRollerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Filtrer les villes pour exclure "Non spécifié" et les valeurs vides
  const filteredCities = cities.filter(city => 
    city && 
    city.trim() !== '' && 
    !city.toLowerCase().includes('non spécifié') &&
    !city.toLowerCase().includes('non specifie') &&
    !city.toLowerCase().includes('non spécifiée') &&
    !city.toLowerCase().includes('non specifiee')
  )

  // Trouver la ville la plus longue pour définir la largeur
  const longestCity = filteredCities.reduce((longest, current) => 
    current.length > longest.length ? current : longest, filteredCities[0] || ''
  )

  useEffect(() => {
    if (filteredCities.length <= 1) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      
      // Changer l'index au milieu de l'animation pour un effet plus fluide
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % filteredCities.length)
      }, 300) // Milieu de l'animation
      
      // Remettre à false après l'animation complète
      setTimeout(() => {
        setIsAnimating(false)
      }, 600)
    }, 2500) // Change every 2.5 seconds

    return () => clearInterval(interval)
  }, [filteredCities.length])

  if (filteredCities.length === 0) {
    return <span className="text-white px-2">votre région</span>
  }

  if (filteredCities.length === 1) {
    return (
      <span className="text-white px-2 py-1 whitespace-nowrap">
        {filteredCities[0]}
      </span>
    )
  }

  return (
    <span className="relative inline-block overflow-hidden align-baseline px-2" style={{ minHeight: '1.2em' }}>
      {/* Span invisible pour définir la largeur basée sur la ville la plus longue */}
      <span className="invisible whitespace-nowrap py-1">{longestCity}</span>
      
      {/* Animation container avec scroll fluide moderne */}
      <span className="absolute inset-0 flex items-center">
        <span 
          className={`text-white whitespace-nowrap px-2 py-1 transition-all duration-600 ${
            isAnimating 
              ? 'transform -translate-y-full opacity-0 ease-in' 
              : 'transform translate-y-0 opacity-100 ease-out'
          }`}
        >
          {filteredCities[currentIndex]}
        </span>
        
        {/* Ville suivante qui arrive du bas */}
        <span 
          className={`absolute text-white whitespace-nowrap px-2 py-1 transition-all duration-600 ${
            isAnimating 
              ? 'transform translate-y-0 opacity-100 ease-out' 
              : 'transform translate-y-full opacity-0 ease-in'
          }`}
        >
          {filteredCities[(currentIndex + 1) % filteredCities.length]}
        </span>
      </span>
    </span>
  )
}