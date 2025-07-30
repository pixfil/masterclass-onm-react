import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminRole } from './useAdminRole'

export interface SubscriptionFeatures {
  analytics: boolean
  ai: boolean
  maxProperties: number
  maxAiGenerations: number
  customDomain: boolean
  prioritySupport: boolean
}

export interface SubscriptionData {
  isActive: boolean
  planName?: string
  features: SubscriptionFeatures
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
}

export function useSubscription() {
  const { user } = useAuth()
  const { isSuperAdmin, loading: adminLoading } = useAdminRole()
  const [subscription, setSubscription] = useState<SubscriptionData>({
    isActive: false,
    features: {
      analytics: false,
      ai: false,
      maxProperties: 10,
      maxAiGenerations: 0,
      customDomain: false,
      prioritySupport: false
    }
  })
  const [loading, setLoading] = useState(true)
  const [globalFreeAccess, setGlobalFreeAccess] = useState(false)

  useEffect(() => {
    if (!adminLoading) {
      // Charger les paramètres globaux d'abord
      checkGlobalSettings().then(() => {
        if (isSuperAdmin) {
          // Super admin a accès à tout
          setSubscription({
            isActive: true,
            planName: 'Super Admin',
            features: {
              analytics: true,
              ai: true,
              maxProperties: -1,
              maxAiGenerations: -1,
              customDomain: true,
              prioritySupport: true
            }
          })
          setLoading(false)
        } else if (user) {
          fetchSubscription()
        } else {
          setLoading(false)
        }
      })
    }
  }, [user, isSuperAdmin, adminLoading])

  const checkGlobalSettings = async () => {
    try {
      // Vérifier les paramètres dans localStorage d'abord
      const savedSettings = localStorage.getItem('adminSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setGlobalFreeAccess(settings.globalFreeAccess || false)
      }
    } catch (error) {
      console.error('Erreur récupération paramètres globaux:', error)
    }
  }

  const fetchSubscription = async () => {
    try {
      setLoading(true)
      
      // Si l'accès gratuit global est activé, donner accès à tout
      if (globalFreeAccess) {
        setSubscription({
          isActive: true,
          planName: 'Accès Gratuit Global',
          features: {
            analytics: true,
            ai: true,
            maxProperties: -1,
            maxAiGenerations: -1,
            customDomain: true,
            prioritySupport: true
          }
        })
        setLoading(false)
        return
      }
      
      // Récupérer l'abonnement actuel
      const response = await fetch('/api/subscription/features')
      
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      } else {
        // Pas d'abonnement = version gratuite limitée
        setSubscription({
          isActive: false,
          features: {
            analytics: false,
            ai: false,
            maxProperties: 10,
            maxAiGenerations: 0,
            customDomain: false,
            prioritySupport: false
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error)
      setSubscription({
        isActive: false,
        features: {
          analytics: false,
          ai: false,
          maxProperties: 10,
          maxAiGenerations: 0,
          customDomain: false,
          prioritySupport: false
        }
      })
    } finally {
      setLoading(false)
    }
  }

  // Fonction helper pour vérifier l'accès à une fonctionnalité
  const hasFeature = (feature: keyof SubscriptionFeatures): boolean => {
    return subscription.features[feature] as boolean
  }

  // Fonction pour vérifier si on peut ajouter plus de propriétés
  const canAddProperty = (currentCount: number): boolean => {
    if (subscription.features.maxProperties === -1) return true // Illimité
    return currentCount < subscription.features.maxProperties
  }

  // Fonction pour vérifier si on peut utiliser l'IA
  const canUseAI = (currentUsage: number): boolean => {
    if (!subscription.features.ai) return false
    if (subscription.features.maxAiGenerations === -1) return true // Illimité
    return currentUsage < subscription.features.maxAiGenerations
  }

  // Fonction pour rafraîchir les paramètres globaux
  const refreshGlobalSettings = async () => {
    await checkGlobalSettings()
    // Re-déclencher la vérification d'abonnement
    if (isSuperAdmin) {
      // Super admin garde ses droits
      return
    } else if (user) {
      fetchSubscription()
    }
  }

  return {
    subscription,
    loading,
    hasFeature,
    canAddProperty,
    canUseAI,
    refreshSubscription: fetchSubscription,
    refreshGlobalSettings,
    globalFreeAccess
  }
}