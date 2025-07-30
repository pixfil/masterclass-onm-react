'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import { createProperty, updateProperty } from '@/lib/supabase/properties'
import { getActiveAgents } from '@/lib/supabase/agents'
import { Property, PropertyInsert, AgentImmobilier } from '@/lib/supabase/types'
import { generatePropertySlug } from '@/lib/utils/slugify'
import { ImageGalleryManager } from './ImageGalleryManager'
import { PropertyHighlightsManager } from './PropertyHighlightsManager'
import { PropertyEquipmentsManager } from './PropertyEquipmentsManager'
import { 
  MapIcon,
  PhotoIcon,
  InformationCircleIcon,
  SparklesIcon,
  CogIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

interface PropertyFormProps {
  property?: Property
  isEdit?: boolean
}

export const PropertyForm = ({ property, isEdit = false }: PropertyFormProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agents, setAgents] = useState<AgentImmobilier[]>([])
  
  // Form state
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    property_type: property?.property_type || 'appartement',
    transaction_type: property?.transaction_type || 'vente',
    price: property?.price?.toString() || '',
    city: property?.city || '',
    address: property?.address || '',
    postal_code: property?.postal_code || '',
    latitude: property?.latitude?.toString() || '',
    longitude: property?.longitude?.toString() || '',
    surface: property?.surface?.toString() || '',
    rooms: property?.rooms?.toString() || '',
    bedrooms: property?.bedrooms?.toString() || '',
    bathrooms: property?.bathrooms?.toString() || '',
    floor: property?.floor?.toString() || '',
    parking: property?.parking?.toString() || '',
    balcony: property?.balcony || false,
    terrace: property?.terrace || false,
    garden: property?.garden || false,
    elevator: property?.elevator || false,
    furnished: property?.furnished || false,
    energy_class: property?.energy_class || '',
    heating_type: property?.heating_type || '',
    construction_year: property?.construction_year?.toString() || '',
    charges: property?.charges?.toString() || '',
    tax_fonciere: property?.tax_fonciere?.toString() || '',
    status: property?.status || 'disponible',
    published: property?.published ?? true,
    featured_image: property?.featured_image || '',
    agent_id: property?.agent_id || '',
    nombre_invites_max: property?.nombre_invites_max?.toString() || '',
    acreage: property?.acreage?.toString() || ''
  })

  useEffect(() => {
    // Charger les agents actifs
    const loadAgents = async () => {
      try {
        const agentsList = await getActiveAgents()
        setAgents(agentsList)
      } catch (error) {
        console.error('Erreur lors du chargement des agents:', error)
      }
    }
    loadAgents()
  }, [])

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.title || !formData.price || !formData.city) {
        throw new Error('Veuillez remplir tous les champs obligatoires')
      }

      // Prepare data
      const propertyData: PropertyInsert = {
        title: formData.title,
        description: formData.description,
        property_type: formData.property_type as any,
        transaction_type: formData.transaction_type as any,
        price: parseInt(formData.price),
        city: formData.city,
        address: formData.address,
        postal_code: formData.postal_code,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        surface: parseFloat(formData.surface) || null,
        rooms: parseInt(formData.rooms) || null,
        bedrooms: parseInt(formData.bedrooms) || null,
        bathrooms: parseInt(formData.bathrooms) || null,
        floor: parseInt(formData.floor) || null,
        parking: parseInt(formData.parking) || null,
        balcony: formData.balcony,
        terrace: formData.terrace,
        garden: formData.garden,
        elevator: formData.elevator,
        furnished: formData.furnished,
        energy_class: formData.energy_class || null,
        heating_type: formData.heating_type || null,
        construction_year: parseInt(formData.construction_year) || null,
        charges: parseFloat(formData.charges) || null,
        tax_fonciere: parseFloat(formData.tax_fonciere) || null,
        status: formData.status as any,
        published: formData.published,
        featured_image: formData.featured_image || null,
        agent_id: formData.agent_id || null,
        nombre_invites_max: parseInt(formData.nombre_invites_max) || null,
        acreage: parseFloat(formData.acreage) || null
      }

      if (isEdit && property) {
        await updateProperty(property.id, propertyData)
      } else {
        await createProperty(propertyData)
      }

      router.push('/admin/properties')
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Informations générales */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <InformationCircleIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg">Informations générales</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Titre de l'annonce *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Appartement T3 avec balcon"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Type de bien *
            </label>
            <select
              value={formData.property_type}
              onChange={(e) => handleInputChange('property_type', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              required
            >
              <option value="appartement">Appartement</option>
              <option value="maison">Maison</option>
              <option value="locaux_commerciaux">Locaux commerciaux</option>
              <option value="parking">Parking</option>
              <option value="terrain">Terrain</option>
              <option value="autres">Autres</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Type de transaction *
            </label>
            <select
              value={formData.transaction_type}
              onChange={(e) => handleInputChange('transaction_type', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              required
            >
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>
          </div>

          <Input
            label="Prix *"
            type="number"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="Prix en euros"
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="disponible">Disponible</option>
              <option value="sous_offre">Sous offre</option>
              <option value="vendu">Vendu/Loué</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Agent responsable
            </label>
            <select
              value={formData.agent_id}
              onChange={(e) => handleInputChange('agent_id', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="">Sélectionner un agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.prenom} {agent.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            placeholder="Description détaillée du bien..."
          />
        </div>
      </div>

      {/* Localisation */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <MapIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg">Localisation</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Input
            label="Ville *"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            required
          />

          <Input
            label="Code postal"
            value={formData.postal_code}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
          />

          <div className="lg:col-span-1">
            <Input
              label="Adresse"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          <Input
            label="Latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => handleInputChange('latitude', e.target.value)}
            placeholder="48.5734"
          />

          <Input
            label="Longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => handleInputChange('longitude', e.target.value)}
            placeholder="7.7521"
          />
        </div>
      </div>

      {/* Caractéristiques */}
      <div className="space-y-6">
        <Heading as="h3" className="text-lg">Caractéristiques</Heading>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Input
            label="Surface (m²)"
            type="number"
            value={formData.surface}
            onChange={(e) => handleInputChange('surface', e.target.value)}
          />

          <Input
            label="Nombre de pièces"
            type="number"
            value={formData.rooms}
            onChange={(e) => handleInputChange('rooms', e.target.value)}
          />

          <Input
            label="Chambres"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
          />

          <Input
            label="Salles de bain"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => handleInputChange('bathrooms', e.target.value)}
          />

          <Input
            label="Étage"
            type="number"
            value={formData.floor}
            onChange={(e) => handleInputChange('floor', e.target.value)}
          />

          <Input
            label="Places de parking"
            type="number"
            value={formData.parking}
            onChange={(e) => handleInputChange('parking', e.target.value)}
          />

          <Input
            label="Année de construction"
            type="number"
            value={formData.construction_year}
            onChange={(e) => handleInputChange('construction_year', e.target.value)}
          />

          <Input
            label="Classe énergétique"
            value={formData.energy_class}
            onChange={(e) => handleInputChange('energy_class', e.target.value)}
            placeholder="A, B, C, D, E, F, G"
          />

          <Input
            label="Surface (Sq.Fit)"
            type="number"
            value={formData.acreage}
            onChange={(e) => handleInputChange('acreage', e.target.value)}
            placeholder="Surface en pieds carrés"
          />

          <Input
            label="Nombre d'invités max"
            type="number"
            value={formData.nombre_invites_max}
            onChange={(e) => handleInputChange('nombre_invites_max', e.target.value)}
            placeholder="Capacité d'accueil"
          />
        </div>

        {/* Équipements */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Équipements
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { key: 'balcony', label: 'Balcon' },
              { key: 'terrace', label: 'Terrasse' },
              { key: 'garden', label: 'Jardin' },
              { key: 'elevator', label: 'Ascenseur' },
              { key: 'furnished', label: 'Meublé' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData[key as keyof typeof formData] as boolean}
                  onChange={(e) => handleInputChange(key, e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Informations financières */}
      <div className="space-y-6">
        <Heading as="h3" className="text-lg">Informations financières</Heading>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Charges (€/mois)"
            type="number"
            value={formData.charges}
            onChange={(e) => handleInputChange('charges', e.target.value)}
          />

          <Input
            label="Taxe foncière (€/an)"
            type="number"
            value={formData.tax_fonciere}
            onChange={(e) => handleInputChange('tax_fonciere', e.target.value)}
          />

          <Input
            label="Type de chauffage"
            value={formData.heating_type}
            onChange={(e) => handleInputChange('heating_type', e.target.value)}
            placeholder="Gaz, électrique, fioul..."
          />
        </div>
      </div>

      {/* Points forts */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg">Points forts de la propriété</Heading>
        </div>
        
        <PropertyHighlightsManager 
          propertyId={property?.id || null}
        />
      </div>

      {/* Équipements détaillés */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <CogIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg">Équipements et services</Heading>
        </div>
        
        <PropertyEquipmentsManager 
          propertyId={property?.id || null}
        />
      </div>

      {/* Galerie d'images */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <PhotoIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg">Galerie d&apos;images</Heading>
        </div>
        
        <ImageGalleryManager 
          propertyId={property?.id || null}
          onImagesChange={(images) => {
            // Mettre à jour l'image principale si une image est définie comme featured
            const featuredImage = images.find(img => img.is_featured)
            if (featuredImage) {
              handleInputChange('featured_image', featuredImage.image_url)
            }
          }}
        />
      </div>

      {/* Publication */}
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.published}
            onChange={(e) => handleInputChange('published', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
          />
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Publier immédiatement
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading 
            ? (isEdit ? 'Modification...' : 'Création...') 
            : (isEdit ? 'Modifier' : 'Créer')
          }
        </Button>
      </div>
    </form>
  )
}