'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import Input from '@/shared/Input'
import { useSubscription } from '@/hooks/useSubscription'
import { useAdminRole } from '@/hooks/useAdminRole'
import { 
  CogIcon,
  SparklesIcon,
  EnvelopeIcon,
  ChartBarIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  PlusIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const SettingsContent = () => {
  const { hasFeature, subscription, refreshGlobalSettings } = useSubscription()
  const { isSuperAdmin } = useAdminRole()
  const [activeTab, setActiveTab] = useState('ai')
  const [settings, setSettings] = useState({
    // IA Settings
    aiProvider: 'openai',
    openaiApiKey: '',
    openaiModel: 'gpt-3.5-turbo',
    anthropicApiKey: '',
    anthropicModel: 'claude-3-sonnet-20240229',
    
    // SMTP Settings
    emailProvider: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: false,
    brevoApiKey: '',
    fromEmail: '',
    fromName: 'Initiative Immobilier',
    
    // Analytics
    analyticsEnabled: true,
    trackPropertyViews: true,
    trackUserBehavior: true,
    trackConversions: true,
    googleAnalyticsId: '',
    googleTagManagerId: '',
    
    // Stripe Configuration (Super Admin only)
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    paywallEnabled: true,
    globalFreeAccess: false
  })

  const [testingEmail, setTestingEmail] = useState(false)
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null)
  const [testEmailDestination, setTestEmailDestination] = useState('')
  const [saving, setSaving] = useState(false)

  // Charger les paramètres depuis localStorage ou la base de données
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Sauvegarder dans localStorage pour le moment
      localStorage.setItem('adminSettings', JSON.stringify(settings))
      
      // TODO: Sauvegarder dans Supabase
      
      // Rafraîchir les paramètres globaux dans le hook subscription
      if (refreshGlobalSettings) {
        await refreshGlobalSettings()
      }
      
      setTestEmailResult({ success: true, message: 'Paramètres sauvegardés avec succès' })
    } catch (error) {
      setTestEmailResult({ success: false, message: 'Erreur lors de la sauvegarde' })
    } finally {
      setSaving(false)
    }
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    setTestEmailResult(null)
    
    try {
      // TODO: Implémenter le test d'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulation
      
      setTestEmailResult({ 
        success: true, 
        message: 'Email de test envoyé avec succès!' 
      })
    } catch (error) {
      setTestEmailResult({ 
        success: false, 
        message: 'Erreur lors de l\'envoi de l\'email de test' 
      })
    } finally {
      setTestingEmail(false)
    }
  }

  const tabs = [
    { id: 'ai', name: 'Intelligence Artificielle', icon: SparklesIcon },
    { id: 'email', name: 'Configuration Email', icon: EnvelopeIcon },
    { id: 'email-logs', name: 'Logs Emails', icon: DocumentTextIcon },
    { id: 'email-templates', name: 'Modèles Emails', icon: DocumentTextIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'payment', name: 'Paiement', icon: CreditCardIcon },
    ...(isSuperAdmin ? [{ id: 'stripe', name: 'Configuration Stripe', icon: CreditCardIcon }] : [])
  ]

  return (
    <AdminLayout currentPage="settings">
      <div className="space-y-6">
        <div>
          <Heading as="h1" className="flex items-center gap-3">
            <CogIcon className="h-8 w-8 text-blue-600" />
            Paramètres
          </Heading>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Configurez les intégrations et les paramètres de votre backoffice
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
          {/* IA Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Configuration de l'IA</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Configurez votre clé API pour utiliser la génération de contenu par IA
                </p>
              </div>

              {/* Notification abonnement requis */}
              {!hasFeature('ai') && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                        Fonctionnalité Premium
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                        La génération IA nécessite un abonnement Pro ou Premium.
                      </p>
                      <Button size="sm" href="/admin/subscription">
                        Découvrir nos plans
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {hasFeature('ai') && subscription.features.maxAiGenerations !== -1 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Plan actuel :</strong> {subscription.planName} - 
                    {subscription.features.maxAiGenerations} générations IA par mois
                  </p>
                </div>
              )}

              <div className={`space-y-4 ${!hasFeature('ai') ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Fournisseur d'IA
                  </label>
                  <select
                    value={settings.aiProvider}
                    onChange={(e) => handleInputChange('aiProvider', e.target.value)}
                    disabled={!hasFeature('ai')}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 disabled:opacity-50"
                  >
                    <option value="openai">OpenAI (Nécessite crédits API séparés)</option>
                    <option value="anthropic">Anthropic Claude (Recommandé - Plus économique)</option>
                  </select>
                </div>

                {settings.aiProvider === 'openai' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Clé API OpenAI
                      </label>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                        <Input
                          type="password"
                          value={settings.openaiApiKey}
                          onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                          className="pl-10"
                          placeholder="sk-..."
                        />
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">
                        Obtenez votre clé sur <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a>
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Modèle OpenAI
                      </label>
                      <select
                        value={settings.openaiModel}
                        onChange={(e) => handleInputChange('openaiModel', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600"
                      >
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Recommandé - Rapide et économique)</option>
                        <option value="gpt-4">GPT-4 (Plus intelligent mais plus lent)</option>
                        <option value="gpt-4-turbo-preview">GPT-4 Turbo (Plus rapide que GPT-4)</option>
                      </select>
                    </div>
                  </>
                )}

                {settings.aiProvider === 'anthropic' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Clé API Anthropic
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                      <Input
                        type="password"
                        value={settings.anthropicApiKey}
                        onChange={(e) => handleInputChange('anthropicApiKey', e.target.value)}
                        className="pl-10"
                        placeholder="sk-ant-..."
                      />
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      Obtenez votre clé sur <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Configuration Email</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Configurez l'envoi d'emails pour votre application
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Fournisseur d'email
                  </label>
                  <select
                    value={settings.emailProvider}
                    onChange={(e) => handleInputChange('emailProvider', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600"
                  >
                    <option value="smtp">SMTP Classique</option>
                    <option value="brevo">Brevo API</option>
                  </select>
                </div>

                {settings.emailProvider === 'smtp' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Serveur SMTP
                        </label>
                        <Input
                          value={settings.smtpHost}
                          onChange={(e) => handleInputChange('smtpHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Port
                        </label>
                        <Input
                          value={settings.smtpPort}
                          onChange={(e) => handleInputChange('smtpPort', e.target.value)}
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Nom d'utilisateur
                      </label>
                      <Input
                        value={settings.smtpUser}
                        onChange={(e) => handleInputChange('smtpUser', e.target.value)}
                        placeholder="user@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Mot de passe
                      </label>
                      <Input
                        type="password"
                        value={settings.smtpPassword}
                        onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="smtpSecure"
                        checked={settings.smtpSecure}
                        onChange={(e) => handleInputChange('smtpSecure', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="smtpSecure" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                        Utiliser SSL/TLS
                      </label>
                    </div>
                  </>
                )}

                {settings.emailProvider === 'brevo' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Clé API Brevo
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                      <Input
                        type="password"
                        value={settings.brevoApiKey}
                        onChange={(e) => handleInputChange('brevoApiKey', e.target.value)}
                        className="pl-10"
                        placeholder="xkeysib-..."
                      />
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      Obtenez votre clé sur <a href="https://app.brevo.com/settings/keys/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">app.brevo.com</a>
                    </p>
                  </div>
                )}

                <div className="border-t pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Email d'expédition
                    </label>
                    <Input
                      type="email"
                      value={settings.fromEmail}
                      onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                      placeholder="contact@initiative-immo.fr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Nom d'expédition
                    </label>
                    <Input
                      value={settings.fromName}
                      onChange={(e) => handleInputChange('fromName', e.target.value)}
                      placeholder="Initiative Immobilier"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Email de destination pour le test
                    </label>
                    <Input
                      type="email"
                      value={testEmailDestination}
                      onChange={(e) => setTestEmailDestination(e.target.value)}
                      placeholder="test@example.com"
                    />
                    <p className="mt-1 text-sm text-neutral-500">
                      L'email de test sera envoyé à cette adresse
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleTestEmail}
                      disabled={testingEmail || !testEmailDestination || !testEmailDestination.includes('@')}
                      outline
                    >
                      {testingEmail ? 'Envoi en cours...' : 'Tester l\'envoi d\'email'}
                    </Button>

                    {testEmailResult && (
                      <div className={`flex items-center gap-2 text-sm ${testEmailResult.success ? 'text-green-600' : 'text-red-600'}`}>
                        {testEmailResult.success ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <XCircleIcon className="h-5 w-5" />
                        )}
                        {testEmailResult.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Logs */}
          {activeTab === 'email-logs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Logs d'Emails</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Historique des emails envoyés depuis la plateforme
                </p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-6">
                <div className="text-center py-8">
                  <EnvelopeIcon className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Fonctionnalité de logs emails en cours de développement
                  </p>
                  <p className="text-sm text-neutral-400 mt-2">
                    Affichera l'historique des emails envoyés avec statuts de livraison
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email Templates */}
          {activeTab === 'email-templates' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Modèles d'Emails</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Créez et gérez vos templates d'emails personnalisés
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Email de Bienvenue</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900/20 dark:text-green-400">
                        Actif
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      Email automatique envoyé lors de l'inscription
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      Modifier →
                    </button>
                  </div>

                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Confirmation de Visite</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900/20 dark:text-green-400">
                        Actif
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      Confirmation automatique des demandes de visite
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      Modifier →
                    </button>
                  </div>

                  <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Rapport d'Estimation</h4>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded dark:bg-yellow-900/20 dark:text-yellow-400">
                        Brouillon
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                      Email avec rapport d'estimation personnalisé
                    </p>
                    <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      Configurer →
                    </button>
                  </div>

                  <div className="border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg p-4 flex items-center justify-center">
                    <div className="text-center">
                      <PlusIcon className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Ajouter un nouveau modèle
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Settings */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Configuration Analytics</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Configurez le système de tracking et les intégrations analytics
                </p>
              </div>

              {/* Analytics intégrée */}
              <div className="border-b border-neutral-200 dark:border-neutral-700 pb-6">
                <h4 className="text-md font-medium mb-4">Analytics intégrée</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Activer le système analytics
                      </label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Active le tracking des événements et statistiques
                      </p>
                    </div>
                    <button
                      onClick={() => handleInputChange('analyticsEnabled', !settings.analyticsEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings.analyticsEnabled 
                          ? 'bg-blue-600' 
                          : 'bg-neutral-200 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.analyticsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.analyticsEnabled && (
                    <>
                      <div className="ml-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              Tracker les vues de propriétés
                            </label>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Enregistre chaque visite sur une page de propriété
                            </p>
                          </div>
                          <button
                            onClick={() => handleInputChange('trackPropertyViews', !settings.trackPropertyViews)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              settings.trackPropertyViews 
                                ? 'bg-blue-600' 
                                : 'bg-neutral-200 dark:bg-neutral-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.trackPropertyViews ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              Tracker le comportement utilisateur
                            </label>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Sessions, temps passé, pages visitées
                            </p>
                          </div>
                          <button
                            onClick={() => handleInputChange('trackUserBehavior', !settings.trackUserBehavior)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              settings.trackUserBehavior 
                                ? 'bg-blue-600' 
                                : 'bg-neutral-200 dark:bg-neutral-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.trackUserBehavior ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              Tracker les conversions
                            </label>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Formulaires de contact, demandes d'estimation
                            </p>
                          </div>
                          <button
                            onClick={() => handleInputChange('trackConversions', !settings.trackConversions)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              settings.trackConversions 
                                ? 'bg-blue-600' 
                                : 'bg-neutral-200 dark:bg-neutral-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.trackConversions ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mt-4">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                          <strong>Note :</strong> Les données analytics sont stockées localement dans votre base de données. 
                          Aucune donnée n'est envoyée à des services tiers sans votre consentement.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Google Analytics */}
              <div className="space-y-4">
                <h4 className="text-md font-medium mb-4">Google Analytics (optionnel)</h4>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Google Analytics ID
                  </label>
                  <Input
                    value={settings.googleAnalyticsId}
                    onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="mt-1 text-sm text-neutral-500">
                    Format: G-XXXXXXXXXX ou UA-XXXXX-X
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Google Tag Manager ID (optionnel)
                  </label>
                  <Input
                    value={settings.googleTagManagerId}
                    onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Configuration des Paiements</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Gérez vos solutions de paiement et passerelles
                </p>
              </div>

              <div className="grid gap-4">
                {/* Carte Sherlock's */}
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                        <CreditCardIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                          Sherlock's LCL
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 mb-3">
                          Solution de paiement sécurisée par carte bancaire via LCL
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900/20 dark:text-green-400">
                            Cartes bancaires
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded dark:bg-blue-900/20 dark:text-blue-400">
                            3D Secure
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        href="/admin/sherlocks"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <CogIcon className="w-4 h-4" />
                        Configurer
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Carte Stripe */}
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:shadow-lg transition-shadow opacity-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                        <CreditCardIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                          Stripe
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 mb-3">
                          Plateforme de paiement moderne avec support abonnements
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">
                            Bientôt disponible
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        disabled
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <CogIcon className="w-4 h-4" />
                        Configurer
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Carte PayPal */}
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:shadow-lg transition-shadow opacity-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                        <CreditCardIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                          PayPal
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 mb-3">
                          Solution de paiement en ligne populaire et sécurisée
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">
                            Bientôt disponible
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        disabled
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <CogIcon className="w-4 h-4" />
                        Configurer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Information */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                      Sécurité des paiements
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Toutes les transactions sont sécurisées et conformes aux normes PCI-DSS.
                      Les informations bancaires ne sont jamais stockées sur nos serveurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stripe Configuration (Super Admin only) */}
          {activeTab === 'stripe' && isSuperAdmin && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-medium">Configuration Stripe - Super Admin</h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Configurez vos clés Stripe pour recevoir les paiements des abonnements agents
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                      Zone Super Admin
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Ces paramètres sont uniquement accessibles aux super administrateurs. 
                      Les clés configurées ici permettront de recevoir les paiements des agents de la plateforme.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Activation du système payant */}
                <div className="border-b border-neutral-200 dark:border-neutral-700 pb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Activer le système d'abonnements payants
                      </label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Active les restrictions et la monétisation des fonctionnalités
                      </p>
                    </div>
                    <button
                      onClick={() => handleInputChange('paywallEnabled', !settings.paywallEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings.paywallEnabled 
                          ? 'bg-blue-600' 
                          : 'bg-neutral-200 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.paywallEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Accès gratuit global (Mode développement)
                      </label>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Donne accès à toutes les fonctionnalités sans restriction d'abonnement
                      </p>
                    </div>
                    <button
                      onClick={() => handleInputChange('globalFreeAccess', !settings.globalFreeAccess)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        settings.globalFreeAccess 
                          ? 'bg-green-600' 
                          : 'bg-neutral-200 dark:bg-neutral-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.globalFreeAccess ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {settings.globalFreeAccess && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                            Mode accès gratuit activé
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-400">
                            Tous les utilisateurs ont maintenant accès aux fonctionnalités IA et Analytics sans restriction.
                            Idéal pour la configuration et les tests.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Configuration des clés Stripe */}
                <div className={`space-y-4 ${!settings.paywallEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Clé publique Stripe
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                      <Input
                        type="text"
                        value={settings.stripePublishableKey}
                        onChange={(e) => handleInputChange('stripePublishableKey', e.target.value)}
                        className="pl-10"
                        placeholder="pk_live_... ou pk_test_..."
                        disabled={!settings.paywallEnabled}
                      />
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      Clé publique pour le frontend (commence par pk_)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Clé secrète Stripe
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                      <Input
                        type="password"
                        value={settings.stripeSecretKey}
                        onChange={(e) => handleInputChange('stripeSecretKey', e.target.value)}
                        className="pl-10"
                        placeholder="sk_live_... ou sk_test_..."
                        disabled={!settings.paywallEnabled}
                      />
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      Clé secrète pour les transactions (commence par sk_)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Secret du webhook Stripe
                    </label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-3 h-5 w-5 text-neutral-400" />
                      <Input
                        type="password"
                        value={settings.stripeWebhookSecret}
                        onChange={(e) => handleInputChange('stripeWebhookSecret', e.target.value)}
                        className="pl-10"
                        placeholder="whsec_..."
                        disabled={!settings.paywallEnabled}
                      />
                    </div>
                    <p className="mt-1 text-sm text-neutral-500">
                      Secret du webhook pour vérifier les événements Stripe
                    </p>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Instructions de configuration
                  </h4>
                  <ol className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2 list-decimal list-inside">
                    <li>Créez un compte Stripe sur <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">stripe.com</a></li>
                    <li>Récupérez vos clés API dans le tableau de bord Stripe</li>
                    <li>Configurez un webhook pointant vers: <code className="bg-neutral-200 dark:bg-neutral-800 px-1 rounded">/api/stripe/webhook</code></li>
                    <li>Ajoutez les événements: checkout.session.completed, invoice.payment_succeeded, customer.subscription.updated</li>
                    <li>Copiez le secret du webhook et collez-le ci-dessus</li>
                    <li>Sauvegardez les paramètres et redémarrez l'application</li>
                  </ol>
                </div>

                {/* Variables d'environnement */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                    Configuration des variables d'environnement
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                    Après avoir sauvegardé, ajoutez ces variables dans votre fichier .env.local :
                  </p>
                  <div className="bg-amber-100 dark:bg-amber-900/40 rounded p-3 font-mono text-xs">
                    <div>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY={settings.stripePublishableKey || 'pk_...'}</div>
                    <div>STRIPE_SECRET_KEY={settings.stripeSecretKey || 'sk_...'}</div>
                    <div>STRIPE_WEBHOOK_SECRET={settings.stripeWebhookSecret || 'whsec_...'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requiredRole="admin">
        <SettingsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}