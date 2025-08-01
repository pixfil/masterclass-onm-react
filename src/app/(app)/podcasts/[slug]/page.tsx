"use client"

import React, { useState, useEffect } from 'react'
import { Play, Pause, Heart, Share2, Clock, Calendar, Download, ChevronLeft, User } from 'lucide-react'
import { PodcastsService } from '@/lib/supabase/podcasts'
import type { PodcastEpisode } from '@/lib/supabase/types/podcast-types'
import ModernHeader from '@/components/Header/ModernHeader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PodcastDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [relatedEpisodes, setRelatedEpisodes] = useState<PodcastEpisode[]>([])

  useEffect(() => {
    fetchEpisode()
  }, [params.slug])

  const fetchEpisode = async () => {
    setLoading(true)
    const { data } = await PodcastsService.getEpisodeBySlug(params.slug)
    if (data) {
      setEpisode(data)
      fetchRelatedEpisodes(data)
    } else {
      router.push('/podcasts')
    }
    setLoading(false)
  }

  const fetchRelatedEpisodes = async (currentEpisode: PodcastEpisode) => {
    const { data } = await PodcastsService.getEpisodes({
      filters: { type: currentEpisode.type },
      limit: 3
    })
    if (data) {
      setRelatedEpisodes(data.filter(ep => ep.id !== currentEpisode.id).slice(0, 3))
    }
  }

  const handleLike = async () => {
    if (!episode) return
    
    setIsLiked(!isLiked)
    await PodcastsService.updateEngagement(episode.id, {
      has_liked: !isLiked
    })
  }

  const handleShare = async () => {
    if (!episode) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: episode.title,
          text: episode.short_description || '',
          url: window.location.href
        })
        
        await PodcastsService.updateEngagement(episode.id, {
          has_shared: true
        })
      } catch (error) {
        console.error('Erreur lors du partage:', error)
      }
    }
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

  if (loading) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </>
    )
  }

  if (!episode) {
    return null
  }

  return (
    <>
      <ModernHeader />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Hero avec lecteur */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-12">
          <div className="container mx-auto px-4">
            <Link
              href="/podcasts"
              className="inline-flex items-center text-white opacity-80 hover:opacity-100 mb-6"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Retour aux podcasts
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  {episode.episode_number && (
                    <p className="text-white/80 mb-2">
                      Épisode {episode.episode_number}
                      {episode.season && ` • Saison ${episode.season}`}
                    </p>
                  )}
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {episode.title}
                  </h1>
                  
                  {episode.short_description && (
                    <p className="text-xl text-white/90 mb-6">
                      {episode.short_description}
                    </p>
                  )}

                  {/* Lecteur */}
                  {(episode.audio_url || episode.embed_code) && (
                    <div className="bg-black/20 rounded-lg p-4 mb-6">
                      {episode.embed_code ? (
                        <div dangerouslySetInnerHTML={{ __html: episode.embed_code }} />
                      ) : (
                        <audio
                          controls
                          className="w-full"
                          src={episode.audio_url}
                        >
                          Votre navigateur ne supporte pas l'élément audio.
                        </audio>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleLike}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          isLiked 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{episode.like_count + (isLiked ? 1 : 0)}</span>
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Partager</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-4 text-white/80">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(episode.duration)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(episode.published_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                {episode.thumbnail_url && (
                  <img
                    src={episode.thumbnail_url}
                    alt={episode.title}
                    className="w-full rounded-xl shadow-lg"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Description */}
              {episode.description && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">À propos de cet épisode</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="whitespace-pre-line">{episode.description}</p>
                  </div>
                </div>
              )}

              {/* Sujets abordés */}
              {episode.topics && episode.topics.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Sujets abordés</h2>
                  <div className="flex flex-wrap gap-2">
                    {episode.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transcription */}
              {episode.transcript && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Transcription</h2>
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      {showTranscript ? 'Masquer' : 'Afficher'}
                    </button>
                  </div>
                  {showTranscript && (
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-line text-gray-600">
                        {episode.transcript}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              {/* Invité */}
              {(episode.guest_name || episode.ceprof_expert) && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {episode.type === 'interview' ? 'Invité' : 'Intervenant'}
                  </h3>
                  <div className="flex items-start space-x-4">
                    {(episode.guest_photo_url || episode.ceprof_expert?.photo_url) ? (
                      <img
                        src={episode.guest_photo_url || episode.ceprof_expert?.photo_url}
                        alt={episode.guest_name || episode.ceprof_expert?.name}
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {episode.guest_name || episode.ceprof_expert?.name}
                      </p>
                      {(episode.guest_title || episode.ceprof_expert?.title) && (
                        <p className="text-sm text-gray-600">
                          {episode.guest_title || episode.ceprof_expert?.title}
                        </p>
                      )}
                      {episode.guest_bio && (
                        <p className="text-sm text-gray-600 mt-2">
                          {episode.guest_bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {episode.tags && episode.tags.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {episode.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm text-gray-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Épisodes similaires */}
              {relatedEpisodes.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Épisodes similaires
                  </h3>
                  <div className="space-y-4">
                    {relatedEpisodes.map((relatedEpisode) => (
                      <Link
                        key={relatedEpisode.id}
                        href={`/podcasts/${relatedEpisode.slug}`}
                        className="block group"
                      >
                        <div className="flex items-start space-x-3">
                          {relatedEpisode.thumbnail_url ? (
                            <img
                              src={relatedEpisode.thumbnail_url}
                              alt={relatedEpisode.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center">
                              <Play className="w-6 h-6 text-purple-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                              {relatedEpisode.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDuration(relatedEpisode.duration)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  )
}