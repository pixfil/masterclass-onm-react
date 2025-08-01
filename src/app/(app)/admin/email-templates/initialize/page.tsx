"use client"

import React, { useState } from 'react'
import { Mail, Check, AlertCircle, Loader, RefreshCcw } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { initializeReferralTemplates } from '@/lib/supabase/referral-emails'

export default function InitializeEmailTemplatesPage() {
  const [initializing, setInitializing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const handleInitialize = async () => {
    setInitializing(true)
    setError(null)
    setLogs(['Démarrage de l\'initialisation...'])

    try {
      // Capturer les logs de la console
      const originalLog = console.log
      const originalError = console.error
      
      console.log = (message: any) => {
        originalLog(message)
        if (typeof message === 'string') {
          setLogs(prev => [...prev, message])
        }
      }
      
      console.error = (message: any) => {
        originalError(message)
        if (typeof message === 'string') {
          setLogs(prev => [...prev, `❌ ${message}`])
        }
      }

      await initializeReferralTemplates()
      
      // Restaurer la console
      console.log = originalLog
      console.error = originalError

      setLogs(prev => [...prev, '✅ Initialisation terminée avec succès!'])
      setInitialized(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLogs(prev => [...prev, `❌ Erreur: ${err}`])
    } finally {
      setInitializing(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Mail className="w-6 h-6 mr-2" />
              Initialisation des modèles d'emails
            </h1>
            <p className="text-gray-600 mt-1">
              Configurez les modèles d'emails pour le système de parrainage
            </p>
          </div>

          {/* Carte principale */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Modèles d'emails de parrainage
                </h2>
                <p className="text-gray-600 mb-4">
                  Cette action va créer les modèles d'emails suivants dans la base de données :
                </p>
                
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Invitation de Parrainage</strong> - Email envoyé aux filleuls potentiels
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Confirmation d'envoi</strong> - Confirmation envoyée au parrain
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Notification de succès</strong> - Email envoyé au parrain quand un filleul s'inscrit
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Email de bienvenue filleul</strong> - Email de bienvenue avec code promo
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Rappel d'invitation</strong> - Rappel pour les invitations non utilisées
                    </div>
                  </li>
                </ul>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                      <div className="text-sm text-red-600">
                        <p className="font-medium">Erreur lors de l'initialisation</p>
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {initialized && !error && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                      <div className="text-sm text-green-600">
                        <p className="font-medium">Initialisation réussie!</p>
                        <p>Les modèles d'emails ont été créés avec succès.</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleInitialize}
                  disabled={initializing}
                  className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    initializing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : initialized
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {initializing ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Initialisation en cours...
                    </>
                  ) : initialized ? (
                    <>
                      <RefreshCcw className="w-5 h-5 mr-2" />
                      Réinitialiser les modèles
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Initialiser les modèles d'emails
                    </>
                  )}
                </button>
              </div>

              {/* Logs */}
              {logs.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Journal d'initialisation</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-1">
                      {logs.map((log, index) => (
                        <div key={index} className="text-sm font-mono text-gray-600">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Cette action ne créera que les modèles qui n'existent pas déjà</li>
                  <li>Les modèles existants ne seront pas modifiés</li>
                  <li>Vous pourrez personnaliser les modèles après leur création</li>
                  <li>Assurez-vous que votre service d'envoi d'emails est configuré</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}