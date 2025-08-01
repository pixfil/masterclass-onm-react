'use client'

import React, { useState } from 'react'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

const NewsletterFormations = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // TODO: Implémenter l'inscription à la newsletter
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Inscription réussie ! Vous recevrez nos prochaines dates de formation.')
      setEmail('')
    } catch (error) {
      setMessage('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="nc-NewsletterFormations relative py-16">
      <div className="relative bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-8 lg:p-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-800/30 rounded-full mb-6">
            <EnvelopeIcon className="w-10 h-10 text-blue-600" />
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Restez informé des prochaines formations
          </h2>
          
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
            Recevez en avant-première les dates de nos sessions, 
            les nouveaux programmes et les offres exclusives.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
                className="w-full px-6 py-4 pr-36 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <ButtonPrimary
                type="submit"
                loading={loading}
                disabled={loading}
                className="absolute right-1 top-1 bottom-1 px-6"
              >
                S'inscrire
              </ButtonPrimary>
            </div>

            {message && (
              <p className={`mt-4 text-sm ${message.includes('réussie') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </form>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6">
            En vous inscrivant, vous acceptez de recevoir nos communications. 
            Vous pouvez vous désinscrire à tout moment.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NewsletterFormations