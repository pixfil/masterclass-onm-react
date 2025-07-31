'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/shared/Button'
import { toast } from 'react-hot-toast'

const AdminSetupPage = () => {
  const [email, setEmail] = useState('philippe@gclicke.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateAdmin = async () => {
    if (!password || password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    
    try {
      // Créer l'utilisateur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: 'Philippe',
            last_name: 'Admin',
            role: 'admin',
            is_admin: true
          }
        }
      })

      if (authError) {
        // Si l'utilisateur existe déjà, essayer de le connecter
        if (authError.message.includes('already registered')) {
          toast.error('Cet email est déjà enregistré. Utilisez la page de connexion.')
        } else {
          throw authError
        }
        return
      }

      toast.success('Compte admin créé avec succès ! Vérifiez votre email pour confirmer.')
      
      // Optionnel : Se connecter directement
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (!signInError) {
        toast.success('Connexion réussie !')
        window.location.href = '/admin'
      }

    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin`,
      })

      if (error) throw error

      toast.success('Email de réinitialisation envoyé ! Vérifiez votre boîte mail.')
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.message || 'Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Erreur de connexion:', error)
        toast.error('Erreur de connexion à Supabase')
      } else {
        console.log('Session actuelle:', data)
        toast.success('Connexion à Supabase OK')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur de connexion')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Configuration Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Page temporaire pour créer/réinitialiser un compte admin
          </p>
        </div>

        <div className="mt-8 space-y-6 bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleCreateAdmin}
              loading={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Créer compte admin
            </Button>

            <Button
              onClick={handleResetPassword}
              loading={loading}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white"
            >
              Envoyer email de réinitialisation
            </Button>

            <Button
              onClick={handleTestConnection}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Tester connexion Supabase
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-neutral-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              ⚠️ Cette page doit être supprimée en production
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
              <a href="/admin/login" className="text-indigo-600 hover:text-indigo-500">
                Retour à la connexion
              </a>
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Instructions :
          </h3>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
            <li>Option 1 : Créez un nouveau compte avec le bouton "Créer compte admin"</li>
            <li>Option 2 : Réinitialisez le mot de passe si le compte existe déjà</li>
            <li>Option 3 : Testez la connexion Supabase pour vérifier la configuration</li>
            <li>Après création, vérifiez votre email pour confirmer le compte</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminSetupPage