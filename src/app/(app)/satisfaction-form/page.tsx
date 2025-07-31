'use client'

import { useState } from 'react'
import { Heading } from '@/shared/Heading'
import { Button } from '@/shared/Button'
import { 
  StarIcon,
  FaceSmileIcon,
  AcademicCapIcon,
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface SatisfactionFormData {
  formation_title: string
  session_date: string
  session_location: string
  user_name: string
  user_email: string
  overall_rating: number
  content_rating: number
  instructor_rating: number
  organization_rating: number
  venue_rating: number
  would_recommend: boolean | null
  comments: string
  improvements: string
}

const SatisfactionFormPage = () => {
  const [formData, setFormData] = useState<SatisfactionFormData>({
    formation_title: '',
    session_date: '',
    session_location: '',
    user_name: '',
    user_email: '',
    overall_rating: 0,
    content_rating: 0,
    instructor_rating: 0,
    organization_rating: 0,
    venue_rating: 0,
    would_recommend: null,
    comments: '',
    improvements: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRatingChange = (field: keyof SatisfactionFormData, rating: number) => {
    setFormData(prev => ({ ...prev, [field]: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Ici on ferait l'appel API pour sauvegarder les données
      // await submitSatisfactionForm(formData)
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert('Erreur lors de l\'envoi du formulaire')
    } finally {
      setLoading(false)
    }
  }

  const renderStarRating = (field: keyof SatisfactionFormData, currentRating: number) => {
    return (
      <div className="flex space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleRatingChange(field, i + 1)}
            className="focus:outline-none"
          >
            {i < currentRating ? (
              <StarIconSolid className="h-6 w-6 text-yellow-400" />
            ) : (
              <StarIcon className="h-6 w-6 text-gray-300 hover:text-yellow-400 transition-colors" />
            )}
          </button>
        ))}
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center py-12">
        <div className="max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Merci pour votre retour !
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Votre évaluation de satisfaction a été envoyée avec succès. 
            Vos commentaires nous aident à améliorer nos formations.
          </p>
          <Button 
            onClick={() => window.close()}
            className="w-full"
          >
            Fermer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-6">
            <FaceSmileIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <span className="text-sm font-medium text-primary-800 dark:text-primary-400">
              Évaluation de satisfaction
            </span>
          </div>
          <Heading className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            Évaluez votre formation ONM
          </Heading>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Votre avis nous est précieux pour améliorer continuellement la qualité de nos formations.
            Prenez quelques minutes pour partager votre expérience.
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations formation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                  Formation suivie *
                </label>
                <select
                  value={formData.formation_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, formation_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  required
                >
                  <option value="">Sélectionnez votre formation</option>
                  <option value="Formation ONM Niveau 1">Formation ONM Niveau 1</option>
                  <option value="Formation ONM Niveau 2">Formation ONM Niveau 2</option>
                  <option value="Webinaire ONM - Découverte">Webinaire ONM - Découverte</option>
                  <option value="Formation ONM Avancée">Formation ONM Avancée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Date de la session *
                </label>
                <input
                  type="date"
                  value={formData.session_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, session_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  <MapPinIcon className="h-4 w-4 inline mr-1" />
                  Lieu de la formation *
                </label>
                <input
                  type="text"
                  value={formData.session_location}
                  onChange={(e) => setFormData(prev => ({ ...prev, session_location: e.target.value }))}
                  placeholder="Ex: Paris, Lyon, En ligne..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Votre nom complet *
                </label>
                <input
                  type="text"
                  value={formData.user_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                  placeholder="Dr. Prénom Nom"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Votre email *
                </label>
                <input
                  type="email"
                  value={formData.user_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                  placeholder="votre.email@exemple.fr"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Évaluations */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Évaluez les différents aspects de la formation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Qualité du contenu *
                  </label>
                  {renderStarRating('content_rating', formData.content_rating)}
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Qualité du formateur *
                  </label>
                  {renderStarRating('instructor_rating', formData.instructor_rating)}
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Organisation générale *
                  </label>
                  {renderStarRating('organization_rating', formData.organization_rating)}
                </div>

                <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Lieu et équipements *
                  </label>
                  {renderStarRating('venue_rating', formData.venue_rating)}
                </div>
              </div>

              <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                  Note globale *
                </label>
                <div className="flex items-center space-x-4">
                  {renderStarRating('overall_rating', formData.overall_rating)}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {formData.overall_rating}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Recommandation */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Recommanderiez-vous cette formation ? *
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, would_recommend: true }))}
                  className={`px-6 py-3 rounded-lg border transition-all ${
                    formData.would_recommend === true
                      ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/20 dark:border-green-500 dark:text-green-400'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  Oui, je recommande
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, would_recommend: false }))}
                  className={`px-6 py-3 rounded-lg border transition-all ${
                    formData.would_recommend === false
                      ? 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  Non, je ne recommande pas
                </button>
              </div>
            </div>

            {/* Commentaires */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Commentaires généraux
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={4}
                  placeholder="Partagez votre expérience, ce qui vous a le plus marqué..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Suggestions d'amélioration
                </label>
                <textarea
                  value={formData.improvements}
                  onChange={(e) => setFormData(prev => ({ ...prev, improvements: e.target.value }))}
                  rows={3}
                  placeholder="Comment pourrions-nous améliorer cette formation ?"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
                />
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                type="submit"
                disabled={loading || formData.overall_rating === 0 || formData.would_recommend === null}
                className="w-full"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer mon évaluation'}
              </Button>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-2">
                * Champs obligatoires
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SatisfactionFormPage