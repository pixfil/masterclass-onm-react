'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { 
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      console.log('Tentative de connexion avec:', email)
      const result = await signIn(email, password)
      console.log('Connexion réussie:', result)
      
      setMessage('Connexion réussie ! Redirection vers l\'administration...')
      
      // Attendre un peu pour que l'état soit mis à jour
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 1500)
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      setError(error.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Veuillez saisir votre email')
      return
    }

    // Vérifier que c'est un email admin autorisé
    const authorizedEmails = [
      'philippe@gclicke.com',
      'philippe@initiative-immo.fr',
      'admin@initiative-immo.fr',
      'coual.philippe@gmail.com'
    ]

    if (!authorizedEmails.includes(email)) {
      setError('Email non autorisé pour l\'administration')
      return
    }

    setResetLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })

      if (error) throw error

      setMessage(`Email de réinitialisation envoyé à ${email}. Vérifiez votre boîte mail.`)
      setShowResetPassword(false)
    } catch (error: any) {
      console.error('Erreur reset:', error)
      setError(error.message || 'Erreur lors de l\'envoi de l\'email')
    } finally {
      setResetLoading(false)
    }
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
              <ShieldCheckIcon className="w-8 h-8 text-indigo-300" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Administration
          </h2>
          <p className="mt-2 text-lg text-slate-300">
            Accès réservé aux administrateurs autorisés
          </p>
        </div>

        <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 flex items-center gap-2">
              <CheckCircleIcon className="w-4 h-4" />
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {!showResetPassword ? (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email administrateur
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-700 dark:text-white"
                  placeholder="philippe@gclicke.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 pr-12 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                  Connexion...
                </>
              ) : (
                'Accéder à l\'administration'
              )}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-2 mx-auto"
              >
                <KeyIcon className="w-4 h-4" />
                Mot de passe oublié ?
              </button>
            </div>
          </form>
          ) : (
            <div>
              <div className="text-center mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-2xl border border-indigo-500/30 backdrop-blur-sm inline-block mb-4">
                  <KeyIcon className="w-8 h-8 text-indigo-300" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                  Réinitialiser le mot de passe
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  Entrez votre email admin pour recevoir un lien de réinitialisation
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Email administrateur
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-700 dark:text-white"
                      placeholder="philippe@gclicke.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(false)}
                    className="flex-1 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium py-3 px-6 rounded-xl hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {resetLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi...
                      </>
                    ) : (
                      'Envoyer le lien'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                Comptes administrateurs autorisés :
              </h3>
              <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <div>• philippe@gclicke.com</div>
                <div>• philippe@initiative-immo.fr</div> 
                <div>• admin@initiative-immo.fr</div>
                <div>• coual.philippe@gmail.com</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors"
          >
            ← Retour au site public
          </Link>
        </div>
      </div>
    </div>
  )
}