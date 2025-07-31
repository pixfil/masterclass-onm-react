'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'
import { FormationsService } from '@/lib/supabase/formations'
import { supabase } from '@/lib/supabaseClient'
import type { Formation } from '@/lib/supabase/formations-types'
import { toast } from 'react-hot-toast'

const FormationsAdminPage = () => {
  const [formations, setFormations] = useState<Formation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadFormations()
  }, [])

  const loadFormations = async () => {
    setLoading(true)
    try {
      // Pour l'admin, récupérer toutes les formations avec leurs sessions
      const { data, error } = await supabase
        .from('formations')
        .select(`
          *,
          instructor:instructors(*),
          sessions:formation_sessions(
            id,
            city,
            venue_name,
            venue_address,
            start_date,
            status
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setFormations(data || [])
    } catch (error) {
      console.error('Erreur chargement formations:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return
    
    try {
      const result = await FormationsService.deleteFormation(id)
      if (result.success) {
        toast.success('Formation supprimée')
        loadFormations()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || formation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      inactive: 'bg-red-100 text-red-800',
      archived: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors] || colors.draft
      }`}>
        {status}
      </span>
    )
  }

  const getLevelBadge = (level?: string) => {
    if (!level) return null
    
    const colors = {
      debutant: 'bg-green-100 text-green-800',
      intermediaire: 'bg-blue-100 text-blue-800',
      avance: 'bg-purple-100 text-purple-800',
      expert: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
        colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800'
      }`}>
        {level}
      </span>
    )
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminLayout currentPage="formations">
          <div className="nc-AdminFormationsPage">
            <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Formations</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Gérez toutes les formations disponibles sur la plateforme
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link
              href="/admin/formations/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nouvelle formation
            </Link>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Titre de la formation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="draft">Brouillon</option>
                  <option value="inactive">Inactif</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={loadFormations}
                  className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                >
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des formations */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-sm text-gray-500">Chargement...</p>
              </div>
            ) : filteredFormations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">Aucune formation trouvée</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Formation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Niveau
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Sessions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Lieu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredFormations.map((formation) => (
                      <tr key={formation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formation.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formation.duration_days} jour{formation.duration_days > 1 ? 's' : ''}
                              {formation.instructor && (
                                <span className="ml-2">• {formation.instructor.name}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatPrice(formation.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getLevelBadge(formation.level)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formation.total_sessions || 0} session{(formation.total_sessions || 0) > 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formation.sessions && formation.sessions.length > 0 ? (
                              <div className="space-y-1">
                                {formation.sessions.slice(0, 2).map((session: any, index: number) => (
                                  <div key={session.id} className="text-xs">
                                    <span className="font-medium">{session.city}</span>
                                    {session.venue_name && (
                                      <span className="text-gray-500"> • {session.venue_name}</span>
                                    )}
                                  </div>
                                ))}
                                {formation.sessions.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{formation.sessions.length - 2} autre{formation.sessions.length > 3 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Aucune session</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(formation.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/formations/${formation.slug}`}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              target="_blank"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            <Link
                              href={`/admin/formations/edit/${formation.id}`}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(formation.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Stats rapides */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{formations.filter(f => f.status === 'active').length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Formations actives
                    </dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{formations.reduce((sum, f) => sum + (f.total_sessions || 0), 0)}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Sessions totales
                    </dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{formations.reduce((sum, f) => sum + (f.total_registrations || 0), 0)}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Inscriptions totales
                    </dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{formations.filter(f => f.status === 'draft').length}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Brouillons
                    </dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
        </AdminLayout>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default FormationsAdminPage