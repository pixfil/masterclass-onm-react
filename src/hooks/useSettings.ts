import { useState, useEffect } from 'react'

export interface AppSettings {
  // IA Settings
  aiProvider: 'openai' | 'anthropic'
  openaiApiKey: string
  openaiModel: string
  anthropicApiKey: string
  anthropicModel: string
  
  // SMTP Settings
  emailProvider: 'smtp' | 'brevo'
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPassword: string
  smtpSecure: boolean
  brevoApiKey: string
  fromEmail: string
  fromName: string
  
  // Analytics
  googleAnalyticsId: string
  googleTagManagerId: string
}

const defaultSettings: AppSettings = {
  aiProvider: 'openai',
  openaiApiKey: '',
  openaiModel: 'gpt-3.5-turbo',
  anthropicApiKey: '',
  anthropicModel: 'claude-3-sonnet-20240229',
  emailProvider: 'smtp',
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
  smtpSecure: false,
  brevoApiKey: '',
  fromEmail: '',
  fromName: 'Initiative Immobilier',
  googleAnalyticsId: '',
  googleTagManagerId: ''
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('adminSettings')
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('adminSettings', JSON.stringify(updatedSettings))
  }

  const getAIApiKey = () => {
    if (settings.aiProvider === 'openai') {
      return settings.openaiApiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    } else if (settings.aiProvider === 'anthropic') {
      return settings.anthropicApiKey || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    }
    return undefined
  }

  const getAIModel = () => {
    if (settings.aiProvider === 'openai') {
      return settings.openaiModel
    } else if (settings.aiProvider === 'anthropic') {
      return settings.anthropicModel
    }
    return undefined
  }

  return {
    settings,
    loading,
    updateSettings,
    getAIApiKey,
    getAIModel
  }
}