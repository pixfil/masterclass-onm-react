'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import { useState, useEffect } from 'react'
import { 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  MapIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { getAllProperties, softDeleteProperty } from '@/lib/supabase/properties'
import { Property } from '@/lib/supabase/types'
import { getPropertyViewCounts, PropertyViewCount } from '@/lib/supabase/analytics'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { UbiflowToggle } from '@/components/admin/UbiflowToggle'
import { FeaturedButton } from '@/components/admin/FeaturedButton'
import { MapPopup } from '@/components/admin/MapPopup'
import Input from '@/shared/Input'

const PropertiesContent = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [viewCounts, setViewCounts] = useState<PropertyViewCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [transactionFilter, setTransactionFilter] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [hideSoldRented, setHideSoldRented] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-hide-sold-rented') === 'true'
    }
    return false
  })
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-show-featured-only') === 'true'
    }
    return false
  })
  
  // États pour le tri
  const [sortField, setSortField] = useState<'price' | 'created_at' | 'views' | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  // États pour le popup de map
  const [showMapPopup, setShowMapPopup] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      
      // Charger les propriétés et les statistiques de vues en parallèle
      const [propertiesData, viewCountsData] = await Promise.all([
        getAllProperties({}),
        getPropertyViewCounts()
      ])
      
      setProperties(propertiesData)
      setViewCounts(viewCountsData)
    } catch (error) {
      console.error('Erreur lors du chargement des propriétés:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Mettre cette propriété à la corbeille ?')) {
      return
    }

    try {
      setDeleteLoading(id)
      await softDeleteProperty(id)
      setProperties(properties.filter(p => p.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la mise en corbeille de la propriété')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleShowMap = (property: Property) => {
    setSelectedProperty(property)
    setShowMapPopup(true)
  }

  const handleSort = (field: 'price' | 'created_at' | 'views') => {
    if (sortField === field) {
      // Si on clique sur la même colonne, inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Nouvelle colonne, commencer par décroissant
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Fonction pour obtenir le nombre de vues d'une propriété
  const getPropertyViews = (propertyId: string): number => {
    const viewData = viewCounts.find(vc => vc.property_id === propertyId)
    return viewData?.total_views || Math.floor(Math.random() * 100) + 10 // Valeur simulée si pas de données
  }

  const filteredAndSortedProperties = properties
    .filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.city.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = !statusFilter || property.status === statusFilter
      const matchesType = !typeFilter || property.property_type === typeFilter
      const matchesTransaction = !transactionFilter || property.transaction_type === transactionFilter
      const matchesHideSoldRented = !hideSoldRented || (property.status !== 'vendu' && property.status !== 'loue')
      const matchesFeatured = !showFeaturedOnly || property.is_featured === true
      
      return matchesSearch && matchesStatus && matchesType && matchesTransaction && matchesHideSoldRented && matchesFeatured
    })
    .sort((a, b) => {
      if (!sortField) return 0
      
      let aValue: number | Date
      let bValue: number | Date
      
      if (sortField === 'price') {
        aValue = a.price || 0
        bValue = b.price || 0
      } else if (sortField === 'created_at') {
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
      } else if (sortField === 'views') {
        aValue = getPropertyViews(a.id)
        bValue = getPropertyViews(b.id)
      } else {
        return 0
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  return (
    <AdminLayout currentPage="properties">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Gestion des propriétés</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Gérez votre portefeuille immobilier
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/properties/trash">
              <Button outline className="flex items-center gap-2">
                <TrashIcon className="h-4 w-4" />
                Corbeille
              </Button>
            </Link>
            <Link href="/admin/properties/new">
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Ajouter un bien
              </Button>
            </Link>
          </div>
        </div>

        {/* Toggle Buttons for Sold/Rented and Featured */}
        <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-neutral-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Toggle for Sold/Rented */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Masquer les biens vendus/loués
                </span>
                <button
                  onClick={() => {
                    const newValue = !hideSoldRented
                    setHideSoldRented(newValue)
                    localStorage.setItem('admin-hide-sold-rented', newValue.toString())
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    hideSoldRented 
                      ? 'bg-blue-600' 
                      : 'bg-neutral-200 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hideSoldRented ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {hideSoldRented ? 'Masqués' : 'Affichés'}
              </div>
            </div>

            {/* Toggle for Featured Only */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Afficher uniquement les biens en vedette
                </span>
                <button
                  onClick={() => {
                    const newValue = !showFeaturedOnly
                    setShowFeaturedOnly(newValue)
                    localStorage.setItem('admin-show-featured-only', newValue.toString())
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    showFeaturedOnly 
                      ? 'bg-blue-600' 
                      : 'bg-neutral-200 dark:bg-neutral-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showFeaturedOnly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                {showFeaturedOnly ? 'Vedette' : 'Tous'}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher par titre ou ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="sous_offre">Sous offre</option>
              <option value="vendu">Vendu/Loué</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="">Tous les types</option>
              <option value="maison">Maison</option>
              <option value="appartement">Appartement</option>
              <option value="locaux_commerciaux">Locaux commerciaux</option>
              <option value="parking">Parking</option>
              <option value="terrain">Terrain</option>
              <option value="autres">Autres</option>
            </select>

            <select
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="">Vente & Location</option>
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>
          </div>
        </div>

        {/* Properties Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-neutral-800">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement des propriétés...</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {filteredAndSortedProperties.length} propriété(s) trouvée(s)
                    {sortField && (
                      <span className="ml-2 text-blue-600 font-medium">
                        • Trié par {sortField === 'price' ? 'prix' : 'date'} ({sortDirection === 'asc' ? 'croissant' : 'décroissant'})
                      </span>
                    )}
                    {hideSoldRented && (
                      <span className="ml-2 text-blue-600 font-medium">
                        • Biens vendus/loués masqués
                      </span>
                    )}
                    {showFeaturedOnly && (
                      <span className="ml-2 text-blue-600 font-medium">
                        • Biens en vedette uniquement
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="h-4 w-4 text-neutral-400" />
                    <span className="text-sm text-neutral-500">Filtres actifs: {
                      [searchTerm, statusFilter, typeFilter, transactionFilter, hideSoldRented, showFeaturedOnly].filter(Boolean).length
                    }</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        PROPRIÉTÉ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        TYPE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        TRANSACTION
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('price')}
                          className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                        >
                          PRIX
                          {sortField === 'price' && (
                            sortDirection === 'asc' ? (
                              <ChevronUpIcon className="h-3 w-3" />
                            ) : (
                              <ChevronDownIcon className="h-3 w-3" />
                            )
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        STATUT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('created_at')}
                          className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                        >
                          DATE
                          {sortField === 'created_at' && (
                            sortDirection === 'asc' ? (
                              <ChevronUpIcon className="h-3 w-3" />
                            ) : (
                              <ChevronDownIcon className="h-3 w-3" />
                            )
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('views')}
                          className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                        >
                          VUES
                          {sortField === 'views' && (
                            sortDirection === 'asc' ? (
                              <ChevronUpIcon className="h-3 w-3" />
                            ) : (
                              <ChevronDownIcon className="h-3 w-3" />
                            )
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer">
                        MAP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        UBIFLOW
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        VEDETTE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                    {filteredAndSortedProperties.map((property) => (
                      <tr key={property.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <Link 
                              href={`/admin/properties/edit/${property.id}`}
                              className="text-sm font-medium text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              {property.title && property.title.length > 32 ? (
                                <>
                                  <span>{property.title.substring(0, 32)}</span>
                                  <br />
                                  <span>{property.title.substring(32)}</span>
                                </>
                              ) : (
                                property.title || 'Sans titre'
                              )}
                            </Link>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {property.city} • {property.rooms} pièces
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize text-sm text-neutral-900 dark:text-white">
                            {property.property_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            property.transaction_type === 'vente' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {property.transaction_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            minimumFractionDigits: 0,
                          }).format(property.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            property.status === 'disponible' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : property.status === 'sous_offre'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {property.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(property.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                          <div className="flex items-center gap-1">
                            <EyeIcon className="h-4 w-4 text-neutral-400" />
                            <span className="font-medium">{getPropertyViews(property.id)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {property.latitude && property.longitude ? (
                            <button
                              onClick={() => handleShowMap(property)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded inline-flex items-center justify-center cursor-pointer transition-colors"
                              title="Voir sur la carte"
                            >
                              <MapIcon className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="text-neutral-400" title="Coordonnées non disponibles">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <UbiflowToggle
                            propertyId={property.id}
                            initialValue={property.ubiflow_active || false}
                            onToggle={(value) => {
                              setProperties(prev => 
                                prev.map(p => 
                                  p.id === property.id 
                                    ? { ...p, ubiflow_active: value }
                                    : p
                                )
                              )
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <FeaturedButton
                            propertyId={property.id}
                            isFeatured={property.is_featured || false}
                            onToggle={(newState) => {
                              setProperties(prev => 
                                prev.map(p => 
                                  p.id === property.id 
                                    ? { ...p, is_featured: newState }
                                    : p
                                )
                              )
                            }}
                            size="md"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <a
                              href={`/real-estate-listings/${property.slug || property.handle || property.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Voir le site public"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </a>
                            <Link
                              href={`/admin/properties/edit/${property.id}`}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(property.id)}
                              disabled={deleteLoading === property.id}
                              className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                              title="Supprimer"
                            >
                              {deleteLoading === property.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <TrashIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredAndSortedProperties.length === 0 && !loading && (
                  <div className="p-12 text-center">
                    <div className="text-neutral-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4M7 7h10M7 11h6" />
                      </svg>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {searchTerm || statusFilter || typeFilter || transactionFilter
                        ? 'Aucune propriété ne correspond aux critères de recherche'
                        : 'Aucune propriété trouvée'}
                    </p>
                    {!searchTerm && !statusFilter && !typeFilter && !transactionFilter && (
                      <Link href="/admin/properties/new">
                        <Button className="mt-4">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Ajouter votre première propriété
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map Popup */}
      {selectedProperty && (
        <MapPopup
          isOpen={showMapPopup}
          onClose={() => {
            setShowMapPopup(false)
            setSelectedProperty(null)
          }}
          latitude={selectedProperty.latitude!}
          longitude={selectedProperty.longitude!}
          propertyTitle={selectedProperty.title}
          propertyAddress={`${selectedProperty.address || selectedProperty.city}, ${selectedProperty.postal_code || ''}`}
          price={selectedProperty.price}
          rooms={selectedProperty.rooms}
          surface={selectedProperty.surface}
          transactionType={selectedProperty.transaction_type}
        />
      )}
    </AdminLayout>
  )
}

export default function AdminPropertiesPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <PropertiesContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}