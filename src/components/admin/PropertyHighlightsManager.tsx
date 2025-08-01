'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'
import { useSubscription } from '@/hooks/useSubscription'
import { useAIUsage } from '@/hooks/useAIUsage'
import { 
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { 
  getPropertyHighlights, 
  createPropertyHighlight, 
  updatePropertyHighlight, 
  deletePropertyHighlight 
} from '@/lib/supabase/property-features'
import { PointFortPropriete } from '@/lib/supabase/types'

interface PropertyHighlightsManagerProps {
  propertyId: string | null
  propertyData?: any // Données de la propriété pour l'IA
  onHighlightsChange?: (highlights: PointFortPropriete[]) => void
}

interface HighlightForm {
  id?: string
  titre: string
  description: string
  ordre_affichage: number
}

export const PropertyHighlightsManager = ({ 
  propertyId, 
  propertyData,
  onHighlightsChange 
}: PropertyHighlightsManagerProps) => {
  const [highlights, setHighlights] = useState<PointFortPropriete[]>([])
  const [localHighlights, setLocalHighlights] = useState<HighlightForm[]>([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const { hasFeature } = useSubscription()
  const { recordAIUsage } = useAIUsage()

  useEffect(() => {
    if (propertyId) {
      loadHighlights()
    } else {
      // Mode création - initialiser avec des exemples créatifs
      setLocalHighlights([
        {
          titre: "Emplacement privilégié",
          description: "Proche des commodités, transports et écoles dans un quartier recherché",
          ordre_affichage: 0
        },
        {
          titre: "Luminosité exceptionnelle", 
          description: "Exposition sud-ouest avec de grandes baies vitrées pour une luminosité naturelle toute la journée",
          ordre_affichage: 1
        }
      ])
    }
  }, [propertyId])

  const loadHighlights = async () => {
    if (!propertyId) return
    
    try {
      setLoading(true)
      const data = await getPropertyHighlights(propertyId)
      setHighlights(data)
      setLocalHighlights(data.map(h => ({
        id: h.id,
        titre: h.titre,
        description: h.description || '',
        ordre_affichage: h.ordre_affichage
      })))
      onHighlightsChange?.(data)
    } catch (error) {
      console.error('Erreur lors du chargement des points forts:', error)
    } finally {
      setLoading(false)
    }
  }

  const addHighlight = () => {
    const newHighlight: HighlightForm = {
      titre: '',
      description: '',
      ordre_affichage: localHighlights.length
    }
    setLocalHighlights([...localHighlights, newHighlight])
  }

  const updateLocalHighlight = (index: number, field: keyof HighlightForm, value: string | number) => {
    const updated = [...localHighlights]
    updated[index] = { ...updated[index], [field]: value }
    setLocalHighlights(updated)
  }

  const removeHighlight = async (index: number) => {
    const highlight = localHighlights[index]
    
    if (highlight.id && propertyId) {
      try {
        await deletePropertyHighlight(highlight.id)
      } catch (error) {
        console.error('Erreur lors de la suppression du point fort:', error)
        return
      }
    }

    const updated = localHighlights.filter((_, i) => i !== index)
    // Réorganiser les ordres
    updated.forEach((h, i) => h.ordre_affichage = i)
    setLocalHighlights(updated)
  }

  const moveHighlight = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= localHighlights.length) return

    const updated = [...localHighlights]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp

    // Mettre à jour les ordres
    updated[index].ordre_affichage = index
    updated[newIndex].ordre_affichage = newIndex

    setLocalHighlights(updated)
  }

  const generateAIHighlights = async () => {
    if (!hasFeature('ai')) {
      alert('Cette fonctionnalité nécessite un abonnement Pro ou Premium')
      return
    }

    if (!propertyData) {
      alert('Données de propriété manquantes pour la génération IA')
      return
    }

    try {
      setAiLoading(true)
      
      const response = await fetch('/api/ai/generate-highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData: {
            type: propertyData.property_type,
            transactionType: propertyData.transaction_type,
            price: propertyData.price,
            surface: propertyData.surface_habitable,
            rooms: propertyData.rooms,
            bedrooms: propertyData.bedrooms,
            city: propertyData.city,
            description: propertyData.description,
            etage: propertyData.etage,
            ascenseur: propertyData.ascenseur,
            chauffage: propertyData.chauffage_type,
            dpe: propertyData.energy_class,
            constructionYear: propertyData.construction_year
          }
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération')
      }

      const result = await response.json()
      
      if (result.highlights && Array.isArray(result.highlights)) {
        // Remplacer les points forts actuels par ceux générés par l'IA
        const aiHighlights: HighlightForm[] = result.highlights.map((highlight: any, index: number) => ({
          titre: highlight.titre || highlight.title,
          description: highlight.description,
          ordre_affichage: index
        }))
        
        setLocalHighlights(aiHighlights)
        
        // Enregistrer l'usage IA
        await recordAIUsage('highlights_generation', propertyId || undefined)
        
        alert(`${aiHighlights.length} points forts générés avec succès !`)
      }
      
    } catch (error) {
      console.error('Erreur génération IA:', error)
      alert('Erreur lors de la génération des points forts')
    } finally {
      setAiLoading(false)
    }
  }

  const saveHighlights = async () => {
    if (!propertyId) return

    try {
      setLoading(true)
      
      // Supprimer les highlights vides
      const validHighlights = localHighlights.filter(h => h.titre.trim())
      
      for (const highlight of validHighlights) {
        if (highlight.id) {
          // Mettre à jour
          await updatePropertyHighlight(highlight.id, {
            titre: highlight.titre,
            description: highlight.description,
            ordre_affichage: highlight.ordre_affichage
          })
        } else {
          // Créer
          await createPropertyHighlight({
            property_id: propertyId,
            titre: highlight.titre,
            description: highlight.description,
            ordre_affichage: highlight.ordre_affichage
          })
        }
      }
      
      // Recharger les données
      await loadHighlights()
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des points forts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {hasFeature('ai') && propertyData && (
            <button
              type="button"
              onClick={generateAIHighlights}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 border border-transparent rounded-md shadow-sm hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SparklesIcon className={`h-4 w-4 ${aiLoading ? 'animate-pulse' : ''}`} />
              {aiLoading ? 'Génération...' : 'Générer avec IA'}
            </button>
          )}
        </div>
        
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addHighlight}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      <div className="space-y-3">
        {localHighlights.map((highlight, index) => (
          <div key={index} className="border border-neutral-200 rounded-lg p-4 dark:border-neutral-700">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <Input
                  label="Titre du point fort"
                  value={highlight.titre}
                  onChange={(e) => updateLocalHighlight(index, 'titre', e.target.value)}
                  placeholder="Ex: Emplacement privilégié"
                />
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={highlight.description}
                    onChange={(e) => updateLocalHighlight(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                    placeholder="Description détaillée de cet avantage..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => moveHighlight(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                  title="Monter"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveHighlight(index, 'down')}
                  disabled={index === localHighlights.length - 1}
                  className="p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                  title="Descendre"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="p-1 text-red-400 hover:text-red-600"
                  title="Supprimer"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {localHighlights.length === 0 && (
        <div className="text-center py-8 text-neutral-500 border-2 border-dashed border-neutral-200 rounded-lg dark:border-neutral-700">
          <p>Aucun point fort ajouté</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addHighlight}
            className="mt-2"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Ajouter le premier point fort
          </Button>
        </div>
      )}

      {propertyId && localHighlights.length > 0 && (
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="button"
            onClick={saveHighlights}
            disabled={loading}
            size="sm"
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder les points forts'}
          </Button>
        </div>
      )}
    </div>
  )
}