'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/shared/Button'
import { toast } from 'react-hot-toast'

// ⚠️ PAGE TEMPORAIRE - À SUPPRIMER EN PRODUCTION
const ResetAdminPage = () => {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const resetAdmin = async () => {
    setLoading(true)
    setLogs([])
    
    try {
      // Créer un client Supabase avec la clé service (admin)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      addLog('Début du processus de réinitialisation...')
      
      // Étape 1: Essayer de supprimer l'utilisateur existant
      setStep(1)
      addLog('Tentative de suppression de l\'ancien compte...')
      
      // Note: La suppression d'utilisateur nécessite une clé service_role côté serveur
      // On va donc créer une route API pour ça
      
      // Pour l'instant, on va directement créer/mettre à jour
      setStep(2)
      addLog('Création du nouveau compte admin...')
      
      // Créer le nouvel utilisateur
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'philippe@gclicke.com',
        password: 'admin1234',
        options: {
          data: {
            first_name: 'Philippe',
            last_name: 'Admin',
            role: 'super_admin',
            is_admin: true,
            created_by_reset: true
          },
          emailRedirectTo: `${window.location.origin}/admin/dashboard`
        }
      })

      if (signUpError) {
        // Si l'utilisateur existe déjà, essayer de se connecter et mettre à jour le mot de passe
        if (signUpError.message.includes('already registered')) {
          addLog('Utilisateur déjà existant, tentative de mise à jour du mot de passe...')
          
          // Envoyer un email de réinitialisation
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            'philippe@gclicke.com',
            {
              redirectTo: `${window.location.origin}/admin/reset-password`,
            }
          )
          
          if (resetError) {
            throw new Error(`Erreur lors de la réinitialisation: ${resetError.message}`)
          }
          
          addLog('Email de réinitialisation envoyé !')
          addLog('⚠️ Vérifiez votre boîte mail pour réinitialiser le mot de passe')
          toast.success('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.')
          return
        }
        throw signUpError
      }

      addLog('✅ Compte créé avec succès !')
      addLog('Email: philippe@gclicke.com')
      addLog('Mot de passe: admin1234')
      addLog('Rôle: super_admin')
      
      // Étape 3: Se connecter automatiquement
      setStep(3)
      addLog('Connexion automatique...')
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'philippe@gclicke.com',
        password: 'admin1234'
      })

      if (signInError) {
        addLog(`⚠️ Connexion échouée: ${signInError.message}`)
        addLog('Vous devrez peut-être confirmer votre email avant de vous connecter')
      } else {
        addLog('✅ Connexion réussie !')
        toast.success('Compte admin créé et connecté avec succès !')
        
        // Rediriger après 2 secondes
        setTimeout(() => {
          window.location.href = '/admin/dashboard'
        }, 2000)
      }

    } catch (error: any) {
      console.error('Erreur:', error)
      addLog(`❌ Erreur: ${error.message}`)
      toast.error(error.message || 'Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">
            ⚠️ RÉINITIALISATION ADMIN
          </h1>
          <p className="text-red-400 mb-4">
            Cette page va créer/réinitialiser le compte admin avec les identifiants suivants :
          </p>
          <div className="bg-black/50 rounded p-4 mb-4 font-mono text-left">
            <p className="text-green-400">Email: philippe@gclicke.com</p>
            <p className="text-green-400">Mot de passe: admin1234</p>
            <p className="text-green-400">Rôle: super_admin</p>
          </div>
          <p className="text-yellow-400 text-sm">
            ⚠️ CETTE PAGE DOIT ÊTRE SUPPRIMÉE EN PRODUCTION
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-center mb-6">
            <Button
              onClick={resetAdmin}
              loading={loading}
              className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3"
            >
              {loading ? 'Réinitialisation en cours...' : 'RÉINITIALISER LE COMPTE ADMIN'}
            </Button>
          </div>

          {/* Progress */}
          {step > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-500' : 'bg-gray-600'}`}>
                  1
                </div>
                <div className={`w-16 h-1 ${step >= 2 ? 'bg-green-500' : 'bg-gray-600'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-500' : 'bg-gray-600'}`}>
                  2
                </div>
                <div className={`w-16 h-1 ${step >= 3 ? 'bg-green-500' : 'bg-gray-600'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}>
                  3
                </div>
              </div>
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div className="bg-black rounded p-4 font-mono text-sm text-green-400 max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <a
            href="/admin/login"
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            ← Retour à la page de connexion
          </a>
        </div>
      </div>
    </div>
  )
}

export default ResetAdminPage