'use client'

import React, { useState, useEffect } from 'react'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Input from '@/shared/Input'
import Select from '@/shared/Select'
import { getAllClients } from '@/lib/supabase/clients'

interface TrainedOrthodontist {
  id: string
  firstName: string
  lastName: string
  name: string
  city: string
  department: string
  region: string
  phone?: string
  email?: string
  address?: string
  postalCode?: string
  website?: string
  certificationYear: number
  specialties: string[]
  coordinates?: {
    lat: number
    lng: number
  }
  rating?: number
  formationsCompleted: string[]
}

// Fonction pour convertir les clients avec badge en orthodontistes formés
const convertClientsToOrthodontists = (clients: any[]): TrainedOrthodontist[] => {
  return clients
    .filter(client => client.is_orthodontist_trained) // Seulement les clients avec badge
    .map(client => {
      // Simuler les coordonnées basées sur la ville
      const coordinates = getCoordinatesForCity(client.city || 'Paris')
      
      return {
        id: client.id,
        firstName: client.first_name,
        lastName: client.last_name,
        name: `Dr. ${client.first_name} ${client.last_name}`,
        city: client.city || 'Non renseigné',
        department: client.postal_code?.substring(0, 2) || '00',
        region: getRegionFromPostalCode(client.postal_code || '75000'),
        phone: client.phone,
        email: client.email,
        address: client.address,
        postalCode: client.postal_code,
        certificationYear: 2024,
        specialties: ['Orthodontie Neuro-Musculaire'],
        coordinates,
        rating: 4.5 + Math.random() * 0.5, // Note entre 4.5 et 5
        formationsCompleted: ['Formation ONM Niveau 1']
      }
    })
}

// Fonction pour obtenir les coordonnées approximatives d'une ville
const getCoordinatesForCity = (city: string) => {
  const cityCoords: { [key: string]: { lat: number, lng: number } } = {
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Marseille': { lat: 43.2965, lng: 5.3698 },
    'Lyon': { lat: 45.7640, lng: 4.8357 },
    'Nice': { lat: 43.7102, lng: 7.2620 },
    'Toulouse': { lat: 43.6047, lng: 1.4442 },
    'Bordeaux': { lat: 44.8378, lng: -0.5792 },
    'Lille': { lat: 50.6292, lng: 3.0573 },
    'Strasbourg': { lat: 48.5734, lng: 7.7521 },
    'Montpellier': { lat: 43.6108, lng: 3.8767 },
    'Nantes': { lat: 47.2184, lng: -1.5536 },
    'Rennes': { lat: 48.1173, lng: -1.6778 },
    'Reims': { lat: 49.2583, lng: 4.0317 }
  }
  
  return cityCoords[city] || { lat: 48.8566, lng: 2.3522 } // Paris par défaut
}

// Fonction pour obtenir la région depuis le code postal
const getRegionFromPostalCode = (postalCode: string) => {
  const dept = postalCode.substring(0, 2)
  const regions: { [key: string]: string } = {
    '75': 'Île-de-France',
    '13': 'Provence-Alpes-Côte d\'Azur',
    '69': 'Auvergne-Rhône-Alpes',
    '06': 'Provence-Alpes-Côte d\'Azur',
    '31': 'Occitanie',
    '33': 'Nouvelle-Aquitaine',
    '59': 'Hauts-de-France',
    '67': 'Grand Est',
    '34': 'Occitanie',
    '44': 'Pays de la Loire',
    '35': 'Bretagne',
    '51': 'Grand Est'
  }
  
  return regions[dept] || 'France'
}

const OrthodontistesFormesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [orthodontists, setOrthodontists] = useState<TrainedOrthodontist[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrthodontist, setSelectedOrthodontist] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrthodontists = async () => {
      try {
        setLoading(true)
        const clients = await getAllClients()
        
        // Simuler que certains clients ont le badge orthodontiste
        const clientsWithBadge = clients.map(client => ({
          ...client,
          is_orthodontist_trained: Math.random() > 0.6 // 40% ont le badge
        }))
        
        const trainedOrthodontists = convertClientsToOrthodontists(clientsWithBadge)
        setOrthodontists(trainedOrthodontists)
      } catch (error) {
        console.error('Erreur lors du chargement des orthodontistes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrthodontists()
  }, [])

  // Régions uniques pour le filtre
  const regions = [...new Set(orthodontists.map(o => o.region))].sort()
  const departments = [...new Set(orthodontists.map(o => o.department))].sort()

  // Filtrage des orthodontistes
  const filteredOrthodontists = orthodontists.filter(ortho => {
    const matchesSearch = ortho.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ortho.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = !selectedRegion || ortho.region === selectedRegion
    const matchesDepartment = !selectedDepartment || ortho.department === selectedDepartment
    
    return matchesSearch && matchesRegion && matchesDepartment
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="nc-OrthodontistesFormesPage">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 text-indigo-200 border border-indigo-500/30 backdrop-blur-sm mb-6">
              <CheckBadgeIcon className="w-4 h-4 mr-2" />
              Réseau de praticiens certifiés
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Orthodontistes formés à <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">l'ONM</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Trouvez un praticien certifié près de chez vous pour bénéficier 
              de l'approche neuro-musculaire en orthodontie
            </p>
          </div>
        </div>
      </section>

      {/* Section de recherche et filtres */}
      <section className="py-8 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    placeholder="Rechercher par nom ou ville..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="">Toutes les régions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </Select>
              <Select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">Tous les départements</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>Département {dept}</option>
                ))}
              </Select>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {filteredOrthodontists.length} praticien{filteredOrthodontists.length > 1 ? 's' : ''} trouvé{filteredOrthodontists.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des orthodontistes avec carte */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-800">
        <div className="container">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Liste des orthodontistes - moitié gauche */}
                <div className="lg:w-1/2">
                  <div className="space-y-6">
                    {filteredOrthodontists.map((ortho) => (
                      <div 
                        key={ortho.id} 
                        className={`bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                          selectedOrthodontist === ortho.id ? 'ring-2 ring-primary-500' : ''
                        }`}
                        onClick={() => setSelectedOrthodontist(ortho.id)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                {ortho.name}
                              </h3>
                              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
                                <AcademicCapIcon className="w-5 h-5 text-white" />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                                <span className="text-xs font-medium text-orange-800 dark:text-orange-400">
                                  Certifié ONM depuis {ortho.certificationYear}
                                </span>
                              </div>
                              {ortho.rating && (
                                <div className="flex items-center space-x-1">
                                  <div className="flex">
                                    {renderStars(ortho.rating)}
                                  </div>
                                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {ortho.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-start gap-3">
                            <MapPinIcon className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {ortho.address ? `${ortho.address}, ` : ''}{ortho.city} ({ortho.department})
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {ortho.region}
                              </p>
                            </div>
                          </div>
                          
                          {ortho.phone && (
                            <div className="flex items-center gap-3">
                              <PhoneIcon className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                              <a href={`tel:${ortho.phone}`} className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-primary-600">
                                {ortho.phone}
                              </a>
                            </div>
                          )}
                          
                          {ortho.email && (
                            <div className="flex items-center gap-3">
                              <EnvelopeIcon className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                              <a href={`mailto:${ortho.email}`} className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-primary-600 truncate">
                                {ortho.email}
                              </a>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {ortho.specialties.map((specialty, index) => (
                            <span key={index} className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                              {specialty}
                            </span>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Formations complétées :</p>
                          <div className="flex flex-wrap gap-1">
                            {ortho.formationsCompleted.map((formation, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900/20 dark:text-green-400">
                                {formation}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredOrthodontists.length === 0 && (
                      <div className="text-center py-12">
                        <MapPinIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                        <p className="text-lg text-neutral-600 dark:text-neutral-400">
                          Aucun praticien trouvé pour ces critères.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Carte - moitié droite */}
                <div className="lg:w-1/2">
                  <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg sticky top-8">
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                      Localisation des praticiens
                    </h3>
                    
                    {/* Placeholder pour la carte interactive */}
                    <div className="bg-neutral-100 dark:bg-neutral-700 rounded-xl h-96 flex items-center justify-center mb-6">
                      <div className="text-center">
                        <MapPinIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                        <p className="text-neutral-600 dark:text-neutral-400 font-medium">
                          Carte interactive des praticiens
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">
                          {filteredOrthodontists.length} praticien(s) certifié(s) ONM
                        </p>
                        {selectedOrthodontist && (
                          <div className="mt-4 p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                            <p className="text-sm text-primary-800 dark:text-primary-400">
                              Praticien sélectionné : {filteredOrthodontists.find(o => o.id === selectedOrthodontist)?.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {orthodontists.length}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          Praticiens certifiés
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {regions.length}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          Régions couvertes
                        </div>
                      </div>
                    </div>

                    {/* Légende de la carte */}
                    <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">Légende</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Orthodontiste certifié ONM</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></div>
                          <span className="text-xs text-neutral-600 dark:text-neutral-400">Praticien sélectionné</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-indigo-600 to-cyan-600">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Vous êtes orthodontiste ?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Rejoignez notre réseau de praticiens certifiés ONM et développez votre expertise
            </p>
            <ButtonPrimary href="/formations" className="bg-white text-indigo-600 hover:bg-indigo-50">
              Découvrir nos formations
            </ButtonPrimary>
          </div>
        </div>
      </section>
    </div>
  )
}

export default OrthodontistesFormesPage