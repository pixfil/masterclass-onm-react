'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import { createProperty, updateProperty } from '@/lib/supabase/properties'
import { getActiveAgents } from '@/lib/supabase/agents'
import { getPropertyLabels, updatePropertyLabels } from '@/lib/supabase/propertyLabels'
import { Property, PropertyInsert, AgentImmobilier } from '@/lib/supabase/types'
import { ImageGalleryManager } from './ImageGalleryManager'
import { PropertyHighlightsManager } from './PropertyHighlightsManager'
import { PropertyEquipmentsManager } from './PropertyEquipmentsManager'
import { AddressAutocomplete } from './AddressAutocomplete'
import { PropertyLabelsManager } from './PropertyLabelsManager'
import { EnergyLabels } from '@/components/DPELabel'
import { PriceInput } from './PriceInput'
import { AIDescriptionButton } from './AIDescriptionButton'
import { 
  InformationCircleIcon,
  MapIcon,
  PhotoIcon,
  SparklesIcon,
  CogIcon,
  CurrencyEuroIcon,
  HomeIcon,
  FireIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface PropertyFormProps {
  property?: Property
  isEdit?: boolean
}

export const PropertyFormFrench = ({ property, isEdit = false }: PropertyFormProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agents, setAgents] = useState<AgentImmobilier[]>([])
  
  // Form state avec tous les nouveaux champs français
  const [formData, setFormData] = useState({
    // Informations générales
    title: property?.title || '',
    description: property?.description || '',
    property_type: property?.property_type || 'appartement',
    transaction_type: property?.transaction_type || 'vente',
    status: property?.status || 'disponible',
    agent_id: property?.agent_id || '',
    
    // Prix et références
    price: property?.price?.toString() || '',
    prix_hors_honoraires: property?.prix_hors_honoraires?.toString() || '',
    honoraires: property?.honoraires?.toString() || '',
    honoraires_charge: property?.honoraires_charge || 'acquéreur',
    reference_mandat: property?.reference_mandat || '',
    reference_interne: property?.reference_interne || '',
    disponibilite: property?.disponibilite || 'De suite',
    
    // Localisation
    adresse_complete: property?.adresse_complete || '',
    city: property?.city || '',
    postal_code: property?.postal_code || '',
    latitude: property?.latitude?.toString() || '',
    longitude: property?.longitude?.toString() || '',
    etage: property?.etage?.toString() || '',
    nombre_etages_total: property?.nombre_etages_total?.toString() || '',
    ascenseur: property?.ascenseur || false,
    
    // Surfaces et configuration
    surface_habitable: property?.surface_habitable?.toString() || '',
    surface_totale: property?.surface_totale?.toString() || '',
    surface_sejour: property?.surface_sejour?.toString() || '',
    rooms: property?.rooms?.toString() || '',
    bedrooms: property?.bedrooms?.toString() || '',
    bathrooms: property?.bathrooms?.toString() || '',
    nombre_wc: property?.nombre_wc?.toString() || '',
    nombre_sde: property?.nombre_sde?.toString() || '',
    
    // Chauffage et énergie
    chauffage_type: property?.chauffage_type || '',
    chauffage_energie: property?.chauffage_energie || '',
    chauffage_systeme: property?.chauffage_systeme || '',
    eau_chaude_type: property?.eau_chaude_type || '',
    eau_chaude_energie: property?.eau_chaude_energie || '',
    dpe_valeur: property?.dpe_valeur?.toString() || '',
    ges_valeur: property?.ges_valeur?.toString() || '',
    energie_depenses_min: property?.energie_depenses_min?.toString() || '',
    energie_depenses_max: property?.energie_depenses_max?.toString() || '',
    dpe_date: property?.dpe_date || '',
    energy_class: property?.energy_class || '',
    construction_year: property?.construction_year?.toString() || '',
    
    // Charges et copropriété
    charges_copropriete: property?.charges_copropriete?.toString() || '',
    tax_fonciere: property?.tax_fonciere?.toString() || '',
    nombre_lots: property?.nombre_lots?.toString() || '',
    
    // Parking uniquement (le reste géré par PropertyEquipmentsManager)
    parking: property?.parking?.toString() || '',
    
    // Publication et options
    published: property?.published ?? true,
    featured_image: property?.featured_image || '',
    hide_address: property?.hide_address || false,
    ubiflow_active: property?.ubiflow_active || false,
    property_labels: [] as string[] // Changé en tableau pour plusieurs labels
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les agents
        const agentsList = await getActiveAgents()
        setAgents(agentsList)
        
        // Charger les labels si on est en mode édition
        if (isEdit && property?.id) {
          const existingLabels = await getPropertyLabels(property.id)
          setFormData(prev => ({ ...prev, property_labels: existingLabels }))
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }
    loadData()
  }, [isEdit, property?.id])

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressSelect = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      adresse_complete: addressData.address,
      city: addressData.city,
      postal_code: addressData.postalCode,
      latitude: addressData.latitude.toString(),
      longitude: addressData.longitude.toString()
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
        handle: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        property_type: formData.property_type as any,
        transaction_type: formData.transaction_type as any,
        status: formData.status as any,
        agent_id: formData.agent_id || null,
        
        // Prix
        price: parseInt(formData.price),
        prix_hors_honoraires: parseInt(formData.prix_hors_honoraires) || null,
        honoraires: parseInt(formData.honoraires) || null,
        honoraires_charge: formData.honoraires_charge as any,
        reference_mandat: formData.reference_mandat || null,
        reference_interne: formData.reference_interne || null,
        disponibilite: formData.disponibilite || null,
        
        // Localisation
        adresse_complete: formData.adresse_complete || null,
        city: formData.city,
        postal_code: formData.postal_code || null,
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        etage: parseInt(formData.etage) || null,
        nombre_etages_total: parseInt(formData.nombre_etages_total) || null,
        ascenseur: formData.ascenseur,
        
        // Surfaces
        surface_habitable: parseFloat(formData.surface_habitable) || null,
        surface_totale: parseFloat(formData.surface_totale) || null,
        surface_sejour: parseFloat(formData.surface_sejour) || null,
        rooms: parseInt(formData.rooms) || null,
        bedrooms: parseInt(formData.bedrooms) || null,
        bathrooms: parseInt(formData.bathrooms) || null,
        nombre_wc: parseInt(formData.nombre_wc) || null,
        nombre_sde: parseInt(formData.nombre_sde) || null,
        
        // Chauffage
        chauffage_type: formData.chauffage_type || null,
        chauffage_energie: formData.chauffage_energie || null,
        chauffage_systeme: formData.chauffage_systeme || null,
        eau_chaude_type: formData.eau_chaude_type || null,
        eau_chaude_energie: formData.eau_chaude_energie || null,
        dpe_valeur: parseInt(formData.dpe_valeur) || null,
        ges_valeur: parseInt(formData.ges_valeur) || null,
        energie_depenses_min: parseInt(formData.energie_depenses_min) || null,
        energie_depenses_max: parseInt(formData.energie_depenses_max) || null,
        dpe_date: formData.dpe_date || null,
        energy_class: formData.energy_class || null,
        construction_year: parseInt(formData.construction_year) || null,
        
        // Charges
        charges_copropriete: parseFloat(formData.charges_copropriete) || null,
        tax_fonciere: parseFloat(formData.tax_fonciere) || null,
        nombre_lots: parseInt(formData.nombre_lots) || null,
        
        // Parking uniquement (le reste géré par PropertyEquipmentsManager)
        parking: parseInt(formData.parking) || null,
        
        // Options et publication
        published: formData.published,
        featured_image: formData.featured_image || null,
        hide_address: formData.hide_address,
        ubiflow_active: formData.ubiflow_active,
        property_label: null, // Géré séparément avec property_labels
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        is_ads: null,
        like_count: 0,
        review_rating: null,
        review_count: 0,
        listing_date: null,
        note_moyenne: null,
        nombre_avis: null,
        nombre_invites_max: null,
        surface_pieds_carres: null,
        agence_id: null,
        address: formData.adresse_complete || null,
        surface: formData.surface_habitable || null,
        acreage: formData.surface_totale || null,
        floor: formData.etage || null,
        max_guests: formData.nombre_invites_max || null,
        elevator: formData.ascenseur,
        heating_type: formData.chauffage_type || null,
        charges: formData.charges_copropriete || null,
        sale_off: null
      }

      let propertyId: string
      
      if (isEdit && property) {
        await updateProperty(property.id, propertyData)
        propertyId = property.id
      } else {
        const newProperty = await createProperty(propertyData)
        if (!newProperty || !newProperty.id) {
          throw new Error('Erreur lors de la création de la propriété')
        }
        propertyId = newProperty.id
      }
      
      // Mettre à jour les labels
      await updatePropertyLabels(propertyId, formData.property_labels)

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

      {/* 1. Informations générales */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <InformationCircleIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Informations générales</Heading>
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
          <div className="space-y-2">
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              placeholder="Description détaillée du bien..."
            />
            <AIDescriptionButton
              property={{
                title: formData.title,
                property_type: formData.property_type,
                transaction_type: formData.transaction_type,
                city: formData.city,
                address: formData.adresse_complete,
                price: parseInt(formData.price) || undefined,
                rooms: parseInt(formData.rooms) || undefined,
                bedrooms: parseInt(formData.bedrooms) || undefined,
                bathrooms: parseInt(formData.bathrooms) || undefined,
                surface: parseFloat(formData.surface_habitable) || undefined,
                balcony: formData.balcony,
                terrace: formData.terrace,
                garden: formData.garden,
                parking: parseInt(formData.parking) || undefined,
                elevator: formData.ascenseur,
                furnished: formData.furnished
              }}
              onGenerated={(description) => handleInputChange('description', description)}
            />
          </div>
        </div>
      </div>

      {/* 2. Prix et références */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <CurrencyEuroIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Prix et références</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PriceInput
            label="Prix principal *"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="Prix en euros"
            required
          />

          <PriceInput
            label="Prix hors honoraires"
            value={formData.prix_hors_honoraires}
            onChange={(e) => handleInputChange('prix_hors_honoraires', e.target.value)}
            placeholder="Prix hors honoraires"
          />

          <PriceInput
            label="Honoraires"
            value={formData.honoraires}
            onChange={(e) => handleInputChange('honoraires', e.target.value)}
            placeholder="Montant des honoraires"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Honoraires à charge de
            </label>
            <select
              value={formData.honoraires_charge}
              onChange={(e) => handleInputChange('honoraires_charge', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="acquéreur">Acquéreur</option>
              <option value="vendeur">Vendeur</option>
              <option value="partagé">Partagé</option>
            </select>
          </div>

          <Input
            label="Référence mandat"
            value={formData.reference_mandat}
            onChange={(e) => handleInputChange('reference_mandat', e.target.value)}
            placeholder="Ex: 258-24 U"
          />

          <Input
            label="Référence interne"
            value={formData.reference_interne}
            onChange={(e) => handleInputChange('reference_interne', e.target.value)}
            placeholder="Ex: VA-3013K"
          />

          <Input
            label="Disponibilité"
            value={formData.disponibilite}
            onChange={(e) => handleInputChange('disponibilite', e.target.value)}
            placeholder="Ex: De suite, 01/06/2024"
          />
        </div>
      </div>

      {/* 3. Localisation */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <MapIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Localisation</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <AddressAutocomplete
              value={formData.adresse_complete}
              onChange={(value) => handleInputChange('adresse_complete', value)}
              onAddressSelect={handleAddressSelect}
              label="Adresse complète *"
              placeholder="Tapez l'adresse pour rechercher..."
            />
          </div>

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

          <div></div>

          <Input
            label="Latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => handleInputChange('latitude', e.target.value)}
            placeholder="Auto-rempli par l'adresse"
          />

          <Input
            label="Longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => handleInputChange('longitude', e.target.value)}
            placeholder="Auto-rempli par l'adresse"
          />

          <div></div>

          <Input
            label="Étage"
            type="number"
            value={formData.etage}
            onChange={(e) => handleInputChange('etage', e.target.value)}
          />

          <Input
            label="Nombre total d'étages"
            type="number"
            value={formData.nombre_etages_total}
            onChange={(e) => handleInputChange('nombre_etages_total', e.target.value)}
          />

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.ascenseur}
                onChange={(e) => handleInputChange('ascenseur', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Ascenseur
              </span>
            </label>
            
            {formData.ascenseur && (
              <Input
                label="Nombre d'étages desservis"
                type="number"
                value={formData.nombre_etages_total}
                onChange={(e) => handleInputChange('nombre_etages_total', e.target.value)}
                placeholder="Ex: 5"
              />
            )}
          </div>
        </div>
      </div>

      {/* 4. Surfaces et configuration */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <HomeIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Surfaces et configuration</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Input
            label="🏠 Surface habitable (m²)"
            type="number"
            step="0.01"
            value={formData.surface_habitable}
            onChange={(e) => handleInputChange('surface_habitable', e.target.value)}
            placeholder="Loi Carrez - ex: 85.5 m²"
          />

          <Input
            label="📐 Surface totale du terrain (m²)"
            type="number"
            step="0.01"
            value={formData.surface_totale}
            onChange={(e) => handleInputChange('surface_totale', e.target.value)}
            placeholder="Terrain + maison - ex: 450 m²"
          />

          <Input
            label="🛋️ Surface séjour (m²)"
            type="number"
            step="0.01"
            value={formData.surface_sejour}
            onChange={(e) => handleInputChange('surface_sejour', e.target.value)}
            placeholder="Salon/salle à manger - ex: 25 m²"
          />

          <Input
            label="🏠 Nombre de pièces total"
            type="number"
            value={formData.rooms}
            onChange={(e) => handleInputChange('rooms', e.target.value)}
            placeholder="Ex: 4 pièces (T4)"
          />

          <Input
            label="🛏️ Nombre de chambres"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => handleInputChange('bedrooms', e.target.value)}
            placeholder="Ex: 2 chambres"
          />

          <Input
            label="🛁 Nombre de salles de bain"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => handleInputChange('bathrooms', e.target.value)}
            placeholder="Avec baignoire ou douche + WC"
          />

          <Input
            label="🚿 Nombre de salles d'eau"
            type="number"
            value={formData.nombre_sde}
            onChange={(e) => handleInputChange('nombre_sde', e.target.value)}
            placeholder="Douche sans WC"
          />

          <Input
            label="WC"
            type="number"
            value={formData.nombre_wc}
            onChange={(e) => handleInputChange('nombre_wc', e.target.value)}
          />

          <Input
            label="Année de construction"
            type="number"
            value={formData.construction_year}
            onChange={(e) => handleInputChange('construction_year', e.target.value)}
          />
        </div>


        <Input
          label="Places de parking"
          type="number"
          value={formData.parking}
          onChange={(e) => handleInputChange('parking', e.target.value)}
          placeholder="Nombre de places"
        />
      </div>

      {/* 5. Chauffage et énergie */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <FireIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Chauffage et énergie</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Type de chauffage
            </label>
            <select
              value={formData.chauffage_type}
              onChange={(e) => handleInputChange('chauffage_type', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="">Sélectionner</option>
              <option value="individuel">Individuel</option>
              <option value="collectif">Collectif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Énergie de chauffage
            </label>
            <select
              value={formData.chauffage_energie}
              onChange={(e) => handleInputChange('chauffage_energie', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            >
              <option value="">Sélectionner</option>
              <option value="gaz">Gaz</option>
              <option value="électrique">Électrique</option>
              <option value="fioul">Fioul</option>
              <option value="bois">Bois</option>
              <option value="pompe_a_chaleur">Pompe à chaleur</option>
            </select>
          </div>

          <Input
            label="Système de chauffage"
            value={formData.chauffage_systeme}
            onChange={(e) => handleInputChange('chauffage_systeme', e.target.value)}
            placeholder="Ex: Radiateurs, plancher chauffant"
          />

          <Input
            label="Type eau chaude"
            value={formData.eau_chaude_type}
            onChange={(e) => handleInputChange('eau_chaude_type', e.target.value)}
            placeholder="Ex: Individuel, collectif"
          />

          <Input
            label="Énergie eau chaude"
            value={formData.eau_chaude_energie}
            onChange={(e) => handleInputChange('eau_chaude_energie', e.target.value)}
            placeholder="Ex: Gaz, électrique"
          />

          <Input
            label="Classe énergétique"
            value={formData.energy_class}
            onChange={(e) => handleInputChange('energy_class', e.target.value)}
            placeholder="A, B, C, D, E, F, G"
          />

          <Input
            label="DPE (kWh/m²/an)"
            type="number"
            value={formData.dpe_valeur}
            onChange={(e) => handleInputChange('dpe_valeur', e.target.value)}
            placeholder="Valeur DPE"
          />

          <Input
            label="GES (kg CO2/m²/an)"
            type="number"
            value={formData.ges_valeur}
            onChange={(e) => handleInputChange('ges_valeur', e.target.value)}
            placeholder="Valeur GES"
          />

          <Input
            label="Dépenses énergie min (€/an)"
            type="number"
            value={formData.energie_depenses_min}
            onChange={(e) => handleInputChange('energie_depenses_min', e.target.value)}
            placeholder="Dépenses minimales"
          />

          <Input
            label="Dépenses énergie max (€/an)"
            type="number"
            value={formData.energie_depenses_max}
            onChange={(e) => handleInputChange('energie_depenses_max', e.target.value)}
            placeholder="Dépenses maximales"
          />

          <Input
            label="Date DPE"
            type="date"
            value={formData.dpe_date}
            onChange={(e) => handleInputChange('dpe_date', e.target.value)}
          />
        </div>
      </div>

      {/* 6. Charges et copropriété */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <DocumentTextIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Charges et copropriété</Heading>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PriceInput
            label="Charges de copropriété (€/mois)"
            value={formData.charges_copropriete}
            onChange={(e) => handleInputChange('charges_copropriete', e.target.value)}
            placeholder="Montant mensuel"
          />

          <PriceInput
            label="Taxe foncière (€/an)"
            value={formData.tax_fonciere}
            onChange={(e) => handleInputChange('tax_fonciere', e.target.value)}
            placeholder="Montant annuel"
          />

          <Input
            label="Nombre de lots"
            type="number"
            value={formData.nombre_lots}
            onChange={(e) => handleInputChange('nombre_lots', e.target.value)}
            placeholder="Nombre de lots dans la copropriété"
          />
        </div>
      </div>

      {/* 7. Points forts */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <SparklesIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Points forts de la propriété</Heading>
        </div>
        
        <PropertyHighlightsManager 
          propertyId={property?.id || null}
          propertyData={formData}
        />
      </div>

      {/* 8. Équipements détaillés */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <CogIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Équipements et services</Heading>
        </div>
        
        <PropertyEquipmentsManager 
          propertyId={property?.id || null}
        />
      </div>

      {/* 9. Galerie d'images */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <PhotoIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Galerie d'images</Heading>
        </div>
        
        <ImageGalleryManager 
          propertyId={property?.id || null}
          onImagesChange={(images) => {
            const featuredImage = images.find(img => img.is_featured)
            if (featuredImage) {
              handleInputChange('featured_image', featuredImage.image_url)
            }
          }}
        />
      </div>

      {/* Options de la propriété */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <DocumentTextIcon className="h-5 w-5 text-primary-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">Options et publication</Heading>
        </div>

        {/* Labels de la propriété */}
        <PropertyLabelsManager
          labels={formData.property_labels}
          onChange={(newLabels) => handleInputChange('property_labels', newLabels)}
        />

        {/* Cacher l'adresse */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.hide_address}
              onChange={(e) => handleInputChange('hide_address', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Cacher l'adresse précise
              </span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Affiche un rayon de 1km autour de la position au lieu de l'adresse exacte
              </p>
            </div>
          </label>
        </div>

        {/* Ubiflow Toggle */}
        <div>
          <label className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Publication Ubiflow
              </span>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Publier automatiquement ce bien sur la plateforme Ubiflow
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange('ubiflow_active', !formData.ubiflow_active)}
              className={`${
                formData.ubiflow_active ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-600'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Activer Ubiflow</span>
              <span
                aria-hidden="true"
                className={`${
                  formData.ubiflow_active ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </label>
        </div>

        {/* Aperçu DPE/GES */}
        {(formData.dpe_valeur || formData.ges_valeur) && (
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Aperçu des diagnostics énergétiques
            </label>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <EnergyLabels
                dpeValue={parseInt(formData.dpe_valeur) || null}
                gesValue={parseInt(formData.ges_valeur) || null}
                size="md"
                showValues={true}
              />
            </div>
          </div>
        )}
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
          className="flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Retour
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