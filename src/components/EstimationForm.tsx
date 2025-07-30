'use client'

import { useState } from 'react'
import { Button } from '@/shared/Button'
import React from 'react'
import { ComponentType } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

// Composant Input avec label et icon pour le formulaire
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ComponentType<{ className?: string }>
}

const InputWithLabel: React.FC<InputProps> = ({ 
  label, 
  icon: Icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-400" />
          </div>
        )}
        <input
          {...props}
          className={`block w-full px-3 py-2 ${Icon ? 'pl-10' : ''} border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:border-neutral-600 dark:text-white text-sm ${className}`}
        />
      </div>
    </div>
  )
}

export const EstimationForm = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property_type: 'appartement',
    address: '',
    city: '',
    zipcode: '',
    surface: '',
    rooms: '',
    year_built: '',
    condition: 'bon',
    description: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation simple
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim() || !formData.zipcode.trim()) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Veuillez saisir un email valide')
      setLoading(false)
      return
    }

    try {
      const estimationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        property_type: formData.property_type as 'maison' | 'appartement' | 'locaux_commerciaux' | 'parking' | 'terrain' | 'autres',
        address: formData.address || null,
        city: formData.city,
        zipcode: formData.zipcode,
        surface: formData.surface ? parseInt(formData.surface) : null,
        rooms: formData.rooms ? parseInt(formData.rooms) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        condition: formData.condition as 'neuf' | 'tres_bon' | 'bon' | 'a_rafraichir' | 'a_renover' | null,
        description: formData.description || null
      }

      const { error } = await supabase
        .from('property_estimations')
        .insert(estimationData)

      if (error) {
        throw error
      }

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        property_type: 'appartement',
        address: '',
        city: '',
        zipcode: '',
        surface: '',
        rooms: '',
        year_built: '',
        condition: 'bon',
        description: ''
      })

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de la demande:', error)
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-xl text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          Demande envoyée !
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Merci pour votre demande d'estimation. Nos experts vous contacteront sous 24h pour évaluer votre bien.
        </p>
        <Button
          onClick={() => setSuccess(false)}
          color="light"
        >
          Faire une nouvelle demande
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
          Estimation gratuite
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400">
          Remplissez ce formulaire et recevez votre estimation sous 24h
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputWithLabel
            label="Nom complet *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            placeholder="Jean Dupont"
            icon={UserIcon}
          />

          <InputWithLabel
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            placeholder="jean.dupont@example.com"
            icon={EnvelopeIcon}
          />
        </div>

        <InputWithLabel
          label="Téléphone *"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
          placeholder="06 12 34 56 78"
          icon={PhoneIcon}
        />

        {/* Type de bien */}
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
            <option value="locaux_commerciaux">Local commercial</option>
            <option value="parking">Parking</option>
            <option value="terrain">Terrain</option>
            <option value="autres">Autres</option>
          </select>
        </div>

        {/* Localisation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <InputWithLabel
              label="Adresse"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 rue de la République"
              icon={MapPinIcon}
            />
          </div>
          <InputWithLabel
            label="Code postal *"
            value={formData.zipcode}
            onChange={(e) => handleInputChange('zipcode', e.target.value)}
            required
            placeholder="67000"
          />
        </div>

        <InputWithLabel
          label="Ville *"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          required
          placeholder="Strasbourg"
        />

        {/* Caractéristiques du bien */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWithLabel
            label="Surface (m²)"
            type="number"
            value={formData.surface}
            onChange={(e) => handleInputChange('surface', e.target.value)}
            placeholder="85"
            min="1"
          />

          <InputWithLabel
            label="Nombre de pièces"
            type="number"
            value={formData.rooms}
            onChange={(e) => handleInputChange('rooms', e.target.value)}
            placeholder="4"
            min="1"
            icon={HomeIcon}
          />

          <InputWithLabel
            label="Année de construction"
            type="number"
            value={formData.year_built}
            onChange={(e) => handleInputChange('year_built', e.target.value)}
            placeholder="1985"
            min="1800"
            max={new Date().getFullYear()}
            icon={CalendarIcon}
          />
        </div>

        {/* État du bien */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            État du bien
          </label>
          <select
            value={formData.condition}
            onChange={(e) => handleInputChange('condition', e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
          >
            <option value="neuf">Neuf</option>
            <option value="tres_bon">Très bon état</option>
            <option value="bon">Bon état</option>
            <option value="a_rafraichir">À rafraîchir</option>
            <option value="a_renover">À rénover</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description complémentaire
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            placeholder="Précisions sur le bien, travaux récents, environnement..."
          />
        </div>

        {/* Bouton d'envoi */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Envoi en cours...' : 'Demander mon estimation gratuite'}
        </Button>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
          Vos données sont traitées de manière confidentielle conformément à notre politique de confidentialité.
        </p>
      </form>
    </div>
  )
}