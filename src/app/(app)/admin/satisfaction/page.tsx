'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { useState, useEffect } from 'react'
import { 
  StarIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  AcademicCapIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface SatisfactionResponse {
  id: string
  user_id: string
  user_name: string
  user_email: string
  formation_id: string
  formation_title: string
  session_date: string
  session_location: string
  overall_rating: number
  content_rating: number
  instructor_rating: number
  organization_rating: number
  venue_rating: number
  would_recommend: boolean
  comments: string
  improvements: string
  submitted_at: string
}

const SatisfactionContent = () => {
  const [responses, setResponses] = useState<SatisfactionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'recent' | 'high' | 'low'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Simulation de données de satisfaction
    setTimeout(() => {
      setResponses([
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Dr. Marie Dubois',
          user_email: 'marie.dubois@email.com',
          formation_id: 'form1',
          formation_title: 'Formation ONM Niveau 1',
          session_date: '2024-01-15',
          session_location: 'Paris',
          overall_rating: 5,
          content_rating: 5,
          instructor_rating: 5,
          organization_rating: 4,
          venue_rating: 4,
          would_recommend: true,
          comments: 'Formation excellente ! Les concepts ONM sont très bien expliqués et les cas pratiques vraiment enrichissants.',
          improvements: 'Peut-être plus de temps pour les exercices pratiques.',
          submitted_at: '2024-01-20T10:30:00Z'
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Dr. Pierre Martin',
          user_email: 'pierre.martin@email.com',
          formation_id: 'form1',
          formation_title: 'Formation ONM Niveau 1',
          session_date: '2024-01-15',
          session_location: 'Paris',
          overall_rating: 4,
          content_rating: 4,
          instructor_rating: 5,
          organization_rating: 4,
          venue_rating: 3,
          would_recommend: true,
          comments: 'Très bonne formation, formateur compétent. Salle un peu petite.',
          improvements: 'Améliorer les équipements de la salle.',
          submitted_at: '2024-01-19T15:45:00Z'
        },
        {
          id: '3',
          user_id: 'user3',
          user_name: 'Dr. Sophie Laurent',
          user_email: 'sophie.laurent@email.com',
          formation_id: 'form2',
          formation_title: 'Formation ONM Niveau 2',
          session_date: '2024-02-10',
          session_location: 'Lyon',
          overall_rating: 5,
          content_rating: 5,
          instructor_rating: 5,
          organization_rating: 5,
          venue_rating: 5,
          would_recommend: true,
          comments: 'Formation parfaite ! J\'ai pu directement appliquer les techniques apprises dans mon cabinet.',
          improvements: 'RAS, tout était parfait.',
          submitted_at: '2024-02-15T09:20:00Z'
        },
        {
          id: '4',
          user_id: 'user4',
          user_name: 'Dr. Jean Dupont',
          user_email: 'jean.dupont@email.com',
          formation_id: 'form1',
          formation_title: 'Formation ONM Niveau 1',
          session_date: '2024-01-15',
          session_location: 'Paris',
          overall_rating: 3,
          content_rating: 3,
          instructor_rating: 4,
          organization_rating: 3,
          venue_rating: 2,
          would_recommend: false,
          comments: 'Formation intéressante mais j\'attendais plus de pratique. Les concepts théoriques étaient bien mais manque d\'application.',
          improvements: 'Plus d\'exercices pratiques et de cas cliniques concrets.',
          submitted_at: '2024-01-21T14:15:00Z'
        },
        {
          id: '5',
          user_id: 'user5',
          user_name: 'Dr. Christine Moreau',
          user_email: 'christine.moreau@email.com',
          formation_id: 'form3',
          formation_title: 'Webinaire ONM - Découverte',
          session_date: '2024-02-20',
          session_location: 'En ligne',
          overall_rating: 4,
          content_rating: 4,
          instructor_rating: 4,
          organization_rating: 5,
          venue_rating: 4,
          would_recommend: true,
          comments: 'Webinaire très bien organisé, plateforme fluide. Contenu adapté au niveau découverte.',
          improvements: 'Peut-être quelques questions live supplémentaires.',
          submitted_at: '2024-02-20T16:45:00Z'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredResponses = responses.filter(response => {
    const matchesSearch = response.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         response.formation_title.toLowerCase().includes(searchTerm.toLowerCase())
    
    switch (filter) {
      case 'recent':
        return matchesSearch && new Date(response.submitted_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      case 'high':
        return matchesSearch && response.overall_rating >= 4
      case 'low':
        return matchesSearch && response.overall_rating <= 3
      default:
        return matchesSearch
    }
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < rating ? (
        <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="h-4 w-4 text-gray-300" />
      )
    ))
  }

  const getAverageRating = () => {
    if (responses.length === 0) return 0
    return responses.reduce((sum, r) => sum + r.overall_rating, 0) / responses.length
  }

  const getRecommendationRate = () => {
    if (responses.length === 0) return 0
    return (responses.filter(r => r.would_recommend).length / responses.length) * 100
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-100'
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <AdminLayout currentPage="satisfaction">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Retours de satisfaction</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Consultez les évaluations de satisfaction des participants aux formations
            </p>
          </div>
          <div className="flex space-x-3">
            <a
              href="/satisfaction-form"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Voir le formulaire
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Note moyenne
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {getAverageRating().toFixed(1)}/5
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                <FaceSmileIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Taux de recommandation
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {getRecommendationRate().toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                <UserIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Total réponses
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {responses.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/20">
                <StarIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Notes 5/5
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {responses.filter(r => r.overall_rating === 5).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-neutral-800">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou formation..."
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                Tous ({responses.length})
              </button>
              <button
                onClick={() => setFilter('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'recent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                Récents
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'high'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                Notes hautes (4-5)
              </button>
              <button
                onClick={() => setFilter('low')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'low'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                À améliorer (1-3)
              </button>
            </div>
          </div>
        </div>

        {/* Liste des retours */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-1/4 mb-4 dark:bg-neutral-700"></div>
                <div className="h-3 bg-neutral-200 rounded w-full mb-2 dark:bg-neutral-700"></div>
                <div className="h-3 bg-neutral-200 rounded w-3/4 dark:bg-neutral-700"></div>
              </div>
            ))
          ) : (
            filteredResponses.map((response) => (
              <div key={response.id} className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {response.user_name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(response.overall_rating)}`}>
                        {response.overall_rating}/5
                      </span>
                      {response.would_recommend && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Recommande
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center">
                        <AcademicCapIcon className="w-4 h-4 mr-1" />
                        {response.formation_title}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {new Date(response.session_date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {response.session_location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {renderStars(response.overall_rating)}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(response.submitted_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {/* Détails des notes */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Contenu</p>
                    <div className="flex justify-center">
                      {renderStars(response.content_rating)}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Formateur</p>
                    <div className="flex justify-center">
                      {renderStars(response.instructor_rating)}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Organisation</p>
                    <div className="flex justify-center">
                      {renderStars(response.organization_rating)}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Lieu</p>
                    <div className="flex justify-center">
                      {renderStars(response.venue_rating)}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Global</p>
                    <div className="flex justify-center">
                      {renderStars(response.overall_rating)}
                    </div>
                  </div>
                </div>

                {/* Commentaires */}
                <div className="space-y-3">
                  {response.comments && (
                    <div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Commentaires :
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-700 p-3 rounded-lg">
                        "{response.comments}"
                      </p>
                    </div>
                  )}
                  {response.improvements && (
                    <div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Suggestions d'amélioration :
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                        {response.improvements}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {filteredResponses.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center dark:bg-neutral-800">
            <FaceFrownIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              Aucun retour de satisfaction trouvé pour les critères sélectionnés
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function AdminSatisfactionPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <SatisfactionContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}