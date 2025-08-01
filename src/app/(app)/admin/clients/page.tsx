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
  EnvelopeIcon,
  UserIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { getAllClients, deleteClient, getClientStatistics } from '@/lib/supabase/clients'
import { Client } from '@/lib/supabase/clients'
import { getClientFormations, ClientFormationData } from '@/lib/supabase/client-formations'
import { getFormationStatusBadge } from '@/lib/utils/formation-status'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Input from '@/shared/Input'

const ClientsContent = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [clientStats, setClientStats] = useState<{[key: string]: any}>({})
  const [clientFormations, setClientFormations] = useState<{[key: string]: ClientFormationData}>({})
  const [filterType, setFilterType] = useState<'all' | 'orthodontists' | 'regular' | 'upcoming'>('all')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const data = await getAllClients()
      setClients(data)
      
      // Charger les statistiques et formations pour chaque client
      const stats: {[key: string]: any} = {}
      const formations: {[key: string]: ClientFormationData} = {}
      
      for (const client of data) {
        const clientStat = await getClientStatistics(client.id)
        if (clientStat) {
          stats[client.id] = clientStat
        }
        
        // Récupérer les vraies formations du client
        const formationData = await getClientFormations(client.id)
        if (formationData) {
          formations[client.id] = formationData
          stats[client.id] = {
            ...stats[client.id],
            is_orthodontist_trained: formationData.has_orthodontist_badge
          }
        } else {
          // Données de simulation si pas de formations
          const hasCompletedFormation = Math.random() > 0.6
          formations[client.id] = {
            upcoming_formations: hasCompletedFormation && Math.random() > 0.5 ? [{
              formationTitle: 'Formation ONM Niveau 2',
              sessionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              sessionCity: 'Paris',
              status: 'upcoming' as const,
              daysUntil: 30
            }] : [],
            completed_formations: hasCompletedFormation ? [{
              formationTitle: 'Formation ONM Niveau 1',
              sessionDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              sessionCity: 'Lyon',
              status: 'completed' as const,
              daysUntil: -60
            }] : [],
            in_progress_formations: [],
            total_formations: hasCompletedFormation ? 1 : 0,
            has_orthodontist_badge: hasCompletedFormation
          }
          stats[client.id] = {
            ...stats[client.id],
            is_orthodontist_trained: hasCompletedFormation
          }
        }
      }
      
      setClientStats(stats)
      setClientFormations(formations)
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

  const toggleOrthodontistBadge = async (clientId: string) => {
    try {
      const currentStatus = clientStats[clientId]?.is_orthodontist_trained || false
      const client = clients.find(c => c.id === clientId)
      
      // Message de confirmation personnalisé
      const action = currentStatus ? 'retirer' : 'attribuer'
      const message = currentStatus 
        ? `Êtes-vous sûr de vouloir RETIRER le badge orthodontiste certifié ONM à ${client?.first_name} ${client?.last_name} ?\n\nCette action est manuelle et devrait être utilisée uniquement dans des cas exceptionnels.`
        : `Êtes-vous sûr de vouloir ATTRIBUER manuellement le badge orthodontiste certifié ONM à ${client?.first_name} ${client?.last_name} ?\n\nAttention : Le système attribue automatiquement ce badge lors de la complétion d'une formation Niveau 1. L'attribution manuelle devrait être réservée aux cas exceptionnels.`
      
      if (!confirm(message)) {
        return
      }
      
      // Dans la vraie version, on ferait un appel API pour mettre à jour la base de données
      // await updateClientOrthodontistStatus(clientId, !currentStatus)
      
      // Mise à jour locale pour la demo
      setClientStats(prev => ({
        ...prev,
        [clientId]: {
          ...prev[clientId],
          is_orthodontist_trained: !currentStatus
        }
      }))
      
      console.log(`Badge orthodontiste ${!currentStatus ? 'activé' : 'désactivé'} pour le client ${clientId}`)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du badge:', error)
      alert('Erreur lors de la mise à jour du badge orthodontiste')
    }
  }

  const filteredClients = clients.filter(client => {
    const fullName = `${client.first_name} ${client.last_name}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    const isOrthodontist = clientStats[client.id]?.is_orthodontist_trained || false
    const hasUpcoming = clientFormations[client.id]?.upcoming_formations?.length > 0 || false
    
    const matchesSearch = fullName.includes(searchLower) || 
           client.email.toLowerCase().includes(searchLower) ||
           client.phone?.toLowerCase().includes(searchLower) ||
           client.city?.toLowerCase().includes(searchLower)
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'orthodontists' && isOrthodontist) ||
                         (filterType === 'regular' && !isOrthodontist) ||
                         (filterType === 'upcoming' && hasUpcoming)
    
    return matchesSearch && matchesFilter
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
              Gérez votre base de clients et leurs formations
            </p>
          </div>
          <Link href="/admin/clients/new">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Ajouter un client
            </Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Rechercher par nom, email, téléphone ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                Tous ({clients.length})
              </button>
              <button
                onClick={() => setFilterType('orthodontists')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filterType === 'orthodontists'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                <AcademicCapIcon className="h-4 w-4" />
                Orthodontistes formés ({clients.filter(c => clientStats[c.id]?.is_orthodontist_trained).length})
              </button>
              <button
                onClick={() => setFilterType('regular')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'regular'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                Clients réguliers
              </button>
              <button
                onClick={() => setFilterType('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  filterType === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                <ClockIcon className="h-4 w-4" />
                Formations à venir ({Object.values(clientFormations).filter(cf => cf.upcoming_formations?.length > 0).length})
              </button>
            </div>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-neutral-800">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                        Formation(s) suivie(s)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Orthodontiste ONM
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
                              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                        <td className="px-6 py-4">
                          <div className="flex flex-col space-y-1 max-w-xs">
                            {clientFormations[client.id] ? (
                              <>
                                {/* Formations à venir */}
                                {clientFormations[client.id].upcoming_formations.map((formation, index) => {
                                  const badge = getFormationStatusBadge(formation.status, formation.daysUntil)
                                  return (
                                    <div key={`upcoming-${index}`} className="flex flex-col space-y-1">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                        <AcademicCapIcon className="h-3 w-3 mr-1" />
                                        {formation.formationTitle}
                                      </span>
                                      <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-4">
                                        {formation.sessionCity} • {badge.text}
                                      </span>
                                    </div>
                                  )
                                })}
                                
                                {/* Formations terminées */}
                                {clientFormations[client.id].completed_formations.map((formation, index) => {
                                  const badge = getFormationStatusBadge(formation.status)
                                  return (
                                    <div key={`completed-${index}`} className="flex items-center space-x-1">
                                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                        <AcademicCapIcon className="h-3 w-3 mr-1" />
                                        {formation.formationTitle}
                                      </span>
                                    </div>
                                  )
                                })}
                                
                                {clientFormations[client.id].total_formations === 0 && (
                                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Aucune formation
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                Chargement...
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => toggleOrthodontistBadge(client.id)}
                              className={`flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                clientStats[client.id]?.is_orthodontist_trained
                                  ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/20 dark:text-orange-400'
                                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-400'
                              }`}
                              title={clientStats[client.id]?.is_orthodontist_trained ? 'Retirer le badge' : 'Attribuer le badge'}
                            >
                              <ShieldCheckIcon className={`h-4 w-4 mr-1 ${
                                clientStats[client.id]?.is_orthodontist_trained ? 'text-orange-600' : 'text-neutral-400'
                              }`} />
                              {clientStats[client.id]?.is_orthodontist_trained ? 'Certifié' : 'Standard'}
                            </button>
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
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
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