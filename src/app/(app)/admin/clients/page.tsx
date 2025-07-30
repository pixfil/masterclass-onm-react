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
  HeartIcon,
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { getAllClients, deleteClient, getClientStatistics } from '@/lib/supabase/clients'
import { Client } from '@/lib/supabase/clients'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Input from '@/shared/Input'

const ClientsContent = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [clientStats, setClientStats] = useState<{[key: string]: any}>({})

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await getAllClients()
      setClients(data)
      
      // Charger les statistiques pour chaque client
      const stats: {[key: string]: any} = {}
      for (const client of data) {
        const clientStat = await getClientStatistics(client.id)
        if (clientStat) {
          stats[client.id] = clientStat
        }
      }
      setClientStats(stats)
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return
    }

    try {
      setDeleteLoading(id)
      await deleteClient(id)
      setClients(clients.filter(c => c.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du client')
    } finally {
      setDeleteLoading(null)
    }
  }

  const filteredClients = clients.filter(client => {
    const fullName = `${client.first_name} ${client.last_name}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return fullName.includes(searchLower) || 
           client.email.toLowerCase().includes(searchLower) ||
           client.phone?.toLowerCase().includes(searchLower) ||
           client.city?.toLowerCase().includes(searchLower)
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <AdminLayout currentPage="clients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level={2}>Gestion des clients</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Gérez votre base de clients et leurs listes de souhaits
            </p>
          </div>
          <Link href="/admin/clients/new">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Ajouter un client
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Rechercher par nom, email, téléphone ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-neutral-800">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement des clients...</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {filteredClients.length} client(s) trouvé(s)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Wishlist
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
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                {client.first_name} {client.last_name}
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                Inscrit le {formatDate(client.created_at)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-neutral-900 dark:text-white">
                            <EnvelopeIcon className="h-4 w-4 mr-2 text-neutral-400" />
                            {client.email}
                          </div>
                          {client.phone && (
                            <div className="text-sm text-neutral-500 dark:text-neutral-400 ml-6">
                              {client.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-white">
                            {client.city || 'Non renseigné'}
                          </div>
                          {client.postal_code && (
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {client.postal_code}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <HeartIcon className="h-4 w-4 mr-2 text-red-400" />
                            <span className="text-sm text-neutral-900 dark:text-white">
                              {clientStats[client.id]?.wishlist_count || 0} propriété(s)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              client.is_active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {client.is_active ? 'Actif' : 'Inactif'}
                            </span>
                            {client.newsletter_consent && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 mt-1">
                                Newsletter
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/clients/edit/${client.id}`}
                              className="text-primary-600 hover:text-primary-900 p-1 rounded"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(client.id)}
                              disabled={deleteLoading === client.id}
                              className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                              title="Supprimer"
                            >
                              {deleteLoading === client.id ? (
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

                {filteredClients.length === 0 && !loading && (
                  <div className="p-12 text-center">
                    <div className="text-neutral-400 mb-4">
                      <UserIcon className="mx-auto h-12 w-12" />
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {searchTerm
                        ? 'Aucun client ne correspond aux critères de recherche'
                        : 'Aucun client trouvé'
                      }
                    </p>
                    {!searchTerm && (
                      <Link href="/admin/clients/new">
                        <Button className="mt-4">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Ajouter votre premier client
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
    </AdminLayout>
  )
}

export default function AdminClientsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <ClientsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}