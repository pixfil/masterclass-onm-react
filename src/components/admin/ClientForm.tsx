'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import { createClient, updateClient, Client } from '@/lib/supabase/clients'
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowLeftIcon,
  CogIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline'

interface ClientFormProps {
  client?: Client
  isEdit?: boolean
}

const PREFERENCE_OPTIONS = [
  'Vente',
  'Location',
  'Maison',
  'Appartement',
  'Terrain',
  'Immobilier commercial',
  'Immobilier de luxe',
  'Investissement locatif',
  'Résidence principale',
  'Résidence secondaire'
]

export const ClientForm = ({ client, isEdit = false }: ClientFormProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    client?.preferences?.interests || []
  )
  
  const [formData, setFormData] = useState({
    first_name: client?.first_name || '',
    last_name: client?.last_name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    city: client?.city || '',
    postal_code: client?.postal_code || '',
    country: client?.country || 'France',
    birth_date: client?.birth_date || '',
    newsletter_consent: client?.newsletter_consent || false,
    is_active: client?.is_active ?? true
  })

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePreferenceToggle = (preference: string) => {
    setSelectedPreferences(prev => {
      if (prev.includes(preference)) {
        return prev.filter(p => p !== preference)
      }
      return [...prev, preference]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const clientData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        postal_code: formData.postal_code || null,
        country: formData.country || null,
        birth_date: formData.birth_date || null,
        preferences: {
          interests: selectedPreferences,
          created_at: new Date().toISOString()
        },
        newsletter_consent: formData.newsletter_consent,
        is_active: formData.is_active
      }

      if (isEdit && client) {
        await updateClient(client.id, clientData)
      } else {
        await createClient(clientData)
      }

      router.push('/admin/clients')
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

      <div className="flex items-center justify-between">
        <Heading 
          as="h2" 
          className="text-2xl font-bold text-neutral-900 dark:text-white"
        >
          {isEdit ? 'Modifier le client' : 'Nouveau client'}
        </Heading>
        <Button
          type="button"
          onClick={() => router.push('/admin/clients')}
          className="inline-flex items-center gap-2"
          color="light"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Retour à la liste
        </Button>
      </div>

      {/* Informations personnelles */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <UserIcon className="h-5 w-5 text-blue-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
            Informations personnelles
          </Heading>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Prénom *"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            required
            placeholder="Marie"
            icon={UserIcon}
          />

          <Input
            label="Nom *"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            required
            placeholder="Martin"
          />

          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            placeholder="marie.martin@example.com"
            icon={EnvelopeIcon}
          />

          <Input
            label="Téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="06 12 34 56 78"
            icon={PhoneIcon}
          />

          <Input
            label="Date de naissance"
            type="date"
            value={formData.birth_date}
            onChange={(e) => handleInputChange('birth_date', e.target.value)}
            icon={CalendarIcon}
          />
        </div>
      </div>

      {/* Adresse */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <MapPinIcon className="h-5 w-5 text-blue-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
            Adresse
          </Heading>
        </div>

        <div className="space-y-4">
          <Input
            label="Adresse complète"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="123 rue de la République"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Ville"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Paris"
            />

            <Input
              label="Code postal"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              placeholder="75001"
            />

            <Input
              label="Pays"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="France"
            />
          </div>
        </div>
      </div>

      {/* Préférences */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <CogIcon className="h-5 w-5 text-blue-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
            Préférences immobilières
          </Heading>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Centres d'intérêt
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PREFERENCE_OPTIONS.map(preference => (
              <label
                key={preference}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPreferences.includes(preference)}
                  onChange={() => handlePreferenceToggle(preference)}
                  className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:bg-neutral-700 dark:border-neutral-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  {preference}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Paramètres et statuts */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-2 border-b border-neutral-200 dark:border-neutral-700">
          <NewspaperIcon className="h-5 w-5 text-blue-600" />
          <Heading as="h3" className="text-lg font-semibold text-neutral-900 dark:text-white">
            Paramètres du compte
          </Heading>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.newsletter_consent}
              onChange={(e) => handleInputChange('newsletter_consent', e.target.checked)}
              className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:bg-neutral-700 dark:border-neutral-600"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Consentement newsletter
            </span>
            <NewspaperIcon className="h-5 w-5 text-blue-500" />
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:bg-neutral-700 dark:border-neutral-600"
            />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Compte actif
            </span>
          </label>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-end gap-x-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <Button
          type="button"
          onClick={() => router.push('/admin/clients')}
          disabled={loading}
          color="light"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          loading={loading}
        >
          {isEdit ? 'Mettre à jour' : 'Créer le client'}
        </Button>
      </div>
    </form>
  )
}