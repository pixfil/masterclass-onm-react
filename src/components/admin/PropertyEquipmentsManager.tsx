'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import { 
  getEquipmentTypesByCategory,
  getPropertyEquipments,
  syncPropertyEquipments
} from '@/lib/supabase/property-features'
import { TypeEquipement, EquipementPropriete } from '@/lib/supabase/types'

interface PropertyEquipmentsManagerProps {
  propertyId: string | null
  onEquipmentsChange?: (equipments: EquipementPropriete[]) => void
}

export const PropertyEquipmentsManager = ({ 
  propertyId, 
  onEquipmentsChange 
}: PropertyEquipmentsManagerProps) => {
  const [equipmentTypes, setEquipmentTypes] = useState<Record<string, TypeEquipement[]>>({})
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([])
  const [currentEquipments, setCurrentEquipments] = useState<EquipementPropriete[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEquipmentTypes()
    if (propertyId) {
      loadCurrentEquipments()
    } else {
      // Mode création - pré-sélectionner quelques équipements populaires
      setSelectedEquipments([])
    }
  }, [propertyId])

  const loadEquipmentTypes = async () => {
    try {
      const types = await getEquipmentTypesByCategory()
      setEquipmentTypes(types)
    } catch (error) {
      console.error('Erreur lors du chargement des types d\'équipements:', error)
    }
  }

  const loadCurrentEquipments = async () => {
    if (!propertyId) return
    
    try {
      setLoading(true)
      const equipments = await getPropertyEquipments(propertyId)
      setCurrentEquipments(equipments)
      
      // Récupérer les IDs des types d'équipements correspondants
      const allTypes = Object.values(equipmentTypes).flat()
      const selectedIds = equipments
        .map(eq => allTypes.find(type => type.nom === eq.nom_equipement)?.id)
        .filter(Boolean) as string[]
      
      setSelectedEquipments(selectedIds)
      onEquipmentsChange?.(equipments)
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEquipment = (equipmentId: string) => {
    setSelectedEquipments(prev => 
      prev.includes(equipmentId)
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    )
  }

  const saveEquipments = async () => {
    if (!propertyId) return

    try {
      setLoading(true)
      await syncPropertyEquipments(propertyId, selectedEquipments)
      await loadCurrentEquipments()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des équipements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryDisplayName = (category: string) => {
    const names: Record<string, string> = {
      connectivity: 'Connectivité',
      bathroom: 'Salle de bain',
      entertainment: 'Divertissement',
      amenities: 'Commodités',
      utilities: 'Services',
      recreation: 'Loisirs',
      transport: 'Transport',
      security: 'Sécurité',
      autres: 'Autres'
    }
    return names[category] || category
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading as="h4" className="text-base">Équipements disponibles</Heading>
        {propertyId && (
          <Button
            type="button"
            onClick={saveEquipments}
            disabled={loading}
            size="sm"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        )}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(equipmentTypes).map(([category, types]) => (
          <div key={category} className="space-y-3">
            <h5 className="font-medium text-neutral-900 dark:text-white">
              {getCategoryDisplayName(category)}
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {types.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedEquipments.includes(type.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedEquipments.includes(type.id)}
                    onChange={() => toggleEquipment(type.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-neutral-900 dark:text-white">
                      {type.nom}
                    </div>
                    {type.description && (
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {type.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(equipmentTypes).length === 0 && (
        <div className="text-center py-8 text-neutral-500 border-2 border-dashed border-neutral-200 rounded-lg dark:border-neutral-700">
          <p>Chargement des équipements disponibles...</p>
        </div>
      )}

      {propertyId && currentEquipments.length > 0 && (
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg dark:bg-neutral-800">
          <h5 className="font-medium text-neutral-900 dark:text-white mb-3">
            Équipements actuels ({currentEquipments.length})
          </h5>
          <div className="flex flex-wrap gap-2">
            {currentEquipments.map((equipment) => (
              <span
                key={equipment.id}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {equipment.nom_equipement}
                {equipment.quantite > 1 && ` (${equipment.quantite})`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}