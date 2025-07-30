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
  CheckBadgeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { getAllAgents, deleteAgent } from '@/lib/supabase/agents'
import { AgentImmobilier } from '@/lib/supabase/types'
import { AdminLayout } from '@/components/admin/AdminLayout'
import Input from '@/shared/Input'
import Image from 'next/image'

const AgentsContent = () => {
  const [agents, setAgents] = useState<AgentImmobilier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const data = await getAllAgents()
      setAgents(data)
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      return
    }

    try {
      setDeleteLoading(id)
      await deleteAgent(id)
      setAgents(agents.filter(a => a.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression de l\'agent')
    } finally {
      setDeleteLoading(null)
    }
  }

  const filteredAgents = agents.filter(agent => {
    const fullName = `${agent.prenom} ${agent.nom}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    return fullName.includes(searchLower) || 
           agent.email?.toLowerCase().includes(searchLower) ||
           agent.specialites?.some(spec => spec.toLowerCase().includes(searchLower))
  })

  return (
    <AdminLayout currentPage="agents">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading level={2}>Gestion des agents</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Gérez votre équipe d'agents immobiliers
            </p>
          </div>
          <Link href="/admin/agents/new">
            <Button className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Ajouter un agent
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Rechercher par nom, email ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-neutral-800">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Chargement des agents...</p>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {filteredAgents.length} agent(s) trouvé(s)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                  <thead className="bg-neutral-50 dark:bg-neutral-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Spécialités
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
                    {filteredAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative flex-shrink-0 h-10 w-10">
                              <Image
                                className="rounded-full object-cover"
                                src={agent.photo_agent || '/default-avatar.png'}
                                alt={`${agent.prenom} ${agent.nom}`}
                                fill
                                sizes="40px"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-neutral-900 dark:text-white">
                                  {agent.prenom} {agent.nom}
                                </div>
                                {agent.est_super_agent && (
                                  <StarIcon className="ml-1 h-4 w-4 text-yellow-400" />
                                )}
                                {agent.est_verifie && (
                                  <CheckBadgeIcon className="ml-1 h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {agent.annees_experience} ans d'expérience
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-white">
                            {agent.email}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {agent.telephone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-white">
                            ⭐ {agent.note_moyenne}/5 ({agent.nombre_avis_agent} avis)
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {agent.nombre_proprietes_gerees} propriétés gérées
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {agent.specialites?.map((spec, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            agent.est_actif 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {agent.est_actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/agents/edit/${agent.id}`}
                              className="text-primary-600 hover:text-primary-900 p-1 rounded"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(agent.id)}
                              disabled={deleteLoading === agent.id}
                              className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                              title="Supprimer"
                            >
                              {deleteLoading === agent.id ? (
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

                {filteredAgents.length === 0 && !loading && (
                  <div className="p-12 text-center">
                    <div className="text-neutral-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {searchTerm
                        ? 'Aucun agent ne correspond aux critères de recherche'
                        : 'Aucun agent trouvé'
                      }
                    </p>
                    {!searchTerm && (
                      <Link href="/admin/agents/new">
                        <Button className="mt-4">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Ajouter votre premier agent
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

export default function AdminAgentsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <AgentsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}