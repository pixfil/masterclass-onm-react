import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from './useSubscription'

export interface AIUsageData {
  generationsThisMonth: number
  tokensThisMonth: number
  descriptionsGenerated: number
  highlightsGenerated: number
  lastGeneration: string | null
}

export interface AIUsageStats {
  used: number
  remaining: number
  unlimited: boolean
  percentageUsed: number
}

export function useAIUsage() {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const [usage, setUsage] = useState<AIUsageData>({
    generationsThisMonth: 0,
    tokensThisMonth: 0,
    descriptionsGenerated: 0,
    highlightsGenerated: 0,
    lastGeneration: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAIUsage()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchAIUsage = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ai/usage')
      
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      } else {
        // Pas d'erreur dans la console, juste utiliser les valeurs par défaut
        setUsage({
          generationsThisMonth: 0,
          tokensThisMonth: 0,
          descriptionsGenerated: 0,
          highlightsGenerated: 0,
          lastGeneration: null
        })
      }
    } catch (error) {
      // Silencieusement utiliser les valeurs par défaut
      setUsage({
        generationsThisMonth: 0,
        tokensThisMonth: 0,
        descriptionsGenerated: 0,
        highlightsGenerated: 0,
        lastGeneration: null
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculer les statistiques d'usage
  const getUsageStats = (): AIUsageStats => {
    const maxGenerations = subscription.features.maxAiGenerations
    
    if (maxGenerations === -1) {
      return {
        used: usage.generationsThisMonth,
        remaining: -1,
        unlimited: true,
        percentageUsed: 0
      }
    }

    const remaining = Math.max(0, maxGenerations - usage.generationsThisMonth)
    const percentageUsed = maxGenerations > 0 ? (usage.generationsThisMonth / maxGenerations) * 100 : 0

    return {
      used: usage.generationsThisMonth,
      remaining,
      unlimited: false,
      percentageUsed: Math.min(100, percentageUsed)
    }
  }

  // Enregistrer une nouvelle utilisation
  const recordAIUsage = async (featureType: 'description_generation' | 'highlights_generation', propertyId?: string) => {
    try {
      await fetch('/api/ai/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          featureType,
          propertyId,
          tokensUsed: 100, // Estimation par défaut
          success: true
        })
      })
      
      // Rafraîchir les données d'usage
      fetchAIUsage()
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'usage IA:', error)
    }
  }

  return {
    usage,
    loading,
    getUsageStats,
    recordAIUsage,
    refreshUsage: fetchAIUsage
  }
}