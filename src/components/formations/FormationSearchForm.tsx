'use client'

import React, { useState } from 'react'
import { MagnifyingGlassIcon, MapPinIcon, CalendarDaysIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { useRouter } from 'next/navigation'

const cities = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 
  'Lille', 'Nantes', 'Strasbourg', 'Nice', 'Montpellier'
]

const levels = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
  { value: 'expert', label: 'Expert' }
]

const FormationSearchForm = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (selectedCity) params.append('city', selectedCity)
    if (selectedLevel) params.append('level', selectedLevel)
    if (selectedDate) params.append('date', selectedDate)
    
    router.push(`/formations/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Recherche par mot-clé */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Ville */}
          <div className="relative">
            <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Toutes les villes</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Niveau */}
          <div className="relative">
            <AcademicCapIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-primary-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="">Tous les niveaux</option>
              {levels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="relative">
            <CalendarDaysIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="month"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().slice(0, 7)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-transparent focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <ButtonPrimary type="submit" className="px-12">
            Rechercher des formations
          </ButtonPrimary>
        </div>
      </div>
    </form>
  )
}

export default FormationSearchForm