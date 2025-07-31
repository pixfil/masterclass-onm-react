'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  UserPlusIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

export default function CreateAdminAccountPage() {
  const [email, setEmail] = useState('philippe@gclicke.com')
  const [password, setPassword] = useState('admin1234')
  const [name, setName] = useState('Philippe G.')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 1. Créer l'utilisateur dans Supabase Auth avec confirmation automatique
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: 'super_admin'
          },
          emailRedirectTo: undefined // Pas de redirection email
        }
      })

      if (authError) {
        throw authError
      }

      console.log('Utilisateur créé:', authData)

      // 2. Confirmer l'utilisateur automatiquement (contournement)
      if (authData.user && !authData.user.email_confirmed_at) {
        // Utiliser la fonction RPC pour confirmer l'utilisateur
        const { error: confirmError } = await supabase.rpc('confirm_user', {
          user_email: email
        });
        
        if (confirmError) {
          console.log('Erreur confirmation automatique:', confirmError);
          setError(`Utilisateur créé mais non confirmé. Exécutez cette requête SQL dans Supabase: 
            UPDATE auth.users SET email_confirmed_at = NOW(), confirmed_at = NOW() WHERE email = '${email}';`);
          return;
        }
      }

      // 3. Ajouter dans admin_accounts
      const { error: dbError } = await supabase
        .from('admin_accounts')
        .upsert({
          email: email,
          name: name,
          role: 'super_admin',
          status: 'active'
        })

      if (dbError) {
        console.error('Erreur DB:', dbError)
        setError(`Utilisateur créé mais erreur DB: ${dbError.message}`)
      } else {
        setSuccess(`Compte admin créé avec succès ! Email: ${email}, Mot de passe: ${password}`)
      }

    } catch (error: any) {
      console.error('Erreur complète:', error)
      setError(`Erreur: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAndRecreate = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Supprimer de admin_accounts d'abord
      const { error: deleteError } = await supabase
        .from('admin_accounts')
        .delete()
        .eq('email', email)

      if (deleteError) {
        console.error('Erreur suppression:', deleteError)
      }

      setSuccess('Ancien compte supprimé de admin_accounts. Créez maintenant le nouveau compte.')
    } catch (error: any) {
      setError(`Erreur lors de la suppression: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="p-3 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-2xl border border-indigo-500/30 backdrop-blur-sm inline-block mb-4">
            <UserPlusIcon className="w-8 h-8 text-indigo-300" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Créer Compte Admin
          </h1>
          <p className="text-slate-300">
            Utilitaire de création de compte administrateur
          </p>
        </div>

        <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Mot de passe
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nom
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-700 dark:text-white"
              />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleDeleteAndRecreate}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Suppression...' : '1. Supprimer ancien compte'}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Création...' : '2. Créer nouveau compte'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                Instructions :
              </h3>
              <ol className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <li>1. Cliquez d'abord sur "Supprimer ancien compte"</li>
                <li>2. Puis cliquez sur "Créer nouveau compte"</li>
                <li>3. Testez la connexion sur /admin/login</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link 
            href="/admin/login" 
            className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}