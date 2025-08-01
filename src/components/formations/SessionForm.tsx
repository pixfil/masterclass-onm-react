'use client'

import { useState, useEffect } from 'react'
import { FormationSession, Address } from '@/lib/supabase/formations-types'
import { AddressAutocomplete } from '@/components/admin/AddressAutocomplete'
import { Button } from '@/shared/Button'
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface SessionFormProps {
  session?: FormationSession | null
  formationId: string
  onSave?: (session: FormationSession) => void
  onCancel?: () => void
}

interface SessionFormData {
  formation_id: string
  start_date: string
  end_date: string
  city: string
  venue_name: string
  venue_address: Address
  total_spots: number
  price_override?: number
  practical_info: string
  materials_included: string[]
}

const defaultAddress: Address = {
  street: '',
  city: '',
  postal_code: '',
  country: 'France',
  latitude: undefined,
  longitude: undefined
}

export const SessionForm = ({ session, formationId, onSave, onCancel }: SessionFormProps) => {
  const [formData, setFormData] = useState<SessionFormData>({
    formation_id: formationId,
    start_date: '',
    end_date: '',
    city: '',
    venue_name: '',
    venue_address: defaultAddress,
    total_spots: 20,
    price_override: undefined,
    practical_info: '',
    materials_included: []
  })

  const [loading, setSaving] = useState(false)
  const [addressInput, setAddressInput] = useState('')

  useEffect(() => {
    if (session) {
      setFormData({
        formation_id: session.formation_id,
        start_date: session.start_date ? session.start_date.slice(0, 16) : '',
        end_date: session.end_date ? session.end_date.slice(0, 16) : '',
        city: session.city || '',
        venue_name: session.venue_name || '',
        venue_address: session.venue_address || defaultAddress,
        total_spots: session.total_spots || 20,
        price_override: session.price_override,
        practical_info: session.practical_info || '',
        materials_included: session.materials_included || []
      })
      
      // Construire l'adresse complète pour l'autocomplete
      if (session.venue_address) {
        const fullAddress = [
          session.venue_address.street,
          session.venue_address.city,
          session.venue_address.postal_code
        ].filter(Boolean).join(', ')
        setAddressInput(fullAddress)
      }
    }
  }, [session])

  const handleAddressSelect = (addressData: {
    address: string
    city: string
    postalCode: string
    latitude: number
    longitude: number
  }) => {
    const parts = addressData.address.split(', ')
    const street = parts[0] || ''
    
    setFormData(prev => ({
      ...prev,
      city: addressData.city,
      venue_address: {
        street,
        city: addressData.city,
        postal_code: addressData.postalCode,
        country: 'France',
        latitude: addressData.latitude,
        longitude: addressData.longitude
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Ici on appellerait l'API pour sauvegarder la session
      // const newSession = await saveSession(formData)
      
      // Pour le moment, simuler la sauvegarde
      const newSession: FormationSession = {
        id: session?.id || `session_${Date.now()}`,
        ...formData,
        available_spots: formData.total_spots,
        status: 'scheduled',
        created_at: session?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      onSave?.(newSession)
    } catch (error) {
      console.error('Erreur sauvegarde session:', error)
    } finally {
      setSaving(false)
    }
  }

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials_included: [...prev.materials_included, '']
    }))
  }

  const updateMaterial = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      materials_included: prev.materials_included.map((item, i) => 
        i === index ? value : item
      )
    }))
  }

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials_included: prev.materials_included.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {session ? 'Modifier la session' : 'Nouvelle session'}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Date de début *
            </label>
            <input
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Date de fin *
            </label>
            <input
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              required
              min={formData.start_date}
            />
          </div>
        </div>

        {/* Lieu avec géocodage */}
        <div className="space-y-4">
          <AddressAutocomplete
            value={addressInput}
            onChange={setAddressInput}
            onAddressSelect={handleAddressSelect}
            label="Adresse du lieu de formation *"
            placeholder="Tapez l'adresse complète..."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nom du lieu *
              </label>
              <input
                type="text"
                value={formData.venue_name}
                onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                placeholder="Ex: Centre de Formation ONM"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                Places disponibles *
              </label>
              <input
                type="number"
                value={formData.total_spots}
                onChange={(e) => setFormData(prev => ({ ...prev, total_spots: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                min="1"
                required
              />
            </div>
          </div>

          {/* Affichage des coordonnées si disponibles */}
          {formData.venue_address.latitude && formData.venue_address.longitude && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
              <div className="flex items-center text-sm text-green-700 dark:text-green-300">
                <MapPinIcon className="w-4 h-4 mr-2" />
                <span>
                  Coordonnées : {formData.venue_address.latitude.toFixed(6)}, {formData.venue_address.longitude.toFixed(6)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Prix personnalisé */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Prix spécifique pour cette session (€)
          </label>
          <input
            type="number"
            value={formData.price_override || ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              price_override: e.target.value ? parseFloat(e.target.value) : undefined 
            }))}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            placeholder="Laisser vide pour utiliser le prix de la formation"
            step="0.01"
            min="0"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Optionnel : prix différent du prix de base de la formation
          </p>
        </div>

        {/* Informations pratiques */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Informations pratiques
          </label>
          <textarea
            value={formData.practical_info}
            onChange={(e) => setFormData(prev => ({ ...prev, practical_info: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
            placeholder="Horaires, parking, consignes particulières..."
          />
        </div>

        {/* Matériel inclus */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Matériel inclus
          </label>
          <div className="space-y-2">
            {formData.materials_included.map((material, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={material}
                  onChange={(e) => updateMaterial(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  placeholder="Ex: Manuel de formation, outils spécialisés..."
                />
                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addMaterial}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Ajouter du matériel
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600"
            >
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sauvegarde...' : (session ? 'Mettre à jour' : 'Créer la session')}
          </Button>
        </div>
      </form>
    </div>
  )
}