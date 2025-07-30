'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { FormationsService } from '@/lib/supabase/formations'
import { supabase } from '@/lib/supabaseClient'
import type { FormationFormData, Instructor } from '@/lib/supabase/formations-types'
import { toast } from 'react-hot-toast'

const NewFormationPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [formData, setFormData] = useState<FormationFormData>({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    duration_days: 1,
    price: 0,
    capacity: 20,
    level: 'debutant',
    module_number: 1,
    prerequisites: [],
    learning_objectives: [],
    program_details: [],
    instructor_id: '',
    featured_image: '',
    gallery_images: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    status: 'draft'
  })

  useEffect(() => {
    loadInstructors()
  }, [])

  const loadInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('instructors')
        .select('*')
        .eq('active', true)
        .order('name')
      
      if (error) throw error
      setInstructors(data || [])
    } catch (error) {
      console.error('Erreur chargement instructeurs:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      seo_title: title
    }))
  }

  const handleArrayFieldChange = (field: keyof FormationFormData, value: string, index?: number) => {
    const currentArray = (formData[field] as string[]) || []
    
    if (index !== undefined) {
      const newArray = [...currentArray]
      newArray[index] = value
      setFormData(prev => ({ ...prev, [field]: newArray }))
    } else {
      // Ajouter un nouvel élément
      if (value.trim()) {
        setFormData(prev => ({ ...prev, [field]: [...currentArray, value.trim()] }))
      }
    }
  }

  const removeArrayItem = (field: keyof FormationFormData, index: number) => {
    const currentArray = (formData[field] as string[]) || []
    const newArray = currentArray.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation basique
      if (!formData.title || !formData.slug || !formData.price) {
        toast.error('Veuillez remplir tous les champs obligatoires')
        return
      }

      // Générer un slug unique
      const uniqueSlug = await FormationsService.generateUniqueSlug(formData.title)
      const dataToSubmit = { ...formData, slug: uniqueSlug }

      const result = await FormationsService.createFormation(dataToSubmit)
      
      if (result.success) {
        toast.success('Formation créée avec succès')
        router.push('/admin/formations')
      } else {
        toast.error('Erreur lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la création de la formation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="nc-NewFormationPage">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/formations"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Retour aux formations
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nouvelle formation
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Créez une nouvelle formation pour la plateforme
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations générales */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre * 
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Titre de la formation"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="slug-formation"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description courte
                  </label>
                  <textarea
                    value={formData.short_description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Brève description pour les cartes"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description complète
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Description détaillée de la formation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durée (jours) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacité maximum
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Niveau
                  </label>
                  <select
                    value={formData.level || 'debutant'}
                    onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="debutant">Débutant</option>
                    <option value="intermediaire">Intermédiaire</option>
                    <option value="avance">Avancé</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formateur
                  </label>
                  <select
                    value={formData.instructor_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">Sélectionner un formateur</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/formations"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer la formation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewFormationPage