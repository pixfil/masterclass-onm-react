'use client'

import { useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { generatePropertyDescription } from '@/lib/ai/description-generator'
import { Property } from '@/types/property'
import { useSettings } from '@/hooks/useSettings'

interface AIDescriptionButtonProps {
  property: Partial<Property>
  onGenerated: (description: string) => void
}

export function AIDescriptionButton({ property, onGenerated }: AIDescriptionButtonProps) {
  const { settings, getAIApiKey, getAIModel } = useSettings()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    const key = getAIApiKey()
    
    if (!key) {
      setError('Clé API non configurée. Veuillez configurer votre clé API dans Paramètres > Intelligence Artificielle.')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const description = await generatePropertyDescription(property, key, settings.aiProvider, getAIModel())
      onGenerated(description)
    } catch (err: any) {
      console.error('Erreur lors de la génération:', err)
      setError(err.message || 'Erreur lors de la génération. Vérifiez votre clé API et réessayez.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 border border-transparent rounded-md shadow-sm hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SparklesIcon className={`h-4 w-4 ${isGenerating ? 'animate-pulse' : ''}`} />
        {isGenerating ? 'Génération en cours...' : 'Générer avec IA'}
      </button>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}