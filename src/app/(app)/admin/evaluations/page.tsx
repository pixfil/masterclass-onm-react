'use client'

import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Heading } from '@/shared/Heading'
import { useState, useEffect } from 'react'
import { 
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  CalendarIcon,
  EyeIcon,
  TrophyIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface QuizQuestion {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'text'
  options?: string[]
  correct_answer: string | number
  points: number
}

interface EvaluationResponse {
  id: string
  user_id: string
  user_name: string
  user_email: string
  formation_id: string
  formation_title: string
  session_date: string
  quiz_questions: QuizQuestion[]
  user_answers: Record<string, any>
  score: number
  max_score: number
  percentage: number
  passed: boolean
  time_taken: number // en minutes
  attempts: number
  submitted_at: string
  certificate_eligible: boolean
}

const EvaluationsContent = () => {
  const [evaluations, setEvaluations] = useState<EvaluationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed' | 'recent'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedEvaluations, setExpandedEvaluations] = useState<string[]>([])

  useEffect(() => {
    // Simulation de données d'évaluation
    setTimeout(() => {
      setEvaluations([
        {
          id: '1',
          user_id: 'user1',
          user_name: 'Dr. Marie Dubois',
          user_email: 'marie.dubois@email.com',
          formation_id: 'form1',
          formation_title: 'Formation ONM Niveau 1',
          session_date: '2024-01-15',
          quiz_questions: [
            {
              id: 'q1',
              question: 'Quel est le principe fondamental de l\'orthodontie neuro-musculaire ?',
              type: 'multiple_choice',
              options: [
                'Aligner uniquement les dents',
                'Équilibrer l\'occlusion et la fonction musculaire',
                'Réduire le temps de traitement',
                'Utiliser uniquement des appareils fixes'
              ],
              correct_answer: 1,
              points: 20
            },
            {
              id: 'q2',
              question: 'L\'ONM permet d\'améliorer la fonction respiratoire du patient.',
              type: 'true_false',
              correct_answer: 'true',
              points: 15
            },
            {
              id: 'q3',
              question: 'L\'analyse électromyographique est-elle importante en ONM ?',
              type: 'true_false',
              correct_answer: 'true',
              points: 15
            },
            {
              id: 'q4',
              question: 'Citez deux avantages de l\'approche ONM par rapport à l\'orthodontie traditionnelle.',
              type: 'text',
              correct_answer: 'Meilleure stabilité, amélioration de la fonction',
              points: 25
            },
            {
              id: 'q5',
              question: 'Quelle est la durée moyenne d\'un traitement ONM ?',
              type: 'multiple_choice',
              options: ['6 mois', '12-18 mois', '2-3 ans', '4-5 ans'],
              correct_answer: 1,
              points: 25
            }
          ],
          user_answers: {
            'q1': 1,
            'q2': 'true',
            'q3': 'true',
            'q4': 'Stabilité des résultats et amélioration de la fonction respiratoire',
            'q5': 1
          },
          score: 95,
          max_score: 100,
          percentage: 95,
          passed: true,
          time_taken: 25,
          attempts: 1,
          submitted_at: '2024-01-22T14:30:00Z',
          certificate_eligible: true
        },
        {
          id: '2',
          user_id: 'user2',
          user_name: 'Dr. Pierre Martin',
          user_email: 'pierre.martin@email.com',
          formation_id: 'form1',
          formation_title: 'Formation ONM Niveau 1',
          session_date: '2024-01-15',
          quiz_questions: [
            {
              id: 'q1',
              question: 'Quel est le principe fondamental de l\'orthodontie neuro-musculaire ?',
              type: 'multiple_choice',
              options: [
                'Aligner uniquement les dents',
                'Équilibrer l\'occlusion et la fonction musculaire',
                'Réduire le temps de traitement',
                'Utiliser uniquement des appareils fixes'
              ],
              correct_answer: 1,
              points: 20
            },
            {
              id: 'q2',
              question: 'L\'ONM permet d\'améliorer la fonction respiratoire du patient.',
              type: 'true_false',
              correct_answer: 'true',
              points: 15
            },
            {
              id: 'q3',
              question: 'L\'analyse électromyographique est-elle importante en ONM ?',
              type: 'true_false',
              correct_answer: 'true',
              points: 15
            },
            {
              id: 'q4',
              question: 'Citez deux avantages de l\'approche ONM par rapport à l\'orthodontie traditionnelle.',
              type: 'text',
              correct_answer: 'Meilleure stabilité, amélioration de la fonction',
              points: 25
            },
            {
              id: 'q5',
              question: 'Quelle est la durée moyenne d\'un traitement ONM ?',
              type: 'multiple_choice',
              options: ['6 mois', '12-18 mois', '2-3 ans', '4-5 ans'],
              correct_answer: 1,
              points: 25
            }
          ],
          user_answers: {
            'q1': 0,
            'q2': 'true',
            'q3': 'false',
            'q4': 'Plus rapide',
            'q5': 2
          },
          score: 40,
          max_score: 100,
          percentage: 40,
          passed: false,
          time_taken: 18,
          attempts: 1,
          submitted_at: '2024-01-21T16:45:00Z',
          certificate_eligible: false
        },
        {
          id: '3',
          user_id: 'user3',
          user_name: 'Dr. Sophie Laurent',
          user_email: 'sophie.laurent@email.com',
          formation_id: 'form2',
          formation_title: 'Formation ONM Niveau 2',
          session_date: '2024-02-10',
          quiz_questions: [
            {
              id: 'q1',
              question: 'Comment adapter les protocoles ONM pour les patients pédiatriques ?',
              type: 'text',
              correct_answer: 'Approche douce et progressive',
              points: 30
            },
            {
              id: 'q2',
              question: 'Les appareils fonctionnels sont-ils compatibles avec l\'ONM ?',
              type: 'true_false',
              correct_answer: 'true',
              points: 20
            },
            {
              id: 'q3',
              question: 'Quel paramètre est crucial dans l\'analyse ONM avancée ?',
              type: 'multiple_choice',
              options: [
                'La couleur des dents',
                'L\'activité musculaire au repos',
                'La vitesse d\'éruption',
                'Le nombre de dents'
              ],
              correct_answer: 1,
              points: 25
            },
            {
              id: 'q4',
              question: 'Comment évaluer l\'efficacité d\'un traitement ONM ?',
              type: 'text',
              correct_answer: 'Analyses fonctionnelles et suivi EMG',
              points: 25
            }
          ],
          user_answers: {
            'q1': 'Protocoles adaptés à l\'âge avec surveillance constante de la croissance',
            'q2': 'true',
            'q3': 1,
            'q4': 'Suivi EMG, tests fonctionnels et analyses occlusales régulières'
          },
          score: 88,
          max_score: 100,
          percentage: 88,
          passed: true,
          time_taken: 32,
          attempts: 1,
          submitted_at: '2024-02-17T11:20:00Z',
          certificate_eligible: true
        },
        {
          id: '4',
          user_id: 'user4',
          user_name: 'Dr. Jean Dupont',
          user_email: 'jean.dupont@email.com',
          formation_id: 'form1',
          formation_title: 'Formation ONM Niveau 1',
          session_date: '2024-01-15',
          quiz_questions: [
            {
              id: 'q1',
              question: 'Quel est le principe fondamental de l\'orthodontie neuro-musculaire ?',
              type: 'multiple_choice',
              options: [
                'Aligner uniquement les dents',
                'Équilibrer l\'occlusion et la fonction musculaire',
                'Réduire le temps de traitement',
                'Utiliser uniquement des appareils fixes'
              ],
              correct_answer: 1,
              points: 20
            },
            {
              id: 'q2',
              question: 'L\'ONM permet d\'améliorer la fonction respiratoire du patient.',
              type: 'true_false',
              correct_answer: 'true',
              points: 15
            },
            {
              id: 'q3',
              question: 'L\'analyse électromyographique est-elle importante en ONM ?',
              type: 'true_false',
              correct_answer: 'true',
              points: 15
            },
            {
              id: 'q4',
              question: 'Citez deux avantages de l\'approche ONM par rapport à l\'orthodontie traditionnelle.',
              type: 'text',
              correct_answer: 'Meilleure stabilité, amélioration de la fonction',
              points: 25
            },
            {
              id: 'q5',
              question: 'Quelle est la durée moyenne d\'un traitement ONM ?',
              type: 'multiple_choice',
              options: ['6 mois', '12-18 mois', '2-3 ans', '4-5 ans'],
              correct_answer: 1,
              points: 25
            }
          ],
          user_answers: {
            'q1': 1,
            'q2': 'true',
            'q3': 'true',
            'q4': 'Meilleur contrôle de l\'occlusion et résultats plus stables',
            'q5': 0
          },
          score: 75,
          max_score: 100,
          percentage: 75,
          passed: true,
          time_taken: 28,
          attempts: 2,
          submitted_at: '2024-01-23T09:15:00Z',
          certificate_eligible: true
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.formation_title.toLowerCase().includes(searchTerm.toLowerCase())
    
    switch (filter) {
      case 'passed':
        return matchesSearch && evaluation.passed
      case 'failed':
        return matchesSearch && !evaluation.passed
      case 'recent':
        return matchesSearch && new Date(evaluation.submitted_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      default:
        return matchesSearch
    }
  })

  const getAverageScore = () => {
    if (evaluations.length === 0) return 0
    return evaluations.reduce((sum, e) => sum + e.percentage, 0) / evaluations.length
  }

  const getPassRate = () => {
    if (evaluations.length === 0) return 0
    return (evaluations.filter(e => e.passed).length / evaluations.length) * 100
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'QCM'
      case 'true_false': return 'V/F'
      case 'text': return 'Texte'
      default: return type
    }
  }

  return (
    <AdminLayout currentPage="evaluations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading as="h2">Évaluations post-formation</Heading>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Consultez les résultats des quiz d'évaluation des participants
            </p>
          </div>
          <div className="flex space-x-3">
            <a
              href="/evaluation-form"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              Voir le quiz
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
                  Score moyen
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {getAverageScore().toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Taux de réussite
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {getPassRate().toFixed(0)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Total évaluations
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {evaluations.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-neutral-800">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/20">
                <TrophyIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Certificats éligibles
                </p>
                <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
                  {evaluations.filter(e => e.certificate_eligible).length}
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
                Tous ({evaluations.length})
              </button>
              <button
                onClick={() => setFilter('passed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'passed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                Réussis
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'failed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
                }`}
              >
                À reprendre
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
            </div>
          </div>
        </div>

        {/* Liste des évaluations */}
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
            filteredEvaluations.map((evaluation) => {
              const isExpanded = expandedEvaluations.includes(evaluation.id)
              
              return (
                <div key={evaluation.id} className="bg-white rounded-xl shadow-sm dark:bg-neutral-800 hover:shadow-md transition-shadow">
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => {
                      setExpandedEvaluations(prev => 
                        isExpanded 
                          ? prev.filter(id => id !== evaluation.id)
                          : [...prev, evaluation.id]
                      )
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-neutral-900 dark:text-white">
                            {evaluation.user_name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(evaluation.percentage)}`}>
                            {evaluation.percentage}%
                          </span>
                          {evaluation.passed ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Réussi
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              <XCircleIcon className="w-3 h-3 mr-1" />
                              Échec
                            </span>
                          )}
                          {evaluation.certificate_eligible && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                              <TrophyIcon className="w-3 h-3 mr-1" />
                              Certificat
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                          <div className="flex items-center">
                            <AcademicCapIcon className="w-4 h-4 mr-1" />
                            {evaluation.formation_title}
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            {new Date(evaluation.session_date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {evaluation.time_taken} min
                          </div>
                          {evaluation.attempts > 1 && (
                            <span className="text-orange-600">
                              Tentative #{evaluation.attempts}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-neutral-900 dark:text-white mb-1">
                            {evaluation.score}/{evaluation.max_score}
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {new Date(evaluation.submitted_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-700">
                          {isExpanded ? (
                            <ChevronUpIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Détail des questions - Accordéon */}
                  {isExpanded && (
                    <div className="border-t border-neutral-200 dark:border-neutral-700 px-6 pb-6 pt-4">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                        Détail des réponses ({evaluation.quiz_questions.length} questions) :
                      </p>
                      <div className="space-y-2">
                        {evaluation.quiz_questions.map((question, index) => {
                          const userAnswer = evaluation.user_answers[question.id]
                          let isCorrect = false
                          
                          if (question.type === 'multiple_choice') {
                            isCorrect = userAnswer === question.correct_answer
                          } else if (question.type === 'true_false') {
                            isCorrect = userAnswer === question.correct_answer
                          } else if (question.type === 'text') {
                            // Simulation d'évaluation de texte
                            isCorrect = typeof userAnswer === 'string' && userAnswer.length > 10
                          }

                          return (
                            <div key={question.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-medium bg-neutral-200 dark:bg-neutral-600 px-2 py-1 rounded">
                                    {getQuestionTypeLabel(question.type)}
                                  </span>
                                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {question.points} pts
                                  </span>
                                </div>
                                <p className="text-sm text-neutral-900 dark:text-white">
                                  {question.question}
                                </p>
                                {/* Afficher la réponse de l'utilisateur si c'est une question texte */}
                                {question.type === 'text' && (
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 italic">
                                    Réponse : "{userAnswer}"
                                  </p>
                                )}
                                {/* Afficher la bonne réponse si c'est incorrect */}
                                {!isCorrect && question.type === 'multiple_choice' && (
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    Bonne réponse : {question.options?.[question.correct_answer]}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {isCorrect ? (
                                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircleIcon className="w-5 h-5 text-red-500" />
                                )}
                                <span className="text-sm font-medium">
                                  {isCorrect ? question.points : 0}/{question.points}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Résumé des compétences */}
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                          Compétences évaluées :
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                            Compréhension théorique
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                            Application pratique
                          </span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                            Analyse clinique
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {filteredEvaluations.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center dark:bg-neutral-800">
            <AcademicCapIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">
              Aucune évaluation trouvée pour les critères sélectionnés
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default function AdminEvaluationsPage() {
  return (
    <AuthProvider>
      <ProtectedRoute requireAdmin>
        <EvaluationsContent />
      </ProtectedRoute>
    </AuthProvider>
  )
}