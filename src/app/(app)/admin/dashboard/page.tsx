'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { Heading } from '@/shared/Heading'
import { useState, useEffect } from 'react'
import { 
  HomeIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { getAllProperties, getPropertyStatistics } from '@/lib/supabase/properties'
import { Property, PropertyStatistics } from '@/lib/supabase/types'

const DashboardContent = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<PropertyStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Dashboard: Début du chargement des données...')
        
        // Charger les propriétés avec timeout
        const propertiesPromise = getAllProperties({ limit: 5 })
        const statsPromise = getPropertyStatistics()
        
        const [propertiesData, statsData] = await Promise.all([
          propertiesPromise,
          statsPromise
        ])
        
        console.log('Dashboard: Propriétés chargées:', propertiesData?.length || 0)
        console.log('Dashboard: Stats chargées:', statsData)
        
        setProperties(propertiesData || [])
        setStats(statsData)
      } catch (error) {
        console.error('Dashboard: Erreur lors du chargement des données:', error)
        // Définir des valeurs par défaut en cas d'erreur
        setProperties([])
        setStats({
          total_properties: 0,
          for_sale: 0,
          for_rent: 0,
          available: 0,
          under_offer: 0,
          avg_sale_price: null,
          avg_rent_price: null
        })
      } finally {
        console.log('Dashboard: Chargement terminé')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <AdminLayout currentPage="dashboard">
      <div className="space-y-6">
        <div>
          <Heading as="h2" className="text-2xl">Tableau de bord</Heading>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Vue d'ensemble de votre activité immobilière
          </p>
        </div>

        {/* Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse dark:bg-neutral-800">
                    <div className="h-4 bg-neutral-200 rounded mb-2 dark:bg-neutral-700"></div>
                    <div className="h-8 bg-neutral-200 rounded dark:bg-neutral-700"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-800">
                  <div className="flex items-center">
                    <HomeIcon className="h-8 w-8 text-primary-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Total propriétés
                      </p>
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {stats?.total_properties || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-800">
                  <div className="flex items-center">
                    <HomeIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        À vendre
                      </p>
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {stats?.for_sale || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-800">
                  <div className="flex items-center">
                    <HomeIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        À louer
                      </p>
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {stats?.for_rent || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-neutral-800">
                  <div className="flex items-center">
                    <HomeIcon className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Disponibles
                      </p>
                      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                        {stats?.available || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
          <Heading as="h3" className="mb-4">Actions rapides</Heading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/properties/new"
              className="flex items-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 transition-colors dark:border-neutral-600"
            >
              <PlusIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Ajouter un bien</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Créer une nouvelle propriété</p>
              </div>
            </Link>

            <Link
              href="/admin/estimations"
              className="flex items-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 transition-colors dark:border-neutral-600"
            >
              <DocumentTextIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Demandes d'estimation</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Consulter les demandes</p>
              </div>
            </Link>

            <Link
              href="/real-estate"
              className="flex items-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 transition-colors dark:border-neutral-600"
            >
              <EyeIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <p className="font-medium text-neutral-900 dark:text-white">Voir le site</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Interface publique</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Propriétés récentes */}
        <div className="bg-white rounded-xl shadow-sm dark:bg-neutral-800">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between">
              <Heading as="h3">Propriétés récentes</Heading>
              <Link
                href="/admin/properties"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Voir tout
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Propriété
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-800 dark:divide-neutral-700">
                {properties.map((property) => (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {property.title}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {property.city}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-white">
                      {property.property_type}
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
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link href={`/real-estate-listings/${property.slug || property.id}`} target="_blank">
                          <EyeIcon className="h-4 w-4 text-primary-600 hover:text-primary-900" />
                        </Link>
                        <Link href={`/admin/properties/edit/${property.id}`}>
                          <PencilIcon className="h-4 w-4 text-primary-600 hover:text-primary-900" />
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AdminDashboardPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <DashboardContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}