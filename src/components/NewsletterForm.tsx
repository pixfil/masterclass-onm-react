'use client'

import { useState } from 'react'
import { Button } from '@/shared/Button'
import Input from '@/shared/Input'
import { subscribeToNewsletter } from '@/lib/supabase/newsletter'
import { AtSymbolIcon, CheckIcon } from '@heroicons/react/24/outline'

interface NewsletterFormProps {
  className?: string
}

export const NewsletterForm = ({ className = '' }: NewsletterFormProps) => {
  const [email, setEmail] = useState('')
  const [prenom, setPrenom] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('L\'email est requis')
      return
    }

    setLoading(true)
    setError('')

    try {
      await subscribeToNewsletter({
        email: email.trim(),
        prenom: prenom.trim() || undefined,
        source: 'footer'
      })
      
      setSuccess(true)
      setEmail('')
      setPrenom('')
      
      // Cacher le message de succès après 5 secondes
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      console.error('Newsletter subscription error:', err)
      if (err.message?.includes('duplicate key value')) {
        setError('Cette adresse email est déjà abonnée')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-sm text-green-800">
            Merci ! Votre inscription à la newsletter a été confirmée.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center mb-3">
        <AtSymbolIcon className="h-5 w-5 text-primary-600 mr-2" />
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
          Newsletter
        </h3>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Restez informé de nos dernières offres immobilières
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Votre adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
        
        <Input
          type="text"
          placeholder="Votre prénom (optionnel)"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          className="w-full"
        />

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full justify-center"
          size="sm"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Inscription...
            </div>
          ) : (
            "S'abonner"
          )}
        </Button>
      </form>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
        Vous pouvez vous désabonner à tout moment.
      </p>
    </div>
  )
}