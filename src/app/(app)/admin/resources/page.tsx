"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Download, Eye, Edit, Trash2, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import { ResourcesService } from '@/lib/supabase/resources'
import type { Resource, ResourceCategory } from '@/lib/supabase/types/resources-types'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCategories()
    fetchResources()
  }, [currentPage, searchQuery, selectedCategory, selectedType])

  const fetchCategories = async () => {
    const { data } = await ResourcesService.getCategories()
    if (data) setCategories(data)
  }

  const fetchResources = async () => {
    setLoading(true)
    const { data, pagination } = await ResourcesService.getResources({
      query: searchQuery,
      filters: {
        category_id: selectedCategory || undefined,
        type: selectedType as any || undefined
      },
      page: currentPage,
      limit: 20
    })
    
    if (data) {
      setResources(data)
      setTotalPages(pagination.total_pages)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      const { success } = await ResourcesService.deleteResource(id)
      if (success) {
        fetchResources()
      }
    }
  }

  const resourceTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'video', label: 'Vidéo' },
    { value: 'guide', label: 'Guide' },
    { value: 'protocol', label: 'Protocole' },
    { value: 'bibliography', label: 'Bibliographie' },
    { value: 'schema', label: 'Schéma' },
    { value: 'thesis', label: 'Thèse' }
  ]

  const accessLevels = {
    public: { label: 'Public', color: 'bg-green-100 text-green-800' },
    authenticated: { label: 'Connecté', color: 'bg-blue-100 text-blue-800' },
    certified: { label: 'Certifié', color: 'bg-purple-100 text-purple-800' },
    premium: { label: 'Premium', color: 'bg-yellow-100 text-yellow-800' }
  }

  return (
    <AdminLayout currentPage="resources">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Centre de Ressources</h1>
            <p className="text-gray-600 mt-2">Gérez les ressources pédagogiques</p>
          </div>
          <Link
            href="/admin/resources/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle ressource
          </Link>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titre, description..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                {resourceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                  setSelectedType('')
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des ressources */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune ressource trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ressource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Accès
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {resource.thumbnail_url && (
                            <img
                              src={resource.thumbnail_url}
                              alt={resource.title}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {resource.title}
                            </div>
                            {resource.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {resource.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {resourceTypes.find(t => t.value === resource.type)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {resource.category?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${accessLevels[resource.access_level].color}`}>
                          {accessLevels[resource.access_level].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {resource.view_count}
                          </div>
                          <div className="flex items-center">
                            <Download className="w-4 h-4 mr-1" />
                            {resource.download_count}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/admin/resources/edit/${resource.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-4 py-2">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}