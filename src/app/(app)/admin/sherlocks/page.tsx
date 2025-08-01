'use client'

import React, { useState, useEffect } from 'react'
import { 
  CreditCardIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon,
  KeyIcon,
  GlobeAltIcon,
  BeakerIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { SherlocksService, SherlocksSettings } from '@/lib/supabase/sherlocks'
import { AdminLayout } from '@/components/admin/AdminLayout'

export default function SherlocksSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Partial<SherlocksSettings>>({
    merchant_id: '',
    merchant_country: 'fr',
    currency_code: '978',
    environment: 'TEST',
    secret_key: '',
    key_version: '1',
    card_list: 'CB,VISA,MASTERCARD',
    language: 'fr',
    capture_mode: 'AUTHOR_CAPTURE',
    capture_day: 0,
    header_flag: true,
    enable_3ds: true,
    enable_3ds2: true,
    challenge_3ds2: 'AUTHENTICATION_REQUESTED',
    active: false
  })

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const allSettings = await SherlocksService.getAllSettings()
      if (allSettings.length > 0) {
        setSettings(allSettings[0])
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error)
      toast.error('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Définir les URLs automatiquement
      const updatedSettings = {
        ...settings,
        normal_return_url: `${baseUrl}/api/sherlocks/return?status=success&order_id={ORDER_ID}`,
        cancel_return_url: `${baseUrl}/api/sherlocks/return?status=cancel&order_id={ORDER_ID}`,
        automatic_response_url: `${baseUrl}/api/sherlocks/response`
      }

      await SherlocksService.upsertSettings(updatedSettings)
      toast.success('Paramètres Sherlock\'s sauvegardés avec succès')
      await loadSettings()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde des paramètres')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof SherlocksSettings) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value
    
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <AdminLayout currentPage="sherlocks">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPage="sherlocks">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
              <CreditCardIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Configuration Sherlock's LCL
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Paramètres de la passerelle de paiement LCL Sherlock's
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* Informations générales */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <KeyIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Informations d'identification
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ID Marchand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={settings.merchant_id}
                      onChange={handleInputChange('merchant_id')}
                      placeholder="Ex: 014295303911111"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Fourni par LCL (15 chiffres)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Environnement <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={settings.environment}
                      onChange={handleInputChange('environment')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="TEST">Test</option>
                      <option value="PRODUCTION">Production</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Mode test ou production</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Clé secrète
                    </label>
                    <input
                      type="password"
                      value={settings.secret_key}
                      onChange={handleInputChange('secret_key')}
                      placeholder="Clé secrète fournie par LCL"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Version de la clé
                    </label>
                    <input
                      type="text"
                      value={settings.key_version}
                      onChange={handleInputChange('key_version')}
                      placeholder="Ex: 1"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Statut */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.active}
                      onChange={handleInputChange('active')}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Activer cette configuration
                    </span>
                  </label>
                  {settings.active && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4" />
                        Cette configuration sera utilisée pour les paiements
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Paramètres régionaux */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <GlobeAltIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  Paramètres régionaux
                </h2>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pays du marchand
                    </label>
                    <select
                      value={settings.merchant_country}
                      onChange={handleInputChange('merchant_country')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="fr">France</option>
                      <option value="be">Belgique</option>
                      <option value="ch">Suisse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Devise
                    </label>
                    <select
                      value={settings.currency_code}
                      onChange={handleInputChange('currency_code')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="978">EUR - Euro</option>
                      <option value="840">USD - Dollar US</option>
                      <option value="826">GBP - Livre Sterling</option>
                      <option value="756">CHF - Franc Suisse</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Langue
                    </label>
                    <select
                      value={settings.language}
                      onChange={handleInputChange('language')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                      <option value="es">Español</option>
                      <option value="it">Italiano</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Options de paiement */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CogIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Options de paiement
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cartes acceptées
                  </label>
                  <input
                    type="text"
                    value={settings.card_list}
                    onChange={handleInputChange('card_list')}
                    placeholder="CB,VISA,MASTERCARD"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Séparer par des virgules</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mode de capture
                    </label>
                    <select
                      value={settings.capture_mode}
                      onChange={handleInputChange('capture_mode')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="AUTHOR_CAPTURE">Autorisation + Capture</option>
                      <option value="VALIDATION">Validation manuelle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Délai de capture (jours)
                    </label>
                    <input
                      type="number"
                      value={settings.capture_day}
                      onChange={handleInputChange('capture_day')}
                      min="0"
                      max="7"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Options 3D Secure */}
                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600" />
                    Sécurité 3D Secure
                  </h3>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enable_3ds}
                      onChange={handleInputChange('enable_3ds')}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Activer 3D Secure v1
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enable_3ds2}
                      onChange={handleInputChange('enable_3ds2')}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Activer 3D Secure v2
                    </span>
                  </label>

                  {settings.enable_3ds2 && (
                    <div className="ml-8">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Challenge 3DS2
                      </label>
                      <select
                        value={settings.challenge_3ds2}
                        onChange={handleInputChange('challenge_3ds2')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="AUTHENTICATION_REQUESTED">Authentification demandée</option>
                        <option value="NO_PREFERENCE">Pas de préférence</option>
                        <option value="CHALLENGE_REQUESTED">Challenge requis</option>
                        <option value="CHALLENGE_MANDATED">Challenge obligatoire</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Affichage du header */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.header_flag}
                      onChange={handleInputChange('header_flag')}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      Afficher le header sur la page de paiement
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* URLs de retour (info) */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    URLs de retour configurées automatiquement
                  </h3>
                  <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                    <p><strong>URL de retour normale :</strong> {baseUrl}/api/sherlocks/return?status=success</p>
                    <p><strong>URL d'annulation :</strong> {baseUrl}/api/sherlocks/return?status=cancel</p>
                    <p><strong>URL de réponse automatique :</strong> {baseUrl}/api/sherlocks/response</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Avertissement mode test */}
            {settings.environment === 'TEST' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      Mode Test activé
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Les paiements ne seront pas réellement effectués. Utilisez les cartes de test fournies par LCL.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => loadSettings()}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Enregistrer les paramètres
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}