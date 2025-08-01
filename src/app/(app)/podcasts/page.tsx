"use client"

import React, { useState, useEffect } from 'react'
import { Play, Mic, Video, Clock, Calendar, Heart, Share2, Search, Filter } from 'lucide-react'
import { MicrophoneIcon } from '@heroicons/react/24/outline'
import { PodcastsService } from '@/lib/supabase/podcasts'
import type { PodcastEpisode } from '@/lib/supabase/types/podcast-types'
import ModernHeader from '@/components/Header/ModernHeader'
import ButtonPrimary from '@/shared/ButtonPrimary'
import Link from 'next/link'

export default function PodcastsPage() {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([])
  const [featuredEpisodes, setFeaturedEpisodes] = useState<PodcastEpisode[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<PodcastEpisode['type'] | ''>('')
  const [seasonFilter, setSeasonFilter] = useState<number | ''>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [availableSeasons, setAvailableSeasons] = useState<number[]>([])

  useEffect(() => {
    fetchFeaturedEpisodes()
    fetchSeasons()
  }, [])

  useEffect(() => {
    fetchEpisodes()
  }, [currentPage, searchQuery, typeFilter, seasonFilter])

  const fetchFeaturedEpisodes = async () => {
    const { data } = await PodcastsService.getFeaturedEpisodes(3)
    if (data) setFeaturedEpisodes(data)
  }

  const fetchSeasons = async () => {
    const { data } = await PodcastsService.getSeasons()
    if (data) setAvailableSeasons(data)
  }

  const fetchEpisodes = async () => {
    setLoading(true)
    const { data, pagination } = await PodcastsService.getEpisodes({
      query: searchQuery,
      filters: {
        type: typeFilter as any || undefined,
        season: seasonFilter as any || undefined
      },
      page: currentPage,
      limit: 9
    })
    
    if (data) {
      setEpisodes(data)
      setTotalPages(pagination.total_pages)
    }
    setLoading(false)
  }

  const episodeTypes = {
    podcast: { label: 'Podcast', icon: Mic, color: 'text-blue-600 bg-blue-100' },
    interview: { label: 'Interview', icon: Mic, color: 'text-purple-600 bg-purple-100' },
    webinar: { label: 'Webinaire', icon: Video, color: 'text-green-600 bg-green-100' }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes} min`
  }

  const formatDate = (date?: string) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <>
      <ModernHeader />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/40 to-cyan-900/20" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 border border-blue-500/30 backdrop-blur-sm mb-6">
              <MicrophoneIcon className="w-4 h-4 mr-2" />
              Contenu audio expert
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Podcasts & <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Interviews</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Écoutez les experts, découvrez les dernières avancées et approfondissez 
              vos connaissances en orthodontie neuro-musculaire
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
          {/* Épisodes en vedette */}
          {featuredEpisodes.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Épisodes en vedette</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredEpisodes.map((episode) => {
                  const typeConfig = episodeTypes[episode.type]
                  const Icon = typeConfig.icon
                  
                  return (
                    <Link 
                      key={episode.id}
                      href={`/podcasts/${episode.slug}`}
                      className="group bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    >
                      {episode.thumbnail_url && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={episode.thumbnail_url}
                            alt={episode.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="p-6 text-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex items-center text-sm opacity-90">
                            <Icon className="w-4 h-4 mr-1" />
                            {typeConfig.label}
                          </span>
                          {episode.duration && (
                            <span className="text-sm opacity-90">
                              {formatDuration(episode.duration)}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-purple-100 transition-colors">
                          {episode.title}
                        </h3>
                        
                        {episode.guest_name && (
                          <p className="text-sm opacity-80 mb-2">
                            avec {episode.guest_name}
                          </p>
                        )}

                        <div className="flex items-center text-sm opacity-80">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(episode.published_at)}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

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
                    placeholder="Titre, invité..."
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value as any)
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Tous les types</option>
                  {Object.entries(episodeTypes).map(([value, config]) => (
                    <option key={value} value={value}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saison
                </label>
                <select
                  value={seasonFilter}
                  onChange={(e) => {
                    setSeasonFilter(e.target.value ? parseInt(e.target.value) : '')
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Toutes les saisons</option>
                  {availableSeasons.map(season => (
                    <option key={season} value={season}>Saison {season}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setTypeFilter('')
                    setSeasonFilter('')
                    setCurrentPage(1)
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Liste des épisodes */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">Aucun épisode trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes.map((episode) => {
                const typeConfig = episodeTypes[episode.type]
                const Icon = typeConfig.icon
                
                return (
                  <Link
                    key={episode.id}
                    href={`/podcasts/${episode.slug}`}
                    className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {episode.thumbnail_url ? (
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img
                          src={episode.thumbnail_url}
                          alt={episode.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                        <Icon className="w-16 h-16 text-purple-600 opacity-50" />
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {typeConfig.label}
                        </span>
                        {episode.episode_number && (
                          <span className="text-sm text-gray-500">
                            Ép. {episode.episode_number}
                            {episode.season && ` • S${episode.season}`}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                        {episode.title}
                      </h3>
                      
                      {episode.short_description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {episode.short_description}
                        </p>
                      )}

                      {episode.guest_name && (
                        <div className="flex items-center mb-3">
                          {episode.guest_photo_url ? (
                            <img
                              src={episode.guest_photo_url}
                              alt={episode.guest_name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2" />
                          )}
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{episode.guest_name}</p>
                            {episode.guest_title && (
                              <p className="text-gray-500 text-xs">{episode.guest_title}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDuration(episode.duration)}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {episode.like_count}
                          </span>
                        </div>
                        <span className="text-xs">{formatDate(episode.published_at)}</span>
                      </div>
                    </div>
                  </Link>
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
                          ? 'bg-purple-600 text-white'
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