'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import { useState, useEffect } from 'react'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { AdminLayout } from '@/components/admin/AdminLayout'

interface Agency {
  id: string
  name: string
  description?: string
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  status: 'active' | 'inactive'
  agents_count: number
  created_at: string
}

const AgenciesContent = () => {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)

  // TODO: Remplacer par de vraies données depuis Supabase
  useEffect(() => {
    // Simulation de données
    setTimeout(() => {
      setAgencies([
        {
          id: '1',
          name: 'Initiative Immobilier Strasbourg',
          description: 'Agence principale spécialisée dans l\'immobilier résidentiel',
          address: '15 rue de la République',
          city: 'Strasbourg',
          postal_code: '67000',
          phone: '03 88 00 00 00',
          email: 'strasbourg@initiative-immobilier.fr',
          website: 'https://initiative-immobilier.fr',
          status: 'active',
          agents_count: 5,
          created_at: '2024-01-01T00:00:00Z'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    
    const labels = {
      active: 'Active',
      inactive: 'Inactive'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <AdminLayout currentPage="agencies">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Gestion des agences</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Gérez les agences et leur organisation
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Ajouter une agence
          </Button>
        </div>

        {/* Agencies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 animate-pulse">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3"></div>
              </div>
            ))
          ) : (
            agencies.map((agency) => (
              <div key={agency.id} className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-3">
                      <BuildingStorefrontIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {agency.name}
                      </h3>
                      {getStatusBadge(agency.status)}
                    </div>
                  </div>
                </div>

                {agency.description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    {agency.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {agency.address && (
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{agency.address}, {agency.city} {agency.postal_code}</span>
                    </div>
                  )}
                  
                  {agency.phone && (
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{agency.phone}</span>
                    </div>
                  )}
                  
                  {agency.email && (
                    <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                      <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{agency.email}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                    <UsersIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{agency.agents_count} agent(s)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Créée le {new Date(agency.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {agencies.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center dark:bg-neutral-800">
            <div className="text-neutral-400 mb-4">
              <BuildingStorefrontIcon className="mx-auto h-12 w-12" />
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Aucune agence trouvée
            </p>
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Créer la première agence
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function AdminAgenciesPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <AgenciesContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}