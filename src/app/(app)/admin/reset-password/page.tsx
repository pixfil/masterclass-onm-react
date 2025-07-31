'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

function ResetPasswordContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Vérifier si nous avons les paramètres nécessaires pour la réinitialisation
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (accessToken && refreshToken) {
      // Définir la session avec les tokens reçus
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/admin/login')
      }, 3000)

    } catch (error: any) {
      console.error('Erreur reset:', error)
      setError(error.message || 'Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              Mot de passe modifié !
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6">
              Votre mot de passe administrateur a été mis à jour avec succès. 
              Redirection vers la page de connexion...
            </p>
            <Link href="/admin/login">
              <button className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl">
                Aller à la connexion
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/40 to-cyan-900/20" />
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              MASTERCLASS ONM
            </div>
            <div className="text-sm text-indigo-200 font-medium">
              Orthodontie Neuro-Musculaire
            </div>
          </Link>
          <div className="mt-8 flex items-center justify-center">
            <div className="p-3 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-2xl border border-indigo-500/30 backdrop-blur-sm">
              <KeyIcon className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-lg text-slate-300">
            Définissez votre nouveau mot de passe administrateur
          </p>
        </div>

        <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 pr-12 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-700 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 pr-12 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-700 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Critères du mot de passe :
              </h3>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Au moins 6 caractères</li>
                <li>• Différent de votre ancien mot de passe</li>
                <li>• Recommandé : mélange de lettres, chiffres et symboles</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour le mot de passe'
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
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

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}