'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Formation, FormationCategory, DifficultyLevel } from '@/lib/supabase/formations-types'
import { FormationsService, getCategories } from '@/lib/supabase/formations'
import { getCeprofExperts } from '@/lib/supabase/ceprof-experts'
import { uploadFormationImage, deleteFormationImage } from '@/lib/supabase/storage'
import Input from '@/shared/Input'
import Textarea from '@/shared/Textarea'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonSecondary from '@/shared/ButtonSecondary'
import { 
  PhotoIcon, 
  TrashIcon, 
  PlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline'
import Image from 'next/image'
import DateRangePicker from '@/components/forms/DateRangePicker'
import ProgramEditor, { FormationProgram } from './ProgramEditor'

interface FormationFormProps {
  formation?: Formation | null
  onSaveSuccess?: (formation: Formation) => void
}

interface FormationFormData {
  title: string
  short_description: string
  description: string
  price: number
  currency: string
  duration_days: number
  duration_hours: number
  start_date: string
  end_date: string
  category_id: string
  difficulty_level: DifficultyLevel
  language: string
  featured_image: string
  gallery_images: string[]
  video_url: string
  instructor_id: string
  custom_instructor_name: string
  custom_instructor_bio: string
  max_participants: number
  format: 'online' | 'in_person' | 'hybrid'
  city: string
  venue: string
  platform_tools: string
  prerequisites: string
  early_bird_price: number
  early_bird_deadline: string
  group_discount_enabled: boolean
  group_discount_min: number
  group_discount_percent: number
  seo_title: string
  meta_description: string
  keywords: string[]
  tags: string[]
  slug: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  requires_approval: boolean
  certificate_included: boolean
  cpd_points: number
  refund_policy: string
  whats_included: string[]
  learning_objectives: string[]
  target_audience: string
  testimonials: string
  faq: string
  program: FormationProgram
  // Nouveaux champs pour les informations
  venue_name: string
  venue_address: string
  venue_details: string
  start_time: string
  end_time: string
  schedule_details: string
  included_services: string[]
}

const defaultFormData: FormationFormData = {
  title: '',
  short_description: '',
  description: '',
  price: 0,
  currency: 'EUR',
  duration_days: 1,
  duration_hours: 8,
  start_date: '',
  end_date: '',
  category_id: '',
  difficulty_level: 'beginner',
  language: 'fr',
  featured_image: '',
  gallery_images: [],
  video_url: '',
  instructor_id: '',
  custom_instructor_name: '',
  custom_instructor_bio: '',
  max_participants: 20,
  format: 'in_person',
  city: '',
  venue: '',
  platform_tools: '',
  prerequisites: '',
  early_bird_price: 0,
  early_bird_deadline: '',
  group_discount_enabled: false,
  group_discount_min: 5,
  group_discount_percent: 10,
  seo_title: '',
  meta_description: '',
  keywords: [],
  tags: [],
  slug: '',
  status: 'draft',
  featured: false,
  requires_approval: false,
  certificate_included: true,
  cpd_points: 0,
  refund_policy: '',
  whats_included: [],
  learning_objectives: [],
  target_audience: '',
  testimonials: '',
  faq: '',
  program: {
    objectives: [],
    curriculum: [],
    prerequisites: [],
    includes: []
  },
  // Nouveaux champs pour les informations
  venue_name: '',
  venue_address: '',
  venue_details: '',
  start_time: '9h00',
  end_time: '17h30',
  schedule_details: '',
  included_services: []
}

export const FormationForm: React.FC<FormationFormProps> = ({ 
  formation, 
  onSaveSuccess 
}) => {
  const router = useRouter()
  const [formData, setFormData] = useState<FormationFormData>(defaultFormData)
  const [categories, setCategories] = useState<FormationCategory[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, instructorsData] = await Promise.all([
          getCategories(),
          getCeprofExperts()
        ])
        
        setCategories(categoriesData || [])
        setInstructors(instructorsData || [])
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
      }
    }

    loadData()
  }, [])

  // Initialize form data when formation prop changes
  useEffect(() => {
    if (formation) {
      console.log('Formation chargée:', formation)
      console.log('Programme:', formation.program)
      setFormData({
        title: formation.title || '',
        short_description: formation.short_description || '',
        description: formation.description || '',
        price: formation.price || 0,
        currency: formation.currency || 'EUR',
        duration_days: formation.duration_days || 1,
        duration_hours: formation.duration_hours || 8,
        start_date: formation.start_date || '',
        end_date: formation.end_date || '',
        category_id: formation.category_id || '',
        difficulty_level: formation.difficulty_level || 'beginner',
        language: formation.language || 'fr',
        featured_image: formation.featured_image || '',
        gallery_images: formation.gallery_images || [],
        video_url: formation.video_url || '',
        instructor_id: formation.instructor_id || '',
        custom_instructor_name: formation.custom_instructor_name || '',
        custom_instructor_bio: formation.custom_instructor_bio || '',
        max_participants: formation.max_participants || 20,
        format: formation.format || 'in_person',
        city: formation.city || '',
        venue: formation.venue || '',
        platform_tools: formation.platform_tools || '',
        prerequisites: formation.prerequisites || '',
        early_bird_price: formation.early_bird_price || 0,
        early_bird_deadline: formation.early_bird_deadline || '',
        group_discount_enabled: formation.group_discount_enabled || false,
        group_discount_min: formation.group_discount_min || 5,
        group_discount_percent: formation.group_discount_percent || 10,
        seo_title: formation.seo_title || '',
        meta_description: formation.meta_description || '',
        keywords: formation.keywords || [],
        tags: formation.tags || [],
        slug: formation.slug || '',
        status: formation.status || 'draft',
        featured: formation.featured || false,
        requires_approval: formation.requires_approval || false,
        certificate_included: formation.certificate_included || true,
        cpd_points: formation.cpd_points || 0,
        refund_policy: formation.refund_policy || '',
        whats_included: formation.whats_included || [],
        learning_objectives: formation.learning_objectives || [],
        target_audience: formation.target_audience || '',
        testimonials: formation.testimonials || '',
        faq: formation.faq || '',
        program: formation.program ? {
          objectives: formation.program.objectives || [],
          curriculum: formation.program.curriculum || [],
          prerequisites: formation.program.prerequisites || [],
          includes: formation.program.includes || []
        } : {
          objectives: [],
          curriculum: [],
          prerequisites: [],
          includes: []
        },
        // Nouveaux champs pour les informations
        venue_name: formation.venue_name || '',
        venue_address: formation.venue_address || '',
        venue_details: formation.venue_details || '',
        start_time: formation.start_time || '9h00',
        end_time: formation.end_time || '17h30',
        schedule_details: formation.schedule_details || '',
        included_services: formation.included_services || []
      })
    }
  }, [formation])

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title])

  // Auto-calculate duration_days from dates
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date)
      const end = new Date(formData.end_date)
      
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 car inclusif
        
        setFormData(prev => ({ ...prev, duration_days: diffDays }))
      }
    }
  }, [formData.start_date, formData.end_date])

  const handleInputChange = (field: keyof FormationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleArrayInputChange = (field: keyof FormationFormData, index: number, value: string) => {
    setFormData(prev => {
      const array = [...(prev[field] as string[])]
      array[index] = value
      return { ...prev, [field]: array }
    })
  }

  const addArrayItem = (field: keyof FormationFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }))
  }

  const removeArrayItem = (field: keyof FormationFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = async (file: File, isGallery = false) => {
    setUploadingImage(true)
    try {
      const imageUrl = await uploadFormationImage(file, formation?.id || 'new')
      
      if (isGallery) {
        setFormData(prev => ({
          ...prev,
          gallery_images: [...prev.gallery_images, imageUrl]
        }))
      } else {
        setFormData(prev => ({ ...prev, featured_image: imageUrl }))
      }
    } catch (err) {
      console.error('Erreur upload image:', err)
      setError('Erreur lors du téléchargement de l\'image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageDelete = async (imageUrl: string, isGallery = false) => {
    try {
      await deleteFormationImage(imageUrl)
      
      if (isGallery) {
        setFormData(prev => ({
          ...prev,
          gallery_images: prev.gallery_images.filter(img => img !== imageUrl)
        }))
      } else {
        setFormData(prev => ({ ...prev, featured_image: '' }))
      }
    } catch (err) {
      console.error('Erreur suppression image:', err)
      setError('Erreur lors de la suppression de l\'image')
    }
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Le titre est requis')
      return false
    }
    if (!formData.short_description.trim()) {
      setError('La description courte est requise')
      return false
    }
    if (!formData.description.trim()) {
      setError('La description est requise')
      return false
    }
    if (formData.price <= 0) {
      setError('Le prix doit être supérieur à 0')
      return false
    }
    if (!formData.category_id) {
      setError('La catégorie est requise')
      return false
    }
    if (!formData.start_date) {
      setError('La date de début est requise')
      return false
    }
    if (!formData.end_date) {
      setError('La date de fin est requise')
      return false
    }
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('La date de fin doit être après la date de début')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let savedFormation: Formation

      if (formation?.id) {
        // Update existing formation
        const result = await FormationsService.updateFormation(formation.id, formData)
        if (result.success) {
          savedFormation = result.data
          setSuccess('Formation mise à jour avec succès')
        } else {
          throw new Error(result.message || 'Erreur lors de la mise à jour')
        }
      } else {
        // Create new formation
        const result = await FormationsService.createFormation(formData)
        if (result.success) {
          savedFormation = result.data
          setSuccess('Formation créée avec succès')
        } else {
          throw new Error(result.message || 'Erreur lors de la création')
        }
      }

      onSaveSuccess?.(savedFormation)
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      setError('Erreur lors de la sauvegarde de la formation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-400">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-400">{success}</span>
          </div>
        </div>
      )}

      {/* Section 1: Informations de base */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
          Informations de base
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Titre de la formation *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Orthodontie Neuro-Musculaire - Niveau 1"
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description courte *
            </label>
            <Textarea
              value={formData.short_description}
              onChange={(e) => handleInputChange('short_description', e.target.value)}
              placeholder="Description courte qui apparaîtra dans les listes de formations..."
              rows={3}
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Description complète *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description détaillée de la formation, objectifs, contenu..."
              rows={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Prix (€) *
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => handleInputChange('price', Number(e.target.value))}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Sélection des dates de formation *
            </label>
            <DateRangePicker
              startDate={formData.start_date}
              endDate={formData.end_date}
              onStartDateChange={(date) => handleInputChange('start_date', date)}
              onEndDateChange={(date) => handleInputChange('end_date', date)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Durée (jours)
            </label>
            <Input
              type="number"
              value={formData.duration_days}
              onChange={(e) => handleInputChange('duration_days', Number(e.target.value))}
              min="1"
              disabled
              className="bg-neutral-100 dark:bg-neutral-700"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Calculé automatiquement
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Heures par jour
            </label>
            <Input
              type="number"
              value={formData.duration_hours}
              onChange={(e) => handleInputChange('duration_hours', Number(e.target.value))}
              min="1"
              max="12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Catégorie *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => handleInputChange('category_id', e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Niveau de difficulté
            </label>
            <select
              value={formData.difficulty_level}
              onChange={(e) => handleInputChange('difficulty_level', e.target.value as DifficultyLevel)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Participants maximum
            </label>
            <Input
              type="number"
              value={formData.max_participants}
              onChange={(e) => handleInputChange('max_participants', Number(e.target.value))}
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Format
            </label>
            <select
              value={formData.format}
              onChange={(e) => handleInputChange('format', e.target.value as 'online' | 'in_person' | 'hybrid')}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="in_person">Présentiel</option>
              <option value="online">En ligne</option>
              <option value="hybrid">Hybride</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Images et Médias */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
          Images et Médias
        </h3>

        {/* Image principale */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Image principale
          </label>
          {formData.featured_image ? (
            <div className="relative inline-block">
              <Image
                src={formData.featured_image}
                alt="Image principale"
                width={300}
                height={200}
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => handleImageDelete(formData.featured_image)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-6 text-center">
              <PhotoIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500">
                  {uploadingImage ? 'Téléchargement...' : 'Cliquer pour télécharger'}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, false)
                  }}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          )}
        </div>

        {/* Galerie d'images */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Galerie d'images
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.gallery_images.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={image}
                  alt={`Galerie ${index + 1}`}
                  width={150}
                  height={100}
                  className="rounded-lg object-cover w-full h-24"
                />
                <button
                  type="button"
                  onClick={() => handleImageDelete(image, true)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700">
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter une image
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file, true)
              }}
              disabled={uploadingImage}
            />
          </label>
        </div>

        {/* Vidéo */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            URL Vidéo (YouTube, Vimeo...)
          </label>
          <Input
            type="url"
            value={formData.video_url}
            onChange={(e) => handleInputChange('video_url', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
      </div>

      {/* Section 3: Programme détaillé */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
          Programme de la formation
        </h3>
        
        <ProgramEditor
          value={formData.program}
          onChange={(program) => handleInputChange('program', program)}
          durationDays={formData.duration_days}
        />
      </div>

      {/* Section 4: Informations pratiques */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
          Informations pratiques
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lieu */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nom du lieu
            </label>
            <Input
              type="text"
              value={formData.venue_name}
              onChange={(e) => handleInputChange('venue_name', e.target.value)}
              placeholder="Ex: Centre de formation ONM Paris"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Adresse complète
            </label>
            <Input
              type="text"
              value={formData.venue_address}
              onChange={(e) => handleInputChange('venue_address', e.target.value)}
              placeholder="Ex: 123 Rue de la Formation, 75001 Paris"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Détails du lieu
            </label>
            <Textarea
              value={formData.venue_details}
              onChange={(e) => handleInputChange('venue_details', e.target.value)}
              placeholder="Informations complémentaires sur le lieu (accès, parking, etc.)"
              rows={3}
            />
          </div>

          {/* Horaires */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Heure de début
            </label>
            <Input
              type="time"
              value={formData.start_time}
              onChange={(e) => handleInputChange('start_time', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Heure de fin
            </label>
            <Input
              type="time"
              value={formData.end_time}
              onChange={(e) => handleInputChange('end_time', e.target.value)}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Détails des horaires
            </label>
            <Textarea
              value={formData.schedule_details}
              onChange={(e) => handleInputChange('schedule_details', e.target.value)}
              placeholder="Informations complémentaires sur les horaires (pauses, déjeuner, etc.)"
              rows={3}
            />
          </div>

          {/* Services inclus */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Services inclus
            </label>
            <div className="space-y-2">
              {formData.included_services.map((service, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={service}
                    onChange={(e) => {
                      const newServices = [...formData.included_services]
                      newServices[index] = e.target.value
                      handleInputChange('included_services', newServices)
                    }}
                    placeholder="Ex: Petit-déjeuner inclus"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newServices = formData.included_services.filter((_, i) => i !== index)
                      handleInputChange('included_services', newServices)
                    }}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  handleInputChange('included_services', [...formData.included_services, ''])
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Ajouter un service</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <ButtonSecondary 
          onClick={() => router.back()}
          disabled={loading}
        >
          Annuler
        </ButtonSecondary>
        
        <div className="flex space-x-3">
          <ButtonSecondary
            type="submit"
            disabled={loading}
            onClick={() => handleInputChange('status', 'draft')}
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
          </ButtonSecondary>
          
          <ButtonPrimary
            type="submit"
            disabled={loading}
            onClick={() => handleInputChange('status', 'published')}
          >
            {loading ? 'Publication...' : 'Publier'}
          </ButtonPrimary>
        </div>
      </div>
    </form>
  )
}