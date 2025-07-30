'use client'

import { useState } from 'react'
import { EnvelopeIcon } from '@heroicons/react/24/outline'

const NewsletterBanner = () => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simuler l'envoi (ici vous pouvez ajouter l'intégration avec votre service de newsletter)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setEmail('')
      
      // Remettre le formulaire disponible après 3 secondes
      setTimeout(() => {
        setIsSubmitted(false)
      }, 3000)
    }, 1000)
  }

  return (
    <div className="relative overflow-hidden min-h-[300px] lg:min-h-[350px] -mx-[50vw] left-1/2 right-1/2 w-screen">
      {/* Fond asymétrique - comme le header mais inversé */}
      <div className="absolute inset-y-0 start-0 w-screen bg-white"></div>
      <div className="relative h-full flex items-center">
        <div className="relative inline-flex w-full">
          <div className="absolute inset-y-0 start-48 w-screen md:start-96 bg-gradient-to-r from-blue-600 to-cyan-500"></div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8" style={{paddingTop: '3%', paddingBottom: '3%'}}>
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-white/10 rounded-full">
                  <EnvelopeIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Newsletter Masterclass ONM
              </h2>
              
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                Restez informé des dernières avancées en orthodontie neuro-musculaire
              </p>
              
              <p className="text-lg text-blue-200 mb-10 max-w-4xl mx-auto">
                Recevez en exclusivité nos nouvelles formations, études de cas, recherches et actualités de la méthode ONM.
              </p>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      placeholder="Votre adresse email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border-0 text-neutral-900 placeholder-neutral-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !email}
                      className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                          Inscription...
                        </div>
                      ) : (
                        "S'inscrire"
                      )}
                    </button>
                  </div>
                  
                  <p className="text-sm text-blue-200 mt-4">
                    Nous respectons votre vie privée. Désinscription possible à tout moment.
                  </p>
                </form>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="bg-white/10 rounded-lg p-6">
                    <div className="flex items-center justify-center mb-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Inscription confirmée !
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Vous recevrez bientôt notre prochaine newsletter avec les dernières avancées en orthodontie neuro-musculaire.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsletterBanner