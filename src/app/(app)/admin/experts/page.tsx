'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  StarIcon,
  AcademicCapIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { CEPROFExpertsService, type CEPROFExpert, type ExpertSearchParams, type CEPROFExpertStats } from '@/lib/supabase/ceprof-experts'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

const ExpertsAdminPage = () => {
  const [experts, setExperts] = useState<CEPROFExpert[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CEPROFExpertStats | null>(null)
  const [searchParams, setSearchParams] = useState<ExpertSearchParams>({
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadExperts()
    loadStats()
  }, [searchParams])

  const loadExperts = async () => {
    setLoading(true)
    try {
      const result = await CEPROFExpertsService.getExperts(searchParams)
      if (result.success) {
        setExperts(result.data)
        setPagination(result.pagination)
      } else {
        toast.error('Erreur lors du chargement des experts')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await CEPROFExpertsService.getExpertsStats()
      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Erreur stats:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }))
  }

  const handleFilterChange = (filters: Partial<ExpertSearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...filters, page: 1 }))
  }

  const handleSort = (sortBy: string) => {
    const newOrder = searchParams.sort_by === sortBy && searchParams.sort_order === 'desc' ? 'asc' : 'desc'
    setSearchParams(prev => ({ ...prev, sort_by: sortBy as any, sort_order: newOrder }))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet expert ?')) return
    
    try {
      const result = await CEPROFExpertsService.deleteExpert(id)
      if (result.success) {
        toast.success('Expert supprimé')
        loadExperts()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleExport = async () => {
    try {
      const csvContent = await CEPROFExpertsService.exportExperts(searchParams)
      if (csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `experts_ceprof_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        toast.success('Export réussi')
      } else {
        toast.error('Aucune donnée à exporter')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    }
  }

  const getSpecialtyBadge = (specialty: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800', 
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800'
    ]
    const colorIndex = specialty.length % colors.length
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[colorIndex]}`}>
        {specialty}
      </span>
    )
  }

  return (
    <AuthProvider>
      <ProtectedRoute>
        <AdminLayout currentPage="experts">
          <div className="nc-ExpertsAdminPage">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Experts CEPROF</h1>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Gestion des experts et professionnels du CEPROF
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <FunnelIcon className="-ml-1 mr-2 h-4 w-4" />
                    Filtres
                  </button>
                  
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <ArrowDownTrayIcon className="-ml-1 mr-2 h-4 w-4" />
                    Exporter
                  </button>
                  
                  <button
                    onClick={loadExperts}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    <ArrowPathIcon className="-ml-1 mr-2 h-4 w-4" />
                    Actualiser
                  </button>
                  
                  <Link
                    href="/admin/experts/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Nouvel expert
                  </Link>
                </div>
              </div>

              {/* Statistiques */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{stats.total_experts}</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Total experts
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
                          <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{stats.active_experts}</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Experts actifs
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
                            <span className="text-white font-bold text-sm">{stats.instructors}</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Instructeurs
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
                            <span className="text-white font-bold text-sm">{Math.round(stats.average_experience)}</span>
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                              Exp. moyenne (ans)
                            </dt>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Barre de recherche */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                <div className="p-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher par nom, email..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Filtres */}
              {showFilters && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Statut
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onChange={(e) => handleFilterChange({ is_active: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
                        >
                          <option value="">Tous</option>
                          <option value="true">Actifs</option>
                          <option value="false">Inactifs</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Instructeurs
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onChange={(e) => handleFilterChange({ is_instructor: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
                        >
                          <option value="">Tous</option>
                          <option value="true">Instructeurs</option>
                          <option value="false">Non instructeurs</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Vérification
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onChange={(e) => handleFilterChange({ is_verified: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
                        >
                          <option value="">Tous</option>
                          <option value="true">Vérifiés</option>
                          <option value="false">Non vérifiés</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tri
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          onChange={(e) => setSearchParams(prev => ({ ...prev, sort_by: e.target.value as any }))}
                        >
                          <option value="created_at">Date création</option>
                          <option value="last_name">Nom</option>
                          <option value="years_experience">Expérience</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Liste des experts */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      <p className="mt-2 text-sm text-gray-500">Chargement...</p>
                    </div>
                  ) : experts.length === 0 ? (
                    <div className="text-center py-12">
                      <AcademicCapIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun expert trouvé</p>
                      <p className="text-sm text-gray-500 mb-4">Commencez par ajouter votre premier expert CEPROF</p>
                      <Link
                        href="/admin/experts/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
                        Ajouter un expert
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                              onClick={() => handleSort('last_name')}
                            >
                              Expert
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Contact
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                              onClick={() => handleSort('years_experience')}
                            >
                              Expérience
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Spécialités
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
                          {experts.map((expert) => (
                            <tr key={expert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="relative flex-shrink-0 h-10 w-10">
                                    <Image
                                      className="rounded-full object-cover"
                                      src={expert.profile_photo || '/default-avatar.png'}
                                      alt={`${expert.first_name} ${expert.last_name}`}
                                      fill
                                      sizes="40px"
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="flex items-center">
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {expert.first_name} {expert.last_name}
                                      </div>
                                      {expert.is_instructor && (
                                        <AcademicCapIcon className="ml-1 h-4 w-4 text-blue-500" />
                                      )}
                                      {expert.is_verified && (
                                        <CheckBadgeIcon className="ml-1 h-4 w-4 text-green-500" />
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {expert.practice_location || 'Localisation non précisée'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {expert.email}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {expert.phone || 'Téléphone non renseigné'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {expert.years_experience} ans
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {expert.credentials.length} diplôme{expert.credentials.length > 1 ? 's' : ''}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {expert.specialties.map((specialty, index) => (
                                    <div key={index}>
                                      {getSpecialtyBadge(specialty)}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    expert.is_active 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  }`}>
                                    {expert.is_active ? 'Actif' : 'Inactif'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Link
                                    href={`/admin/experts/edit/${expert.id}`}
                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                  >
                                    <PencilIcon className="h-5 w-5" />
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(expert.id)}
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
                  
                  {/* Pagination */}
                  {pagination.total_pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Affichage de {((pagination.page - 1) * pagination.limit) + 1} à{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} résultats
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSearchParams(prev => ({ ...prev, page: Math.max(1, pagination.page - 1) }))}
                          disabled={pagination.page <= 1}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Précédent
                        </button>
                        <button
                          onClick={() => setSearchParams(prev => ({ ...prev, page: Math.min(pagination.total_pages, pagination.page + 1) }))}
                          disabled={pagination.page >= pagination.total_pages}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default ExpertsAdminPage