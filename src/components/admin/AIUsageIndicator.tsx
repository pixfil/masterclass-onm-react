'use client'

import { useSubscription } from '@/hooks/useSubscription'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

export const AIUsageIndicator = () => {
  const { subscription, hasFeature, loading: subscriptionLoading } = useSubscription()
  const [usage, setUsage] = useState({ used: 0, total: -1 })
  const [loadingUsage, setLoadingUsage] = useState(false)
  const hasAIAccess = hasFeature('ai')

  // Récupérer l'usage IA avec cache localStorage
  useEffect(() => {
    if (hasAIAccess && subscription.features.maxAiGenerations !== undefined) {
      // Vérifier le cache d'abord
      const cached = localStorage.getItem('ai_usage_cache')
      const cacheTime = localStorage.getItem('ai_usage_cache_time')
      
      if (cached && cacheTime) {
        const cacheAge = Date.now() - parseInt(cacheTime)
        // Si le cache a moins de 10 minutes, l'utiliser
        if (cacheAge < 10 * 60 * 1000) {
          const cachedData = JSON.parse(cached)
          setUsage({
            used: cachedData.generationsThisMonth || 0,
            total: subscription.features.maxAiGenerations
          })
          return
        }
      }
      
      // Sinon, récupérer les nouvelles données
      fetchUsage()
    }
  }, [hasAIAccess, subscription.features.maxAiGenerations]) // Se déclenche quand l'accès IA ou les limites changent

  const fetchUsage = async () => {
    try {
      setLoadingUsage(true)
      const response = await fetch('/api/ai/usage')
      if (response.ok) {
        const data = await response.json()
        
        // Mettre en cache les données
        localStorage.setItem('ai_usage_cache', JSON.stringify(data))
        localStorage.setItem('ai_usage_cache_time', Date.now().toString())
        
        setUsage(prevUsage => ({
          used: data.generationsThisMonth || 0,
          total: subscription.features.maxAiGenerations === -1 ? -1 : subscription.features.maxAiGenerations
        }))
      }
    } catch (error) {
      console.error('Erreur récupération usage IA:', error)
      // Valeurs par défaut
      setUsage(prevUsage => ({
        used: 0,
        total: subscription.features.maxAiGenerations === -1 ? -1 : subscription.features.maxAiGenerations
      }))
    } finally {
      setLoadingUsage(false)
    }
  }

  // Si l'utilisateur n'a pas accès à l'IA, ne rien afficher
  if (!hasAIAccess || subscriptionLoading) {
    return null
  }

  // Calculer les statistiques
  const isUnlimited = usage.total === -1
  const percentageUsed = isUnlimited ? 0 : (usage.used / usage.total) * 100

  // Couleurs selon le pourcentage d'utilisation avec thème ONM
  const getStatusColor = () => {
    if (isUnlimited) return 'text-blue-600 dark:text-blue-400'
    if (percentageUsed >= 90) return 'text-red-600 dark:text-red-400'
    if (percentageUsed >= 70) return 'text-orange-600 dark:text-orange-400'
    return 'text-cyan-600 dark:text-cyan-400'
  }

  const getBgColor = () => {
    if (isUnlimited) return 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    if (percentageUsed >= 90) return 'bg-red-50 dark:bg-red-900/20'
    if (percentageUsed >= 70) return 'bg-orange-50 dark:bg-orange-900/20'
    return 'bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20'
  }

  const getProgressColor = () => {
    if (isUnlimited) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (percentageUsed >= 90) return 'bg-red-500'
    if (percentageUsed >= 70) return 'bg-orange-500'
    return 'bg-gradient-to-r from-cyan-500 to-blue-500'
  }

  if (loadingUsage) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-900/20">
        <SparklesIcon className="h-5 w-5 text-neutral-400 animate-pulse" />
        <span className="text-sm text-neutral-400">Chargement...</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${getBgColor()}`}>
      <SparklesIcon className={`h-5 w-5 ${getStatusColor()}`} />
      
      <div className="flex flex-col min-w-0">
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {isUnlimited ? (
            'IA Illimitée'
          ) : (
            `${usage.used}/${usage.total} Crédits IA`
          )}
        </div>
        
        {!isUnlimited && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(100, percentageUsed)}%` }}
              />
            </div>
            <span className={`text-xs ${getStatusColor()}`}>
              {Math.round(percentageUsed)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}