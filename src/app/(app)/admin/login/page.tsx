'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { Button } from '@/shared/Button'
import { Heading } from '@/shared/Heading'
import Input from '@/shared/Input'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Tentative de connexion avec:', email)
      const result = await signIn(email, password)
      console.log('Connexion réussie:', result)
      
      // Attendre un peu pour que l'état soit mis à jour
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 100)
    } catch (error: any) {
      console.error('Erreur de connexion:', error)
      setError(error.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center dark:bg-neutral-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Heading as="h1" className="text-primary-600">
            Initiative Immobilier
          </Heading>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Connexion administration
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 dark:bg-neutral-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="philippe@gclicke.com"
              required
              autoComplete="email"
            />

            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Accès réservé aux administrateurs
            </p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  )
}