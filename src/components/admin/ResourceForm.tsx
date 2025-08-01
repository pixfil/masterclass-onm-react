"use client"

import React, { useState, useEffect } from 'react'
import { Upload, X, Plus } from 'lucide-react'
import { ResourcesService } from '@/lib/supabase/resources'
import { FormationsService } from '@/lib/supabase/formations'
import type { Resource, ResourceFormData, ResourceCategory } from '@/lib/supabase/types/resources-types'
import type { Formation } from '@/lib/supabase/formations-types'

interface ResourceFormProps {
  resource?: Resource
  onSuccess: () => void
  onCancel: () => void
}

export default function ResourceForm({ resource, onSuccess, onCancel }: ResourceFormProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ResourceCategory[]>([])
  const [formations, setFormations] = useState<Formation[]>([])
  const [tags, setTags] = useState<string[]>(resource?.tags || [])
  const [currentTag, setCurrentTag] = useState('')
  const [selectedFormations, setSelectedFormations] = useState<string[]>(resource?.formation_ids || [])
  
  const [formData, setFormData] = useState<ResourceFormData>({
    title: resource?.title || '',
    slug: resource?.slug || '',
    description: resource?.description || '',
    category_id: resource?.category_id || '',
    type: resource?.type || 'pdf',
    file_url: resource?.file_url || '',
    thumbnail_url: resource?.thumbnail_url || '',
    tags: resource?.tags || [],
    access_level: resource?.access_level || 'authenticated',
    formation_ids: resource?.formation_ids || [],
    is_featured: resource?.is_featured || false,
    metadata: resource?.metadata || {}
  })

  useEffect(() => {
    fetchCategories()
    fetchFormations()
  }, [])

  const fetchCategories = async () => {
    const { data } = await ResourcesService.getCategories()
    if (data) setCategories(data)
  }

  const fetchFormations = async () => {
    const { data } = await FormationsService.getFormations({ limit: 100 })
    if (data) setFormations(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const dataToSubmit = {
      ...formData,
      tags,
      formation_ids: selectedFormations
    }

    try {
      if (resource) {
        const { success } = await ResourcesService.updateResource(resource.id, dataToSubmit)
        if (success) onSuccess()
      } else {
        const { success } = await ResourcesService.createResource(dataToSubmit)
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

  const resourceTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'video', label: 'Vidéo' },
    { value: 'guide', label: 'Guide' },
    { value: 'protocol', label: 'Protocole' },
    { value: 'bibliography', label: 'Bibliographie' },
    { value: 'schema', label: 'Schéma' },
    { value: 'thesis', label: 'Thèse' }
  ]

  const accessLevels = [
    { value: 'public', label: 'Public' },
    { value: 'authenticated', label: 'Utilisateurs connectés' },
    { value: 'certified', label: 'Utilisateurs certifiés' },
    { value: 'premium', label: 'Utilisateurs premium' }
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
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

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
              {resourceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau d'accès *
            </label>
            <select
              value={formData.access_level}
              onChange={(e) => setFormData({ ...formData, access_level: e.target.value as any })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {accessLevels.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fichiers */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Fichiers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL du fichier
            </label>
            <input
              type="url"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la miniature
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
        
        <div className="flex items-center space-x-2">
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

      {/* Formations associées */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Formations associées</h3>
        
        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {formations.map((formation) => (
            <label key={formation.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedFormations.includes(formation.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFormations([...selectedFormations, formation.id])
                  } else {
                    setSelectedFormations(selectedFormations.filter(id => id !== formation.id))
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{formation.title}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.is_featured}
            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Mettre en avant cette ressource</span>
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
          {loading ? 'Enregistrement...' : (resource ? 'Mettre à jour' : 'Créer')}
        </button>
      </div>
    </form>
  )
}