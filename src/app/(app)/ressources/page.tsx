"use client"

import React, { useState, useEffect } from 'react'
import { Download, Eye, Search, Filter, FileText, Video, BookOpen, FlaskConical, Image, Microscope } from 'lucide-react'
import { FolderOpenIcon } from '@heroicons/react/24/outline'
import { ResourcesService } from '@/lib/supabase/resources'
import type { Resource, ResourceCategory } from '@/lib/supabase/types/resources-types'
import ModernHeader from '@/components/Header/ModernHeader'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Link from 'next/link'

export default function ResourcesPage() {
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
        type: selectedType as any || undefined,
        access_level: 'authenticated' // Filtrer par défaut les ressources accessibles
      },
      page: currentPage,
      limit: 12
    })
    
    if (data) {
      setResources(data)
      setTotalPages(pagination.total_pages)
    }
    setLoading(false)
  }

  const handleDownload = async (resource: Resource) => {
    // Enregistrer le téléchargement
    await ResourcesService.recordDownload(resource.id)
    
    // Ouvrir le fichier dans un nouvel onglet
    if (resource.file_url) {
      window.open(resource.file_url, '_blank')
    }
  }

  const resourceTypeIcons = {
    pdf: { icon: FileText, color: 'text-red-600 bg-red-100' },
    video: { icon: Video, color: 'text-purple-600 bg-purple-100' },
    guide: { icon: BookOpen, color: 'text-blue-600 bg-blue-100' },
    protocol: { icon: FlaskConical, color: 'text-green-600 bg-green-100' },
    bibliography: { icon: Microscope, color: 'text-yellow-600 bg-yellow-100' },
    schema: { icon: Image, color: 'text-indigo-600 bg-indigo-100' },
    thesis: { icon: FileText, color: 'text-gray-600 bg-gray-100' }
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

  return (
    <>
      <ModernHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <FolderOpenIcon className="w-4 h-4 mr-2" />
              Bibliothèque de ressources
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Centre de <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Ressources</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Accédez à une bibliothèque complète de ressources pédagogiques 
              pour approfondir vos connaissances en orthodontie neuro-musculaire
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/formations">
                <ButtonPrimary className="w-full sm:w-auto">
                  Découvrir nos formations
                </ButtonPrimary>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Filtres */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
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
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
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
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setCurrentPage(1)
                  }}
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
                  onChange={(e) => {
                    setSelectedType(e.target.value)
                    setCurrentPage(1)
                  }}
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
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Ressources */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">Aucune ressource trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => {
                const typeConfig = resourceTypeIcons[resource.type]
                const Icon = typeConfig.icon
                
                return (
                  <div key={resource.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    {resource.thumbnail_url && (
                      <div className="h-48 rounded-t-xl overflow-hidden">
                        <img
                          src={resource.thumbnail_url}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {resource.is_featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            En vedette
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {resource.title}
                      </h3>
                      
                      {resource.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {resource.description}
                        </p>
                      )}

                      {resource.category && (
                        <div className="mb-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {resource.category.name}
                          </span>
                        </div>
                      )}

                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {resource.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs text-gray-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {resource.view_count} vues
                        </div>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {resource.download_count} téléchargements
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownload(resource)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Précédent
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

    </>
  )
}