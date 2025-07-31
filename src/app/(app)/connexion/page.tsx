'use client'

import { useState } from 'react'
import { Button } from '@/shared/Button'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { 
  UserIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function ConnexionPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      setMessage('Connexion réussie ! Redirection...')
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)

    } catch (error: any) {
      setError(error.message || 'Erreur lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      })

      if (error) throw error

      setMessage('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')

    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
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
          <h2 className="mt-8 text-3xl font-bold text-white">
            {isLogin ? 'Connexion' : 'Créer un compte'}
          </h2>
          <p className="mt-2 text-lg text-slate-300">
            {isLogin ? 'Accédez à votre espace formation' : 'Rejoignez la communauté ONM'}
          </p>
        </div>

        <div className="bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-6">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-700 dark:text-white"
                      placeholder="Jean"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required={!isLogin}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-700 dark:text-white"
                    placeholder="Dupont"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Email
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                  placeholder="jean.dupont@example.com"
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
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="w-full px-4 pr-12 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
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

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-700 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer le compte')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {isLogin ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isLogin ? 'Créer un compte' : 'Se connecter'}
              </button>
            </p>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link 
                href="/mot-de-passe-oublie" 
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}