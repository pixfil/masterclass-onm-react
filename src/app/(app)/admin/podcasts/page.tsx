"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Play, Mic, Video, Eye, Heart, Share2, Edit, Trash2, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import { PodcastsService } from '@/lib/supabase/podcasts'
import type { PodcastEpisode } from '@/lib/supabase/types/podcast-types'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function AdminPodcastsPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<PodcastEpisode['type'] | ''>('')
  const [statusFilter, setStatusFilter] = useState<PodcastEpisode['status'] | ''>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchEpisodes()
  }, [currentPage, searchQuery, typeFilter, statusFilter])

  const fetchEpisodes = async () => {
    setLoading(true)
    const { data, pagination } = await PodcastsService.getEpisodes({
      query: searchQuery,
      filters: {
        type: typeFilter as any || undefined,
        status: statusFilter as any || undefined
      },
      page: currentPage,
      limit: 20
    })
    
    if (data) {
      setEpisodes(data)
      setTotalPages(pagination.total_pages)
    }
    setLoading(false)
  }

  const handleArchive = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir archiver cet épisode ?')) {
      const { success } = await PodcastsService.archiveEpisode(id)
      if (success) {
        fetchEpisodes()
      }
    }
  }

  const episodeTypes = {
    podcast: { label: 'Podcast', icon: Mic, color: 'text-blue-600 bg-blue-100' },
    interview: { label: 'Interview', icon: Mic, color: 'text-purple-600 bg-purple-100' },
    webinar: { label: 'Webinaire', icon: Video, color: 'text-green-600 bg-green-100' }
  }

  const episodeStatus = {
    draft: { label: 'Brouillon', color: 'text-gray-600 bg-gray-100' },
    published: { label: 'Publié', color: 'text-green-600 bg-green-100' },
    archived: { label: 'Archivé', color: 'text-red-600 bg-red-100' }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes} min`
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <AdminLayout currentPage="podcasts">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Podcasts & Interviews</h1>
            <p className="text-gray-600 mt-2">Gérez vos contenus audio et vidéo</p>
          </div>
          <Link
            href="/admin/podcasts/new"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvel épisode
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
                  placeholder="Titre, invité..."
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                {Object.entries(episodeTypes).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(episodeStatus).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setTypeFilter('')
                  setStatusFilter('')
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Liste des épisodes */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun épisode trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Épisode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type / Invité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publié le
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {episodes.map((episode) => {
                    const TypeIcon = episodeTypes[episode.type].icon
                    return (
                      <tr key={episode.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {episode.thumbnail_url && (
                              <img
                                src={episode.thumbnail_url}
                                alt={episode.title}
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {episode.title}
                              </div>
                              {episode.episode_number && (
                                <div className="text-sm text-gray-500">
                                  Épisode {episode.episode_number}
                                  {episode.season && ` • Saison ${episode.season}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${episodeTypes[episode.type].color}`}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {episodeTypes[episode.type].label}
                            </span>
                          </div>
                          {episode.guest_name && (
                            <div className="text-sm text-gray-500 mt-1">
                              {episode.guest_name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(episode.duration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${episodeStatus[episode.status].color}`}>
                            {episodeStatus[episode.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {episode.view_count}
                            </div>
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {episode.like_count}
                            </div>
                            <div className="flex items-center">
                              <Share2 className="w-4 h-4 mr-1" />
                              {episode.share_count}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(episode.published_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={`/admin/podcasts/edit/${episode.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            {episode.status !== 'archived' && (
                              <button
                                onClick={() => handleArchive(episode.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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