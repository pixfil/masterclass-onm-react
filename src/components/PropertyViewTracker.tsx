'use client'

import { useEffect } from 'react'
import { trackPropertyView } from '@/lib/supabase/analytics'
import { useAuth } from '@/contexts/AuthContext'
import { useAnalyticsSettings } from '@/hooks/useAnalyticsSettings'
import { useSubscription } from '@/hooks/useSubscription'

interface PropertyViewTrackerProps {
  propertyId: string
}

export function PropertyViewTracker({ propertyId }: PropertyViewTrackerProps) {
  const { user } = useAuth()
  const analyticsSettings = useAnalyticsSettings()
  const { hasFeature } = useSubscription()
  
  useEffect(() => {
    // Vérifier si le tracking est activé ET si l'utilisateur a accès aux analytics
    if (!analyticsSettings.analyticsEnabled || 
        !analyticsSettings.trackPropertyViews || 
        !hasFeature('analytics')) {
      console.log('Tracking des vues désactivé (paramètres ou abonnement)')
      return
    }

    // Générer ou récupérer un ID de session
    const getSessionId = () => {
      let sessionId = sessionStorage.getItem('analytics_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
        sessionStorage.setItem('analytics_session_id', sessionId)
      }
      return sessionId
    }

    // Enregistrer la vue
    const recordView = async () => {
      try {
        const sessionId = getSessionId()
        
        await trackPropertyView(propertyId, sessionId, {
          userId: user?.id,
          userAgent: navigator.userAgent,
          referer: document.referrer,
          pageUrl: window.location.href
        })
        
        console.log(`Vue enregistrée pour la propriété ${propertyId}`)
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la vue:', error)
      }
    }

    // Enregistrer la vue après un court délai pour s'assurer que la page est bien chargée
    const timer = setTimeout(recordView, 1000)

    return () => clearTimeout(timer)
  }, [propertyId, user, analyticsSettings.analyticsEnabled, analyticsSettings.trackPropertyViews, hasFeature])

  // Ce composant ne rend rien visuellement
  return null
}