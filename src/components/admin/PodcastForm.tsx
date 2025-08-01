"use client"

import React, { useState, useEffect } from 'react'
import { Upload, X, Plus, Mic, Video, FileAudio } from 'lucide-react'
import { PodcastsService } from '@/lib/supabase/podcasts'
import { supabase } from '@/lib/supabaseClient'
import type { PodcastEpisode, PodcastFormData } from '@/lib/supabase/types/podcast-types'

interface PodcastFormProps {
  episode?: PodcastEpisode
  onSuccess: () => void
  onCancel: () => void
}

export default function PodcastForm({ episode, onSuccess, onCancel }: PodcastFormProps) {
  const [loading, setLoading] = useState(false)
  const [experts, setExperts] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>(episode?.tags || [])
  const [topics, setTopics] = useState<string[]>(episode?.topics || [])
  const [currentTag, setCurrentTag] = useState('')
  const [currentTopic, setCurrentTopic] = useState('')
  
  const [formData, setFormData] = useState<PodcastFormData>({
    title: episode?.title || '',
    slug: episode?.slug || '',
    description: episode?.description || '',
    short_description: episode?.short_description || '',
    episode_number: episode?.episode_number || undefined,
    season: episode?.season || 1,
    type: episode?.type || 'podcast',
    guest_name: episode?.guest_name || '',
    guest_title: episode?.guest_title || '',
    guest_bio: episode?.guest_bio || '',
    guest_photo_url: episode?.guest_photo_url || '',
    audio_url: episode?.audio_url || '',
    video_url: episode?.video_url || '',
    embed_code: episode?.embed_code || '',
    duration: episode?.duration || undefined,
    transcript: episode?.transcript || '',
    tags: episode?.tags || [],
    topics: episode?.topics || [],
    ceprof_expert_id: episode?.ceprof_expert_id || '',
    thumbnail_url: episode?.thumbnail_url || '',
    is_featured: episode?.is_featured || false,
    published_at: episode?.published_at || '',
    status: episode?.status || 'draft'
  })

  useEffect(() => {
    fetchExperts()
  }, [])

  const fetchExperts = async () => {
    const { data } = await supabase
      .from('ceprof_experts')
      .select('id, name, title')
      .order('name')
    
    if (data) setExperts(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const dataToSubmit = {
      ...formData,
      tags,
      topics,
      duration: formData.duration ? parseInt(formData.duration.toString()) : undefined
    }

    try {
      if (episode) {
        const { success } = await PodcastsService.updateEpisode(episode.id, dataToSubmit)
        if (success) onSuccess()
      } else {
        const { success } = await PodcastsService.createEpisode(dataToSubmit)
        if (success) onSuccess()
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddTopic = () => {
    if (currentTopic && !topics.includes(currentTopic)) {
      setTopics([...topics, currentTopic])
      setCurrentTopic('')
    }
  }

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove))
  }

  const episodeTypes = [
    { value: 'podcast', label: 'Podcast', icon: Mic },
    { value: 'interview', label: 'Interview', icon: Mic },
    { value: 'webinar', label: 'Webinaire', icon: Video }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="Généré automatiquement si vide"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description courte
          </label>
          <input
            type="text"
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            placeholder="Résumé en une phrase"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description complète
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {episodeTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saison
            </label>
            <input
              type="number"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Épisode n°
            </label>
            <input
              type="number"
              value={formData.episode_number || ''}
              onChange={(e) => setFormData({ ...formData, episode_number: parseInt(e.target.value) || undefined })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée (secondes)
            </label>
            <input
              type="number"
              value={formData.duration || ''}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Invité */}
      {(formData.type === 'interview' || formData.type === 'webinar') && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Invité</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expert CEPROF
              </label>
              <select
                value={formData.ceprof_expert_id}
                onChange={(e) => setFormData({ ...formData, ceprof_expert_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un expert</option>
                {experts.map(expert => (
                  <option key={expert.id} value={expert.id}>
                    {expert.name} - {expert.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou nom de l'invité
              </label>
              <input
                type="text"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                placeholder="Si non expert CEPROF"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'invité
              </label>
              <input
                type="text"
                value={formData.guest_title}
                onChange={(e) => setFormData({ ...formData, guest_title: e.target.value })}
                placeholder="Ex: Orthodontiste, Expert ONM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo de l'invité
              </label>
              <input
                type="url"
                value={formData.guest_photo_url}
                onChange={(e) => setFormData({ ...formData, guest_photo_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio de l'invité
            </label>
            <textarea
              value={formData.guest_bio}
              onChange={(e) => setFormData({ ...formData, guest_bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Médias */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Médias</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL audio
            </label>
            <input
              type="url"
              value={formData.audio_url}
              onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL vidéo
            </label>
            <input
              type="url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Miniature
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code d'intégration
            </label>
            <input
              type="text"
              value={formData.embed_code}
              onChange={(e) => setFormData({ ...formData, embed_code: e.target.value })}
              placeholder="YouTube, Spotify..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transcription
          </label>
          <textarea
            value={formData.transcript}
            onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
            rows={6}
            placeholder="Transcription complète de l'épisode..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tags et sujets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Tags et sujets</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Ajouter un tag"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sujets abordés
          </label>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={currentTopic}
              onChange={(e) => setCurrentTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
              placeholder="Ajouter un sujet"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTopic}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(topic)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Publication */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Publication</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de publication
            </label>
            <input
              type="datetime-local"
              value={formData.published_at ? formData.published_at.slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, published_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_featured}
            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Mettre en avant cet épisode</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : (episode ? 'Mettre à jour' : 'Créer')}
        </button>
      </div>
    </form>
  )
}