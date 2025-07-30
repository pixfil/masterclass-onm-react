import { useState, useEffect } from 'react'

export interface AnalyticsSettings {
  analyticsEnabled: boolean
  trackPropertyViews: boolean
  trackUserBehavior: boolean
  trackConversions: boolean
}

export function useAnalyticsSettings() {
  const [settings, setSettings] = useState<AnalyticsSettings>({
    analyticsEnabled: true,
    trackPropertyViews: true,
    trackUserBehavior: true,
    trackConversions: true
  })

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('adminSettings')
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings({
            analyticsEnabled: parsed.analyticsEnabled ?? true,
            trackPropertyViews: parsed.trackPropertyViews ?? true,
            trackUserBehavior: parsed.trackUserBehavior ?? true,
            trackConversions: parsed.trackConversions ?? true
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres analytics:', error)
      }
    }

    loadSettings()
    
    // Écouter les changements de localStorage depuis d'autres onglets
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminSettings') {
        loadSettings()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return settings
}